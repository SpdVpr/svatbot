# 🧪 AI Chatbot - Testovací scénáře

## 📋 Přehled

Tento dokument obsahuje testovací scénáře pro ověření, že AI chatbot správně pracuje s reálnými daty uživatele.

## 🎯 Příprava testovacích dat

### 1. Vytvořte testovací svatbu s následujícími daty:

#### Hosté:
- **Jan Novák** - Vegetarián, alergie na ořechy
- **Marie Svobodová** - Bezlepková dieta
- **Petr Dvořák** - Bez omezení
- **Eva Nováková** - Veganská, alergie na laktózu
- **Tomáš Procházka** - Alergie na mořské plody

#### Rozpočet:
- **Místo konání**: 80 000 Kč (plánováno), 85 000 Kč (skutečnost)
- **Fotograf**: 25 000 Kč (plánováno), 25 000 Kč (skutečnost), 10 000 Kč (zaplaceno)
- **Catering**: 150 000 Kč (plánováno), 0 Kč (skutečnost)
- **Květiny**: 15 000 Kč (plánováno), 18 000 Kč (skutečnost)
- **Hudba**: 30 000 Kč (plánováno), 0 Kč (skutečnost)

#### Úkoly:
- **Rezervace místa** - Dokončeno
- **Objednání fotografa** - Dokončeno
- **Rozeslání pozvánek** - Po termínu (termín: před 2 týdny)
- **Výběr menu** - Čeká (termín: za 1 týden)
- **Objednání květin** - Čeká (termín: za 2 týdny)

## 🧪 Testovací scénáře

### Scénář 1: Dotazy na dietní omezení

#### Test 1.1: Obecný dotaz
**Otázka:** "Kdo z hostů má dietní omezení?"

**Očekávaná odpověď:**
- Měl by vypsat všechny hosty s dietními omezeními
- Jan Novák (vegetarián, alergie na ořechy)
- Marie Svobodová (bezlepková dieta)
- Eva Nováková (veganská, alergie na laktózu)
- Tomáš Procházka (alergie na mořské plody)

#### Test 1.2: Specifický dotaz
**Otázka:** "Kdo má alergii na lepek?"

**Očekávaná odpověď:**
- Marie Svobodová má bezlepkovou dietu

#### Test 1.3: Počet hostů
**Otázka:** "Kolik hostů má alergie?"

**Očekávaná odpověď:**
- 3 hosté mají alergie (Jan - ořechy, Eva - laktóza, Tomáš - mořské plody)

#### Test 1.4: Vegetariáni
**Otázka:** "Kteří hosté jsou vegetariáni nebo vegani?"

**Očekávaná odpověď:**
- Jan Novák (vegetarián)
- Eva Nováková (veganská)

---

### Scénář 2: Dotazy na rozpočet

#### Test 2.1: Celkový stav
**Otázka:** "Jsem v rámci rozpočtu?"

**Očekávaná odpověď:**
- Celkový rozpočet: 300 000 Kč
- Utraceno: 128 000 Kč (85k místo + 25k fotograf + 18k květiny)
- Zbývá: 172 000 Kč
- Překročení u místa konání (+5 000 Kč) a květin (+3 000 Kč)

#### Test 2.2: Největší výdaje
**Otázka:** "Jaké jsou moje největší výdaje?"

**Očekávaná odpověď:**
- Catering: 150 000 Kč (plánováno)
- Místo konání: 85 000 Kč (skutečnost)
- Hudba: 30 000 Kč (plánováno)
- Fotograf: 25 000 Kč

#### Test 2.3: Konkrétní položka
**Otázka:** "Kolik stojí fotograf?"

**Očekávaná odpověď:**
- Plánováno: 25 000 Kč
- Skutečnost: 25 000 Kč
- Zaplaceno: 10 000 Kč
- Zbývá zaplatit: 15 000 Kč

#### Test 2.4: Nezaplacené položky
**Otázka:** "Které položky ještě nejsou zaplacené?"

**Očekávaná odpověď:**
- Fotograf (zbývá 15 000 Kč)
- Catering (150 000 Kč)
- Květiny (18 000 Kč)
- Hudba (30 000 Kč)

---

### Scénář 3: Dotazy na úkoly

#### Test 3.1: Úkoly po termínu
**Otázka:** "Které úkoly jsou po termínu?"

**Očekávaná odpověď:**
- Rozeslání pozvánek (termín byl před 2 týdny)

#### Test 3.2: Časový plán
**Otázka:** "Stíhám všechno podle plánu?"

**Očekávaná odpověď:**
- 2 úkoly dokončeny (rezervace místa, fotograf)
- 1 úkol po termínu (pozvánky)
- 2 úkoly čekají (menu, květiny)
- Doporučení: Prioritně vyřešit rozeslání pozvánek

#### Test 3.3: Nadcházející úkoly
**Otázka:** "Co bych měl/a udělat jako další?"

**Očekávaná odpověď:**
- Nejdříve vyřešit rozeslání pozvánek (po termínu)
- Pak výběr menu (termín za 1 týden)
- Následně objednání květin (termín za 2 týdny)

#### Test 3.4: Dokončené úkoly
**Otázka:** "Jaké úkoly už mám hotové?"

**Očekávaná odpověď:**
- Rezervace místa konání
- Objednání fotografa

---

### Scénář 4: Kombinované dotazy

#### Test 4.1: Catering a alergie
**Otázka:** "Kolik hostů s alergiemi potvrdilo účast?"

**Očekávaná odpověď:**
- Měl by zkontrolovat RSVP status hostů s alergiemi
- Vypsat konkrétní čísla

#### Test 4.2: Rozpočet na catering
**Otázka:** "Mám dost rozpočtu na catering pro všechny hosty?"

**Očekávaná odpověď:**
- Plánovaný rozpočet na catering: 150 000 Kč
- Počet hostů: 5
- Cena na osobu: 30 000 Kč
- Analýza, zda je to realistické

#### Test 4.3: Celkové zhodnocení
**Otázka:** "Zhodnoť celkový stav mé svatby"

**Očekávaná odpověď:**
- Shrnutí hostů (5 hostů, 4 s dietními omezeními)
- Shrnutí rozpočtu (128k utraceno z 300k)
- Shrnutí úkolů (2 hotové, 1 po termínu, 2 čekají)
- Doporučení dalších kroků

---

### Scénář 5: Analytické dotazy

#### Test 5.1: Dietní omezení vs. catering
**Otázka:** "Jaké menu bych měl/a vybrat vzhledem k dietním omezením hostů?"

**Očekávaná odpověď:**
- Analýza dietních omezení
- Doporučení zahrnout vegetariánské, veganské a bezlepkové varianty
- Varování před ořechy, laktózou a mořskými plody

#### Test 5.2: Optimalizace rozpočtu
**Otázka:** "Kde můžu ušetřit?"

**Očekávaná odpověď:**
- Analýza položek, kde je překročení (místo, květiny)
- Doporučení, kde lze snížit náklady
- Porovnání s průměrnými cenami

#### Test 5.3: Prioritizace
**Otázka:** "Na co bych se měl/a teď zaměřit?"

**Očekávaná odpověď:**
- Priorita 1: Rozeslat pozvánky (po termínu)
- Priorita 2: Vybrat menu (termín za týden)
- Priorita 3: Doplatit fotografa
- Priorita 4: Objednat květiny

---

## ✅ Kritéria úspěchu

Pro každý test by měl chatbot:

1. **Přesnost dat**: Odpovědět na základě REÁLNÝCH dat, ne obecně
2. **Kompletnost**: Zahrnout všechny relevantní informace
3. **Kontext**: Pochopit kontext otázky a odpovědět relevantně
4. **Čeština**: Odpovídat v češtině s správnou gramatikou
5. **Praktičnost**: Poskytnout konkrétní, použitelná doporučení

## 🐛 Známé problémy

- [ ] AI může mít problém s českými znaky v jménech
- [ ] Při velkém množství dat může být odpověď zkrácená
- [ ] Některé komplexní dotazy mohou vyžadovat upřesnění

## 📝 Poznámky k testování

1. **Před testováním** se ujistěte, že máte v aplikaci vytvořená testovací data
2. **Během testování** sledujte, zda AI skutečně používá vaše data
3. **Po testování** zkontrolujte konzoli prohlížeče pro případné chyby
4. **Dokumentujte** případné problémy nebo neočekávané odpovědi

## 🚀 Další kroky

Po úspěšném otestování:
- [ ] Otestovat s reálnými uživatelskými daty
- [ ] Shromáždit feedback od uživatelů
- [ ] Vylepšit prompt na základě zjištění
- [ ] Přidat více příkladů do dokumentace

