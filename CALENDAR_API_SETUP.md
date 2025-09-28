# Nastavení Calendar API pro SvatBot

Tento dokument popisuje, jak nastavit Google Calendar API pro funkční synchronizaci kalendářů a jak používat Apple Calendar (.ics) export.

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

## 📱 Apple Calendar (.ics Export)

Apple Calendar integrace funguje pomocí univerzálního .ics formátu, který je kompatibilní s:

- **Apple Calendar** (iPhone, iPad, Mac)
- **Google Calendar** (import .ics souborů)
- **Microsoft Outlook** (všechny platformy)
- **Ostatní kalendářové aplikace**

### Jak používat:

1. Jděte na `/timeline` stránku
2. V sekci "Apple Calendar" klikněte na **"Stáhnout do Apple Calendar"**
3. Stáhne se .ics soubor s všemi milníky
4. Otevřete soubor - automaticky se přidá do vašeho kalendáře

### Výhody .ics exportu:

- ✅ **Žádné API klíče** - funguje okamžitě
- ✅ **Univerzální kompatibilita** - funguje se všemi kalendáři
- ✅ **Bezpečné** - žádné přihlašování nebo oprávnění
- ✅ **Offline** - soubor můžete uložit a použít později

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

# App URL (pro production)
NEXT_PUBLIC_APP_URL=https://svatbot.cz
```

### Redirect URIs pro Production

Ujistěte se, že máte nastavené správné redirect URIs:

**Google Calendar:**
- `https://svatbot.cz/api/auth/google/callback`

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

### Apple Calendar (.ics) Issues

- **Soubor se nestáhne**
  - Zkontrolujte, že máte vytvořené milníky v timeline
  - Zkontrolujte blokování pop-up oken v prohlížeči

- **Soubor se neotevře automaticky**
  - Ručně otevřete stažený .ics soubor
  - Nebo importujte soubor přímo v kalendářové aplikaci

## 📝 Notes

- API klíče jsou citlivé informace - nikdy je necommitujte do Git
- Pro production používejte pouze HTTPS redirect URIs
- Pravidelně rotujte client secrets pro bezpečnost
- Monitorujte API usage v Google Cloud Console a Azure Portal
