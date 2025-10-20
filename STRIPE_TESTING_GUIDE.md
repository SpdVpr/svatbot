# 🧪 Stripe Testing Guide - Testování plateb

## ✅ Setup je HOTOVÝ!

Vše je připraveno pro testování reálných Stripe plateb v testovacím režimu:

- ✅ Stripe produkty vytvořeny
- ✅ API endpointy připraveny
- ✅ Webhook nakonfigurován
- ✅ Environment variables nastaveny
- ✅ Frontend připraven

---

## 🚀 Jak testovat nákup předplatného

### Krok 1: Restartujte dev server

```bash
npm run dev
```

### Krok 2: Přihlaste se jako běžný uživatel

1. Otevřete: **https://svatbot.cz** (nebo `http://localhost:3000`)
2. Přihlaste se (NE jako admin!)
3. Pokud nemáte účet, zaregistrujte se

### Krok 3: Otevřete Předplatné

1. **Klikněte na ikonu profilu** v pravém horním rohu
2. **Vyberte záložku "Předplatné"**
3. Měli byste vidět:
   - Aktuální status (Zkušební období)
   - Dva tarify: Měsíční (299 Kč) a Roční (2999 Kč)

### Krok 4: Vyberte tarif

1. **Klikněte na tarif** který chcete (doporučuji měsíční pro test)
2. **Klikněte "Upgradovat na Premium"**
3. **Měli byste být přesměrováni na Stripe Checkout** 🎉

### Krok 5: Proveďte testovací platbu

Na Stripe Checkout stránce zadejte:

```
Email: test@example.com (nebo váš email)
Číslo karty: 4242 4242 4242 4242
Expiry: 12/25 (jakékoli budoucí datum)
CVC: 123 (jakékoli 3 číslice)
Jméno: Test User
```

**Klikněte "Subscribe"**

### Krok 6: Ověřte úspěšnou platbu

Po úspěšné platbě:

1. **Měli byste být přesměrováni zpět** na dashboard
2. **Otevřete profil → Předplatné**
3. **Měli byste vidět:**
   - Status: "Premium měsíční" nebo "Premium roční"
   - Aktivní do: datum
   - Tlačítko "Zrušit předplatné"

---

## 🔍 Ověření v Admin Dashboardu

### Krok 1: Přihlaste se jako admin

1. Otevřete: **https://svatbot.cz/admin/login**
2. Email: `admin@svatbot.cz`
3. Heslo: `[vaše admin heslo]`

### Krok 2: Otevřete záložku "Platby"

1. **Dashboard → Platby**
2. **Měli byste vidět:**
   - ✅ Statistiky aktualizované (Celkový příjem, MRR, Aktivní předplatná)
   - ✅ Novou platbu v tabulce
   - ✅ Nové předplatné v seznamu

### Krok 3: Zkontrolujte detaily

**V tabulce plateb:**
- Uživatel: email testovacího uživatele
- Částka: 299 Kč nebo 2999 Kč
- Status: "Úspěšná"
- Datum: dnešní datum
- Faktura: odkaz na Stripe fakturu

**V seznamu předplatných:**
- Uživatel: email testovacího uživatele
- Plán: "Premium měsíční" nebo "Premium roční"
- Status: "Aktivní"
- Období: od-do

---

## 📊 Testovací karty

### ✅ Úspěšné platby

| Karta | Popis |
|-------|-------|
| `4242 4242 4242 4242` | Visa - úspěšná platba |
| `5555 5555 5555 4444` | Mastercard - úspěšná platba |
| `3782 822463 10005` | American Express |
| `4000 0025 0000 3155` | Vyžaduje 3D Secure autentizaci |

### ❌ Neúspěšné platby

| Karta | Popis |
|-------|-------|
| `4000 0000 0000 0002` | Karta odmítnuta |
| `4000 0000 0000 9995` | Nedostatek prostředků |
| `4000 0000 0000 0069` | Platba vypršela |
| `4000 0000 0000 0127` | Nesprávné CVC |

### 🔄 Speciální případy

| Karta | Popis |
|-------|-------|
| `4000 0000 0000 0341` | Platba vyžaduje autentizaci a selže |
| `4000 0082 6000 0000` | Platba je zpracována, ale pak selhává |

**Pro všechny karty:**
- Expiry: Jakékoli budoucí datum (např. 12/25, 01/26)
- CVC: Jakékoli 3 číslice (např. 123, 456)
- ZIP: Jakékoli 5 číslic (např. 12345)

---

## 🧪 Testovací scénáře

### Scénář 1: Úspěšný nákup měsíčního předplatného

1. Přihlaste se jako běžný uživatel
2. Profil → Předplatné
3. Vyberte "Měsíční" (299 Kč)
4. Klikněte "Upgradovat"
5. Použijte kartu `4242 4242 4242 4242`
6. Dokončete platbu
7. **Ověřte:**
   - ✅ Status předplatného: "Premium měsíční"
   - ✅ Admin dashboard: nová platba 299 Kč
   - ✅ Stripe Dashboard: nová platba

### Scénář 2: Úspěšný nákup ročního předplatného

1. Přihlaste se jako běžný uživatel
2. Profil → Předplatné
3. Vyberte "Roční" (2999 Kč)
4. Klikněte "Upgradovat"
5. Použijte kartu `4242 4242 4242 4242`
6. Dokončete platbu
7. **Ověřte:**
   - ✅ Status předplatného: "Premium roční"
   - ✅ Admin dashboard: nová platba 2999 Kč
   - ✅ Stripe Dashboard: nová platba

### Scénář 3: Neúspěšná platba

1. Přihlaste se jako běžný uživatel
2. Profil → Předplatné
3. Vyberte jakýkoli tarif
4. Klikněte "Upgradovat"
5. Použijte kartu `4000 0000 0000 0002` (odmítnuta)
6. Zkuste dokončit platbu
7. **Ověřte:**
   - ✅ Chybová hláška od Stripe
   - ✅ Status předplatného: stále "Zkušební období"
   - ✅ Admin dashboard: žádná nová platba

### Scénář 4: Zrušení předplatného

1. Přihlaste se jako uživatel s aktivním předplatným
2. Profil → Předplatné
3. Klikněte "Zrušit předplatné"
4. Potvrďte zrušení
5. **Ověřte:**
   - ✅ Upozornění: "Vaše předplatné bude zrušeno [datum]"
   - ✅ Tlačítko změněno na "Obnovit předplatné"
   - ✅ Admin dashboard: předplatné označeno jako "Zruší se"

### Scénář 5: Obnovení zrušeného předplatného

1. Přihlaste se jako uživatel se zrušeným předplatným
2. Profil → Předplatné
3. Klikněte "Obnovit předplatné"
4. **Ověřte:**
   - ✅ Upozornění zmizelo
   - ✅ Tlačítko změněno zpět na "Zrušit předplatné"
   - ✅ Admin dashboard: předplatné aktivní

---

## 🔍 Kde kontrolovat výsledky

### 1. User Frontend (svatbot.cz)

**Profil → Předplatné:**
- Aktuální status předplatného
- Datum aktivního do
- Možnost zrušit/obnovit

**Profil → Platby:**
- Historie všech plateb
- Odkazy na faktury

### 2. Admin Dashboard (svatbot.cz/admin)

**Dashboard → Platby:**
- **Statistiky:**
  - Celkový příjem
  - Měsíční příjem
  - MRR (Monthly Recurring Revenue)
  - ARR (Annual Recurring Revenue)
  - Aktivní předplatná
  - Nová předplatná tento měsíc
  - Churn Rate

- **Tabulka plateb:**
  - Všechny platby od všech uživatelů
  - Filtry a vyhledávání
  - Export možnost

- **Seznam předplatných:**
  - Všechna aktivní předplatná
  - Status každého předplatného

### 3. Stripe Dashboard

**Test mode:**
- https://dashboard.stripe.com/test/payments
- https://dashboard.stripe.com/test/subscriptions
- https://dashboard.stripe.com/test/customers

**Logs:**
- https://dashboard.stripe.com/test/logs

**Webhooks:**
- https://dashboard.stripe.com/test/webhooks
- Zkontrolujte, že události jsou doručovány

---

## 🐛 Debugging

### Problém: Checkout se nevytvoří

**Zkontrolujte:**
1. Browser console (F12) - hledejte chyby
2. Server logs - hledejte `POST /api/stripe/create-checkout-session`
3. Stripe Dashboard → Logs

**Možné příčiny:**
- Nesprávné Price IDs
- Nesprávný API key
- Stripe package není nainstalován

### Problém: Platba proběhla, ale předplatné se neaktualizovalo

**Zkontrolujte:**
1. Stripe Dashboard → Webhooks - jsou události doručovány?
2. Server logs - hledejte `POST /api/stripe/webhook`
3. Webhook secret je správně nastaven v `.env.local`

**Možné příčiny:**
- Webhook není nakonfigurován
- Webhook secret je nesprávný
- Firestore pravidla blokují zápis

### Problém: Admin dashboard neukazuje platby

**Zkontrolujte:**
1. Firestore Console - existují dokumenty v `payments` kolekci?
2. Browser console - jsou nějaké chyby při načítání?
3. Admin je správně přihlášen?

**Možné příčiny:**
- Webhook nefunguje (platby se nevytvářejí)
- Firestore pravidla blokují čtení
- Admin nemá správná oprávnění

---

## 📝 Checklist testování

### Základní flow
- [ ] Registrace nového uživatele
- [ ] Otevření Předplatné stránky
- [ ] Výběr měsíčního tarifu
- [ ] Přesměrování na Stripe Checkout
- [ ] Úspěšná platba kartou 4242...
- [ ] Přesměrování zpět na dashboard
- [ ] Ověření statusu předplatného

### Admin dashboard
- [ ] Přihlášení jako admin
- [ ] Otevření záložky Platby
- [ ] Ověření statistik (příjem, MRR, předplatná)
- [ ] Ověření nové platby v tabulce
- [ ] Ověření nového předplatného v seznamu

### Stripe Dashboard
- [ ] Otevření Stripe Dashboard (test mode)
- [ ] Ověření nové platby v Payments
- [ ] Ověření nového předplatného v Subscriptions
- [ ] Ověření webhook událostí

### Pokročilé scénáře
- [ ] Nákup ročního předplatného
- [ ] Neúspěšná platba (karta 4000...0002)
- [ ] Zrušení předplatného
- [ ] Obnovení zrušeného předplatného
- [ ] 3D Secure platba (karta 4000...3155)

---

## 🎉 Po úspěšném testování

Pokud vše funguje správně, máte:

✅ **Plně funkční platební systém**
- Reálné Stripe Checkout
- Testovací platby
- Webhook integrace
- Admin přehled
- User správa předplatného

🚀 **Připraveno na produkci**

Pro přechod na produkci:
1. Získejte live API keys ze Stripe
2. Vytvořte produkty v live mode
3. Nakonfigurujte live webhook
4. Změňte keys v `.env.local` na live
5. Deploy!

---

**Status:** ✅ **PŘIPRAVENO K TESTOVÁNÍ**  
**Testovací karta:** `4242 4242 4242 4242`  
**Admin login:** `admin@svatbot.cz`

