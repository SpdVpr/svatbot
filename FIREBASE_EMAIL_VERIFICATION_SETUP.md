# Firebase Email Verification Setup

## Problém
Při pokusu o odeslání ověřovacího emailu se zobrazuje chyba: "Chyba při odesílání ověřovacího emailu"

## Možné příčiny

### 1. Nepovolená doména v Firebase Console
Firebase Authentication vyžaduje, aby všechny domény, ze kterých se odesílají akční emaily, byly povolené.

**Řešení:**
1. Otevřete [Firebase Console](https://console.firebase.google.com/project/svatbot-app/authentication/settings)
2. Přejděte na **Authentication** → **Settings** → **Authorized domains**
3. Přidejte tyto domény:
   - `svatbot.cz`
   - `www.svatbot.cz`
   - `localhost` (pro development)
   - Vaše Vercel deployment URL (např. `svatbot.vercel.app`)

### 2. Není nakonfigurovaná email šablona
Firebase Authentication potřebuje mít nakonfigurované email šablony pro ověřovací emaily.

**Řešení:**
1. Otevřete [Firebase Console](https://console.firebase.google.com/project/svatbot-app/authentication/emails)
2. Přejděte na **Authentication** → **Templates**
3. Klikněte na **Email address verification**
4. Upravte šablonu:
   - **From name**: SvatBot
   - **From email**: noreply@svatbot.cz (nebo noreply@svatbot-app.firebaseapp.com)
   - **Reply-to email**: support@svatbot.cz
   - **Subject**: Ověřte svůj email - SvatBot
   - **Body**: Můžete použít výchozí šablonu nebo vlastní

### 3. Není povolené odesílání emailů
Firebase Authentication může mít omezené odesílání emailů v závislosti na plánu.

**Řešení:**
1. Zkontrolujte, zda máte aktivní Firebase plán (Blaze/Pay-as-you-go)
2. Zkontrolujte kvóty v [Firebase Console](https://console.firebase.google.com/project/svatbot-app/usage)

### 4. SMTP konfigurace
Pro produkční použití je lepší použít vlastní SMTP server (např. SendGrid, Mailgun, nebo Gmail).

**Řešení:**
1. V Firebase Console přejděte na **Authentication** → **Templates** → **SMTP settings**
2. Nakonfigurujte vlastní SMTP server

## Testování

Po provedení změn v Firebase Console:

1. Restartujte aplikaci
2. Zaregistrujte nového uživatele nebo se přihlaste
3. Klikněte na "Ověřit email" v profilu
4. Zkontrolujte konzoli prohlížeče pro detailní chybové hlášky
5. Zkontrolujte spam složku v emailu

## Alternativní řešení

Pokud Firebase Authentication email verification nefunguje, můžete implementovat vlastní řešení pomocí Firebase Functions a vlastního SMTP serveru (již máte implementované v `functions/src/services/emailService.ts`).

## Kontrolní seznam

- [ ] Přidat `svatbot.cz` do Authorized domains
- [ ] Přidat `www.svatbot.cz` do Authorized domains  
- [ ] Přidat Vercel URL do Authorized domains
- [ ] Nakonfigurovat email šablonu pro verification
- [ ] Zkontrolovat Firebase plán (Blaze)
- [ ] Otestovat odeslání ověřovacího emailu
- [ ] Zkontrolovat spam složku

