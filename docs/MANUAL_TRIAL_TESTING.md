# Manuální testování Trial Expiry v Firestore

## Kde najít data v Firebase Console

### Krok 1: Otevřete Firebase Console
1. Přejděte na: https://console.firebase.google.com/
2. Vyberte projekt: **svatbot-app**
3. V levém menu klikněte na **Firestore Database**

### Krok 2: Najděte svou subscription
1. V Firestore najděte kolekci: **`subscriptions`**
2. Najděte dokument s vaším **User ID**
   - User ID je stejné jako vaše email (nebo ID z Firebase Auth)
   - Pokud nevíte své User ID, podívejte se do browser console:
     ```javascript
     JSON.parse(localStorage.getItem('auth_user')).id
     ```

### Krok 3: Klíčová pole pro testování

V dokumentu `subscriptions/{userId}` najdete tato pole:

#### 📅 **trialEndDate** (Timestamp)
- **Co to je**: Datum a čas, kdy trial končí
- **Formát**: Firestore Timestamp
- **Jak upravit pro test**:
  - Klikněte na pole `trialEndDate`
  - Změňte datum na **včerejší den** (nebo dřív)
  - Příklad: Pokud je dnes 23.10.2025, nastavte na 22.10.2025

#### ✅ **isTrialActive** (boolean)
- **Co to je**: Zda je trial aktivní
- **Hodnoty**: `true` nebo `false`
- **Jak upravit pro test**:
  - Klikněte na pole `isTrialActive`
  - Změňte na **`false`**

#### 📊 **status** (string)
- **Co to je**: Status předplatného
- **Hodnoty**: `'trialing'`, `'active'`, `'expired'`, `'canceled'`
- **Pro test**: Ponechte jako **`'trialing'`**

## Rychlý test - Krok za krokem

### Test 1: Zobrazit Trial Expired Modal

1. **Otevřete Firebase Console** → Firestore Database
2. **Najděte**: `subscriptions/{your-user-id}`
3. **Upravte tato pole**:
   ```
   trialEndDate: [Včerejší datum]
   isTrialActive: false
   status: "trialing"
   ```
4. **Uložte změny** (tlačítko "Update" v Firebase)
5. **Obnovte aplikaci** (F5 v prohlížeči)
6. **Výsledek**: Měl by se zobrazit Trial Expired Modal s rozmazaným pozadím

### Test 2: Vrátit zpět na aktivní trial

1. **Otevřete Firebase Console** → Firestore Database
2. **Najděte**: `subscriptions/{your-user-id}`
3. **Upravte tato pole**:
   ```
   trialEndDate: [Datum za 30 dní]
   isTrialActive: true
   status: "trialing"
   ```
4. **Uložte změny**
5. **Obnovte aplikaci** (F5)
6. **Výsledek**: Normální dashboard bez modalu

### Test 3: Testovat trial končící za 2 dny (pro email reminder)

1. **Otevřete Firebase Console** → Firestore Database
2. **Najděte**: `subscriptions/{your-user-id}`
3. **Upravte tato pole**:
   ```
   trialEndDate: [Datum za 2 dny]
   isTrialActive: true
   status: "trialing"
   ```
4. **Uložte změny**
5. **V admin panelu** (https://svatbot.cz/admin):
   - Přejděte na "Email Testing"
   - Klikněte "Test Trial Reminder"
   - Zkontrolujte email

## Vizuální návod - Screenshot pozice

```
Firebase Console
├── Firestore Database
│   ├── subscriptions (kolekce)
│   │   ├── {user-id-1} (dokument)
│   │   ├── {user-id-2} (dokument)
│   │   └── {VÁŠ-USER-ID} ← TENTO DOKUMENT
│   │       ├── userId: "..."
│   │       ├── weddingId: "..."
│   │       ├── plan: "free_trial"
│   │       ├── status: "trialing" ← PONECHAT
│   │       ├── trialStartDate: Timestamp(...)
│   │       ├── trialEndDate: Timestamp(...) ← UPRAVIT NA VČERA
│   │       ├── isTrialActive: true ← ZMĚNIT NA false
│   │       ├── currentPeriodStart: Timestamp(...)
│   │       ├── currentPeriodEnd: Timestamp(...)
│   │       ├── amount: 0
│   │       ├── currency: "CZK"
│   │       ├── createdAt: Timestamp(...)
│   │       └── updatedAt: Timestamp(...)
```

## Jak upravit Timestamp v Firebase

### Metoda 1: Pomocí Firebase UI
1. Klikněte na pole `trialEndDate`
2. Zobrazí se editor s datem a časem
3. Změňte datum (např. z 23.11.2025 na 22.10.2025)
4. Klikněte "Update"

### Metoda 2: Pomocí sekundového času
1. Klikněte na pole `trialEndDate`
2. Přepněte na "seconds" view
3. Zadejte timestamp v sekundách:
   - **Včera**: Aktuální čas - 86400 sekund (1 den)
   - **Za 2 dny**: Aktuální čas + 172800 sekund (2 dny)
   - **Za 30 dní**: Aktuální čas + 2592000 sekund (30 dní)

### Kalkulačka timestampu
```javascript
// V browser console:
const now = Date.now() / 1000  // Aktuální čas v sekundách

// Včera (pro expired test)
const yesterday = now - 86400
console.log('Včera:', yesterday)

// Za 2 dny (pro reminder test)
const in2days = now + (2 * 86400)
console.log('Za 2 dny:', in2days)

// Za 30 dní (pro aktivní trial)
const in30days = now + (30 * 86400)
console.log('Za 30 dní:', in30days)
```

## Checklist pro testování

### ✅ Test Expired Trial
- [ ] Otevřel jsem Firebase Console
- [ ] Našel jsem svůj subscription dokument
- [ ] Nastavil jsem `trialEndDate` na včerejší datum
- [ ] Nastavil jsem `isTrialActive` na `false`
- [ ] Ponechal jsem `status` jako `"trialing"`
- [ ] Uložil jsem změny
- [ ] Obnovil jsem aplikaci (F5)
- [ ] Zobrazil se Trial Expired Modal
- [ ] Pozadí je rozmazané
- [ ] Modal nelze zavřít
- [ ] Zobrazují se správné ceny (299 Kč měsíčně, 2999 Kč ročně)

### ✅ Test Active Trial
- [ ] Nastavil jsem `trialEndDate` na datum za 30 dní
- [ ] Nastavil jsem `isTrialActive` na `true`
- [ ] Obnovil jsem aplikaci
- [ ] Dashboard se zobrazuje normálně
- [ ] Žádný modal se nezobrazuje

### ✅ Test Email Reminder
- [ ] Nastavil jsem `trialEndDate` na datum za 2 dny
- [ ] Nastavil jsem `isTrialActive` na `true`
- [ ] Přihlásil jsem se do admin panelu
- [ ] Otestoval jsem Trial Reminder email
- [ ] Email obsahuje správné ceny
- [ ] Email obsahuje obě tlačítka pro nákup

## Časté problémy

### ❌ Modal se nezobrazuje i když jsem nastavil expired
**Řešení**:
1. Zkontrolujte, že `isTrialActive` je **`false`** (ne string "false", ale boolean)
2. Zkontrolujte, že `trialEndDate` je opravdu v minulosti
3. Zkontrolujte, že `status` je `"trialing"` (ne "expired")
4. Vymažte cache prohlížeče (Ctrl+Shift+Delete)
5. Obnovte stránku (F5)

### ❌ Timestamp se neukládá správně
**Řešení**:
1. Použijte Firebase UI editor (ne ruční zadání)
2. Zkontrolujte formát (měl by být Firestore Timestamp, ne string)
3. Zkuste použít sekundový formát místo data

### ❌ Změny se neprojevují
**Řešení**:
1. Počkejte 2-3 sekundy po uložení v Firebase
2. Obnovte stránku (F5)
3. Zkontrolujte browser console pro chyby
4. Zkontrolujte, že jste přihlášeni pod správným účtem

## Užitečné odkazy

- **Firebase Console**: https://console.firebase.google.com/project/svatbot-app/firestore
- **Admin Panel**: https://svatbot.cz/admin
- **Aplikace**: https://svatbot.cz

## Poznámky

- Změny v Firestore se projeví okamžitě po obnovení stránky
- Demo účet (`demo@svatbot.cz`) je vždy vyjmutý z trial kontroly
- Po zaplacení se subscription automaticky aktualizuje
- Všechna data zůstávají zachovaná i po vypršení trialu

