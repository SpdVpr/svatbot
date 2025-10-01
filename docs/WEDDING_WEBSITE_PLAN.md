# 💒 Svatební web pro hosty - Implementační plán

## 📋 Přehled

Svatební web je veřejně přístupná stránka pro hosty, kde najdou všechny důležité informace o svatbě. Web běží na naší subdoméně a je dostupný pouze pro platící zákazníky.

---

## 🎯 Základní koncept

### URL struktura:
```
https://[custom-url].svatbot.cz
nebo
https://svatbot.cz/w/[custom-url]
```

**Příklady:**
- `https://jana-petr.svatbot.cz`
- `https://svatbot.cz/w/jana-petr-2025`
- `https://svatbot.cz/w/novakovi`

### Přístup:
- ✅ **Veřejný** - Kdokoliv s odkazem může zobrazit
- ✅ **Volitelně chráněný heslem** - Pro soukromé svatby
- ✅ **QR kód** - Pro snadné sdílení

---

## 💰 Monetizační model

### Subscription plán:

```
┌─────────────────────────────────────────┐
│  SVATBOT PREMIUM                        │
├─────────────────────────────────────────┤
│  První měsíc:        ZDARMA             │
│  Poté:               299 Kč/měsíc       │
├─────────────────────────────────────────┤
│  ✅ Plný přístup k aplikaci             │
│  ✅ Svatební web pro hosty              │
│  ✅ Online RSVP systém                  │
│  ✅ Fotogalerie                         │
│  ✅ Neomezený počet hostů               │
│  ✅ Email notifikace                    │
│  ✅ Vlastní doména (volitelně)          │
└─────────────────────────────────────────┘
```

### Free vs. Premium:

| Funkce | Free | Premium (299 Kč/měsíc) |
|--------|------|------------------------|
| Dashboard | ✅ | ✅ |
| Úkoly | ✅ (max 50) | ✅ Neomezeno |
| Hosté | ✅ (max 50) | ✅ Neomezeno |
| Rozpočet | ✅ | ✅ |
| Timeline | ✅ | ✅ |
| Seating plan | ✅ | ✅ |
| Menu | ✅ | ✅ |
| **Svatební web** | ❌ | ✅ |
| **Online RSVP** | ❌ | ✅ |
| **Fotogalerie** | ❌ | ✅ |
| **Email notifikace** | ❌ | ✅ |
| **Vlastní doména** | ❌ | ✅ (příplatek) |

---

## 🎨 Šablony svatebního webu

### Připravené šablony (6-8 stylů):

#### 1. **Classic Elegance** 💍
- Klasický, elegantní design
- Bílá, zlatá, šampaňská
- Serif fonty
- Vhodné pro: Tradiční svatby, zámecké svatby

#### 2. **Modern Minimalist** ⚪
- Čistý, minimalistický
- Černá, bílá, šedá
- Sans-serif fonty
- Vhodné pro: Moderní svatby, městské svatby

#### 3. **Rustic Romance** 🌾
- Rustikální, přírodní
- Hnědá, béžová, zelená
- Dřevěné textury
- Vhodné pro: Venkovské svatby, stodoly

#### 4. **Bohemian Dream** 🌸
- Boho, volný styl
- Teplé tóny, květinové vzory
- Ručně psané fonty
- Vhodné pro: Boho svatby, venkovní svatby

#### 5. **Garden Party** 🌿
- Zahradní, květinový
- Pastelové barvy
- Botanické ilustrace
- Vhodné pro: Zahradní svatby, letní svatby

#### 6. **Beach Vibes** 🌊
- Plážový, lehký
- Modrá, bílá, písková
- Mořské motivy
- Vhodné pro: Plážové svatby, destination weddings

#### 7. **Winter Wonderland** ❄️
- Zimní, elegantní
- Bílá, stříbrná, modrá
- Sněhové efekty
- Vhodné pro: Zimní svatby

#### 8. **Vintage Charm** 📜
- Vintage, retro
- Sepie, krémová, zlatá
- Staré fotografie
- Vhodné pro: Vintage svatby, historické venue

---

## 📄 Struktur webu

### Hlavní sekce:

#### 1. **Úvodní stránka (Hero)**
```
┌─────────────────────────────────────┐
│                                     │
│         [Fotka páru]                │
│                                     │
│      Jana & Petr                    │
│      15. června 2025                │
│                                     │
│    [Countdown: 180 dní]             │
│                                     │
│    [Potvrdit účast]                 │
│                                     │
└─────────────────────────────────────┘
```

**Obsah:**
- Jména snoubenců
- Datum svatby
- Countdown
- Hlavní fotka
- CTA tlačítko (RSVP)

#### 2. **Náš příběh**
```
┌─────────────────────────────────────┐
│  Jak jsme se poznali                │
│  ────────────────────                │
│  [Text + fotky]                     │
│                                     │
│  Zásnuby                            │
│  ────────────────────                │
│  [Text + fotky]                     │
└─────────────────────────────────────┘
```

**Obsah:**
- Jak se pár poznal
- Příběh zásnub
- Timeline vztahu
- Fotogalerie

#### 3. **Informace o svatbě**
```
┌─────────────────────────────────────┐
│  📅 Kdy                              │
│  Sobota 15. června 2025              │
│  Obřad: 14:00                       │
│  Hostina: 16:00                     │
│                                     │
│  📍 Kde                              │
│  Zámek Průhonice                    │
│  Průhonice 1, 252 43                │
│  [Mapa] [Navigace]                  │
│                                     │
│  👔 Dress code                       │
│  Formální, cocktail                 │
└─────────────────────────────────────┘
```

**Obsah:**
- Datum a čas (obřad, hostina, večerní zábava)
- Místo konání (adresa, mapa)
- Dress code
- Parkování
- Bezbariérovost

#### 4. **Program dne**
```
┌─────────────────────────────────────┐
│  14:00  Obřad                       │
│  15:00  Gratulace a focení          │
│  16:00  Příchod hostů               │
│  16:30  Hostina                     │
│  18:00  První tanec                 │
│  19:00  Krájení dortu               │
│  20:00  Večerní zábava              │
│  01:00  Noční svačina               │
└─────────────────────────────────────┘
```

**Obsah:**
- Časový harmonogram
- Klíčové momenty
- Co očekávat

#### 5. **RSVP formulář** ⭐
```
┌─────────────────────────────────────┐
│  Potvrďte prosím svou účast         │
│                                     │
│  Jméno: [_____________]             │
│  Email: [_____________]             │
│  Telefon: [___________]             │
│                                     │
│  Počet osob: [▼]                    │
│  □ Přijdu                           │
│  □ Bohužel nepřijdu                 │
│                                     │
│  Výběr jídla:                       │
│  ○ Hovězí                           │
│  ○ Kuřecí                           │
│  ○ Vegetariánské                    │
│                                     │
│  Dietní omezení: [_______]          │
│                                     │
│  Přání písničky: [_______]          │
│                                     │
│  Poznámka: [_______________]        │
│                                     │
│  [Odeslat potvrzení]                │
└─────────────────────────────────────┘
```

**Funkce:**
- Online potvrzení účasti
- Výběr jídla
- Dietní omezení
- Plus-one management
- Song requests
- Automatické email potvrzení

#### 6. **Ubytování a doprava**
```
┌─────────────────────────────────────┐
│  🏨 Doporučené hotely               │
│  ────────────────────                │
│  Hotel Průhonice ★★★★               │
│  2 km od místa konání               │
│  [Rezervovat] [Mapa]                │
│                                     │
│  🚗 Doprava                          │
│  ────────────────────                │
│  Parkování: Zdarma na místě         │
│  Kyvadlová doprava: 23:00, 01:00    │
│  Taxi: +420 XXX XXX XXX             │
└─────────────────────────────────────┘
```

**Obsah:**
- Doporučené hotely
- Parkování
- Kyvadlová doprava
- Taxi služby
- Mapa okolí

#### 7. **Svatební dar**
```
┌─────────────────────────────────────┐
│  Váš příchod je pro nás             │
│  tím nejkrásnějším darem!           │
│                                     │
│  Pokud nás chcete obdarovat:        │
│                                     │
│  💰 Příspěvek na svatební cestu     │
│  Číslo účtu: XXXX/XXXX              │
│  [Kopírovat]                        │
│                                     │
│  🎁 Svatební seznam                 │
│  [Zobrazit seznam]                  │
└─────────────────────────────────────┘
```

**Obsah:**
- Číslo účtu
- Svatební seznam (registry)
- Alternativní možnosti

#### 8. **Fotogalerie** ⭐
```
┌─────────────────────────────────────┐
│  📸 Naše fotky                      │
│  ────────────────────                │
│  [Grid fotek]                       │
│                                     │
│  Po svatbě zde najdete              │
│  fotky ze svatebního dne!           │
│                                     │
│  [Nahrát fotku]                     │
└─────────────────────────────────────┘
```

**Funkce:**
- Před svatbou: Zásnubní fotky
- Po svatbě: Svatební fotky
- Guest photo upload
- Download všech fotek

#### 9. **Kontakt**
```
┌─────────────────────────────────────┐
│  Máte dotaz?                        │
│                                     │
│  Nevěsta: Jana                      │
│  📧 jana@email.cz                   │
│  📱 +420 XXX XXX XXX                │
│                                     │
│  Ženich: Petr                       │
│  📧 petr@email.cz                   │
│  📱 +420 XXX XXX XXX                │
│                                     │
│  Svědkyně: Marie                    │
│  📱 +420 XXX XXX XXX                │
└─────────────────────────────────────┘
```

**Obsah:**
- Kontakty na snoubence
- Kontakty na svědky
- FAQ sekce

#### 10. **FAQ**
```
┌─────────────────────────────────────┐
│  Často kladené otázky               │
│                                     │
│  ▼ Mohu přivést doprovod?           │
│  ▼ Je svatba venku nebo uvnitř?     │
│  ▼ Bude zajištěno parkování?        │
│  ▼ Jsou děti vítány?                │
│  ▼ Jak se obléct?                   │
└─────────────────────────────────────┘
```

---

## 🛠️ Technická implementace

### Frontend:
```typescript
// URL struktura
svatbot.cz/w/[customUrl]

// Komponenty
src/
├── app/
│   └── w/
│       └── [customUrl]/
│           ├── page.tsx          // Hlavní stránka webu
│           ├── layout.tsx        // Layout pro web
│           └── loading.tsx       // Loading state
├── components/
│   └── wedding-website/
│       ├── templates/
│       │   ├── ClassicElegance.tsx
│       │   ├── ModernMinimalist.tsx
│       │   ├── RusticRomance.tsx
│       │   └── ...
│       ├── sections/
│       │   ├── HeroSection.tsx
│       │   ├── StorySection.tsx
│       │   ├── InfoSection.tsx
│       │   ├── TimelineSection.tsx
│       │   ├── RSVPSection.tsx
│       │   ├── AccommodationSection.tsx
│       │   ├── GiftSection.tsx
│       │   ├── GallerySection.tsx
│       │   └── ContactSection.tsx
│       ├── builder/
│       │   ├── TemplateSelector.tsx
│       │   ├── ContentEditor.tsx
│       │   ├── StyleCustomizer.tsx
│       │   └── PreviewPanel.tsx
│       └── forms/
│           └── RSVPForm.tsx
└── hooks/
    ├── useWeddingWebsite.ts
    └── useRSVP.ts
```

### Backend (Firebase):
```typescript
// Firestore collections
weddingWebsites/{websiteId}
  - weddingId: string
  - customUrl: string (unique)
  - template: string
  - isPublished: boolean
  - isPasswordProtected: boolean
  - password?: string
  - content: {
      hero: { ... }
      story: { ... }
      info: { ... }
      timeline: { ... }
      accommodation: { ... }
      gift: { ... }
      contact: { ... }
      faq: { ... }
    }
  - style: {
      primaryColor: string
      secondaryColor: string
      fontFamily: string
      ...
    }
  - seo: {
      title: string
      description: string
      image: string
    }
  - analytics: {
      views: number
      rsvps: number
      lastVisit: Date
    }
  - createdAt: Date
  - updatedAt: Date

rsvps/{rsvpId}
  - websiteId: string
  - weddingId: string
  - guestId?: string
  - name: string
  - email: string
  - phone?: string
  - status: 'attending' | 'declined' | 'maybe'
  - guestCount: number
  - mealChoice?: string
  - dietaryRestrictions?: string
  - songRequest?: string
  - message?: string
  - submittedAt: Date
```

---

## 🎨 Builder / Editor

### Admin rozhraní pro vytvoření webu:

```
┌─────────────────────────────────────────────────────┐
│  Svatební web - Editor                              │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Krok 1: Vyberte šablonu                           │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐                      │
│  │ 💍 │ │ ⚪ │ │ 🌾 │ │ 🌸 │                      │
│  └────┘ └────┘ └────┘ └────┘                      │
│                                                     │
│  Krok 2: Vyplňte obsah                            │
│  ✅ Základní info (auto-import z aplikace)         │
│  ✅ Náš příběh                                     │
│  ✅ Program dne                                    │
│  ✅ Ubytování                                      │
│  ⚠️  Fotky (nahrát)                                │
│                                                     │
│  Krok 3: Přizpůsobte design                       │
│  Barvy: [🎨]                                       │
│  Fonty: [Aa]                                       │
│  Layout: [📐]                                      │
│                                                     │
│  Krok 4: Nastavte URL                             │
│  svatbot.cz/w/[jana-petr-2025]                    │
│  ✅ Dostupné                                       │
│                                                     │
│  [Náhled] [Publikovat]                            │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Auto-import dat z aplikace:

**Co se automaticky naimportuje:**
- ✅ Jména snoubenců
- ✅ Datum svatby
- ✅ Místo konání (venue)
- ✅ Seznam hostů (pro RSVP)
- ✅ Program dne (z timeline)
- ✅ Menu (výběr jídla v RSVP)
- ✅ Kontaktní informace

**Co musí uživatel doplnit:**
- 📝 Náš příběh (text)
- 📸 Fotky
- 🏨 Ubytování
- 💰 Číslo účtu / registry
- ❓ FAQ

---

## 💳 Platební integrace

### Stripe / GoPay integrace:

```typescript
// Subscription plány
subscriptions/{subscriptionId}
  - userId: string
  - weddingId: string
  - plan: 'free' | 'premium'
  - status: 'active' | 'canceled' | 'past_due' | 'trialing'
  - trialEndsAt: Date (30 dní od registrace)
  - currentPeriodStart: Date
  - currentPeriodEnd: Date
  - cancelAtPeriodEnd: boolean
  - stripeCustomerId: string
  - stripeSubscriptionId: string
  - amount: 299
  - currency: 'CZK'
  - createdAt: Date
  - updatedAt: Date
```

### Platební flow:

```
1. Registrace → Free trial (30 dní)
2. Po 7 dnech → Email reminder o trial konci
3. Po 25 dnech → Email reminder o trial konci
4. Po 30 dnech → Upgrade na Premium nebo omezení funkcí
5. Platba → Aktivace Premium
6. Každý měsíc → Automatická platba
7. Zrušení → Funkce dostupné do konce období
```

### Omezení Free plánu:

```typescript
const FREE_LIMITS = {
  maxGuests: 50,
  maxTasks: 50,
  maxBudgetItems: 30,
  maxVendors: 10,
  weddingWebsite: false,
  onlineRSVP: false,
  photoGallery: false,
  emailNotifications: false,
  customDomain: false
}

const PREMIUM_LIMITS = {
  maxGuests: Infinity,
  maxTasks: Infinity,
  maxBudgetItems: Infinity,
  maxVendors: Infinity,
  weddingWebsite: true,
  onlineRSVP: true,
  photoGallery: true,
  emailNotifications: true,
  customDomain: true // s příplatkem
}
```

---

## 🔒 Zabezpečení a přístup

### Kontrola subscription:

```typescript
// Middleware pro kontrolu Premium features
export async function checkPremiumAccess(userId: string): Promise<boolean> {
  const subscription = await getSubscription(userId)

  if (!subscription) return false

  // Trial period
  if (subscription.status === 'trialing' &&
      subscription.trialEndsAt > new Date()) {
    return true
  }

  // Active subscription
  if (subscription.status === 'active' &&
      subscription.plan === 'premium') {
    return true
  }

  return false
}

// Použití v komponentách
const WeddingWebsiteBuilder = () => {
  const { user } = useAuth()
  const { subscription } = useSubscription()

  if (!subscription?.isPremium) {
    return <UpgradePrompt />
  }

  return <WebsiteBuilder />
}
```

### Ochrana webu heslem:

```typescript
// Volitelná ochrana heslem
const WeddingWebsitePage = ({ params }: { params: { customUrl: string } }) => {
  const [isUnlocked, setIsUnlocked] = useState(false)
  const website = await getWeddingWebsite(params.customUrl)

  if (website.isPasswordProtected && !isUnlocked) {
    return <PasswordPrompt onUnlock={() => setIsUnlocked(true)} />
  }

  return <WeddingWebsite data={website} />
}
```

---

## 📊 Analytics a statistiky

### Co sledovat:

```typescript
analytics/{websiteId}
  - totalViews: number
  - uniqueVisitors: number
  - rsvpSubmissions: number
  - rsvpAttending: number
  - rsvpDeclined: number
  - photoUploads: number
  - averageTimeOnSite: number
  - topPages: string[]
  - deviceBreakdown: {
      mobile: number
      desktop: number
      tablet: number
    }
  - referrers: string[]
  - lastUpdated: Date
```

### Dashboard pro uživatele:

```
┌─────────────────────────────────────┐
│  Statistiky svatebního webu        │
├─────────────────────────────────────┤
│  👁️  Zobrazení: 1,234               │
│  👥 Unikátní návštěvníci: 456       │
│  ✅ RSVP potvrzeno: 89/120          │
│  ❌ RSVP odmítnuto: 12/120          │
│  ⏳ Čeká na odpověď: 19/120         │
│  📸 Nahrané fotky: 45               │
│                                     │
│  📈 Graf návštěvnosti               │
│  [Graf]                             │
└─────────────────────────────────────┘
```

---

## 🚀 Implementační fáze

### Fáze 1: MVP (3-4 týdny)

**Týden 1: Základy**
- [ ] Subscription model (Firestore schema)
- [ ] Stripe/GoPay integrace
- [ ] Free trial logic
- [ ] Premium feature gates

**Týden 2: Website builder**
- [ ] 2 základní šablony (Classic, Modern)
- [ ] Content editor
- [ ] Auto-import dat z aplikace
- [ ] URL management

**Týden 3: Public website**
- [ ] Public route `/w/[customUrl]`
- [ ] Template rendering
- [ ] Responsive design
- [ ] SEO optimalizace

**Týden 4: RSVP systém**
- [ ] RSVP formulář
- [ ] Firestore integrace
- [ ] Email potvrzení
- [ ] Admin dashboard pro RSVP

### Fáze 2: Rozšíření (2-3 týdny)

**Týden 5-6: Více šablon**
- [ ] 4 další šablony
- [ ] Style customizer
- [ ] Font picker
- [ ] Color picker

**Týden 7: Fotogalerie**
- [ ] Upload fotek
- [ ] Guest photo upload
- [ ] Gallery view
- [ ] Download všech fotek

### Fáze 3: Premium features (2 týdny)

**Týden 8-9:**
- [ ] Password protection
- [ ] Custom domain support
- [ ] Analytics dashboard
- [ ] QR kód generátor
- [ ] Social sharing

---

## 💡 Dodatečné nápady

### Premium+ features (budoucnost):

1. **Video pozvánky** 🎥
   - Nahrát video pozvánku
   - Automatické přehrávání na hero sekci

2. **Live streaming** 📹
   - Stream svatby pro vzdálené hosty
   - Integrace s YouTube/Vimeo

3. **Guest messaging** 💬
   - Chat pro hosty
   - Announcements feed
   - Q&A sekce

4. **Multi-language** 🌍
   - Automatický překlad webu
   - Pro mezinárodní svatby

5. **Custom domain** 🌐
   - `www.janapetr.cz`
   - DNS management
   - SSL certifikáty

6. **Advanced analytics** 📊
   - Heatmapy
   - Conversion tracking
   - A/B testing

---

## 🎯 Konkurenční výhoda

### Proč je náš svatební web lepší:

1. ✅ **Integrace s plánovací aplikací**
   - Auto-import všech dat
   - Synchronizace v reálném čase
   - Jedno místo pro vše

2. ✅ **České prostředí**
   - Plná lokalizace
   - České platby (GoPay)
   - České ceny

3. ✅ **Moderní tech**
   - Rychlé načítání
   - Mobilní first
   - SEO optimalizované

4. ✅ **Cenově dostupné**
   - 299 Kč/měsíc vs. konkurence 500-1000 Kč
   - První měsíc zdarma
   - Žádné skryté poplatky

5. ✅ **AI asistent**
   - Pomoc s texty
   - Návrhy programu
   - Personalizované tipy

---

## 📋 Checklist před spuštěním

### Technické:
- [ ] Stripe/GoPay účet
- [ ] Email služba (SendGrid/Mailgun)
- [ ] CDN pro obrázky (Cloudinary)
- [ ] Backup strategie
- [ ] Monitoring (Sentry)

### Právní:
- [ ] Obchodní podmínky
- [ ] GDPR compliance
- [ ] Zpracování osobních údajů
- [ ] Cookies policy
- [ ] Fakturace

### Marketing:
- [ ] Landing page pro Premium
- [ ] Email templates
- [ ] Upgrade prompts
- [ ] Referral program

---

## 💰 Finanční projekce

### Náklady:
- Stripe fees: 1.5% + 4 Kč per transaction
- Firebase: ~500 Kč/měsíc (pro 100 uživatelů)
- Email služba: ~300 Kč/měsíc
- CDN: ~200 Kč/měsíc
- **Celkem: ~1000 Kč/měsíc**

### Příjmy (při 100 platících zákaznících):
- 100 × 299 Kč = **29,900 Kč/měsíc**
- Náklady: -1,000 Kč
- Stripe fees: -600 Kč
- **Čistý zisk: ~28,300 Kč/měsíc**

### Break-even:
- Potřeba: ~5 platících zákazníků
- Realistický cíl: 50-100 zákazníků za 6 měsíců

---

## 🎉 Závěr

Svatební web pro hosty je **kritická funkce** pro konkurenceschopnost. S monetizačním modelem 299 Kč/měsíc a prvním měsícem zdarma máme:

✅ **Konkurenční cenu** (levnější než konkurence)
✅ **Unikátní integraci** (auto-import z aplikace)
✅ **České prostředí** (lokalizace, platby)
✅ **Moderní tech** (Next.js, Firebase)
✅ **Scalable model** (subscription)

**Doporučení:** Začít s Fází 1 (MVP) co nejdříve! 🚀


