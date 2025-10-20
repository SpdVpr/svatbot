# 🚀 Stripe Setup Guide - Testovací režim

## ✅ Co je hotovo

### 1. Environment Variables
- ✅ Stripe Publishable Key přidán do `.env.local`
- ✅ Stripe Secret Key přidán do `.env.local`

### 2. API Endpointy
- ✅ `/api/stripe/create-checkout-session` - Vytvoření checkout session
- ✅ `/api/stripe/webhook` - Webhook handler pro Stripe události
- ✅ `/api/stripe/cancel-subscription` - Zrušení předplatného
- ✅ `/api/stripe/reactivate-subscription` - Obnovení předplatného

### 3. Stripe Integration
- ✅ `src/lib/stripe.ts` aktualizován pro reálné Stripe API
- ✅ `STRIPE_CONFIG.enabled = true` ✅

### 4. Setup Script
- ✅ `scripts/setup-stripe-products.js` - Script pro vytvoření produktů

---

## 📋 Kroky k dokončení

### Krok 1: Nainstalovat Stripe package ✅

```bash
npm install stripe
```

### Krok 2: Vytvořit produkty v Stripe

```bash
node scripts/setup-stripe-products.js
```

**Co tento script udělá:**
1. Vytvoří produkt "SvatBot Premium - Měsíční" (299 CZK/měsíc)
2. Vytvoří produkt "SvatBot Premium - Roční" (2999 CZK/rok)
3. Vypíše Price IDs, které musíte přidat do `.env.local`

**Výstup bude vypadat takto:**
```
✅ Setup complete!

📋 Add these to your .env.local:

STRIPE_PRICE_MONTHLY=price_1ABC...
STRIPE_PRICE_YEARLY=price_1XYZ...
```

### Krok 3: Přidat Price IDs do .env.local

Zkopírujte Price IDs ze scriptu a přidejte je do `.env.local`:

```bash
# Stripe Price IDs (from setup-stripe-products.js)
NEXT_PUBLIC_STRIPE_PRICE_MONTHLY=price_1ABC...
NEXT_PUBLIC_STRIPE_PRICE_YEARLY=price_1XYZ...
```

### Krok 4: Nastavit Stripe Webhook

1. **Otevřete Stripe Dashboard:**
   - https://dashboard.stripe.com/test/webhooks

2. **Klikněte "Add endpoint"**

3. **Endpoint URL:**
   - Pro local development: `https://svatbot.cz/api/stripe/webhook`
   - (Pro local testing použijte Stripe CLI - viz níže)

4. **Vyberte události:**
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

5. **Zkopírujte Webhook Secret** a přidejte do `.env.local`:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

### Krok 5: Restartovat dev server

```bash
npm run dev
```

---

## 🧪 Testování

### Test 1: Vytvoření checkout session

1. **Přihlaste se** jako běžný uživatel
2. **Otevřete profil** → Předplatné
3. **Vyberte plán** (měsíční nebo roční)
4. **Klikněte "Upgradovat na Premium"**
5. **Měli byste být přesměrováni na Stripe Checkout** 🎉

### Test 2: Testovací platba

Na Stripe Checkout stránce použijte testovací kartu:

```
Číslo karty: 4242 4242 4242 4242
Expiry: Jakékoli budoucí datum (např. 12/25)
CVC: Jakékoli 3 číslice (např. 123)
Jméno: Jakékoli jméno
```

### Test 3: Webhook události

Po úspěšné platbě zkontrolujte:
- ✅ Předplatné aktualizováno v Firestore (`subscriptions` kolekce)
- ✅ Platba vytvořena v Firestore (`payments` kolekce)
- ✅ Admin dashboard zobrazuje novou platbu

---

## 🔧 Local Development s Stripe CLI

Pro testování webhooků lokálně:

### 1. Nainstalovat Stripe CLI

**Windows:**
```bash
scoop install stripe
```

**Mac:**
```bash
brew install stripe/stripe-cli/stripe
```

### 2. Přihlásit se

```bash
stripe login
```

### 3. Forward webhooks

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Tento příkaz vypíše webhook secret - přidejte ho do `.env.local`:
```bash
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 4. Trigger test events

```bash
stripe trigger checkout.session.completed
stripe trigger invoice.payment_succeeded
```

---

## 📊 Testovací karty

### Úspěšné platby

| Karta | Popis |
|-------|-------|
| `4242 4242 4242 4242` | Úspěšná platba |
| `4000 0025 0000 3155` | Vyžaduje 3D Secure |
| `5555 5555 5555 4444` | Mastercard |

### Neúspěšné platby

| Karta | Popis |
|-------|-------|
| `4000 0000 0000 0002` | Karta odmítnuta |
| `4000 0000 0000 9995` | Nedostatek prostředků |
| `4000 0000 0000 0069` | Platba vypršela |

**Všechny testovací karty:**
- Expiry: Jakékoli budoucí datum
- CVC: Jakékoli 3 číslice
- ZIP: Jakékoli 5 číslic

---

## 🔐 Bezpečnost

### Environment Variables

**NIKDY** necommitujte `.env.local` do gitu!

Ujistěte se, že `.gitignore` obsahuje:
```
.env.local
.env*.local
```

### API Keys

- ✅ Publishable Key (`pk_test_...`) - Bezpečné pro frontend
- ⚠️ Secret Key (`sk_test_...`) - POUZE pro backend/server-side
- ⚠️ Webhook Secret (`whsec_...`) - POUZE pro backend/server-side

---

## 📁 Struktura souborů

```
src/
├── app/
│   └── api/
│       └── stripe/
│           ├── create-checkout-session/
│           │   └── route.ts          ✅ Vytvoření checkout
│           ├── cancel-subscription/
│           │   └── route.ts          ✅ Zrušení předplatného
│           ├── reactivate-subscription/
│           │   └── route.ts          ✅ Obnovení předplatného
│           └── webhook/
│               └── route.ts          ✅ Webhook handler
├── lib/
│   └── stripe.ts                     ✅ Stripe client functions
└── hooks/
    └── useSubscription.ts            ✅ User subscription hook

scripts/
└── setup-stripe-products.js          ✅ Setup script

.env.local                             ✅ Environment variables
```

---

## 🐛 Troubleshooting

### Problém: "No such price"

**Řešení:** Ujistěte se, že jste spustili `setup-stripe-products.js` a přidali Price IDs do `.env.local`

### Problém: "Webhook signature verification failed"

**Řešení:** 
1. Zkontrolujte, že `STRIPE_WEBHOOK_SECRET` je správně nastavený
2. Pro local development použijte Stripe CLI
3. Ujistěte se, že webhook endpoint je správně nakonfigurovaný v Stripe Dashboard

### Problém: "Invalid API Key"

**Řešení:**
1. Zkontrolujte, že používáte správný Secret Key
2. Ujistěte se, že klíč začína `sk_test_` (pro test mode)
3. Restartujte dev server po změně `.env.local`

### Problém: Checkout session se nevytvoří

**Řešení:**
1. Otevřete browser console (F12)
2. Zkontrolujte network tab pro chyby
3. Zkontrolujte server logs
4. Ujistěte se, že Stripe package je nainstalovaný: `npm list stripe`

---

## ✅ Checklist

- [ ] Stripe package nainstalován (`npm install stripe`)
- [ ] Environment variables nastaveny v `.env.local`
- [ ] Produkty vytvořeny (`node scripts/setup-stripe-products.js`)
- [ ] Price IDs přidány do `.env.local`
- [ ] Webhook endpoint nakonfigurován v Stripe Dashboard
- [ ] Webhook secret přidán do `.env.local`
- [ ] Dev server restartován
- [ ] Testovací platba provedena
- [ ] Webhook události fungují
- [ ] Admin dashboard zobrazuje platby

---

## 🎉 Po dokončení

Po dokončení všech kroků budete mít:

✅ **Funkční Stripe integraci v testovacím režimu**
- Reálné Stripe Checkout UI
- Testovací platby kartou
- Webhook události
- Admin přehled plateb
- User správa předplatného

🚀 **Připraveno na produkci**
- Stačí změnit test keys na live keys
- Vytvořit produkty v live mode
- Nakonfigurovat live webhook
- Deploy!

---

## 📞 Support

**Stripe Dashboard:**
- Test mode: https://dashboard.stripe.com/test
- Logs: https://dashboard.stripe.com/test/logs
- Webhooks: https://dashboard.stripe.com/test/webhooks

**Dokumentace:**
- Stripe API: https://stripe.com/docs/api
- Stripe Checkout: https://stripe.com/docs/payments/checkout
- Webhooks: https://stripe.com/docs/webhooks

---

**Status:** ⏳ **ČEKÁ NA SETUP**  
**Next Step:** Spustit `node scripts/setup-stripe-products.js`

