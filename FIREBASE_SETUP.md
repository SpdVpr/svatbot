# 🔥 Firebase Setup Guide pro SvatBot.cz

## 📋 Přehled

Firebase poskytuje kompletní backend infrastrukturu pro SvatBot.cz aplikaci:
- **Authentication** - přihlašování uživatelů
- **Firestore** - NoSQL databáze
- **Storage** - ukládání souborů a obrázků
- **Hosting** - deployment aplikace
- **Cloud Functions** - serverless funkce

## 🚀 Rychlý start

### 1. Vytvoření Firebase projektu

1. Jděte na [Firebase Console](https://console.firebase.google.com/)
2. Klikněte "Create a project"
3. Název projektu: `svatbot-app`
4. Povolte Google Analytics (doporučeno)
5. Vyberte Analytics účet nebo vytvořte nový

### 2. Konfigurace Authentication

```bash
# V Firebase Console:
Authentication > Get started > Sign-in method
```

**Povolte tyto metody:**
- ✅ Email/Password
- ✅ Google
- ⚠️ Facebook (volitelné)

**Google OAuth setup:**
1. Jděte do Google Cloud Console
2. APIs & Services > Credentials
3. Vytvořte OAuth 2.0 Client ID
4. Přidejte authorized domains: `localhost`, `svatbot.cz`

### 3. Firestore Database

```bash
# V Firebase Console:
Firestore Database > Create database
```

**Nastavení:**
- Start in **production mode**
- Location: `europe-west3` (Frankfurt - nejblíže ČR)
- Security rules: Použijte `firestore.rules` z projektu

### 4. Storage

```bash
# V Firebase Console:
Storage > Get started
```

**Nastavení:**
- Location: `europe-west3` (Frankfurt)
- Security rules: Použijte `storage.rules` z projektu

### 5. Web App konfigurace

```bash
# V Firebase Console:
Project Settings > General > Your apps > Add app > Web
```

**Kroky:**
1. App nickname: `SvatBot Web`
2. Setup Firebase Hosting: ✅ Yes
3. Zkopírujte Firebase config objekt

## 🔧 Lokální development setup

### 1. Instalace Firebase CLI

```bash
npm install -g firebase-tools
firebase login
```

### 2. Inicializace projektu

```bash
cd svatbot
firebase init
```

**Vyberte služby:**
- ✅ Firestore
- ✅ Storage  
- ✅ Hosting
- ✅ Emulators

### 3. Environment variables

Vytvořte `.env.local`:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=svatbot-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=svatbot-app
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=svatbot-app.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### 4. Spuštění emulátorů

```bash
firebase emulators:start
```

**Emulátory běží na:**
- Firestore: http://localhost:8080
- Auth: http://localhost:9099
- Storage: http://localhost:9199
- Hosting: http://localhost:5000
- UI: http://localhost:4000

## 📊 Database Schema

### Collections struktura

```
users/
├── {userId}/
    ├── email: string
    ├── displayName: string
    ├── photoURL: string
    ├── createdAt: timestamp
    └── updatedAt: timestamp

weddings/
├── {weddingId}/
    ├── userId: string
    ├── brideName: string
    ├── groomName: string
    ├── weddingDate: timestamp
    ├── budget: number
    ├── style: string
    ├── region: string
    ├── progress: object
    ├── createdAt: timestamp
    └── updatedAt: timestamp

guests/
├── {guestId}/
    ├── weddingId: string
    ├── firstName: string
    ├── lastName: string
    ├── email: string
    ├── rsvpStatus: string
    └── ...

tasks/
├── {taskId}/
    ├── weddingId: string
    ├── title: string
    ├── category: string
    ├── phase: string
    ├── priority: string
    ├── status: string
    └── ...
```

## 🔒 Security Rules

### Firestore Rules principy

1. **Authenticated only** - Pouze přihlášení uživatelé
2. **Owner access** - Uživatel vidí pouze svá data
3. **Wedding-based** - Hosté, úkoly atd. patří k svatbě
4. **Validation** - Kontrola povinných polí

### Storage Rules principy

1. **Size limits** - Max 5MB pro profilové foto, 10MB pro svatební dokumenty
2. **File types** - Pouze obrázky pro fotky
3. **Owner access** - Uživatel upravuje pouze své soubory

## 🚀 Deployment

### 1. Build aplikace

```bash
npm run build
npm run export
```

### 2. Deploy na Firebase

```bash
firebase deploy
```

**Deploy specifických služeb:**
```bash
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
firebase deploy --only hosting
```

### 3. Custom domain

```bash
# V Firebase Console:
Hosting > Add custom domain
```

**Kroky:**
1. Přidejte `svatbot.cz`
2. Ověřte vlastnictví domény
3. Nastavte DNS záznamy

## 📈 Monitoring & Analytics

### 1. Firebase Analytics

Automaticky sleduje:
- Page views
- User engagement
- Conversion events
- Crash reports

### 2. Performance Monitoring

```bash
# Přidejte do aplikace:
npm install firebase/performance
```

### 3. Custom Events

```javascript
import { logEvent } from 'firebase/analytics'

// Track wedding creation
logEvent(analytics, 'wedding_created', {
  style: 'classic',
  budget_range: '300-500k'
})

// Track onboarding completion
logEvent(analytics, 'onboarding_completed', {
  steps_completed: 6
})
```

## 🔧 Maintenance

### 1. Backup

```bash
# Export Firestore data
gcloud firestore export gs://svatbot-app-backups/$(date +%Y%m%d)
```

### 2. Monitoring

- Firebase Console > Usage
- Cloud Console > Monitoring
- Set up alerts pro quota limits

### 3. Updates

```bash
# Update Firebase SDK
npm update firebase

# Update security rules
firebase deploy --only firestore:rules
```

## 🐛 Troubleshooting

### Časté problémy

1. **CORS errors**
   - Zkontrolujte authorized domains v Firebase Console
   - Přidejte localhost:3000 pro development

2. **Permission denied**
   - Zkontrolujte Firestore rules
   - Ověřte, že uživatel je přihlášen

3. **Quota exceeded**
   - Zkontrolujte usage v Firebase Console
   - Optimalizujte queries (použijte indexy)

### Debug mode

```javascript
// Povolte debug logging
import { connectFirestoreEmulator } from 'firebase/firestore'

if (process.env.NODE_ENV === 'development') {
  connectFirestoreEmulator(db, 'localhost', 8080)
}
```

## 📞 Support

### Dokumentace
- [Firebase Docs](https://firebase.google.com/docs)
- [Firestore Guide](https://firebase.google.com/docs/firestore)
- [Firebase Auth](https://firebase.google.com/docs/auth)

### Community
- [Firebase Discord](https://discord.gg/firebase)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/firebase)

---

**Status**: ✅ Firebase konfigurace připravena
**Další**: 🔄 Implementace core features (checklist, guests, budget)
