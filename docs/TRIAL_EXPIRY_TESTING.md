# Trial Expiry Testing Guide

## Přehled

Tento dokument popisuje, jak testovat funkcionalitu vypršení zkušebního období (trial expiry) v aplikaci SvatBot.

## Co se stane po vypršení trialu?

1. **Blokování přístupu**: Uživatel se dostane na dashboard, ale zobrazí se mu modal s platbou
2. **Rozmazané pozadí**: Celá aplikace za modalem je rozmazaná (blur efekt)
3. **Nelze zavřít**: Modal nelze zavřít - uživatel musí zaplatit nebo opustit aplikaci
4. **Zachování dat**: Všechna data uživatele zůstávají uložená v Firestore
5. **Obnovení přístupu**: Po zaplacení se modal automaticky zavře a přístup je obnoven

## Implementované komponenty

### 1. TrialExpiredModal
- **Umístění**: `src/components/subscription/TrialExpiredModal.tsx`
- **Funkce**: 
  - Zobrazuje informace o vypršení trialu
  - Zobrazuje výhody Premium plánu
  - Umožňuje výběr mezi měsíčním a ročním plánem
  - Přesměruje na Stripe checkout

### 2. Dashboard logika
- **Umístění**: `src/components/dashboard/Dashboard.tsx`
- **Funkce**:
  - Kontroluje status trialu při načtení
  - Zobrazuje modal pokud trial vypršel
  - Aplikuje blur efekt na pozadí

### 3. Email notifikace
- **Umístění**: `functions/src/services/emailService.ts`
- **Funkce**:
  - Odesílá upozornění 2 dny před vypršením trialu
  - Obsahuje detailní informace o cenách
  - Motivuje uživatele k pokračování

## Jak testovat

### Metoda 1: Pomocí browser console (Doporučeno)

1. Přihlaste se do aplikace
2. Otevřete browser console (F12)
3. Získejte své user ID:
   ```javascript
   // V console zadejte:
   localStorage.getItem('auth_user')
   // Zkopírujte hodnotu "id"
   ```

4. Nastavte trial jako vypršený:
   ```javascript
   testTrialExpiry.setExpired('your-user-id')
   ```

5. Obnovte stránku (F5)
6. Měl by se zobrazit modal s platbou

7. Pro reset zpět na aktivní trial:
   ```javascript
   testTrialExpiry.resetToActive('your-user-id')
   ```

### Metoda 2: Manuální úprava v Firestore

1. Otevřete Firebase Console
2. Přejděte na Firestore Database
3. Najděte kolekci `subscriptions`
4. Najděte dokument s vaším user ID
5. Upravte pole:
   - `trialEndDate`: Nastavte na včerejší datum
   - `isTrialActive`: Nastavte na `false`
   - `status`: Ponechte jako `'trialing'`
6. Obnovte stránku v aplikaci

### Metoda 3: Testování emailu

1. Přihlaste se do admin panelu: `https://svatbot.cz/admin`
2. Přejděte na "Email Testing"
3. Klikněte na "Test Trial Reminder"
4. Zkontrolujte email

## Test funkce

### Test 1: Zobrazení modalu
- [ ] Modal se zobrazí po vypršení trialu
- [ ] Modal nelze zavřít křížkem (není tam křížek)
- [ ] Modal nelze zavřít kliknutím mimo něj
- [ ] Pozadí je rozmazané
- [ ] Pozadí je neinteraktivní (nelze klikat)

### Test 2: Obsah modalu
- [ ] Zobrazuje se varování o ztrátě přístupu
- [ ] Zobrazují se výhody Premium plánu
- [ ] Zobrazují se oba cenové plány (měsíční a roční)
- [ ] Ceny jsou správně zobrazené a čitelné
- [ ] Roční plán je označen jako "NEJLEPŠÍ VOLBA"
- [ ] Zobrazuje se úspora u ročního plánu

### Test 3: Výběr plánu
- [ ] Lze vybrat měsíční plán
- [ ] Lze vybrat roční plán
- [ ] Vybraný plán je vizuálně zvýrazněný
- [ ] Tlačítko "Přejít na platbu" je funkční

### Test 4: Platební flow
- [ ] Kliknutí na "Přejít na platbu" přesměruje na Stripe
- [ ] Po úspěšné platbě se modal zavře
- [ ] Po úspěšné platbě je přístup obnoven
- [ ] Po zrušení platby se uživatel vrátí na modal

### Test 5: Email notifikace
- [ ] Email se odešle 2 dny před vypršením
- [ ] Email obsahuje správné informace
- [ ] Email obsahuje oba cenové plány
- [ ] Email obsahuje tlačítka pro nákup
- [ ] Email je správně formátovaný

## Struktura dat v Firestore

### subscriptions/{userId}
```typescript
{
  userId: string
  weddingId: string
  plan: 'free_trial' | 'premium_monthly' | 'premium_yearly'
  status: 'trialing' | 'active' | 'expired' | 'canceled'
  trialStartDate: Timestamp
  trialEndDate: Timestamp  // Klíčové pole pro kontrolu vypršení
  isTrialActive: boolean   // Klíčové pole pro kontrolu vypršení
  currentPeriodStart: Timestamp
  currentPeriodEnd: Timestamp
  amount: number
  currency: 'CZK'
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

## Logika kontroly vypršení

```typescript
const isTrialExpired = subscription && 
  subscription.status === 'trialing' && 
  !subscription.isTrialActive && 
  new Date() > subscription.trialEndDate &&
  !hasPremiumAccess()
```

## Troubleshooting

### Modal se nezobrazuje
1. Zkontrolujte, že `trialEndDate` je v minulosti
2. Zkontrolujte, že `isTrialActive` je `false`
3. Zkontrolujte, že `status` je `'trialing'`
4. Obnovte stránku (F5)
5. Zkontrolujte browser console pro chyby

### Modal se zobrazuje, ale nemá blur
1. Zkontrolujte, že CSS třída `blur-sm` je aplikovaná
2. Zkontrolujte, že `pointer-events-none` je aplikovaná
3. Zkontrolujte browser DevTools pro CSS konflikty

### Platba nefunguje
1. Zkontrolujte Stripe konfiguraci v `.env.local`
2. Zkontrolujte, že Stripe webhook je správně nastavený
3. Zkontrolujte Firebase Functions logy

## Užitečné příkazy

```javascript
// V browser console:

// Zobrazit aktuální subscription
const user = JSON.parse(localStorage.getItem('auth_user'))
console.log('User ID:', user.id)

// Nastavit trial jako vypršený
testTrialExpiry.setExpired(user.id)

// Reset na aktivní trial
testTrialExpiry.resetToActive(user.id)

// Nastavit trial na vypršení za 2 dny
testTrialExpiry.setExpiryInDays(user.id, 2)
```

## Poznámky

- Demo účet (`demo@svatbot.cz`) je vždy vyjmutý z trial kontroly
- Trial reminder email se odesílá automaticky 2 dny před vypršením
- Po zaplacení se subscription automaticky aktualizuje přes Stripe webhook
- Všechna data uživatele zůstávají zachovaná i po vypršení trialu

