# 🚀 Automatické subdomény pro svatební weby

Implementoval jsem **automatické vytváření subdomén** pomocí Vercel API. Uživatelé si nyní mohou vytvořit svatební web a automaticky dostanou vlastní subdoménu bez manuálního zásahu.

## ✅ **CO JSEM IMPLEMENTOVAL:**

### **🔧 API Endpointy:**
- **`/api/vercel/add-domain`** - Přidání subdomény do Vercel projektu
- **`/api/vercel/remove-domain`** - Odebrání subdomény z Vercel projektu  
- **`/api/vercel/check-domain`** - Kontrola stavu subdomény

### **⚡ Automatické publikování:**
- **Při publikování webu** se automaticky přidá subdoména do Vercel
- **Při zrušení publikování** se automaticky odebere subdoména z Vercel
- **Graceful error handling** - pokud API selže, web se publikuje bez subdomény

### **📊 Domain Status komponent:**
- **Real-time kontrola** stavu subdomény
- **Vizuální indikátory** - aktivní/čeká na ověření/chyba
- **Přímý odkaz** na publikovaný web
- **Refresh tlačítko** pro aktualizaci stavu

---

## 🔧 **NASTAVENÍ PRO PRODUKCI:**

### **Krok 1: Získání Vercel API Tokenu**

1. **Jděte na:** https://vercel.com/account/tokens
2. **Vytvořte nový token:**
   - Name: `SvatBot API Token`
   - Scope: Váš team/organizace
   - Expiration: 1 rok
3. **Zkopírujte token** (zobrazí se pouze jednou!)

### **Krok 2: Nastavení Environment Variables**

**V `.env.local` (development):**
```bash
VERCEL_API_TOKEN=vercel_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
VERCEL_PROJECT_ID=svatbot
```

**V Vercel Dashboard (production):**
1. Settings → Environment Variables
2. Přidejte:
   - `VERCEL_API_TOKEN` = váš token
   - `VERCEL_PROJECT_ID` = `svatbot`
3. Redeploy aplikaci

### **Krok 3: DNS konfigurace (už máte)**
```
Type: CNAME
Name: *
Value: d553fbd48dbe1991.vercel-dns-017.com
TTL: 60
```

---

## 🎯 **JAK TO FUNGUJE:**

### **Workflow pro uživatele:**
```
1. Uživatel vytvoří svatební web
2. Nastaví custom URL (např. "anna-michal")
3. Klikne "Publikovat"
4. Automaticky se:
   - Přidá subdoména do Vercel projektu
   - Publikuje web v databázi
   - Zobrazí stav domény
5. Web je dostupný na: anna-michal.svatbot.cz
```

### **Technické detaily:**
```typescript
// Při publikování
publishWebsite() {
  // 1. Přidá subdoménu do Vercel
  await fetch('/api/vercel/add-domain', {
    body: JSON.stringify({ subdomain: 'anna-michal' })
  })
  
  // 2. Publikuje v databázi
  await updateDoc(docRef, { isPublished: true })
}
```

---

## 🧪 **TESTOVÁNÍ:**

### **Před testováním:**
1. ✅ **Nastavte VERCEL_API_TOKEN** v `.env.local`
2. ✅ **Restartujte development server**
3. ✅ **Zkontrolujte DNS záznamy** (wildcard `*.svatbot.cz`)

### **Test scenario:**
```
1. Jděte na: http://localhost:3002/wedding-website/builder
2. Vytvořte nový web s custom URL
3. Publikujte web
4. Zkontrolujte Domain Status panel
5. Otestujte subdomain URL
```

---

## 🔍 **TROUBLESHOOTING:**

### **"Vercel API token not configured"**
- Zkontrolujte `.env.local` soubor
- Restartujte `npm run dev`
- Zkontrolujte, že token začína `vercel_`

### **"Failed to add domain to Vercel project"**
- Zkontrolujte oprávnění tokenu
- Zkontrolujte `VERCEL_PROJECT_ID`
- Zkontrolujte Vercel Dashboard → Settings → Domains

### **Subdomain nefunguje (404)**
- Počkejte 5-60 minut na DNS propagaci
- Zkuste refresh v Domain Status panelu
- Zkontrolujte wildcard DNS záznam

### **Domain už existuje**
- To je normální! API to detekuje automaticky
- Web by měl fungovat bez problémů

---

## 🚀 **VÝHODY ŘEŠENÍ:**

### **Pro uživatele:**
- ✅ **Automatické subdomény** - žádné čekání na administrátora
- ✅ **Okamžité publikování** - web je dostupný během minut
- ✅ **Vlastní URL** - profesionální vzhled
- ✅ **Real-time status** - vidí stav své domény

### **Pro provozovatele:**
- ✅ **Žádná manuální práce** - vše automatické
- ✅ **Škálovatelné řešení** - zvládne tisíce uživatelů
- ✅ **Graceful degradation** - funguje i při výpadku API
- ✅ **Monitoring** - vidíte stav všech domén

### **Technické:**
- ✅ **RESTful API** - standardní HTTP endpointy
- ✅ **Error handling** - robustní zpracování chyb
- ✅ **TypeScript** - type safety
- ✅ **Real-time updates** - okamžité zobrazení změn

---

## 📚 **DALŠÍ KROKY:**

1. **Nastavte produkční token** v Vercel Dashboard
2. **Otestujte na staging** prostředí
3. **Monitorujte API usage** v Vercel Dashboard
4. **Dokumentujte pro uživatele** - jak používat custom URL

**Nyní máte plně automatický systém pro správu subdomén! 🎉**

---

## 📖 **Dokumentace:**

- **Detailní setup:** `docs/VERCEL_SETUP.md`
- **API Reference:** Vercel REST API docs
- **Troubleshooting:** Tento soubor, sekce Troubleshooting
