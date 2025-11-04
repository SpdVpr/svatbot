# 🔄 Migrace ze Stripe na GoPay - Dokončeno

## ✅ Co bylo změněno

### 1. Odstraněné soubory
- ❌ `src/lib/stripe.ts` - Stripe knihovna
- ❌ `src/app/api/stripe/*` - Všechny Stripe API endpointy
- ❌ `stripe` package z `package.json`

### 2. Nové soubory
- ✅ `src/lib/gopay.ts` - GoPay knihovna
- ✅ `src/app/api/gopay/create-payment/route.ts`
- ✅ `src/app/api/gopay/webhook/route.ts`
- ✅ `src/app/api/gopay/refund-payment/route.ts`
- ✅ `src/app/api/gopay/cancel-subscription/route.ts`
- ✅ `src/app/api/gopay/reactivate-subscription/route.ts`

### 3. Aktualizované soubory
- ✅ `src/hooks/useSubscription.ts` - Přepnuto na GoPay
- ✅ `src/components/account/SubscriptionTab.tsx` - Text změněn na GoPay
- ✅ `src/components/account/PaymentsTab.tsx` - Text změněn na GoPay
- ✅ `.env.local` - GoPay credentials místo Stripe
- ✅ `.env.example` - GoPay credentials místo Stripe
- ✅ `package.json` - Odstraněn Stripe package

---

## 📚 Zastaralá dokumentace

Následující soubory obsahují informace o Stripe a jsou nyní **ZASTARALÉ**:

### Stripe dokumentace (NEPOUŽÍVAT)
- ⚠️ `STRIPE_SETUP_GUIDE.md` - Zastaralé
- ⚠️ `STRIPE_QUICK_START.md` - Zastaralé
- ⚠️ `STRIPE_TESTING_GUIDE.md` - Zastaralé
- ⚠️ `docs/STRIPE_INTEGRATION_GUIDE.md` - Zastaralé
- ⚠️ `scripts/setup-stripe-products.js` - Zastaralé

### Částečně zastaralá dokumentace
- ⚠️ `PAYMENT_SYSTEM_README.md` - Obsahuje Stripe info, použijte `GOPAY_INTEGRATION.md`
- ⚠️ `docs/PAYMENT_SYSTEM.md` - Obsahuje Stripe info, použijte `GOPAY_INTEGRATION.md`
- ⚠️ `docs/MONETIZATION_SYSTEM.md` - Obsahuje Stripe info

---

## 📖 Aktuální dokumentace

### Použijte tyto soubory:
- ✅ **`GOPAY_INTEGRATION.md`** - Kompletní GoPay dokumentace
- ✅ **`GOPAY_QUICK_START.md`** - Rychlý start s GoPay

---

## 🔧 Environment Variables

### PŘED (Stripe)
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PRICE_MONTHLY=price_...
NEXT_PUBLIC_STRIPE_PRICE_YEARLY=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### PO (GoPay)
```env
NEXT_PUBLIC_GOPAY_GOID=8208931819
NEXT_PUBLIC_GOPAY_CLIENT_ID=1270557640
GOPAY_CLIENT_SECRET=fGe9aSFX
NEXT_PUBLIC_GOPAY_ENVIRONMENT=test
```

---

## 🔄 API Endpointy

### PŘED (Stripe)
```
POST /api/stripe/create-checkout-session
POST /api/stripe/webhook
POST /api/stripe/cancel-subscription
POST /api/stripe/reactivate-subscription
```

### PO (GoPay)
```
POST /api/gopay/create-payment
GET  /api/gopay/webhook?id=<payment_id>
POST /api/gopay/refund-payment
POST /api/gopay/cancel-subscription
POST /api/gopay/reactivate-subscription
```

---

## 💾 Firestore Změny

### Payments Collection

#### PŘED (Stripe)
```typescript
{
  stripePaymentIntentId: string
  stripeInvoiceId: string
  stripeCustomerId: string
}
```

#### PO (GoPay)
```typescript
{
  goPayId: number
  orderNumber: string
  state: string  // GoPay state
}
```

### Subscriptions Collection

#### PŘED (Stripe)
```typescript
{
  stripeCustomerId: string
  stripeSubscriptionId: string
  stripePaymentMethodId: string
}
```

#### PO (GoPay)
```typescript
{
  goPayCustomerId: string
  // Žádné další GoPay specifické fieldy
}
```

---

## 🚀 Deployment Checklist

- [x] Kód aktualizován na GoPay
- [x] Stripe závislosti odstraněny
- [x] Environment variables aktualizovány
- [x] Dokumentace vytvořena
- [ ] Testování v sandbox prostředí
- [ ] Nastavení webhooku v GoPay
- [ ] Deploy na Vercel
- [ ] Aktualizace environment variables na Vercel
- [ ] Testování na produkci

---

## 📞 Podpora

### GoPay
- **Email:** integrace@gopay.cz
- **Telefon:** +420 228 224 267
- **Dokumentace:** https://doc.gopay.com/

### Stripe (již nepoužíváme)
- ~~https://stripe.com/docs~~

---

## ⚠️ Důležité poznámky

1. **Stripe účet:** Můžete si ponechat Stripe účet pro budoucí použití, ale aplikace jej již nepoužívá.

2. **Historická data:** Pokud máte v Firestore platby se Stripe ID, zůstanou zachovány. Nové platby budou používat GoPay ID.

3. **Webhooks:** Nezapomeňte nastavit webhook URL v GoPay obchodním účtu:
   ```
   https://svatbot.cz/api/gopay/webhook
   ```

4. **Testování:** Vždy nejprve testujte v sandbox prostředí před přechodem na produkci.

---

## ✅ Výsledek

- ✅ Aplikace nyní používá **GoPay** místo Stripe
- ✅ Všechny platby běží přes GoPay platební bránu
- ✅ Podporovány platební karty a bankovní převody
- ✅ Automatická aktivace předplatného přes webhook
- ✅ Kompletní dokumentace k dispozici

**Migrace dokončena! 🎉**

