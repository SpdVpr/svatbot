# 💳 Stripe integrace - Průvodce implementací

## 📋 Přehled

Tento průvodce popisuje, jak dokončit integraci Stripe platební brány do SvatBot.cz aplikace.

---

## 🚀 Krok 1: Vytvoření Stripe účtu

1. Přejděte na https://stripe.com
2. Vytvořte účet (nebo se přihlaste)
3. Aktivujte účet (vyplňte firemní údaje)
4. Získejte API klíče:
   - Dashboard → Developers → API keys
   - **Publishable key:** `pk_test_...` (pro frontend)
   - **Secret key:** `sk_test_...` (pro backend)

---

## 🔧 Krok 2: Instalace Stripe Firebase Extension

### Instalace přes Firebase Console

1. Otevřete Firebase Console: https://console.firebase.google.com
2. Vyberte projekt `svatbot-app`
3. Přejděte na **Extensions**
4. Klikněte na **Install Extension**
5. Vyhledejte **"Run Payments with Stripe"**
6. Klikněte na **Install**

### Konfigurace Extension

Během instalace vyplňte:

```
Stripe API Secret Key: sk_test_... (nebo sk_live_...)
Products and pricing plans collection: products
Customer details and subscriptions collection: customers
Payments collection: payments
Sync new users to Stripe customers: Yes
Automatically delete Stripe customer objects: No
```

### Instalace přes CLI (alternativa)

```bash
# Přihlášení do Firebase
firebase login

# Instalace extension
firebase ext:install stripe/firestore-stripe-payments --project=svatbot-app
```

---

## 📦 Krok 3: Vytvoření produktů v Stripe

### Přes Stripe Dashboard

1. Přejděte na **Products** v Stripe Dashboard
2. Klikněte na **Add product**

#### Produkt 1: Premium měsíční
```
Name: Premium měsíční
Description: Měsíční předplatné SvatBot.cz
Pricing:
  - Model: Recurring
  - Price: 299 CZK
  - Billing period: Monthly
  - Product ID: premium_monthly
```

#### Produkt 2: Premium roční
```
Name: Premium roční
Description: Roční předplatné SvatBot.cz se slevou
Pricing:
  - Model: Recurring
  - Price: 2999 CZK
  - Billing period: Yearly
  - Product ID: premium_yearly
```

### Přes Firebase (automaticky)

Vytvořte dokumenty v kolekci `products`:

```typescript
// products/premium_monthly
{
  active: true,
  name: 'Premium měsíční',
  description: 'Měsíční předplatné s plným přístupem',
  role: 'premium',
  images: [],
  metadata: {
    firebaseRole: 'premium'
  },
  prices: {
    monthly: {
      active: true,
      currency: 'czk',
      unit_amount: 29900, // 299 CZK v haléřích
      interval: 'month',
      interval_count: 1,
      trial_period_days: 0
    }
  }
}

// products/premium_yearly
{
  active: true,
  name: 'Premium roční',
  description: 'Roční předplatné se slevou',
  role: 'premium',
  images: [],
  metadata: {
    firebaseRole: 'premium',
    savings: '589 Kč'
  },
  prices: {
    yearly: {
      active: true,
      currency: 'czk',
      unit_amount: 299900, // 2999 CZK v haléřích
      interval: 'year',
      interval_count: 1,
      trial_period_days: 0
    }
  }
}
```

---

## 🔐 Krok 4: Nastavení environment variables

### .env.local

```bash
# Stripe Public Key (pro frontend)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Stripe Secret Key (pro backend/functions)
STRIPE_SECRET_KEY=sk_test_...

# Stripe Webhook Secret (pro ověření webhooků)
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Firebase Functions Config

```bash
firebase functions:config:set stripe.secret_key="sk_test_..."
firebase functions:config:set stripe.webhook_secret="whsec_..."
```

---

## 💻 Krok 5: Implementace Checkout flow

### Frontend - SubscriptionTab.tsx

Aktualizujte metodu `upgradeToPremium`:

```typescript
const upgradeToPremium = async (plan: 'premium_monthly' | 'premium_yearly') => {
  if (!user || !subscription) return

  try {
    setLoading(true)
    
    // 1. Získat Stripe Checkout Session
    const checkoutSessionRef = await addDoc(
      collection(db, 'customers', user.id, 'checkout_sessions'),
      {
        price: plan === 'premium_monthly' 
          ? 'price_monthly_id' // ID z Stripe
          : 'price_yearly_id',  // ID z Stripe
        success_url: `${window.location.origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${window.location.origin}/dashboard`,
        mode: 'subscription',
        allow_promotion_codes: true,
        metadata: {
          userId: user.id,
          weddingId: subscription.weddingId
        }
      }
    )

    // 2. Čekat na vytvoření session URL
    const unsubscribe = onSnapshot(checkoutSessionRef, (snap) => {
      const data = snap.data()
      if (data?.url) {
        // 3. Přesměrovat na Stripe Checkout
        window.location.href = data.url
        unsubscribe()
      }
      if (data?.error) {
        setError(data.error.message)
        setLoading(false)
        unsubscribe()
      }
    })
  } catch (err) {
    console.error('Error creating checkout session:', err)
    setError('Chyba při vytváření platební session')
    setLoading(false)
  }
}
```

---

## 🔔 Krok 6: Webhook handling

### Stripe Dashboard

1. Přejděte na **Developers → Webhooks**
2. Klikněte na **Add endpoint**
3. URL: `https://us-central1-svatbot-app.cloudfunctions.net/stripeWebhook`
4. Vyberte události:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

### Firebase Function

Vytvořte `functions/src/stripe-webhook.ts`:

```typescript
import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import Stripe from 'stripe'

const stripe = new Stripe(functions.config().stripe.secret_key, {
  apiVersion: '2023-10-16'
})

export const stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'] as string
  const webhookSecret = functions.config().stripe.webhook_secret

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    res.status(400).send(`Webhook Error: ${err.message}`)
    return
  }

  const db = admin.firestore()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId
        const weddingId = session.metadata?.weddingId

        if (userId && session.subscription) {
          // Aktualizovat subscription
          await db.collection('subscriptions').doc(userId).update({
            status: 'active',
            plan: session.metadata?.plan || 'premium_monthly',
            stripeCustomerId: session.customer,
            stripeSubscriptionId: session.subscription,
            currentPeriodStart: admin.firestore.Timestamp.now(),
            updatedAt: admin.firestore.Timestamp.now()
          })

          // Vytvořit payment záznam
          await db.collection('payments').add({
            userId,
            subscriptionId: userId,
            amount: session.amount_total! / 100,
            currency: session.currency?.toUpperCase(),
            status: 'succeeded',
            paymentMethod: 'card',
            stripePaymentIntentId: session.payment_intent,
            createdAt: admin.firestore.Timestamp.now(),
            paidAt: admin.firestore.Timestamp.now()
          })
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Najít userId podle Stripe customer ID
        const customerSnap = await db.collection('subscriptions')
          .where('stripeCustomerId', '==', customerId)
          .limit(1)
          .get()

        if (!customerSnap.empty) {
          const userId = customerSnap.docs[0].id
          await db.collection('subscriptions').doc(userId).update({
            status: subscription.status === 'active' ? 'active' : 'past_due',
            currentPeriodEnd: admin.firestore.Timestamp.fromMillis(
              subscription.current_period_end * 1000
            ),
            updatedAt: admin.firestore.Timestamp.now()
          })
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        const customerSnap = await db.collection('subscriptions')
          .where('stripeCustomerId', '==', customerId)
          .limit(1)
          .get()

        if (!customerSnap.empty) {
          const userId = customerSnap.docs[0].id
          await db.collection('subscriptions').doc(userId).update({
            status: 'canceled',
            canceledAt: admin.firestore.Timestamp.now(),
            updatedAt: admin.firestore.Timestamp.now()
          })
        }
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        // Zaznamenat úspěšnou platbu
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        // Odeslat email o selhání platby
        break
      }
    }

    res.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    res.status(500).send('Webhook processing failed')
  }
})
```

---

## 📧 Krok 7: Email notifikace

### Instalace SendGrid Extension

```bash
firebase ext:install sendgrid/firestore-send-email
```

### Konfigurace

```
SendGrid API Key: SG.xxx
Default FROM email: noreply@svatbot.cz
Email documents collection: mail
```

### Vytvoření email šablon

V SendGrid Dashboard vytvořte šablony:
- `trial_ending_7days`
- `trial_ending_3days`
- `trial_ending_1day`
- `trial_expired`
- `payment_succeeded`
- `payment_failed`
- `subscription_canceled`

---

## 🧪 Krok 8: Testování

### Test mode

1. Použijte test API klíče (`pk_test_...`, `sk_test_...`)
2. Test karty:
   - Úspěšná: `4242 4242 4242 4242`
   - Selhání: `4000 0000 0000 0002`
   - 3D Secure: `4000 0027 6000 3184`

### Test flow

```bash
# 1. Registrace
- Vytvořit nový účet
- Ověřit vytvoření trial subscription

# 2. Upgrade
- Kliknout na "Upgradovat"
- Vybrat tarif
- Zadat test kartu
- Dokončit platbu

# 3. Webhook
- Ověřit aktualizaci subscription
- Ověřit vytvoření payment záznamu

# 4. Zrušení
- Kliknout na "Zrušit předplatné"
- Ověřit nastavení cancelAtPeriodEnd
```

---

## 🚀 Krok 9: Produkční nasazení

### Přepnutí na live mode

1. Aktivujte Stripe účet (vyplňte firemní údaje)
2. Získejte live API klíče (`pk_live_...`, `sk_live_...`)
3. Aktualizujte environment variables
4. Vytvořte produkty v live mode
5. Nastavte live webhooks

### Checklist před spuštěním

- [ ] Stripe účet aktivován
- [ ] Live API klíče nastaveny
- [ ] Produkty vytvořeny v live mode
- [ ] Webhooks nastaveny na produkční URL
- [ ] Email šablony vytvořeny
- [ ] Testování dokončeno
- [ ] Fakturační údaje nastaveny
- [ ] Podmínky použití a GDPR

---

## 📊 Monitoring

### Stripe Dashboard

Sledujte:
- Platby (Payments)
- Předplatná (Subscriptions)
- Zákazníky (Customers)
- Události (Events)
- Webhooks (Webhooks)

### Firebase Console

Sledujte:
- Firestore kolekce (subscriptions, payments)
- Functions logy
- Extension logy

---

## 🐛 Troubleshooting

### Webhook nefunguje
```bash
# Testování lokálně
stripe listen --forward-to localhost:5001/svatbot-app/us-central1/stripeWebhook

# Ověření signature
stripe webhooks verify <event_id>
```

### Platba selhává
- Zkontrolujte API klíče
- Ověřte product IDs
- Zkontrolujte webhook secret

### Subscription se neaktualizuje
- Zkontrolujte webhook události
- Ověřte Firestore rules
- Zkontrolujte Functions logy

---

## 📞 Podpora

- Stripe dokumentace: https://stripe.com/docs
- Firebase Extensions: https://extensions.dev
- SvatBot podpora: podpora@svatbot.cz

