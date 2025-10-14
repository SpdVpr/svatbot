# 🔍 Perplexity AI Integration - Real-time Wedding Information

## 📋 Přehled

SvatBot nyní integruje **Perplexity AI** pro poskytování aktuálních informací z internetu v reálném čase. Tato integrace doplňuje GPT-4 o schopnost vyhledávat současné ceny, dodavatele, trendy a další živá data.

## 🎯 Proč Perplexity?

### GPT-4 vs Perplexity

| Funkce | GPT-4 | Perplexity |
|--------|-------|------------|
| **Personalizace** | ✅ Výborná | ⚠️ Omezená |
| **Aktuální data** | ❌ Omezená (training cutoff) | ✅ Real-time z internetu |
| **Zdroje** | ❌ Žádné citace | ✅ Odkazy na zdroje |
| **Ceny** | ❌ Zastaralé | ✅ Aktuální |
| **Dodavatelé** | ❌ Obecné | ✅ Konkrétní firmy |
| **Trendy** | ❌ Historické | ✅ Současné |

### Hybrid Approach 🚀

SvatBot používá **inteligentní routing**:
- **GPT-4** → Personální plánování, úkoly, analýza dat uživatele
- **Perplexity** → Aktuální ceny, dodavatelé, trendy, inspirace
- **Hybrid** → Kombinace obou (Perplexity data + GPT personalizace)

## 🏗️ Architektura

```
User Query
    ↓
Hybrid AI Router (analyzes query)
    ↓
    ├─→ GPT-4 (personal planning)
    ├─→ Perplexity (real-time search)
    └─→ Hybrid (both combined)
    ↓
Response with sources
```

## 📁 Struktura souborů

### Core Libraries

```
src/lib/
├── perplexity.ts          # Perplexity API client
├── hybrid-ai.ts           # Intelligent routing between GPT & Perplexity
└── ai-client.ts           # Enhanced with Perplexity methods
```

### API Endpoints

```
src/app/api/ai/
├── chat/route.ts          # Legacy GPT-only chat
├── hybrid-chat/route.ts   # New hybrid chat (GPT + Perplexity)
└── search/route.ts        # Perplexity search endpoint
```

### React Components

```
src/components/ai/
├── AISourcesList.tsx      # Display sources from Perplexity
└── AISearchPanel.tsx      # Quick search interface
```

### Hooks

```
src/hooks/
└── useAI.ts              # Enhanced with Perplexity methods
```

## 🔧 Použití

### 1. Hybrid Chat (Doporučeno)

Automaticky vybírá mezi GPT a Perplexity:

```typescript
import { useAI } from '@/hooks/useAI'

function MyComponent() {
  const { askHybrid, loading } = useAI()

  const handleQuestion = async () => {
    const result = await askHybrid('Kolik stojí fotograf v Praze?')
    
    console.log(result.content)      // Odpověď
    console.log(result.sources)      // Zdroje z internetu
    console.log(result.provider)     // 'gpt' | 'perplexity' | 'hybrid'
    console.log(result.reasoning)    // Proč byl použit daný provider
  }

  return (
    <button onClick={handleQuestion} disabled={loading}>
      Zeptat se AI
    </button>
  )
}
```

### 2. Direct Search

Přímé vyhledávání pomocí Perplexity:

```typescript
const { searchInfo, findVendors, getTrends, getPrices } = useAI()

// Obecné vyhledávání
const result = await searchInfo('Svatební trendy 2025')

// Najít dodavatele
const vendors = await findVendors('fotograf', 'Praha', 'boho')

// Získat trendy
const trends = await getTrends(2025)

// Zjistit ceny
const prices = await getPrices('catering', 'Brno', 80)
```

### 3. Display Sources

Zobrazení zdrojů z Perplexity:

```typescript
import AISourcesList from '@/components/ai/AISourcesList'

function ChatMessage({ message }) {
  return (
    <div>
      <p>{message.content}</p>
      
      <AISourcesList
        sources={message.sources}
        provider={message.provider}
        reasoning={message.reasoning}
      />
    </div>
  )
}
```

## 🎨 UI Komponenty

### AISearchPanel

Panel pro rychlé vyhledávání:

```typescript
import AISearchPanel from '@/components/ai/AISearchPanel'

<AISearchPanel />
```

Obsahuje předpřipravené vyhledávání:
- 🎨 Aktuální trendy 2025
- 📸 Najít fotografy
- 💰 Ceny cateringu
- 📍 Svatební místa
- 💡 Inspirace
- 📄 Právní požadavky

### AISourcesList

Zobrazení zdrojů s odkazy:

```typescript
<AISourcesList
  sources={[
    { title: 'Svatební fotograf Praha', url: 'https://...', snippet: '...' }
  ]}
  provider="perplexity"
  reasoning="Použita Perplexity pro aktuální informace"
/>
```

## 🔍 Perplexity API Client

### Základní metody

```typescript
import { getPerplexityClient } from '@/lib/perplexity'

const perplexity = getPerplexityClient()

// Obecné vyhledávání
const result = await perplexity.search(
  'Svatební trendy 2025',
  'Jsi svatební expert...'
)

// Najít dodavatele
const vendors = await perplexity.searchVendors(
  'fotograf',
  'Praha',
  'boho'
)

// Získat trendy
const trends = await perplexity.getWeddingTrends(2025)

// Zjistit ceny
const prices = await perplexity.getServicePrices(
  'catering',
  'Brno',
  80
)

// Najít místa konání
const venues = await perplexity.searchVenues(
  'Praha',
  100,
  'rustikální',
  500000
)

// Inspirace
const inspiration = await perplexity.getInspiration(
  'boho',
  'léto'
)

// Právní informace
const legal = await perplexity.getLegalInfo(
  'církevní obřad'
)

// Sezónní tipy
const tips = await perplexity.getSeasonalTips(
  'léto',
  'červen'
)

// Ubytování
const accommodation = await perplexity.searchAccommodation(
  'Praha',
  50,
  new Date('2025-06-15')
)
```

## 🤖 Hybrid AI Router

Inteligentní směrování dotazů:

```typescript
import { getHybridAI } from '@/lib/hybrid-ai'

const hybridAI = getHybridAI()

// Automatické směrování
const result = await hybridAI.ask(
  'Kolik stojí fotograf v Praze?',
  context,
  systemPrompt
)

// Specializované metody
const vendors = await hybridAI.findVendors('fotograf', 'Praha', context)
const trends = await hybridAI.getTrends(2025)
const prices = await hybridAI.getPrices('catering', 'Brno', context)
const inspiration = await hybridAI.getInspiration('boho', context)
```

### Jak funguje routing?

Router analyzuje dotaz a rozhoduje:

```typescript
// Klíčová slova pro real-time data
const realTimeKeywords = [
  'aktuální', 'současný', 'trendy', 'ceny', 'kolik stojí',
  'najdi', 'hledám', 'doporuč', 'kde', 'kontakt'
]

// Klíčová slova pro personální kontext
const personalKeywords = [
  'moje', 'můj', 'naše', 'náš', 'svatba',
  'hosté', 'rozpočet', 'úkoly'
]

// Rozhodnutí:
// - Pouze real-time → Perplexity
// - Pouze personal → GPT
// - Obojí → Hybrid (Perplexity + GPT)
```

## 📊 Příklady použití

### 1. Najít fotografa

```typescript
const result = await findVendors('fotograf', 'Praha', 'boho')

// Výsledek:
{
  response: "Našel jsem několik fotografů v Praze...",
  sources: [
    { title: "Fotograf XYZ", url: "https://...", snippet: "..." },
    { title: "Studio ABC", url: "https://...", snippet: "..." }
  ],
  provider: "perplexity"
}
```

### 2. Zjistit aktuální ceny

```typescript
const result = await getPrices('catering', 'Brno', 80)

// Výsledek:
{
  response: "Podle aktuálních údajů se ceny cateringu pro 80 lidí v Brně pohybují mezi 40 000 - 80 000 Kč...",
  sources: [
    { title: "Catering Brno", url: "https://...", snippet: "..." }
  ],
  provider: "perplexity"
}
```

### 3. Získat trendy

```typescript
const result = await getTrends(2025)

// Výsledek:
{
  response: "Aktuální svatební trendy v roce 2025 zahrnují: sušené květiny, transparentní stoly, rustikální zelené tóny...",
  sources: [
    { title: "Svatební trendy 2025", url: "https://...", snippet: "..." }
  ],
  provider: "perplexity"
}
```

### 4. Hybrid dotaz

```typescript
const result = await askHybrid('Kolik by měl stát fotograf pro moji svatbu?')

// Router detekuje:
// - "kolik" → real-time data
// - "moji svatbu" → personal context
// → Použije HYBRID

// Výsledek:
{
  content: "Podle vašeho rozpočtu 300 000 Kč a lokace Praha doporučuji...",
  sources: [...],
  provider: "hybrid",
  reasoning: "Kombinace Perplexity (aktuální ceny) a GPT-4 (personalizace)"
}
```

## 🔐 Konfigurace

### Environment Variables

```env
# .env.local
PERPLEXITY_API_KEY=pplx-...
OPENAI_API_KEY=sk-...
```

### Perplexity Model

Používáme: `llama-3.1-sonar-large-128k-online`

Výhody:
- ✅ Real-time přístup k internetu
- ✅ 128k context window
- ✅ Citace zdrojů
- ✅ Filtrování podle domény (.cz)
- ✅ Filtrování podle aktuality (měsíc)

## 💰 Náklady

### Perplexity Pricing

- **Model**: llama-3.1-sonar-large-128k-online
- **Cena**: ~$1 per 1M tokens
- **Odhad**: ~100-200 dotazů za $1

### Optimalizace

1. **Cache výsledky** - stejné dotazy neposílat znovu
2. **Batch queries** - kombinovat podobné dotazy
3. **Fallback na GPT** - když Perplexity není dostupná

## 🚀 Deployment

### Vercel

Perplexity API funguje na Vercel bez problémů:

```bash
# Přidat environment variable
vercel env add PERPLEXITY_API_KEY
```

### Edge Functions

Perplexity API je kompatibilní s Edge Runtime:

```typescript
export const runtime = 'edge'
```

## 📈 Monitoring

### Logování

```typescript
console.log('🤖 Hybrid AI Analysis:', {
  query: query.substring(0, 50) + '...',
  analysis: {
    needsRealTimeData: true,
    needsPersonalContext: false,
    queryType: 'search',
    confidence: 0.9
  }
})
```

### Error Handling

```typescript
try {
  const result = await perplexity.search(query)
} catch (error) {
  console.error('Perplexity error:', error)
  // Fallback to GPT
  const fallback = await openai.chat.completions.create(...)
}
```

## 🎯 Best Practices

### 1. Použij správný provider

```typescript
// ✅ Dobře - real-time data
await findVendors('fotograf', 'Praha')

// ❌ Špatně - personal data
await findVendors('fotograf') // Chybí kontext uživatele
```

### 2. Zobraz zdroje

```typescript
// ✅ Dobře - uživatel vidí zdroje
<AISourcesList sources={result.sources} />

// ❌ Špatně - žádné zdroje
<p>{result.response}</p>
```

### 3. Handle errors

```typescript
// ✅ Dobře - fallback
try {
  const result = await askHybrid(question)
} catch (error) {
  const fallback = await askAssistant(question) // GPT only
}
```

## 📚 Další zdroje

- [Perplexity API Docs](https://docs.perplexity.ai)
- [Hybrid AI Architecture](./HYBRID_AI_ARCHITECTURE.md)
- [AI Features Overview](./AI_FEATURES_IMPLEMENTATION.md)

---

**SvatBot AI v2.0** - Powered by GPT-4 + Perplexity 🤖🔍

