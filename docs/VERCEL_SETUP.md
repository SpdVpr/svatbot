# Nastavení Vercel API pro automatické subdomény

Pro automatické vytváření subdomén pro svatební weby potřebujete nakonfigurovat Vercel API.

## 🔧 Krok 1: Vytvoření Vercel API Tokenu

1. **Přihlaste se do Vercel Dashboard:**
   - Jděte na: https://vercel.com/dashboard
   - Přihlaste se do svého účtu

2. **Vytvořte API Token:**
   - Klikněte na svůj profil (vpravo nahoře)
   - Vyberte **"Settings"**
   - V levém menu klikněte na **"Tokens"**
   - Klikněte **"Create Token"**

3. **Nastavte token:**
   - **Token Name:** `SvatBot API Token`
   - **Scope:** Vyberte váš team/organizaci
   - **Expiration:** Doporučujeme 1 rok
   - Klikněte **"Create Token"**

4. **Zkopírujte token:**
   - ⚠️ **DŮLEŽITÉ:** Token se zobrazí pouze jednou!
   - Zkopírujte ho a uložte bezpečně

## 🔧 Krok 2: Konfigurace Environment Variables

1. **Upravte `.env.local` soubor:**
   ```bash
   # Vercel API Configuration
   VERCEL_API_TOKEN=vercel_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
   VERCEL_PROJECT_ID=svatbot
   ```

2. **Nahraďte hodnoty:**
   - `VERCEL_API_TOKEN`: Váš skutečný token z kroku 1
   - `VERCEL_PROJECT_ID`: ID vašeho Vercel projektu (obvykle `svatbot`)

## 🔧 Krok 3: Konfigurace DNS (Wildcard subdomain)

Pro automatické subdomény potřebujete wildcard DNS záznam:

### **V Vercel Dashboard:**
1. **Jděte do Settings → Domains**
2. **Přidejte wildcard doménu:**
   - Klikněte **"Add Domain"**
   - Zadejte: `*.svatbot.cz`
   - Klikněte **"Add"**

### **V DNS nastavení (u registrátora):**
```
Type: CNAME
Name: *
Value: cname.vercel-dns.com
TTL: 60
```

## 🧪 Testování

Po konfiguraci můžete testovat:

1. **Vytvořte svatební web** v aplikaci
2. **Nastavte custom URL** (např. `anna-michal`)
3. **Publikujte web**
4. **Zkontrolujte:**
   - Web by měl být dostupný na: `https://anna-michal.svatbot.cz/`
   - V Vercel Dashboard by se měla objevit nová doména

## 🔍 Troubleshooting

### **Chyba: "Vercel API token not configured"**
- Zkontrolujte, že máte správně nastavený `VERCEL_API_TOKEN` v `.env.local`
- Restartujte development server: `npm run dev`

### **Chyba: "Failed to add domain to Vercel project"**
- Zkontrolujte, že token má správná oprávnění
- Zkontrolujte, že `VERCEL_PROJECT_ID` odpovídá vašemu projektu

### **Subdomain nefunguje (404)**
- Zkontrolujte wildcard DNS záznam `*.svatbot.cz`
- Počkejte 5-60 minut na DNS propagaci
- Zkuste nejdříve: `https://svatbot.cz/wedding/anna-michal`

### **Domain už existuje**
- To je v pořádku! API automaticky detekuje existující domény
- Web by měl fungovat normálně

## 🚀 Produkční nasazení

Pro produkci přidejte environment variables do Vercel:

1. **V Vercel Dashboard:**
   - Jděte do **Settings → Environment Variables**
   - Přidejte:
     ```
     VERCEL_API_TOKEN = your_token_here
     VERCEL_PROJECT_ID = svatbot
     ```

2. **Redeploy aplikaci** po přidání variables

## 🔒 Bezpečnost

- **Nikdy nesdílejte** Vercel API token
- **Nastavte expiraci** tokenu (doporučujeme 1 rok)
- **Používejte pouze HTTPS** pro API calls
- **Monitorujte použití** tokenu v Vercel Dashboard

## 📚 Další informace

- [Vercel API Documentation](https://vercel.com/docs/rest-api)
- [Vercel Domains API](https://vercel.com/docs/rest-api/reference/endpoints/projects/add-a-domain-to-a-project)
- [Vercel Multi-tenant Apps](https://vercel.com/docs/multi-tenant)
