# 🔧 SvatBot.cz - Technické detaily

## 📋 Obsah
1. [Architektura](#architektura)
2. [Databázová struktura](#databázová-struktura)
3. [API Endpointy](#api-endpointy)
4. [Moduly - Detailní popis](#moduly---detailní-popis)
5. [AI Systém](#ai-systém)
6. [Integrace](#integrace)
7. [Deployment](#deployment)

---

## 🏗️ Architektura

### High-level architektura
```
┌─────────────────────────────────────────────────────────┐
│                    Vercel Edge Network                   │
│                   (CDN + Edge Functions)                 │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                  Next.js 14 App Router                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Frontend   │  │  API Routes  │  │  Middleware  │  │
│  │  (React 18)  │  │  (Serverless)│  │  (Subdomain) │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Firebase   │    │   OpenAI     │    │  External    │
│              │    │   GPT-4o     │    │  APIs        │
│ • Auth       │    │   mini       │    │              │
│ • Firestore  │    │              │    │ • Google Cal │
│ • Storage    │    │              │    │ • Spotify    │
│ • Functions  │    │              │    │ • SendGrid   │
└──────────────┘    └──────────────┘    └──────────────┘
```

### Frontend architektura
```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Homepage (Dashboard/Welcome)
│   ├── guests/            # Správa hostů
│   ├── budget/            # Rozpočet
│   ├── tasks/             # Úkoly
│   ├── seating/           # Seating plan
│   ├── marketplace/       # Marketplace dodavatelů
│   ├── ai/                # AI asistent
│   ├── wedding-website/   # Builder svatebního webu
│   ├── w/[customUrl]/     # Veřejný svatební web (path-based)
│   ├── wedding/[customUrl]/ # Veřejný svatební web (subdomain)
│   └── api/               # API routes
│       ├── ai/chat/       # AI chatbot endpoint
│       ├── auth/          # Autentifikace
│       ├── vercel/        # Vercel domain management
│       └── ...
├── components/            # React komponenty
│   ├── dashboard/         # Dashboard moduly
│   ├── guests/            # Guest management
│   ├── budget/            # Budget tracking
│   ├── ai/                # AI komponenty
│   ├── wedding-website/   # Website builder
│   └── ui/                # Reusable UI komponenty
├── hooks/                 # Custom React hooks
│   ├── useAuth.ts         # Autentifikace
│   ├── useWedding.ts      # Wedding data
│   ├── useGuest.ts        # Guest management
│   ├── useBudget.ts       # Budget tracking
│   ├── useTask.ts         # Task management
│   ├── useAI.ts           # AI assistant
│   └── ...
├── lib/                   # Utility libraries
│   ├── firebase.ts        # Firebase config
│   ├── ai-client.ts       # AI client
│   ├── subdomain.ts       # Subdomain handling
│   └── ...
├── types/                 # TypeScript types
│   ├── index.ts           # Core types
│   ├── guest.ts           # Guest types
│   ├── budget.ts          # Budget types
│   ├── wedding-website.ts # Website types
│   └── ...
└── stores/                # Zustand stores (legacy)
```

---

## 🗄️ Databázová struktura

### Firebase Firestore Collections

#### 1. **users** (Uživatelé)
```typescript
users/{userId}
  - email: string
  - firstName: string
  - lastName: string
  - phone: string | null
  - role: 'user' | 'admin' | 'vendor'
  - verified: boolean
  - active: boolean
  - createdAt: Timestamp
  - updatedAt: Timestamp
  - lastLoginAt: Timestamp | null
  - profileImage: string | null
  - preferences: {
      emailNotifications: boolean
      pushNotifications: boolean
      marketingEmails: boolean
      language: 'cs' | 'en'
      currency: 'CZK' | 'EUR'
    }
```

#### 2. **weddings** (Svatby)
```typescript
weddings/{weddingId}
  - userId: string (ref to users)
  - brideName: string
  - groomName: string
  - weddingDate: Timestamp
  - budget: number
  - style: 'classic' | 'modern' | 'rustic' | 'bohemian' | 'minimalist'
  - region: string
  - venue: string | null
  - guestCount: number
  - ceremonyLocation: string | null
  - receptionLocation: string | null
  - createdAt: Timestamp
  - updatedAt: Timestamp
  - progress: {
      overall: number (0-100)
      foundation: number
      venue: number
      vendors: number
      guests: number
      details: number
    }
```

#### 3. **guests** (Hosté)
```typescript
guests/{guestId}
  - weddingId: string (ref to weddings)
  - firstName: string
  - lastName: string
  - email: string | null
  - phone: string | null
  - relationship: 'family' | 'friends' | 'colleagues' | 'other'
  - side: 'bride' | 'groom' | 'both'
  - rsvpStatus: 'pending' | 'attending' | 'declined' | 'maybe'
  - guestCount: number (včetně plus one)
  - hasPlusOne: boolean
  - plusOneName: string | null
  - dietaryRestrictions: string[]
  - accommodationInterest: 'interested' | 'not-interested' | 'unknown'
  - notes: string | null
  - tableNumber: number | null
  - seatNumber: number | null
  - invitationSent: boolean
  - invitationSentAt: Timestamp | null
  - rsvpSubmittedAt: Timestamp | null
  - createdAt: Timestamp
  - updatedAt: Timestamp
```

#### 4. **budgetItems** (Rozpočtové položky)
```typescript
budgetItems/{itemId}
  - weddingId: string (ref to weddings)
  - category: 'venue' | 'catering' | 'photography' | 'flowers' | 'music' | 'attire' | 'decoration' | 'transportation' | 'stationery' | 'other'
  - name: string
  - description: string | null
  - plannedAmount: number
  - actualAmount: number
  - paidAmount: number
  - vendor: string | null
  - vendorId: string | null (ref to vendors)
  - status: 'planned' | 'booked' | 'paid' | 'completed'
  - dueDate: Timestamp | null
  - paidDate: Timestamp | null
  - notes: string | null
  - priority: 'low' | 'medium' | 'high'
  - createdAt: Timestamp
  - updatedAt: Timestamp
```

#### 5. **tasks** (Úkoly)
```typescript
tasks/{taskId}
  - weddingId: string (ref to weddings)
  - title: string
  - description: string | null
  - category: 'venue' | 'catering' | 'photography' | 'flowers' | 'music' | 'attire' | 'decoration' | 'transportation' | 'stationery' | 'beauty' | 'organization' | 'custom'
  - phase: 'foundation' | 'venue' | 'vendors' | 'guests' | 'details' | 'final'
  - priority: 'low' | 'medium' | 'high'
  - status: 'todo' | 'in-progress' | 'completed' | 'cancelled'
  - dueDate: Timestamp | null
  - completedDate: Timestamp | null
  - assignedTo: string | null
  - notes: string | null
  - order: number
  - createdAt: Timestamp
  - updatedAt: Timestamp
```

#### 6. **milestones** (Timeline události)
```typescript
milestones/{milestoneId}
  - weddingId: string (ref to weddings)
  - title: string
  - description: string | null
  - date: Timestamp
  - time: string (HH:mm)
  - duration: number (minutes)
  - location: string | null
  - type: 'ceremony' | 'reception' | 'party' | 'other'
  - responsiblePerson: string | null
  - notes: string | null
  - order: number
  - createdAt: Timestamp
  - updatedAt: Timestamp
```

#### 7. **vendors** (Dodavatelé - Marketplace)
```typescript
vendors/{vendorId}
  - name: string
  - category: 'venue' | 'photographer' | 'florist' | 'caterer' | 'musician' | 'videographer' | 'decorator' | 'makeup' | 'transportation' | 'other'
  - description: string
  - shortDescription: string
  - email: string
  - phone: string
  - website: string | null
  - instagram: string | null
  - facebook: string | null
  - address: {
      street: string
      city: string
      region: string
      zipCode: string
    }
  - location: {
      lat: number
      lng: number
    }
  - priceRange: 'budget' | 'moderate' | 'luxury'
  - priceFrom: number | null
  - priceTo: number | null
  - rating: number (0-5)
  - reviewCount: number
  - images: string[] (URLs)
  - portfolioImages: string[] (URLs)
  - services: string[]
  - features: string[]
  - availability: {
      weekdays: boolean
      weekends: boolean
      holidays: boolean
    }
  - verified: boolean
  - featured: boolean
  - active: boolean
  - createdAt: Timestamp
  - updatedAt: Timestamp
  - metadata: {
      source: 'manual' | 'scraped' | 'api'
      lastScraped: Timestamp | null
      googlePlaceId: string | null
    }
```

#### 8. **weddingWebsites** (Svatební weby)
```typescript
weddingWebsites/{websiteId}
  - weddingId: string (ref to weddings)
  - userId: string (ref to users)
  - customUrl: string (unique, lowercase, alphanumeric + dash)
  - subdomain: string (e.g., "jana-petr.svatbot.cz")
  - template: 'classic-elegance' | 'modern-minimalist' | 'rustic-charm' | 'bohemian-dream'
  - isPublished: boolean
  - isDraft: boolean
  - content: {
      hero: {
        bride: string
        groom: string
        weddingDate: Timestamp
        tagline: string
        mainImage: string | null
      }
      story: {
        enabled: boolean
        title: string
        content: string
        images: string[]
      }
      info: {
        enabled: boolean
        ceremonyTime: string
        ceremonyLocation: string
        ceremonyAddress: string
        receptionTime: string
        receptionLocation: string
        receptionAddress: string
      }
      dressCode: {
        enabled: boolean
        description: string
        images: string[]
      }
      schedule: {
        enabled: boolean
        items: Array<{
          time: string
          title: string
          description: string
        }>
      }
      rsvp: {
        enabled: boolean
        deadline: Timestamp
        mealSelection: boolean
        plusOneAllowed: boolean
        songRequests: boolean
      }
      accommodation: {
        enabled: boolean
        showPrices: boolean
        showAvailability: boolean
      }
      gift: {
        enabled: boolean
        registryUrl: string | null
        bankAccount: string | null
        message: string
      }
      contact: {
        enabled: boolean
        bride: { name: string, phone: string, email: string }
        groom: { name: string, phone: string, email: string }
      }
      faq: {
        enabled: boolean
        items: Array<{
          question: string
          answer: string
        }>
      }
    }
  - style: {
      primaryColor: string
      secondaryColor: string
      accentColor: string
      fontFamily: string
      fontHeading: string
      backgroundColor: string
    }
  - settings: {
      isPasswordProtected: boolean
      password: string | null
      allowComments: boolean
      showGuestList: boolean
    }
  - analytics: {
      views: number
      uniqueVisitors: number
      rsvpSubmissions: number
      lastVisit: Timestamp | null
    }
  - seo: {
      title: string
      description: string
      image: string | null
    }
  - createdAt: Timestamp
  - updatedAt: Timestamp
  - publishedAt: Timestamp | null
```

#### 9. **rsvpResponses** (RSVP odpovědi)
```typescript
rsvpResponses/{responseId}
  - websiteId: string (ref to weddingWebsites)
  - weddingId: string (ref to weddings)
  - guestId: string | null (ref to guests, if matched)
  - name: string
  - email: string
  - phone: string | null
  - attending: boolean
  - guestCount: number
  - dietaryRestrictions: string | null
  - mealChoice: string | null
  - songRequest: string | null
  - message: string | null
  - submittedAt: Timestamp
  - ipAddress: string | null
```

#### 10. **dashboardLayouts** (Dashboard layouts)
```typescript
dashboardLayouts/{userId}
  - modules: Array<{
      id: string
      type: string
      title: string
      size: 'small' | 'medium' | 'large' | 'full'
      position: { row: number, column: number }
      isVisible: boolean
      isLocked: boolean
      order: number
    }>
  - isLocked: boolean
  - updatedAt: Timestamp
```

---

## 🔌 API Endpointy

### AI Endpoints

#### POST `/api/ai/chat`
Chatbot konverzace s AI asistentem.

**Request:**
```typescript
{
  question: string
  context?: AIWeddingContext
}
```

**Response:**
```typescript
{
  response: string
  error?: string
}
```

**AIWeddingContext:**
```typescript
{
  budget?: number
  guestCount?: number
  weddingDate?: Date
  guests?: Guest[]
  budgetItems?: BudgetItem[]
  currentTasks?: Task[]
  milestones?: Milestone[]
  budgetStats?: {
    totalBudget: number
    totalSpent: number
    totalPaid: number
    remaining: number
    budgetUsed: number
  }
  guestStats?: {
    total: number
    confirmed: number
    declined: number
    pending: number
    withDietaryRestrictions: number
    needingAccommodation: number
  }
  taskStats?: {
    total: number
    completed: number
    inProgress: number
    todo: number
    overdue: number
  }
}
```

### Vercel Domain Management

#### POST `/api/vercel/add-domain`
Přidá subdoménu do Vercel projektu.

**Request:**
```typescript
{
  subdomain: string  // e.g., "jana-petr"
}
```

**Response:**
```typescript
{
  success: boolean
  domain?: string    // e.g., "jana-petr.svatbot.cz"
  error?: string
}
```

### Authentication (Firebase)

Autentifikace je řešena přes Firebase Authentication SDK na klientu.

**Podporované metody:**
- Email/Password
- Google OAuth
- (Plánováno: Facebook, Apple)

---

## 📦 Moduly - Detailní popis

### 1. Dashboard Module
**Soubory:**
- `src/components/dashboard/Dashboard.tsx`
- `src/components/dashboard/GridDragDrop.tsx`
- `src/hooks/useDashboard.ts`

**Funkce:**
- Drag & drop přeuspořádání modulů
- Skrývání/zobrazování modulů
- Zamykání layoutu
- Real-time synchronizace s Firebase
- Responzivní grid layout

**Dostupné moduly:**
- Wedding Countdown
- Quick Actions
- Task Management
- Guest Management
- Budget Tracking
- Timeline Planning
- Vendor Management
- Seating Plan
- Wedding Day Timeline
- Moodboard
- Wedding Checklist
- Music Playlist
- Food & Drinks
- Wedding Website
- Accommodation Management
- Shopping List

### 2. Guest Management Module
**Soubory:**
- `src/app/guests/page.tsx`
- `src/hooks/useRobustGuests.ts`
- `src/components/guests/GuestList.tsx`

**Funkce:**
- CRUD operace s hosty
- Import z Excel/CSV
- Kategorizace (rodina, přátelé, kolegové)
- RSVP tracking
- Dietní omezení a alergie
- Ubytování a doprava
- Plus one management
- Real-time synchronizace
- Export do Excel

**Datový tok:**
```
User Input → useRobustGuests → Firebase Firestore → Real-time listener → UI Update
```

### 3. Budget Module
**Soubory:**
- `src/app/budget/page.tsx`
- `src/hooks/useBudget.ts`
- `src/components/budget/BudgetOverview.tsx`

**Funkce:**
- Správa rozpočtových položek
- Kategorizace výdajů
- Plánované vs. skutečné náklady
- Sledování plateb
- Grafy a statistiky (Recharts)
- Export do Excel
- Propojení s vendors

**Statistiky:**
- Celkový rozpočet
- Celkové výdaje
- Zaplaceno
- Zbývá zaplatit
- % využití rozpočtu
- Breakdown po kategoriích

### 4. Task Management Module
**Soubory:**
- `src/app/tasks/page.tsx`
- `src/hooks/useTask.ts`
- `src/data/weddingChecklistTemplates.ts`

**Funkce:**
- Předpřipravené checklisty
- Vlastní úkoly
- Kategorizace a prioritizace
- Termíny a deadlines
- Sledování pokroku
- Filtrování a řazení
- Propojení s wedding checklist

**Kategorie úkolů:**
- Místo konání
- Catering
- Fotografie
- Květiny
- Hudba
- Oblečení
- Dekorace
- Doprava
- Tiskoviny
- Krása
- Organizace
- Vlastní

### 5. Seating Plan Module
**Soubory:**
- `src/app/seating/page.tsx`
- `src/hooks/useSeatingPlan.ts`
- `src/components/seating/SeatingCanvas.tsx`

**Funkce:**
- Interaktivní canvas editor
- Drag & drop stolů
- Různé tvary stolů (kulaté, obdélníkové, čtvercové)
- Nastavitelná kapacita
- Přiřazování hostů k místům
- Dance floor editor
- Zoom a pan
- Export do PDF

**Technologie:**
- HTML5 Canvas
- Custom drag & drop implementace
- Real-time rendering

### 6. Wedding Website Builder
**Soubory:**
- `src/app/wedding-website/builder/page.tsx`
- `src/hooks/useWeddingWebsite.ts`
- `src/components/wedding-website/templates/`

**Funkce:**
- Výběr šablony
- Konfigurace custom URL
- Content editor
- Preview režim
- Publikování na subdoménu
- SEO nastavení
- Analytics tracking

**Šablony:**
- Classic Elegance
- Modern Minimalist
- Rustic Charm (plánováno)
- Bohemian Dream (plánováno)

**Sekce:**
- Hero (jména, datum, foto)
- Náš příběh
- Informace (místo, čas)
- Dress code
- Časový harmonogram
- RSVP formulář
- Ubytování
- Dary
- Kontakt
- FAQ

### 7. AI Assistant Module
**Soubory:**
- `src/app/ai/page.tsx`
- `src/hooks/useAI.ts`
- `src/lib/ai-client.ts`
- `src/app/api/ai/chat/route.ts`

**Funkce:**
- Chat interface
- Přístup k reálným datům uživatele
- Kontextové odpovědi
- Quick suggestions
- Historie konverzace
- Floating window režim

**AI Capabilities:**
- Odpovědi na otázky o hostech (alergie, RSVP status)
- Analýza rozpočtu
- Kontrola úkolů a deadlines
- Doporučení dodavatelů
- Timeline generování
- Budget optimalizace

**Datový tok:**
```
User Question → useAI.buildContext() → Collect all data (guests, budget, tasks)
→ POST /api/ai/chat → buildDetailedContext() → OpenAI GPT-4o-mini
→ Response → Display to user
```

### 8. Marketplace Module
**Soubory:**
- `src/app/marketplace/page.tsx`
- `src/hooks/useVendors.ts`
- `src/app/admin/marketplace/page.tsx`

**Funkce:**
- Katalog dodavatelů
- Filtrování (kategorie, region, cena)
- Vyhledávání
- Detail dodavatele
- Portfolio galerie
- Kontaktní formulář
- Propojení s rozpočtem
- Admin panel pro správu

**Kategorie:**
- Místa konání (venues)
- Fotografové
- Květinářství
- Catering
- Hudba (DJ, kapely)
- Videografové
- Dekorace
- Make-up & Hair
- Doprava
- Ostatní

**Data source:**
- Reálná data z internetu (web scraping)
- Google recenze
- Portfolio fotky z webů dodavatelů
- Manuální přidání přes admin

### 9. RSVP System
**Soubory:**
- `src/app/rsvp/page.tsx`
- `src/hooks/useRSVP.ts`
- `src/components/wedding-website/templates/*/RSVPSection.tsx`

**Funkce:**
- Veřejný RSVP formulář na svatebním webu
- Potvrzení účasti
- Počet hostů
- Výběr menu
- Dietní omezení
- Požadavky na písničky
- Zpráva pro novomanžele
- Email notifikace
- Statistiky odpovědí

### 10. Timeline Module
**Soubory:**
- `src/app/timeline/page.tsx`
- `src/hooks/useTimeline.ts`

**Funkce:**
- Časový plán svatebního dne
- Milestones a události
- Čas, místo, popis
- Odpovědné osoby
- Notifikace
- Export do PDF
- Sdílení s dodavateli

### 11. Integrations Module
**Soubory:**
- `src/app/integrations/page.tsx`
- `src/app/api/google-calendar/`
- `src/app/api/spotify/`

**Funkce:**
- Google Calendar sync
- Apple Calendar export
- Spotify playlist integrace
- Email notifikace
- (Plánováno: Slack, Trello)

---

## 🤖 AI Systém

### Architektura AI systému

```
┌─────────────────────────────────────────────────────────┐
│                    User Interface                        │
│              (AI Chat / Floating Window)                 │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                   useAI Hook                             │
│  • buildContext() - Sbírá všechna data                   │
│  • askQuestion() - Posílá dotaz na API                   │
│  • Chat history management                               │
└─────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  useGuest    │    │  useBudget   │    │   useTask    │
│  (Firebase)  │    │  (Firebase)  │    │  (Firebase)  │
└──────────────┘    └──────────────┘    └──────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│              POST /api/ai/chat                           │
│  • Přijme question + context                             │
│  • buildDetailedContext() - Formátuje pro AI             │
│  • Volá OpenAI API                                       │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                  OpenAI GPT-4o-mini                      │
│  • Model: gpt-4o-mini                                    │
│  • Max tokens: 1000                                      │
│  • Temperature: 0.7                                      │
│  • System prompt: Svatební expert s přístupem k datům    │
└─────────────────────────────────────────────────────────┘
```

### Context Building

**buildContext() v useAI.ts:**
```typescript
const buildContext = (): AIWeddingContext => {
  // 1. Základní info o svatbě
  const weddingData = {
    budget: wedding?.budget,
    guestCount: wedding?.guestCount,
    weddingDate: wedding?.weddingDate
  }

  // 2. Hosté s dietními omezeními
  const guestsWithRestrictions = guests?.filter(
    g => g.dietaryRestrictions && g.dietaryRestrictions.length > 0
  )

  // 3. Rozpočtové položky
  const budgetItemsData = budgetItems

  // 4. Úkoly (zejména overdue)
  const tasksData = tasks

  // 5. Statistiky
  const guestStats = calculateGuestStats(guests)
  const budgetStats = calculateBudgetStats(stats)
  const taskStats = calculateTaskStats(tasks)

  return {
    ...weddingData,
    guests: guestsWithRestrictions,
    budgetItems: budgetItemsData,
    currentTasks: tasksData,
    guestStats,
    budgetStats,
    taskStats
  }
}
```

**buildDetailedContext() v API route:**
```typescript
function buildDetailedContext(context: AIWeddingContext): string {
  let contextStr = '\n=== DETAILNÍ KONTEXT SVATBY ===\n\n'

  // Hosté s dietními omezeními
  if (context.guests && context.guests.length > 0) {
    contextStr += '📋 HOSTÉ S DIETNÍMI OMEZENÍMI:\n'
    context.guests.forEach(guest => {
      contextStr += `- ${guest.firstName} ${guest.lastName}: ${guest.dietaryRestrictions.join(', ')}\n`
    })
  }

  // Rozpočet
  if (context.budgetStats) {
    contextStr += '\n💰 ROZPOČET:\n'
    contextStr += `- Celkový rozpočet: ${context.budgetStats.totalBudget} Kč\n`
    contextStr += `- Utraceno: ${context.budgetStats.totalSpent} Kč\n`
    contextStr += `- Zbývá: ${context.budgetStats.remaining} Kč\n`
  }

  // Úkoly po termínu
  const overdueTasks = context.currentTasks?.filter(
    t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed'
  )
  if (overdueTasks && overdueTasks.length > 0) {
    contextStr += '\n⚠️ ÚKOLY PO TERMÍNU:\n'
    overdueTasks.forEach(task => {
      contextStr += `- ${task.title} (termín: ${formatDate(task.dueDate)})\n`
    })
  }

  return contextStr
}
```

### System Prompt

```
Jsi svatební expert a asistent pro plánování svateb v České republice.
Máš přístup k reálným datům uživatele o jeho svatbě.

DŮLEŽITÉ INSTRUKCE:
1. Odpovídej KONKRÉTNĚ na základě poskytnutých dat
2. Pokud se ptají "Kdo má alergii na lepek?", odpověz JMÉNEM konkrétního hosta
3. Pokud analyzuješ rozpočet, použij REÁLNÁ ČÍSLA z dat
4. Pokud kontroluješ úkoly, uveď KONKRÉTNÍ úkoly a termíny
5. Buď přátelský, ale profesionální
6. Odpovídej v češtině
7. Používej emoji pro lepší čitelnost

Máš k dispozici:
- Seznam hostů s dietními omezeními
- Rozpočtové položky s částkami
- Úkoly s termíny a statusy
- Statistiky o svatbě

Odpovídej stručně a konkrétně. Nepiš obecné rady, ale pracuj s daty.
```

---

## 🔗 Integrace

### 1. Google Calendar Integration
**Soubor:** `src/app/api/google-calendar/`

**Funkce:**
- Export událostí do Google Calendar
- Synchronizace termínů úkolů
- Notifikace před důležitými daty

**Implementace:**
- Google Calendar API v3
- OAuth 2.0 autentifikace
- Webhook pro real-time sync

### 2. Spotify Integration
**Soubor:** `src/app/api/spotify/`

**Funkce:**
- Vytváření playlistů
- Vyhledávání písniček
- Sdílení s DJ/kapelou

**Implementace:**
- Spotify Web API
- OAuth 2.0 autentifikace
- Playlist management

### 3. Email Notifications
**Implementace:**
- Firebase Functions
- SendGrid API
- Email templates

**Typy emailů:**
- Potvrzení registrace
- RSVP potvrzení
- Připomínky úkolů
- Notifikace o změnách

---

## 🚀 Deployment

### Vercel Configuration

**vercel.json:**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["fra1"],
  "env": {
    "NEXT_PUBLIC_FIREBASE_API_KEY": "@firebase-api-key",
    "OPENAI_API_KEY": "@openai-api-key"
  }
}
```

### Environment Variables

**Production (.env.production):**
```bash
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=svatbot-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=svatbot-app
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=svatbot-app.firebasestorage.app

# OpenAI
OPENAI_API_KEY=sk-xxx

# Vercel
VERCEL_TOKEN=xxx
VERCEL_PROJECT_ID=xxx
VERCEL_TEAM_ID=xxx

# SendGrid
SENDGRID_API_KEY=xxx

# Google
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx

# Spotify
SPOTIFY_CLIENT_ID=xxx
SPOTIFY_CLIENT_SECRET=xxx
```

### DNS Configuration

**Cloudflare DNS:**
```
Type: CNAME
Name: @
Value: cname.vercel-dns.com

Type: CNAME
Name: www
Value: cname.vercel-dns.com

Type: CNAME
Name: *
Value: cname.vercel-dns.com
```

### Subdomain Handling

**middleware.ts:**
```typescript
export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const subdomain = getSubdomain(hostname)

  // Hlavní doména
  if (!subdomain || MAIN_DOMAINS.includes(subdomain)) {
    return NextResponse.next()
  }

  // Subdoména = svatební web
  const url = request.nextUrl.clone()
  url.pathname = `/wedding/${subdomain}${url.pathname}`
  return NextResponse.rewrite(url)
}
```

### Build Process

```bash
# 1. Install dependencies
npm install

# 2. Type check
npm run type-check

# 3. Lint
npm run lint

# 4. Build
npm run build

# 5. Deploy to Vercel
vercel --prod
```

### Performance Optimizations

- **Image Optimization**: Next.js Image component
- **Code Splitting**: Automatic with Next.js
- **Lazy Loading**: Dynamic imports
- **Caching**: Vercel Edge Network
- **Compression**: Gzip/Brotli
- **Minification**: Automatic with Next.js

---

## 📊 Monitoring & Analytics

### Tools
- **Vercel Analytics** - Performance monitoring
- **Google Analytics** - User behavior
- **Firebase Analytics** - App events
- **Sentry** (plánováno) - Error tracking

### Key Metrics
- Page load time
- Time to Interactive
- API response time
- Error rate
- User engagement
- Conversion rate

---

**Vytvořeno**: Leden 2025
**Poslední aktualizace**: Leden 2025
**Verze dokumentu**: 1.0.0


