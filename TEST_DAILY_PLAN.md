# 🧪 Test Denní Předplatné

Tento dokument popisuje testovací denní předplatné, které slouží **pouze pro testování** opakovaných plateb.

---

## 📋 Co je Test Denní předplatné?

**Test Denní** je speciální předplatné vytvořené pro testování automatických opakovaných plateb:

- **Cena:** 10 Kč
- **Opakování:** Každý den (24 hodin)
- **Účel:** Testování recurring plateb bez čekání 30 dní
- **Viditelnost:** Pouze v nastavení předplatného (Můj účet → Předplatné)
- **Funkce:** Všechny Premium funkce

---

## ⚠️ DŮLEŽITÉ

### Toto předplatné je POUZE pro testování!

- ❌ **NENÍ** zobrazeno na hlavní stránce
- ❌ **NENÍ** v cenících pro zákazníky
- ❌ **NENÍ** v marketingových materiálech
- ✅ **JE** viditelné pouze v nastavení předplatného
- ✅ **JE** určeno pro vývojáře a testery

### Kde je viditelné:

1. **Můj účet → Předplatné** - Výběr tarifu
2. **Dashboard** - Zobrazení aktuálního předplatného (pokud je aktivní)
3. **Test Recurring stránka** - Pro simulaci

### Kde NENÍ viditelné:

- ❌ Landing page
- ❌ Pricing page
- ❌ Marketing materiály
- ❌ Veřejné API
- ❌ Dokumentace pro zákazníky

---

## 🎯 Jak použít

### Krok 1: Přihlaste se

Jděte na: https://svatbot.cz

### Krok 2: Otevřete nastavení předplatného

1. Klikněte na **"Můj účet"** (ikona uživatele)
2. Vyberte záložku **"Předplatné"**
3. Scrollujte dolů

### Krok 3: Vyberte Test Denní

Uvidíte 3 možnosti:
1. **Premium Měsíční** (299 Kč/měsíc)
2. **Premium Roční** (2999 Kč/rok)
3. **🧪 Test denní** (10 Kč/den) ← Toto vyberte

### Krok 4: Zaplaťte

1. Klikněte na **"Upgradovat na testovací denní tarif"**
2. Budete přesměrováni na GoPay bránu
3. Zaplaťte testovací kartou: `4111111111111111`
4. Dokončete platbu

### Krok 5: Ověřte

Po úspěšné platbě:
- ✅ Dashboard zobrazí: **"🧪 Test Denní"**
- ✅ Předplatné je aktivní do: **zítra** (za 24 hodin)
- ✅ GoPay automaticky provede další platbu za 24 hodin

---

## 🔄 Co se stane za 24 hodin?

### Automatický proces:

1. **GoPay automaticky vytvoří novou platbu**
   - Strhne 10 Kč z karty
   - Vytvoří novou platbu s novým ID

2. **GoPay pošle webhook notifikaci**
   ```
   https://svatbot.cz/api/gopay/webhook?id=NEW_ID&parent_id=ORIGINAL_ID
   ```

3. **Náš webhook handler:**
   - Detekuje `parent_id` → rozpozná jako opakovanou platbu
   - Najde uživatele podle `parent_id`
   - Vytvoří nový záznam v `payments` kolekci
   - Prodlouží předplatné o další den
   - Uživatel uvidí nové datum konce

---

## 🧪 Testování

### Metoda 1: Počkat 24 hodin (Reálný test)

**Výhody:**
- ✅ Testuje skutečný GoPay flow
- ✅ Ověříte webhook notifikace
- ✅ Vidíte, jak to funguje v praxi

**Nevýhody:**
- ⏰ Musíte čekat 24 hodin

**Jak testovat:**
1. Vytvořte Test Denní předplatné
2. Zaplaťte 10 Kč
3. Počkejte 24 hodin
4. Zkontrolujte:
   - Firebase Console → `payments` kolekce (měly by být 2 záznamy)
   - Dashboard → datum konce (mělo by se posunout o den)
   - Vercel Logs → webhook notifikace

### Metoda 2: Simulace (Okamžitý test)

**Výhody:**
- ⚡ Okamžité testování
- 🔄 Můžete opakovat vícekrát

**Nevýhody:**
- 🧪 Jen simulace (netestuje GoPay webhook)

**Jak testovat:**
1. Vytvořte Test Denní předplatné
2. Jděte na: https://svatbot.cz/test-recurring
3. Klikněte "Simulovat opakovanou platbu"
4. Předplatné se prodlouží o den
5. Můžete opakovat vícekrát

---

## 📊 Co sledovat

### 1. Firebase Console

**Kolekce `subscriptions/{userId}`:**

```typescript
{
  plan: 'test_daily',
  status: 'active',
  currentPeriodStart: Timestamp,  // Dnes
  currentPeriodEnd: Timestamp,    // Zítra (za 24 hodin)
  amount: 10,
  currency: 'CZK',
  goPayPaymentId: '3286522564',
  updatedAt: Timestamp
}
```

**Kolekce `payments`:**

Po každé platbě (původní + opakované):

```typescript
{
  userId: 'xxx',
  plan: 'test_daily',
  amount: 10,
  status: 'succeeded',
  goPayId: 3286522564,
  goPayParentPaymentId: '3286522564', // Pro opakované platby
  isRecurring: true,                   // Pro opakované platby
  createdAt: Timestamp
}
```

### 2. Vercel Logs

https://vercel.com/spdvpr/svatbot/logs

**Pro původní platbu:**
```
📥 GoPay webhook - INITIAL payment: 3286522564
✅ Subscription ACTIVATED (initial payment) for user: xxx
```

**Pro opakovanou platbu (za 24 hodin):**
```
📥 GoPay webhook - RECURRING payment: 3286999999 parent: 3286522564
📋 Found parent payment - userId: xxx plan: test_daily
✅ Created new payment record for recurring payment
✅ Subscription RENEWED (recurring payment) for user: xxx
```

### 3. Dashboard UI

**Před opakovanou platbou:**
```
🧪 Test Denní
Aktivní do 05.11.2025
```

**Po opakované platbě:**
```
🧪 Test Denní
Aktivní do 06.11.2025  ← Posunuto o den
```

### 4. GoPay Admin Panel

https://admin.gopay.cz

**Najděte platbu:**
1. Platby → Vyhledat
2. Zadejte ID platby
3. Zkontrolujte:
   - ✅ Stav: Zaplacena
   - ✅ Opakovatelná platba: Ano (Jednou denně)
   - ✅ Opakování zrušeno: Ne

---

## 🔧 Zrušení opakování

### Metoda 1: V aplikaci

1. **Můj účet** → **Předplatné**
2. Klikněte **"Zrušit předplatné"**
3. Předplatné zůstane aktivní do konce období
4. Opakování se zastaví

### Metoda 2: GoPay Admin

1. Přihlaste se do GoPay admin
2. Najděte platbu
3. Klikněte **"Zrušit opakování platby"**
4. Potvrzení

---

## 💰 Náklady

### Test prostředí (DOPORUČENO pro testování):
- ✅ **ZDARMA** - žádné skutečné peníze
- ✅ Testovací karta: `4111111111111111`
- ✅ Neomezené testování

### Produkční prostředí:
- ⚠️ **10 Kč každý den**
- ⚠️ Skutečné peníze z karty
- ⚠️ Použijte jen pro finální ověření

**Doporučení:**
1. Testujte v **test prostředí** (zdarma)
2. Finální ověření v **produkci** (1-2 dny = 10-20 Kč)
3. Pak zrušte testovací předplatné

---

## 🚀 Před spuštěním do produkce

### ⚠️ DŮLEŽITÉ: Skryjte Test Denní předplatné!

Před spuštěním do produkce pro zákazníky:

### Možnost 1: Odebrat z kódu (DOPORUČENO)

Zakomentujte nebo odeberte Test Denní plán z:
- `src/types/subscription.ts` - typ a definice
- `src/components/account/SubscriptionTab.tsx` - UI výběr

### Možnost 2: Podmíněné zobrazení

Přidejte podmínku pro zobrazení jen pro adminy:

```typescript
// Zobrazit jen pro adminy
{isAdmin && (
  <div>Test Denní plán...</div>
)}
```

### Možnost 3: Environment variable

```typescript
// Zobrazit jen v development
{process.env.NODE_ENV === 'development' && (
  <div>Test Denní plán...</div>
)}
```

---

## ✅ Checklist

### Před testováním:
- [ ] Máte testovací GoPay účet
- [ ] Environment je nastaveno na `test`
- [ ] Máte přístup k Firebase Console
- [ ] Máte přístup k Vercel Logs

### Test 1: Vytvoření předplatného
- [ ] Přihlaste se do aplikace
- [ ] Otevřete Můj účet → Předplatné
- [ ] Vyberte Test Denní (10 Kč/den)
- [ ] Zaplaťte testovací kartou
- [ ] Ověřte, že status je `active`
- [ ] Ověřte, že datum konce je za 24 hodin

### Test 2: Simulace opakované platby
- [ ] Jděte na /test-recurring
- [ ] Klikněte "Simulovat opakovanou platbu"
- [ ] Ověřte, že datum konce se posunulo o den
- [ ] Ověřte nový záznam v `payments` kolekci

### Test 3: Reálná opakovaná platba (za 24 hodin)
- [ ] Počkejte 24 hodin
- [ ] Zkontrolujte Vercel Logs (webhook notifikace)
- [ ] Zkontrolujte Firebase (`payments` kolekce)
- [ ] Zkontrolujte Dashboard (nové datum)
- [ ] Zkontrolujte GoPay admin (nová platba)

### Test 4: Zrušení
- [ ] Zrušte předplatné v aplikaci
- [ ] Ověřte, že opakování se zastavilo
- [ ] Ověřte v GoPay admin

---

## 🎯 Shrnutí

**Test Denní předplatné:**
- ✅ 10 Kč/den
- ✅ Opakování každý den
- ✅ Pouze pro testování
- ✅ Viditelné jen v nastavení
- ✅ Všechny Premium funkce

**Použití:**
1. Vytvořte předplatné
2. Počkejte 24 hodin nebo použijte simulaci
3. Ověřte, že opakování funguje
4. Zrušte předplatné

**Před produkcí:**
- ⚠️ Skryjte nebo odeberte Test Denní plán
- ⚠️ Ověřte, že není viditelný pro zákazníky
- ⚠️ Testujte s Premium Měsíční v produkci

---

**Vše připraveno pro testování! 🎉**

