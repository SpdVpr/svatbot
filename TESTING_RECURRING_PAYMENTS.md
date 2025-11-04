# 🔄 Testování Opakovaných Plateb (Recurring Payments)

Tento dokument popisuje, jak otestovat automatické opakované platby před spuštěním do produkce.

---

## 📋 Co jsou opakované platby?

**Premium Měsíční (299 Kč/měsíc):**
- ✅ Automatické opakování každý měsíc
- ✅ GoPay automaticky strhává platbu z karty zákazníka
- ✅ Předplatné se automaticky prodlužuje o další měsíc
- ✅ **Žádný zásah uživatele není potřeba**

**Premium Roční (2999 Kč/rok):**
- ❌ Žádné automatické opakování
- ✅ Jednorázová platba na 1 rok
- ✅ Po roce musí uživatel znovu zaplatit

---

## 🧪 Metody testování

### Metoda 1: Simulace pomocí API endpointu (Doporučeno)

Vytvořili jsme speciální endpoint, který simuluje, co se stane, když GoPay automaticky provede opakovanou platbu.

#### Jak použít:

1. **Vytvořte měsíční předplatné** (Premium Měsíční)
2. **Zaplaťte a aktivujte ho**
3. **Zavolejte simulační endpoint:**

```bash
curl -X POST https://svatbot.cz/api/gopay/simulate-recurring \
  -H "Content-Type: application/json" \
  -d '{"userId": "YOUR_USER_ID"}'
```

**Nebo v prohlížeči (Console):**

```javascript
fetch('/api/gopay/simulate-recurring', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userId: 'YOUR_USER_ID' })
})
.then(r => r.json())
.then(console.log)
```

#### Co se stane:

- ✅ Předplatné se prodlouží o další měsíc
- ✅ Vytvoří se nový záznam platby v databázi
- ✅ Uvidíte nové datum konce předplatného
- ✅ Můžete to opakovat vícekrát

#### Výhody:

- ⚡ Okamžité testování
- 🔄 Můžete opakovat vícekrát
- 🧪 Bezpečné (jen simulace)
- 📊 Vidíte přesně, co se stane

---

### Metoda 2: GoPay Test Environment s denním cyklem

GoPay testovací prostředí umožňuje nastavit opakování na **každý den** místo každý měsíc.

#### Jak nastavit:

1. **Změňte kód v `gopay-server.ts`:**

```typescript
// Místo měsíčního cyklu:
recurrence: {
  recurrence_cycle: 'MONTH',
  recurrence_period: 1,
  recurrence_date_to: '2099-12-31'
}

// Použijte denní cyklus:
recurrence: {
  recurrence_cycle: 'DAY',
  recurrence_period: 1,
  recurrence_date_to: '2099-12-31'
}
```

2. **Vytvořte nové předplatné**
3. **Počkejte 24 hodin**
4. **GoPay automaticky provede další platbu**

#### Výhody:

- ✅ Testuje skutečný GoPay flow
- ✅ Ověříte webhook notifikace
- ✅ Vidíte, jak to funguje v praxi

#### Nevýhody:

- ⏰ Musíte čekat 24 hodin
- 🔄 Pro více testů musíte čekat další dny

---

### Metoda 3: GoPay Admin Panel (Produkce)

V produkčním GoPay účtu můžete manuálně spustit následnou platbu.

#### Jak použít:

1. **Přihlaste se do GoPay admin panelu**
2. **Najděte platbu** (Platby → Vyhledat)
3. **Klikněte na platbu**
4. **Najděte sekci "Opakované platby"**
5. **Klikněte "Spustit následnou platbu"**

#### Co se stane:

- ✅ GoPay provede skutečnou platbu
- ✅ Pošle webhook notifikaci
- ✅ Předplatné se automaticky prodlouží
- ⚠️ **Skutečně se strhne platba z karty!**

---

## 📊 Co sledovat při testování

### 1. Firestore Database

**Kolekce `subscriptions/{userId}`:**

```typescript
{
  plan: 'premium_monthly',
  status: 'active',
  currentPeriodStart: Timestamp,  // ← Mělo by se posunout
  currentPeriodEnd: Timestamp,    // ← Mělo by se posunout o měsíc
  amount: 299,
  currency: 'CZK',
  goPayPaymentId: '3286504182',   // Původní platba
  updatedAt: Timestamp
}
```

**Kolekce `payments`:**

Měli byste vidět **2 záznamy**:

1. **Původní platba:**
```typescript
{
  userId: 'xxx',
  plan: 'premium_monthly',
  amount: 299,
  status: 'succeeded',
  goPayId: 3286504182,
  isRecurring: false,  // První platba
  createdAt: Timestamp
}
```

2. **Opakovaná platba:**
```typescript
{
  userId: 'xxx',
  plan: 'premium_monthly',
  amount: 299,
  status: 'succeeded',
  goPayId: 3286504999,
  goPayParentPaymentId: '3286504182',  // ← Odkaz na původní
  isRecurring: true,                    // ← Označeno jako recurring
  createdAt: Timestamp
}
```

### 2. Vercel Logs

Sledujte logy na: https://vercel.com/spdvpr/svatbot/logs

**Pro původní platbu:**
```
📥 GoPay webhook - INITIAL payment: 3286504182
✅ Subscription ACTIVATED (initial payment) for user: xxx
```

**Pro opakovanou platbu:**
```
📥 GoPay webhook - RECURRING payment: 3286504999 parent: 3286504182
📋 Found parent payment - userId: xxx plan: premium_monthly
✅ Created new payment record for recurring payment
✅ Subscription RENEWED (recurring payment) for user: xxx
```

### 3. Dashboard UI

**Před opakovanou platbou:**
```
Premium Měsíční
Aktivní do 04.12.2025
```

**Po opakované platbě:**
```
Premium Měsíční
Aktivní do 04.01.2026  ← Posunuto o měsíc
```

---

## ✅ Testovací Checklist

### Příprava:
- [ ] Máte testovací GoPay účet
- [ ] Environment je nastaveno na `test`
- [ ] Máte přístup k Firebase Console
- [ ] Máte přístup k Vercel Logs

### Test 1: Vytvoření předplatného
- [ ] Vytvořte Premium Měsíční předplatné
- [ ] Zaplaťte testovací kartou: `4111111111111111`
- [ ] Ověřte, že status je `active`
- [ ] Ověřte, že `currentPeriodEnd` je za 30 dní

### Test 2: Simulace opakované platby
- [ ] Zavolejte `/api/gopay/simulate-recurring`
- [ ] Ověřte, že `currentPeriodEnd` se posunulo o měsíc
- [ ] Ověřte, že se vytvořil nový záznam v `payments`
- [ ] Ověřte, že nová platba má `isRecurring: true`
- [ ] Ověřte, že nová platba má `goPayParentPaymentId`

### Test 3: UI zobrazení
- [ ] Obnovte dashboard
- [ ] Ověřte, že vidíte "Premium Měsíční"
- [ ] Ověřte, že datum konce je správné
- [ ] Ověřte, že v historii plateb jsou 2 záznamy

### Test 4: Opakování simulace
- [ ] Zavolejte simulaci znovu
- [ ] Ověřte, že se předplatné prodloužilo o další měsíc
- [ ] Ověřte, že máte 3 záznamy plateb

---

## 🚀 Před spuštěním do produkce

### 1. Kontaktujte GoPay
- Email: obchod@gopay.cz
- Telefon: +420 228 224 267
- Požádejte o aktivaci **opakovaných plateb (recurrence)**

### 2. Získejte produkční credentials
- Produkční GoID
- Produkční ClientID
- Produkční ClientSecret

### 3. Nastavte webhook URL
V GoPay admin panelu nastavte:
```
https://svatbot.cz/api/gopay/webhook
```

### 4. Změňte environment na Vercelu
```
NEXT_PUBLIC_GOPAY_ENVIRONMENT=production
NEXT_PUBLIC_GOPAY_GOID=<produkční>
NEXT_PUBLIC_GOPAY_CLIENT_ID=<produkční>
GOPAY_CLIENT_SECRET=<produkční>
```

### 5. Proveďte produkční test
- Vytvořte skutečné předplatné
- Zaplaťte skutečnou kartou
- Počkejte 30 dní nebo použijte GoPay admin pro simulaci
- Ověřte, že vše funguje

---

## 📞 Podpora

**Technické problémy:**
- Zkontrolujte Vercel logs
- Zkontrolujte Firebase Console
- Zkontrolujte GoPay admin panel

**GoPay podpora:**
- Email: integrace@gopay.cz
- Telefon: +420 228 224 267

---

## 🎯 Shrnutí

**Pro rychlé testování:**
→ Použijte `/api/gopay/simulate-recurring` endpoint

**Pro realistické testování:**
→ Použijte denní cyklus v test prostředí

**Pro finální ověření:**
→ Použijte GoPay admin panel v produkci

**Všechny metody jsou validní a bezpečné!** ✅

