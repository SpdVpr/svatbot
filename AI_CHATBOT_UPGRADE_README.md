# 🤖 AI Chatbot - Upgrade na přístup k reálným datům

## 📋 Přehled změn

AI chatbot v aplikaci svatbot.cz byl vylepšen, aby měl **plný přístup ke všem reálným datům uživatele** z Firebase. Nyní může poskytovat personalizované odpovědi na konkrétní otázky o svatbě.

## ✨ Co je nového

### 🎯 Hlavní funkce

1. **Přístup k detailním informacím o hostech**
   - Seznam všech hostů s RSVP statusem
   - Dietní omezení a alergie každého hosta
   - Potřeba ubytování
   - Poznámky k jednotlivým hostům

2. **Přístup k rozpočtu**
   - Všechny rozpočtové položky s detaily
   - Plánované vs. skutečné částky
   - Zaplacené částky a zbývající platby
   - Dodavatelé a kategorie

3. **Přístup k úkolům**
   - Všechny úkoly s jejich statusem
   - Úkoly po termínu
   - Čekající úkoly s termíny
   - Dokončené úkoly

4. **Statistiky a analýzy**
   - Automatické výpočty statistik
   - Procento využití rozpočtu
   - Počet hostů s dietními omezeními
   - Počet úkolů po termínu

### 💬 Příklady otázek

Uživatel se nyní může ptát:

**O hostech:**
- "Kdo z hostů má alergii na lepek?"
- "Kolik hostů má dietní omezení?"
- "Kteří hosté jsou vegetariáni?"

**O rozpočtu:**
- "Kolik jsem už utratil/a?"
- "Jsem v rámci rozpočtu?"
- "Kolik stojí fotograf?"

**O úkolech:**
- "Které úkoly jsou po termínu?"
- "Stíhám všechno podle plánu?"
- "Co bych měl/a udělat jako další?"

**Analytické:**
- "Zhodnoť celkový stav mé svatby"
- "Jaké menu vybrat vzhledem k alergiám?"
- "Kde můžu ušetřit?"

## 🔧 Technické změny

### Upravené soubory

1. **`src/lib/ai-client.ts`**
   - Rozšířen interface `AIWeddingContext` o detailní data
   - Přidány typy pro hosty, rozpočet, úkoly
   - Přidány statistiky

2. **`src/hooks/useAI.ts`**
   - Vylepšena funkce `buildContext()` pro sběr všech dat
   - Automatický výpočet statistik
   - Inteligentní quick suggestions na základě dat

3. **`src/app/api/ai/chat/route.ts`**
   - Nová funkce `buildDetailedContext()` pro formátování dat
   - Rozšířený system prompt s instrukcemi pro práci s daty
   - Zvýšený limit tokenů na 1000 pro detailnější odpovědi

4. **`src/lib/openai.ts`**
   - Aktualizován pro konzistenci s `ai-client.ts`
   - Označen jako deprecated (použít `ai-client.ts`)

5. **`src/app/ai/page.tsx`**
   - Přidán informační panel o dostupných datech
   - Zobrazení statistik (hosté, rozpočet, úkoly)
   - Příklady otázek pro uživatele

### Nové soubory

1. **`docs/AI_CHATBOT_ENHANCED.md`**
   - Kompletní dokumentace vylepšeného chatbota
   - Příklady otázek podle kategorií
   - Technická dokumentace

2. **`docs/AI_CHATBOT_TEST_SCENARIOS.md`**
   - Testovací scénáře pro ověření funkčnosti
   - Očekávané odpovědi
   - Kritéria úspěchu

3. **`AI_CHATBOT_UPGRADE_README.md`**
   - Tento soubor - přehled změn

## 📊 Struktura kontextu

```typescript
interface AIWeddingContext {
  // Základní info
  budget?: number
  guestCount?: number
  weddingDate?: Date
  location?: string
  style?: string
  
  // Detailní data
  guests?: Guest[]              // Všichni hosté
  budgetItems?: BudgetItem[]    // Rozpočtové položky
  currentTasks?: Task[]         // Úkoly
  timelineEvents?: TimelineEvent[]
  vendors?: Vendor[]
  
  // Statistiky
  guestStats?: {
    total: number
    confirmed: number
    declined: number
    pending: number
    withDietaryRestrictions: number
    needingAccommodation: number
  }
  
  budgetStats?: {
    totalBudget: number
    totalSpent: number
    totalPaid: number
    remaining: number
    percentageSpent: number
  }
  
  taskStats?: {
    total: number
    completed: number
    pending: number
    overdue: number
  }
}
```

## 🎨 UI vylepšení

### Informační panel na AI stránce

Nový panel zobrazuje:
- ✅ Počet hostů a hostů s dietními omezeními
- ✅ Počet rozpočtových položek a procento využití
- ✅ Počet úkolů a úkolů po termínu
- ✅ Příklady otázek, které lze položit

Panel je zavíratelný a zobrazuje se při prvním načtení stránky.

### Quick suggestions

Quick suggestions jsou nyní inteligentní:
- Zobrazují se na základě dostupných dat
- Prioritizují aktuální problémy (úkoly po termínu, dietní omezení)
- Kombinují data-specifické a time-based návrhy

## 🚀 Jak to vyzkoušet

1. **Přihlaste se** do aplikace
2. **Vytvořte testovací data**:
   - Přidejte hosty s dietními omezeními
   - Vytvořte rozpočtové položky
   - Přidejte úkoly s termíny
3. **Otevřete AI chat** (floating button nebo `/ai`)
4. **Zeptejte se** na konkrétní informace:
   - "Kdo má alergii na lepek?"
   - "Jsem v rozpočtu?"
   - "Které úkoly jsou po termínu?"

## 📈 Výhody pro uživatele

### Před upgradem:
- ❌ AI poskytovalo pouze obecné rady
- ❌ Uživatel musel hledat informace v seznamech
- ❌ Žádná personalizace na základě dat

### Po upgradu:
- ✅ AI odpovídá na základě reálných dat
- ✅ Okamžité odpovědi na konkrétní otázky
- ✅ Inteligentní analýza celkového stavu svatby
- ✅ Personalizovaná doporučení
- ✅ Úspora času při hledání informací

## 🔐 Bezpečnost

- ✅ Data se posílají pouze na OpenAI API (šifrovaně)
- ✅ Žádná data se neukládají na straně OpenAI
- ✅ Každý uživatel vidí pouze svá data
- ✅ Firebase Security Rules zajišťují izolaci dat

## 🧪 Testování

Viz soubor `docs/AI_CHATBOT_TEST_SCENARIOS.md` pro kompletní testovací scénáře.

### Rychlý test:

1. Přidejte hosta s alergií na lepek
2. Zeptejte se: "Kdo má alergii na lepek?"
3. AI by měl odpovědět jménem konkrétního hosta

## 📝 Známá omezení

1. **Token limit**: Při velmi velkém množství dat (100+ hostů) může být kontext zkrácen
2. **Jazyková podpora**: Optimalizováno pro češtinu
3. **OpenAI API**: Vyžaduje platný API klíč v `.env.local`

## 🔮 Budoucí vylepšení

### Plánované funkce:
- [ ] Integrace s timeline událostmi
- [ ] Přístup k dodavatelům z marketplace
- [ ] Analýza seating plánu
- [ ] Proaktivní upozornění (AI samo upozorní na problémy)
- [ ] Export analýz do PDF
- [ ] Hlasové ovládání
- [ ] Doporučení na základě historie podobných svateb

### Možná vylepšení:
- [ ] Caching častých dotazů
- [ ] Podpora více jazyků
- [ ] Integrace s kalendářem
- [ ] Automatické generování reportů

## 🎯 Závěr

AI chatbot je nyní plně funkční a poskytuje **reálnou hodnotu** uživatelům tím, že:
- Odpovídá na konkrétní otázky o jejich svatbě
- Analyzuje jejich data a poskytuje personalizovaná doporučení
- Šetří čas při hledání informací
- Pomáhá s rozhodováním na základě faktů

**Zkuste se zeptat na cokoliv o vaší svatbě - AI má všechny odpovědi! 🎉**

---

## 📞 Podpora

Pokud narazíte na problémy nebo máte návrhy na vylepšení:
1. Zkontrolujte konzoli prohlížeče pro chyby
2. Ověřte, že máte OpenAI API klíč v `.env.local`
3. Zkontrolujte, že máte data v Firebase
4. Otevřete issue na GitHubu s detailním popisem problému

## 📚 Dokumentace

- **Hlavní dokumentace**: `docs/AI_CHATBOT_ENHANCED.md`
- **Testovací scénáře**: `docs/AI_CHATBOT_TEST_SCENARIOS.md`
- **AI Features**: `AI_FEATURES_IMPLEMENTATION.md`

