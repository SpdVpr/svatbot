# 📁 Demo Account Files Overview

Přehled všech souborů souvisejících s demo účtem.

## 📂 Struktura souborů

```
svatbot/
├── DEMO_ACCOUNT_SETUP.md          # Hlavní dokumentace (root)
├── package.json                    # Přidány npm skripty
└── scripts/
    ├── create-demo-account.js      # Hlavní skript pro vytvoření demo účtu
    ├── delete-demo-account.js      # Skript pro smazání demo účtu
    ├── update-demo-data.js         # Skript pro aktualizaci dat
    ├── README.md                   # Detailní dokumentace
    ├── QUICK_START.md              # Rychlý průvodce
    ├── DEMO_DATA_OVERVIEW.md       # Přehled všech dat
    ├── IMAGE_SOURCES.md            # Zdroje obrázků
    ├── PRESENTATION_CHECKLIST.md   # Checklist pro prezentaci
    └── FILES_OVERVIEW.md           # Tento soubor
```

## 📄 Popis souborů

### Skripty (JavaScript)

#### `create-demo-account.js` ⭐ HLAVNÍ SKRIPT
**Účel:** Vytvoření kompletního demo účtu s všemi daty

**Co dělá:**
- Vytvoří uživatele v Firebase Authentication
- Vytvoří svatební profil
- Naplní všechny moduly demo daty:
  - 👥 3 hosté
  - 📋 3 úkoly
  - 🏨 2 ubytování s pokoji a obrázky
  - 🎨 6 moodboard obrázků
  - 🍽️ 2 jídla + 2 nápoje
  - 👔 2 dodavatelé s portfolii
  - 🎵 Hudební playlist
  - 📝 2 poznámky
  - 📅 Timeline a harmonogram

**Spuštění:**
```bash
npm run demo:create
# nebo
node scripts/create-demo-account.js
```

**Velikost:** ~930 řádků
**Závislosti:** firebase-admin

---

#### `delete-demo-account.js`
**Účel:** Smazání demo účtu a všech souvisejících dat

**Co dělá:**
- Najde demo uživatele
- Smaže všechna data ze všech kolekcí
- Smaže svatební profil
- Smaže uživatele z Authentication

**Spuštění:**
```bash
npm run demo:delete
# nebo
node scripts/delete-demo-account.js
```

**Velikost:** ~130 řádků
**Varování:** Nevratná operace!

---

#### `update-demo-data.js`
**Účel:** Aktualizace dat v existujícím demo účtu

**Co dělá:**
- Najde existující demo účet
- Smaže stará data
- Aktualizuje svatební profil
- Zachová user ID a wedding ID

**Spuštění:**
```bash
npm run demo:update
# nebo
node scripts/update-demo-data.js
```

**Velikost:** ~150 řádků
**Poznámka:** Pro plnou aktualizaci použijte `create-demo-account.js`

---

### Dokumentace (Markdown)

#### `DEMO_ACCOUNT_SETUP.md` (root) ⭐ HLAVNÍ DOKUMENTACE
**Účel:** Kompletní průvodce setupem demo účtu

**Obsah:**
- Rychlý start
- Co obsahuje demo účet
- Instalace a spuštění
- Dostupné příkazy
- Struktura dat
- Obrázky a media
- Řešení problémů
- Tipy pro prezentaci

**Umístění:** Root adresář projektu
**Velikost:** ~300 řádků
**Pro koho:** Všichni uživatelé

---

#### `README.md` (scripts/)
**Účel:** Detailní dokumentace pro vývojáře

**Obsah:**
- Přehled demo účtu
- Použití všech skriptů
- Požadavky a instalace
- Struktura dat
- Údržba a aktualizace
- Řešení problémů

**Umístění:** `scripts/`
**Velikost:** ~200 řádků
**Pro koho:** Vývojáři

---

#### `QUICK_START.md` ⭐ RYCHLÝ PRŮVODCE
**Účel:** Rychlý start pro nové uživatele

**Obsah:**
- Rychlé příkazy
- Krok za krokem průvodce
- Stažení Service Account Key
- Testování
- Řešení problémů
- Tipy pro prezentaci

**Umístění:** `scripts/`
**Velikost:** ~250 řádků
**Pro koho:** Noví uživatelé, prezentující

---

#### `DEMO_DATA_OVERVIEW.md`
**Účel:** Detailní přehled všech dat v demo účtu

**Obsah:**
- Kompletní seznam všech dat
- Svatební profil
- Hosté (3)
- Úkoly (3)
- Ubytování (2 zařízení, 2 pokoje)
- Moodboard (6 obrázků)
- Menu (2 jídla, 2 nápoje)
- Dodavatelé (2)
- Hudba
- Poznámky (2)
- Timeline
- Statistiky

**Umístění:** `scripts/`
**Velikost:** ~350 řádků
**Pro koho:** Prezentující, testeři

---

#### `IMAGE_SOURCES.md`
**Účel:** Přehled všech obrázků a jejich zdrojů

**Obsah:**
- Aktuálně použité obrázky
- Alternativní obrázky
- Jak najít nové obrázky
- Jak vyměnit obrázky
- Tipy pro výběr obrázků
- Doporučené kategorie

**Umístění:** `scripts/`
**Velikost:** ~300 řádků
**Pro koho:** Designéři, správci obsahu

---

#### `PRESENTATION_CHECKLIST.md` ⭐ CHECKLIST
**Účel:** Checklist pro přípravu prezentace

**Obsah:**
- Před prezentací (15 minut)
- Kontrola všech modulů
- Kontrola obrázků
- Scénář prezentace
- Tipy pro prezentaci
- Řešení problémů během prezentace
- Po prezentaci
- Rychlá kontrola (2 minuty)

**Umístění:** `scripts/`
**Velikost:** ~350 řádků
**Pro koho:** Prezentující

---

#### `FILES_OVERVIEW.md`
**Účel:** Tento soubor - přehled všech souborů

**Obsah:**
- Struktura souborů
- Popis každého souboru
- Kdy použít který soubor
- Doporučené workflow

**Umístění:** `scripts/`
**Pro koho:** Všichni uživatelé

---

### Konfigurace

#### `package.json` (upraveno)
**Přidané skripty:**
```json
{
  "scripts": {
    "demo:create": "node scripts/create-demo-account.js",
    "demo:delete": "node scripts/delete-demo-account.js",
    "demo:update": "node scripts/update-demo-data.js"
  }
}
```

---

## 🎯 Kdy použít který soubor

### Chci rychle vytvořit demo účet
→ `QUICK_START.md` + `npm run demo:create`

### Chci detailní informace o demo účtu
→ `DEMO_ACCOUNT_SETUP.md` (root)

### Chci vědět, co obsahuje demo účet
→ `DEMO_DATA_OVERVIEW.md`

### Připravuji prezentaci
→ `PRESENTATION_CHECKLIST.md`

### Chci vyměnit obrázky
→ `IMAGE_SOURCES.md`

### Chci upravit demo data
→ `create-demo-account.js` (editovat)

### Chci smazat demo účet
→ `npm run demo:delete`

### Mám technický problém
→ `README.md` (scripts/) nebo `DEMO_ACCOUNT_SETUP.md`

---

## 📊 Statistiky

### Celkový počet souborů: 9
- **Skripty:** 3 (JavaScript)
- **Dokumentace:** 6 (Markdown)

### Celkový počet řádků: ~2,500+
- **Kód:** ~1,200 řádků
- **Dokumentace:** ~1,300 řádků

### Velikost dat v demo účtu: 30+ položek
- **Hosté:** 3
- **Úkoly:** 3
- **Ubytování:** 2 zařízení, 2 pokoje
- **Moodboard:** 6 obrázků
- **Menu:** 4 položky
- **Dodavatelé:** 2
- **Hudba:** 2 kategorie
- **Poznámky:** 2
- **Timeline:** 7 položek

### Obrázky: 17 URL
- **Ubytování:** 7
- **Moodboard:** 6
- **Portfolio:** 4

---

## 🔄 Doporučené workflow

### Pro první použití:
1. Přečtěte `QUICK_START.md`
2. Spusťte `npm run demo:create`
3. Přihlaste se a prozkoumejte

### Pro prezentaci:
1. Přečtěte `PRESENTATION_CHECKLIST.md`
2. Spusťte `npm run demo:delete && npm run demo:create`
3. Zkontrolujte všechny moduly
4. Prezentujte

### Pro údržbu:
1. Upravte `create-demo-account.js`
2. Spusťte `npm run demo:delete && npm run demo:create`
3. Otestujte změny

### Pro výměnu obrázků:
1. Najděte nové obrázky (viz `IMAGE_SOURCES.md`)
2. Upravte URL v `create-demo-account.js`
3. Spusťte `npm run demo:delete && npm run demo:create`

---

## 📚 Doporučené pořadí čtení

### Pro nové uživatele:
1. `QUICK_START.md` - Rychlý start
2. `DEMO_ACCOUNT_SETUP.md` - Kompletní průvodce
3. `DEMO_DATA_OVERVIEW.md` - Co obsahuje demo účet

### Pro prezentující:
1. `PRESENTATION_CHECKLIST.md` - Checklist
2. `DEMO_DATA_OVERVIEW.md` - Přehled dat
3. `QUICK_START.md` - Rychlá příprava

### Pro vývojáře:
1. `README.md` (scripts/) - Technická dokumentace
2. `create-demo-account.js` - Zdrojový kód
3. `IMAGE_SOURCES.md` - Správa obrázků

---

## 🔗 Odkazy mezi soubory

```
DEMO_ACCOUNT_SETUP.md (root)
├── → QUICK_START.md
├── → README.md (scripts/)
├── → DEMO_DATA_OVERVIEW.md
└── → IMAGE_SOURCES.md

QUICK_START.md
├── → README.md (scripts/)
└── → DEMO_DATA_OVERVIEW.md

PRESENTATION_CHECKLIST.md
├── → QUICK_START.md
└── → DEMO_DATA_OVERVIEW.md

IMAGE_SOURCES.md
└── → create-demo-account.js
```

---

## 💡 Tipy

1. **Začněte s QUICK_START.md** - nejrychlejší cesta k funkčnímu demo účtu
2. **Používejte PRESENTATION_CHECKLIST.md** - před každou prezentací
3. **Aktualizujte IMAGE_SOURCES.md** - když měníte obrázky
4. **Čtěte DEMO_DATA_OVERVIEW.md** - abyste věděli, co prezentovat

---

**Vytvořeno:** 2025-10-03
**Verze:** 1.0.0
**Autor:** Svatbot Team

