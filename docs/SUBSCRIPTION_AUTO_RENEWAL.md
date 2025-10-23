# Automatické obnovení předplatného

## Přehled

Tento dokument popisuje, jak funguje automatické obnovení předplatného v aplikaci SvatBot a jak se liší od zkušebního období.

## Dva typy předplatného

### 1. Zkušební období (Free Trial)
- **Plán**: `free_trial`
- **Status**: `trialing`
- **Trvání**: 30 dní od registrace
- **Platba**: Žádná
- **Automatické obnovení**: ❌ NE
- **Email reminder**: ✅ ANO (2 dny před vypršením)

### 2. Placené předplatné (Premium)
- **Plány**: `premium_monthly` (299 Kč/měsíc) nebo `premium_yearly` (2999 Kč/rok)
- **Status**: `active`
- **Trvání**: Měsíční nebo roční
- **Platba**: Automatická přes Stripe
- **Automatické obnovení**: ✅ ANO
- **Email reminder**: ❌ NE (není potřeba)

## Jak funguje automatické obnovení

### Stripe Subscription
Když uživatel zaplatí za Premium plán, vytvoří se v Stripe **subscription** (předplatné):

1. **První platba**: Uživatel zaplatí přes Stripe Checkout
2. **Stripe vytvoří subscription**: Automaticky se nastaví opakovaná platba
3. **Firestore se aktualizuje**: 
   - `status` → `'active'`
   - `plan` → `'premium_monthly'` nebo `'premium_yearly'`
   - `currentPeriodEnd` → Datum příštího obnovení
4. **Automatické obnovení**: Stripe automaticky strhne platbu před vypršením
5. **Webhook aktualizuje Firestore**: Po úspěšné platbě se aktualizuje `currentPeriodEnd`

### Co vidí uživatel v profilu

V sekci **Předplatné** v profilu uživatel vidí:

```
┌─────────────────────────────────────────┐
│ Premium měsíční                         │
│ Aktivní do 22. lis 2025                 │
│                                         │
│ ┌──────────────┐  ┌──────────────────┐ │
│ │ Zbývající dny│  │ Obnoví se        │ │
│ │      30      │  │ 22. lis 2025     │ │
│ └──────────────┘  └──────────────────┘ │
│                                         │
│ ✅ Automatické obnovení aktivní        │
│ Vaše předplatné se automaticky obnoví  │
│ 22. lis 2025. Nemusíte nic řešit,     │
│ platba proběhne automaticky.           │
└─────────────────────────────────────────┘
```

## Email notifikace

### Trial reminder (2 dny před vypršením trialu)
- **Kdy**: 2 dny před vypršením zkušebního období
- **Komu**: Uživatelé s `plan: 'free_trial'` a `status: 'trialing'`
- **Účel**: Upozornit uživatele, že trial končí a nabídnout upgrade
- **Obsah**: 
  - Varování o ztrátě přístupu
  - Výhody Premium
  - Cenové plány
  - Tlačítka pro nákup

### Payment success (po úspěšné platbě)
- **Kdy**: Ihned po úspěšné platbě
- **Komu**: Všichni uživatelé, kteří zaplatili
- **Účel**: Potvrzení platby
- **Obsah**:
  - Poděkování za platbu
  - Detaily platby (částka, plán)
  - Odkaz na fakturu
  - Informace o automatickém obnovení

### ❌ ŽÁDNÝ reminder pro aktivní předplatné
- **Proč**: Stripe se stará o automatické obnovení
- **Výjimka**: Pokud platba selže, Stripe pošle vlastní notifikaci

## Implementace

### Frontend (src/components/account/SubscriptionTab.tsx)

```typescript
{/* Auto-renewal info */}
{!subscription.cancelAtPeriodEnd && (
  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
    <CheckCircle className="w-5 h-5 text-green-600" />
    <div>
      <p className="text-sm font-medium text-green-900">
        Automatické obnovení aktivní
      </p>
      <p className="text-xs text-green-700 mt-1">
        Vaše předplatné se automaticky obnoví {date}. 
        Nemusíte nic řešit, platba proběhne automaticky.
      </p>
    </div>
  </div>
)}
```

### Backend (functions/src/triggers/checkTrialExpiry.ts)

```typescript
// Query subscriptions that are in FREE TRIAL (not paid) and expiring in 2 days
const subscriptionsSnapshot = await db
  .collection('subscriptions')
  .where('status', '==', 'trialing') // Only trial status
  .where('plan', '==', 'free_trial') // Only free trial plan
  .where('isTrialActive', '==', true)
  .where('trialEndDate', '>=', twoDaysFromNow)
  .where('trialEndDate', '<', threeDaysFromNow)
  .get()

// Double-check: Skip if not free trial
if (subscription.plan !== 'free_trial') {
  console.log(`Skipping user ${userId} - not on free trial`)
  continue
}
```

## Stripe Webhook

Stripe automaticky volá webhook při těchto událostech:

### `invoice.payment_succeeded`
- **Kdy**: Po úspěšné platbě (první i opakované)
- **Co se stane**:
  1. Aktualizuje se `currentPeriodEnd` v Firestore
  2. Vytvoří se záznam v `payments` kolekci
  3. Odešle se potvrzovací email

### `customer.subscription.updated`
- **Kdy**: Když se změní subscription (upgrade, downgrade, zrušení)
- **Co se stane**:
  1. Aktualizuje se `plan` v Firestore
  2. Aktualizuje se `cancelAtPeriodEnd` pokud uživatel zrušil

### `customer.subscription.deleted`
- **Kdy**: Když subscription úplně skončí
- **Co se stane**:
  1. Nastaví se `status: 'expired'` v Firestore
  2. Uživatel ztratí přístup

## Testování

### Test 1: Zkušební období
1. Vytvořte nový účet
2. Počkejte 28 dní (nebo upravte `trialEndDate` v Firestore)
3. Zkontrolujte, že přišel reminder email
4. Zkontrolujte, že po vypršení se zobrazí Trial Expired Modal

### Test 2: Placené předplatné
1. Zaplaťte za Premium plán
2. Zkontrolujte, že v profilu je "Automatické obnovení aktivní"
3. Zkontrolujte, že se zobrazuje "Obnoví se" místo "Vyprší"
4. Upravte `currentPeriodEnd` na datum za 2 dny
5. Zkontrolujte, že **NEPŘIŠEL** reminder email (protože je to paid subscription)

### Test 3: Stripe webhook
1. V Stripe Dashboard přejděte na Webhooks
2. Klikněte na "Send test webhook"
3. Vyberte `invoice.payment_succeeded`
4. Zkontrolujte, že se aktualizoval Firestore

## Firestore struktura

### subscriptions/{userId}

```typescript
{
  // Základní info
  userId: string
  weddingId: string
  
  // Plán a status
  plan: 'free_trial' | 'premium_monthly' | 'premium_yearly'
  status: 'trialing' | 'active' | 'expired' | 'canceled'
  
  // Trial info (jen pro free_trial)
  trialStartDate: Timestamp
  trialEndDate: Timestamp
  isTrialActive: boolean
  trialReminderSent?: boolean // Označuje, že reminder byl odeslán
  
  // Subscription info (jen pro premium)
  currentPeriodStart: Timestamp
  currentPeriodEnd: Timestamp // Datum příštího obnovení
  cancelAtPeriodEnd: boolean // true = uživatel zrušil, ale má přístup do konce období
  
  // Stripe info
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  
  // Platba
  amount: number // 0 pro trial, 299 pro monthly, 2999 pro yearly
  currency: 'CZK'
  
  // Metadata
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

## Časté otázky

### Q: Proč neposíláme reminder pro placené předplatné?
**A**: Protože Stripe se stará o automatické obnovení. Uživatel nemusí nic dělat, platba proběhne automaticky. Posílání reminderu by bylo zbytečné a otravné.

### Q: Co když platba selže?
**A**: Stripe automaticky:
1. Zkusí platbu několikrát
2. Pošle uživateli email o selhání
3. Pokud se nepodaří, změní status na `past_due`
4. Po několika dnech zruší subscription

### Q: Jak uživatel zruší předplatné?
**A**: V profilu v sekci Předplatné klikne na "Zrušit předplatné". Nastaví se `cancelAtPeriodEnd: true`, ale přístup zůstane do konce období.

### Q: Co když uživatel chce změnit plán?
**A**: Může upgradovat nebo downgradovat kdykoliv. Stripe automaticky přepočítá poměrnou část platby (proration).

## Shrnutí

| Typ | Trial | Premium Monthly | Premium Yearly |
|-----|-------|-----------------|----------------|
| **Plán** | `free_trial` | `premium_monthly` | `premium_yearly` |
| **Status** | `trialing` | `active` | `active` |
| **Cena** | 0 Kč | 299 Kč/měsíc | 2999 Kč/rok |
| **Auto-renewal** | ❌ | ✅ | ✅ |
| **Email reminder** | ✅ (2 dny před) | ❌ | ❌ |
| **Stripe subscription** | ❌ | ✅ | ✅ |
| **Zobrazení v profilu** | "Zbývá X dní" | "Obnoví se [datum]" | "Obnoví se [datum]" |

## Důležité poznámky

1. **Trial reminder se posílá JEN pro `plan: 'free_trial'`**
2. **Placené předplatné se obnovuje automaticky přes Stripe**
3. **Uživatel vidí jasnou informaci o automatickém obnovení v profilu**
4. **Žádné otravné emaily pro uživatele s aktivním předplatným**
5. **Stripe webhook se stará o aktualizaci dat po každé platbě**

