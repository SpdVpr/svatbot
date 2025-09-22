# 🎭 SvatBot.cz - Demo Funkcionalita

## 🚀 **Přehled Demo Funkcionality**

Demo funkcionalita umožňuje uživatelům okamžitě vyzkoušet všechny funkce aplikace bez nutnosti registrace. Demo účet obsahuje předvyplněná realistická data pro kompletní zážitek.

---

## 🎯 **Jak Demo Funguje**

### **1. Přístup k Demo**

**Způsob 1: Tlačítko "Prohlédnout demo" na hlavní stránce**
- Klikněte na tlačítko "Prohlédnout demo" 
- Automaticky se přihlásíte jako demo uživatel
- Přesměrování na dashboard s demo daty

**Způsob 2: Přes přihlašovací modal**
- Klikněte "Přihlásit se" nebo "Začít plánování"
- V modalu klikněte "Vyzkoušet demo účet"
- Automatické vyplnění demo údajů a přihlášení

### **2. Demo Údaje**
```
Email: demo@svatbot.cz
Heslo: demo123
Uživatel: Demo Uživatel
```

---

## 📊 **Demo Data Přehled**

### **🏰 Demo Svatba**
- **Snoubenec**: Jana & Petr
- **Datum**: 180 dní od aktuálního data
- **Hosté**: 85 pozvaných
- **Rozpočet**: 450.000 Kč
- **Styl**: Klasicky elegantní
- **Region**: Praha
- **Celkový pokrok**: 73%

### **📝 Demo Úkoly (5 úkolů)**
1. **Rezervovat místo konání** ✅ (Dokončeno)
   - Kategorie: Místo konání
   - Priorita: Vysoká
   - Dokončeno před 25 dny

2. **Objednat svatební fotografa** 🔄 (Probíhá)
   - Kategorie: Fotografie
   - Priorita: Vysoká
   - Termín: za 14 dní

3. **Vybrat svatební šaty** ⏳ (Čeká)
   - Kategorie: Design
   - Priorita: Střední
   - Termín: za 30 dní

4. **Rezervovat hudbu/DJ** ⏳ (Čeká)
   - Kategorie: Zábava
   - Priorita: Vysoká
   - Termín: za 45 dní

5. **Objednat svatební dort** ✅ (Dokončeno)
   - Kategorie: Catering
   - Priorita: Střední
   - Dokončeno před 8 dny

### **👥 Demo Hosté (4 hosté)**
1. **Marie Nováková** ✅ (Potvrzeno)
   - Kategorie: Rodina nevěsty
   - Email: marie.novakova@email.cz
   - Bez plus one

2. **Pavel Svoboda** ✅ (Potvrzeno)
   - Kategorie: Přátelé ženicha
   - Email: pavel.svoboda@email.cz
   - S plus one: Tereza Svobodová
   - Dietní omezení: Vegetariánská strava

3. **Anna Procházková** ⏳ (Čeká na odpověď)
   - Kategorie: Rodina nevěsty
   - Email: anna.prochazka@email.cz

4. **Tomáš Dvořák** ❌ (Odmítl)
   - Kategorie: Kolegové ženicha
   - Email: tomas.dvorak@email.cz

### **📈 Demo Statistiky**
- **Celkový pokrok**: 73%
- **Dokončené úkoly**: 2/5 (40%)
- **Potvrzení hostů**: 2 potvrzeno, 1 čeká, 1 odmítl
- **Rozpočet**: Využito cca 65%
- **Dní do svatby**: 180

---

## 🔧 **Technická Implementace**

### **Demo Detekce**
Systém rozpozná demo uživatele podle:
```javascript
const isDemoUser = user?.id === 'demo-user-id' || 
                   user?.email === 'demo@svatbot.cz' || 
                   wedding.id === 'demo-wedding'
```

### **Demo Data Lokace**
- **Uživatel**: `src/hooks/useAuth.ts` (řádek 134-150)
- **Svatba**: `src/components/dashboard/Dashboard.tsx` (řádek 26-49)
- **Úkoly**: `src/hooks/useTask.ts` (řádek 390-470)
- **Hosté**: `src/hooks/useGuest.ts` (řádek 424-519)

### **Fallback Logika**
- Demo funguje i bez Firebase připojení
- Automatické přepnutí na localStorage při nedostupnosti Firestore
- Graceful degradation pro všechny funkce

---

## 🎨 **UI/UX Funkce**

### **Demo Tlačítka**
- **Hlavní stránka**: "Prohlédnout demo" s Sparkles ikonou
- **Auth Modal**: "Vyzkoušet demo účet" s Play ikonou a speciálním stylem

### **Loading States**
- Zobrazení "Načítání demo..." během přihlašování
- Smooth animace a přechody
- Vizuální feedback pro uživatele

### **Demo Indikátory**
- Console logy s 🎭 emoji pro demo operace
- Rozlišení demo dat od produkčních dat
- Debug informace pro vývojáře

---

## 🧪 **Testování Demo**

### **Testovací Scénáře**
1. **Základní Flow**
   - Otevřít hlavní stránku
   - Kliknout "Prohlédnout demo"
   - Ověřit přesměrování na dashboard
   - Zkontrolovat načtení demo dat

2. **Modal Flow**
   - Kliknout "Přihlásit se"
   - Kliknout "Vyzkoušet demo účet"
   - Ověřit automatické vyplnění údajů
   - Ověřit úspěšné přihlášení

3. **Data Integrity**
   - Zkontrolovat všechny demo úkoly
   - Ověřit demo hosty a jejich stavy
   - Potvrdit správné statistiky
   - Testovat responsive design

### **Očekávané Výsledky**
- ✅ Okamžité přihlášení bez registrace
- ✅ Kompletní demo data ve všech modulech
- ✅ Funkční dashboard s realistickými daty
- ✅ Správné statistiky a progress tracking
- ✅ Responsive design na všech zařízeních

---

## 🚀 **Produkční Nasazení**

### **Firebase Setup (Volitelné)**
Pro plnou funkcionalitu můžete vytvořit demo účet v Firebase:
```bash
node scripts/create-demo-account.js
```

### **Environment Variables**
```env
NEXT_PUBLIC_DEMO_ENABLED=true
NEXT_PUBLIC_DEMO_EMAIL=demo@svatbot.cz
NEXT_PUBLIC_DEMO_PASSWORD=demo123
```

### **Monitoring**
- Demo přihlášení jsou logovány s 🎭 emoji
- Tracking demo usage pro analytics
- Separace demo dat od produkčních dat

---

## 📞 **Podpora**

### **Časté Problémy**
1. **Demo se nenačítá**: Zkontrolujte console pro chyby
2. **Prázdný dashboard**: Ověřte detekci demo uživatele
3. **Chybějící data**: Zkontrolujte demo data v hooks

### **Debug Tipy**
- Otevřete Developer Tools (F12)
- Sledujte console logy s 🎭 emoji
- Zkontrolujte Network tab pro API calls
- Ověřte localStorage pro fallback data

---

**🎉 Demo funkcionalita je připravena k použití!**

**Tip**: Demo poskytuje kompletní zážitek bez nutnosti registrace a je ideální pro prezentace a testování funkcionalit.
