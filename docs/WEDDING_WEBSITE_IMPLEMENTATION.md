# 💒 Svatební web - Implementační plán (bez platebního systému)

## 🎯 Cíl

Vytvořit plně funkční svatební web pro hosty s URL strukturou na subdoménách (`jana-petr.svatbot.cz`).
Platební systém implementujeme později jako finální krok.

---

## 🌐 URL Struktura - Subdoména

### Technické řešení:

**Varianta A: Wildcard subdoména (preferovaná)**
```
*.svatbot.cz → Vercel
jana-petr.svatbot.cz → Next.js dynamic route
novakovi.svatbot.cz → Next.js dynamic route
```

**DNS nastavení:**
```
Type: CNAME
Name: *
Value: cname.vercel-dns.com
```

**Next.js routing:**
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host')
  const subdomain = hostname?.split('.')[0]
  
  // Hlavní doména
  if (subdomain === 'svatbot' || subdomain === 'www') {
    return NextResponse.next()
  }
  
  // Subdoména = svatební web
  const url = request.nextUrl.clone()
  url.pathname = `/wedding/${subdomain}${url.pathname}`
  return NextResponse.rewrite(url)
}
```

**Varianta B: Fallback na path (pro development)**
```
svatbot.cz/w/[customUrl]
```

---

## 📁 Struktura projektu

```
src/
├── app/
│   ├── wedding/
│   │   └── [customUrl]/
│   │       ├── page.tsx              # Hlavní stránka webu
│   │       ├── layout.tsx            # Layout pro svatební web
│   │       ├── loading.tsx           # Loading state
│   │       └── not-found.tsx         # 404 page
│   │
│   ├── admin/
│   │   └── wedding-website/
│   │       ├── page.tsx              # Dashboard pro správu webu
│   │       ├── builder/
│   │       │   └── page.tsx          # Website builder
│   │       ├── rsvp/
│   │       │   └── page.tsx          # RSVP management
│   │       └── analytics/
│   │           └── page.tsx          # Statistiky
│   │
│   └── api/
│       └── wedding-website/
│           ├── check-url/
│           │   └── route.ts          # Kontrola dostupnosti URL
│           ├── publish/
│           │   └── route.ts          # Publikování webu
│           └── rsvp/
│               └── route.ts          # RSVP submission
│
├── components/
│   └── wedding-website/
│       ├── templates/
│       │   ├── ClassicElegance/
│       │   │   ├── index.tsx
│       │   │   ├── HeroSection.tsx
│       │   │   ├── StorySection.tsx
│       │   │   └── styles.ts
│       │   └── ModernMinimalist/
│       │       └── ...
│       │
│       ├── sections/
│       │   ├── HeroSection.tsx
│       │   ├── StorySection.tsx
│       │   ├── InfoSection.tsx
│       │   ├── TimelineSection.tsx
│       │   ├── RSVPSection.tsx
│       │   ├── AccommodationSection.tsx
│       │   ├── GiftSection.tsx
│       │   ├── GallerySection.tsx
│       │   ├── ContactSection.tsx
│       │   └── FAQSection.tsx
│       │
│       ├── builder/
│       │   ├── TemplateSelector.tsx
│       │   ├── ContentEditor.tsx
│       │   ├── SectionEditor.tsx
│       │   ├── StyleCustomizer.tsx
│       │   ├── PreviewPanel.tsx
│       │   └── PublishDialog.tsx
│       │
│       ├── forms/
│       │   ├── RSVPForm.tsx
│       │   ├── GuestInfoForm.tsx
│       │   └── MealSelectionForm.tsx
│       │
│       └── admin/
│           ├── RSVPDashboard.tsx
│           ├── RSVPList.tsx
│           ├── RSVPStats.tsx
│           └── AnalyticsDashboard.tsx
│
├── hooks/
│   ├── useWeddingWebsite.ts
│   ├── useRSVP.ts
│   ├── useWebsiteBuilder.ts
│   └── useSubdomain.ts
│
├── types/
│   └── wedding-website.ts
│
└── lib/
    ├── wedding-website/
    │   ├── templates.ts
    │   ├── sections.ts
    │   └── validation.ts
    └── subdomain.ts
```

---

## 🗄️ Firestore Schema

### Collection: `weddingWebsites`

```typescript
interface WeddingWebsite {
  id: string
  weddingId: string
  userId: string
  
  // URL
  customUrl: string                    // 'jana-petr' nebo 'novakovi'
  subdomain: string                    // 'jana-petr.svatbot.cz'
  
  // Status
  isPublished: boolean
  isDraft: boolean
  
  // Template
  template: 'classic-elegance' | 'modern-minimalist' | ...
  
  // Content
  content: {
    hero: {
      bride: string
      groom: string
      weddingDate: Date
      mainImage?: string
      tagline?: string
    }
    
    story: {
      enabled: boolean
      howWeMet?: {
        title: string
        text: string
        image?: string
        date?: Date
      }
      proposal?: {
        title: string
        text: string
        image?: string
        date?: Date
      }
      timeline?: Array<{
        date: Date
        title: string
        description: string
        image?: string
      }>
    }
    
    info: {
      enabled: boolean
      ceremony?: {
        time: string
        venue: string
        address: string
        coordinates?: { lat: number; lng: number }
      }
      reception?: {
        time: string
        venue: string
        address: string
        coordinates?: { lat: number; lng: number }
      }
      dressCode?: string
      parking?: string
      accessibility?: string
    }
    
    schedule: {
      enabled: boolean
      items: Array<{
        time: string
        title: string
        description?: string
        icon?: string
      }>
    }
    
    rsvp: {
      enabled: boolean
      deadline?: Date
      mealSelection: boolean
      mealOptions?: string[]
      plusOneAllowed: boolean
      songRequests: boolean
      message?: string
    }
    
    accommodation: {
      enabled: boolean
      hotels?: Array<{
        name: string
        address: string
        phone?: string
        website?: string
        distance?: string
        priceRange?: string
        bookingLink?: string
      }>
      transportation?: {
        parking?: string
        shuttle?: string
        taxi?: string
      }
    }
    
    gift: {
      enabled: boolean
      message?: string
      bankAccount?: string
      registry?: Array<{
        name: string
        url: string
        description?: string
      }>
    }
    
    gallery: {
      enabled: boolean
      images: Array<{
        url: string
        caption?: string
        uploadedBy?: string
        uploadedAt: Date
      }>
      allowGuestUploads: boolean
    }
    
    contact: {
      enabled: boolean
      bride?: {
        name: string
        email?: string
        phone?: string
      }
      groom?: {
        name: string
        email?: string
        phone?: string
      }
      bridesmaids?: Array<{
        name: string
        phone?: string
      }>
      groomsmen?: Array<{
        name: string
        phone?: string
      }>
    }
    
    faq: {
      enabled: boolean
      items: Array<{
        question: string
        answer: string
      }>
    }
  }
  
  // Style
  style: {
    primaryColor: string
    secondaryColor: string
    accentColor: string
    fontFamily: string
    fontHeading: string
    backgroundColor: string
  }
  
  // Settings
  settings: {
    isPasswordProtected: boolean
    password?: string
    seoTitle?: string
    seoDescription?: string
    ogImage?: string
    favicon?: string
    customCSS?: string
  }
  
  // Analytics
  analytics: {
    views: number
    uniqueVisitors: number
    lastVisit?: Date
  }
  
  // Timestamps
  createdAt: Date
  updatedAt: Date
  publishedAt?: Date
}
```

### Collection: `rsvps`

```typescript
interface RSVP {
  id: string
  websiteId: string
  weddingId: string
  guestId?: string                     // Propojení s existujícím hostem
  
  // Guest info
  name: string
  email: string
  phone?: string
  
  // Response
  status: 'attending' | 'declined' | 'maybe'
  guestCount: number
  plusOne?: {
    name: string
    email?: string
  }
  
  // Meal selection
  mealChoice?: string
  plusOneMealChoice?: string
  dietaryRestrictions?: string
  
  // Additional
  songRequest?: string
  message?: string
  
  // Metadata
  submittedAt: Date
  ipAddress?: string
  userAgent?: string
  
  // Admin
  notes?: string
  confirmed: boolean
}
```

---

## 🎨 Šablony (Fáze 1: 2 šablony)

### 1. Classic Elegance

**Design:**
- Elegantní, časeless
- Serif fonty (Playfair Display, Cormorant)
- Bílá, zlatá (#D4AF37), šampaňská (#F7E7CE)
- Jemné animace
- Ornamentální prvky

**Sekce:**
- Hero s velkým názvem a datem
- Náš příběh s timeline
- Informace o svatbě s mapou
- Program dne
- RSVP formulář
- Ubytování
- Svatební dar
- Kontakt

### 2. Modern Minimalist

**Design:**
- Čistý, minimalistický
- Sans-serif fonty (Inter, Montserrat)
- Černá (#1A1A1A), bílá, šedá (#F5F5F5)
- Geometrické tvary
- Plochý design

**Sekce:**
- Hero s velkým obrázkem
- Náš příběh (grid layout)
- Informace (cards)
- Timeline (vertical)
- RSVP (inline)
- Galerie (masonry)
- Kontakt (minimální)

---

## 🚀 Implementační fáze

### **Fáze 1: Základy (Týden 1)**

#### Den 1-2: Setup a routing
- [ ] Middleware pro subdoména routing
- [ ] Dynamic route `/wedding/[customUrl]`
- [ ] Firestore schema
- [ ] TypeScript typy

#### Den 3-4: Website builder - základy
- [ ] Builder layout
- [ ] Template selector (2 šablony)
- [ ] Content editor (základní)
- [ ] Preview panel

#### Den 5-7: Classic Elegance template
- [ ] Hero section
- [ ] Story section
- [ ] Info section
- [ ] Schedule section
- [ ] RSVP section
- [ ] Contact section

### **Fáze 2: Funkčnost (Týden 2)**

#### Den 1-2: Modern Minimalist template
- [ ] Všechny sekce
- [ ] Responsive design
- [ ] Animace

#### Den 3-4: RSVP systém
- [ ] RSVP formulář
- [ ] Firestore integrace
- [ ] Validace
- [ ] Success/Error states

#### Den 5-7: Builder - pokročilé
- [ ] Section editor (enable/disable)
- [ ] Content editing (inline)
- [ ] Style customizer (barvy, fonty)
- [ ] Auto-import dat z aplikace

### **Fáze 3: Admin a polish (Týden 3)**

#### Den 1-3: Admin dashboard
- [ ] RSVP management
- [ ] RSVP list (filtry, export)
- [ ] RSVP statistiky
- [ ] Analytics dashboard

#### Den 4-5: Publikování
- [ ] URL validation
- [ ] Publish/Unpublish
- [ ] Preview mode
- [ ] QR kód generátor

#### Den 6-7: Polish
- [ ] SEO optimalizace
- [ ] Loading states
- [ ] Error handling
- [ ] Mobile optimization

---

## 📋 Checklist před začátkem

### DNS a Vercel:
- [ ] Přidat wildcard DNS záznam (`*.svatbot.cz`)
- [ ] Nakonfigurovat Vercel pro wildcard subdoména
- [ ] SSL certifikáty

### Firebase:
- [ ] Firestore indexes
- [ ] Security rules
- [ ] Storage rules (pro obrázky)

### Development:
- [ ] Vytvořit branch `feature/wedding-website`
- [ ] Setup testing environment


