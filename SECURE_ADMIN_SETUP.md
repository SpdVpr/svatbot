# Bezpečné Vytvoření Admin Účtu

## 🔐 Metoda: Cloud Function (Doporučeno)

Tato metoda je bezpečná, protože:
- ✅ Žádné scripty s hesly v repozitáři
- ✅ Žádné service account keys v projektu
- ✅ Vše se děje na Firebase serveru
- ✅ Funkci můžete po použití smazat

---

## 📋 Postup (5 minut)

### Krok 1: Vytvořit Uživatele v Firebase Console

1. Otevřete: https://console.firebase.google.com/project/svatbot-app/authentication/users
2. Klikněte na **"Add user"**
3. Vyplňte:
   - **Email**: `admin@svatbot.cz`
   - **Password**: `admin123` (nebo silnější)
4. Klikněte **"Add user"**
5. **DŮLEŽITÉ**: Zkopírujte **UID** uživatele (např. `abc123xyz...`)

### Krok 2: Deploy Cloud Function

```bash
# V terminálu
firebase login
firebase use svatbot-app
firebase deploy --only functions:setAdminRole
```

⏱️ Deployment trvá ~2 minuty

### Krok 3: Zavolat Cloud Function

1. Otevřete Firebase Console → Functions
2. Najděte funkci `setAdminRole`
3. Klikněte na ni → záložka **"Testing"**
4. Do pole "Authenticated request" vložte:

```json
{
  "userId": "VLOŽTE_SEM_UID_Z_KROKU_1",
  "role": "super_admin",
  "secretKey": "svatbot-admin-setup-2025"
}
```

5. Klikněte **"Test the function"**

### Krok 4: Ověřit Úspěch

Měli byste vidět odpověď:

```json
{
  "success": true,
  "message": "Role super_admin set for user admin@svatbot.cz",
  "userId": "..."
}
```

### Krok 5: Přihlásit Se

1. Otevřete: https://svatbot.cz/admin/login
2. Přihlaste se:
   - **Email**: `admin@svatbot.cz`
   - **Heslo**: `admin123`
3. Měli byste být přesměrováni na admin dashboard ✅

### Krok 6: Smazat Cloud Function (Volitelné)

Po úspěšném nastavení můžete funkci smazat:

```bash
firebase functions:delete setAdminRole
```

Nebo ji nechat pro budoucí použití (je chráněná secret key).

---

## 🔒 Bezpečnost

### Secret Key

V souboru `functions/src/setAdminRole.ts` je secret key:

```typescript
const SETUP_SECRET = 'svatbot-admin-setup-2025'
```

**DŮLEŽITÉ**: Změňte tento klíč před deploymentem!

```typescript
const SETUP_SECRET = 'vase-unikatni-tajne-heslo-12345'
```

### Po Prvním Adminu

Po vytvoření prvního super admina:

1. Funkce automaticky vyžaduje, aby volající byl super_admin
2. Secret key už není potřeba
3. Můžete funkci nechat pro přidávání dalších adminů

### Další Admini

Po vytvoření prvního super admina můžete přidávat další:

1. Přihlásit se jako super_admin
2. Zavolat funkci bez secret key:

```json
{
  "userId": "UID_NOVEHO_ADMINA",
  "role": "admin"
}
```

---

## 🎯 Alternativní Metoda: Přes Registraci

Pokud nechcete používat Cloud Functions:

### Krok 1: Zaregistrovat se normálně

1. Otevřete: https://svatbot.cz/register
2. Zaregistrujte se s emailem `admin@svatbot.cz`
3. Zkopírujte UID z Firebase Console

### Krok 2: Nastavit Custom Claims ručně

V Firebase Console → Firestore:

1. Vytvořte dokument v kolekci `adminUsers`:
   - Document ID: `[UID z kroku 1]`
   - Fields:
     ```
     email: "admin@svatbot.cz"
     name: "Admin"
     role: "super_admin"
     isActive: true
     createdAt: [current timestamp]
     permissions: {
       vendors: ["read", "write", "delete"],
       users: ["read", "write"],
       marketplace: ["read", "write", "delete"],
       analytics: ["read"],
       messages: ["read", "write"],
       feedback: ["read", "write"],
       finance: ["read"],
       affiliate: ["read"]
     }
     ```

2. Aktualizujte dokument v kolekci `users`:
   - Document ID: `[UID z kroku 1]`
   - Přidejte field:
     ```
     role: "super_admin"
     ```

### Krok 3: Nastavit Custom Claims v Authentication

Bohužel custom claims nelze nastavit přímo v Console UI.
Musíte použít buď:
- Cloud Function (viz výše)
- Firebase CLI
- Admin SDK

**Proto je Cloud Function metoda nejjednodušší!**

---

## 🐛 Troubleshooting

### Error: "Invalid secret key"

**Řešení:**
- Zkontrolujte, že secret key v JSON odpovídá secret key v kódu
- Secret key je case-sensitive

### Error: "User not found"

**Řešení:**
- Zkontrolujte, že UID je správně zkopírovaný
- Ověřte, že uživatel existuje v Firebase Authentication

### Error: "Permission denied"

**Řešení:**
- Pro první admin použijte secret key
- Pro další adminy se přihlaste jako super_admin

### Stále nefunguje přihlášení

**Řešení:**
1. Zkontrolujte Firebase Console → Authentication → Users
2. Ověřte, že uživatel má správný email
3. Zkuste reset hesla
4. Zkontrolujte browser console pro chyby
5. Ověřte, že custom claims jsou nastaveny (v kódu funkce)

---

## 📝 Co Funkce Dělá

Cloud Function `setAdminRole`:

1. ✅ Ověří secret key (pro první admin) nebo super_admin roli
2. ✅ Nastaví custom claims `{ role: "super_admin" }`
3. ✅ Vytvoří dokument v `adminUsers` collection
4. ✅ Aktualizuje dokument v `users` collection
5. ✅ Nastaví všechna potřebná permissions

---

## 🎉 Po Úspěšném Nastavení

Budete mít přístup k:

- 📊 **Admin Dashboard**: `/admin/analytics`
- 👥 **User Analytics**: Real-time sledování uživatelů
- 💬 **Messaging**: Chat s uživateli
- 📝 **Feedback**: Správa feedbacku
- 🏪 **Vendors**: Správa dodavatelů
- 📈 **Marketplace**: Správa marketplace

---

## 🔐 Doporučení po Nastavení

1. ✅ Změňte heslo na silnější
2. ✅ Změňte secret key v kódu
3. ✅ Redeploy funkci nebo ji smažte
4. ✅ Nastavte 2FA pro admin účet
5. ✅ Nikdy nesdílejte admin přihlašovací údaje

---

**Vytvořeno**: 2025-10-20  
**Status**: ✅ Secure & Production Ready

