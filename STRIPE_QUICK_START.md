# 🚀 Stripe Quick Start - HOTOVO!

## ✅ Co je nastaveno

### 1. Stripe Produkty vytvořeny ✅

**Premium měsíční:**
- Cena: 299 CZK/měsíc
- Price ID: `price_1SKEbPGbMgpDGrAYGeVzsDcV`

**Premium roční:**
- Cena: 2999 CZK/rok
- Price ID: `price_1SKEbQGbMgpDGrAYHSaKzwHq`

### 2. Environment Variables ✅

```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51SKE7t...
STRIPE_SECRET_KEY=sk_test_51SKE7t...
NEXT_PUBLIC_STRIPE_PRICE_MONTHLY=price_1SKEbPGbMgpDGrAYGeVzsDcV
NEXT_PUBLIC_STRIPE_PRICE_YEARLY=price_1SKEbQGbMgpDGrAYHSaKzwHq
```

### 3. Stripe Integration ✅

- ✅ `src/lib/stripe.ts` - Stripe client
- ✅ `/api/stripe/create-checkout-session` - Vytvoření checkout
- ✅ `/api/stripe/webhook` - Webhook handler
- ✅ `/api/stripe/cancel-subscription` - Zrušení
- ✅ `/api/stripe/reactivate-subscription` - Obnovení
- ✅ `STRIPE_CONFIG.enabled = true`

---

## ⚠️ ZBÝVÁ DOKONČIT

### Krok 1: Nastavit Webhook (DŮLEŽITÉ!)

Webhook je potřeba pro zpracování plateb a aktualizaci předplatných.

#### Možnost A: Pro produkci (svatbot.cz)

1. **Otevřete Stripe Dashboard:**
   - https://dashboard.stripe.com/test/webhooks

2. **Klikněte "Add endpoint"**

3. **Endpoint URL:**
   ```
   https://svatbot.cz/api/stripe/webhook
   ```

4. **Vyberte události:**
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

5. **Zkopírujte Webhook Secret** (začíná `whsec_...`)

6. **Přidejte do `.env.local`:**
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

#### Možnost B: Pro local development

1. **Nainstalujte Stripe CLI:**
   ```bash
   # Windows (Scoop)
   scoop install stripe
   
   # Mac
   brew install stripe/stripe-cli/stripe
   ```

2. **Přihlaste se:**
   ```bash
   stripe login
   ```

3. **Forward webhooks:**
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

4. **Zkopírujte webhook secret** z výstupu a přidejte do `.env.local`:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

### Krok 2: Restartovat dev server

```bash
npm run dev
```

---

## 🧪 Testování

### Test 1: Checkout Flow

1. **Přihlaste se** jako běžný uživatel (ne admin)
2. **Otevřete profil** (ikona v pravém horním rohu)
3. **Klikněte na "Předplatné"**
4. **Vyberte plán** (měsíční nebo roční)
5. **Klikněte "Upgradovat na Premium"**
6. **Měli byste být přesměrováni na Stripe Checkout** 🎉

### Test 2: Testovací platba

Na Stripe Checkout použijte testovací kartu:

```
Číslo karty: 4242 4242 4242 4242
Expiry: 12/25 (jakékoli budoucí datum)
CVC: 123 (jakékoli 3 číslice)
Jméno: Test User
Email: test@example.com
```

### Test 3: Ověření platby

Po úspěšné platbě zkontrolujte:

1. **User profil:**
   - Status předplatného: "Premium měsíční" nebo "Premium roční"
   - Aktivní do: datum

2. **Admin Dashboard:**
   - Otevřete: https://svatbot.cz/admin/dashboard
   - Záložka "Platby"
   - Měli byste vidět novou platbu v tabulce

3. **Stripe Dashboard:**
   - https://dashboard.stripe.com/test/payments
   - Měli byste vidět novou platbu

---

## 📊 Testovací karty

### Úspěšné platby

| Karta | Popis |
|-------|-------|
| `4242 4242 4242 4242` | Úspěšná platba (Visa) |
| `5555 5555 5555 4444` | Úspěšná platba (Mastercard) |
| `4000 0025 0000 3155` | Vyžaduje 3D Secure |

### Neúspěšné platby

| Karta | Popis |
|-------|-------|
| `4000 0000 0000 0002` | Karta odmítnuta |
| `4000 0000 0000 9995` | Nedostatek prostředků |
| `4000 0000 0000 0069` | Platba vypršela |

**Pro všechny karty:**
- Expiry: Jakékoli budoucí datum (např. 12/25)
- CVC: Jakékoli 3 číslice (např. 123)
- ZIP: Jakékoli 5 číslic (např. 12345)

---

## 🔍 Debugging

### Zkontrolovat Stripe Logs

**Stripe Dashboard:**
- https://dashboard.stripe.com/test/logs

**Webhook Events:**
- https://dashboard.stripe.com/test/webhooks

### Zkontrolovat Browser Console

1. Otevřete Developer Tools (F12)
2. Console tab
3. Hledejte logy začínající:
   - `🔄 Creating Stripe Checkout Session:`
   - `✅ Checkout session created:`
   - `❌ Error:`

### Zkontrolovat Server Logs

V terminálu kde běží `npm run dev` hledejte:
- `POST /api/stripe/create-checkout-session`
- `POST /api/stripe/webhook`
- Chybové hlášky

---

## 🐛 Časté problémy

### Problém: "No such price"

**Příčina:** Price IDs nejsou správně nastaveny

**Řešení:**
1. Zkontrolujte `.env.local` - měly by tam být:
   ```
   NEXT_PUBLIC_STRIPE_PRICE_MONTHLY=price_1SKEbPGbMgpDGrAYGeVzsDcV
   NEXT_PUBLIC_STRIPE_PRICE_YEARLY=price_1SKEbQGbMgpDGrAYHSaKzwHq
   ```
2. Restartujte dev server

### Problém: "Webhook signature verification failed"

**Příčina:** Webhook secret není nastaven nebo je nesprávný

**Řešení:**
1. Zkontrolujte `.env.local` - měl by tam být:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```
2. Pro local development použijte Stripe CLI
3. Restartujte dev server

### Problém: Checkout se nevytvoří

**Příčina:** Stripe package není nainstalován nebo API key je nesprávný

**Řešení:**
1. Zkontrolujte instalaci: `npm list stripe`
2. Zkontrolujte API keys v `.env.local`
3. Zkontrolujte browser console pro chyby
4. Restartujte dev server

### Problém: Platba proběhla, ale předplatné se neaktualizovalo

**Příčina:** Webhook nefunguje

**Řešení:**
1. Zkontrolujte webhook logs v Stripe Dashboard
2. Zkontrolujte server logs
3. Ujistěte se, že webhook secret je správně nastaven
4. Pro local development použijte Stripe CLI

---

## ✅ Checklist

- [x] Stripe package nainstalován
- [x] Produkty vytvořeny v Stripe
- [x] Price IDs přidány do `.env.local`
- [x] API endpointy vytvořeny
- [x] `STRIPE_CONFIG.enabled = true`
- [ ] **Webhook endpoint nakonfigurován** ⚠️ DŮLEŽITÉ
- [ ] **Webhook secret přidán do `.env.local`** ⚠️ DŮLEŽITÉ
- [ ] Dev server restartován
- [ ] Testovací platba provedena
- [ ] Webhook události fungují

---

## 🎉 Po dokončení

Po nastavení webhooku budete mít:

✅ **Plně funkční Stripe integraci**
- Reálné Stripe Checkout UI
- Testovací platby kartou (4242 4242 4242 4242)
- Automatická aktualizace předplatných
- Admin přehled všech plateb
- User správa předplatného

🚀 **Připraveno na produkci**
- Stačí změnit test keys na live keys
- Vytvořit produkty v live mode
- Nakonfigurovat live webhook
- Deploy!

---

## 📞 Další kroky

### 1. Nastavit webhook (TEĎ!)

Bez webhooku platby nebudou fungovat správně!

### 2. Otestovat celý flow

1. Vytvořit testovací platbu
2. Zkontrolovat webhook události
3. Ověřit aktualizaci předplatného
4. Zkontrolovat admin dashboard

### 3. Připravit na produkci

1. Získat live API keys
2. Vytvořit produkty v live mode
3. Nakonfigurovat live webhook
4. Otestovat v production

---

**Status:** ⚠️ **TÉMĚŘ HOTOVO - ZBÝVÁ WEBHOOK**  
**Next Step:** Nastavit webhook endpoint v Stripe Dashboard  
**Dokumentace:** `STRIPE_SETUP_GUIDE.md`

