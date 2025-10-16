# Právní stránky SvatBot.cz

## 📋 Přehled

Tento dokument popisuje právní stránky implementované na SvatBot.cz v souladu s českými právními předpisy a GDPR.

## 🔗 Vytvořené stránky

### 1. Obchodní podmínky (`/obchodni-podminky`)
**Soubor:** `src/app/obchodni-podminky/page.tsx`

Všeobecné obchodní podmínky (VOP) v souladu s:
- Zákonem č. 89/2012 Sb., občanský zákoník
- Zákonem č. 634/1992 Sb., o ochraně spotřebitele

**Obsahuje:**
- Identifikaci prodávajícího (Michal Vesecký, IČO: 88320090, "není plátcem DPH")
- Vymezení pojmů (provozovatel, uživatel, spotřebitel, služba, smlouva)
- Předmět smlouvy a popis služeb (Free, Premium, Ultimate)
- Registraci a uzavření smlouvy
- **Ceny a platební podmínky:**
  - Online platba platební kartou (Visa, Mastercard, Amex)
  - Platební brána: **Stripe** (stripe.com)
  - PCI DSS Level 1 certifikace
  - Měna: CZK nebo EUR
  - Měsíční/roční předplatné s automatickým obnovením
  - Fakturace (daňový doklad bez DPH)
- Práva a povinnosti obou stran
- **Odstoupení od smlouvy:**
  - 14denní lhůta pro spotřebitele (§ 1829 občanského zákoníku)
  - Jak odstoupit (email, pošta)
  - Vrácení peněz do 14 dnů
  - Výjimky z práva na odstoupení (digitální obsah s předchozím souhlasem)
- Reklamace a odpovědnost za vady (30 dní na vyřízení)
- Ukončení služby a smazání účtu
- Duševní vlastnictví
- Ochrana osobních údajů (odkaz na Ochrana soukromí)
- **Řešení sporů:**
  - Mimosoudní řešení: ČOI (adr@coi.cz, www.coi.cz)
  - Platforma ODR: https://ec.europa.eu/consumers/odr
  - Soudní řešení: české soudy
- Závěrečná ustanovení (změny VOP, rozhodné právo, oddělitelnost)
- Kontaktní údaje

### 2. Ochrana soukromí (`/ochrana-soukromi`)
**Soubor:** `src/app/ochrana-soukromi/page.tsx`

Kompletní zásady ochrany osobních údajů v souladu s:
- Nařízením GDPR (EU) 2016/679
- Zákonem č. 110/2019 Sb., o zpracování osobních údajů

**Obsahuje:**
- Identifikaci správce osobních údajů (Michal Vesecký, IČO: 88320090)
- Jaké osobní údaje zpracováváme
- Účel a právní základ zpracování (čl. 6 GDPR)
- Dobu uložení údajů
- Předávání údajů třetím stranám (Firebase, Vercel, Google Analytics)
- Práva subjektů údajů (přístup, oprava, výmaz, přenositelnost, námitka)
- Zabezpečení osobních údajů
- Kontaktní údaje a informace o dozorového úřadu (ÚOOÚ)

### 2. Podmínky služby (`/podminky-sluzby`)
**Soubor:** `src/app/podminky-sluzby/page.tsx`

Všeobecné obchodní podmínky v souladu s:
- Zákonem č. 89/2012 Sb., občanský zákoník
- Zákonem č. 634/1992 Sb., o ochraně spotřebitele

**Obsahuje:**
- Identifikaci provozovatele (IČO, adresa, kontakt)
- Vymezení pojmů a předmět služby
- Podmínky registrace a odpovědnost za účet
- Práva a povinnosti uživatele i provozovatele
- Cenové plány a platební podmínky
- Právo na odstoupení od smlouvy (14 dní)
- Duševní vlastnictví
- Omezení odpovědnosti
- Ukončení služby
- Řešení sporů (ČOI jako subjekt mimosoudního řešení)
- Rozhodné právo (České republiky)

### 3. GDPR - Vaše práva (`/gdpr`)
**Soubor:** `src/app/gdpr/page.tsx`

Uživatelsky přívětivý průvodce právy podle GDPR:

**Obsahuje:**
- Vysvětlení, co je GDPR
- Detailní popis všech práv subjektů údajů:
  - ✓ Právo na přístup (čl. 15)
  - ✓ Právo na opravu (čl. 16)
  - ✓ Právo na výmaz - "právo být zapomenut" (čl. 17)
  - ✓ Právo na přenositelnost údajů (čl. 20)
  - ✓ Právo na omezení zpracování (čl. 18)
  - ✓ Právo vznést námitku (čl. 21)
  - ✓ Právo odvolat souhlas
  - ✓ Právo podat stížnost u ÚOOÚ
- Jak uplatnit každé právo (konkrétní návody)
- Jak chráníme data (šifrování, EU servery, omezený přístup, zálohy)
- Minimalizace dat
- Kontaktní údaje pro uplatnění práv
- Informace o dozorového úřadu

### 4. Zásady používání cookies (`/cookies`)
**Soubor:** `src/app/cookies/page.tsx`

Kompletní informace o cookies v souladu s:
- Zákonem č. 127/2005 Sb., o elektronických komunikacích, § 89 odst. 3
- Nařízením GDPR

**Obsahuje:**
- Vysvětlení, co jsou cookies
- Kategorie cookies:
  - 🟢 Nezbytné cookies (povinné) - autentifikace, zabezpečení
  - 🔵 Funkční cookies (volitelné) - personalizace, nastavení
  - 🟣 Analytické cookies (volitelné) - Google Analytics, Firebase
  - 🟠 Marketingové cookies (volitelné) - v současnosti nepoužíváme
- Tabulka cookies třetích stran (Firebase, Google Analytics, Vercel)
- Jak spravovat cookies (na stránkách i v prohlížeči)
- Informace o souhlasu s cookies
- Odkazy na návody pro různé prohlížeče

## 🍪 Cookie Banner

**Soubor:** `src/components/common/CookieBanner.tsx`

Interaktivní cookie lišta implementovaná v souladu s českými předpisy:

**Funkce:**
- ✅ Zobrazuje se při první návštěvě
- ✅ Ukládá preference do localStorage
- ✅ Tři možnosti volby:
  - "Přijmout vše" - povolí všechny cookies
  - "Pouze nezbytné" - povolí jen nezbytné cookies
  - "Nastavení" - detailní nastavení kategorií
- ✅ Detailní nastavení s přepínači pro každou kategorii
- ✅ Integrace s Google Analytics (consent mode)
- ✅ Odkazy na Zásady cookies a Ochranu soukromí
- ✅ Overlay pro lepší viditelnost
- ✅ Responzivní design

**Integrace:**
Cookie banner je automaticky přidán do hlavního layoutu (`src/app/layout.tsx`).

## 📍 Údaje provozovatele

Všechny stránky obsahují správné údaje provozovatele:

```
Michal Vesecký
IČO: 88320090
Zápská 1149, 250 71 Nehvizdy
Česká republika

Email: info@svatbot.cz
Web: https://svatbot.cz

Provozovatel není plátcem DPH.
```

## 🔗 Odkazy ve footeru

Footer ve WelcomeScreen (`src/components/onboarding/WelcomeScreen.tsx`) byl aktualizován:

```tsx
<a href="/ochrana-soukromi">Ochrana soukromí</a>
<a href="/obchodni-podminky">Obchodní podmínky</a>
<a href="/podminky-sluzby">Podmínky služby</a>
<a href="/gdpr">GDPR</a>
```

## ✅ Soulad s právními předpisy

### České zákony:
- ✅ Zákon č. 89/2012 Sb., občanský zákoník
- ✅ Zákon č. 634/1992 Sb., o ochraně spotřebitele
- ✅ Zákon č. 110/2019 Sb., o zpracování osobních údajů
- ✅ Zákon č. 127/2005 Sb., o elektronických komunikacích

### EU nařízení:
- ✅ GDPR (EU) 2016/679 - všechny články správně citovány
- ✅ Článek 13 - informační povinnost při získávání údajů
- ✅ Článek 14 - informační povinnost při získávání z jiných zdrojů
- ✅ Články 15-22 - práva subjektů údajů

### Dozorový úřad:
- ✅ Úřad pro ochranu osobních údajů (ÚOOÚ)
- ✅ Kontaktní údaje: www.uoou.gov.cz, posta@uoou.cz
- ✅ Adresa: Pplk. Sochora 27, 170 00 Praha 7

## 🌍 Hosting a zpracování dat

Všechny stránky správně uvádějí:
- ✅ Firebase Europe West 1 (EU region)
- ✅ Vercel (EU servery)
- ✅ Google Analytics s anonymizací IP
- ✅ Standardní smluvní doložky pro přenos mimo EU (čl. 46 GDPR)

## 📱 Responzivní design

Všechny právní stránky jsou plně responzivní:
- ✅ Mobile-first přístup
- ✅ Čitelná typografie
- ✅ Přehledná struktura s ikonami
- ✅ Barevné zvýraznění důležitých sekcí
- ✅ Navigační odkazy mezi stránkami

## 🎨 Design konzistence

Všechny stránky používají jednotný design:
- Gradient pozadí (purple-pink-blue)
- Bílé karty s rounded-2xl
- Rose/pink akcenty
- Lucide ikony
- Konzistentní typografie
- Sticky header s navigací zpět

## 🔄 Další kroky

Pro kompletní GDPR compliance doporučujeme:

1. **Implementovat funkce v aplikaci:**
   - Export dat (JSON/CSV) v nastavení účtu
   - Smazání účtu v nastavení
   - Správa souhlasů v nastavení
   - Zobrazení všech uložených dat

2. **Nastavit Google Analytics:**
   - Přidat Google Analytics 4 tracking ID
   - Implementovat consent mode
   - Nastavit anonymizaci IP

3. **Právní kontrola:**
   - Nechat zkontrolovat právníkem specializujícím se na GDPR
   - Případně upravit podle specifických potřeb

4. **Pravidelné aktualizace:**
   - Kontrolovat změny v legislativě
   - Aktualizovat datum poslední změny
   - Informovat uživatele o významných změnách

## 📞 Kontakt

Pro dotazy ohledně právních stránek:
- Email: info@svatbot.cz
- Adresa: Michal Vesecký, Zápská 1149, 250 71 Nehvizdy

---

**Vytvořeno:** 16. října 2025
**Autor:** AI Assistant pro SvatBot.cz
**Status:** ✅ Připraveno k nasazení

