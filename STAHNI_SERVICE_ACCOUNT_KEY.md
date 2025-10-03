# 🔑 Jak stáhnout Service Account Key

## 📋 Rychlý návod (2 minuty)

### 1️⃣ Otevřete Firebase Console
Otevřel jsem vám Firebase Console v prohlížeči. Pokud ne, klikněte zde:
👉 https://console.firebase.google.com/project/svatbot-app/settings/serviceaccounts/adminsdk

### 2️⃣ Vygenerujte klíč
1. Na stránce uvidíte sekci **"Firebase Admin SDK"**
2. Klikněte na tlačítko **"Generate new private key"** (Vygenerovat nový soukromý klíč)
3. Potvrzení: Klikněte na **"Generate key"** (Vygenerovat klíč)
4. Stáhne se JSON soubor (např. `svatbot-app-firebase-adminsdk-xxxxx.json`)

### 3️⃣ Přejmenujte soubor
Přejmenujte stažený soubor na:
```
firebase-service-account.json
```

### 4️⃣ Přesuňte soubor
Přesuňte soubor do root adresáře projektu:
```
d:\svatbot\firebase-service-account.json
```

### 5️⃣ Spusťte demo účet
```bash
npm run demo:create
```

## 📸 Vizuální návod

### Jak to vypadá v Firebase Console:

```
┌─────────────────────────────────────────────────────────┐
│  Firebase Console - Service accounts                     │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  Firebase Admin SDK                                      │
│                                                           │
│  Admin SDK configuration snippet                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │ Node.js                                         │    │
│  │                                                  │    │
│  │ var admin = require("firebase-admin");          │    │
│  │ ...                                              │    │
│  └─────────────────────────────────────────────────┘    │
│                                                           │
│  [Generate new private key]  ← KLIKNĚTE SEM              │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

### Po kliknutí na "Generate new private key":

```
┌─────────────────────────────────────────────────────────┐
│  Generate new private key?                               │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  This key provides full access to your Firebase          │
│  project. Keep it confidential and never store it        │
│  in a public repository.                                 │
│                                                           │
│  [Cancel]  [Generate key]  ← KLIKNĚTE SEM               │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

### Stažený soubor:

```
📁 Downloads/
  └── 📄 svatbot-app-firebase-adminsdk-abc123.json
```

### Přejmenujte na:

```
📁 Downloads/
  └── 📄 firebase-service-account.json
```

### Přesuňte do:

```
📁 d:\svatbot\
  ├── 📄 firebase-service-account.json  ← SEM
  ├── 📄 package.json
  ├── 📁 scripts/
  └── ...
```

## ✅ Kontrola

Po dokončení zkontrolujte, že soubor existuje:

```bash
# V PowerShell
Test-Path d:\svatbot\firebase-service-account.json
# Mělo by vrátit: True
```

Nebo:

```bash
# V PowerShell
dir d:\svatbot\firebase-service-account.json
# Mělo by zobrazit soubor
```

## 🚀 Spuštění

Když máte soubor na správném místě:

```bash
npm run demo:create
```

Měli byste vidět:

```
🎭 Creating demo account...
✅ Demo user created
✅ Demo wedding created
✅ Demo tasks created
✅ Demo guests created
✅ Demo accommodations created
✅ Demo moodboard images created
✅ Demo menu items created
✅ Demo drink items created
✅ Demo vendors created
✅ Demo music data created
✅ Demo notes created
✅ Demo timeline milestones created
✅ Demo AI timeline items created

🎉 Demo account setup complete!

📧 Email: demo@svatbot.cz
🔑 Password: demo123
🌐 URL: https://svatbot.cz
```

## 🔒 Bezpečnost

⚠️ **DŮLEŽITÉ:**
- ✅ Soubor je již přidán do `.gitignore`
- ✅ Nebude commitnut do Gitu
- ❌ **NIKDY** ho nesdílejte s nikým
- ❌ **NIKDY** ho nenahrajte na GitHub
- ❌ **NIKDY** ho neposílejte emailem

## 🆘 Problémy?

### "Cannot find module 'firebase-admin'"
```bash
npm install firebase-admin --save-dev
```

### "ENOENT: no such file or directory"
- Zkontrolujte, že soubor je v `d:\svatbot\firebase-service-account.json`
- Zkontrolujte název souboru (musí být přesně `firebase-service-account.json`)

### "Error: Could not load the default credentials"
- Zkontrolujte, že soubor je validní JSON
- Zkontrolujte, že jste ho stáhli z Firebase Console pro projekt `svatbot-app`
- Zkuste stáhnout nový klíč

### Soubor se nestáhl
- Zkontrolujte složku Downloads
- Zkuste to znovu
- Zkontrolujte, že jste přihlášeni do Firebase Console

## 📞 Další pomoc

Pokud máte stále problémy:
1. [scripts/SETUP_INSTRUCTIONS.md](scripts/SETUP_INSTRUCTIONS.md) - Detailní návod
2. [scripts/QUICK_START.md](scripts/QUICK_START.md) - Rychlý průvodce
3. [DEMO_ACCOUNT_SETUP.md](DEMO_ACCOUNT_SETUP.md) - Kompletní průvodce

---

**Po dokončení těchto kroků můžete vytvořit demo účet! 🎉**

```bash
npm run demo:create
```

