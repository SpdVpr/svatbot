# 🚀 Perplexity AI Upgrade - SvatBot v2.0

## 🎉 Co je nového?

SvatBot nyní kombinuje **GPT-4** (personalizace) s **Perplexity AI** (real-time data z internetu) pro poskytování nejlepších svatebních rad!

### ✨ Nové funkce

1. **🔍 Real-time vyhledávání** - Aktuální ceny, dodavatelé, trendy z internetu
2. **🤖 Hybrid AI** - Inteligentní routing mezi GPT a Perplexity
3. **📚 Citace zdrojů** - Každá odpověď s odkazy na zdroje
4. **💡 Smart suggestions** - Kontextové návrhy dotazů
5. **🎯 Specializované vyhledávání** - Fotografové, cateringy, místa, trendy

## 🏗️ Co bylo implementováno

### 📁 Nové soubory

```
src/lib/
├── perplexity.ts              ✅ Perplexity API client
└── hybrid-ai.ts               ✅ Intelligent AI router

src/app/api/ai/
├── hybrid-chat/route.ts       ✅ Hybrid chat endpoint
└── search/route.ts            ✅ Search endpoint

src/components/ai/
├── AISourcesList.tsx          ✅ Sources display component
├── AISearchPanel.tsx          ✅ Quick search panel
└── AIAssistantHybrid.tsx      ✅ Enhanced AI assistant

docs/
└── PERPLEXITY_AI_INTEGRATION.md  ✅ Complete documentation
```

### 🔧 Upravené soubory

```
.env.local                     ✅ Added PERPLEXITY_API_KEY
src/lib/ai-client.ts          ✅ Added Perplexity methods
src/hooks/useAI.ts            ✅ Added hybrid methods
```

## 🎯 Jak to použít

### 1. Základní použití - Hybrid Chat

Nejjednodušší způsob - automaticky vybírá mezi GPT a Perplexity:

```typescript
import { useAI } from '@/hooks/useAI'

function MyComponent() {
  const { askHybrid, loading } = useAI()

  const handleQuestion = async () => {
    const result = await askHybrid('Kolik stojí fotograf v Praze?')
    
    console.log(result.content)      // Odpověď
    console.log(result.sources)      // Zdroje z internetu
    console.log(result.provider)     // 'gpt' | 'perplexity' | 'hybrid'
  }

  return <button onClick={handleQuestion}>Zeptat se</button>
}
```

### 2. Specializované vyhledávání

```typescript
const { findVendors, getTrends, getPrices } = useAI()

// Najít fotografy
const photographers = await findVendors('fotograf', 'Praha', 'boho')

// Získat aktuální trendy
const trends = await getTrends(2025)

// Zjistit ceny
const prices = await getPrices('catering', 'Brno', 80)
```

### 3. UI Komponenty

#### AI Assistant s Perplexity

```typescript
import AIAssistantHybrid from '@/components/ai/AIAssistantHybrid'

<AIAssistantHybrid 
  compact={true}
  defaultOpen={false}
/>
```

#### Quick Search Panel

```typescript
import AISearchPanel from '@/components/ai/AISearchPanel'

<AISearchPanel />
```

#### Display Sources

```typescript
import AISourcesList from '@/components/ai/AISourcesList'

<AISourcesList
  sources={result.sources}
  provider={result.provider}
  reasoning={result.reasoning}
/>
```

## 📊 Příklady dotazů

### ✅ Dotazy pro Perplexity (real-time data)

```typescript
// Aktuální ceny
"Kolik stojí fotograf v Praze?"
"Jaké jsou ceny cateringu pro 80 lidí v Brně?"

// Najít dodavatele
"Hledám fotografa v okolí Prahy ve stylu boho"
"Doporuč mi svatební místa v Brně"

// Trendy
"Jaké jsou aktuální svatební trendy v roce 2025?"
"Jaké barvy jsou teď populární pro svatby?"

// Inspirace
"Inspirace pro rustikální svatbu"
"Nápady na letní svatbu venku"
```

### ✅ Dotazy pro GPT (personalizace)

```typescript
// Osobní plánování
"Jak mám naplánovat svoji svatbu?"
"Pomoz mi s rozpočtem"
"Jaké úkoly mám dokončit?"

// Analýza dat
"Kolik hostů už potvrdilo účast?"
"Kolik mi zbývá z rozpočtu?"
"Které úkoly jsou po termínu?"
```

### ✅ Hybrid dotazy (kombinace)

```typescript
// Kombinace personal + real-time
"Kolik by měl stát fotograf pro moji svatbu?" 
// → Perplexity (ceny) + GPT (kontext uživatele)

"Doporuč mi dodavatele podle mého rozpočtu"
// → Perplexity (dodavatelé) + GPT (rozpočet uživatele)
```

## 🎨 UI Příklady

### Chat s citacemi

```
User: Kolik stojí fotograf v Praze?

Svatbot: Podle aktuálních údajů se ceny svatebních fotografů 
v Praze pohybují mezi 15 000 - 50 000 Kč, v závislosti na 
zkušenostech a rozsahu služeb...

[Real-time] Aktuální informace z internetu

📚 Zdroje informací (3)
[1] Svatební fotograf Praha - https://...
[2] Ceny fotografů 2025 - https://...
[3] Fotograf.cz - https://...

✓ Informace ověřeny z aktuálních internetových zdrojů
```

### Quick Search Panel

```
┌─────────────────────────────────────┐
│ 🔍 AI Vyhledávání                   │
│ Aktuální informace z internetu      │
├─────────────────────────────────────┤
│                                     │
│ [🎨 Trendy 2025]  [📸 Fotografové] │
│ [💰 Ceny]         [📍 Místa]       │
│ [💡 Inspirace]    [📄 Právní info] │
│                                     │
└─────────────────────────────────────┘
```

## 🔐 Konfigurace

### 1. Environment Variables

Už je nakonfigurováno v `.env.local`:

```env
PERPLEXITY_API_KEY=pplx-your-api-key-here
OPENAI_API_KEY=sk-proj-your-openai-key-here
```

### 2. Vercel Deployment

Přidat environment variable na Vercel:

```bash
vercel env add PERPLEXITY_API_KEY
```

Nebo v Vercel Dashboard:
1. Project Settings → Environment Variables
2. Add: `PERPLEXITY_API_KEY` = `pplx-...`
3. Redeploy

## 📈 Jak to funguje

### Intelligent Routing

```
User Query: "Kolik stojí fotograf v Praze?"
    ↓
Hybrid AI Router analyzuje:
    ├─ "kolik stojí" → real-time data ✓
    ├─ "fotograf" → search query ✓
    └─ "v Praze" → location ✓
    ↓
Decision: Use PERPLEXITY
    ↓
Perplexity vyhledá aktuální ceny
    ↓
Response + Sources
```

### Hybrid Mode

```
User Query: "Kolik by měl stát fotograf pro moji svatbu?"
    ↓
Hybrid AI Router analyzuje:
    ├─ "kolik" → real-time data ✓
    └─ "moji svatbu" → personal context ✓
    ↓
Decision: Use HYBRID
    ↓
1. Perplexity → aktuální ceny fotografů
2. GPT → personalizace podle rozpočtu uživatele
    ↓
Combined Response + Sources
```

## 💰 Náklady

### Perplexity Pricing

- **Model**: llama-3.1-sonar-large-128k-online
- **Cena**: ~$1 per 1M tokens
- **Odhad**: ~100-200 dotazů za $1

### Optimalizace

- Cache výsledky pro stejné dotazy
- Fallback na GPT když Perplexity není dostupná
- Rate limiting pro prevenci abuse

## 🧪 Testování

### 1. Test Perplexity Connection

```typescript
import { getPerplexityClient } from '@/lib/perplexity'

const perplexity = getPerplexityClient()
console.log('Perplexity available:', perplexity.isAvailable())

const result = await perplexity.search('Test query')
console.log('Result:', result)
```

### 2. Test Hybrid Routing

```typescript
import { getHybridAI } from '@/lib/hybrid-ai'

const hybridAI = getHybridAI()

// Should use Perplexity
const result1 = await hybridAI.ask('Kolik stojí fotograf?')
console.log('Provider:', result1.provider) // 'perplexity'

// Should use GPT
const result2 = await hybridAI.ask('Kolik mi zbývá z rozpočtu?', context)
console.log('Provider:', result2.provider) // 'gpt'
```

### 3. Test UI Components

```bash
npm run dev
```

Otevřít: http://localhost:3000

Test komponenty:
- `AIAssistantHybrid` - Floating chat
- `AISearchPanel` - Quick search
- `AISourcesList` - Sources display

## 📚 Dokumentace

Kompletní dokumentace: `docs/PERPLEXITY_AI_INTEGRATION.md`

Obsahuje:
- ✅ Architektura
- ✅ API Reference
- ✅ Příklady použití
- ✅ Best practices
- ✅ Error handling
- ✅ Deployment guide

## 🎯 Next Steps

### Doporučené vylepšení

1. **Cache layer** - Redis pro cachování výsledků
2. **Analytics** - Tracking usage Perplexity vs GPT
3. **A/B testing** - Porovnání kvality odpovědí
4. **User feedback** - Thumbs up/down na odpovědi
5. **Advanced routing** - ML model pro lepší routing

### Možná rozšíření

1. **Marketplace integration** - Propojit s marketplace vendors
2. **Price comparison** - Automatické porovnání cen
3. **Vendor recommendations** - AI doporučení dodavatelů
4. **Trend analysis** - Analýza trendů v čase
5. **Budget optimization** - AI optimalizace rozpočtu s real-time cenami

## 🐛 Troubleshooting

### Perplexity API Error

```typescript
// Error: Perplexity API key not configured
// Fix: Check .env.local has PERPLEXITY_API_KEY
```

### No Sources Returned

```typescript
// Možné příčiny:
// 1. Query není vhodný pro Perplexity
// 2. Perplexity API error
// 3. Fallback na GPT (žádné zdroje)

// Check provider:
console.log('Provider:', result.provider)
// If 'gpt' → no sources expected
// If 'perplexity' → should have sources
```

### Slow Response

```typescript
// Perplexity může být pomalejší než GPT
// Optimalizace:
// 1. Cache výsledky
// 2. Použít streaming (future)
// 3. Timeout fallback na GPT
```

## 📞 Support

Pro otázky nebo problémy:
- 📧 Email: support@svatbot.cz
- 💬 GitHub Issues
- 📚 Dokumentace: `docs/PERPLEXITY_AI_INTEGRATION.md`

---

**SvatBot v2.0** - Powered by GPT-4 + Perplexity AI 🤖🔍

*Váš AI svatební kouč s přístupem k aktuálním informacím z internetu!*

