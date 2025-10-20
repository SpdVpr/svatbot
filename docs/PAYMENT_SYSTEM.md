# 💳 Platební systém - Dokumentace

## 📋 Přehled

Platební systém SvatBot.cz je připraven pro integraci se Stripe. Momentálně běží v **mock režimu** pro testování, ale je plně připraven na přepnutí na reálné Stripe platby.

---

## 💰 Cenové plány

### 1. Zkušební období (Free Trial)
- **Cena:** 0 Kč
- **Trvání:** 30 dní
- **Funkce:** Všechny Premium funkce zdarma

### 2. Premium měsíční
- **Cena:** 299 Kč/měsíc
- **Fakturace:** Měsíční
- **Funkce:** Všechny funkce aplikace

### 3. Premium roční ⭐ NEJOBLÍBENĚJŠÍ
- **Cena:** 2 999 Kč/rok
- **Úspora:** 589 Kč (oproti měsíčnímu)
- **Fakturace:** Roční
- **Funkce:** Všechny funkce + vlastní doména

---

## 🏗️ Architektura

### Frontend
- **Komponenty:**
  - `src/components/account/SubscriptionTab.tsx` - Výběr plánu a správa předplatného
  - `src/components/account/PaymentsTab.tsx` - Historie plateb pro uživatele
  - `src/components/admin/PaymentsTab.tsx` - Admin přehled plateb

### Hooks
- **`src/hooks/useSubscription.ts`** - User-facing hook pro správu předplatného
- **`src/hooks/useAdminPayments.ts`** - Admin hook pro přehled všech plateb

### Stripe Integration
- **`src/lib/stripe.ts`** - Stripe integrace (mock + připraveno na produkci)

### Firebase Collections
- **`subscriptions`** - Předplatná uživatelů
- **`payments`** - Historie plateb
- **`usageStats`** - Statistiky využití

---

## 🔧 Mock režim (Aktuální stav)

### Jak funguje mock režim:

1. **Uživatel vybere plán** v `SubscriptionTab`
2. **Klikne na "Upgradovat"**
3. **Mock checkout** vytvoří:
   - Záznam v `payments` kolekci (status: `succeeded`)
   - Aktualizuje `subscriptions` kolekci (status: `active`)
   - Vygeneruje mock invoice number
4. **Přesměruje** na dashboard s `?payment=success`

### Mock data:
```typescript
{
  status: 'succeeded',
  paymentMethod: 'card',
  last4: '4242',
  stripePaymentIntentId: 'pi_mock_...',
  stripeInvoiceId: 'in_mock_...',
  invoiceNumber: 'INV-...'
}
```

---

## 🚀 Přepnutí na reálné Stripe

### Krok 1: Nastavit Stripe účet

1. Vytvořte účet na https://stripe.com
2. Aktivujte účet (vyplňte firemní údaje)
3. Získejte API klíče z Dashboard → Developers → API keys

### Krok 2: Nainstalovat Stripe Firebase Extension

```bash
firebase ext:install stripe/firestore-stripe-payments --project=svatbot-app
```

**Konfigurace extension:**
```
Stripe Secret Key: sk_live_...
Products Collection: products
Customers Collection: customers
Subscriptions Collection: subscriptions
```

### Krok 3: Vytvořit produkty v Stripe Dashboard

#### Produkt 1: Premium měsíční
```
Name: Premium měsíční
Price: 299 CZK
Billing: Monthly
Product ID: premium_monthly
```

#### Produkt 2: Premium roční
```
Name: Premium roční
Price: 2999 CZK
Billing: Yearly
Product ID: premium_yearly
```

**Poznamenejte si Price IDs** (např. `price_1ABC...`)

### Krok 4: Aktualizovat konfiguraci

**`.env.local`:**
```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

**`src/lib/stripe.ts`:**
```typescript
export const STRIPE_CONFIG = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  enabled: true, // ← Změnit na true
  
  products: {
    premium_monthly: {
      priceId: 'price_1ABC...', // ← Skutečné Price ID ze Stripe
      amount: 299,
      currency: 'CZK',
      interval: 'month'
    },
    premium_yearly: {
      priceId: 'price_1XYZ...', // ← Skutečné Price ID ze Stripe
      amount: 2999,
      currency: 'CZK',
      interval: 'year'
    }
  }
}
```

### Krok 5: Nastavit Stripe Webhooks

1. V Stripe Dashboard → Developers → Webhooks
2. Přidat endpoint: `https://svatbot.cz/api/stripe-webhook`
3. Vybrat události:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

### Krok 6: Deploy

```bash
npm run build
vercel --prod
```

---

## 📊 Admin Dashboard - Záložka Platby

### Statistiky

**Revenue:**
- Celkový příjem
- Měsíční příjem
- MRR (Monthly Recurring Revenue)
- ARR (Annual Recurring Revenue)

**Předplatná:**
- Aktivní předplatná
- Zkušební období
- Nová předplatná tento měsíc
- Churn Rate

**Platby:**
- Úspěšné platby
- Neúspěšné platby
- Čekající platby
- Průměrná platba (AOV)

### Tabulka plateb

Zobrazuje:
- Uživatel (jméno, email)
- Částka
- Stav (zaplaceno, selhalo, čeká, vráceno)
- Datum
- Číslo faktury + download link

### Filtry

- Vyhledávání podle emailu, jména, čísla faktury
- Filtr podle stavu platby
- Tlačítko Obnovit

---

## 🔐 Bezpečnost

### Firestore Rules

Platby a předplatná jsou chráněny:

```javascript
// Uživatelé mohou číst pouze své vlastní platby
match /payments/{paymentId} {
  allow read: if request.auth != null && 
    resource.data.userId == request.auth.uid;
}

// Admini mohou číst všechny platby
match /payments/{paymentId} {
  allow read: if request.auth != null && 
    get(/databases/$(database)/documents/adminUsers/$(request.auth.uid)).data.role == 'super_admin';
}
```

### Stripe Security

- API klíče jsou v environment variables (nikdy v kódu)
- Webhook signature verification
- PCI compliance přes Stripe
- Platební údaje nejsou ukládány na našich serverech

---

## 🧪 Testování

### Mock režim (aktuální)

```typescript
// Testovat upgrade na Premium
1. Přihlásit se jako uživatel
2. Otevřít Account → Předplatné
3. Vybrat plán (měsíční/roční)
4. Kliknout "Upgradovat"
5. Zkontrolovat, že se vytvoří platba a aktualizuje předplatné
```

### Stripe Test Mode

Když zapnete Stripe, použijte testovací karty:

```
Úspěšná platba: 4242 4242 4242 4242
Neúspěšná platba: 4000 0000 0000 0002
Vyžaduje 3D Secure: 4000 0027 6000 3184

Expiry: Jakékoli budoucí datum
CVC: Jakékoli 3 číslice
```

---

## 📈 Metriky

### MRR (Monthly Recurring Revenue)

Měsíční opakující se příjem:
```
MRR = (Počet měsíčních předplatných × 299) + 
      (Počet ročních předplatných × 2999 / 12)
```

### ARR (Annual Recurring Revenue)

Roční opakující se příjem:
```
ARR = MRR × 12
```

### Churn Rate

Míra odchodu zákazníků:
```
Churn Rate = (Zrušená předplatná / Celkem předplatných) × 100
```

### AOV (Average Order Value)

Průměrná hodnota objednávky:
```
AOV = Celkový příjem / Počet úspěšných plateb
```

---

## 🔄 Workflow

### Nový uživatel

1. **Registrace** → Automaticky vytvoří 30denní trial
2. **Trial končí** → Email notifikace
3. **Upgrade** → Výběr plánu → Stripe Checkout → Aktivní předplatné
4. **Měsíční platba** → Automatická obnova přes Stripe

### Zrušení předplatného

1. **Uživatel klikne "Zrušit"**
2. **Nastaví se `cancelAtPeriodEnd: true`**
3. **Přístup zachován do konce období**
4. **Po vypršení** → Status: `canceled`

### Obnovení předplatného

1. **Uživatel klikne "Obnovit"**
2. **Nastaví se `cancelAtPeriodEnd: false`**
3. **Automatická obnova pokračuje**

---

## 📞 Support

Pro problémy s platbami:
- Admin může vidět všechny platby v Admin Dashboard → Platby
- Stripe Dashboard pro detailní logy
- Email notifikace pro failed payments

---

## ✅ Checklist před spuštěním

- [ ] Stripe účet aktivován
- [ ] Firebase Extension nainstalována
- [ ] Produkty vytvořeny v Stripe
- [ ] Price IDs zkopírovány do konfigurace
- [ ] Environment variables nastaveny
- [ ] Webhooks nakonfigurovány
- [ ] Testovací platby provedeny
- [ ] Firestore rules deploynuty
- [ ] Email notifikace nastaveny
- [ ] `STRIPE_CONFIG.enabled = true`

---

**Status:** ✅ Připraveno k testování v mock režimu  
**Next Step:** Aktivovat Stripe účet a nainstalovat Firebase Extension

