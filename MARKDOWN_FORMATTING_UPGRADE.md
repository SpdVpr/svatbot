# 📝 Markdown Formatting Upgrade

## ✅ Co bylo implementováno

### Problém
- ❌ AI odpovědi byly špatně čitelné
- ❌ Žádné formátování (tučné písmo, odrážky, nadpisy)
- ❌ Dlouhé texty bez struktury
- ❌ Špatná UX při čtení odpovědí

### Řešení
- ✅ **Markdown rendering** v AI odpovědích
- ✅ **System prompty** s pravidly formátování
- ✅ **React Markdown** pro rendering
- ✅ **Tailwind Typography** pro styling
- ✅ **Emoji** pro lepší vizuální orientaci

## 🔧 Technické změny

### 1. Instalace balíčků

```bash
npm install react-markdown remark-gfm
npm install -D @tailwindcss/typography
```

### 2. Aktualizace `src/lib/hybrid-ai.ts`

#### System prompt pro GPT
```typescript
const enhancedPrompt = `Jsi Svatbot - AI svatební kouč.

DŮLEŽITÉ PRAVIDLO FORMÁTOVÁNÍ:
- Používej markdown formátování pro lepší čitelnost
- Používej **tučné písmo** pro důležité informace (názvy, ceny, adresy)
- Používej odrážky (•) nebo číslované seznamy pro výčty
- Používej nadpisy (###) pro sekce
- Používej prázdné řádky mezi sekcemi
- Pro kontakty a odkazy používej formát: **Web**: [text](url)
- Používej emoji pro lepší vizuální orientaci (🏨, 📍, 💰, 📞, 🌐)

Příklad dobře formátované odpovědi:

### 🏨 Doporučené hotely

**1. Hotel Grandior**
• **Adresa**: Hlavní 123, Praha 1
• **Kapacita**: 50 pokojů
• **Cena**: 2 500 - 4 000 Kč/noc
• **Web**: [hotelgrandior.cz](https://hotelgrandior.cz)
• **Vybavení**: Restaurace, parkování, wellness

**2. Penzion U Lípy**
• **Adresa**: Lipová 45, Praha 5
• **Kapacita**: 15 pokojů
• **Cena**: 1 500 - 2 500 Kč/noc
• **Kontakt**: +420 123 456 789`
```

#### System prompt pro Hybrid
```typescript
const synthesisPrompt = `Jsi Svatbot - AI svatební kouč.

DŮLEŽITÉ PRAVIDLO FORMÁTOVÁNÍ:
- Používej markdown formátování pro lepší čitelnost
- Používej **tučné písmo** pro důležité informace
- Používej odrážky (•) nebo číslované seznamy
- Používej nadpisy (###) pro sekce
- Používej emoji (🏨, 📍, 💰, 📞, 🌐)

Poskytni personalizovanou odpověď, která kombinuje aktuální informace s kontextem uživatele.
DŮLEŽITÉ: Použij markdown formátování podle vzoru výše pro maximální čitelnost.`
```

#### Zvýšení max_tokens
```typescript
// PŘED:
max_tokens: 1000

// PO:
max_tokens: 1500  // Více prostoru pro formátované odpovědi
```

### 3. Aktualizace `src/components/ai/AIAssistant.tsx`

#### Import React Markdown
```typescript
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
```

#### Rendering s markdown
```typescript
{msg.role === 'user' ? (
  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
) : (
  <div className="text-sm prose prose-sm max-w-none
    prose-headings:text-gray-900 prose-headings:font-semibold prose-headings:mt-4 prose-headings:mb-2
    prose-h3:text-base prose-h3:flex prose-h3:items-center prose-h3:gap-2
    prose-p:text-gray-700 prose-p:my-2
    prose-strong:text-gray-900 prose-strong:font-semibold
    prose-ul:my-2 prose-ul:list-none prose-ul:pl-0
    prose-li:text-gray-700 prose-li:my-1 prose-li:pl-0
    prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
  ">
    <ReactMarkdown remarkPlugins={[remarkGfm]}>
      {msg.content}
    </ReactMarkdown>
  </div>
)}
```

### 4. Tailwind Typography plugin

Plugin už byl přidaný v `tailwind.config.js`:
```javascript
plugins: [
  require('@tailwindcss/forms'),
  require('@tailwindcss/typography'),  // ← Pro markdown styling
  require('@tailwindcss/aspect-ratio'),
]
```

## 📊 Příklady formátování

### Před upgradem:
```
Hotel Křiváň
Adresa: Třemošnice 123, Třemošnice, 538 43 (přibližně 20 minut autem od místa svatby)
Web: hotelkrivan.cz
Kapacita: Různé pokoje
Vybavení: Restaurace, parkování
Cenový rozsah: 1500 - 4000 Kč za noc
```

### Po upgradu:
```markdown
### 🏨 Hotel Křiváň

• **Adresa**: Třemošnice 123, Třemošnice, 538 43
• **Vzdálenost**: 20 minut autem od místa svatby
• **Web**: [hotelkrivan.cz](http://www.hotelkrivan.cz)
• **Kapacita**: Různé pokoje
• **Vybavení**: Restaurace, parkování
• **Cena**: 1 500 - 4 000 Kč/noc
```

### Renderované:

### 🏨 Hotel Křiváň

• **Adresa**: Třemošnice 123, Třemošnice, 538 43
• **Vzdálenost**: 20 minut autem od místa svatby
• **Web**: [hotelkrivan.cz](http://www.hotelkrivan.cz)
• **Kapacita**: Různé pokoje
• **Vybavení**: Restaurace, parkování
• **Cena**: 1 500 - 4 000 Kč/noc

## 🎨 Styling pravidla

### Prose classes (Tailwind Typography)

```css
prose prose-sm max-w-none
  prose-headings:text-gray-900        /* Nadpisy tmavě */
  prose-headings:font-semibold        /* Nadpisy tučně */
  prose-headings:mt-4                 /* Margin top */
  prose-headings:mb-2                 /* Margin bottom */
  
  prose-h3:text-base                  /* H3 velikost */
  prose-h3:flex                       /* Flex pro emoji */
  prose-h3:items-center               /* Vertikální zarovnání */
  prose-h3:gap-2                      /* Mezera mezi emoji a textem */
  
  prose-p:text-gray-700               /* Odstavce šedě */
  prose-p:my-2                        /* Margin vertical */
  
  prose-strong:text-gray-900          /* Tučné tmavě */
  prose-strong:font-semibold          /* Tučné písmo */
  
  prose-ul:my-2                       /* Seznamy margin */
  prose-ul:list-none                  /* Bez výchozích odrážek */
  prose-ul:pl-0                       /* Bez paddingu */
  
  prose-li:text-gray-700              /* Položky šedě */
  prose-li:my-1                       /* Margin mezi položkami */
  prose-li:pl-0                       /* Bez paddingu */
  
  prose-a:text-blue-600               /* Odkazy modře */
  prose-a:no-underline                /* Bez podtržení */
  hover:prose-a:underline             /* Podtržení při hover */
```

## 🧪 Testing

### Test 1: Základní formátování
```
Dotaz: "Najdi mi ubytování pro hosty v okolí Prahy"

Očekávaný výsledek:
- ✅ Nadpisy s emoji (### 🏨)
- ✅ Tučné názvy hotelů
- ✅ Odrážky (•) pro detaily
- ✅ Klikatelné odkazy
- ✅ Strukturované informace
```

### Test 2: Seznamy
```
Dotaz: "Jaké jsou trendy svatební dekorace 2025?"

Očekávaný výsledek:
- ✅ Číslované nebo odrážkové seznamy
- ✅ Tučné názvy trendů
- ✅ Popisky pod každým trendem
- ✅ Emoji pro kategorie
```

### Test 3: Odkazy
```
Dotaz: "Najdi mi svatební fotografy v Praze"

Očekávaný výsledek:
- ✅ Formát: **Web**: [text](url)
- ✅ Odkazy jsou modré
- ✅ Hover efekt (podtržení)
- ✅ Otevírají se v novém okně
```

## 📝 Markdown syntax podporovaný

### Nadpisy
```markdown
### 🏨 Nadpis úrovně 3
#### Nadpis úrovně 4
```

### Tučné písmo
```markdown
**Tučný text**
```

### Odrážky
```markdown
• Odrážka 1
• Odrážka 2
• Odrážka 3
```

### Číslované seznamy
```markdown
1. První položka
2. Druhá položka
3. Třetí položka
```

### Odkazy
```markdown
[Text odkazu](https://example.com)
**Web**: [hotelgrandior.cz](https://hotelgrandior.cz)
```

### Emoji
```markdown
🏨 Hotel
📍 Adresa
💰 Cena
📞 Kontakt
🌐 Web
✨ Vybavení
```

## ✅ Benefits

### Pro uživatele:
- ✅ **Lepší čitelnost** - Strukturované odpovědi
- ✅ **Rychlejší orientace** - Emoji a nadpisy
- ✅ **Klikatelné odkazy** - Přímý přístup k webům
- ✅ **Profesionální vzhled** - Pěkně formátované

### Pro AI:
- ✅ **Jasná pravidla** - System prompt s příklady
- ✅ **Konzistentní formát** - Vždy stejná struktura
- ✅ **Více prostoru** - 1500 tokenů místo 1000

## 🎉 Výsledek

**AI odpovědi jsou nyní krásně formátované!**

### Příklad reálné odpovědi:

**Dotaz**: "Najdi mi ubytování pro hosty v okolí naší svatby"

**Odpověď**:

### 🏨 Doporučené hotely v okolí Prahy

**1. Hotel Château Mcely** ⭐⭐⭐⭐⭐
• **Adresa**: Mcely 61, 289 36 Mcely
• **Vzdálenost**: 20 minut autem od místa svatby
• **Kapacita**: 10 pokojů (již rezervováno)
• **Cena**: 4 200 Kč/noc
• **Web**: [chateaumcely.cz](https://chateaumcely.cz)
• **Vybavení**: Wellness, restaurace, parkování

**2. Penzion U Lípy**
• **Adresa**: Lipová 45, Praha 5
• **Kapacita**: 10 pokojů (již rezervováno)
• **Vybavení**: Parkování, snídaně

### 🌟 Další doporučení

**3. Hotel Grandior**
• **Adresa**: Hlavní 123, Praha 1
• **Kapacita**: 50 pokojů
• **Cena**: 2 500 - 4 000 Kč/noc
• **Web**: [hotelgrandior.cz](https://hotelgrandior.cz)
• **Vybavení**: Restaurace, parkování, wellness

---

**Mnohem lepší než předtím!** 🎊

