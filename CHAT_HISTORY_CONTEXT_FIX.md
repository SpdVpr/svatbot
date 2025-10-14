# 💬 Chat History Context Fix - Přidání kontextu konverzace

## ❌ Problém

AI asistent **neměl kontext z předchozích zpráv** v chatu:

```
Uživatel: "Jaké jsou trendy pro zimní svatbu?"
AI: "Zimní svatby jsou populární... [odpověď]"

Uživatel: "A co dekorace?" ← AI neví, o čem mluvíme!
AI: "Jaké dekorace myslíte?" ← Ztratil kontext!
```

**Důvod:**
- ❌ API route dostávala jen `question` a `context`
- ❌ Historie chatu (`chatHistory`) se **nikdy neposílala** do API
- ❌ GPT/Perplexity neviděly předchozí zprávy
- ❌ Každá otázka byla izolovaná, bez kontextu konverzace

## ✅ Řešení

### 1. Přidání chatHistory do API volání

#### `src/lib/ai-client.ts` (řádky 150-167)
```typescript
// ❌ PŘED:
static async askHybrid(
  question: string,
  context?: AIWeddingContext
): Promise<AIResponse> {
  const response = await fetch('/api/ai/hybrid-chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question,
      context  // Bez historie!
    })
  })
}

// ✅ PO:
static async askHybrid(
  question: string,
  context?: AIWeddingContext,
  chatHistory?: Array<{ role: string; content: string }>  // ✅ NOVÉ
): Promise<AIResponse> {
  const response = await fetch('/api/ai/hybrid-chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question,
      context,
      chatHistory  // ✅ Posíláme historii
    })
  })
}
```

### 2. Předání historie z useAI hook

#### `src/hooks/useAI.ts` (řádky 195-219)
```typescript
// ❌ PŘED:
const askHybrid = useCallback(async (question: string): Promise<ChatMessage> => {
  setLoading(true)
  setError(null)

  try {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: question,
      timestamp: new Date()
    }
    setChatHistory(prev => [...prev, userMessage])

    const context = buildContext()
    const result = await WeddingAI.askHybrid(question, context)  // Bez historie!
    // ...
  }
}, [message, loading, askHybrid, clearError])

// ✅ PO:
const askHybrid = useCallback(async (question: string): Promise<ChatMessage> => {
  setLoading(true)
  setError(null)

  try {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: question,
      timestamp: new Date()
    }
    
    // ✅ NOVÉ: Získáme aktuální historii před přidáním nové zprávy
    const currentHistory = chatHistory.map(msg => ({
      role: msg.role,
      content: msg.content
    }))
    
    setChatHistory(prev => [...prev, userMessage])

    const context = buildContext()
    // ✅ NOVÉ: Posíláme historii
    const result = await WeddingAI.askHybrid(question, context, currentHistory)
    // ...
  }
}, [message, loading, askHybrid, clearError, chatHistory])  // ✅ Přidán chatHistory dependency
```

### 3. Přijetí historie v API route

#### `src/app/api/ai/hybrid-chat/route.ts` (řádky 147-169)
```typescript
// ❌ PŘED:
export async function POST(request: NextRequest) {
  try {
    const { question, context } = await request.json()  // Bez chatHistory!

    if (!question) {
      return NextResponse.json(
        { error: 'Otázka je povinná' },
        { status: 400 }
      )
    }

    const contextInfo = buildDetailedContext(context)
    const hybridAI = getHybridAI()
    
    const result: HybridAIResponse = await hybridAI.ask(
      question,
      context ? { ...context, contextInfo } : undefined,  // Bez historie!
      SVATBOT_SYSTEM_PROMPT
    )
    // ...
  }
}

// ✅ PO:
export async function POST(request: NextRequest) {
  try {
    const { question, context, chatHistory } = await request.json()  // ✅ Přijímáme historii

    if (!question) {
      return NextResponse.json(
        { error: 'Otázka je povinná' },
        { status: 400 }
      )
    }

    const contextInfo = buildDetailedContext(context)
    const hybridAI = getHybridAI()
    
    // ✅ NOVÉ: Předáváme historii v kontextu
    const result: HybridAIResponse = await hybridAI.ask(
      question,
      context ? { ...context, contextInfo, chatHistory } : { chatHistory },
      SVATBOT_SYSTEM_PROMPT
    )
    // ...
  }
}
```

### 4. Použití historie v GPT volání

#### `src/lib/hybrid-ai.ts` - useGPT metoda (řádky 168-194)
```typescript
// ❌ PŘED:
messages.push({
  role: 'system',
  content: enhancedPrompt
})

let userContent = query
if (context) {
  userContent = `Kontext:\n${JSON.stringify(context, null, 2)}\n\nOtázka: ${query}`
}

messages.push({
  role: 'user',
  content: userContent
})

// ✅ PO:
messages.push({
  role: 'system',
  content: enhancedPrompt
})

// ✅ NOVÉ: Přidáme historii chatu pro kontext
if (context?.chatHistory && Array.isArray(context.chatHistory)) {
  context.chatHistory.forEach((msg: any) => {
    messages.push({
      role: msg.role as 'user' | 'assistant',
      content: msg.content
    })
  })
}

// Přidáme kontext a aktuální otázku
let userContent = query
if (context) {
  const contextWithoutHistory = { ...context }
  delete contextWithoutHistory.chatHistory  // Odstraníme historii (už je v messages)
  userContent = `Kontext:\n${JSON.stringify(contextWithoutHistory, null, 2)}\n\nOtázka: ${query}`
}

messages.push({
  role: 'user',
  content: userContent
})
```

### 5. Použití historie v Hybrid metoda

#### `src/lib/hybrid-ai.ts` - useHybrid metoda (řádky 293-330)
```typescript
// ❌ PŘED:
const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
  {
    role: 'system',
    content: synthesisPrompt
  },
  {
    role: 'user',
    content: `
Uživatel se ptá: ${query}
Aktuální informace z internetu: ${perplexityResult.answer}
Kontext uživatele: ${JSON.stringify(context, null, 2)}
    `.trim()
  }
]

// ✅ PO:
const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
  {
    role: 'system',
    content: synthesisPrompt
  }
]

// ✅ NOVÉ: Přidáme historii chatu
if (context?.chatHistory && Array.isArray(context.chatHistory)) {
  context.chatHistory.forEach((msg: any) => {
    messages.push({
      role: msg.role as 'user' | 'assistant',
      content: msg.content
    })
  })
}

// Přidáme aktuální dotaz s Perplexity výsledky
const contextWithoutHistory = { ...context }
delete contextWithoutHistory.chatHistory

messages.push({
  role: 'user',
  content: `
Uživatel se ptá: ${query}
Aktuální informace z internetu: ${perplexityResult.answer}
Kontext uživatele: ${JSON.stringify(contextWithoutHistory, null, 2)}
  `.trim()
})
```

## 📊 Výsledek

### Před opravou:
```
Uživatel: "Jaké jsou trendy pro zimní svatbu?"
AI: "Zimní svatby jsou populární... [odpověď]"

Uživatel: "A co dekorace?"
AI: "Jaké dekorace myslíte?" ← ❌ Ztratil kontext!

Uživatel: "Pro zimní svatbu!"
AI: "Aha, pro zimní svatbu..." ← ❌ Musí opakovat kontext!
```

### Po opravě:
```
Uživatel: "Jaké jsou trendy pro zimní svatbu?"
AI: "Zimní svatby jsou populární... [odpověď]"

Uživatel: "A co dekorace?"
AI: "Pro zimní svatbu jsou populární tyto dekorace..." ← ✅ Má kontext!

Uživatel: "Kolik to stojí?"
AI: "Dekorace pro zimní svatbu stojí..." ← ✅ Stále má kontext!
```

## 🧪 Testing

### Test 1: Kontext konverzace
```bash
# 1. Otevři http://localhost:3000/ai

# 2. První dotaz:
"Jaké jsou trendy pro zimní svatbu?"

# 3. Druhý dotaz (bez opakování kontextu):
"A co dekorace?"

# 4. Třetí dotaz:
"Kolik to stojí?"

# 5. Ověř:
✅ AI rozumí, že mluvíme o zimní svatbě
✅ AI rozumí, že mluvíme o dekoracích
✅ AI poskytuje relevantní odpovědi bez opakování kontextu
```

### Test 2: Sledování v konzoli
```bash
# Otevři Developer Console (F12)

# Zkontroluj Network tab:
✅ POST /api/ai/hybrid-chat obsahuje:
  {
    "question": "A co dekorace?",
    "context": { ... },
    "chatHistory": [  ← ✅ Historie je přítomna!
      { "role": "user", "content": "Jaké jsou trendy pro zimní svatbu?" },
      { "role": "assistant", "content": "Zimní svatby jsou..." }
    ]
  }
```

## 📝 Změněné soubory

1. ✅ `src/lib/ai-client.ts` - Přidán `chatHistory` parametr
2. ✅ `src/hooks/useAI.ts` - Předávání historie do API
3. ✅ `src/app/api/ai/hybrid-chat/route.ts` - Přijetí historie
4. ✅ `src/lib/hybrid-ai.ts` - Použití historie v GPT volání (2 metody)

## 🎯 Výhody

### 1. Přirozená konverzace
- ✅ Uživatel nemusí opakovat kontext
- ✅ AI rozumí návazným otázkám
- ✅ Plynulý dialog jako s člověkem

### 2. Lepší odpovědi
- ✅ AI má více kontextu pro odpověď
- ✅ Může odkazovat na předchozí zprávy
- ✅ Personalizovanější odpovědi

### 3. Lepší UX
- ✅ Rychlejší komunikace (méně psaní)
- ✅ Přirozenější interakce
- ✅ Méně frustrující pro uživatele

## 🚀 Další vylepšení (budoucnost)

### 1. Limit historie
```typescript
// Omezit historii na posledních N zpráv (pro rychlost)
const recentHistory = chatHistory.slice(-10)  // Posledních 10 zpráv
```

### 2. Summarizace staré historie
```typescript
// Pro dlouhé konverzace - summarizovat starou historii
if (chatHistory.length > 20) {
  const summary = await summarizeHistory(chatHistory.slice(0, -10))
  // Použít summary místo celé historie
}
```

### 3. Kontext-aware routing
```typescript
// Použít historii pro lepší routing
const analysis = this.analyzeQuery(query, context, chatHistory)
```

## ✅ Shrnutí

### Co jsme opravili:
1. ✅ Přidán `chatHistory` parametr do `WeddingAI.askHybrid()`
2. ✅ Historie se předává z `useAI` hook do API
3. ✅ API route přijímá a předává historii
4. ✅ GPT volání používají historii pro kontext
5. ✅ Hybrid metoda používá historii pro syntézu

### Výsledek:
**AI asistent nyní má plný kontext konverzace a rozumí návazným otázkám!** 🎉

**Zkus to teď - konverzace bude mnohem přirozenější!** 💬

