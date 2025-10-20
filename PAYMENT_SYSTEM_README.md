# 💳 Platební systém - Quick Start

## ✅ Co je hotovo

### 1. Admin Dashboard - Záložka "Platby"

**Přístup:** https://svatbot.cz/admin/dashboard → Záložka "Platby"

**Zobrazuje:**
- 📊 **12 statistických karet:**
  - Celkový příjem, Měsíční příjem, MRR, ARR
  - Aktivní předplatná, Zkušební období, Nová předplatná, Churn Rate
  - Úspěšné/Neúspěšné/Čekající platby, Průměrná platba

- 📋 **Tabulka všech plateb:**
  - Uživatel (jméno, email)
  - Částka a plán
  - Stav platby (zaplaceno, selhalo, čeká, vráceno)
  - Datum
  - Číslo faktury + download link

- 🔍 **Filtry:**
  - Vyhledávání podle emailu, jména, čísla faktury
  - Filtr podle stavu platby
  - Tlačítko Obnovit

### 2. User-facing komponenty

**Přístup:** Dashboard → Ikona profilu → Předplatné

**Funkce:**
- ✅ Zobrazení aktuálního předplatného
- ✅ Výběr plánu (měsíční 299 Kč / roční 2999 Kč)
- ✅ Upgrade na Premium (mock checkout)
- ✅ Zrušení předplatného
- ✅ Obnovení předplatného
- ✅ Historie plateb

### 3. Backend infrastruktura

**Soubory:**
- `src/hooks/useAdminPayments.ts` - Admin hook pro správu plateb
- `src/hooks/useSubscription.ts` - User hook pro předplatné
- `src/lib/stripe.ts` - Stripe integrace (mock + připraveno na produkci)
- `src/components/admin/PaymentsTab.tsx` - Admin komponenta
- `src/components/account/SubscriptionTab.tsx` - User komponenta
- `src/components/account/PaymentsTab.tsx` - User historie plateb

**Firebase Collections:**
- `subscriptions` - Předplatná uživatelů
- `payments` - Historie plateb
- `usageStats` - Statistiky využití

---

## 🎮 Jak testovat (Mock režim)

### Test 1: Upgrade na Premium

1. **Přihlaste se** jako běžný uživatel (ne admin)
2. **Otevřete profil** (ikona v pravém horním rohu)
3. **Klikněte na záložku "Předplatné"**
4. **Vyberte plán** (měsíční nebo roční)
5. **Klikněte "Upgradovat na Premium"**
6. **Zkontrolujte:**
   - ✅ Přesměrování na dashboard s `?payment=success`
   - ✅ Status předplatného změněn na "Premium"
   - ✅ V záložce "Platby" se objeví nová platba

### Test 2: Admin přehled plateb

1. **Přihlaste se jako admin** (admin@svatbot.cz)
2. **Otevřete Admin Dashboard** → Záložka "Platby"
3. **Zkontrolujte:**
   - ✅ Statistiky se zobrazují správně
   - ✅ Tabulka obsahuje všechny platby
   - ✅ Vyhledávání funguje
   - ✅ Filtry fungují

### Test 3: Zrušení a obnovení

1. **V profilu** → Předplatné
2. **Klikněte "Zrušit předplatné"**
3. **Zkontrolujte:**
   - ✅ Zobrazí se upozornění o zrušení
   - ✅ Tlačítko se změní na "Obnovit předplatné"
4. **Klikněte "Obnovit předplatné"**
5. **Zkontrolujte:**
   - ✅ Upozornění zmizí
   - ✅ Předplatné je opět aktivní

---

## 💰 Cenové plány

| Plán | Cena | Fakturace | Úspora |
|------|------|-----------|--------|
| **Zkušební období** | 0 Kč | 30 dní | - |
| **Premium měsíční** | 299 Kč | Měsíčně | - |
| **Premium roční** ⭐ | 2 999 Kč | Ročně | 589 Kč |

---

## 🔧 Mock vs. Reálné Stripe

### Aktuální stav: MOCK REŽIM ✅

**Co funguje:**
- ✅ Výběr plánu
- ✅ "Checkout" (simulovaný)
- ✅ Vytvoření platby v Firebase
- ✅ Aktualizace předplatného
- ✅ Admin přehled všech plateb
- ✅ Statistiky (MRR, ARR, Churn Rate)
- ✅ Zrušení/obnovení předplatného

**Co se NESIMULUJE:**
- ❌ Reálné platby kartou
- ❌ Stripe Checkout UI
- ❌ Automatické faktury
- ❌ Webhook notifikace
- ❌ Customer Portal

### Přepnutí na reálné Stripe

**Jednoduchý 3-krokový proces:**

1. **Nastavit Stripe účet** + získat API klíče
2. **Nainstalovat Firebase Extension:**
   ```bash
   firebase ext:install stripe/firestore-stripe-payments
   ```
3. **Změnit konfiguraci:**
   ```typescript
   // src/lib/stripe.ts
   export const STRIPE_CONFIG = {
     enabled: true, // ← Změnit na true
     products: {
       premium_monthly: {
         priceId: 'price_ABC...' // ← Skutečné Price ID
       }
     }
   }
   ```

**Detailní návod:** `docs/PAYMENT_SYSTEM.md`

---

## 📊 Admin metriky

### MRR (Monthly Recurring Revenue)
Měsíční opakující se příjem
```
MRR = (Měsíční předplatná × 299) + (Roční předplatná × 2999 / 12)
```

### ARR (Annual Recurring Revenue)
Roční opakující se příjem
```
ARR = MRR × 12
```

### Churn Rate
Míra odchodu zákazníků
```
Churn Rate = (Zrušená / Celkem) × 100
```

### AOV (Average Order Value)
Průměrná hodnota objednávky
```
AOV = Celkový příjem / Počet plateb
```

---

## 🔐 Bezpečnost

### Firestore Rules

```javascript
// Uživatelé vidí pouze své platby
match /payments/{paymentId} {
  allow read: if request.auth.uid == resource.data.userId;
}

// Admini vidí všechny platby
match /payments/{paymentId} {
  allow read: if isAdmin();
}
```

### Stripe Security

- ✅ API klíče v environment variables
- ✅ Webhook signature verification
- ✅ PCI compliance přes Stripe
- ✅ Platební údaje NEJSOU ukládány na našich serverech

---

## 📁 Struktura souborů

```
src/
├── hooks/
│   ├── useSubscription.ts          # User hook pro předplatné
│   └── useAdminPayments.ts         # Admin hook pro platby
├── lib/
│   └── stripe.ts                   # Stripe integrace
├── components/
│   ├── account/
│   │   ├── SubscriptionTab.tsx     # User výběr plánu
│   │   └── PaymentsTab.tsx         # User historie plateb
│   └── admin/
│       └── PaymentsTab.tsx         # Admin přehled plateb
└── app/
    └── admin/
        └── dashboard/
            └── page.tsx            # Admin dashboard s platební záložkou

docs/
├── PAYMENT_SYSTEM.md               # Detailní dokumentace
└── STRIPE_INTEGRATION_GUIDE.md     # Stripe návod

PAYMENT_SYSTEM_README.md            # Tento soubor
```

---

## 🚀 Next Steps

### Pro testování (teď):
1. ✅ Otestovat mock checkout
2. ✅ Zkontrolovat admin dashboard
3. ✅ Vyzkoušet všechny funkce

### Pro produkci (později):
1. ⏳ Aktivovat Stripe účet
2. ⏳ Nainstalovat Firebase Extension
3. ⏳ Vytvořit produkty v Stripe
4. ⏳ Nastavit webhooks
5. ⏳ Změnit `STRIPE_CONFIG.enabled = true`
6. ⏳ Deploy

---

## 📞 Kontakt

**Dokumentace:**
- `docs/PAYMENT_SYSTEM.md` - Kompletní dokumentace
- `docs/STRIPE_INTEGRATION_GUIDE.md` - Stripe návod

**Admin přístup:**
- URL: https://svatbot.cz/admin/login
- Email: admin@svatbot.cz

---

## ✅ Checklist

- [x] Admin záložka "Platby" vytvořena
- [x] Statistiky (MRR, ARR, Churn Rate)
- [x] Tabulka plateb s filtry
- [x] User výběr plánu
- [x] Mock checkout flow
- [x] Zrušení/obnovení předplatného
- [x] Historie plateb pro uživatele
- [x] Firebase collections připraveny
- [x] Stripe modul (mock + připraveno na produkci)
- [x] Dokumentace
- [ ] Reálné Stripe napojení (až ve finále)

---

**Status:** ✅ **PŘIPRAVENO K TESTOVÁNÍ**  
**Mock režim:** ✅ **AKTIVNÍ**  
**Reálné Stripe:** ⏳ **Připraveno, čeká na aktivaci**

