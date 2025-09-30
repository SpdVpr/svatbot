# 🎵 Spotify Integration Setup

## ✅ Hotovo - Lokální development

Spotify credentials jsou přidány do `.env.local` a fungují lokálně.

---

## 🚀 Potřeba - Nastavení na Vercel (produkce)

Pro fungování Spotify integrace na **svatbot.cz** musíš přidat environment variables do Vercel:

### Krok 1: Jdi do Vercel Dashboard

1. Otevři: https://vercel.com/dashboard
2. Vyber projekt: **svatbot**
3. Jdi na: **Settings** → **Environment Variables**

### Krok 2: Přidej tyto 2 proměnné

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `SPOTIFY_CLIENT_ID` | `261d3fd72a87415fa161d342197e2e4e` | Production, Preview, Development |
| `SPOTIFY_CLIENT_SECRET` | `d0223aca54d0461e928b946730f354ca` | Production, Preview, Development |

**Pro každou proměnnou:**
1. Klikni **"Add New"**
2. Zadej **Name** (např. `SPOTIFY_CLIENT_ID`)
3. Zadej **Value** (např. `261d3fd72a87415fa161d342197e2e4e`)
4. Vyber všechny 3 environments: ✅ Production, ✅ Preview, ✅ Development
5. Klikni **"Save"**

### Krok 3: Redeploy aplikace

Po přidání proměnných:
1. Jdi na **Deployments** tab
2. Najdi poslední deployment
3. Klikni na **"..."** (tři tečky)
4. Vyber **"Redeploy"**
5. Potvrď **"Redeploy"**

**NEBO** prostě pushni nový commit do GitHubu a Vercel automaticky redeploy.

---

## 🧪 Testování

Po redeployi otestuj na **https://svatbot.cz/music**:

1. ✅ Klikni na "Přidat" u jakékoliv kategorie
2. ✅ Mělo by se objevit Spotify vyhledávání
3. ✅ Zadej název písně (např. "Perfect Ed Sheeran")
4. ✅ Měly by se zobrazit výsledky z Spotify
5. ✅ Klikni na ▶️ pro přehrání 30s ukázky
6. ✅ Klikni na ➕ pro přidání do playlistu

---

## 🔒 Bezpečnost

- ✅ **Client Secret** je v `.env.local` - tento soubor je v `.gitignore` a není v Gitu
- ✅ **API route** (`/api/spotify/token`) běží pouze na serveru
- ✅ **Client Secret** nikdy není odeslán do browseru
- ✅ Pouze **access token** je poslán do browseru (ten je dočasný a bezpečný)

---

## 📊 Spotify API Limity

- **Vyhledávání:** Prakticky neomezené
- **Přehrávání ukázek:** 30 sekund na píseň (Spotify standard)
- **Rate limit:** ~180 requestů/minutu (více než dost)
- **Cena:** Zdarma ✅

---

## 🎯 Co funguje

Po správném nastavení:

- 🔍 **Vyhledávání** - Vyhledávání v celém Spotify katalogu
- ▶️ **Přehrávání** - 30s ukázky přímo v aplikaci
- 🎵 **Automatické doplnění** - Název, interpret, album cover, délka
- 🔗 **Spotify linky** - Přímé odkazy na Spotify
- 💾 **Uložení** - Všechny údaje se ukládají do playlistu

---

## ❓ Troubleshooting

### Problém: "Spotify API not configured"
- **Řešení:** Zkontroluj, že jsou environment variables správně nastaveny ve Vercel
- **Řešení:** Udělej redeploy po přidání proměnných

### Problém: "Failed to get Spotify token"
- **Řešení:** Zkontroluj, že Client ID a Secret jsou správně zkopírované (bez mezer)
- **Řešení:** Zkontroluj, že Spotify App je v "Development mode" (to je OK)

### Problém: Vyhledávání nefunguje
- **Řešení:** Otevři Developer Console (F12) a podívej se na chyby
- **Řešení:** Zkontroluj Network tab - měl by být request na `/api/spotify/token`

---

## 📝 Poznámky

- **Development mode** v Spotify App je OK - není potřeba schvalování od Spotify
- **Quota:** Spotify neomezuje počet requestů pro tento typ použití
- **Ukázky:** Ne všechny písně mají 30s ukázku (záleží na vydavateli)
- **Regiony:** Některé písně mohou být nedostupné v ČR (vzácné)

---

Jakmile přidáš proměnné do Vercel a uděláš redeploy, Spotify integrace bude plně funkční! 🎉

