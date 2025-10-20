# 🤝 Affiliate Provizní Systém - Svatbot

Kompletní dokumentace affiliate provizního systému pro partnery.

## 📋 Přehled

Affiliate systém umožňuje partnerům vydělávat **10% provizi** z každého prodeje Premium předplatného, které přivedou přes svůj unikátní referral odkaz.

## 🎯 Klíčové Funkce

### Pro Partnery
- ✅ Registrace do affiliate programu
- ✅ Unikátní referral kód a odkaz
- ✅ Dashboard se statistikami (kliknutí, konverze, provize)
- ✅ Automatické sledování provizí
- ✅ Žádosti o výplatu
- ✅ Historie výplat
- ✅ Marketingové materiály

### Pro Administrátory
- ✅ Schvalování přihlášek partnerů
- ✅ Správa partnerů (aktivace, pozastavení, ukončení)
- ✅ Přehled všech provizí
- ✅ Zpracování výplat
- ✅ Statistiky a analytika
- ✅ Nastavení provizních sazeb

## 🏗️ Architektura

### Firebase Kolekce

#### `affiliateApplications`
Přihlášky do affiliate programu.
```typescript
{
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  company?: string
  website?: string
  motivation: string
  experience: string
  audience: string
  promotionPlan: string
  instagram?: string
  facebook?: string
  youtube?: string
  tiktok?: string
  blog?: string
  expectedMonthlyClicks?: number
  expectedMonthlyConversions?: number
  status: 'pending' | 'approved' | 'rejected'
  reviewedAt?: Date
  reviewedBy?: string
  reviewNotes?: string
  createdAt: Date
  updatedAt: Date
}
```

#### `affiliatePartners`
Schválení affiliate partneři.
```typescript
{
  id: string
  userId: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  company?: string
  website?: string
  status: 'pending' | 'active' | 'suspended' | 'rejected' | 'terminated'
  referralCode: string  // např. "SVATBA2024"
  referralLink: string  // "https://svatbot.cz?ref=SVATBA2024"
  commissionRate: number  // 10
  customCommissionRate?: number
  stats: {
    totalClicks: number
    totalRegistrations: number
    totalConversions: number
    totalRevenue: number
    totalCommission: number
    pendingCommission: number
    paidCommission: number
  }
  payoutMethod: 'bank_transfer' | 'paypal' | 'stripe'
  payoutDetails: {
    bankAccount?: string
    iban?: string
    paypalEmail?: string
    stripeAccountId?: string
  }
  minPayoutAmount: number  // 1000 CZK
  createdAt: Date
  updatedAt: Date
}
```

#### `commissions`
Provize z prodejů.
```typescript
{
  id: string
  affiliateId: string
  affiliateCode: string
  userId: string
  userEmail: string
  subscriptionId: string
  stripePaymentIntentId?: string
  stripeInvoiceId?: string
  plan: 'premium_monthly' | 'premium_yearly'
  amount: number  // Částka platby
  currency: 'CZK'
  commissionRate: number  // 10
  commissionAmount: number  // Vypočtená provize
  status: 'pending' | 'confirmed' | 'paid' | 'cancelled'
  createdAt: Date
  confirmedAt?: Date
  paidAt?: Date
  payoutId?: string
}
```

#### `payouts`
Výplaty provizí.
```typescript
{
  id: string
  affiliateId: string
  amount: number
  currency: 'CZK'
  commissionIds: string[]
  commissionCount: number
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  method: 'bank_transfer' | 'paypal' | 'stripe'
  payoutDetails: {
    bankAccount?: string
    iban?: string
    paypalEmail?: string
    stripeTransferId?: string
  }
  requestedAt: Date
  processedAt?: Date
  completedAt?: Date
  failedReason?: string
  processedBy?: string
  createdAt: Date
  updatedAt: Date
}
```

#### `affiliateClicks`
Tracking kliknutí na affiliate odkazy.
```typescript
{
  id: string
  affiliateId: string
  affiliateCode: string
  landingPage: string
  converted: boolean
  userId?: string
  subscriptionId?: string
  clickedAt: Date
  convertedAt?: Date
  createdAt: Date
}
```

#### `userAffiliateRefs`
Reference mezi uživateli a affiliate partnery.
```typescript
{
  id: string
  userId: string
  userEmail: string
  affiliateId: string
  affiliateCode: string
  registeredAt: Date
  converted: boolean
  subscriptionId?: string
  convertedAt?: Date
}
```

## 🔄 Workflow

### 1. Registrace Partnera

1. Partner vyplní formulář na `/affiliate/register`
2. Přihláška se uloží do `affiliateApplications` se statusem `pending`
3. Admin obdrží notifikaci o nové přihlášce

### 2. Schválení Partnera

1. Admin zkontroluje přihlášku v `/admin/affiliates`
2. Admin schválí nebo zamítne přihlášku
3. Při schválení:
   - Vytvoří se záznam v `affiliatePartners`
   - Vygeneruje se unikátní `referralCode`
   - Partner obdrží email s přístupovými údaji

### 3. Tracking Kliknutí

1. Uživatel klikne na affiliate odkaz: `https://svatbot.cz?ref=SVATBA2024`
2. `AffiliateTracker` komponenta zachytí `ref` parametr
3. Uloží se cookie `affiliate_ref` na 30 dní
4. Vytvoří se záznam v `affiliateClicks`
5. Aktualizuje se `stats.totalClicks` u partnera

### 4. Tracking Registrace

1. Uživatel se zaregistruje
2. `useAuth` hook zavolá `trackAffiliateRegistration()`
3. Vytvoří se záznam v `userAffiliateRefs`
4. Aktualizuje se `stats.totalRegistrations` u partnera
5. Aktualizuje se `converted: true` v `affiliateClicks`

### 5. Tracking Konverze (Platba)

1. Uživatel zaplatí Premium předplatné
2. Stripe webhook zavolá `trackAffiliateConversionServer()`
3. Najde se `userAffiliateRefs` pro uživatele
4. Vypočítá se provize (10% z částky)
5. Vytvoří se záznam v `commissions` se statusem `confirmed`
6. Aktualizují se statistiky partnera:
   - `stats.totalConversions++`
   - `stats.totalRevenue += amount`
   - `stats.totalCommission += commissionAmount`
   - `stats.pendingCommission += commissionAmount`
7. Vymaže se affiliate cookie

### 6. Žádost o Výplatu

1. Partner požádá o výplatu v `/affiliate/dashboard`
2. Vytvoří se záznam v `payouts` se statusem `pending`
3. Provize se označí `payoutId`
4. Admin obdrží notifikaci

### 7. Zpracování Výplaty

1. Admin zpracuje výplatu v `/admin/affiliates`
2. Provede bankovní převod / PayPal / Stripe
3. Označí výplatu jako `completed`
4. Provize se změní na status `paid`
5. Aktualizují se statistiky partnera:
   - `stats.paidCommission += amount`
   - `stats.pendingCommission -= amount`

## 🔐 Bezpečnost

### Firestore Rules

```javascript
// Affiliate Applications
match /affiliateApplications/{applicationId} {
  allow create: if isAuthenticated()
  allow read: if isAuthenticated() && (resource.data.email == request.auth.token.email || isAdmin())
  allow update, delete: if isAdmin()
}

// Affiliate Partners
match /affiliatePartners/{affiliateId} {
  allow read: if isAuthenticated() && (isAffiliatePartner(affiliateId) || isAdmin())
  allow create, update: if isAdmin()
  allow update: if isAuthenticated() && isAffiliatePartner(affiliateId) && 
                   request.resource.data.diff(resource.data).affectedKeys()
                     .hasOnly(['payoutDetails', 'payoutMethod', 'phone', 'website', 'notes', 'updatedAt'])
  allow delete: if isSuperAdmin()
}

// Commissions
match /commissions/{commissionId} {
  allow read: if isAuthenticated() && (isAffiliatePartner(resource.data.affiliateId) || isAdmin())
  allow create, update: if isAdmin()
  allow delete: if isSuperAdmin()
}

// Payouts
match /payouts/{payoutId} {
  allow read: if isAuthenticated() && (isAffiliatePartner(resource.data.affiliateId) || isAdmin())
  allow create: if isAuthenticated() && isAffiliatePartner(request.resource.data.affiliateId)
  allow update: if isAdmin()
  allow delete: if isSuperAdmin()
}
```

## 📊 Stránky

### Veřejné
- `/affiliate/register` - Registrace do affiliate programu

### Pro Partnery
- `/affiliate/dashboard` - Dashboard partnera
  - Přehled statistik
  - Referral odkaz
  - Seznam provizí
  - Historie výplat
  - Nastavení

### Pro Administrátory
- `/admin/affiliates` - Správa affiliate systému
  - Seznam partnerů
  - Přihlášky
  - Provize
  - Výplaty

## 🎨 Komponenty

- `AffiliateTracker` - Automatické sledování affiliate odkazů
- `useAffiliate` - Hook pro práci s affiliate daty

## 📦 Knihovny

- `src/lib/affiliateTracking.ts` - Tracking funkce
- `src/types/affiliate.ts` - TypeScript typy
- `src/hooks/useAffiliate.ts` - React hook

## 🚀 Nasazení

### 1. Environment Variables

Žádné speciální proměnné nejsou potřeba - používá se existující Firebase a Stripe konfigurace.

### 2. Firestore Rules

```bash
firebase deploy --only firestore:rules
```

### 3. Stripe Webhook

Webhook již existuje na `/api/stripe/webhook` a byl rozšířen o affiliate tracking.

## 📈 Metriky

### Partner Dashboard
- Celkem kliknutí
- Celkem registrací
- Celkem konverzí
- Celkový obrat
- Celková provize
- K výplatě
- Vyplaceno
- Conversion rate

### Admin Dashboard
- Aktivních partnerů
- Celková provize
- Čekající přihlášky
- Čekající výplaty

## 🔧 Konfigurace

### Provizní Sazba
Default: **10%**

Lze nastavit individuálně pro každého partnera v `customCommissionRate`.

### Minimální Výplata
Default: **1000 Kč**

Lze nastavit individuálně pro každého partnera v `minPayoutAmount`.

### Cookie Duration
Default: **30 dní**

Nastaveno v `src/lib/affiliateTracking.ts`.

## 🎯 Budoucí Vylepšení

- [ ] Automatické výplaty přes Stripe Connect
- [ ] Multi-tier provize (různé sazby pro různé plány)
- [ ] Recurring provize (provize z každé platby, ne jen první)
- [ ] Affiliate dashboard analytics (grafy, trendy)
- [ ] Email notifikace pro partnery
- [ ] Marketingové materiály (bannery, šablony)
- [ ] Affiliate leaderboard
- [ ] Bonusy za milníky (100 konverzí = bonus)

## 📞 Podpora

Pro technickou podporu kontaktujte: admin@svatbot.cz

