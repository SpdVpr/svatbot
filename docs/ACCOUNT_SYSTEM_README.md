# 👤 Systém uživatelského účtu - Rychlý průvodce

## 🎯 Co bylo implementováno

### 1. **Změna tlačítka "Nastavení" → "Účet"**
- Tlačítko v hlavičce dashboardu změněno z "Nastavení" na "Účet"
- Ikona změněna z `Settings` na `User`
- Zachováno tlačítko pro úpravu svatby (kliknutím na jména)

### 2. **Nový AccountModal s 5 taby**

#### 📋 Tab: Profil
- Zobrazení a úprava osobních údajů
- Jméno, email, datum vytvoření účtu
- Ověření emailu
- Změna hesla
- Dvoufaktorové ověření (připraveno)

#### 👑 Tab: Předplatné
- Aktuální status předplatného
- Zbývající dny trialu
- Výběr tarifu (měsíční/roční)
- Porovnání funkcí
- Upgrade tlačítko
- Zrušení/obnovení předplatného

#### 💳 Tab: Platby
- Historie plateb
- Stažení faktur
- Platební metoda
- Fakturační údaje

#### 📊 Tab: Statistiky
- Přehled využití (hosté, úkoly, rozpočet, dodavatelé)
- Aktivita (přihlášení, zobrazení webu, RSVP, AI dotazy)
- Dokončení úkolů (progress bar)
- Využití rozpočtu (progress bar)

#### ⚙️ Tab: Nastavení
- Email notifikace
- Push notifikace
- Marketingové emaily
- Konkrétní upozornění (úkoly, rozpočet, hosté)
- Jazyk a časové pásmo
- Téma (světlé/tmavé - připraveno)

---

## 💰 Monetizační model

### Tarify

| Tarif | Cena | Trvání | Výhody |
|-------|------|--------|--------|
| **Zkušební období** | 0 Kč | 30 dní | Všechny Premium funkce |
| **Premium měsíční** | 299 Kč | 1 měsíc | Plný přístup |
| **Premium roční** ⭐ | 2 999 Kč | 1 rok | Úspora 589 Kč (17%) |

### Automatický trial
- Každý nový účet dostane **30 dní zdarma**
- Plný přístup ke všem funkcím
- Žádná kreditní karta při registraci
- Po vypršení: výzva k upgradu

---

## 🏗️ Struktura souborů

### Nové soubory

```
src/
├── types/
│   └── subscription.ts              # Typy pro subscription systém
├── hooks/
│   └── useSubscription.ts           # Hook pro správu předplatného
└── components/
    └── account/
        ├── AccountModal.tsx         # Hlavní modal s taby
        ├── ProfileTab.tsx           # Tab pro profil
        ├── SubscriptionTab.tsx      # Tab pro předplatné
        ├── PaymentsTab.tsx          # Tab pro platby
        ├── StatisticsTab.tsx        # Tab pro statistiky
        └── SettingsTab.tsx          # Tab pro nastavení

docs/
├── MONETIZATION_SYSTEM.md           # Kompletní dokumentace
└── ACCOUNT_SYSTEM_README.md         # Tento soubor
```

### Upravené soubory

```
src/components/dashboard/Dashboard.tsx
- Import AccountModal
- Změna Settings → User ikony
- Přidání showAccountModal state
- Změna onClick handlerů
```

---

## 🔧 Použití

### Otevření Account modalu

```typescript
import { useState } from 'react'
import AccountModal from '@/components/account/AccountModal'

function MyComponent() {
  const [showAccount, setShowAccount] = useState(false)

  return (
    <>
      <button onClick={() => setShowAccount(true)}>
        Účet
      </button>

      {showAccount && (
        <AccountModal onClose={() => setShowAccount(false)} />
      )}
    </>
  )
}
```

### Kontrola Premium přístupu

```typescript
import { useSubscription } from '@/hooks/useSubscription'

function PremiumFeature() {
  const { hasPremiumAccess, trialDaysRemaining } = useSubscription()

  if (!hasPremiumAccess) {
    return (
      <div>
        <p>Tato funkce vyžaduje Premium</p>
        <p>Zbývá {trialDaysRemaining} dní trialu</p>
      </div>
    )
  }

  return <div>Premium obsah</div>
}
```

### Získání subscription dat

```typescript
import { useSubscription } from '@/hooks/useSubscription'

function SubscriptionInfo() {
  const {
    subscription,
    payments,
    usageStats,
    loading,
    hasPremiumAccess,
    trialDaysRemaining,
    plans
  } = useSubscription()

  if (loading) return <div>Načítání...</div>

  return (
    <div>
      <p>Tarif: {subscription?.plan}</p>
      <p>Status: {subscription?.status}</p>
      <p>Premium: {hasPremiumAccess ? 'Ano' : 'Ne'}</p>
      <p>Trial: {trialDaysRemaining} dní</p>
    </div>
  )
}
```

---

## 🔥 Firebase kolekce

### subscriptions/{userId}
```typescript
{
  userId: string
  weddingId: string
  plan: 'free_trial' | 'premium_monthly' | 'premium_yearly'
  status: 'trialing' | 'active' | 'expired' | 'canceled'
  trialStartDate: Timestamp
  trialEndDate: Timestamp
  isTrialActive: boolean
  currentPeriodStart: Timestamp
  currentPeriodEnd: Timestamp
  amount: number
  currency: 'CZK'
  // ... další pole
}
```

### payments/{paymentId}
```typescript
{
  userId: string
  subscriptionId: string
  amount: number
  currency: 'CZK'
  status: 'succeeded' | 'failed' | 'pending'
  createdAt: Timestamp
  invoiceUrl?: string
  // ... další pole
}
```

### usageStats/{userId}
```typescript
{
  userId: string
  weddingId: string
  guestsCount: number
  tasksCount: number
  budgetItemsCount: number
  vendorsCount: number
  totalLogins: number
  weddingWebsiteViews: number
  rsvpResponses: number
  aiQueriesCount: number
  // ... další pole
}
```

---

## ⚡ Automatické vytvoření trialu

Při registraci nového uživatele se automaticky vytvoří:

```typescript
// V useSubscription.ts - createTrialSubscription()
{
  plan: 'free_trial',
  status: 'trialing',
  trialStartDate: now,
  trialEndDate: now + 30 dní,
  isTrialActive: true,
  amount: 0,
  currency: 'CZK'
}
```

---

## 🎨 UI komponenty

### Banner v dashboardu
- Zobrazuje zbývající dny trialu
- Tlačítko pro upgrade
- Barevné rozlišení statusu (modrá/zelená/červená)

### Subscription Tab
- Výběr tarifu (měsíční/roční)
- Porovnání funkcí
- Upgrade tlačítko
- Zrušení předplatného

### Payments Tab
- Seznam plateb s ikonami statusu
- Tlačítko pro stažení faktury
- Fakturační údaje (připraveno)

### Statistics Tab
- Karty s čísly (hosté, úkoly, rozpočet, dodavatelé)
- Progress bary (úkoly, rozpočet)
- Aktivita (přihlášení, zobrazení, RSVP, AI)

---

## 🚀 Další kroky

### Fáze 1: Stripe integrace ⏳
```bash
# Instalace Stripe Extension
firebase ext:install stripe/firestore-stripe-payments

# Konfigurace produktů v Stripe
- Premium Monthly: 299 CZK/měsíc
- Premium Yearly: 2999 CZK/rok
```

### Fáze 2: Webhook handling ⏳
```typescript
// functions/src/stripe-webhooks.ts
- checkout.session.completed
- customer.subscription.updated
- customer.subscription.deleted
- invoice.payment_succeeded
- invoice.payment_failed
```

### Fáze 3: Email notifikace ⏳
```typescript
// Typy emailů
- Vítací email
- Trial končí (7, 3, 1 den)
- Trial vypršel
- Platba úspěšná/selhala
- Předplatné zrušeno
```

### Fáze 4: Testování ⏳
```bash
# Test flow
1. Registrace → Trial vytvoření
2. Upgrade → Stripe Checkout
3. Platba → Webhook → Status update
4. Zrušení → Cancel at period end
5. Vypršení → Status expired
```

---

## 📝 Checklist implementace

### ✅ Hotovo
- [x] Typy pro subscription systém
- [x] Hook useSubscription
- [x] AccountModal komponenta
- [x] ProfileTab
- [x] SubscriptionTab
- [x] PaymentsTab
- [x] StatisticsTab
- [x] SettingsTab
- [x] Změna tlačítka Nastavení → Účet
- [x] Automatické vytvoření trialu
- [x] Dokumentace

### ⏳ Zbývá
- [ ] Stripe integrace
- [ ] Webhook handling
- [ ] Email notifikace
- [ ] Fakturace
- [ ] Testování plateb
- [ ] A/B testování cen
- [ ] Referral program

---

## 🐛 Známé problémy

1. **Stripe integrace není dokončena**
   - Tlačítko "Upgradovat" zobrazí chybovou hlášku
   - Potřeba nastavit Stripe Extension

2. **Email notifikace nejsou implementovány**
   - Žádné automatické emaily
   - Potřeba Firebase Functions

3. **Fakturační údaje nejsou funkční**
   - Formulář je disabled
   - Potřeba propojení se Stripe

---

## 📞 Podpora

Pro otázky nebo problémy:
- Dokumentace: `docs/MONETIZATION_SYSTEM.md`
- Kód: `src/components/account/`
- Hooks: `src/hooks/useSubscription.ts`
- Typy: `src/types/subscription.ts`

---

## 🎉 Shrnutí

Systém uživatelského účtu je **připraven k použití** s následujícími funkcemi:

✅ Kompletní UI pro správu účtu
✅ Subscription systém s trialem
✅ Tarify a ceny
✅ Statistiky a analytika
✅ Nastavení notifikací

⏳ Čeká na dokončení:
- Stripe platební integrace
- Email notifikace
- Webhook handling

**Aplikace je připravena na monetizaci!** 🚀

