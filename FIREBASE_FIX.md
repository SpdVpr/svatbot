# 🔧 Oprava Firebase problémů

## 🚨 **Problémy v logách:**

1. ❌ **Google OAuth popup se zasekává** - Cross-Origin-Opener-Policy
2. ❌ **Firestore 400 chyby** - databáze není vytvořena
3. ❌ **404 chyby** - chybějící ikony

---

## 🔥 **NUTNÉ kroky v Firebase Console:**

### **1. Povolení Authentication (POVINNÉ)**

```bash
# V Firebase Console:
https://console.firebase.google.com/project/svatbot-app/authentication
```

**Kroky:**
1. Klikněte **"Authentication"** v levém menu
2. Klikněte **"Get started"**
3. Přejděte na **"Sign-in method"**
4. **Email/Password**:
   - Klikněte na "Email/Password"
   - ✅ Zapněte první přepínač
   - Klikněte "Save"
5. **Google OAuth**:
   - Klikněte na "Google"
   - ✅ Zapněte přepínač
   - **Project support email**: Vyberte váš email
   - Klikněte "Save"

### **2. Vytvoření Firestore Database (POVINNÉ)**

```bash
# V Firebase Console:
https://console.firebase.google.com/project/svatbot-app/firestore
```

**Kroky:**
1. Klikněte **"Firestore Database"** v levém menu
2. Klikněte **"Create database"**
3. **Security rules**: Vyberte **"Start in test mode"**
4. **Location**: Vyberte **"europe-west3 (Frankfurt)"**
5. Klikněte **"Done"**

### **3. Authorized domains (DŮLEŽITÉ)**

```bash
# V Firebase Console:
Authentication > Settings > Authorized domains
```

**Ověřte, že jsou přidané:**
- ✅ `localhost` (pro development)
- ✅ `svatbot-app.firebaseapp.com` (automaticky)

---

## 🛠️ **Oprava aplikace:**

### **1. Dočasné vypnutí Google OAuth**

Dokud nevyřešíme Firebase nastavení, vypnu Google OAuth:
