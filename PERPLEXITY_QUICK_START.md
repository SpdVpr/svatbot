# ⚡ Perplexity AI - Quick Start Guide

## 🚀 5-minutový start

### 1. Ověř konfiguraci

```bash
# Check .env.local
cat .env.local | grep PERPLEXITY
# Mělo by vrátit:
# PERPLEXITY_API_KEY=pplx-your-api-key-here
```

✅ API klíč je už nakonfigurovaný!

### 2. Spusť dev server

```bash
npm run dev
```

### 3. Test v konzoli

Otevři browser console (F12) a zkus:

```javascript
// Test Perplexity search
const result = await fetch('/api/ai/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: 'Kolik stojí fotograf v Praze?',
    type: 'prices'
  })
})

const data = await result.json()
console.log('Answer:', data.answer)
console.log('Sources:', data.sources)
```

## 💡 Nejjednodušší použití

### V React komponentě

```typescript
'use client'

import { useAI } from '@/hooks/useAI'

export default function MyComponent() {
  const { askHybrid, loading } = useAI()
  const [answer, setAnswer] = useState('')

  const handleAsk = async () => {
    const result = await askHybrid('Kolik stojí fotograf v Praze?')
    setAnswer(result.content)
  }

  return (
    <div>
      <button onClick={handleAsk} disabled={loading}>
        Zeptat se AI
      </button>
      {answer && <p>{answer}</p>}
    </div>
  )
}
```

## 🎯 Hotové komponenty

### 1. AI Assistant (Floating Chat)

```typescript
import AIAssistantHybrid from '@/components/ai/AIAssistantHybrid'

<AIAssistantHybrid 
  compact={true}
  defaultOpen={false}
/>
```

**Výsledek**: Plovoucí chat button v pravém dolním rohu

### 2. Search Panel

```typescript
import AISearchPanel from '@/components/ai/AISearchPanel'

<AISearchPanel />
```

**Výsledek**: Panel s quick search tlačítky

### 3. Sources Display

```typescript
import AISourcesList from '@/components/ai/AISourcesList'

<AISourcesList
  sources={result.sources}
  provider="perplexity"
/>
```

**Výsledek**: Pěkně formátované zdroje s odkazy

## 🔥 Nejčastější use cases

### 1. Najít dodavatele

```typescript
const { findVendors } = useAI()

const photographers = await findVendors('fotograf', 'Praha')
// Vrátí: aktuální fotografy v Praze s kontakty a cenami
```

### 2. Zjistit ceny

```typescript
const { getPrices } = useAI()

const prices = await getPrices('catering', 'Brno', 80)
// Vrátí: aktuální ceny cateringu pro 80 lidí v Brně
```

### 3. Získat trendy

```typescript
const { getTrends } = useAI()

const trends = await getTrends(2025)
// Vrátí: aktuální svatební trendy v roce 2025
```

### 4. Obecné vyhledávání

```typescript
const { searchInfo } = useAI()

const result = await searchInfo('Inspirace pro rustikální svatbu')
// Vrátí: aktuální inspirace z internetu
```

## 📱 Přidání do existující stránky

### Dashboard

```typescript
// src/app/page.tsx
import AISearchPanel from '@/components/ai/AISearchPanel'

export default function Dashboard() {
  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Existing modules */}
      <TasksModule />
      <BudgetModule />
      
      {/* NEW: AI Search */}
      <AISearchPanel />
    </div>
  )
}
```

### AI Page

```typescript
// src/app/ai/page.tsx
import AIAssistantHybrid from '@/components/ai/AIAssistantHybrid'

export default function AIPage() {
  return (
    <div className="container mx-auto p-6">
      <AIAssistantHybrid 
        compact={false}
        defaultOpen={true}
      />
    </div>
  )
}
```

### Floating Widget (Global)

```typescript
// src/app/layout.tsx
import AIAssistantHybrid from '@/components/ai/AIAssistantHybrid'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        
        {/* Floating AI Assistant */}
        <AIAssistantHybrid compact={true} />
      </body>
    </html>
  )
}
```

## 🎨 Customizace

### Změnit barvy

```typescript
// V komponentě AIAssistantHybrid.tsx
// Změň:
from-purple-600 to-indigo-600
// Na:
from-pink-600 to-rose-600
```

### Změnit pozici floating buttonu

```typescript
// V AIAssistantHybrid.tsx
// Změň:
className="fixed bottom-6 right-6"
// Na:
className="fixed bottom-6 left-6"  // Vlevo
className="fixed top-6 right-6"    // Nahoře vpravo
```

### Přidat vlastní quick search

```typescript
// V AISearchPanel.tsx
const quickSearches = [
  // ... existing
  {
    id: 'my-search',
    icon: MyIcon,
    label: 'Můj search',
    color: 'bg-orange-100 text-orange-700',
    action: async () => {
      const result = await searchInfo('Můj dotaz')
      setSearchResult(result)
    }
  }
]
```

## 🧪 Testování

### Test 1: Perplexity Connection

```bash
# V terminálu
curl -X POST http://localhost:3000/api/ai/search \
  -H "Content-Type: application/json" \
  -d '{"query":"Test","type":"trends"}'
```

Očekávaný výsledek:
```json
{
  "success": true,
  "answer": "...",
  "sources": [...],
  "provider": "perplexity"
}
```

### Test 2: Hybrid Routing

```typescript
// V browser console
const result = await fetch('/api/ai/hybrid-chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    question: 'Kolik stojí fotograf?'
  })
}).then(r => r.json())

console.log('Provider:', result.provider)
// Mělo by být: 'perplexity' nebo 'hybrid'
```

### Test 3: UI Components

1. Otevři http://localhost:3000
2. Klikni na floating AI button (pravý dolní roh)
3. Napiš: "Kolik stojí fotograf v Praze?"
4. Měl by se zobrazit:
   - ✅ Odpověď s cenami
   - ✅ Badge "Real-time" nebo "Hybrid AI"
   - ✅ Zdroje s odkazy

## 🐛 Řešení problémů

### Problém: "Perplexity API není nakonfigurováno"

**Řešení**:
```bash
# Check .env.local
cat .env.local | grep PERPLEXITY

# Pokud chybí, přidej:
echo "PERPLEXITY_API_KEY=pplx-your-api-key-here" >> .env.local

# Restart dev server
npm run dev
```

### Problém: Žádné zdroje v odpovědi

**Možné příčiny**:
1. Dotaz byl routován na GPT (ne Perplexity)
2. Perplexity API error

**Check**:
```typescript
console.log('Provider:', result.provider)
// Pokud 'gpt' → žádné zdroje (expected)
// Pokud 'perplexity' → měly by být zdroje
```

### Problém: Pomalé odpovědi

**Normální**: Perplexity je pomalejší než GPT (3-5s vs 1-2s)

**Optimalizace**:
- Cache výsledky
- Použij loading states
- Fallback timeout

## 📊 Monitoring

### Check usage

```typescript
// V browser console
// Kolikrát byl použit Perplexity vs GPT
localStorage.getItem('ai_usage_stats')
```

### Log routing decisions

```typescript
// V hybrid-ai.ts je už logging:
console.log('🤖 Hybrid AI Analysis:', {
  query: '...',
  analysis: {
    needsRealTimeData: true,
    queryType: 'search',
    provider: 'perplexity'
  }
})
```

## 🎓 Další kroky

1. **Přečti dokumentaci**: `docs/PERPLEXITY_AI_INTEGRATION.md`
2. **Zkus příklady**: `PERPLEXITY_UPGRADE_README.md`
3. **Customize UI**: Uprav komponenty podle designu
4. **Add analytics**: Track usage a kvalitu odpovědí
5. **Deploy**: Push na Vercel s PERPLEXITY_API_KEY

## 💬 Příklady dotazů k testování

```
✅ Real-time (Perplexity):
- "Kolik stojí fotograf v Praze?"
- "Najdi mi svatební místa v Brně"
- "Jaké jsou trendy svatební dekorace 2025?"
- "Doporuč mi cateringy v okolí Prahy"

✅ Personal (GPT):
- "Kolik mi zbývá z rozpočtu?"
- "Kteří hosté ještě nepotvrdili?"
- "Jaké úkoly mám dokončit?"
- "Analyzuj můj rozpočet"

✅ Hybrid (Both):
- "Kolik by měl stát fotograf pro moji svatbu?"
- "Doporuč mi dodavatele podle mého rozpočtu"
- "Jaké trendy se hodí k mému stylu svatby?"
```

## 🎉 Hotovo!

Perplexity AI je teď plně integrovaná a připravená k použití! 🚀

---

**Quick Links**:
- 📚 [Full Documentation](docs/PERPLEXITY_AI_INTEGRATION.md)
- 🎯 [Examples](PERPLEXITY_UPGRADE_README.md)
- 💬 Support: support@svatbot.cz

