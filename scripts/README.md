# Admin & Demo Scripts

Tento adresář obsahuje utility skripty pro správu admin uživatelů a demo účtu v aplikaci Svatbot.

## 🔐 Admin Setup

Pro bezpečné vytvoření admin účtu použijte **Cloud Function** metodu.

**Dokumentace**: [../SECURE_ADMIN_SETUP.md](../SECURE_ADMIN_SETUP.md)

### Rychlý Postup:

1. Vytvořte uživatele v Firebase Console
2. Deploy Cloud Function: `firebase deploy --only functions:setAdminRole`
3. Zavolejte funkci s UID uživatele
4. Přihlaste se na `/admin/login`

⚠️ **BEZPEČNOST**: Nepoužívejte scripty s service account keys v projektu!

---

## 🎭 Demo Account Scripts

Skripty pro správu demo účtu v aplikaci Svatbot.

## 🚀 Rychlý start

```bash
# 1. Vytvořte demo účet
npm run demo:create

# 2. Přihlaste se
# Email: demo@svatbot.cz
# Heslo: demo123
```

**Pro detailní průvodce:** [QUICK_START.md](QUICK_START.md)

## 📚 Dokumentace

### Pro začátečníky
- **[QUICK_START.md](QUICK_START.md)** - Rychlý průvodce (začněte zde!)
- **[VISUAL_GUIDE.md](VISUAL_GUIDE.md)** - Vizuální ukázky, co uvidíte v aplikaci
- **[DEMO_DATA_OVERVIEW.md](DEMO_DATA_OVERVIEW.md)** - Kompletní přehled všech dat

### Pro prezentující
- **[PRESENTATION_CHECKLIST.md](PRESENTATION_CHECKLIST.md)** - Checklist před prezentací
- **[DEMO_DATA_OVERVIEW.md](DEMO_DATA_OVERVIEW.md)** - Co prezentovat

### Pro vývojáře
- **[FILES_OVERVIEW.md](FILES_OVERVIEW.md)** - Přehled všech souborů
- **[IMAGE_SOURCES.md](IMAGE_SOURCES.md)** - Správa obrázků

### Hlavní dokumentace
- **[../DEMO_ACCOUNT_SETUP.md](../DEMO_ACCOUNT_SETUP.md)** - Kompletní průvodce (root)

## 📋 Přehled

Demo účet slouží k prezentaci aplikace s realistickými daty. Obsahuje:

- ✅ **Svatební profil** - Jana & Petr, svatba za 180 dní
- 👥 **Hosté** - 3 demo hosté s různými kategoriemi a RSVP statusy
- 📋 **Úkoly** - 3 demo úkoly v různých stavech
- 💰 **Rozpočet** - Položky rozpočtu (automaticky generované v aplikaci)
- 🏨 **Ubytování** - 2 ubytovací zařízení s pokoji a obrázky
- 🎨 **Moodboard** - 6 inspiračních obrázků z různých kategorií
- 🍽️ **Menu** - Jídla a nápoje s cenami
- 👔 **Dodavatelé** - Fotograf a catering s portfolii
- 🎵 **Hudba** - Playlist s písněmi pro klíčové momenty
- 📝 **Poznámky** - Důležité kontakty a nápady
- 📅 **Timeline** - Milníky a harmonogram svatebního dne

## 🚀 Použití

### Vytvoření demo účtu

```bash
node scripts/create-demo-account.js
```

Tento skript:
1. Vytvoří demo uživatele v Firebase Authentication
2. Vytvoří svatební profil
3. Naplní všechny moduly demo daty
4. Použije kvalitní obrázky z Unsplash

**Poznámka:** Pokud demo účet již existuje, skript ho automaticky použije a přidá nová data.

### Smazání demo účtu

```bash
node scripts/delete-demo-account.js
```

Tento skript:
1. Najde demo účet
2. Smaže všechna související data (hosty, úkoly, ubytování, atd.)
3. Smaže svatební profil
4. Smaže uživatele z Firebase Authentication

**Varování:** Tato operace je nevratná!

### Aktualizace demo dat

```bash
node scripts/update-demo-data.js
```

Tento skript:
1. Najde existující demo účet
2. Smaže stará data
3. Aktualizuje svatební profil
4. Zachová stejné user ID a wedding ID

**Tip:** Použijte tento skript, když chcete obnovit demo data bez vytváření nového účtu.

### Přihlašovací údaje

Po spuštění skriptu můžete použít tyto přihlašovací údaje:

- **Email:** demo@svatbot.cz
- **Heslo:** demo123

## 📦 Požadavky

Před spuštěním skriptu se ujistěte, že máte:

1. **Firebase Admin SDK** nainstalovaný:
   ```bash
   npm install firebase-admin
   ```

2. **Service Account Key** - soubor `firebase-service-account.json` v root adresáři projektu
   - Stáhněte z Firebase Console → Project Settings → Service Accounts → Generate New Private Key

## 🎨 Obrázky

Všechny obrázky v demo účtu jsou z Unsplash a jsou volně dostupné:

### Ubytování
- Luxusní hotelové pokoje
- Rodinné apartmány
- Exteriéry ubytování

### Moodboard
- **Místo konání** - Romantický zámek
- **Květiny** - Bílé růže a eukalyptus
- **Šaty** - Elegantní krajkové šaty
- **Dort** - Třípatrový dort s květinovou výzdobou
- **Dekorace** - Rustikální stolní výzdoba
- **Prsteny** - Zlaté snubní prsteny

### Dodavatelé
- Portfolio fotografa
- Ukázky cateringu

## 🔧 Údržba

### Aktualizace demo dat

Pokud chcete aktualizovat demo data:

1. Upravte soubor `create-demo-account.js`
2. Smažte stávající demo účet v Firebase Console (volitelné)
3. Spusťte skript znovu

### Přidání nových obrázků

Pro přidání nových obrázků z Unsplash:

1. Najděte obrázek na [Unsplash.com](https://unsplash.com)
2. Zkopírujte URL obrázku
3. Přidejte parametr `?w=800` pro optimální velikost
4. Přidejte URL do příslušného pole v skriptu

Příklad:
```javascript
images: [
  'https://images.unsplash.com/photo-PHOTO_ID?w=800'
]
```

## 📊 Struktura dat

### Svatební profil
- Jména: Jana & Petr
- Datum: 180 dní od vytvoření
- Počet hostů: 85
- Rozpočet: 450 000 Kč
- Styl: Klasický
- Region: Praha

### Hosté
1. **Marie Nováková** - Rodina nevěsty, potvrzena účast
2. **Jan Novák** - Rodina ženicha, s doprovodem a dítětem
3. **Petra Svobodová** - Přátelé, čeká na potvrzení, vegetariánka

### Ubytování
1. **Hotel Château Mcely** - Luxusní hotel s wellness
   - Deluxe pokoj (2 osoby) - 3 500 Kč/noc
   - Rodinný apartmán (4 osoby) - 5 000 Kč/noc
2. **Penzion U Lípy** - Rodinný penzion

### Dodavatelé
1. **Photo Nejedlí** - Fotograf (rezervováno)
2. **Catering Elegance** - Catering (rezervováno)

## 🐛 Řešení problémů

### Chyba: "Service account not found"
- Ujistěte se, že máte soubor `firebase-service-account.json` v root adresáři
- Zkontrolujte, že soubor obsahuje platné přihlašovací údaje

### Chyba: "User already exists"
- Demo účet již existuje
- Můžete ho smazat v Firebase Console nebo skript automaticky použije existující účet

### Chyba: "Permission denied"
- Zkontrolujte Firebase Security Rules
- Ujistěte se, že Admin SDK má správná oprávnění

## 📝 Poznámky

- Skript je idempotentní - můžete ho spustit vícekrát
- Existující demo účet bude použit, pokud již existuje
- Data jsou optimalizována pro prezentaci
- Všechny obrázky jsou z volně dostupných zdrojů

## 🔗 Užitečné odkazy

- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Unsplash](https://unsplash.com) - Zdroj obrázků
- [Firebase Console](https://console.firebase.google.com)

