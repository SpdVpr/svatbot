# Marketplace - Registrační systém pro dodavatele

## 📋 Přehled

Systém umožňuje dodavatelům svatebních služeb registrovat se do SvatBot Marketplace a nabízet své služby tisícům párů, které plánují svatbu.

## 🎯 Funkce

### Pro dodavatele:
- ✅ Veřejná registrační stránka `/marketplace/register`
- ✅ Víceúrovňový formulář (4 kroky)
- ✅ Automatické ukládání do Firebase Firestore
- ✅ Status "pending" - čeká na schválení adminem
- ✅ Email notifikace po schválení (připraveno pro implementaci)

### Pro administrátory:
- ✅ Admin panel `/admin/marketplace`
- ✅ Přehled všech registrací (čekající, schválené, odmítnuté)
- ✅ Schvalování/odmítání registrací jedním kliknutím
- ✅ Detail každé registrace
- ✅ Možnost smazání registrace

## 🏗️ Architektura

### Komponenty

#### 1. `MarketplaceVendorForm` (`src/components/marketplace/MarketplaceVendorForm.tsx`)
Specializovaný formulář pro registraci dodavatelů s 4 kroky:

**Krok 1: Základní informace**
- Kategorie služby
- Název firmy
- Krátký popis (150 znaků)
- Detailní popis
- Roky v oboru
- Pracovní rádius

**Krok 2: Kontakt a adresa**
- Email *
- Telefon *
- Webové stránky
- Adresa (ulice, město, PSČ, kraj)
- Firemní údaje (IČO, DIČ)

**Krok 3: Služby a ceny**
- Seznam služeb (název, popis, cena, typ ceny, doba trvání)
- Cenové rozpětí (min, max, jednotka)

**Krok 4: Portfolio a dostupnost**
- Klíčové vlastnosti
- Pracovní dny
- Pracovní hodiny
- Doba odezvy

#### 2. Registrační stránka (`src/app/marketplace/register/page.tsx`)
Landing page s:
- Hero sekce s výhodami
- Benefity (4 karty)
- Jak to funguje (3 kroky)
- CTA tlačítko
- FAQ sekce
- Success screen po odeslání

#### 3. Admin panel (`src/app/admin/marketplace/page.tsx`)
Správa registrací:
- Statistiky (čekající, schválené, odmítnuté, celkem)
- Filtry podle statusu
- Seznam registrací s akcemi
- Detail modal
- Schvalování/odmítání/mazání

### Hooks

#### `useMarketplaceVendors` (`src/hooks/useMarketplaceVendors.ts`)
Hook pro práci s marketplace vendors:
```typescript
const {
  vendors,              // Všechny registrace
  loading,              // Loading state
  error,                // Error state
  loadVendors,          // Načíst registrace
  getPendingVendors,    // Získat čekající
  getApprovedVendors,   // Získat schválené
  approveVendor,        // Schválit registraci
  rejectVendor,         // Odmítnout registraci
  deleteVendor,         // Smazat registraci
  updateVendor          // Aktualizovat registraci
} = useMarketplaceVendors()
```

## 🔥 Firebase Firestore

### Kolekce: `marketplaceVendors`

**Struktura dokumentu:**
```typescript
{
  // Základní info
  name: string
  category: VendorCategory
  description: string
  shortDescription: string
  
  // Kontakt
  email: string
  phone: string
  website?: string
  
  // Adresa
  address: {
    street: string
    city: string
    postalCode: string
    region: string
  }
  
  // Business
  businessName?: string
  businessId?: string  // IČO
  vatNumber?: string   // DIČ
  
  // Služby
  services: Array<{
    name: string
    description: string
    price?: number
    priceType: 'fixed' | 'hourly' | 'per-person' | 'package' | 'negotiable'
    duration?: string
    includes: string[]
  }>
  
  // Ceny
  priceRange: {
    min: number
    max: number
    currency: string
    unit: string
  }
  
  // Vlastnosti
  features: string[]
  specialties: string[]
  workingRadius: number
  yearsInBusiness: number
  
  // Dostupnost
  availability: {
    workingDays: string[]
    workingHours: {
      start: string
      end: string
    }
  }
  
  // Media
  images: string[]
  portfolioImages: string[]
  videoUrl?: string
  
  // Marketplace
  verified: boolean
  featured: boolean
  premium: boolean
  status: 'pending' | 'approved' | 'rejected'
  responseTime: string
  
  // Rating (default 0)
  rating: {
    overall: number
    count: number
    breakdown: {
      quality: number
      communication: number
      value: number
      professionalism: number
    }
  }
  
  // SEO
  tags: string[]
  keywords: string[]
  
  // Metadata
  createdAt: Timestamp
  updatedAt: Timestamp
  lastActive: Timestamp
}
```

### Firestore Security Rules

```javascript
// Marketplace vendors collection
match /marketplaceVendors/{vendorId} {
  // Anyone can read marketplace vendors (public marketplace)
  allow read: if true;
  
  // Anyone authenticated can create a vendor registration (will be pending approval)
  allow create: if isAuthenticated() &&
                   request.resource.data.keys().hasAll(['name', 'category', 'email', 'phone']) &&
                   request.resource.data.verified == false &&
                   request.resource.data.status == 'pending';
  
  // Only admins can update/delete (handled by admin panel)
  allow update, delete: if false;
}
```

## 🚀 Workflow

### 1. Dodavatel se registruje
1. Navštíví `/marketplace/register`
2. Klikne na "Zaregistrovat se nyní"
3. Vyplní 4-krokový formulář
4. Odešle registraci
5. Zobrazí se success screen
6. Data se uloží do Firestore s `status: 'pending'` a `verified: false`

### 2. Admin schvaluje
1. Přihlásí se do admin panelu
2. Navštíví `/admin/marketplace`
3. Vidí čekající registrace (oranžový badge)
4. Klikne na "Zobrazit detail" nebo přímo na "Schválit"
5. Po schválení se změní `status: 'approved'` a `verified: true`
6. Vendor se zobrazí v marketplace

### 3. Vendor je viditelný
1. Schválený vendor se zobrazí na `/marketplace`
2. Uživatelé ho mohou najít přes vyhledávání a filtry
3. Mohou si ho přidat do svého seznamu dodavatelů
4. Mohou ho kontaktovat

## 🎨 UI/UX

### Registrační formulář
- **Progress bar** - ukazuje aktuální krok (1/4, 2/4, atd.)
- **Validace** - real-time validace polí
- **Error handling** - červené bordery a chybové hlášky
- **Responsive** - funguje na mobilu i desktopu
- **Auto-save** - data se ukládají při přechodu mezi kroky

### Admin panel
- **Statistiky** - přehled počtu registrací
- **Filtry** - rychlé přepínání mezi statusy
- **Akce** - schválit/odmítnout/smazat jedním kliknutím
- **Detail modal** - zobrazení všech informací
- **Loading states** - spinner při akcích

## 📱 Responsive Design

Všechny komponenty jsou plně responzivní:
- Mobile: 1 sloupec, stack layout
- Tablet: 2 sloupce
- Desktop: 3-4 sloupce, side-by-side layout

## 🔐 Bezpečnost

1. **Firestore Rules** - pouze autentizovaní uživatelé mohou vytvářet registrace
2. **Validace** - povinná pole jsou validována na frontendu i backendu
3. **Status kontrola** - nové registrace mají vždy `status: 'pending'`
4. **Admin only** - pouze admin může schvalovat/odmítat/mazat

## 🚧 Budoucí vylepšení

### Priorita 1:
- [ ] Email notifikace po schválení/odmítnutí
- [ ] Upload obrázků (portfolio, logo)
- [ ] Editace profilu po schválení

### Priorita 2:
- [ ] Automatické generování slug z názvu
- [ ] SEO optimalizace vendor profilů
- [ ] Integrace s Google Maps (souřadnice)
- [ ] Recenze a hodnocení

### Priorita 3:
- [ ] Prémiové funkce (featured, premium)
- [ ] Platební systém
- [ ] Statistiky pro dodavatele
- [ ] Messaging systém

## 📊 Metriky

Po implementaci můžeme sledovat:
- Počet registrací za měsíc
- Conversion rate (návštěvy → registrace)
- Čas schválení (od registrace po schválení)
- Počet aktivních dodavatelů
- Počet poptávek na dodavatele

## 🧪 Testování

### Manuální test:
1. Otevřít `/marketplace/register`
2. Vyplnit formulář
3. Odeslat
4. Zkontrolovat Firestore Console
5. Přihlásit se jako admin
6. Otevřít `/admin/marketplace`
7. Schválit registraci
8. Zkontrolovat, že se vendor zobrazí v marketplace

### Edge cases:
- [ ] Prázdný formulář
- [ ] Neplatný email/telefon
- [ ] Duplicitní registrace
- [ ] Velmi dlouhý popis
- [ ] Speciální znaky v názvech

## 📞 Podpora

Pro otázky nebo problémy:
- GitHub Issues
- Email: support@svatbot.cz
- Admin panel: Sekce "Podpora"

