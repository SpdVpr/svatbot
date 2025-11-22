# Google Places Integrace - Deployment Guide

## ✅ Co bylo implementováno

### 1. Frontend komponenty
- ✅ `GoogleReviewCard` - komponenta pro zobrazení Google recenzí
- ✅ Rozšířený `VendorCard` - zobrazuje SvatBot + Google rating
- ✅ Upravená vendor detail stránka - sekce s Google recenzemi
- ✅ Registrační formulář - input pro Google Place ID/URL

### 2. Backend (Firebase Functions)
- ✅ `updateGoogleRatings` - scheduled function (denní update)
- ✅ `refreshGoogleRating` - callable function (manuální refresh)
- ✅ API endpoint `/api/google-places/details` - fetch Google data

### 3. Utility funkce
- ✅ `src/utils/googlePlaces.ts` - helper funkce pro práci s Google Places API

### 4. Admin dashboard
- ✅ Tlačítko pro manuální refresh Google dat v admin vendors page
- ✅ Rate limiting (max 1 refresh per 24 hours)

### 5. Dokumentace
- ✅ `docs/google-places-integration.md` - návod pro dodavatele
- ✅ `docs/google-places-deployment.md` - tento soubor

---

## 🚀 Deployment kroky

### Krok 1: Získat Google Places API klíč

1. Otevřete [Google Cloud Console](https://console.cloud.google.com/)
2. Vyberte projekt `svatbot-app` (nebo vytvořte nový)
3. Zapněte **Places API**:
   - Navigation menu → APIs & Services → Library
   - Vyhledejte "Places API"
   - Klikněte "Enable"

4. Vytvořte API klíč:
   - Navigation menu → APIs & Services → Credentials
   - Klikněte "Create Credentials" → "API Key"
   - Zkopírujte API klíč

5. Zabezpečte API klíč (DŮLEŽITÉ!):
   - Klikněte na API klíč → "Edit API key"
   - Application restrictions: HTTP referrers
   - Přidejte: `svatbot.cz/*`, `*.svatbot.cz/*`, `localhost/*`
   - API restrictions: Restrict key → Places API
   - Uložte

---

### Krok 2: Nastavit environment variables

#### Pro Next.js (Vercel):

1. Otevřete [Vercel Dashboard](https://vercel.com/dashboard)
2. Vyberte projekt `svatbot`
3. Settings → Environment Variables
4. Přidejte:
   ```
   GOOGLE_PLACES_API_KEY=your_api_key_here
   ```
5. Redeploy aplikaci

#### Pro Firebase Functions:

```bash
# V terminálu (v root složce projektu)
cd functions
firebase functions:config:set google.places_api_key="your_api_key_here"
```

---

### Krok 3: Deploy Firebase Functions

```bash
# Build functions
cd functions
npm run build

# Deploy všechny functions
firebase deploy --only functions

# Nebo deploy jen Google-related functions
firebase deploy --only functions:updateGoogleRatings,functions:refreshGoogleRating
```

---

### Krok 4: Testování

#### Test 1: Registrace dodavatele s Google Place ID

1. Otevřete `/marketplace/register`
2. Vyplňte formulář
3. V sekci "Google hodnocení" zadejte:
   - Google Maps URL: `https://maps.google.com/?cid=123456789`
   - NEBO Google Place ID: `ChIJN1t_tDeuEmsRUsoyG83frY4`
4. Odešlete formulář
5. Zkontrolujte Firestore - vendor by měl mít `google.placeId`

#### Test 2: Manuální refresh (Admin)

1. Přihlaste se jako admin
2. Otevřete `/admin/vendors`
3. Najděte dodavatele s Google Place ID
4. Klikněte na zelené tlačítko "Refresh" (🔄)
5. Měla by se zobrazit hláška s aktualizovaným ratingem

#### Test 3: Automatický scheduled update

```bash
# Spusťte manuálně (pro test)
firebase functions:shell

# V shellu:
updateGoogleRatings()
```

Nebo počkejte do 3:00 ráno (Europe/Prague) - funkce se spustí automaticky.

#### Test 4: Zobrazení na marketplace

1. Otevřete `/marketplace`
2. Najděte dodavatele s Google hodnocením
3. Měli byste vidět:
   - ⭐ 4.9 (15 SvatBot recenzí)
   - 🌐 4.8 (127 Google recenzí)

4. Klikněte na dodavatele
5. Na detailu by měly být 2 sekce:
   - SvatBot recenze
   - Google recenze (5 nejnovějších)

---

## 📊 Monitoring

### Firebase Console

1. Otevřete [Firebase Console](https://console.firebase.google.com/)
2. Vyberte projekt `svatbot-app`
3. Functions → Logs
4. Filtrujte: `updateGoogleRatings` nebo `refreshGoogleRating`

### Google Cloud Console

1. Otevřete [Google Cloud Console](https://console.cloud.google.com/)
2. APIs & Services → Dashboard
3. Sledujte:
   - Places API requests (mělo by být < 11,700/měsíc)
   - Errors (mělo by být 0)

---

## 💰 Náklady

### Free Tier (aktuální)
- **Limit:** 11,700 requestů/měsíc ZDARMA ($200 kredit)
- **Naše spotřeba:** ~3,000 requestů/měsíc (100 dodavatelů × 1× denně)
- **Náklady:** $0/měsíc ✅

### Pokud překročíme free tier
- **Cena:** $17 za 1,000 requestů (Basic Data)
- **Příklad:** 30,000 requestů/měsíc = $311/měsíc

### Optimalizace nákladů
- Aktualizovat jen aktivní dodavatele
- Premium dodavatelé = denní update
- Free dodavatelé = týdenní update
- Neaktivní dodavatelé = měsíční update

---

## 🐛 Troubleshooting

### Problém: "Google Places API key not configured"

**Řešení:**
```bash
# Zkontrolujte config
firebase functions:config:get

# Mělo by vrátit:
{
  "google": {
    "places_api_key": "your_key"
  }
}

# Pokud ne, nastavte:
firebase functions:config:set google.places_api_key="your_key"
firebase deploy --only functions
```

### Problém: "resource-exhausted" (rate limit)

**Příčina:** Vendor byl aktualizován < 24 hodin

**Řešení:** Počkejte 24 hodin nebo upravte rate limit v `refreshGoogleRating.ts`

### Problém: "failed-precondition" (invalid Place ID)

**Příčina:** Place ID není validní (neobsahuje "ChIJ")

**Řešení:**
1. Otevřete admin vendors page
2. Editujte dodavatele
3. Opravte Google Place ID
4. Zkuste refresh znovu

---

## 📝 Další kroky (volitelné)

### 1. Email notifikace pro adminy
- Když scheduled function selže
- Když vendor má nevalidní Place ID

### 2. Dashboard statistiky
- Kolik vendors má Google hodnocení
- Průměrný Google rating
- Poslední update timestamp

### 3. Vendor dashboard
- Vendor může vidět své Google hodnocení
- Vendor může požádat o manuální refresh (1× týdně)

### 4. A/B testing
- Porovnat konverzi vendors s/bez Google hodnocení
- Optimalizovat zobrazení

---

## ✅ Checklist před production

- [ ] Google Places API klíč vytvořen a zabezpečen
- [ ] Environment variables nastaveny (Vercel + Firebase)
- [ ] Firebase Functions deploynuty
- [ ] Testováno: registrace s Google Place ID
- [ ] Testováno: manuální refresh (admin)
- [ ] Testováno: zobrazení na marketplace
- [ ] Testováno: zobrazení na vendor detail
- [ ] Monitoring nastaven (Firebase + Google Cloud)
- [ ] Dokumentace sdílena s dodavateli
- [ ] Náklady monitorovány

---

## 📞 Kontakt

Pokud máte problémy s nasazením, kontaktujte:
- **Email:** support@svatbot.cz
- **Discord:** #tech-support
- **GitHub Issues:** https://github.com/SpdVpr/svatbot/issues

