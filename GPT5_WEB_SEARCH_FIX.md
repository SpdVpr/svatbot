# GPT-5 Web Search Fix - Dokumentace

## Problém

AI asistent v aplikaci SvatBot.cz nedokázal vyhledávat reálné informace z internetu, i když měl přístup k GPT-5-mini API. Uživatel testoval stejný dotaz na https://chatgpt.com/ a tam fungoval web search perfektně.

### Příklad problému:
**Dotaz:** "Najdi mi místa na ubytování Yardresort (Předboj–Kojetice u Prahy), adresa: Ke Tvrzi 7, 250 72 Předboj-Kojetice u Prahy. V okruhu 5-10 km. datum 24.1.2026"

**Očekávaný výsledek:** Seznam konkrétních hotelů s adresami, cenami a odkazy

**Skutečný výsledek:** AI se ptal na upřesnění nebo nedokázal najít reálné informace

## Příčina

1. **Chybějící `tools` parametr**: Responses API vyžaduje explicitní povolení web search přes `tools: [{ type: "web_search" }]`
2. **Nesprávné čtení odpovědi**: Kód používal `response.output_text`, který neexistuje v Responses API
3. **Nízký limit tokenů**: `max_output_tokens: 1000` byl příliš malý pro web search výsledky
4. **Mylný komentář v kódu**: Komentář tvrdil, že GPT-5 má automatický web search, což není pravda bez explicitního povolení

## Řešení

### 1. Přidání web search do Responses API

**Soubor:** `src/app/api/ai/chat/route.ts`

```typescript
// ❌ PŘED (bez web search):
const response = await openai.responses.create({
  model: "gpt-5-mini",
  input: inputText,
  reasoning: { effort: 'low' },
  text: { verbosity: 'medium' },
  max_output_tokens: 1000
})

content = response.output_text || 'Omlouvám se...'

// ✅ PO (s web search):
const response = await openai.responses.create({
  model: "gpt-5-mini",
  input: inputText,
  tools: [{ type: "web_search" }], // ✅ Enable built-in web search
  reasoning: { effort: 'low' },
  text: { verbosity: 'medium' },
  max_output_tokens: 3000 // Increase for web search results
})

// Extract text from Responses API output
content = ''
if (response.output && Array.isArray(response.output)) {
  const messages = response.output.filter((item: any) => item.type === 'message')
  for (const msg of messages) {
    if (msg.content && Array.isArray(msg.content)) {
      for (const contentItem of msg.content) {
        if (contentItem.type === 'output_text' && contentItem.text) {
          content += contentItem.text + '\n\n'
        }
      }
    }
  }
}
```

### 2. Oprava hybrid-ai.ts

**Soubor:** `src/lib/hybrid-ai.ts`

Stejné změny jako výše - přidání `tools: [{ type: 'web_search' }]` a správné čtení odpovědi z `response.output` array.

### 3. Přidání specializované funkce pro ubytování

**Soubor:** `src/lib/ai-client.ts`

```typescript
// Search accommodation (hotels, pensions, etc.)
static async searchAccommodation(
  location: string,
  date?: Date,
  guestCount?: number,
  radius?: number // in km
): Promise<AIResponse> {
  let query = `Najdi ubytování (hotely, penziony) v okolí ${location}`
  
  if (radius) {
    query += ` v okruhu ${radius} km`
  }
  
  if (date) {
    query += ` na datum ${date.toLocaleDateString('cs-CZ')}`
  }
  
  if (guestCount) {
    query += ` pro ${guestCount} hostů`
  }
  
  query += '. Zahrň názvy, adresy, kontakty, ceny a odkazy na rezervaci.'
  
  return this.search(
    query,
    'accommodation',
    { accommodationLocation: location, accommodationDate: date, accommodationGuests: guestCount, radius }
  )
}
```

## Testování

### Test skript: `test-web-search.ts`

```bash
npx tsx test-web-search.ts
```

### Výsledky testu:

✅ **Web search funguje!**
- **14 web search dotazů** provedeno
- **Nalezené hotely:**
  1. **Rezidence Artemis** (Úžice)
     - Adresa: Netřeba 12, 277 45 Úžice
     - Vzdálenost: ~5,6 km
     - Cena: ~1 000 Kč/noc
     - Kontakt: +420 608 713 178, rezidence-artemis.cz
  
  2. **Pension Olga** (Klecany)
     - Adresa: Na Vyhlídce 547, 250 67 Klecany
     - Vzdálenost: ~6,3 km
     - Cena: ~1 630 Kč/noc

## Klíčové poznatky

### Responses API vs Chat Completions API

**Responses API** (GPT-5):
```typescript
const response = await openai.responses.create({
  model: 'gpt-5-mini',
  input: 'text',
  tools: [{ type: 'web_search' }], // ✅ Built-in web search
  reasoning: { effort: 'medium' },
  max_output_tokens: 3000
})

// Read from response.output array
const messages = response.output.filter(item => item.type === 'message')
```

**Chat Completions API** (GPT-4):
```typescript
const response = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [...],
  tools: [...] // Custom function calling
})

// Read from response.choices[0].message.content
```

### Web Search v GPT-5

- **Není automatický** - musí být explicitně povolen přes `tools: [{ type: "web_search" }]`
- **Provádí více dotazů** - v našem testu 14 vyhledávání pro jeden dotaz
- **Vrací strukturovaná data** - s citacemi a odkazy na zdroje
- **Vyžaduje více tokenů** - doporučeno min. 3000-6000 `max_output_tokens`

## Dokumentace

- **OpenAI Cookbook**: https://cookbook.openai.com/examples/responses_api/responses_example
- **Responses API Reference**: https://platform.openai.com/docs/api-reference/responses/create
- **Web Search Tool**: https://platform.openai.com/docs/guides/tools-web-search

## Další vylepšení

1. **Streaming responses** - pro rychlejší zobrazení výsledků
2. **Caching** - ukládat časté dotazy
3. **Error handling** - lepší zpracování `incomplete` statusu
4. **Polling completion** - čekat na dokončení dlouhých odpovědí
5. **Source citations** - zobrazovat zdroje v UI

## Závěr

GPT-5 web search nyní funguje správně! AI asistent dokáže:
- ✅ Vyhledávat reálné informace z internetu
- ✅ Najít konkrétní hotely, restaurace, dodavatele
- ✅ Poskytnout aktuální ceny a kontakty
- ✅ Uvést zdroje a odkazy na rezervaci

**Status:** ✅ VYŘEŠENO

