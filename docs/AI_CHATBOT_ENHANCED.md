# 🤖 Vylepšený AI Chatbot - Přístup k reálným datům

## 📋 Přehled

AI chatbot v aplikaci svatbot.cz má nyní přístup ke **všem reálným datům** uživatele z Firebase. To znamená, že může poskytovat personalizované odpovědi na základě skutečných informací o svatbě.

## 🎯 Co chatbot vidí

### 1. **Základní informace o svatbě**
- Datum svatby
- Lokace
- Styl svatby
- Celkový rozpočet
- Počet hostů

### 2. **Detailní informace o hostech**
- Seznam všech hostů
- RSVP status (potvrzeno/odmítnuto/čeká)
- **Dietní omezení a alergie** každého hosta
- Potřeba ubytování
- Poznámky k jednotlivým hostům

### 3. **Rozpočet**
- Celkový rozpočet a jeho využití
- Všechny rozpočtové položky s detaily:
  - Plánovaná částka
  - Skutečná částka
  - Zaplacená částka
  - Dodavatel
  - Kategorie
- Zbývající rozpočet
- Procento využití rozpočtu

### 4. **Úkoly**
- Celkový počet úkolů
- Dokončené úkoly
- Čekající úkoly
- **Úkoly po termínu**
- Detaily jednotlivých úkolů s termíny

### 5. **Statistiky**
- Statistiky hostů (potvrzeno, odmítnuto, čeká)
- Statistiky rozpočtu (utraceno, zbývá)
- Statistiky úkolů (dokončeno, čeká, po termínu)

## 💬 Příklady otázek, které můžete položit

### 🍽️ Otázky o hostech a dietních omezeních

```
"Kdo z hostů má alergii na lepek?"
"Kolik hostů má dietní omezení?"
"Kteří hosté jsou vegetariáni?"
"Kdo potřebuje bezlepkové menu?"
"Kolik hostů má alergii na ořechy?"
"Kdo z hostů má speciální dietní požadavky?"
"Jaké dietní omezení má Jan Novák?"
"Kolik hostů potřebuje ubytování?"
"Kteří hosté ještě nepotvrdili účast?"
```

### 💰 Otázky o rozpočtu

```
"Kolik jsem už utratil/a?"
"Kolik mi zbývá z rozpočtu?"
"Jaké jsou moje největší výdaje?"
"Kolik stojí fotograf?"
"Které položky jsou nejdražší?"
"Jsem v rámci rozpočtu?"
"Kolik procent rozpočtu jsem využil/a?"
"Které položky ještě nejsou zaplacené?"
"Kolik mám zaplatit za catering?"
"Jsou všechny položky rozpočtu adekvátní?"
```

### ✅ Otázky o úkolech a časovém plánu

```
"Jaké úkoly mám nesplněné?"
"Které úkoly jsou po termínu?"
"Co bych měl/a udělat jako další?"
"Stíhám všechno podle plánu?"
"Kolik úkolů mi zbývá?"
"Které úkoly jsou nejdůležitější?"
"Co musím udělat tento týden?"
"Mám nějaké úkoly po termínu?"
"Zhodnoť můj časový plán"
"Jsem na dobré cestě s přípravami?"
```

### 📊 Analytické otázky

```
"Zhodnoť celkový stav mé svatby"
"Jaké jsou moje největší výzvy?"
"Na co bych se měl/a zaměřit?"
"Jsem dobře připraven/a?"
"Co mi chybí v přípravách?"
"Jaké jsou moje priority?"
"Kde můžu ušetřit?"
"Kde bych měl/a investovat více?"
"Analyzuj můj rozpočet"
"Porovnej můj rozpočet s průměrem"
```

### 🎯 Kombinované otázky

```
"Kolik hostů s dietními omezeními potvrdilo účast?"
"Mám dost rozpočtu na všechny hosty?"
"Stíhám všechno a jsem v rozpočtu?"
"Jaké úkoly souvisí s cateringem pro hosty s alergiemi?"
"Kolik mě bude stát catering pro všechny potvrzené hosty?"
```

## 🔧 Technická implementace

### Struktura kontextu

```typescript
interface AIWeddingContext {
  // Základní info
  budget?: number
  guestCount?: number
  weddingDate?: Date
  location?: string
  style?: string
  
  // Detailní data
  guests?: Guest[]              // Všichni hosté s detaily
  budgetItems?: BudgetItem[]    // Všechny rozpočtové položky
  currentTasks?: Task[]         // Všechny úkoly
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

### Jak to funguje

1. **Hook `useAI`** sbírá všechna data z Firebase pomocí existujících hooků:
   - `useWedding()` - základní info o svatbě
   - `useGuest()` - všichni hosté
   - `useBudget()` - rozpočet a položky
   - `useTask()` - úkoly

2. **Funkce `buildContext()`** vytvoří kompletní kontext včetně statistik

3. **API endpoint `/api/ai/chat`** zpracuje kontext a vytvoří detailní prompt pro OpenAI:
   - Základní informace
   - Statistiky hostů
   - Seznam hostů s dietními omezeními
   - Seznam hostů potřebujících ubytování
   - Rozpočtové statistiky
   - Detaily rozpočtových položek
   - Statistiky úkolů
   - Úkoly po termínu
   - Čekající úkoly

4. **OpenAI GPT-4o-mini** dostane všechna tato data a může na jejich základě odpovídat

## 🎨 Uživatelské rozhraní

Chatbot je dostupný:
- **Floating button** v pravém dolním rohu (na všech stránkách)
- **Dedikovaná stránka** `/ai` s plnou obrazovkou
- **Dashboard** - rychlý přístup k AI asistentovi

## 🚀 Výhody

### Pro uživatele:
- ✅ Okamžité odpovědi na konkrétní otázky
- ✅ Nemusí hledat v seznamech a tabulkách
- ✅ Inteligentní analýza celkového stavu svatby
- ✅ Personalizovaná doporučení
- ✅ Rychlé zjištění kritických informací

### Příklady použití:
- 🍽️ Kuchař se ptá: "Kolik hostů má alergii na lepek?" → Okamžitá odpověď
- 💰 Kontrola rozpočtu: "Jsem v rámci rozpočtu?" → Detailní analýza
- ⏰ Časový plán: "Stíhám všechno?" → Zhodnocení s doporučeními
- 📊 Celkový přehled: "Zhodnoť stav mé svatby" → Komplexní analýza

## 🔐 Bezpečnost a soukromí

- ✅ Data se posílají pouze na OpenAI API (šifrovaně)
- ✅ Žádná data se neukládají na straně OpenAI (nastavení API)
- ✅ Každý uživatel vidí pouze svá data
- ✅ Firebase Security Rules zajišťují izolaci dat mezi uživateli

## 📈 Budoucí vylepšení

### Plánované funkce:
- [ ] Integrace s timeline událostmi
- [ ] Přístup k dodavatelům z marketplace
- [ ] Analýza seating plánu
- [ ] Doporučení na základě historie podobných svateb
- [ ] Export analýz do PDF
- [ ] Hlasové ovládání
- [ ] Proaktivní upozornění (AI samo upozorní na problémy)

## 🎯 Závěr

AI chatbot je nyní plně funkční a má přístup ke všem reálným datům uživatele. Může poskytovat personalizované odpovědi na konkrétní otázky a pomáhat s plánováním svatby na základě skutečných informací, ne jen obecných rad.

**Zkuste se zeptat na cokoliv o vaší svatbě - AI má všechny odpovědi! 🎉**

