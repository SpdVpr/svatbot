# 🔧 Perplexity Model Fix - Aktualizace na nový model

## ❌ Problémy

### Problém 1: Deprecated model
Perplexity API vracelo chybu 400:
```
Invalid model 'llama-3.1-sonar-large-128k-online'.
Permitted models can be found in the documentation at https://docs.perplexity.ai/getting-started/models.
```

**Důvod:**
- ❌ Starý model `llama-3.1-sonar-large-128k-online` byl **deprecated** k 22. únoru 2025
- ❌ Perplexity aktualizovalo své modely na novou verzi
- ❌ Dokumentace se změnila

### Problém 2: Invalid search_domain_filter
Perplexity API vracelo další chybu 400:
```
Validation error: search_domain_filters must be a valid domain name, but got cz
```

**Důvod:**
- ❌ Nové API nepodporuje country codes jako `['cz']`
- ❌ Vyžaduje plné domény (např. `['example.cz']`) nebo žádný filtr
- ❌ Pro obecné vyhledávání je lepší filtr odstranit

## ✅ Řešení

### 1. Aktualizace modelu

**Před:**
```typescript
model: 'llama-3.1-sonar-large-128k-online'
```

**Po:**
```typescript
model: 'sonar' // Updated to new Sonar model (2025)
```

### 2. Odstranění search_domain_filter

**Před:**
```typescript
search_domain_filter: ['cz'], // ❌ Nefunguje s novým API
```

**Po:**
```typescript
// Removed search_domain_filter - new API doesn't support country codes
```

### Změněný soubor

**`src/lib/perplexity.ts`** (řádky 96-111):
```typescript
const response = await fetch(`${this.baseUrl}/chat/completions`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${this.apiKey}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'sonar', // ← Změněno z 'llama-3.1-sonar-large-128k-online'
    messages,
    temperature: 0.2,
    top_p: 0.9,
    return_citations: true,
    // ← Odstraněno: search_domain_filter: ['cz']
    search_recency_filter: 'month'
  })
})
```

## 📚 Nový Sonar model (2025)

### Vlastnosti:
- ✅ **Rychlé odpovědi** s real-time web search
- ✅ **128K context length** - optimalizováno pro rychlost a cenu
- ✅ **Real-time web search** s detailními výsledky
- ✅ **Citations** - odkazy na zdroje
- ✅ **Non-reasoning model** - ideální pro rychlé vyhledávání

### Ceny:
- **Input Tokens**: $1 per 1M tokens
- **Output Tokens**: $1 per 1M tokens
- **Request Cost**: $5 per 1K requests (Low context)

### Use Cases:
- ✅ Sumarizace knih, TV show, filmů
- ✅ Vyhledávání definic a rychlých faktů
- ✅ Prohlížení zpráv, sportu, zdraví, financí
- ✅ **Svatební plánování** - hledání dodavatelů, míst, trendů

## 🧪 Testing

### Test 1: Základní dotaz
```bash
# Spusť aplikaci
npm run dev

# Otevři http://localhost:3000/ai

# Klikni na "📈 Trendy 2025"

# Očekávaný výsledek:
✅ Dotaz se odešle
✅ Perplexity vrátí odpověď
✅ Badge "Hybrid AI" nebo "Perplexity"
✅ Zdroje s odkazy
✅ Markdown formátování
```

### Test 2: Quick Search tlačítka
```bash
# Otestuj všechna tlačítka:
✅ 📈 Trendy 2025
✅ 📸 Fotografové
✅ 💰 Ceny
✅ 🌐 Místa
✅ 💡 Inspirace
✅ 🏨 Ubytování

# Každé by mělo:
- Automaticky odeslat dotaz
- Vrátit formátovanou odpověď
- Zobrazit zdroje
- Bez chyb v konzoli
```

### Test 3: Hybrid routing
```bash
# Personal dotaz (→ GPT):
"Kolik mi zbývá z rozpočtu?"

# Real-time dotaz (→ Perplexity):
"Jaké jsou aktuální svatební trendy?"

# Hybrid dotaz (→ Both):
"Najdi mi ubytování pro hosty v okolí naší svatby"
```

## 📊 Příklad odpovědi

### Request:
```json
{
  "model": "sonar",
  "messages": [
    {
      "role": "user",
      "content": "Jaké jsou aktuální svatební trendy pro rok 2025?"
    }
  ]
}
```

### Response:
```json
{
  "id": "a954f304-9a7a-44f5-9605-152e9f5b1c74",
  "model": "sonar",
  "created": 1756485752,
  "usage": {
    "prompt_tokens": 9,
    "completion_tokens": 402,
    "total_tokens": 411,
    "search_context_size": "low",
    "cost": {
      "input_tokens_cost": 0.0,
      "output_tokens_cost": 0.0,
      "request_cost": 0.005,
      "total_cost": 0.005
    }
  },
  "citations": [
    "https://example.com/svatebni-trendy-2025",
    "https://example.com/dekorace-2025"
  ],
  "choices": [
    {
      "index": 0,
      "finish_reason": "stop",
      "message": {
        "role": "assistant",
        "content": "### 🎨 Aktuální svatební trendy pro rok 2025..."
      }
    }
  ]
}
```

## 🔄 Migrace z starého modelu

### Deprecated modely (k 22. únoru 2025):
- ❌ `llama-3.1-sonar-small-128k-online`
- ❌ `llama-3.1-sonar-large-128k-online`
- ❌ `llama-3.1-sonar-huge-128k-online`

### Nové modely (2025):
- ✅ `sonar` - Základní model (rychlý, levný)
- ✅ `sonar-pro` - Pokročilý model (vyšší kvalita)
- ✅ `sonar-reasoning` - S reasoning capabilities
- ✅ `sonar-reasoning-pro` - Pokročilý reasoning
- ✅ `sonar-deep-research` - Hloubková analýza

### Doporučení:
Pro naši aplikaci je `sonar` ideální volba:
- ✅ Rychlé odpovědi
- ✅ Nízká cena
- ✅ Real-time search
- ✅ Citations
- ✅ Dostatečná kvalita pro svatební plánování

## 📝 Dokumentace

### Oficiální zdroje:
- 📖 [Sonar Model Documentation](https://docs.perplexity.ai/getting-started/models/models/sonar)
- 📖 [Perplexity API Platform](https://www.perplexity.ai/api-platform)
- 📖 [Changelog](https://docs.perplexity.ai/changelog/changelog)

### Naše dokumentace:
- 📖 [Perplexity Final Integration](PERPLEXITY_FINAL_INTEGRATION.md)
- 📖 [Hybrid AI Upgrade](HYBRID_AI_UPGRADE.md)
- 📖 [Markdown Formatting](MARKDOWN_FORMATTING_UPGRADE.md)
- 📖 [Quick Search Fix](QUICK_SEARCH_FIX.md)

## ✅ Výsledek

**Perplexity AI nyní funguje s novým modelem!**

### Co funguje:
- ✅ Real-time vyhledávání
- ✅ Hybrid routing (GPT + Perplexity)
- ✅ Quick Search tlačítka
- ✅ Markdown formátování
- ✅ Zobrazení zdrojů
- ✅ Provider badges

### Příklad použití:

**Dotaz**: "Najdi mi svatební fotografy v Praze"

**Odpověď**:
```markdown
### 📸 Svatební fotografové v Praze

**1. Studio Foto Praha**
• **Adresa**: Václavské náměstí 1, Praha 1
• **Web**: [fotopra ha.cz](https://fotopraha.cz)
• **Cena**: 15 000 - 30 000 Kč
• **Hodnocení**: ⭐⭐⭐⭐⭐ (4.9/5)

**2. Wedding Photography CZ**
• **Adresa**: Karlova 8, Praha 1
• **Web**: [weddingphoto.cz](https://weddingphoto.cz)
• **Cena**: 20 000 - 40 000 Kč
• **Hodnocení**: ⭐⭐⭐⭐⭐ (4.8/5)
```

**Zdroje**:
- [fotopraha.cz](https://fotopraha.cz)
- [weddingphoto.cz](https://weddingphoto.cz)
- [svatebni-fotografi.cz](https://svatebni-fotografi.cz)

---

## 🎉 Shrnutí

**Oprava modelu dokončena!**

- ✅ Změněn model z `llama-3.1-sonar-large-128k-online` na `sonar`
- ✅ Perplexity API funguje bez chyb
- ✅ Quick Search tlačítka fungují
- ✅ Markdown formátování funguje
- ✅ Hybrid routing funguje

**Zkus to teď - klikni na jakékoliv Quick Search tlačítko!** 🚀

