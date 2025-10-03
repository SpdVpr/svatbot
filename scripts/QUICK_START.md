# 🚀 Quick Start - Demo Account

Rychlý průvodce pro vytvoření a správu demo účtu.

## ⚡ Rychlé příkazy

```bash
# Vytvoření demo účtu s kompletními daty
npm run demo:create

# Smazání demo účtu a všech dat
npm run demo:delete

# Aktualizace dat v existujícím demo účtu
npm run demo:update
```

## 📋 Krok za krokem

### 1. Příprava

Ujistěte se, že máte:

- ✅ Node.js nainstalovaný
- ✅ Firebase Admin SDK nainstalovaný (`npm install firebase-admin`)
- ✅ Service Account Key (`firebase-service-account.json` v root adresáři)

### 2. Stažení Service Account Key

1. Otevřete [Firebase Console](https://console.firebase.google.com)
2. Vyberte projekt `svatbot-app`
3. Jděte do **Project Settings** (⚙️ ikona)
4. Klikněte na záložku **Service Accounts**
5. Klikněte na **Generate New Private Key**
6. Uložte soubor jako `firebase-service-account.json` do root adresáře projektu

### 3. Vytvoření demo účtu

```bash
npm run demo:create
```

Tento příkaz:
- ✅ Vytvoří uživatele `demo@svatbot.cz`
- ✅ Vytvoří svatební profil (Jana & Petr)
- ✅ Naplní všechny moduly daty:
  - 👥 3 hosté
  - 📋 3 úkoly
  - 🏨 2 ubytování s pokoji
  - 🎨 6 moodboard obrázků
  - 🍽️ 2 jídla + 2 nápoje
  - 👔 2 dodavatelé
  - 🎵 Hudební playlist
  - 📝 2 poznámky
  - 📅 Timeline a harmonogram

### 4. Přihlášení

Po vytvoření účtu se můžete přihlásit:

- **URL:** https://svatbot.cz nebo http://localhost:3000
- **Email:** demo@svatbot.cz
- **Heslo:** demo123

### 5. Testování

Vyzkoušejte všechny funkce:

- ✅ Dashboard s přehledem
- ✅ Správa hostů
- ✅ Úkoly a timeline
- ✅ Rozpočet
- ✅ Ubytování s pokoji
- ✅ Moodboard s obrázky
- ✅ Menu a nápoje
- ✅ Dodavatelé
- ✅ Hudební playlist
- ✅ Poznámky

## 🔄 Aktualizace dat

Pokud chcete obnovit demo data:

```bash
# Varianta 1: Smazat a vytvořit znovu (čisté prostředí)
npm run demo:delete
npm run demo:create

# Varianta 2: Pouze aktualizovat data (zachová user ID)
npm run demo:update
```

## 🐛 Řešení problémů

### Chyba: "Service account not found"

**Řešení:**
```bash
# Zkontrolujte, že soubor existuje
ls firebase-service-account.json

# Pokud ne, stáhněte ho z Firebase Console
```

### Chyba: "User already exists"

**Řešení:**
```bash
# Demo účet již existuje, můžete:
# 1. Použít existující účet (skript ho automaticky najde)
# 2. Nebo smazat a vytvořit znovu
npm run demo:delete
npm run demo:create
```

### Chyba: "Permission denied"

**Řešení:**
1. Zkontrolujte Firebase Security Rules
2. Ujistěte se, že Admin SDK má správná oprávnění
3. Ověřte, že service account má roli "Firebase Admin SDK Administrator Service Agent"

### Chyba: "Module not found: firebase-admin"

**Řešení:**
```bash
npm install firebase-admin
```

## 📊 Co obsahuje demo účet?

### Svatební profil
- **Nevěsta:** Jana
- **Ženich:** Petr
- **Datum:** 180 dní od vytvoření
- **Hosté:** 85
- **Rozpočet:** 450 000 Kč
- **Pokrok:** 73%

### Hosté (3)
1. Marie Nováková - Rodina nevěsty ✅
2. Jan Novák - Rodina ženicha (s doprovodem) ✅
3. Petra Svobodová - Přátelé (vegetariánka) ⏳

### Ubytování (2)
1. **Hotel Château Mcely** - Luxusní hotel
   - Deluxe pokoj (3 500 Kč/noc)
   - Rodinný apartmán (5 000 Kč/noc)
2. **Penzion U Lípy** - Rodinný penzion

### Moodboard (6 obrázků)
- Svatební místo - zámek ⭐
- Květinová výzdoba ⭐
- Svatební šaty
- Svatební dort ⭐
- Stolní dekorace
- Svatební prsteny ⭐

### Menu
- **Jídla:** Hovězí svíčková, Grilovaný losos
- **Nápoje:** Prosecco, Domácí limonáda

### Dodavatelé (2)
1. **Photo Nejedlí** - Fotograf ⭐⭐⭐⭐⭐
2. **Catering Elegance** - Catering ⭐⭐⭐⭐⭐

### Hudba
- Nástup nevěsty: A Thousand Years - Christina Perri
- První tanec: Perfect - Ed Sheeran

### Timeline
- Rezervace místa konání ✅
- Výběr svatebních šatů 🔄
- Harmonogram svatebního dne (5 položek)

## 💡 Tipy pro prezentaci

1. **Před prezentací:**
   ```bash
   npm run demo:create
   ```

2. **Během prezentace:**
   - Ukažte dashboard s přehledem
   - Projděte jednotlivé moduly
   - Demonstrujte přidávání/editaci dat
   - Ukažte moodboard s obrázky
   - Projděte timeline a harmonogram

3. **Po prezentaci:**
   ```bash
   # Volitelně - obnovit čistá data
   npm run demo:delete
   npm run demo:create
   ```

## 🔗 Užitečné odkazy

- [Firebase Console](https://console.firebase.google.com/project/svatbot-app)
- [Svatbot.cz](https://svatbot.cz)
- [Unsplash](https://unsplash.com) - Zdroj obrázků
- [Kompletní dokumentace](./README.md)
- [Přehled dat](./DEMO_DATA_OVERVIEW.md)

## 📝 Poznámky

- Demo účet je **perzistentní** - data zůstávají v Firebase
- Můžete ho používat opakovaně pro prezentace
- Všechny obrázky jsou z Unsplash (volně dostupné)
- Data jsou optimalizována pro realistický vzhled
- Skript je **idempotentní** - můžete ho spustit vícekrát

## 🎯 Další kroky

Po vytvoření demo účtu můžete:

1. ✅ Přihlásit se a prozkoumat aplikaci
2. ✅ Přidat vlastní data pro testování
3. ✅ Sdílet přihlašovací údaje s týmem
4. ✅ Použít pro prezentace klientům
5. ✅ Testovat nové funkce

---

**Potřebujete pomoc?** Podívejte se do [README.md](./README.md) pro detailní dokumentaci.

