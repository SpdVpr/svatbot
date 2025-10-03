# 🔧 Setup Instructions - Demo Account

## ⚠️ Důležité: Potřebujete Service Account Key

Pro spuštění demo skriptů potřebujete **Firebase Service Account Key**.

## 📥 Jak stáhnout Service Account Key

### Krok 1: Otevřete Firebase Console
1. Otevřete [Firebase Console](https://console.firebase.google.com/project/svatbot-app)
2. Přihlaste se svým Google účtem

### Krok 2: Přejděte do nastavení projektu
1. Klikněte na **⚙️ ikonu** (nastavení) vedle "Project Overview"
2. Vyberte **"Project settings"** (Nastavení projektu)

### Krok 3: Přejděte na Service Accounts
1. Klikněte na záložku **"Service accounts"**
2. Měli byste vidět sekci "Firebase Admin SDK"

### Krok 4: Vygenerujte nový klíč
1. Klikněte na tlačítko **"Generate new private key"**
2. Potvrzení: Klikněte na **"Generate key"**
3. Stáhne se soubor ve formátu JSON (např. `svatbot-app-firebase-adminsdk-xxxxx.json`)

### Krok 5: Přejmenujte a umístěte soubor
1. Přejmenujte stažený soubor na: **`firebase-service-account.json`**
2. Přesuňte ho do **root adresáře** projektu: `d:\svatbot\firebase-service-account.json`

## ✅ Kontrola

Po dokončení by struktura měla vypadat takto:

```
d:\svatbot\
├── firebase-service-account.json  ← Nový soubor
├── package.json
├── scripts/
│   ├── create-demo-account.js
│   └── ...
└── ...
```

## 🚀 Spuštění demo účtu

Po umístění Service Account Key můžete spustit:

```bash
npm run demo:create
```

## 🔒 Bezpečnost

⚠️ **DŮLEŽITÉ:**
- Soubor `firebase-service-account.json` obsahuje citlivé údaje
- **NIKDY** ho necommitujte do Gitu
- Je již přidán do `.gitignore`
- Nesdílejte ho s nikým

## 🆘 Řešení problémů

### Chyba: "Cannot find module 'firebase-admin'"
```bash
npm install firebase-admin --save-dev
```

### Chyba: "ENOENT: no such file or directory"
- Zkontrolujte, že soubor `firebase-service-account.json` je v root adresáři
- Zkontrolujte název souboru (musí být přesně `firebase-service-account.json`)

### Chyba: "Error: Could not load the default credentials"
- Zkontrolujte, že Service Account Key je validní JSON
- Zkontrolujte, že jste ho stáhli z Firebase Console pro projekt `svatbot-app`

## 📞 Potřebujete pomoc?

Pokud máte problémy, zkontrolujte:
1. [QUICK_START.md](QUICK_START.md) - Rychlý průvodce
2. [README.md](README.md) - Detailní dokumentace
3. [../DEMO_ACCOUNT_SETUP.md](../DEMO_ACCOUNT_SETUP.md) - Kompletní průvodce

---

**Po dokončení těchto kroků můžete spustit:**
```bash
npm run demo:create
```

