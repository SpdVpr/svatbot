# 📄 Fakturační systém - Dokumentace

## ✅ Co je hotovo

### 1. Automatické generování faktur

**Kdy se vytváří faktury:**
- ✅ Automaticky při každé úspěšné platbě přes GoPay
- ✅ Webhook `/api/gopay/webhook` vytvoří fakturu ihned po potvrzení platby
- ✅ Faktura obsahuje všechny potřebné údaje pro účetnictví

**Struktura faktury:**
```typescript
{
  invoiceNumber: "20250107-0001",  // Formát: YYYYMMDD-XXXX
  variableSymbol: "202501070001",   // Pro párování plateb
  issueDate: Date,                  // Datum vystavení
  dueDate: Date,                    // Datum splatnosti (= datum platby)
  taxableDate: Date,                // DUZP
  status: "paid",                   // paid | issued | draft | cancelled
  
  // Položky
  items: [
    {
      description: "Premium předplatné - měsíční",
      quantity: 1,
      unitPrice: 299,
      vatRate: 0,
      total: 299
    }
  ],
  
  // Částky
  subtotal: 299,
  vatRate: 0,        // Nejsme plátci DPH
  vatAmount: 0,
  total: 299,
  currency: "CZK"
}
```

### 2. PDF generování

**Knihovna:** `jspdf` + `jspdf-autotable`

**Funkce:**
- ✅ Profesionální české faktury s logem SvatBot.cz
- ✅ Všechny povinné údaje (IČO, DIČ, DUZP, VS)
- ✅ Tabulka položek s DPH
- ✅ Označení "Nejsme plátci DPH"
- ✅ Označení "ZAPLACENO" u zaplacených faktur
- ✅ PDF se generuje on-demand při prvním stažení
- ✅ PDF se ukládá do Firebase Storage

**Soubory:**
- `src/lib/invoiceGenerator.ts` - Generování PDF
- `src/hooks/useInvoices.ts` - Hook pro práci s fakturami (user)
- `src/hooks/useAdminInvoices.ts` - Hook pro správu faktur (admin)

### 3. Uživatelské rozhraní

**Přístup:** Dashboard → Ikona profilu → Faktury

**Funkce:**
- ✅ Seznam všech faktur uživatele
- ✅ Zobrazení stavu faktury (Zaplaceno, Vystaveno, Stornováno)
- ✅ Stažení PDF faktury jedním kliknutím
- ✅ Vyhledávání podle čísla faktury
- ✅ Informační panel s důležitými údaji

**Komponenta:** `src/components/account/InvoicesTab.tsx`

### 4. Admin dashboard

**Přístup:** https://svatbot.cz/admin/dashboard → Záložka "Faktury"

**Funkce:**
- ✅ **Statistiky:**
  - Celkem faktur
  - Zaplacené faktury
  - Celkový příjem
  - Měsíční příjem
  - Průměrná částka faktury

- ✅ **Tabulka všech faktur:**
  - Číslo faktury
  - Zákazník (jméno, email)
  - Datum vystavení
  - Částka
  - Stav
  - Akce (stažení PDF)

- ✅ **Hromadné operace:**
  - Výběr více faktur (checkbox)
  - Hromadné stažení jako ZIP archiv
  - Export do CSV
  - Export do Excel

- ✅ **Filtry:**
  - Vyhledávání podle čísla faktury, emailu, jména
  - Filtr podle stavu (Zaplaceno, Vystaveno, Koncept, Stornováno)

**Komponenta:** `src/components/admin/InvoicesTab.tsx`

### 5. Export pro účetnictví

**CSV Export:**
- ✅ Všechny faktury nebo jen vybrané
- ✅ UTF-8 s BOM pro správné zobrazení v Excelu
- ✅ Středník jako oddělovač (český standard)
- ✅ Obsahuje: číslo faktury, data, zákazník, IČO, částka, stav, VS

**Excel Export:**
- ✅ Formát .xlsx
- ✅ Strukturovaná data v tabulce
- ✅ Obsahuje: všechny údaje včetně DPH, DUZP, způsob platby

**Knihovny:**
- `jszip` - Vytváření ZIP archivů
- `file-saver` - Stahování souborů
- `xlsx` - Export do Excelu

### 6. Firebase integrace

**Firestore Collections:**

```
invoices/{invoiceId}
  - invoiceNumber: string
  - paymentId: string
  - userId: string
  - userEmail: string
  - customerName: string
  - customerICO?: string
  - customerDIC?: string
  - issueDate: Timestamp
  - dueDate: Timestamp
  - taxableDate: Timestamp
  - items: array
  - subtotal: number
  - vatRate: number
  - vatAmount: number
  - total: number
  - currency: string
  - paymentMethod: string
  - variableSymbol: string
  - status: string
  - paidAt?: Timestamp
  - invoicePdfUrl?: string
  - supplierName: string
  - supplierICO: string
  - createdAt: Timestamp
  - updatedAt: Timestamp
```

**Firebase Storage:**
```
invoices/{userId}/{invoiceNumber}.pdf
```

**Firestore Rules:**
```javascript
// Uživatelé vidí pouze své faktury
match /invoices/{invoiceId} {
  allow read: if request.auth.uid == resource.data.userId;
}

// Admini vidí všechny faktury
match /invoices/{invoiceId} {
  allow read: if isAdmin();
}
```

---

## 🔧 Konfigurace

### Údaje o společnosti

**Soubor:** `src/hooks/useInvoices.ts` (řádek 20-32)

```typescript
const SVATBOT_INFO = {
  supplierName: 'SvatBot.cz',
  supplierAddress: 'Příkladová 123',  // TODO: Změnit na skutečnou adresu
  supplierCity: 'Praha',
  supplierZip: '110 00',
  supplierCountry: 'Česká republika',
  supplierICO: '12345678',            // TODO: Změnit na skutečné IČO
  supplierDIC: undefined,             // Nejsme plátci DPH
  supplierEmail: 'info@svatbot.cz',
  supplierPhone: '+420 XXX XXX XXX',  // TODO: Změnit na skutečné číslo
  supplierBankAccount: 'XXXX-XXXXXX/XXXX',  // TODO: Změnit
  supplierIBAN: 'CZ XX XXXX XXXX XXXX XXXX XXXX',
  supplierSWIFT: 'XXXXXXXX'
}
```

**⚠️ DŮLEŽITÉ:** Před nasazením do produkce je nutné aktualizovat tyto údaje!

---

## 📊 Workflow

### 1. Uživatel zaplatí předplatné

```
1. Uživatel klikne na "Upgrade na Premium"
2. Přesměrování na GoPay platební bránu
3. Uživatel zaplatí kartou
4. GoPay odešle webhook na /api/gopay/webhook
```

### 2. Webhook zpracuje platbu

```typescript
// src/app/api/gopay/webhook/route.ts

1. Ověří platbu v GoPay API
2. Aktualizuje status platby v Firestore
3. Aktivuje/obnoví předplatné
4. Vytvoří fakturu automaticky
   - Vygeneruje číslo faktury
   - Vytvoří záznam v Firestore
   - PDF se vygeneruje až při prvním stažení
```

### 3. Uživatel stáhne fakturu

```
1. Uživatel otevře Dashboard → Profil → Faktury
2. Klikne na "Stáhnout PDF"
3. Pokud PDF neexistuje:
   - Vygeneruje se PDF pomocí jsPDF
   - Nahraje se do Firebase Storage
   - Uloží se URL do Firestore
4. PDF se stáhne do počítače
```

### 4. Admin exportuje faktury

```
1. Admin otevře Admin Dashboard → Faktury
2. Vybere faktury (nebo všechny)
3. Klikne na "Export CSV" nebo "Export Excel"
4. Soubor se stáhne s aktuálními daty
```

---

## 🎨 Design

### Barvy
- **Primary:** Rose-600 (#DB2777) - Logo a hlavní prvky
- **Success:** Green-600 - Zaplacené faktury
- **Warning:** Amber-600 - Vystavené faktury
- **Error:** Red-600 - Stornované faktury

### Typografie
- **Nadpisy:** Helvetica Bold
- **Text:** Helvetica Normal
- **Čísla:** Monospace pro lepší čitelnost

---

## 🔐 Bezpečnost

### Firestore Rules
- ✅ Uživatelé vidí pouze své faktury
- ✅ Admini vidí všechny faktury
- ✅ Faktury nelze vytvářet/upravovat z frontendu
- ✅ Pouze webhook může vytvářet faktury

### Firebase Storage
- ✅ PDF faktury jsou chráněné Firebase Security Rules
- ✅ Přístup pouze pro vlastníka nebo admina
- ✅ URL jsou časově omezené (signed URLs)

---

## 📈 Metriky

### Admin statistiky
- Celkem faktur
- Zaplacené faktury
- Nezaplacené faktury
- Celkový příjem
- Měsíční příjem
- Průměrná částka faktury

---

## 🚀 Další možnosti rozšíření

### Budoucí funkce:
- [ ] Automatické odesílání faktur emailem
- [ ] Opakované faktury pro předplatné
- [ ] Dobropisy a storna
- [ ] Úprava fakturačních údajů zákazníkem
- [ ] Integrace s účetními systémy (Money S3, Pohoda)
- [ ] QR kód pro platbu na faktuře
- [ ] Automatické připomínky splatnosti
- [ ] Hromadné generování PDF (pre-generate)

---

## 📝 Poznámky

### Číslování faktur
- Formát: `YYYYMMDD-XXXX` (např. `20250107-0001`)
- Unikátní pro každou platbu
- Variabilní symbol: poslední 10 číslic bez pomlčky

### DPH
- SvatBot.cz není plátce DPH
- Všechny faktury jsou bez DPH
- Na faktuře je uvedeno "Nejsme plátci DPH"

### DUZP (Datum zdanitelného plnění)
- Pro služby = datum zaplacení
- Pro předplatné = datum aktivace

---

## 🐛 Troubleshooting

### Faktura se nevygenerovala
1. Zkontrolovat webhook logy v konzoli
2. Ověřit, že platba má status "PAID"
3. Zkontrolovat Firestore collection `invoices`

### PDF se nestahuje
1. Zkontrolovat Firebase Storage permissions
2. Ověřit, že PDF bylo vygenerováno
3. Zkontrolovat browser console pro chyby

### Export nefunguje
1. Zkontrolovat, že jsou vybrané faktury
2. Ověřit, že browser povoluje stahování
3. Zkontrolovat console pro chyby

---

## 📞 Kontakt

Pro technické dotazy kontaktujte vývojový tým.

