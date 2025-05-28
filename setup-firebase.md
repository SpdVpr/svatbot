# 🔥 Rychlé nastavení Firebase pro SvatBot.cz

## 📋 **Krok za krokem (5 minut)**

### **1. Vytvoření Firebase projektu**

1. **Otevřete**: [Firebase Console](https://console.firebase.google.com/)
2. **Klikněte**: "Create a project"
3. **Název projektu**: `svatbot-app` (nebo jiný název)
4. **Google Analytics**: Povolte (doporučeno)
5. **Klikněte**: "Create project"

### **2. Nastavení Authentication**

```bash
# V Firebase Console:
Authentication > Get started > Sign-in method
```

**Povolte tyto metody:**
- ✅ **Email/Password** - klikněte "Enable"
- ✅ **Google** - klikněte "Enable" a nastavte OAuth

**Google OAuth setup:**
- Support email: Váš email
- Project public-facing name: "SvatBot.cz"
- Authorized domains: Přidejte `localhost` pro development

### **3. Vytvoření Firestore Database**

```bash
# V Firebase Console:
Firestore Database > Create database
```

**Nastavení:**
- **Security rules**: Start in **test mode** (pro development)
- **Location**: `europe-west3` (Frankfurt - nejblíže ČR)

### **4. Nastavení Storage**

```bash
# V Firebase Console:
Storage > Get started
```

**Nastavení:**
- **Security rules**: Start in **test mode**
- **Location**: `europe-west3` (Frankfurt)

### **5. Web App konfigurace**

```bash
# V Firebase Console:
Project Settings > General > Your apps > Add app > Web
```

**Kroky:**
1. **App nickname**: `SvatBot Web`
2. **Firebase Hosting**: ✅ Yes (volitelné)
3. **Zkopírujte Firebase config**

---

## 🔧 **Konfigurace aplikace**

### **Aktualizujte .env.local:**

```bash
# Nahraďte demo hodnoty skutečnými z Firebase Console
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=svatbot-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=svatbot-app
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=svatbot-app.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-ABCDEF1234

# Pro development s emulátory (volitelné)
NEXT_PUBLIC_USE_FIREBASE_EMULATORS=false
```

### **Restart aplikace:**

```bash
# Zastavte server (Ctrl+C)
# Restartujte
npm run dev
```

---

## 🎯 **Test registrace**

### **1. Otevřete aplikaci**
- URL: http://localhost:3000

### **2. Registrace nového účtu**
1. Klikněte **"Začít plánování"**
2. Vyplňte formulář:
   - **Jméno**: Vaše jméno
   - **Příjmení**: Vaše příjmení  
   - **Email**: Váš skutečný email
   - **Heslo**: Min. 6 znaků
   - **Potvrdit heslo**: Stejné heslo
   - ✅ **Souhlas s podmínkami**
3. Klikněte **"Vytvořit účet"**

### **3. Onboarding flow**
1. **Jména snoubenců** - vyplňte
2. **Datum svatby** - vyberte nebo přeskočte
3. **Počet hostů** - nastavte slider
4. **Rozpočet** - nastavte rozpočet
5. **Styl svatby** - vyberte styl
6. **Region** - vyberte město
7. **Klikněte "Dokončit"**

### **4. Dashboard**
- Uvidíte dashboard s vaší skutečnou svatbou
- Data se ukládají do Firebase Firestore
- Můžete se odhlásit a znovu přihlásit

---

## 🔍 **Ověření v Firebase Console**

### **Authentication**
```bash
Authentication > Users
```
- Uvidíte nově registrovaného uživatele
- Email, UID, datum vytvoření

### **Firestore Database**
```bash
Firestore Database > Data
```
- **Collection**: `users` - uživatelské profily
- **Collection**: `weddings` - svatební data
- Můžete prohlížet a editovat data

---

## 🚀 **Výhody skutečné Firebase registrace**

### **✅ Persistence**
- Data se ukládají trvale
- Přihlášení přetrvává mezi sessions
- Synchronizace napříč zařízeními

### **✅ Security**
- Skutečná autentifikace
- Zabezpečená databáze
- Firestore security rules

### **✅ Scalability**
- Připraveno pro produkci
- Automatické škálování
- Real-time synchronizace

### **✅ Features**
- Password reset
- Email verification
- Google OAuth
- Multi-device support

---

## 🐛 **Troubleshooting**

### **Chyba: "Firebase project not found"**
- Zkontrolujte PROJECT_ID v .env.local
- Ověřte, že projekt existuje v Firebase Console

### **Chyba: "Auth domain not authorized"**
- Přidejte `localhost` do Authorized domains
- Authentication > Settings > Authorized domains

### **Chyba: "Firestore permission denied"**
- Zkontrolujte, že Firestore je v test mode
- Nebo použijte naše security rules z `firestore.rules`

### **Chyba: "Network request failed"**
- Zkontrolujte internetové připojení
- Ověřte Firebase config v .env.local

---

## 📞 **Potřebujete pomoc?**

### **Rychlé řešení:**
1. **Zkontrolujte .env.local** - správné Firebase config
2. **Restart serveru** - `Ctrl+C` → `npm run dev`
3. **Firebase Console** - ověřte nastavení Authentication a Firestore

### **Demo fallback:**
Pokud Firebase nefunguje, aplikace automaticky použije demo data pro testování.

---

**🎉 Po nastavení budete mít plně funkční svatební aplikaci s skutečnou registrací!**
