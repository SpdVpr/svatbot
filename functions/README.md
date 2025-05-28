# 🔥 SvatBot Firebase Functions - Real API

Kompletní Firebase backend pro SvatBot marketplace - profesionální svatební platforma.

## 🏗️ Architektura

- **Firebase Functions** - Serverless backend
- **Firestore** - NoSQL databáze
- **Firebase Auth** - Autentifikace a autorizace
- **Firebase Storage** - Upload a správa obrázků
- **Express.js** - REST API framework
- **TypeScript** - Type safety

## 📋 Požadavky

- Node.js 18+
- Firebase CLI
- Firebase projekt s aktivovanými službami:
  - Authentication
  - Firestore Database
  - Cloud Storage
  - Cloud Functions

## 🚀 Rychlý start

### 1. Instalace Firebase CLI

```bash
npm install -g firebase-tools
firebase login
```

### 2. Inicializace projektu

```bash
# V root složce projektu
firebase init

# Vyberte:
# - Functions
# - Firestore
# - Storage
# - Hosting (volitelné)
```

### 3. Konfigurace Firebase

```bash
# Nastavte Firebase projekt
firebase use --add your-project-id
```

### 4. Instalace závislostí

```bash
cd functions
npm install
```

### 5. Nastavení prostředí

```bash
# Nastavte environment proměnné
firebase functions:config:set app.environment="development"
firebase functions:config:set app.cors_origin="http://localhost:3000"

# Pro produkci
firebase functions:config:set app.environment="production"
firebase functions:config:set app.cors_origin="https://svatbot.cz"
```

### 6. Build a deploy

```bash
# Build TypeScript
npm run build

# Deploy všechny funkce
firebase deploy

# Deploy pouze funkce
firebase deploy --only functions

# Deploy pouze Firestore rules
firebase deploy --only firestore:rules

# Deploy pouze Storage rules
firebase deploy --only storage
```

## 📚 API Dokumentace

### Base URL
```
https://your-region-your-project.cloudfunctions.net/api/api/v1
```

### Autentifikace

Všechny chráněné endpointy vyžadují Firebase Auth token:

```javascript
// Frontend - získání tokenu
const user = firebase.auth().currentUser
const token = await user.getIdToken()

// API volání
fetch('/api/v1/vendors', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```

### REST API Endpointy

#### Autentifikace
```bash
POST /api/v1/auth/register     # Registrace uživatele
POST /api/v1/auth/login        # Přihlášení (server-side logic)
GET  /api/v1/auth/profile      # Profil uživatele
PUT  /api/v1/auth/profile      # Úprava profilu
POST /api/v1/auth/verify-email # Ověření emailu
```

#### Dodavatelé
```bash
GET    /api/v1/vendors              # Seznam dodavatelů
GET    /api/v1/vendors/:id          # Detail dodavatele
POST   /api/v1/vendors              # Vytvoření dodavatele
PUT    /api/v1/vendors/:id          # Úprava dodavatele
DELETE /api/v1/vendors/:id          # Smazání dodavatele

# Služby
GET    /api/v1/vendors/:id/services
POST   /api/v1/vendors/:id/services
PUT    /api/v1/vendors/:id/services/:serviceId
DELETE /api/v1/vendors/:id/services/:serviceId

# Obrázky
POST   /api/v1/vendors/:id/images
DELETE /api/v1/vendors/:id/images/:imageId

# Hodnocení
GET    /api/v1/vendors/:id/reviews
POST   /api/v1/vendors/:id/reviews

# Poptávky
POST   /api/v1/vendors/:id/inquiries
GET    /api/v1/vendors/:id/inquiries
```

#### Upload
```bash
POST   /api/v1/upload/images        # Upload více obrázků
POST   /api/v1/upload/image         # Upload jednoho obrázku
DELETE /api/v1/upload/images/:filename
```

#### Admin
```bash
GET /api/v1/admin/stats             # Statistiky
GET /api/v1/admin/vendors           # Správa dodavatelů
PUT /api/v1/admin/vendors/:id/verify
PUT /api/v1/admin/vendors/:id/feature
```

### Callable Functions

Pro přímé volání z frontendu:

```javascript
import { getFunctions, httpsCallable } from 'firebase/functions'

const functions = getFunctions()

// Získání dodavatelů
const getVendors = httpsCallable(functions, 'getVendors')
const result = await getVendors({
  page: 1,
  limit: 20,
  category: 'photographer',
  city: 'Praha'
})

// Vytvoření dodavatele
const createVendor = httpsCallable(functions, 'createVendor')
const vendor = await createVendor({
  name: 'Foto Studio',
  category: 'photographer',
  description: 'Profesionální svatební fotografie',
  // ...další data
})
```

## 🗄️ Firestore Struktura

### Collections

```
/users/{userId}
  - email: string
  - firstName: string
  - lastName: string
  - role: 'user' | 'vendor' | 'admin' | 'super_admin'
  - verified: boolean
  - createdAt: timestamp

/vendors/{vendorId}
  - userId: string
  - name: string
  - slug: string
  - category: VendorCategory
  - description: string
  - verified: boolean
  - featured: boolean
  - active: boolean
  - address: Address
  - priceRange: PriceRange
  - rating: VendorRating
  - stats: VendorStats

/services/{serviceId}
  - vendorId: string
  - name: string
  - description: string
  - price: number
  - priceType: ServicePriceType
  - active: boolean

/reviews/{reviewId}
  - vendorId: string
  - userId: string
  - rating: number (1-5)
  - text: string
  - quality: number
  - communication: number
  - value: number
  - professionalism: number
  - verified: boolean

/inquiries/{inquiryId}
  - vendorId: string
  - userId?: string
  - name: string
  - email: string
  - message: string
  - status: InquiryStatus
  - priority: InquiryPriority

/favorites/{favoriteId}
  - userId: string
  - vendorId: string

/analytics/{analyticsId}
  - vendorId: string
  - date: timestamp
  - views: number
  - inquiries: number

/notifications/{notificationId}
  - userId: string
  - type: NotificationType
  - title: string
  - message: string
  - read: boolean
```

## 🔐 Security Rules

### Firestore Rules

```javascript
// Uživatelé - pouze vlastník a admin
match /users/{userId} {
  allow read, write: if isOwner(userId) || isAdmin();
}

// Dodavatelé - veřejné čtení aktivních, vlastník může upravovat
match /vendors/{vendorId} {
  allow read: if resource.data.active == true || isOwner(resource.data.userId) || isAdmin();
  allow write: if isOwner(resource.data.userId) || isAdmin();
}

// Hodnocení - veřejné čtení ověřených, autor může upravovat
match /reviews/{reviewId} {
  allow read: if resource.data.verified == true || isOwner(resource.data.userId) || isAdmin();
  allow write: if isOwner(resource.data.userId) || isAdmin();
}
```

### Storage Rules

```javascript
// Obrázky dodavatelů - veřejné čtení, vlastník může nahrávat
match /svatbot/{userId}/{fileName} {
  allow read: if true;
  allow write: if isOwner(userId) && isValidImageFile();
}
```

## ⚡ Cloud Functions

### HTTP Functions

- **api** - Express.js REST API
- **getVendors** - Callable function pro získání dodavatelů
- **createVendor** - Callable function pro vytvoření dodavatele

### Trigger Functions

- **onUserCreate** - Vytvoření uživatelského profilu
- **onVendorUpdate** - Reakce na změny dodavatele
- **onReviewCreate** - Přepočet hodnocení dodavatele
- **onInquiryCreate** - Notifikace o nové poptávce

### Scheduled Functions

- **scheduledCleanup** - Denní úklid dat (2:00 AM)

## 🚀 Deployment

### Development

```bash
# Spuštění emulátorů
firebase emulators:start

# Emulátory běží na:
# - Functions: http://localhost:5001
# - Firestore: http://localhost:8080
# - Auth: http://localhost:9099
# - Storage: http://localhost:9199
```

### Production

```bash
# Deploy všech služeb
firebase deploy

# Deploy pouze funkcí
firebase deploy --only functions

# Deploy s konkrétní funkcí
firebase deploy --only functions:api

# Monitoring
firebase functions:log
```

## 📊 Monitoring

### Logs

```bash
# Sledování logů
firebase functions:log

# Filtrování podle funkce
firebase functions:log --only api

# Real-time logs
firebase functions:log --follow
```

### Metriky

- **Firebase Console** - Přehled výkonu funkcí
- **Cloud Monitoring** - Detailní metriky
- **Error Reporting** - Sledování chyb

## 🔧 Konfigurace

### Environment Variables

```bash
# Nastavení konfigurace
firebase functions:config:set key="value"

# Zobrazení konfigurace
firebase functions:config:get

# Příklady
firebase functions:config:set app.environment="production"
firebase functions:config:set app.cors_origin="https://svatbot.cz"
firebase functions:config:set email.smtp_host="smtp.gmail.com"
```

### Local Development

```bash
# Stažení konfigurace pro lokální vývoj
firebase functions:config:get > .runtimeconfig.json
```

## 🧪 Testování

```bash
# Spuštění testů
npm test

# Testování s emulátory
firebase emulators:exec "npm test"

# Linting
npm run lint

# Build check
npm run build
```

## 📈 Optimalizace

### Performance

- **Cold starts** - Minimalizace pomocí keep-warm funkcí
- **Memory usage** - Optimalizace velikosti funkcí
- **Concurrent executions** - Nastavení limitů

### Costs

- **Function execution time** - Optimalizace rychlosti
- **Memory allocation** - Správné nastavení paměti
- **Invocations** - Minimalizace zbytečných volání

## 🔄 CI/CD

### GitHub Actions

```yaml
name: Deploy to Firebase
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          projectId: your-project-id
```

## 📄 Licence

MIT License - viz [LICENSE](../LICENSE) soubor.

---

**SvatBot Firebase API v1.0.0** - Kompletní Firebase backend pro svatební marketplace 🔥💍
