# 🔄 Hybrid AI Upgrade - AIAssistant Component

## 📋 Co bylo změněno

### Problém
Původní `AIAssistant` komponenta používala pouze **GPT-4** (metoda `askAssistant`), což znamenalo:
- ❌ Žádné aktuální informace z internetu
- ❌ Žádné zdroje a odkazy
- ❌ Odpovědi založené pouze na trénovacích datech GPT
- ❌ Nemožnost najít aktuální ceny, dodavatele, trendy

### Řešení
Upgradovali jsme `AIAssistant` komponentu na **Hybrid AI**:
- ✅ Používá `askHybrid` metodu místo `askAssistant`
- ✅ Inteligentní routing mezi GPT a Perplexity
- ✅ Zobrazuje zdroje a odkazy
- ✅ Provider badges (GPT / Perplexity / Hybrid)
- ✅ Aktuální informace z internetu

## 🔧 Technické změny

### 1. AIAssistant.tsx

#### Import AISourcesList
```typescript
import AISourcesList, { AIProviderBadge } from './AISourcesList'
```

#### Přidání askHybrid do useAI hook
```typescript
const {
  loading,
  error,
  chatHistory,
  askAssistant,
  askHybrid,  // ← NOVÉ
  getQuickSuggestions,
  clearError,
  clearChat
} = useAI()
```

#### Změna handleSendMessage
```typescript
// PŘED:
await askAssistant(textToSend)

// PO:
await askHybrid(textToSend)  // ← Používá hybrid AI
```

#### Zobrazení zdrojů v chat history
```typescript
{chatHistory.map((msg) => (
  <div key={msg.id}>
    <div className="message-bubble">
      <p>{msg.content}</p>
      
      {/* Provider badge */}
      {msg.role === 'assistant' && msg.provider && (
        <AIProviderBadge provider={msg.provider} size="sm" />
      )}
    </div>
    
    {/* Sources */}
    {msg.role === 'assistant' && msg.sources && msg.sources.length > 0 && (
      <AISourcesList sources={msg.sources} compact={true} />
    )}
  </div>
))}
```

### 2. AISourcesList.tsx

#### Přidání compact prop
```typescript
interface AISourcesListProps {
  sources?: AISource[]
  provider?: 'gpt' | 'perplexity' | 'hybrid'
  reasoning?: string
  className?: string
  compact?: boolean  // ← NOVÉ
}
```

#### Compact mode logic
```typescript
export default function AISourcesList({ sources, compact = false, ... }) {
  // Use compact version if requested
  if (compact) {
    return <AISourcesCompact sources={sources} className={className} />
  }
  
  // ... full version
}
```

#### Přesunutí AISourcesCompact na začátek
```typescript
// Přesunuto na začátek souboru, aby bylo dostupné v hlavní komponentě
export function AISourcesCompact({ sources, className }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-gray-500">Zdroje:</span>
      {sources.map((source, index) => (
        <a href={source.url} target="_blank" rel="noopener noreferrer">
          <span>{source.title}</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      ))}
    </div>
  )
}
```

## 🎯 Jak to funguje

### Query Analysis

Když uživatel položí otázku, `HybridAI` router analyzuje dotaz:

```typescript
// Real-time keywords
const realTimeKeywords = [
  'aktuální', 'současný', 'trendy', 'ceny', 'kolik stojí',
  'najdi', 'hledám', 'doporuč', 'kde', 'kontakt'
]

// Personal keywords
const personalKeywords = [
  'moje', 'můj', 'naše', 'náš', 'svatba',
  'hosté', 'rozpočet', 'úkoly', 'timeline'
]

// Search keywords
const searchKeywords = [
  'fotograf', 'catering', 'místo', 'lokace', 'hotel',
  'květiny', 'hudba', 'dj', 'kapela', 'šaty'
]
```

### Routing Decision

```typescript
if (needsRealTimeData && needsExternalSources && !needsPersonalContext) {
  // → Perplexity (pure search)
  queryType = 'search'
  
} else if (needsPersonalContext && !needsRealTimeData) {
  // → GPT (personal data)
  queryType = 'personal'
  
} else if (needsRealTimeData || needsExternalSources) {
  // → Hybrid (both)
  queryType = 'hybrid'
}
```

## 📊 Příklady

### Příklad 1: Real-time dotaz (Perplexity)

**Input**:
```
"Kolik stojí fotograf v Praze?"
```

**Analysis**:
- ✅ "kolik stojí" → real-time keyword
- ✅ "fotograf" → search keyword
- ❌ Žádné personal keywords

**Result**: → **Perplexity**

**Output**:
```
Odpověď: "Podle aktuálních údajů se ceny svatebních fotografů 
v Praze pohybují mezi 15 000 - 50 000 Kč..."

Provider: perplexity
Badge: "Aktuální informace z internetu"

Zdroje:
[1] Svatební fotograf Praha - https://...
[2] Ceny fotografů 2025 - https://...
```

### Příklad 2: Personal dotaz (GPT)

**Input**:
```
"Kolik mi zbývá z rozpočtu?"
```

**Analysis**:
- ✅ "mi" → personal keyword
- ✅ "rozpočet" → personal keyword
- ❌ Žádné real-time keywords

**Result**: → **GPT**

**Output**:
```
Odpověď: "Z vašeho celkového rozpočtu 300 000 Kč jste 
zatím utratili 120 000 Kč. Zbývá vám tedy 180 000 Kč..."

Provider: gpt
Badge: "AI"

Zdroje: (žádné - personal data)
```

### Příklad 3: Hybrid dotaz (Both)

**Input**:
```
"Najdi mi ubytování pro hosty na svatbu v okolí naší svatby"
```

**Analysis**:
- ✅ "najdi" → real-time keyword
- ✅ "ubytování" → search keyword
- ✅ "naší svatby" → personal keyword

**Result**: → **Hybrid**

**Output**:
```
Odpověď: "V okolí vaší svatby v Praze jsem našel tyto možnosti ubytování:

1. Hotel Château Mcely (10 pokojů, 42 000 Kč) - již rezervováno
2. Penzion U Lípy (10 pokojů) - již rezervováno

Další doporučené hotely v okolí:
- Hotel Grandior (od 2 500 Kč/noc)
- Hotel Majestic Plaza (od 3 200 Kč/noc)
- Penzion u Šárky (od 1 800 Kč/noc)"

Provider: hybrid
Badge: "Kombinace AI + aktuální data"

Zdroje:
[1] Hotel Grandior - https://...
[2] Hotel Majestic Plaza - https://...
[3] Booking.com - Ubytování Praha - https://...
```

## 🎨 UI Changes

### Před upgradem:
```
┌─────────────────────────────────────┐
│ User: Kolik stojí fotograf?         │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ AI: Ceny fotografů se obvykle       │
│ pohybují mezi 15-50 tisíc Kč...     │
│                                     │
│ 20:19                               │
└─────────────────────────────────────┘
```

### Po upgradu:
```
┌─────────────────────────────────────┐
│ User: Kolik stojí fotograf?         │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ AI: Podle aktuálních údajů se ceny  │
│ svatebních fotografů v Praze        │
│ pohybují mezi 15 000 - 50 000 Kč... │
│                                     │
│ 20:19    [🌐 Real-time]             │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Zdroje:                             │
│ [Svatební fotograf Praha 🔗]        │
│ [Ceny fotografů 2025 🔗]            │
│ [Fotograf.cz 🔗]                    │
└─────────────────────────────────────┘
```

## ✅ Benefits

### Pro uživatele:
- ✅ **Aktuální informace** - Real-time data z internetu
- ✅ **Ověřené zdroje** - Odkazy na originální zdroje
- ✅ **Lepší odpovědi** - Kombinace AI + aktuální data
- ✅ **Transparentnost** - Vidí, odkud informace pochází

### Pro vývojáře:
- ✅ **Jednoduchá změna** - Jen změna z `askAssistant` na `askHybrid`
- ✅ **Backward compatible** - Stará metoda stále funguje
- ✅ **Type safe** - Full TypeScript support
- ✅ **Reusable** - Komponenty lze použít všude

## 🧪 Testing

### Test 1: Real-time dotaz
```
1. Otevři aplikaci
2. Klikni na floating AI assistant
3. Napiš: "Kolik stojí fotograf v Praze?"
4. Ověř:
   ✅ Odpověď obsahuje aktuální ceny
   ✅ Badge "Real-time" nebo "Hybrid AI"
   ✅ Sekce "Zdroje" s odkazy
   ✅ Odkazy jsou klikatelné
```

### Test 2: Personal dotaz
```
1. Otevři aplikaci
2. Klikni na floating AI assistant
3. Napiš: "Kolik mi zbývá z rozpočtu?"
4. Ověř:
   ✅ Odpověď obsahuje personal data
   ✅ Badge "AI"
   ✅ Žádné zdroje (expected)
```

### Test 3: Hybrid dotaz
```
1. Otevři aplikaci
2. Klikni na floating AI assistant
3. Napiš: "Najdi mi ubytování pro hosty na svatbu v okolí naší svatby"
4. Ověř:
   ✅ Odpověď kombinuje personal data + real-time
   ✅ Badge "Hybrid AI"
   ✅ Sekce "Zdroje" s odkazy
   ✅ Zmínka o již rezervovaných hotelech (personal)
   ✅ Doporučení nových hotelů (real-time)
```

## 🔄 Migration Guide

### Pokud máš vlastní komponentu používající AIAssistant:

#### Před:
```typescript
import { useAI } from '@/hooks/useAI'

const { askAssistant } = useAI()
await askAssistant('Kolik stojí fotograf?')
```

#### Po:
```typescript
import { useAI } from '@/hooks/useAI'

const { askHybrid } = useAI()
const result = await askHybrid('Kolik stojí fotograf?')

// Display sources
if (result.sources && result.sources.length > 0) {
  <AISourcesList sources={result.sources} compact={true} />
}
```

## 📚 Related Files

- `src/components/ai/AIAssistant.tsx` - Main chat component (upgraded)
- `src/components/ai/AISourcesList.tsx` - Sources display (upgraded)
- `src/hooks/useAI.ts` - AI hook with hybrid methods
- `src/lib/hybrid-ai.ts` - Hybrid AI router
- `src/lib/perplexity.ts` - Perplexity API client

## 🎉 Summary

**AIAssistant komponenta je nyní plně hybrid!** 🚀

- ✅ Automaticky používá Perplexity pro real-time dotazy
- ✅ Automaticky používá GPT pro personal dotazy
- ✅ Automaticky kombinuje obě pro hybrid dotazy
- ✅ Zobrazuje zdroje a provider badges
- ✅ Žádné breaking changes - stará metoda stále funguje

**Tvůj dotaz "Najdi mi ubytování pro hosty na svatbu v okolí naší svatby" nyní vrátí:**
- ✅ Aktuální hotely z internetu
- ✅ Odkazy na booking stránky
- ✅ Kombinaci s tvými již rezervovanými hotely
- ✅ Badge "Hybrid AI"

---

**Happy Coding!** 🤖🔍

