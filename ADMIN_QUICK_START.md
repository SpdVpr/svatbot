# Admin Dashboard - Quick Start Guide

## 🚀 Rychlé Spuštění (5 minut)

### 1. Deploy Firebase Rules & Indexes

```bash
# Přihlásit se
firebase login

# Vybrat projekt
firebase use svatbot-app

# Deploy vše najednou
firebase deploy --only firestore:rules,firestore:indexes
```

⏱️ **Čas**: ~2 minuty (+ 5-10 minut na vytvoření indexů)

### 2. Nastavit Prvního Admina

**Nejrychlejší způsob** - Pomocí Firebase Console:

1. Otevřít: https://console.firebase.google.com/project/svatbot-app/authentication/users
2. Najít svůj účet (nebo vytvořit nový)
3. Zkopírovat UID
4. Otevřít Firestore Database
5. Vytvořit nový dokument:
   - Collection: `adminUsers`
   - Document ID: `[UID z kroku 3]`
   - Fields:
     ```json
     {
       "email": "admin@svatbot.cz",
       "name": "Admin SvatBot",
       "role": "super_admin",
       "isActive": true,
       "createdAt": [current timestamp]
     }
     ```

6. V Authentication → Users → [váš uživatel] → Custom claims:
   ```json
   {
     "role": "super_admin"
   }
   ```

⏱️ **Čas**: ~2 minuty

### 3. Otestovat Přístup

1. Otevřít: https://svatbot.cz/admin/login
2. Přihlásit se
3. Otevřít: https://svatbot.cz/admin/analytics
4. Měli byste vidět admin dashboard ✅

⏱️ **Čas**: ~1 minuta

---

## 📱 Použití

### Pro Adminy

**Přístup k dashboardu:**
```
URL: /admin/analytics
Login: /admin/login
```

**Hlavní funkce:**
- 📊 **Přehled**: Statistiky, aktivní uživatelé, příjmy
- 👥 **Uživatelé**: Real-time analytics, export CSV
- 💬 **Zprávy**: Chat s uživateli
- 📝 **Feedback**: Správa feedbacku a bug reportů
- 💰 **Finance**: Platby a předplatná (připraveno)
- 📈 **Affiliate**: Affiliate program (připraveno)

### Pro Uživatele

**Feedback Button:**
- Automaticky se zobrazuje v pravém dolním rohu
- Kliknutím otevřete formulář
- Vyberte typ: Bug 🐛, Nápad 💡, Zlepšení 📈, Jiné 💬
- Napište zprávu a odešlete

**User Tracking:**
- Automaticky aktivní pro přihlášené uživatele
- Sleduje: čas v aplikaci, navštívené stránky, online status
- Žádná akce od uživatele není potřeba

---

## 🎯 Nejčastější Úkoly

### Odpovědět na zprávu od uživatele

1. Přihlásit se jako admin
2. Otevřít záložku **Zprávy**
3. Kliknout na konverzaci
4. Napsat odpověď a odeslat
5. (Volitelně) Uzavřít konverzaci

### Vyřešit feedback

1. Přihlásit se jako admin
2. Otevřít záložku **Feedback**
3. Kliknout na feedback item
4. Přidat admin poznámku
5. Změnit status na "Vyřešené"

### Exportovat uživatelská data

1. Přihlásit se jako admin
2. Otevřít záložku **Uživatelé**
3. (Volitelně) Použít filtry
4. Kliknout na **Export CSV**
5. Soubor se stáhne automaticky

### Přidat nového admina

1. Uživatel se musí nejdřív zaregistrovat
2. Zkopírovat jeho UID z Firebase Authentication
3. Použít Cloud Function nebo Admin SDK:

```javascript
// V Firebase Console → Functions → setAdminRole
{
  "userId": "USER_UID",
  "role": "admin"  // nebo "super_admin"
}
```

---

## 🔍 Monitoring

### Denní Check

- [ ] Zkontrolovat otevřené konverzace (Zprávy)
- [ ] Zkontrolovat nový feedback (Feedback)
- [ ] Zkontrolovat počet online uživatelů (Přehled)
- [ ] Zkontrolovat nové registrace (Uživatelé)

### Týdenní Check

- [ ] Analyzovat user engagement (průměrný čas, sessions)
- [ ] Zkontrolovat churn rate
- [ ] Vyřešit všechny high priority feedbacky
- [ ] Exportovat a archivovat data

---

## 🆘 Rychlá Pomoc

### Problém: Nemám přístup k admin dashboardu

**Řešení:**
```bash
# 1. Zkontrolovat custom claims
# V browser console:
firebase.auth().currentUser.getIdTokenResult()
  .then(token => console.log(token.claims))

# 2. Pokud není role, nastavit ji
# 3. Odhlásit se a znovu přihlásit
```

### Problém: User tracking nefunguje

**Řešení:**
1. Zkontrolovat browser console
2. Ověřit, že uživatel je přihlášen
3. Počkat 1-2 minuty (data se ukládají každých 30 sekund)
4. Refresh admin dashboard

### Problém: Feedback button se nezobrazuje

**Řešení:**
1. Zkontrolovat, že uživatel je přihlášen
2. Zkontrolovat browser console pro chyby
3. Ověřit, že `FeedbackButton` je v layout

---

## 📚 Další Dokumentace

- **Kompletní Setup**: `ADMIN_DASHBOARD_SETUP.md`
- **Deployment Checklist**: `DEPLOYMENT_CHECKLIST.md`
- **Firebase Setup**: `FIREBASE_SETUP.md`

---

## 🎉 Hotovo!

Admin dashboard je nyní plně funkční a připravený k použití.

**Co dál?**
- Implementovat Finance module (Stripe integration)
- Implementovat Affiliate program
- Přidat grafy a vizualizace
- Rozšířit analytics o custom reports

---

**Vytvořeno**: 2025-10-20  
**Verze**: 1.0.0  
**Status**: ✅ Production Ready

