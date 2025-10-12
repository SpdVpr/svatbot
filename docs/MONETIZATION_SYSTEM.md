# 💰 Monetizační systém SvatBot.cz

## 📋 Přehled

SvatBot.cz používá **subscription model** s bezplatným zkušebním obdobím a dvěma placeným tarify.

---

## 🎯 Tarify a ceny

### 1. **Zkušební období (Free Trial)**
- **Cena:** 0 Kč
- **Trvání:** 30 dní od registrace
- **Funkce:** Plný přístup ke všem Premium funkcím
- **Automaticky aktivováno** při registraci nového účtu

### 2. **Premium měsíční**
- **Cena:** 299 Kč / měsíc
- **Fakturace:** Měsíční
- **Zrušení:** Kdykoliv

### 3. **Premium roční** ⭐ NEJOBLÍBENĚJŠÍ
- **Cena:** 2 999 Kč / rok
- **Úspora:** 589 Kč (17% sleva)
- **Cena za měsíc:** 250 Kč
- **Fakturace:** Roční
- **Zrušení:** Kdykoliv

---

## ✨ Funkce Premium

### Základní funkce
- ✅ **Neomezený počet hostů**
- ✅ **Neomezené úkoly**
- ✅ **Neomezený rozpočet**
- ✅ **Neomezení dodavatelé**
- ✅ **Neomezené fotografie**

### Pokročilé funkce
- 🌐 **Svatební web pro hosty**
- 📧 **Online RSVP systém**
- 🖼️ **Foto galerie**
- 📬 **Email notifikace**
- 🤖 **AI asistent**
- 📊 **Pokročilá analytika**
- 🎯 **Prioritní podpora**

### Roční tarif navíc
- 🌍 **Vlastní doména** (s příplatkem)

---

## 🏗️ Technická implementace

### Firebase kolekce

#### `subscriptions/{userId}`
```typescript
{
  id: string                    // User ID
  userId: string
  weddingId: string
  
  // Plan details
  plan: 'free_trial' | 'premium_monthly' | 'premium_yearly'
  status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'expired'
  
  // Trial
  trialStartDate: Timestamp
  trialEndDate: Timestamp       // 30 dní od registrace
  isTrialActive: boolean
  
  // Subscription dates
  currentPeriodStart: Timestamp
  currentPeriodEnd: Timestamp
  cancelAtPeriodEnd: boolean
  canceledAt?: Timestamp
  
  // Pricing
  amount: number                // 0, 299, nebo 2999
  currency: 'CZK'
  
  // Stripe integration
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  stripePaymentMethodId?: string
  
  // Metadata
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

#### `payments/{paymentId}`
```typescript
{
  id: string
  userId: string
  subscriptionId: string
  
  // Payment details
  amount: number
  currency: 'CZK'
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'refunded'
  
  // Payment method
  paymentMethod: 'card' | 'bank_transfer'
  last4?: string                // Poslední 4 číslice karty
  
  // Dates
  createdAt: Timestamp
  paidAt?: Timestamp
  
  // Invoice
  invoiceUrl?: string
  invoiceNumber?: string
  
  // Stripe
  stripePaymentIntentId?: string
  stripeInvoiceId?: string
}
```

#### `usageStats/{userId}`
```typescript
{
  userId: string
  weddingId: string
  
  // Current usage
  guestsCount: number
  tasksCount: number
  budgetItemsCount: number
  vendorsCount: number
  photosCount: number
  
  // Activity
  lastLoginAt: Timestamp
  totalLogins: number
  
  // Features usage
  weddingWebsiteViews: number
  rsvpResponses: number
  aiQueriesCount: number
  
  // Metadata
  updatedAt: Timestamp
}
```

---

## 🔄 Workflow

### 1. Registrace nového uživatele
```
1. Uživatel se zaregistruje
2. Automaticky se vytvoří subscription s:
   - plan: 'free_trial'
   - status: 'trialing'
   - trialEndDate: now + 30 dní
3. Uživatel má plný přístup ke všem funkcím
```

### 2. Konec zkušebního období
```
1. 7 dní před koncem: Email upozornění
2. 3 dny před koncem: Email upozornění
3. 1 den před koncem: Email upozornění
4. Po vypršení:
   - status: 'expired'
   - Zobrazí se upgrade prompt
   - Omezený přístup k funkcím
```

### 3. Upgrade na Premium
```
1. Uživatel vybere tarif (měsíční/roční)
2. Přesměrování na Stripe Checkout
3. Po úspěšné platbě:
   - status: 'active'
   - plan: 'premium_monthly' nebo 'premium_yearly'
   - currentPeriodEnd: now + 1 měsíc/rok
4. Vytvoří se záznam v payments
```

### 4. Obnovení předplatného
```
1. Stripe automaticky obnoví předplatné
2. Webhook aktualizuje subscription:
   - currentPeriodStart: now
   - currentPeriodEnd: now + 1 měsíc/rok
3. Vytvoří se nový záznam v payments
```

### 5. Zrušení předplatného
```
1. Uživatel klikne "Zrušit předplatné"
2. Nastaví se:
   - cancelAtPeriodEnd: true
   - canceledAt: now
3. Přístup zůstává do konce období
4. Po vypršení:
   - status: 'expired'
```

---

## 💳 Platební integrace

### Stripe Firebase Extension

Používáme **Firebase Extension for Stripe** pro zpracování plateb:

#### Instalace
```bash
firebase ext:install stripe/firestore-stripe-payments
```

#### Konfigurace
```
Stripe Secret Key: sk_live_...
Stripe Publishable Key: pk_live_...
Products Collection: products
Customers Collection: customers
Subscriptions Collection: subscriptions
```

#### Produkty v Stripe
1. **Premium Monthly**
   - ID: `premium_monthly`
   - Cena: 299 CZK
   - Interval: month

2. **Premium Yearly**
   - ID: `premium_yearly`
   - Cena: 2999 CZK
   - Interval: year

---

## 📧 Email notifikace

### Typy emailů

1. **Vítací email**
   - Odesláno: Po registraci
   - Obsah: Potvrzení registrace + info o trialu

2. **Trial končí za 7 dní**
   - Odesláno: 23 dní po registraci
   - Obsah: Upozornění + výhody Premium

3. **Trial končí za 3 dny**
   - Odesláno: 27 dní po registraci
   - Obsah: Urgentní upozornění + CTA

4. **Trial končí za 1 den**
   - Odesláno: 29 dní po registraci
   - Obsah: Poslední šance + speciální nabídka

5. **Trial vypršel**
   - Odesláno: Po vypršení trialu
   - Obsah: Upgrade prompt

6. **Platba úspěšná**
   - Odesláno: Po úspěšné platbě
   - Obsah: Potvrzení + faktura

7. **Platba selhala**
   - Odesláno: Když selže platba
   - Obsah: Upozornění + aktualizace platební metody

8. **Předplatné zrušeno**
   - Odesláno: Po zrušení
   - Obsah: Potvrzení + datum konce přístupu

---

## 🎨 UI komponenty

### 1. AccountModal
Hlavní modal pro správu účtu s 5 taby:
- **Profil:** Osobní údaje, email, heslo
- **Předplatné:** Aktuální tarif, upgrade, zrušení
- **Platby:** Historie plateb, faktury
- **Statistiky:** Využití aplikace, pokrok
- **Nastavení:** Notifikace, jazyk, téma

### 2. SubscriptionBanner
Banner v dashboardu zobrazující:
- Zbývající dny trialu
- Status předplatného
- CTA pro upgrade

### 3. UpgradePrompt
Modal pro upgrade při pokusu o Premium funkci:
- Porovnání tarifů
- Výhody Premium
- CTA tlačítko

---

## 🔒 Zabezpečení

### Kontrola přístupu

```typescript
// Hook pro kontrolu Premium přístupu
const { hasPremiumAccess } = useSubscription()

// Použití v komponentách
if (!hasPremiumAccess) {
  return <UpgradePrompt />
}
```

### Firestore Rules

```javascript
// Subscription - pouze vlastník může číst/upravovat
match /subscriptions/{userId} {
  allow read, write: if request.auth.uid == userId;
}

// Payments - pouze vlastník může číst
match /payments/{paymentId} {
  allow read: if request.auth.uid == resource.data.userId;
  allow write: if false; // Pouze Stripe webhook
}

// Usage Stats - pouze vlastník může číst
match /usageStats/{userId} {
  allow read: if request.auth.uid == userId;
  allow write: if request.auth.uid == userId;
}
```

---

## 📊 Analytika

### Metriky k sledování

1. **Conversion Rate**
   - Trial → Premium
   - Cílová hodnota: 20-30%

2. **Churn Rate**
   - Zrušení předplatného
   - Cílová hodnota: < 5% měsíčně

3. **MRR (Monthly Recurring Revenue)**
   - Měsíční opakující se příjem
   - Cíl: Růst 10% měsíčně

4. **LTV (Lifetime Value)**
   - Průměrná hodnota zákazníka
   - Cíl: > 2000 Kč

5. **CAC (Customer Acquisition Cost)**
   - Náklady na získání zákazníka
   - Cíl: < 500 Kč

---

## 🚀 Další kroky

### Fáze 1: MVP (Aktuální)
- ✅ Základní subscription systém
- ✅ Free trial 30 dní
- ✅ 2 placené tarify
- ✅ UI pro správu účtu
- ⏳ Stripe integrace

### Fáze 2: Platby
- ⏳ Stripe Checkout integrace
- ⏳ Webhook handling
- ⏳ Fakturace
- ⏳ Email notifikace

### Fáze 3: Optimalizace
- ⏳ A/B testování cen
- ⏳ Referral program
- ⏳ Slevové kódy
- ⏳ Roční slevy

### Fáze 4: Rozšíření
- ⏳ Enterprise tarif
- ⏳ White-label řešení
- ⏳ API přístup
- ⏳ Affiliate program

---

## 💡 Best Practices

1. **Transparentnost**
   - Jasné ceny bez skrytých poplatků
   - Snadné zrušení kdykoliv

2. **Value First**
   - 30 dní trial pro vyzkoušení
   - Žádná kreditní karta při registraci

3. **Komunikace**
   - Pravidelné upozornění před koncem trialu
   - Jasné informace o výhodách Premium

4. **Podpora**
   - Rychlá odpověď na dotazy
   - Nápověda v aplikaci

5. **Flexibilita**
   - Možnost změny tarifu
   - Možnost zrušení kdykoliv
   - Vrácení peněz do 14 dní

---

## 📞 Kontakt a podpora

Pro otázky ohledně předplatného:
- Email: podpora@svatbot.cz
- Chat: V aplikaci (Premium zákazníci)
- FAQ: https://svatbot.cz/faq

