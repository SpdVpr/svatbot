# 🔐 Firebase Admin SDK Setup

## ⚠️ DŮLEŽITÉ - Chyba oprávnění

Pokud vidíte chybu:
```
7 PERMISSION_DENIED: Missing or insufficient permissions.
```

Znamená to, že **Firebase Admin SDK credentials nejsou nastaveny**.

---

## 📋 Jak získat Firebase Admin credentials

### Krok 1: Otevřete Firebase Console

1. Jděte na: https://console.firebase.google.com/
2. Vyberte projekt **svatbot-app**

### Krok 2: Vygenerujte Service Account Key

1. Klikněte na **⚙️ Project Settings** (vlevo dole)
2. Přejděte na záložku **Service accounts**
3. Klikněte na **Generate new private key**
4. Potvrzení: **Generate key**
5. Stáhne se soubor `svatbot-app-firebase-adminsdk-xxxxx.json`

### Krok 3: Otevřete stažený JSON soubor

Soubor bude vypadat takto:
```json
{
  "type": "service_account",
  "project_id": "svatbot-app",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASC...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@svatbot-app.iam.gserviceaccount.com",
  "client_id": "123456789...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

### Krok 4: Zkopírujte hodnoty do .env.local

Otevřete `.env.local` a aktualizujte tyto řádky:

```env
# Firebase Admin SDK (Server-side only)
FIREBASE_ADMIN_PROJECT_ID=svatbot-app
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@svatbot-app.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASC...\n-----END PRIVATE KEY-----\n"
```

**Důležité:**
- `FIREBASE_ADMIN_PROJECT_ID` - zkopírujte hodnotu `project_id` z JSON
- `FIREBASE_ADMIN_CLIENT_EMAIL` - zkopírujte hodnotu `client_email` z JSON
- `FIREBASE_ADMIN_PRIVATE_KEY` - zkopírujte **celou** hodnotu `private_key` z JSON (včetně `-----BEGIN PRIVATE KEY-----` a `-----END PRIVATE KEY-----`)
- Private key **musí být v uvozovkách** a obsahovat `\n` pro nové řádky

---

## 🚀 Restart aplikace

Po nastavení credentials:

```bash
# Zastavte dev server (Ctrl+C)
# Spusťte znovu
npm run dev
```

---

## ✅ Ověření

Po restartu byste měli vidět v konzoli:
```
🔥 Initializing Firebase Admin SDK with credentials...
Project ID: svatbot-app
Client Email: firebase-adminsdk-xxxxx@svatbot-app.iam.gserviceaccount.com
Private Key: SET (length: 1234)
✅ Firebase Admin SDK initialized successfully
```

---

## 🔒 Bezpečnost

### ⚠️ NIKDY nesdílejte tyto credentials!

- ❌ **NIKDY** je necommitujte do Gitu
- ❌ **NIKDY** je nesdílejte veřejně
- ✅ `.env.local` je v `.gitignore` - je v bezpečí
- ✅ Pro produkci použijte Vercel environment variables

### Pro Vercel (produkce)

```bash
vercel env add FIREBASE_ADMIN_PROJECT_ID
# Zadejte: svatbot-app

vercel env add FIREBASE_ADMIN_CLIENT_EMAIL
# Zadejte: firebase-adminsdk-xxxxx@svatbot-app.iam.gserviceaccount.com

vercel env add FIREBASE_ADMIN_PRIVATE_KEY
# Zadejte: celý private key včetně -----BEGIN PRIVATE KEY----- a -----END PRIVATE KEY-----
```

---

## 🐛 Troubleshooting

### Chyba: "Firebase Admin SDK credentials not configured"

**Řešení:**
1. Zkontrolujte, že máte všechny 3 proměnné v `.env.local`
2. Zkontrolujte, že private key je v uvozovkách
3. Restartujte dev server

### Chyba: "Invalid private key"

**Řešení:**
1. Zkontrolujte, že private key obsahuje `\n` pro nové řádky
2. Zkontrolujte, že začíná `-----BEGIN PRIVATE KEY-----`
3. Zkontrolujte, že končí `-----END PRIVATE KEY-----\n`
4. Vygenerujte nový private key v Firebase Console

### Chyba: "Permission denied"

**Řešení:**
1. Zkontrolujte, že používáte správný project ID
2. Zkontrolujte, že service account má správná oprávnění
3. V Firebase Console → IAM & Admin → Service Accounts
4. Ověřte, že service account má roli **Firebase Admin SDK Administrator Service Agent**

---

## 📞 Podpora

Pokud máte problémy:
1. Zkontrolujte Firebase Console → Project Settings → Service accounts
2. Ověřte, že service account existuje a je aktivní
3. Vygenerujte nový private key
4. Restartujte aplikaci

---

## ✅ Po dokončení

Po správném nastavení:
- ✅ GoPay platby budou fungovat
- ✅ Webhook bude aktualizovat platby
- ✅ Předplatná se budou aktivovat automaticky
- ✅ Žádné chyby oprávnění

**Nyní můžete testovat platby! 🎉**

