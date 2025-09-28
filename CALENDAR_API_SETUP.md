# Nastavení Calendar API pro SvatBot

Tento dokument popisuje, jak nastavit Google Calendar a Microsoft Calendar API pro funkční synchronizaci kalendářů.

## 🔧 Google Calendar API Setup

### Krok 1: Povolte Google Calendar API

1. Jděte na [Google Cloud Console](https://console.cloud.google.com/)
2. Vyberte projekt `svatbot-app` (nebo vytvořte nový)
3. Jděte na **APIs & Services > Library**
4. Vyhledejte "Google Calendar API"
5. Klikněte na **Enable**

### Krok 2: Vytvořte OAuth 2.0 Credentials

1. Jděte na **APIs & Services > Credentials**
2. Klikněte na **+ CREATE CREDENTIALS**
3. Vyberte **OAuth client ID**
4. Nastavte:
   - **Application type:** Web application
   - **Name:** SvatBot Calendar Integration
   - **Authorized JavaScript origins:**
     - `https://svatbot.cz`
     - `http://localhost:3000` (pro development)
   - **Authorized redirect URIs:**
     - `https://svatbot.cz/api/auth/google/callback`
     - `http://localhost:3000/api/auth/google/callback`

### Krok 3: Aktualizujte Environment Variables

V `.env.local` nastavte:

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_actual_client_id_here
GOOGLE_CLIENT_SECRET=your_actual_client_secret_here
```

## 🔧 Microsoft Calendar API Setup

### Krok 1: Vytvořte Azure App Registration

1. Jděte na [Azure Portal](https://portal.azure.com/)
2. Vyberte **Azure Active Directory**
3. Jděte na **App registrations**
4. Klikněte na **+ New registration**
5. Nastavte:
   - **Name:** SvatBot Calendar Integration
   - **Supported account types:** Accounts in any organizational directory and personal Microsoft accounts
   - **Redirect URI:** Web - `https://svatbot.cz/api/auth/microsoft/callback`

### Krok 2: Nastavte API Permissions

1. V aplikaci jděte na **API permissions**
2. Klikněte na **+ Add a permission**
3. Vyberte **Microsoft Graph**
4. Vyberte **Delegated permissions**
5. Přidejte: `Calendars.ReadWrite`

### Krok 3: Vytvořte Client Secret

1. Jděte na **Certificates & secrets**
2. Klikněte na **+ New client secret**
3. Nastavte popis a expiraci
4. Zkopírujte hodnotu (zobrazí se pouze jednou!)

### Krok 4: Aktualizujte Environment Variables

V `.env.local` nastavte:

```env
NEXT_PUBLIC_MICROSOFT_CLIENT_ID=your_actual_client_id_here
MICROSOFT_CLIENT_SECRET=your_actual_client_secret_here
```

## 🚀 Deployment na Vercel

### Environment Variables na Vercel

1. Jděte na [Vercel Dashboard](https://vercel.com/dashboard)
2. Vyberte projekt `svatbot`
3. Jděte na **Settings > Environment Variables**
4. Přidejte všechny potřebné proměnné:

```env
# Google Calendar API
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_actual_client_id_here
GOOGLE_CLIENT_SECRET=your_actual_client_secret_here

# Microsoft Calendar API
NEXT_PUBLIC_MICROSOFT_CLIENT_ID=your_actual_client_id_here
MICROSOFT_CLIENT_SECRET=your_actual_client_secret_here

# App URL (pro production)
NEXT_PUBLIC_APP_URL=https://svatbot.cz
```

### Redirect URIs pro Production

Ujistěte se, že máte nastavené správné redirect URIs:

**Google Calendar:**
- `https://svatbot.cz/api/auth/google/callback`

**Microsoft Calendar:**
- `https://svatbot.cz/api/auth/microsoft/callback`

## 🧪 Testování

### Local Development

1. Nastavte environment variables v `.env.local`
2. Spusťte `npm run dev`
3. Jděte na `http://localhost:3000/timeline`
4. Zkuste připojit Google/Microsoft Calendar

### Production Testing

1. Nasaďte na Vercel s nastavenými environment variables
2. Jděte na `https://svatbot.cz/timeline`
3. Zkuste připojit Google/Microsoft Calendar

## 🔍 Troubleshooting

### Google Calendar Issues

- **Error: "redirect_uri_mismatch"**
  - Zkontrolujte, že redirect URI v Google Cloud Console odpovídá URL v aplikaci
  
- **Error: "access_denied"**
  - Zkontrolujte, že Google Calendar API je povoleno
  - Zkontrolujte OAuth consent screen nastavení

### Microsoft Calendar Issues

- **Error: "invalid_client"**
  - Zkontrolujte Client ID a Client Secret
  - Zkontrolujte, že redirect URI je správně nastaveno

- **Error: "insufficient_scope"**
  - Zkontrolujte, že `Calendars.ReadWrite` permission je přidáno a schváleno

## 📝 Notes

- API klíče jsou citlivé informace - nikdy je necommitujte do Git
- Pro production používejte pouze HTTPS redirect URIs
- Pravidelně rotujte client secrets pro bezpečnost
- Monitorujte API usage v Google Cloud Console a Azure Portal
