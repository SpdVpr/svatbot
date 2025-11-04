# 🚀 GoPay Platební Brána - Kompletní Integrace

## ✅ Co bylo implementováno

### 1. GoPay Knihovna (`src/lib/gopay.ts`)
- ✅ OAuth2 autentizace s GoPay API
- ✅ Vytváření plateb přes REST API
- ✅ Získávání stavu plateb
- ✅ Refundace plateb
- ✅ Webhook handling
- ✅ Podpora testovacího i produkčního prostředí

### 2. API Endpointy
- ✅ `/api/gopay/create-payment` - Vytvoření platby
- ✅ `/api/gopay/webhook` - Webhook pro notifikace o změně stavu
- ✅ `/api/gopay/refund-payment` - Vrácení platby
- ✅ `/api/gopay/cancel-subscription` - Zrušení předplatného
- ✅ `/api/gopay/reactivate-subscription` - Obnovení předplatného

### 3. Frontend Integrace
- ✅ `useSubscription` hook aktualizován pro GoPay
- ✅ `SubscriptionTab` komponenta upravena
- ✅ `PaymentsTab` komponenta upravena
- ✅ Odstranění všech Stripe závislostí

### 4. Environment Variables
```env
NEXT_PUBLIC_GOPAY_GOID=8208931819
NEXT_PUBLIC_GOPAY_CLIENT_ID=1270557640
GOPAY_CLIENT_SECRET=fGe9aSFX
NEXT_PUBLIC_GOPAY_ENVIRONMENT=test
```

---

## 🔧 Konfigurace

### Testovací prostředí (Aktuální)
- **GoID:** 8208931819
- **Client ID:** 1270557640
- **Client Secret:** fGe9aSFX
- **API URL:** https://gw.sandbox.gopay.com/api
- **Gateway URL:** https://gw.sandbox.gopay.com/gp-gw/js/embed.js

### Produkční prostředí
Pro přechod na produkci:
1. Změňte `NEXT_PUBLIC_GOPAY_ENVIRONMENT=production` v `.env.local`
2. Získejte produkční přihlašovací údaje od GoPay
3. Aktualizujte GoID, Client ID a Client Secret

---

## 💳 Platební Flow

### 1. Uživatel vybere tarif
```typescript
// V SubscriptionTab.tsx
const handleUpgrade = async () => {
  await upgradeToPremium(selectedPlan) // 'premium_monthly' nebo 'premium_yearly'
}
```

### 2. Vytvoření platby
```typescript
// useSubscription.ts
const { createGoPayPayment } = await import('@/lib/gopay')

const paymentUrl = await createGoPayPayment({
  userId: user.id,
  userEmail: user.email,
  plan: 'premium_monthly',
  successUrl: `${window.location.origin}/?payment=success`,
  cancelUrl: `${window.location.origin}/?payment=canceled`
})

// Přesměrování na GoPay platební bránu
window.location.href = paymentUrl
```

### 3. GoPay API volání
```typescript
// Server-side v /api/gopay/create-payment
const payment = await createGoPayPaymentServer({
  userId,
  userEmail,
  plan,
  successUrl,
  cancelUrl
})

// Vrací:
{
  id: 123456789,
  order_number: "userId_timestamp",
  gw_url: "https://gw.sandbox.gopay.com/...",
  state: "CREATED"
}
```

### 4. Uživatel platí v GoPay bráně
- Platba kartou
- Bankovní převod
- Další metody dle nastavení

### 5. Webhook notifikace
```typescript
// GoPay volá: /api/gopay/webhook?id=123456789

// Získáme stav platby
const payment = await getPaymentStatus(paymentId)

// Aktualizujeme v Firestore
if (payment.state === 'PAID') {
  // Aktivujeme předplatné
  await subscriptionRef.update({
    plan: 'premium_monthly',
    status: 'active',
    currentPeriodStart: now,
    currentPeriodEnd: periodEnd
  })
}
```

### 6. Návrat na web
- Success: `/?payment=success`
- Cancel: `/?payment=canceled`

---

## 📊 Stavy plateb

### GoPay stavy → Naše stavy
- `CREATED` → `pending`
- `PAID` → `succeeded`
- `CANCELED` → `failed`
- `TIMEOUTED` → `failed`
- `REFUNDED` → `refunded`

---

## 🔐 Bezpečnost

### OAuth2 Autentizace
```typescript
// Získání access tokenu
const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

const response = await fetch(`${apiUrl}/oauth2/token`, {
  method: 'POST',
  headers: {
    'Authorization': `Basic ${credentials}`
  },
  body: 'grant_type=client_credentials&scope=payment-all'
})
```

### Webhook Ověření
- GoPay posílá notifikace na `/api/gopay/webhook?id=<payment_id>`
- Ověřujeme stav platby přes API (ne z URL parametru)
- Používáme Firebase Admin SDK pro aktualizaci dat

---

## 💰 Ceník

### Premium Měsíční
- **Cena:** 299 Kč/měsíc
- **Amount:** 29900 (v haléřích)
- **Interval:** month

### Premium Roční
- **Cena:** 2999 Kč/rok
- **Amount:** 299900 (v haléřích)
- **Interval:** year

---

## 🧪 Testování

### 1. Testovací karty
GoPay poskytuje testovací karty pro sandbox prostředí:
- **Úspěšná platba:** 4111111111111111
- **Neúspěšná platba:** 4000000000000002

### 2. Testovací flow
```bash
# 1. Spusťte aplikaci
npm run dev

# 2. Přihlaste se jako uživatel
# 3. Jděte do Account → Subscription
# 4. Vyberte tarif a klikněte na "Upgradovat"
# 5. Budete přesměrováni na GoPay sandbox
# 6. Použijte testovací kartu
# 7. Po platbě budete vráceni zpět
# 8. Webhook aktualizuje předplatné
```

### 3. Manuální testování webhooku
```bash
# Simulujte webhook notifikaci
curl "http://localhost:3000/api/gopay/webhook?id=123456789"
```

---

## 📝 Firestore Struktura

### Payments Collection
```typescript
{
  userId: string
  userEmail: string
  goPayId: number          // ID platby v GoPay
  orderNumber: string      // Číslo objednávky
  amount: number           // Částka v Kč
  currency: string         // "CZK"
  status: string           // "pending" | "succeeded" | "failed" | "refunded"
  state: string            // GoPay stav
  plan: string             // "premium_monthly" | "premium_yearly"
  last4: string            // Poslední 4 číslice karty
  paymentMethod: string    // "card"
  createdAt: Timestamp
  paidAt?: Timestamp
  refundedAt?: Timestamp
  updatedAt: Timestamp
}
```

### Subscriptions Collection
```typescript
{
  userId: string
  weddingId: string
  plan: string             // "free" | "premium_monthly" | "premium_yearly"
  status: string           // "trial" | "active" | "canceled" | "expired"
  amount: number
  currency: string
  currentPeriodStart: Timestamp
  currentPeriodEnd: Timestamp
  cancelAtPeriodEnd: boolean
  canceledAt?: Timestamp
  goPayCustomerId: string  // ID zákazníka v GoPay
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

---

## 🚀 Deployment

### 1. Nastavte environment variables na Vercel
```bash
NEXT_PUBLIC_GOPAY_GOID=8208931819
NEXT_PUBLIC_GOPAY_CLIENT_ID=1270557640
GOPAY_CLIENT_SECRET=fGe9aSFX
NEXT_PUBLIC_GOPAY_ENVIRONMENT=test
```

### 2. Nastavte webhook URL v GoPay
- Přihlaste se do GoPay obchodního účtu
- Nastavte notification URL: `https://svatbot.cz/api/gopay/webhook`

### 3. Deploy
```bash
git add .
git commit -m "feat: GoPay payment integration"
git push origin main
```

---

## 📚 Dokumentace

- **GoPay API:** https://doc.gopay.com/
- **GoPay Help:** https://help.gopay.com/cs/tema/integrace-platebni-brany
- **OAuth2:** https://doc.gopay.com/#oauth

---

## ✅ Checklist

- [x] GoPay knihovna vytvořena
- [x] API endpointy implementovány
- [x] Frontend hooks aktualizovány
- [x] UI komponenty upraveny
- [x] Stripe závislosti odstraněny
- [x] Environment variables nastaveny
- [x] Dokumentace vytvořena
- [ ] Testování v sandbox prostředí
- [ ] Nastavení webhooku v GoPay
- [ ] Přechod na produkční prostředí

---

## 🆘 Troubleshooting

### Chyba: "Nepodařilo se získat přístupový token"
- Zkontrolujte Client ID a Client Secret
- Ověřte, že používáte správné API URL (test/production)

### Webhook se nevolá
- Zkontrolujte notification URL v GoPay nastavení
- Ověřte, že URL je veřejně dostupná (ne localhost)
- Zkontrolujte logy v `/api/gopay/webhook`

### Platba se nezobrazuje v historii
- Zkontrolujte Firestore pravidla
- Ověřte, že webhook byl úspěšně zpracován
- Zkontrolujte logy v konzoli

---

## 📞 Kontakt

Pro technickou podporu GoPay:
- **Email:** integrace@gopay.cz
- **Telefon:** +420 228 224 267
- **Web:** https://www.gopay.com/cs/podpora

