# Admin Dashboard - Deployment Checklist

## 🚀 Před Deploymentem

### 1. Firebase Configuration

- [ ] Zkontrolovat Firebase projekt ID: `svatbot-app`
- [ ] Ověřit Firebase region: `europe-west1`
- [ ] Zkontrolovat environment variables v `.env.local`

### 2. Firebase CLI

```bash
# Přihlásit se do Firebase
firebase login

# Vybrat správný projekt
firebase use svatbot-app

# Ověřit konfiguraci
firebase projects:list
```

## 📋 Deployment Kroky

### Krok 1: Deploy Firestore Rules

```bash
# Deploy security rules
firebase deploy --only firestore:rules

# Ověřit deployment
firebase firestore:rules:get
```

**Co se deployuje:**
- Nové admin helper funkce (`isAdmin()`, `isSuperAdmin()`)
- Security rules pro `userAnalytics`
- Security rules pro `adminMessages`
- Security rules pro `feedback`
- Security rules pro `subscriptions` a `payments`
- Security rules pro `affiliatePartners` a `affiliateReferrals`

### Krok 2: Deploy Firestore Indexes

```bash
# Deploy indexes
firebase deploy --only firestore:indexes

# Ověřit deployment
firebase firestore:indexes
```

**Co se deployuje:**
- 16 nových composite indexes pro admin queries
- Indexy pro user analytics
- Indexy pro messaging
- Indexy pro feedback
- Indexy pro finance a affiliate

⚠️ **Poznámka**: Vytvoření indexů může trvat několik minut. Sledujte progress v Firebase Console.

### Krok 3: Nastavit Admin Uživatele

Vytvořte Cloud Function pro nastavení admin role:

```typescript
// functions/src/setAdminRole.ts
import * as functions from 'firebase-functions'
import { auth } from './config/firebase'

export const setAdminRole = functions
  .region('europe-west1')
  .https.onCall(async (data, context) => {
    // Verify caller is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'Must be authenticated'
      )
    }

    // For first admin, you can skip this check
    // After that, only super_admin can set roles
    if (context.auth.token.role !== 'super_admin') {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Only super admins can set roles'
      )
    }

    const { userId, role } = data

    if (!['admin', 'super_admin', 'moderator'].includes(role)) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Invalid role'
      )
    }

    try {
      await auth.setCustomUserClaims(userId, { role })
      return { success: true, message: `Role ${role} set for user ${userId}` }
    } catch (error) {
      throw new functions.https.HttpsError(
        'internal',
        'Failed to set role'
      )
    }
  })
```

Deploy Cloud Function:

```bash
firebase deploy --only functions:setAdminRole
```

### Krok 4: Vytvořit Prvního Admin Uživatele

**Možnost A: Pomocí Firebase Console**

1. Otevřít Firebase Console → Authentication
2. Najít uživatele
3. V Cloud Functions → setAdminRole → Test
4. Zavolat funkci s parametry:
```json
{
  "userId": "USER_UID_HERE",
  "role": "super_admin"
}
```

**Možnost B: Pomocí Firebase Admin SDK (Node.js script)**

```javascript
// scripts/setFirstAdmin.js
const admin = require('firebase-admin')
const serviceAccount = require('./serviceAccountKey.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})

async function setFirstAdmin(email) {
  try {
    const user = await admin.auth().getUserByEmail(email)
    await admin.auth().setCustomUserClaims(user.uid, {
      role: 'super_admin'
    })
    console.log(`✅ Super admin role set for ${email}`)
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Použití
setFirstAdmin('admin@svatbot.cz')
```

Spustit:
```bash
node scripts/setFirstAdmin.js
```

### Krok 5: Deploy Next.js Aplikace

```bash
# Build aplikace
npm run build

# Deploy na Vercel
vercel --prod

# Nebo použít GitHub integration (automatický deploy)
git push origin main
```

### Krok 6: Ověřit Deployment

- [ ] Otevřít `/admin/login`
- [ ] Přihlásit se jako admin
- [ ] Zkontrolovat přístup k `/admin/analytics`
- [ ] Ověřit všechny záložky:
  - [ ] Přehled (statistiky)
  - [ ] Uživatelé (analytics table)
  - [ ] Zprávy (messaging)
  - [ ] Feedback (feedback management)
  - [ ] Finance (placeholder)
  - [ ] Affiliate (placeholder)
  - [ ] Vendors (link)

## 🧪 Testování

### Test User Tracking

1. Přihlásit se jako běžný uživatel
2. Navigovat na různé stránky
3. Počkat 1-2 minuty
4. Přihlásit se jako admin
5. Zkontrolovat User Analytics → měl by se zobrazit uživatel s aktivitou

### Test Feedback System

1. Přihlásit se jako běžný uživatel
2. Kliknout na floating feedback button (pravý dolní roh)
3. Vyplnit a odeslat feedback
4. Přihlásit se jako admin
5. Zkontrolovat Feedback záložku → měl by se zobrazit nový feedback

### Test Messaging

1. Vytvořit test konverzaci v Firestore:
```javascript
// V Firebase Console → Firestore
// Collection: adminMessages
{
  conversationId: "test_conv_1",
  userId: "USER_ID",
  userName: "Test User",
  userEmail: "test@example.com",
  messages: [{
    id: "msg_1",
    senderId: "USER_ID",
    senderType: "user",
    senderName: "Test User",
    content: "Ahoj, potřebuji pomoc",
    timestamp: new Date(),
    read: false
  }],
  status: "open",
  lastMessageAt: new Date(),
  unreadCount: 1,
  createdAt: new Date()
}
```

2. Přihlásit se jako admin
3. Zkontrolovat Messages záložku
4. Odpovědět na zprávu
5. Ověřit real-time update

## 🔧 Troubleshooting

### Problém: "Permission denied" při přístupu k admin dashboard

**Řešení:**
1. Ověřit custom claims:
```javascript
// V browser console
firebase.auth().currentUser.getIdTokenResult()
  .then(token => console.log(token.claims))
```

2. Pokud není role nastavena, nastavit pomocí Cloud Function nebo Admin SDK
3. Odhlásit se a znovu přihlásit (refresh token)

### Problém: Firestore indexes chybí

**Řešení:**
1. Zkontrolovat Firebase Console → Firestore → Indexes
2. Počkat na dokončení vytváření indexů (může trvat 5-10 minut)
3. Pokud stále chybí, znovu deploy:
```bash
firebase deploy --only firestore:indexes
```

### Problém: User tracking nefunguje

**Řešení:**
1. Zkontrolovat browser console pro chyby
2. Ověřit Firebase permissions v `firestore.rules`
3. Zkontrolovat, že `UserTrackingWrapper` je v layout
4. Ověřit, že uživatel je přihlášen

### Problém: Real-time updates nefungují

**Řešení:**
1. Zkontrolovat Firebase connection
2. Ověřit Firestore security rules
3. Zkontrolovat browser console pro WebSocket errors
4. Ověřit, že používáte `onSnapshot` místo `getDocs`

## 📊 Monitoring

### Firebase Console

Sledovat:
- **Authentication**: Počet uživatelů, přihlášení
- **Firestore**: Reads/Writes, Storage
- **Functions**: Invocations, Errors
- **Performance**: Page load times

### Vercel Analytics

Sledovat:
- **Traffic**: Page views, Unique visitors
- **Performance**: Core Web Vitals
- **Errors**: Runtime errors

## 🔐 Bezpečnost

### Po Deploymenu

- [ ] Změnit výchozí admin heslo
- [ ] Nastavit 2FA pro admin účty
- [ ] Zkontrolovat security rules
- [ ] Ověřit, že sensitive data nejsou v public repo
- [ ] Nastavit Firebase App Check (optional)
- [ ] Povolit pouze HTTPS

### Environment Variables

Ověřit, že tyto proměnné jsou nastaveny v Vercel:

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...
```

## ✅ Post-Deployment Checklist

- [ ] Admin dashboard je přístupný
- [ ] User tracking funguje
- [ ] Feedback button se zobrazuje
- [ ] Messaging systém funguje
- [ ] Real-time updates fungují
- [ ] Security rules jsou aktivní
- [ ] Indexes jsou vytvořeny
- [ ] Admin uživatel má správnou roli
- [ ] Monitoring je nastaven
- [ ] Dokumentace je aktuální

## 📞 Support

Pokud narazíte na problémy:
1. Zkontrolovat tento checklist
2. Zkontrolovat `ADMIN_DASHBOARD_SETUP.md`
3. Zkontrolovat Firebase Console logs
4. Zkontrolovat Vercel deployment logs
5. Kontaktovat vývojový tým

---

**Datum vytvoření**: 2025-10-20
**Verze**: 1.0.0
**Status**: ✅ Ready for Production

