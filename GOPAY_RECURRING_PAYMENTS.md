# 🔄 GoPay Opakované Platby (Recurring Payments)

## 📋 Přehled

Aplikace používá **GoPay automatické opakované platby** pro měsíční předplatné Premium (299 Kč/měsíc).

---

## 💰 Typy předplatného

### 1. Premium Měsíční (299 Kč/měsíc)
- ✅ **Automatické opakované platby**
- ✅ Platba se automaticky opakuje každý měsíc
- ✅ Zákazník nemusí nic dělat
- ✅ Předplatné se automaticky prodlužuje

### 2. Premium Roční (2999 Kč/rok)
- ✅ **Jednorázová platba**
- ✅ Platí se jednou za rok
- ✅ Žádné automatické opakování
- ✅ Po roce je potřeba znovu zaplatit

---

## 🔄 Jak fungují opakované platby

### Krok 1: První platba (Zakládající platba)
1. Zákazník vybere **Premium Měsíční**
2. Vytvoří se platba s parametrem `recurrence`:
   ```json
   {
     "recurrence": {
       "recurrence_cycle": "MONTH",
       "recurrence_period": 1,
       "recurrence_date_to": "2099-12-31"
     }
   }
   ```
3. Zákazník zaplatí kartou
4. **Tím autorizuje všechny budoucí platby**
5. Předplatné se aktivuje

### Krok 2: Automatické následné platby
1. **GoPay automaticky** strhne platbu každý měsíc
2. Webhook notifikace přijde s parametrem `parent_id`
3. Systém vytvoří nový záznam platby
4. Předplatné se automaticky prodlouží o další měsíc

### Krok 3: Zrušení opakování
1. Zákazník klikne "Zrušit předplatné"
2. Nastaví se `cancelAtPeriodEnd: true`
3. Předplatné zůstane aktivní do konce období
4. Po konci období se již neobnoví

---

## 🧪 Testování opakovaných plateb

### Problém
Nechcete čekat 30 dní, abyste viděli, zda opakování funguje.

### Řešení 1: Webhook simulace (Doporučeno)
GoPay testovací prostředí umožňuje **manuálně spustit webhook** pro následnou platbu:

1. Přihlaste se do GoPay testovacího účtu
2. Najděte platbu v administraci
3. Klikněte na "Simulovat následnou platbu"
4. Webhook se zavolá okamžitě

### Řešení 2: Denní opakování (Pro vývoj)
Pro rychlé testování můžete dočasně změnit cyklus na denní:

```typescript
// V gopay-server.ts - pouze pro testování!
recurrence: {
  recurrence_cycle: 'DAY',  // Místo 'MONTH'
  recurrence_period: 1,      // Každý den
  recurrence_date_to: '2099-12-31'
}
```

**Upozornění:** Nezapomeňte vrátit na `MONTH` před nasazením do produkce!

### Řešení 3: Testovací endpoint
Vytvořil jsem endpoint `/api/gopay/test-recurring` pro rychlé testování.

---

## 📡 Webhook notifikace

### První platba
```
GET /api/gopay/webhook?id=3286504182
```

### Následná opakovaná platba
```
GET /api/gopay/webhook?id=3286504999&parent_id=3286504182
```

**Parametr `parent_id`** identifikuje, že jde o opakovanou platbu.

---

## 💾 Databázová struktura

### Payments kolekce

#### První platba
```json
{
  "userId": "user123",
  "userEmail": "user@example.com",
  "goPayId": 3286504182,
  "orderNumber": "user123_1699123456789",
  "amount": 299,
  "currency": "CZK",
  "status": "succeeded",
  "plan": "premium_monthly",
  "isRecurring": false,
  "createdAt": "2024-11-03T10:00:00Z"
}
```

#### Následná opakovaná platba
```json
{
  "userId": "user123",
  "userEmail": "user@example.com",
  "goPayId": 3286504999,
  "parentGoPayId": 3286504182,
  "orderNumber": "3286504999",
  "amount": 299,
  "currency": "CZK",
  "status": "succeeded",
  "plan": "premium_monthly",
  "isRecurring": true,
  "createdAt": "2024-12-03T10:00:00Z"
}
```

### Subscriptions kolekce
```json
{
  "userId": "user123",
  "plan": "premium_monthly",
  "status": "active",
  "amount": 299,
  "currency": "CZK",
  "currentPeriodStart": "2024-11-03T10:00:00Z",
  "currentPeriodEnd": "2024-12-03T10:00:00Z",
  "cancelAtPeriodEnd": false,
  "goPayPaymentId": "3286504182",
  "goPayParentPaymentId": "3286504182"
}
```

---

## 🛑 Zrušení předplatného

### Uživatelské rozhraní
1. Zákazník jde do **Můj účet → Předplatné**
2. Klikne **"Zrušit předplatné"**
3. Potvrdí zrušení

### Co se stane
1. Nastaví se `cancelAtPeriodEnd: true`
2. Předplatné zůstane aktivní do konce období
3. Po konci období:
   - Status se změní na `canceled`
   - Žádné další platby se nestrhnou
   - Zákazník má přístup pouze k free verzi

### Obnovení předplatného
Zákazník může kdykoliv:
1. Kliknout **"Obnovit předplatné"**
2. Nastaví se `cancelAtPeriodEnd: false`
3. Opakování pokračuje

---

## 🔐 Bezpečnost

### Autorizace
- ✅ První platba vyžaduje 3D Secure
- ✅ Následné platby jsou automatické (již autorizované)
- ✅ Zákazník může kdykoliv zrušit

### Notifikace zákazníka
Doporučujeme posílat email:
- 📧 Před každou následnou platbou (3 dny předem)
- 📧 Po úspěšné platbě (potvrzení)
- 📧 Při selhání platby (upozornění)

---

## 📊 Monitoring

### Co sledovat
1. **Úspěšnost plateb** - kolik % plateb proběhne úspěšně
2. **Selhání plateb** - proč platby selhávají
3. **Churn rate** - kolik zákazníků ruší předplatné
4. **MRR (Monthly Recurring Revenue)** - měsíční opakující se příjem

### Logy
```
📥 GoPay webhook - INITIAL payment: 3286504182
✅ Subscription ACTIVATED (initial payment) for user: user123

📥 GoPay webhook - RECURRING payment: 3286504999 parent: 3286504182
✅ Subscription RENEWED (recurring payment) for user: user123
```

---

## 🚀 Produkční nasazení

### Před nasazením
1. ✅ Kontaktujte GoPay pro aktivaci opakovaných plateb na produkci
   - Email: obchod@gopay.cz
   - Telefon: +420 228 224 267

2. ✅ Nastavte webhook URL v GoPay administraci:
   - `https://svatbot.cz/api/gopay/webhook`

3. ✅ Otestujte na testovacím prostředí

4. ✅ Ověřte, že `recurrence_cycle` je `MONTH` (ne `DAY`)

### Po nasazení
1. ✅ Sledujte logy pro webhook notifikace
2. ✅ Ověřte první opakovanou platbu (po 30 dnech)
3. ✅ Nastavte monitoring a alerty

---

## 📞 Podpora

**GoPay Technická podpora:**
- Email: integrace@gopay.cz
- Telefon: +420 228 224 267
- Dokumentace: https://doc.gopay.com/

**Opakované platby:**
- https://help.gopay.com/cs/tema/integrace-platebni-brany/technicky-popis-integrace-platebni-brany/opakovane-platby

---

## ✅ Checklist

- [x] Implementovány automatické opakované platby pro měsíční předplatné
- [x] Jednorázová platba pro roční předplatné
- [x] Webhook handler pro následné platby
- [x] Automatické prodloužení předplatného
- [x] Zrušení předplatného
- [x] Obnovení předplatného
- [x] Testovací endpoint
- [ ] Email notifikace před platbou
- [ ] Email notifikace po platbě
- [ ] Email notifikace při selhání
- [ ] Monitoring a alerty
- [ ] Aktivace na produkčním prostředí

---

**Vše je připraveno k testování! 🎉**

