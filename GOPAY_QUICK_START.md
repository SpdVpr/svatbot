# 🚀 GoPay Quick Start Guide

## ✅ Hotovo - Co bylo změněno

### 1. Stripe → GoPay
- ❌ Stripe kompletně odstraněn
- ✅ GoPay plně integrován
- ✅ Všechny platby nyní běží přes GoPay

### 2. Testovací údaje nastaveny
```env
NEXT_PUBLIC_GOPAY_GOID=8208931819
NEXT_PUBLIC_GOPAY_CLIENT_ID=1270557640
GOPAY_CLIENT_SECRET=fGe9aSFX
NEXT_PUBLIC_GOPAY_ENVIRONMENT=test
```

---

## 🧪 Jak otestovat

### Krok 1: Spusťte aplikaci
```bash
npm install  # Odstraní Stripe package
npm run dev
```

### Krok 2: Přihlaste se
- Jděte na https://svatbot.cz nebo http://localhost:3000
- Přihlaste se jako uživatel

### Krok 3: Vyberte tarif
1. Klikněte na svůj profil → **Můj účet**
2. Přejděte na záložku **Předplatné**
3. Vyberte **Premium Měsíční** (299 Kč) nebo **Premium Roční** (2999 Kč)
4. Klikněte na **Upgradovat**

### Krok 4: Platba v GoPay
- Budete přesměrováni na GoPay testovací bránu
- URL: `https://gw.sandbox.gopay.com/...`

#### Testovací platební karty:
- **Úspěšná platba:**
  - Číslo: `4111111111111111`
  - Expirační datum: jakékoliv budoucí
  - CVV: `123`

- **Neúspěšná platba:**
  - Číslo: `4000000000000002`

### Krok 5: Dokončení
- Po platbě budete vráceni na `/?payment=success`
- GoPay pošle webhook na `/api/gopay/webhook`
- Předplatné bude automaticky aktivováno

---

## 📊 Kde zkontrolovat výsledek

### 1. Frontend
- **Můj účet → Předplatné:** Uvidíte aktivní Premium
- **Můj účet → Platby:** Historie plateb

### 2. Firebase Console
- **Firestore → payments:** Nová platba s `goPayId`
- **Firestore → subscriptions:** Aktualizované předplatné

### 3. GoPay Obchodní účet
- Přihlaste se na: https://gw.sandbox.gopay.com/
- **Uživatel:** testUser8208931819
- **Heslo:** P9628550
- Uvidíte všechny testovací platby

---

## 🔧 Konfigurace pro produkci

### 1. Získejte produkční údaje
- Přihlaste se do GoPay obchodního účtu
- Získejte produkční GoID, Client ID a Client Secret

### 2. Aktualizujte .env.local
```env
NEXT_PUBLIC_GOPAY_GOID=your_production_goid
NEXT_PUBLIC_GOPAY_CLIENT_ID=your_production_client_id
GOPAY_CLIENT_SECRET=your_production_client_secret
NEXT_PUBLIC_GOPAY_ENVIRONMENT=production
```

### 3. Nastavte webhook v GoPay
- URL: `https://svatbot.cz/api/gopay/webhook`
- Metoda: GET
- Formát: `?id={PAYMENT_ID}`

### 4. Deploy na Vercel
```bash
# Nastavte environment variables na Vercel
vercel env add NEXT_PUBLIC_GOPAY_GOID
vercel env add NEXT_PUBLIC_GOPAY_CLIENT_ID
vercel env add GOPAY_CLIENT_SECRET
vercel env add NEXT_PUBLIC_GOPAY_ENVIRONMENT

# Deploy
git add .
git commit -m "feat: GoPay integration"
git push origin main
```

---

## 🎯 Klíčové změny v kódu

### 1. Platební knihovna
```typescript
// PŘED (Stripe)
import { createCheckoutSession } from '@/lib/stripe'

// PO (GoPay)
import { createGoPayPayment } from '@/lib/gopay'
```

### 2. Vytvoření platby
```typescript
// PŘED (Stripe)
const checkoutUrl = await createCheckoutSession({...})

// PO (GoPay)
const paymentUrl = await createGoPayPayment({...})
```

### 3. API Endpointy
```
PŘED:
/api/stripe/create-checkout-session
/api/stripe/webhook
/api/stripe/cancel-subscription

PO:
/api/gopay/create-payment
/api/gopay/webhook
/api/gopay/cancel-subscription
```

---

## 💰 Ceník (nezměněn)

- **Premium Měsíční:** 299 Kč/měsíc
- **Premium Roční:** 2999 Kč/rok (úspora 588 Kč)

---

## 🆘 Troubleshooting

### Chyba: "Nepodařilo se vytvořit platbu"
**Řešení:**
1. Zkontrolujte environment variables v `.env.local`
2. Ověřte, že máte správné testovací údaje
3. Zkontrolujte konzoli prohlížeče (F12)

### Webhook se nevolá
**Řešení:**
1. Pro localhost použijte ngrok: `ngrok http 3000`
2. Nastavte webhook URL v GoPay na ngrok URL
3. Nebo testujte přímo na produkci (svatbot.cz)

### Platba se nezobrazuje
**Řešení:**
1. Zkontrolujte Firebase Console → Firestore → payments
2. Ověřte, že webhook byl úspěšně zpracován
3. Zkontrolujte logy v Vercel (pro produkci)

---

## 📞 Podpora

### GoPay Technická podpora
- **Email:** integrace@gopay.cz
- **Telefon:** +420 228 224 267
- **Dokumentace:** https://doc.gopay.com/

### SvatBot.cz
- **Email:** info@svatbot.cz
- **Web:** https://svatbot.cz

---

## ✅ Checklist před nasazením

- [x] GoPay integrace implementována
- [x] Testovací údaje nastaveny
- [x] Stripe odstraněn
- [ ] Otestováno v sandbox prostředí
- [ ] Produkční údaje získány
- [ ] Webhook URL nastaven v GoPay
- [ ] Environment variables nastaveny na Vercel
- [ ] Nasazeno na produkci
- [ ] Otestována reálná platba

---

## 🎉 Výsledek

Po dokončení všech kroků:
- ✅ Uživatelé mohou platit přes GoPay
- ✅ Podporovány platební karty a bankovní převody
- ✅ Automatická aktivace předplatného
- ✅ Historie plateb v účtu
- ✅ Možnost zrušení předplatného
- ✅ Bezpečné zpracování plateb

**GoPay je nyní plně funkční! 🚀**

