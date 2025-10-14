# 🧪 Perplexity AI - Test Guide

## ⚡ Quick Test (2 minuty)

### 1. Spusť aplikaci

```bash
npm run dev
```

### 2. Otevři dashboard

```
http://localhost:3000
```

### 3. Klikni na "Real-time AI" tlačítko

V AI Assistant modulu (na dashboardu) najdi tlačítko:

```
┌─────────────────┐
│ 🌐 Real-time AI│
│    Perplexity  │
│    [NEW]       │
└─────────────────┘
```

### 4. Zkus quick search

Na `/ai` stránce najdi "Rychlé vyhledávání" panel a klikni na jedno z tlačítek:
- 📈 Trendy 2025
- 📸 Fotografové
- 💰 Ceny
- 🌐 Místa
- 💡 Inspirace
- 🏨 Ubytování

### 5. Ověř výsledek

Měl by se zobrazit:
- ✅ Odpověď s aktuálními informacemi
- ✅ Badge "Real-time" nebo "Hybrid AI"
- ✅ Sekce se zdroji (kompaktní zobrazení)
- ✅ Klikatelné odkazy na zdroje

## 🎯 Detailní testování

### Test 1: AI Page s Quick Search

```bash
# Otevři AI stránku
http://localhost:3000/ai
```

**Co testovat**:
1. ✅ Stránka se načte bez chyb
2. ✅ Header zobrazuje "Powered by GPT-4 + Perplexity"
3. ✅ Badge "Real-time AI" je viditelný
4. ✅ Quick search panel je viditelný
5. ✅ 6 tlačítek funguje a vyplní textarea
6. ✅ Chat používá hybrid routing

### Test 2: Hybrid Chat

```bash
# Otevři AI stránku
http://localhost:3000/ai

# Chat je již otevřený
```

**Zkus tyto dotazy**:

#### Real-time dotazy (měly by použít Perplexity):
```
"Kolik stojí fotograf v Praze?"
"Jaké jsou trendy svatební dekorace 2025?"
"Najdi mi cateringy v Brně"
"Doporuč mi svatební místa v okolí Prahy"
```

**Očekávaný výsledek**:
- Badge: "Real-time" nebo "Hybrid AI"
- Sekce se zdroji
- Aktuální informace

#### Personal dotazy (měly by použít GPT):
```
"Kolik mi zbývá z rozpočtu?"
"Kteří hosté ještě nepotvrdili?"
"Jaké úkoly mám dokončit?"
```

**Očekávaný výsledek**:
- Badge: "AI"
- Žádné zdroje (používá personal data)
- Personalizovaná odpověď

### Test 3: API Endpoints

#### Test Perplexity Search

```bash
curl -X POST http://localhost:3000/api/ai/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Kolik stojí fotograf v Praze?",
    "type": "prices"
  }'
```

**Očekávaný výsledek**:
```json
{
  "success": true,
  "answer": "Podle aktuálních údajů...",
  "sources": [
    {
      "title": "...",
      "url": "https://...",
      "snippet": "..."
    }
  ],
  "citations": ["https://..."],
  "provider": "perplexity"
}
```

#### Test Hybrid Chat

```bash
curl -X POST http://localhost:3000/api/ai/hybrid-chat \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Kolik stojí fotograf v Praze?"
  }'
```

**Očekávaný výsledek**:
```json
{
  "response": "Podle aktuálních údajů...",
  "sources": [...],
  "provider": "perplexity",
  "reasoning": "Použita Perplexity pro aktuální informace"
}
```

### Test 4: Browser Console

Otevři browser console (F12) a zkus:

```javascript
// Test Perplexity availability
const response = await fetch('/api/ai/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: 'Test',
    type: 'trends'
  })
})

const data = await response.json()
console.log('Success:', data.success)
console.log('Provider:', data.provider)
console.log('Sources:', data.sources?.length)
```

**Očekávaný výsledek**:
```
Success: true
Provider: perplexity
Sources: 2-5
```

### Test 5: UI Components

#### AISourcesList Component

```typescript
// V jakékoliv komponentě
import AISourcesList from '@/components/ai/AISourcesList'

<AISourcesList
  sources={[
    { title: 'Test Source', url: 'https://example.com', snippet: 'Test snippet' }
  ]}
  provider="perplexity"
  reasoning="Test reasoning"
/>
```

**Očekávaný výsledek**:
- ✅ Zobrazí se badge "Aktuální informace z internetu"
- ✅ Zobrazí se sekce "Zdroje informací"
- ✅ Zobrazí se karta se zdrojem
- ✅ Link je klikatelný

#### AISearchPanel Component

```typescript
import AISearchPanel from '@/components/ai/AISearchPanel'

<AISearchPanel />
```

**Očekávaný výsledek**:
- ✅ Zobrazí se 6 quick search tlačítek
- ✅ Tlačítka jsou klikatelná
- ✅ Po kliknutí se zobrazí loading
- ✅ Po načtení se zobrazí výsledek

## 🐛 Troubleshooting

### Problém: "Perplexity API není nakonfigurováno"

**Řešení**:
```bash
# Check .env.local
cat .env.local | grep PERPLEXITY

# Mělo by vrátit:
# PERPLEXITY_API_KEY=pplx-your-api-key-here

# Pokud chybí, přidej:
echo "PERPLEXITY_API_KEY=pplx-your-api-key-here" >> .env.local

# Restart dev server
npm run dev
```

### Problém: Žádné zdroje v odpovědi

**Check provider**:
```javascript
console.log('Provider:', result.provider)
```

- Pokud `'gpt'` → žádné zdroje (expected, používá personal data)
- Pokud `'perplexity'` → měly by být zdroje
- Pokud `'hybrid'` → měly by být zdroje

**Možné příčiny**:
1. Dotaz byl routován na GPT (ne Perplexity)
2. Perplexity API error (check console)
3. Fallback na GPT (check reasoning)

### Problém: Pomalé odpovědi

**Normální**: Perplexity je pomalejší než GPT
- GPT: 1-2 sekundy
- Perplexity: 3-5 sekund
- Hybrid: 4-6 sekund

**Není problém**, je to očekávané chování.

### Problém: 500 Error

**Check console**:
```bash
# V terminálu kde běží npm run dev
# Měl by se zobrazit error log
```

**Možné příčiny**:
1. Neplatný API klíč
2. Rate limit exceeded
3. Network error

**Řešení**:
```bash
# Verify API key
echo $PERPLEXITY_API_KEY

# Check .env.local
cat .env.local | grep PERPLEXITY

# Restart server
npm run dev
```

## ✅ Checklist

### Základní funkce
- [ ] AI Search tlačítko na dashboardu funguje
- [ ] AI Search stránka se načte
- [ ] Quick search tlačítka fungují
- [ ] Výsledky obsahují odpověď
- [ ] Výsledky obsahují zdroje
- [ ] Odkazy na zdroje jsou klikatelné

### Hybrid Chat
- [ ] Chat se otevře
- [ ] Real-time dotazy používají Perplexity
- [ ] Personal dotazy používají GPT
- [ ] Hybrid dotazy kombinují obě
- [ ] Provider badge se zobrazuje správně
- [ ] Zdroje se zobrazují u Perplexity odpovědí

### API Endpoints
- [ ] `/api/ai/search` funguje
- [ ] `/api/ai/hybrid-chat` funguje
- [ ] Vrací správný formát odpovědi
- [ ] Error handling funguje

### UI Components
- [ ] AISourcesList zobrazuje zdroje správně
- [ ] AISearchPanel funguje
- [ ] AIAssistantHybrid funguje
- [ ] Provider badges se zobrazují
- [ ] Loading states fungují

## 📊 Expected Results

### Real-time Query Example

**Input**:
```
"Kolik stojí fotograf v Praze?"
```

**Output**:
```
Odpověď: "Podle aktuálních údajů se ceny svatebních fotografů 
v Praze pohybují mezi 15 000 - 50 000 Kč..."

Provider: perplexity

Zdroje:
[1] Svatební fotograf Praha - https://...
[2] Ceny fotografů 2025 - https://...
[3] Fotograf.cz - https://...
```

### Personal Query Example

**Input**:
```
"Kolik mi zbývá z rozpočtu?"
```

**Output**:
```
Odpověď: "Z vašeho celkového rozpočtu 300 000 Kč jste 
zatím utratili 120 000 Kč. Zbývá vám tedy 180 000 Kč..."

Provider: gpt

Zdroje: (žádné - personal data)
```

### Hybrid Query Example

**Input**:
```
"Kolik by měl stát fotograf pro moji svatbu?"
```

**Output**:
```
Odpověď: "Podle vašeho rozpočtu 300 000 Kč a lokace Praha 
doporučuji fotografa v cenové relaci 20 000 - 30 000 Kč. 
Aktuální průměrné ceny v Praze jsou..."

Provider: hybrid

Reasoning: "Kombinace Perplexity (aktuální ceny) a GPT-4 (personalizace)"

Zdroje:
[1] Svatební fotograf Praha - https://...
[2] Ceny fotografů 2025 - https://...
```

## 🎉 Success Criteria

Implementace je úspěšná pokud:

1. ✅ **AI Search tlačítko** na dashboardu funguje
2. ✅ **Quick search** vrací aktuální informace
3. ✅ **Zdroje** se zobrazují s odkazy
4. ✅ **Hybrid routing** funguje správně
5. ✅ **Provider badges** se zobrazují
6. ✅ **Žádné console errors**
7. ✅ **API endpoints** fungují
8. ✅ **UI je responzivní**

## 📞 Support

Pokud něco nefunguje:

1. **Check console** (F12) pro errors
2. **Check terminal** pro server errors
3. **Check .env.local** pro API key
4. **Restart dev server** (`npm run dev`)
5. **Clear browser cache** (Ctrl+Shift+R)

Pokud problém přetrvává:
- 📧 Email: support@svatbot.cz
- 💬 GitHub Issues
- 📚 Docs: `docs/PERPLEXITY_AI_INTEGRATION.md`

---

**Happy Testing!** 🚀🔍

