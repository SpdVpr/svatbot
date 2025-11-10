# Testování faktur

## 🧪 Vytvoření testovací faktury

Pro testování faktur bez nutnosti provádět skutečné platby můžeš použít testovací endpoint.

### Způsob 1: Přes Admin Dashboard

1. Přihlaš se do admin dashboardu na `/admin/dashboard`
2. Přejdi na záložku "Faktury"
3. Klikni na tlačítko **"Testovací faktura"** (fialové tlačítko s ikonou zkumavky)
4. Testovací faktura se automaticky vytvoří a zobrazí v seznamu

### Způsob 2: Přes API endpoint

```bash
curl -X POST http://localhost:3000/api/invoices/test \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-id",
    "userEmail": "test@svatbot.cz"
  }'
```

Nebo v produkci:

```bash
curl -X POST https://svatbot.cz/api/invoices/test \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "YOUR_USER_ID",
    "userEmail": "YOUR_EMAIL"
  }'
```

## 📄 Stažení faktury

Po vytvoření testovací faktury:

1. V admin dashboardu klikni na tlačítko **"Stáhnout"** u faktury
2. PDF se automaticky stáhne s názvem `faktura-YYYYMMDD-XXXX.pdf`

## ✅ Co bylo opraveno

### 1. Údaje dodavatele
- ✅ Správná adresa: `Michal Vesecky, Zapska 1149, Nehvizdy`
- ✅ Správné PSČ: `25081`
- ✅ Správné IČ: `88320090`
- ✅ Neplátce DPH

### 2. Formátování PDF
- ✅ Čitelné české znaky (háčky, čárky)
- ✅ Profesionální layout s boxy a oddělením sekcí
- ✅ Dodavatel a odběratel vedle sebe
- ✅ Zvýrazněný box s detaily faktury
- ✅ Přehledná tabulka položek
- ✅ Stylový summary box s celkovou částkou
- ✅ Zelený status "ZAPLACENO" pro zaplacené faktury
- ✅ Profesionální footer s kontakty

### 3. Testovací faktura
- ✅ Možnost vytvořit testovací fakturu bez platby
- ✅ Tlačítko v admin dashboardu
- ✅ API endpoint pro automatizaci

## 🎨 Vylepšení designu faktury

### Header
- Logo a název SvatBot.cz v primární barvě
- Box s detaily faktury (číslo, datum, VS) na pravé straně

### Dodavatel a Odběratel
- Vedle sebe pro lepší využití prostoru
- Čitelné oddělení sekcí
- Správné formátování adresy

### Tabulka položek
- Profesionální striped design
- Barevný header
- Zarovnání sloupců (text vlevo, čísla vpravo)

### Summary
- Box s pozadím a rámečkem
- Oddělení základu, DPH a celkové částky
- Zvýrazněná celková částka

### Platební údaje
- Box s pozadím
- Zelený highlight pro status "ZAPLACENO"
- Datum zaplacení

### Footer
- Poděkování
- Kontaktní údaje (email, web)

## 📊 Struktura testovací faktury

```json
{
  "invoiceNumber": "20251110-XXXX",
  "variableSymbol": "2511100001",
  "userId": "test-user-id",
  "userEmail": "test@svatbot.cz",
  "customerName": "test@svatbot.cz",
  "items": [
    {
      "description": "Premium předplatné - testovací",
      "quantity": 1,
      "unitPrice": 299,
      "vatRate": 0,
      "total": 299
    }
  ],
  "subtotal": 299,
  "vatRate": 0,
  "vatAmount": 0,
  "total": 299,
  "currency": "CZK",
  "paymentMethod": "Platební karta",
  "status": "paid",
  "isTest": true
}
```

## 🔍 Kontrola faktur v Firestore

Testovací faktury jsou označeny polem `isTest: true` a lze je snadno filtrovat:

```javascript
// V Firestore konzoli
db.collection('invoices')
  .where('isTest', '==', true)
  .get()
```

## 🚀 Další kroky

1. **Testuj různé scénáře:**
   - Vytvoř několik testovacích faktur
   - Zkontroluj formátování PDF
   - Ověř správnost údajů

2. **Produkční faktury:**
   - Skutečné faktury se vytváří automaticky po úspěšné platbě
   - Webhook od GoPay automaticky vytvoří fakturu
   - Uživatel ji najde v sekci "Můj účet" → "Faktury"

3. **Monitoring:**
   - Sleduj faktury v admin dashboardu
   - Exportuj do CSV/Excel pro účetnictví
   - Stahuj hromadně více faktur najednou

## 💡 Tipy

- Testovací faktury mají stejný formát jako produkční
- Můžeš je použít pro testování emailů s fakturami
- Smaž testovací faktury před spuštěním do produkce (nebo je nech s `isTest: true`)
- Admin může vidět všechny faktury, uživatelé jen své vlastní

