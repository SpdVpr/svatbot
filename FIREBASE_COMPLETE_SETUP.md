# 🔥 Dokončení Firebase nastavení - Oprava chyb

## 🚨 **Aktuální problémy a řešení:**

### ❌ **Problém 1: Google OAuth se zasekává**
**Příčina**: Cross-Origin-Opener-Policy + Firebase není kompletně nastaven
**Řešení**: Dočasně vypnuto, dokud nedokončíme Firebase setup

### ❌ **Problém 2: Firestore 400 chyby**
**Příčina**: Firestore databáze není vytvořena
**Řešení**: Musíte vytvořit databázi v Firebase Console

### ❌ **Problém 3: 404 chyby na ikony**
**Příčina**: Chybějící favicon soubory
**Řešení**: Přidány placeholder soubory

---

## 🔧 **NUTNÉ kroky pro opravu (5 minut):**

### **1. Dokončení Firebase Console nastavení**

#### **A) Povolení Authentication**
```bash
# Otevřete: https://console.firebase.google.com/project/svatbot-app/authentication
```

**Kroky:**
1. Klikněte **"Authentication"** v levém menu
2. Klikněte **"Get started"**
3. Přejděte na záložku **"Sign-in method"**
4. **Email/Password**:
   - Klikněte na řádek "Email/Password"
   - ✅ Zapněte první přepínač "Email/Password"
   - Klikněte "Save"

#### **B) Vytvoření Firestore Database**
```bash
# Otevřete: https://console.firebase.google.com/project/svatbot-app/firestore
```

**Kroky:**
1. Klikněte **"Firestore Database"** v levém menu
2. Klikněte **"Create database"**
3. **Security rules**: Vyberte **"Start in test mode"**
4. **Location**: Vyberte **"europe-west3 (Frankfurt)"**
5. Klikněte **"Done"**
6. Počkejte na vytvoření databáze (1-2 minuty)

---

## 🧪 **Test po opravě:**

### **1. Restart aplikace**
```bash
# V terminálu zastavte server (Ctrl+C)
npm run dev
```

### **2. Test Email/Password registrace**
1. **Otevřete**: http://localhost:3000
2. **Klikněte**: "Začít plánování"
3. **Vyplňte formulář**:
   - Jméno: Test
   - Příjmení: User
   - Email: test@example.com
   - Heslo: test123
   - ✅ Souhlas s podmínkami
4. **Klikněte**: "Vytvořit účet"

### **3. Očekávané výsledky**
- ✅ Registrace proběhne úspěšně
- ✅ Přejdete na onboarding flow
- ✅ Žádné chyby v konzoli
- ✅ Data se uloží do Firebase

---

## 🔍 **Ověření v Firebase Console:**

### **Authentication**
```bash
# Otevřete: https://console.firebase.google.com/project/svatbot-app/authentication/users
```
- Uvidíte nově registrovaného uživatele
- Email, UID, datum vytvoření

### **Firestore Database**
```bash
# Otevřete: https://console.firebase.google.com/project/svatbot-app/firestore/data
```
- **Collection `users`**: Uživatelské profily
- **Collection `weddings`**: Svatební data (po dokončení onboardingu)

---

## 🎯 **Co bude fungovat po opravě:**

### ✅ **Email/Password registrace**
- Skutečná Firebase registrace
- Trvalé ukládání do databáze
- Přihlášení/odhlášení
- Session persistence

### ✅ **Onboarding flow**
- 6-krokový setup svatby
- Ukládání do Firestore
- Progress tracking
- Real-time synchronizace

### ✅ **Dashboard**
- Zobrazení svatebních dat
- Real-time updates
- Personalizované informace

### ⚠️ **Google OAuth (dočasně vypnuto)**
- Bude aktivováno po dokončení základního nastavení
- Vyžaduje dodatečnou konfiguraci OAuth

---

## 🐛 **Troubleshooting:**

### **Stále vidíte Firestore chyby?**
1. Ověřte, že Firestore databáze je vytvořena
2. Zkontrolujte, že je v "test mode"
3. Restartujte aplikaci

### **Authentication nefunguje?**
1. Ověřte, že Email/Password je povoleno
2. Zkontrolujte Firebase config v .env.local
3. Zkuste jiný email

### **404 chyby na ikony?**
- Ignorujte je - jsou to jen placeholder soubory
- Neovlivňují funkcionalita aplikace

---

## 📞 **Potřebujete pomoc?**

### **Rychlé řešení:**
1. **Zkontrolujte Firebase Console** - Authentication a Firestore vytvořeny
2. **Restart serveru**: `Ctrl+C` → `npm run dev`
3. **Test registrace**: Použijte test@example.com

### **Status check:**
- [ ] Authentication povoleno v Firebase Console
- [ ] Firestore databáze vytvořena
- [ ] Aplikace restartována
- [ ] Test registrace úspěšný

---

**🎉 Po dokončení těchto kroků bude aplikace plně funkční s trvalým ukládáním dat!**

**Odhadovaný čas**: 5 minut
**Výsledek**: Plně funkční svatební aplikace s Firebase backend
