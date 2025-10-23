# 📧 Emailový systém - Kompletní nastavení

Tento dokument popisuje kompletní nastavení automatického odesílání emailů pro SvatBot.cz s integrací vedos.cz mailhostingu.

## 🎯 Přehled funkcí

Emailový systém automaticky odesílá emaily v těchto případech:

1. **Registrace** - Uvítací email s informacemi o 30denním trial období
2. **Úspěšná platba** - Potvrzení platby a aktivace Premium přístupu
3. **Trial reminder** - Upozornění 2 dny před koncem zkušebního období
4. **Admin statistiky** - Dashboard pro sledování odeslaných emailů

## 📋 Implementované komponenty

### Firebase Functions

#### 1. Email Service (`functions/src/services/emailService.ts`)
- SMTP konfigurace pro vedos.cz
- Funkce pro odesílání emailů:
  - `sendRegistrationEmail()` - Uvítací email
  - `sendPaymentSuccessEmail()` - Potvrzení platby
  - `sendTrialReminderEmail()` - Upozornění na konec trialu
- Automatické logování všech emailů do Firestore

#### 2. Triggery

**onUserCreate** (`functions/src/triggers/onUserCreate.ts`)
- Automaticky se spustí při registraci nového uživatele
- Odesílá uvítací email s informacemi o trial období

**onPaymentSuccess** (`functions/src/triggers/onPaymentSuccess.ts`)
- Spustí se při změně statusu subscription na 'active'
- Odesílá potvrzení platby s detaily

**checkTrialExpiry** (`functions/src/triggers/checkTrialExpiry.ts`)
- Scheduled function - běží každý den v 9:00 CET
- Kontroluje subscriptions končící za 2 dny
- Odesílá reminder emaily

#### 3. Admin API

**EmailStatsController** (`functions/src/controllers/EmailStatsController.ts`)
- `GET /api/v1/admin/email-stats` - Detailní statistiky
- `GET /api/v1/admin/email-stats/summary` - Přehled za 30 dní
- `GET /api/v1/admin/email-stats/daily` - Denní statistiky pro grafy

### Frontend komponenty

**EmailStatsPanel** (`src/components/admin/EmailStatsPanel.tsx`)
- Zobrazení statistik v admin dashboardu
- Real-time data o odeslaných emailech
- Rozdělení podle typu emailu
- Úspěšnost doručení

## 🔧 Konfigurace

### 1. Nastavení SMTP pro vedos.cz

V Firebase Functions je potřeba nastavit environment variables:

```bash
cd functions
firebase functions:config:set email.user="info@svatbot.cz"
firebase functions:config:set email.password="VAŠE_HESLO"
```

Nebo přes Firebase Console:
1. Otevřete Firebase Console
2. Přejděte na Functions → Configuration
3. Přidejte:
   - `EMAIL_USER`: `info@svatbot.cz`
   - `EMAIL_PASSWORD`: Vaše heslo z vedos.cz

### 2. SMTP konfigurace Wedos

Podle Wedos mailhostingu:

```
Host: wes1-smtp.wedos.net
Port: 587
Security: STARTTLS
Authentication: Required
Username: info@svatbot.cz
Password: [Vaše heslo]
```

### 3. DNS záznamy pro doménu svatbot.cz

Pro správné fungování emailů musíte nastavit tyto MX záznamy v DNS:

```
MX	10 mx1.wedos.email
MX	10 mx1.wedos.global
MX	10 mx1.wedos.com
MX	10 mx1.wedos.mx
MX	20 mx1.wedos.online
```

Další služby:
- **IMAP/POP3**: wes1-imap.wedos.net
- **Webmail**: https://webmail.wedos.net/

### 4. Deploy Firebase Functions

```bash
# Build functions
cd functions
npm run build

# Deploy všechny functions
firebase deploy --only functions

# Nebo jen email functions
firebase deploy --only functions:onUserCreate,functions:onPaymentSuccess,functions:checkTrialExpiry
```

### 5. Firestore pravidla

Pravidla pro emailLogs a emailStats jsou již nastavena v `firestore.rules`:

```javascript
// Email Logs - Admin only read, system write
match /emailLogs/{logId} {
  allow read: if isAdmin();
  allow write: if false;
}

// Email Stats - Admin only read, system write
match /emailStats/{statsId} {
  allow read: if isAdmin();
  allow write: if false;
}
```

Deploy pravidel:
```bash
firebase deploy --only firestore:rules
```

## 📊 Firestore kolekce

### emailLogs
Každý odeslaný email se loguje:

```typescript
{
  userId: string
  email: string
  type: 'registration' | 'payment_success' | 'trial_reminder' | 'trial_expired' | 'other'
  subject: string
  status: 'sent' | 'failed' | 'pending'
  error?: string
  sentAt: Timestamp
  metadata?: {
    plan?: string
    amount?: number
    currency?: string
    trialEndDate?: string
  }
}
```

### emailStats
Agregované statistiky (vytvářené scheduled function):

```typescript
{
  type: 'trial_reminder_batch'
  count: number
  timestamp: Timestamp
  date: string // YYYY-MM-DD
}
```

## 🎨 Emailové šablony

Všechny emaily používají responzivní HTML šablony s:
- Gradient header (SvatBot branding)
- Přehledné informace
- Call-to-action tlačítka
- Footer s odkazy na právní dokumenty

### Registrační email
- Uvítání nového uživatele
- Informace o 30denním trial období
- Seznam dostupných funkcí
- Tlačítko "Začít plánovat svatbu"

### Platební email
- Potvrzení úspěšné platby
- Detaily platby (plán, částka, datum)
- Informace o aktivovaných funkcích
- Tlačítko "Pokračovat v plánování"

### Trial reminder email
- Upozornění na blížící se konec trialu
- Datum konce zkušebního období
- Přehled cen (měsíční/roční)
- Tlačítko "Přejít na Premium"

## 📈 Admin Dashboard

V admin dashboardu (`/admin/dashboard`) je nový panel "Statistiky emailů":

### Zobrazené metriky:
- **Dnes**: Celkem, Odesláno, Selhalo
- **Posledních 30 dní**: Celkem, Odesláno, Selhalo, Úspěšnost %
- **Podle typu**: Registrace, Platby, Trial upozornění, atd.

### Funkce:
- Real-time aktualizace
- Automatické obnovení
- Barevné indikátory úspěšnosti
- Progress bary pro jednotlivé typy

## 🧪 Testování

### 1. Test registračního emailu
```bash
# Vytvořte nového uživatele přes registrační formulář
# Email by měl být odeslán automaticky
```

### 2. Test platebního emailu
```bash
# Proveďte testovací platbu přes Stripe
# Po úspěšné platbě se odešle potvrzovací email
```

### 3. Test trial reminder
```bash
# Scheduled function běží automaticky každý den v 9:00
# Pro manuální test můžete spustit:
firebase functions:shell
> checkTrialExpiry()
```

### 4. Test admin dashboardu
```bash
# Přihlaste se jako admin
# Přejděte na /admin/dashboard
# Zkontrolujte panel "Statistiky emailů"
```

## 🔍 Monitoring

### Firebase Console
1. Functions → Logs - Sledování běhu functions
2. Firestore → emailLogs - Přehled všech odeslaných emailů
3. Functions → Usage - Spotřeba a náklady

### Admin Dashboard
- Real-time statistiky
- Úspěšnost doručení
- Rozdělení podle typu
- Denní trendy

## 🚨 Troubleshooting

### Email se neodeslal
1. Zkontrolujte Firebase Functions logs
2. Ověřte SMTP credentials v config
3. Zkontrolujte emailLogs kolekci pro error message

### Scheduled function neběží
1. Ověřte, že je function deployed
2. Zkontrolujte Cloud Scheduler v GCP Console
3. Ověřte timezone nastavení

### Admin dashboard neukazuje data
1. Zkontrolujte, že jste přihlášeni jako admin
2. Ověřte Firebase Functions URL v EmailStatsPanel
3. Zkontrolujte browser console pro chyby

## 💰 Náklady

### Firebase Functions
- **Invocations**: První 2M zdarma/měsíc
- **Compute time**: První 400K GB-seconds zdarma
- **Outbound networking**: První 5GB zdarma

### Odhad pro SvatBot:
- Registrace: ~100/měsíc = 100 invocations
- Platby: ~50/měsíc = 50 invocations  
- Trial reminders: ~30/den = 900 invocations/měsíc
- **Celkem**: ~1050 invocations/měsíc = **ZDARMA** ✅

### vedos.cz mailhosting
- Podle vašeho tarifu na https://vedos.cz/mailhosting/individual/
- Neomezené odesílání emailů v rámci tarifu

## 📝 Další kroky

### Možná vylepšení:
1. **Email templates v Firestore** - Editovatelné šablony přes admin
2. **A/B testování** - Různé verze emailů
3. **Personalizace** - Více personalizovaný obsah
4. **Unsubscribe** - Možnost odhlášení z marketingových emailů
5. **Email analytics** - Open rate, click rate tracking
6. **Retry logic** - Automatické opakování při selhání
7. **Email queue** - Fronta pro hromadné odesílání

## 🔗 Užitečné odkazy

- [Firebase Functions dokumentace](https://firebase.google.com/docs/functions)
- [Nodemailer dokumentace](https://nodemailer.com/)
- [vedos.cz mailhosting](https://vedos.cz/mailhosting/individual/)
- [Firebase Scheduler](https://firebase.google.com/docs/functions/schedule-functions)

## ✅ Checklist pro produkci

- [ ] Nastavit SMTP credentials v Firebase Config
- [ ] Deploy všech functions
- [ ] Deploy Firestore rules
- [ ] Otestovat všechny typy emailů
- [ ] Ověřit admin dashboard
- [ ] Nastavit monitoring a alerty
- [ ] Zkontrolovat spam score emailů
- [ ] Přidat SPF/DKIM záznamy v DNS (vedos.cz)
- [ ] Otestovat na různých email klientech
- [ ] Dokumentovat pro tým

---

**Vytvořeno**: 2025-10-23  
**Autor**: Augment Agent  
**Verze**: 1.0.0

