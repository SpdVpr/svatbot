# 🔥 FIREBASE MIGRATION GUIDE - SVATBOT

Kompletní průvodce migrací z mock dat na Firebase Real API.

## ✅ CO BYLO DOKONČENO

### 🔧 **1. Firebase Konfigurace**
- ✅ Firebase SDK konfigurace (`lib/firebase.ts`)
- ✅ Environment variables setup (`.env.local`)
- ✅ Emulators konfigurace pro development
- ✅ Firebase dependencies v `package.json`

### 🔐 **2. Authentication System**
- ✅ Firebase Auth hook (`hooks/useAuth.ts`)
- ✅ AuthProvider pro celou aplikaci
- ✅ Role-based authentication (USER, VENDOR, ADMIN, SUPER_ADMIN)
- ✅ Admin login aktualizován na Firebase

### 🏪 **3. Vendor Marketplace**
- ✅ Firebase vendors hook (`hooks/useVendors.ts`)
- ✅ Real-time Firestore listeners
- ✅ Callable Functions pro komplexní queries
- ✅ VendorCard komponenta s Firebase integrací
- ✅ Marketplace stránka aktualizována

### 📸 **4. Image Upload System**
- ✅ Firebase Storage hook (`hooks/useImageUpload.ts`)
- ✅ Drag & drop upload funkcionalita
- ✅ Automatická optimalizace obrázků
- ✅ Multiple files upload

### 🔔 **5. Real-time Notifications**
- ✅ Notifications hook (`hooks/useNotifications.ts`)
- ✅ Real-time Firestore listeners
- ✅ Toast notifications system

### 🔧 **6. Admin Panel**
- ✅ Admin hooks (`hooks/useAdmin.ts`)
- ✅ Statistics dashboard
- ✅ Vendor management
- ✅ System health monitoring

### 📦 **7. Backend Infrastructure**
- ✅ Firebase Functions (`functions/`)
- ✅ Express.js REST API
- ✅ Callable Functions
- ✅ Trigger Functions
- ✅ Security Rules (Firestore + Storage)

## 🚀 DEPLOYMENT KROKY

### **1. Firebase Setup**

```bash
# Instalace Firebase CLI
npm install -g firebase-tools

# Přihlášení
firebase login

# Inicializace projektu (pokud ještě není)
firebase init

# Výběr služeb:
# - Functions
# - Firestore
# - Storage
# - Hosting (volitelné)
```

### **2. Environment Variables**

Aktualizujte `.env.local` s vašimi Firebase údaji:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_USE_FIREBASE_EMULATORS=false
```

### **3. Deploy Firebase Backend**

```bash
# Deploy všech služeb
./scripts/deploy-firebase.sh all

# Nebo jednotlivě:
./scripts/deploy-firebase.sh functions    # Pouze Functions
./scripts/deploy-firebase.sh rules       # Pouze Security Rules
./scripts/deploy-firebase.sh backend     # Functions + Rules
```

### **4. Inicializace dat**

Po deployi spusťte seed script pro vytvoření testovacích dat:

```bash
# V Firebase Functions složce
cd functions
npm run seed
```

## 🔄 MIGRACE KROKY

### **1. Odstranění Mock Hooks**

Mock hooks byly nahrazeny Firebase hooks:
- ❌ `useMarketplace` → ✅ `useVendors`
- ❌ `useAdmin` (mock) → ✅ `useAuth` + `useAdminStats`
- ❌ Mock data → ✅ Firebase Firestore

### **2. Aktualizace Komponent**

Všechny komponenty byly aktualizovány:
- ✅ Marketplace stránka (`src/app/marketplace/page.tsx`)
- ✅ Admin login (`src/app/admin/login/page.tsx`)
- ✅ Layout s AuthProvider (`src/app/layout.tsx`)

### **3. Nové Hooks**

Přidané Firebase hooks:
- ✅ `useAuth` - Firebase Authentication
- ✅ `useVendors` - Vendor marketplace
- ✅ `useImageUpload` - Firebase Storage
- ✅ `useNotifications` - Real-time notifikace
- ✅ `useAdmin` - Admin funkcionalita
- ✅ `useFavorites` - Oblíbení dodavatelé
- ✅ `useDebounce` - Debouncing utility

## 🧪 TESTOVÁNÍ

### **1. Development s Emulátory**

```bash
# Spuštění Firebase emulátorů
firebase emulators:start

# V .env.local nastavte:
NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true

# Spuštění Next.js
npm run dev
```

### **2. Production Test**

```bash
# Build a test produkční verze
npm run build
npm start

# Test Firebase Functions
curl https://your-region-your-project.cloudfunctions.net/api/health
```

## 📊 FIREBASE SERVICES

### **Firestore Collections**

```
/users/{userId}           - Uživatelé
/vendors/{vendorId}       - Dodavatelé
/services/{serviceId}     - Služby
/reviews/{reviewId}       - Hodnocení
/inquiries/{inquiryId}    - Poptávky
/favorites/{favoriteId}   - Oblíbené
/notifications/{notificationId} - Notifikace
/analytics/{analyticsId}  - Analytics
/adminLogs/{logId}        - Admin logy
```

### **Storage Structure**

```
/svatbot/{userId}/        - Vendor obrázky
/portfolio/{userId}/      - Portfolio obrázky
/profiles/{userId}/       - Profilové obrázky
/admin/                   - Admin uploads
```

### **Functions**

```
/api                      - Express.js REST API
getVendors               - Callable function
createVendor             - Callable function
onUserCreate             - Auth trigger
onVendorUpdate           - Firestore trigger
scheduledCleanup         - Scheduled function
```

## 🔒 SECURITY

### **Firestore Rules**

- ✅ Role-based přístup
- ✅ Vendor ownership kontrola
- ✅ Public read pro aktivní vendors
- ✅ Admin-only operace

### **Storage Rules**

- ✅ User ownership kontrola
- ✅ File type validace
- ✅ Size limits (10MB)
- ✅ Public read pro vendor images

## 🚨 TROUBLESHOOTING

### **Časté problémy:**

1. **Firebase not initialized**
   ```bash
   # Zkontrolujte .env.local
   # Restartujte development server
   ```

2. **Permission denied**
   ```bash
   # Zkontrolujte Security Rules
   # Ověřte user authentication
   ```

3. **Functions timeout**
   ```bash
   # Zkontrolujte Functions logs
   firebase functions:log
   ```

4. **Emulators connection failed**
   ```bash
   # Restartujte emulátory
   firebase emulators:start --only auth,firestore,functions,storage
   ```

## 📈 MONITORING

### **Firebase Console**
- Functions performance
- Firestore usage
- Storage usage
- Authentication users

### **Logs**
```bash
# Functions logs
firebase functions:log

# Real-time logs
firebase functions:log --follow
```

## ✅ CHECKLIST

- [ ] Firebase projekt vytvořen
- [ ] Environment variables nastaveny
- [ ] Firebase Functions deployed
- [ ] Security Rules deployed
- [ ] Seed data vytvořena
- [ ] Frontend testován s Firebase
- [ ] Admin panel funkční
- [ ] Real-time updates fungují
- [ ] Image upload testován
- [ ] Authentication testována

## 🎉 VÝSLEDEK

Po dokončení migrace máte:

✅ **Produkční Firebase backend**
✅ **Real-time marketplace**
✅ **Secure authentication**
✅ **Image upload system**
✅ **Admin panel**
✅ **Auto-scaling infrastructure**
✅ **Zero server maintenance**

**Firebase Real API je připraveno nahradit všechna mock data!** 🔥🎊
