# SvatBot.cz - Development Guide

## 🚀 Aktuální stav implementace

### ✅ Dokončeno (Fáze 1 - Setup)

1. **Projektová struktura**
   - Next.js 14 s App Router
   - TypeScript konfigurace
   - Tailwind CSS s custom design system
   - Základní adresářová struktura

2. **Design System**
   - Svatební color palette (Rose, Lavender, Gold)
   - Typography system (Playfair Display + Inter)
   - Component classes a utility funkce
   - Responsive mobile-first design

3. **State Management**
   - Zustand stores (auth, wedding)
   - Persistent storage
   - Type-safe state management

4. **Core Components**
   - WelcomeScreen - landing page s hero sekcí
   - AuthModal - přihlášení/registrace
   - OnboardingFlow - 6-krokový setup svatby
   - Dashboard - hlavní přehled s progress tracking
   - LoadingScreen - loading states

5. **Utility Functions**
   - Date utilities (formátování, relativní čas)
   - Currency utilities (CZK formátování)
   - Validation utilities
   - Wedding-specific helpers

6. **Type System**
   - Kompletní TypeScript typy pro všechny entity
   - Wedding, Guest, Budget, Venue, Vendor typy
   - API response typy

### 🔧 Technická architektura

```
src/
├── app/                 # Next.js App Router
│   ├── globals.css     # Global styles + design system
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Homepage
├── components/         # React komponenty
│   ├── auth/          # Autentifikace
│   ├── dashboard/     # Dashboard komponenty
│   ├── onboarding/    # Onboarding flow
│   └── ui/            # UI komponenty
├── config/            # Konfigurace (Firebase)
├── hooks/             # Custom React hooks
├── lib/               # Knihovny a utilities
├── stores/            # Zustand state management
├── types/             # TypeScript typy
└── utils/             # Utility funkce
```

## 🎯 Další kroky (Fáze 2 - Core Features)

### Priorita 1 - Autentifikace
- [ ] Firebase Auth implementace
- [ ] Google/Facebook login
- [ ] Email/password registrace
- [ ] Auth guards a middleware
- [ ] User profile management

### Priorita 2 - Wedding Builder
- [ ] Dokončit onboarding flow
- [ ] Uložení wedding dat do Firestore
- [ ] Progress tracking systém
- [ ] Wedding phases implementace

### Priorita 3 - Checklist System
- [ ] Task management komponenty
- [ ] Předpřipravené task templates
- [ ] Task categories a priority
- [ ] Due dates a notifications
- [ ] Progress calculation

### Priorita 4 - Guest Management
- [ ] Guest CRUD operace
- [ ] Import z kontaktů
- [ ] RSVP systém
- [ ] Guest categories
- [ ] Email/SMS komunikace

## 🎨 Design System Reference

### Barvy
```css
Primary: #F8BBD9 (Soft Rose)
Secondary: #E1D5E7 (Lavender)  
Accent: #F7DC6F (Gold)
Neutral: #FDFEFE (Cream White)
Text: #2C3E50 (Charcoal)
Success: #A9DFBF (Sage Green)
```

### Typography
```css
Headers: Playfair Display (elegant serif)
Body: Inter (modern sans-serif)
Buttons: Montserrat (bold sans-serif)
```

### Component Classes
```css
.wedding-card - základní card s shadow
.btn-primary - hlavní tlačítko
.btn-secondary - sekundární tlačítko
.btn-outline - outline tlačítko
.input-field - input pole
.progress-bar - progress bar
.heading-1 až heading-4 - nadpisy
.body-large, body-normal, body-small - text
```

## 🔥 Firebase Setup

### Potřebné služby
1. **Authentication**
   - Email/Password
   - Google Provider
   - Facebook Provider

2. **Firestore Database**
   - Collections: users, weddings, guests, tasks, vendors, venues
   - Security rules
   - Indexes

3. **Storage**
   - User photos
   - Wedding documents
   - Vendor portfolios

4. **Cloud Functions**
   - Email notifications
   - RSVP processing
   - Data validation

### Database Schema
```
users/{userId}
  - email, displayName, photoURL
  - createdAt, updatedAt

weddings/{weddingId}
  - userId, brideName, groomName
  - weddingDate, budget, style, region
  - progress: { overall, foundation, venue, ... }

guests/{guestId}
  - weddingId, firstName, lastName
  - email, phone, relationship
  - rsvpStatus, guestCount

tasks/{taskId}
  - weddingId, title, description
  - category, phase, priority, status
  - dueDate, completedDate
```

## 📱 Mobile Development (Fáze 3)

### React Native Setup
```bash
# V mobile/ adresáři
npx react-native init SvatBotMobile
cd mobile
npm install @react-navigation/native
npm install react-native-paper
npm install @react-native-firebase/app
```

### Shared Components
- Využít stejný design system
- Shared utility funkce
- Společné typy a interfaces

## 🧪 Testing Strategy

### Unit Tests
```bash
npm run test
```

### E2E Tests
```bash
npm run test:e2e
```

### Test Coverage
- Components: 80%+
- Utils: 90%+
- Stores: 85%+

## 🚀 Deployment

### Vercel (Web)
```bash
npm run build
vercel --prod
```

### Firebase Hosting
```bash
npm run build
firebase deploy
```

### Google Play Store (Mobile)
```bash
cd mobile
npx react-native build-android --mode=release
```

## 📊 Performance Targets

### Web Vitals
- LCP: < 2.5s
- FID: < 100ms
- CLS: < 0.1

### Bundle Size
- Initial: < 200KB
- Total: < 1MB

## 🔍 Monitoring

### Analytics
- Google Analytics 4
- Firebase Analytics
- Custom events tracking

### Error Tracking
- Sentry integration
- Firebase Crashlytics

## 🤝 Contributing

### Code Style
- ESLint + Prettier
- TypeScript strict mode
- Conventional commits

### Pull Request Process
1. Feature branch z main
2. Implementace + testy
3. Code review
4. Merge do main

## 📞 Support

### Development Team
- Frontend: React/Next.js expert
- Backend: Firebase/Node.js expert  
- Mobile: React Native expert
- Design: UI/UX designer

### Resources
- [Next.js Docs](https://nextjs.org/docs)
- [Firebase Docs](https://firebase.google.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Native](https://reactnative.dev/docs)

---

**Status**: ✅ Fáze 1 dokončena - Základní setup a komponenty
**Další**: 🔄 Fáze 2 - Firebase integrace a core features
