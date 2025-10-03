# 🚀 Deployment Guide - Svatbot

## 📋 Přehled

Svatbot je nasazený na **Vercel** s **Firebase** backendem.

- **Frontend**: Next.js 14 na Vercel
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **Domain**: svatbot.cz

---

## 🔐 Bezpečnost

### ⚠️ DŮLEŽITÉ: Citlivé soubory

Tyto soubory **NESMÍ** být v Gitu:

```
firebase-service-account.json       # Admin SDK credentials
*-firebase-adminsdk-*.json         # Jakékoliv admin SDK soubory
.env.local                         # Lokální environment variables
```

Všechny jsou již v `.gitignore` ✅

---

## 🌍 Environment Variables

### Firebase Client SDK (Frontend)

Tyto proměnné jsou **veřejné** a používají se na frontendu. Jsou již hardcoded v `src/config/firebase.ts` s fallbacky:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAhd3DDE9ueIqzZeqK1o0xXB-G5kJA6cl4
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=svatbot-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://svatbot-app-default-rtdb.europe-west1.firebasedatabase.app
NEXT_PUBLIC_FIREBASE_PROJECT_ID=svatbot-app
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=svatbot-app.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=820989180236
NEXT_PUBLIC_FIREBASE_APP_ID=1:820989180236:web:1943d90808b2466d1377e9
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XX74SLG551
```

**Poznámka**: Tyto hodnoty NEJSOU citlivé - jsou viditelné v kódu frontendu a jsou určené k veřejnému použití.

### Spotify API (pro Music modul)

Pokud používáte Spotify integraci, přidejte do Vercel:

```env
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_spotify_client_id
NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
```

---

## 🔧 Nastavení Vercel

### 1. Environment Variables ve Vercelu

Přejděte na: **Vercel Dashboard → Project → Settings → Environment Variables**

**Nepotřebujete přidávat žádné Firebase proměnné!** Aplikace používá hardcoded fallbacky.

Pokud chcete přepsat výchozí hodnoty, můžete přidat:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- atd.

### 2. Build Settings

```
Framework Preset: Next.js
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

### 3. Domain

- **Production**: svatbot.cz
- **Preview**: automatické preview URL pro každý commit

---

## 🛠️ Lokální Development

### 1. Instalace

```bash
npm install
```

### 2. Firebase Service Account (pouze pro admin scripty)

Pro lokální spouštění admin scriptů (např. vytvoření demo účtu):

1. Stáhněte `firebase-service-account.json` z Firebase Console:
   - Firebase Console → Project Settings → Service Accounts
   - Generate New Private Key

2. Uložte do root složky projektu jako `firebase-service-account.json`

3. **NIKDY** tento soubor necommitujte do Gitu!

### 3. Spuštění

```bash
# Development server
npm run dev

# Vytvoření demo účtu (vyžaduje firebase-service-account.json)
npm run demo:create
```

---

## 📦 Deployment

### Automatický Deployment

Každý push do `main` větve automaticky deployuje na produkci:

```bash
git add .
git commit -m "Your commit message"
git push origin main
```

Vercel automaticky:
1. ✅ Stáhne kód z GitHubu
2. ✅ Nainstaluje dependencies
3. ✅ Buildne aplikaci
4. ✅ Deployne na svatbot.cz

### Manuální Deployment

```bash
# Přes Vercel CLI
vercel --prod
```

---

## 🔍 Kontrola před Pushem

Před každým pushem zkontrolujte:

```bash
# 1. Zkontrolujte, že citlivé soubory nejsou v gitu
git status

# 2. Zkontrolujte .gitignore
cat .gitignore | findstr firebase-service-account

# 3. Zkontrolujte, že build funguje
npm run build

# 4. Zkontrolujte, že aplikace běží
npm run dev
```

---

## 🚨 Co dělat, když jste omylem commitli citlivý soubor

Pokud jste omylem commitli `firebase-service-account.json`:

```bash
# 1. Odstraňte soubor z gitu (ale nechte lokálně)
git rm --cached firebase-service-account.json

# 2. Commitněte změnu
git commit -m "Remove sensitive file"

# 3. Pushněte
git push origin main

# 4. DŮLEŽITÉ: Vygenerujte nový Service Account klíč v Firebase Console!
# Starý klíč je kompromitovaný a měl by být smazán.
```

---

## 📊 Firebase Security Rules

Firestore Rules jsou v `firestore.rules`. Pro deployment rules:

```bash
# Deploy pouze rules
firebase deploy --only firestore:rules

# Deploy všechno
firebase deploy
```

---

## 🎯 Produkční Checklist

- [x] Firebase config je správně nastavený
- [x] `.gitignore` obsahuje citlivé soubory
- [x] Vercel je propojený s GitHub repozitářem
- [x] Domain svatbot.cz je nastavená
- [x] Firebase Security Rules jsou deploynuté
- [x] Demo účet funguje (demo@svatbot.cz / demo123)

---

## 📞 Troubleshooting

### Build selhává na Vercelu

1. Zkontrolujte build logy ve Vercel Dashboard
2. Zkuste build lokálně: `npm run build`
3. Zkontrolujte, že všechny dependencies jsou v `package.json`

### Firebase connection errors

1. Zkontrolujte Firebase config v `src/config/firebase.ts`
2. Zkontrolujte Firebase Console, že projekt existuje
3. Zkontrolujte Firestore Rules

### Demo účet nefunguje

1. Spusťte lokálně: `npm run demo:create`
2. Zkontrolujte Firebase Console → Authentication
3. Zkontrolujte Firebase Console → Firestore Database

---

## 📚 Další zdroje

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Security Rules](https://firebase.google.com/docs/firestore/security/get-started)

---

**Vytvořeno**: 2025-01-03
**Poslední update**: 2025-01-03

