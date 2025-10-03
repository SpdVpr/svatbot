# 🎭 Demo Account Setup - Kompletní průvodce

Tento dokument popisuje kompletní setup demo účtu pro prezentaci aplikace Svatbot.

## 📋 Obsah

1. [Rychlý start](#-rychlý-start)
2. [Co obsahuje demo účet](#-co-obsahuje-demo-účet)
3. [Instalace a spuštění](#-instalace-a-spuštění)
4. [Dostupné příkazy](#-dostupné-příkazy)
5. [Struktura dat](#-struktura-dat)
6. [Obrázky a media](#-obrázky-a-media)
7. [Řešení problémů](#-řešení-problémů)

## 🚀 Rychlý start

```bash
# 1. Nainstalujte závislosti
npm install firebase-admin

# 2. Stáhněte Service Account Key z Firebase Console
# Uložte jako firebase-service-account.json v root adresáři

# 3. Vytvořte demo účet
npm run demo:create

# 4. Přihlaste se
# Email: demo@svatbot.cz
# Heslo: demo123
```

## 📦 Co obsahuje demo účet

### Základní informace
- **Email:** demo@svatbot.cz
- **Heslo:** demo123
- **Nevěsta:** Jana
- **Ženich:** Petr
- **Datum svatby:** 180 dní od vytvoření
- **Počet hostů:** 85
- **Rozpočet:** 450 000 Kč
- **Celkový pokrok:** 73%

### Moduly s daty

| Modul | Počet položek | Status |
|-------|---------------|--------|
| 👥 Hosté | 3 | ✅ Kompletní |
| 📋 Úkoly | 3 | ✅ Kompletní |
| 🏨 Ubytování | 2 zařízení, 2 pokoje | ✅ Kompletní |
| 🎨 Moodboard | 6 obrázků | ✅ Kompletní |
| 🍽️ Menu | 2 jídla, 2 nápoje | ✅ Kompletní |
| 👔 Dodavatelé | 2 (fotograf, catering) | ✅ Kompletní |
| 🎵 Hudba | 2 kategorie, 2 písně | ✅ Kompletní |
| 📝 Poznámky | 2 | ✅ Kompletní |
| 📅 Timeline | 2 milníky, 5 položek harmonogramu | ✅ Kompletní |

### Obrázky
- **Celkem:** 17 obrázků
- **Zdroj:** Unsplash (volně dostupné)
- **Kategorie:** Ubytování, moodboard, portfolio dodavatelů
- **Kvalita:** Vysoké rozlišení (optimalizováno na 800px šířku)

## 🔧 Instalace a spuštění

### Požadavky

- Node.js 18+
- npm nebo yarn
- Firebase projekt (svatbot-app)
- Service Account Key

### Krok 1: Instalace závislostí

```bash
npm install firebase-admin
```

### Krok 2: Stažení Service Account Key

1. Otevřete [Firebase Console](https://console.firebase.google.com/project/svatbot-app)
2. Jděte do **Project Settings** → **Service Accounts**
3. Klikněte na **Generate New Private Key**
4. Uložte jako `firebase-service-account.json` v root adresáři

### Krok 3: Vytvoření demo účtu

```bash
npm run demo:create
```

Tento příkaz vytvoří:
- ✅ Uživatele v Firebase Authentication
- ✅ Svatební profil v Firestore
- ✅ Všechna demo data ve všech modulech

### Krok 4: Ověření

1. Otevřete aplikaci: https://svatbot.cz nebo http://localhost:3000
2. Přihlaste se:
   - Email: demo@svatbot.cz
   - Heslo: demo123
3. Zkontrolujte, že všechny moduly obsahují data

## 📝 Dostupné příkazy

### Vytvoření demo účtu
```bash
npm run demo:create
```
- Vytvoří nový demo účet
- Pokud účet existuje, použije ho a přidá data
- Idempotentní - můžete spustit vícekrát

### Smazání demo účtu
```bash
npm run demo:delete
```
- Smaže demo účet a všechna data
- Nevratná operace!
- Použijte před vytvořením čistého demo účtu

### Aktualizace dat
```bash
npm run demo:update
```
- Aktualizuje data v existujícím účtu
- Zachová user ID a wedding ID
- Smaže stará data a vytvoří nová

### Kompletní reset
```bash
npm run demo:delete && npm run demo:create
```
- Smaže vše a vytvoří čistý demo účet
- Doporučeno před důležitou prezentací

## 📊 Struktura dat

### Hosté (3)

1. **Marie Nováková**
   - Kategorie: Rodina nevěsty
   - RSVP: Potvrzena ✅
   - Ubytování: Zájem o dvoulůžkový pokoj

2. **Jan Novák**
   - Kategorie: Rodina ženicha
   - RSVP: Potvrzena ✅
   - Doprovod: Eva Nováková
   - Děti: Tomáš (8 let)
   - Ubytování: Zájem o rodinný pokoj

3. **Petra Svobodová**
   - Kategorie: Přátelé
   - RSVP: Čeká na potvrzení ⏳
   - Strava: Vegetariánka
   - Ubytování: Nemá zájem

### Úkoly (3)

1. **Rezervovat místo konání** ✅
   - Priorita: Vysoká
   - Status: Dokončeno
   - Termín: Před 30 dny

2. **Objednat svatební fotografa** 🔄
   - Priorita: Vysoká
   - Status: Probíhá
   - Termín: Za 14 dní

3. **Vybrat svatební šaty** ⏳
   - Priorita: Střední
   - Status: Čeká
   - Termín: Za 30 dní

### Ubytování (2)

#### Hotel Château Mcely ⭐⭐⭐⭐⭐
- Luxusní boutique hotel
- 2 pokoje (Deluxe, Rodinný apartmán)
- 3 obrázky
- Cena: 3 500 - 5 000 Kč/noc

#### Penzion U Lípy ⭐⭐⭐
- Rodinný penzion
- 2 obrázky
- Útulná atmosféra

### Moodboard (6 obrázků)

1. Svatební místo - zámek ⭐
2. Květinová výzdoba ⭐
3. Svatební šaty
4. Svatební dort ⭐
5. Stolní dekorace
6. Svatební prsteny ⭐

### Menu

**Jídla:**
- Hovězí svíčková (280 Kč/porce, 50 porcí)
- Grilovaný losos (320 Kč/porce, 35 porcí)

**Nápoje:**
- Prosecco (150 Kč/sklenice, 100 sklenic)
- Domácí limonáda (40 Kč/sklenice, 150 sklenic)

### Dodavatelé (2)

1. **Photo Nejedlí** ⭐⭐⭐⭐⭐
   - Kategorie: Fotograf
   - Status: Rezervováno
   - Cena: 15 000 - 50 000 Kč
   - Portfolio: 2 fotky

2. **Catering Elegance** ⭐⭐⭐⭐⭐
   - Kategorie: Catering
   - Status: Rezervováno
   - Cena: 800 - 2 000 Kč/osoba
   - Portfolio: 2 fotky

### Hudba

- **DJ:** DJ Martin
- **Nástup nevěsty:** A Thousand Years - Christina Perri
- **První tanec:** Perfect - Ed Sheeran

### Timeline

**Milníky:**
1. Rezervace místa konání ✅ (dokončeno)
2. Výběr svatebních šatů 🔄 (probíhá)

**Harmonogram svatebního dne:**
1. 09:00 - Příprava nevěsty (3 hodiny)
2. 14:00 - Svatební obřad (45 minut)
3. 15:00 - Gratulace a focení (1 hodina)
4. 18:00 - Svatební hostina (3 hodiny)
5. 21:00 - První tanec a zábava (4 hodiny)

## 🎨 Obrázky a media

### Zdroje obrázků

Všechny obrázky jsou z [Unsplash](https://unsplash.com) - volně dostupné pro komerční i nekomerční použití.

### Kategorie obrázků

- **Ubytování:** 7 obrázků (hotely, pokoje, wellness)
- **Moodboard:** 6 obrázků (místo, květiny, šaty, dort, dekorace, prsteny)
- **Portfolio:** 4 obrázky (fotografie, catering)

### Výměna obrázků

Pokud chcete vyměnit obrázky:

1. Najděte nový obrázek na [Unsplash.com](https://unsplash.com)
2. Zkopírujte URL a přidejte `?w=800`
3. Upravte `scripts/create-demo-account.js`
4. Spusťte `npm run demo:delete && npm run demo:create`

Více informací v [IMAGE_SOURCES.md](scripts/IMAGE_SOURCES.md)

## 🐛 Řešení problémů

### Chyba: "Service account not found"

**Příčina:** Chybí soubor `firebase-service-account.json`

**Řešení:**
```bash
# Zkontrolujte, že soubor existuje
ls firebase-service-account.json

# Pokud ne, stáhněte ho z Firebase Console
```

### Chyba: "User already exists"

**Příčina:** Demo účet již existuje

**Řešení:**
```bash
# Varianta 1: Použít existující účet (skript ho automaticky najde)
npm run demo:create

# Varianta 2: Smazat a vytvořit znovu
npm run demo:delete
npm run demo:create
```

### Chyba: "Permission denied"

**Příčina:** Nedostatečná oprávnění v Firebase

**Řešení:**
1. Zkontrolujte Firebase Security Rules
2. Ověřte, že service account má roli "Firebase Admin SDK Administrator"
3. Zkontrolujte, že projekt ID je správné

### Chyba: "Module not found: firebase-admin"

**Příčina:** Chybí závislost

**Řešení:**
```bash
npm install firebase-admin
```

## 💡 Tipy pro prezentaci

### Před prezentací

1. Vytvořte čistý demo účet:
   ```bash
   npm run demo:delete && npm run demo:create
   ```

2. Přihlaste se a zkontrolujte všechny moduly

3. Připravte si scénář prezentace

### Během prezentace

1. **Dashboard** - Ukažte přehled a pokrok
2. **Hosté** - Demonstrujte správu hostů a RSVP
3. **Úkoly** - Ukažte plánování a timeline
4. **Ubytování** - Prezentujte správu ubytování s obrázky
5. **Moodboard** - Ukažte inspirační obrázky
6. **Menu** - Demonstrujte plánování menu
7. **Dodavatelé** - Ukažte správu dodavatelů s portfolii
8. **Timeline** - Prezentujte harmonogram svatebního dne

### Po prezentaci

Volitelně obnovte čistá data:
```bash
npm run demo:delete && npm run demo:create
```

## 📚 Další dokumentace

- [Quick Start Guide](scripts/QUICK_START.md) - Rychlý průvodce
- [README](scripts/README.md) - Detailní dokumentace
- [Demo Data Overview](scripts/DEMO_DATA_OVERVIEW.md) - Přehled všech dat
- [Image Sources](scripts/IMAGE_SOURCES.md) - Zdroje obrázků

## 🔗 Užitečné odkazy

- [Firebase Console](https://console.firebase.google.com/project/svatbot-app)
- [Svatbot.cz](https://svatbot.cz)
- [Unsplash](https://unsplash.com)
- [GitHub Repository](https://github.com/SpdVpr/svatbot)

## 📞 Podpora

Pokud narazíte na problémy:

1. Zkontrolujte [Řešení problémů](#-řešení-problémů)
2. Podívejte se do dokumentace v `scripts/`
3. Zkontrolujte Firebase Console pro chyby

---

**Vytvořeno pro:** Svatbot - Moderní svatební plánovač
**Verze:** 1.0.0
**Poslední aktualizace:** 2025-10-03

