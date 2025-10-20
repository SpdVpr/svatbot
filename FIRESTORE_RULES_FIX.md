# 🔧 Firestore Rules Fix - Cookie Consent Storage

## ❌ Problém

Při ukládání cookie souhlasů do Firebase Firestore se objevovala chyba:

```
Error saving cookie preferences to Firebase: FirebaseError: Missing or insufficient permissions.
```

### Příčina:

Firestore Security Rules neobsahovaly pravidla pro subkolekci `settings` pod `users/{userId}`. Cookie banner se snažil uložit data do:

```
users/{userId}/settings/cookieConsent
```

Ale pravidla pro tuto cestu neexistovala, takže Firebase zamítl zápis.

## ✅ Řešení

Přidal jsem nová pravidla do `firestore.rules` pro subkolekci `settings`:

```javascript
// Users collection
match /users/{userId} {
  allow read: if isAuthenticated() && isOwner(userId);
  allow write: if isAuthenticated() && isOwner(userId);
  allow create: if isAuthenticated() && isOwner(userId);

  // Wedding subcollection (music, settings, etc.)
  match /wedding/{document=**} {
    allow read, write: if isAuthenticated() && isOwner(userId);
  }

  // Settings subcollection (cookie consent, preferences, etc.)
  match /settings/{settingId} {
    // User can read their own settings
    allow read: if isAuthenticated() && isOwner(userId);
    
    // User can create their own settings
    allow create: if isAuthenticated() && isOwner(userId);
    
    // User can update their own settings
    allow update: if isAuthenticated() && isOwner(userId);
    
    // User can delete their own settings
    allow delete: if isAuthenticated() && isOwner(userId);
  }
}
```

## 🔐 Bezpečnostní pravidla

### Co pravidla umožňují:

✅ **Čtení (read):**
- Uživatel může číst **pouze své vlastní** nastavení
- Musí být přihlášený (`isAuthenticated()`)
- UID musí odpovídat (`isOwner(userId)`)

✅ **Vytvoření (create):**
- Uživatel může vytvořit **pouze své vlastní** nastavení
- Musí být přihlášený
- UID musí odpovídat

✅ **Aktualizace (update):**
- Uživatel může aktualizovat **pouze své vlastní** nastavení
- Musí být přihlášený
- UID musí odpovídat

✅ **Smazání (delete):**
- Uživatel může smazat **pouze své vlastní** nastavení
- Musí být přihlášený
- UID musí odpovídat

### Co pravidla NEPOVOLUJÍ:

❌ Uživatel **nemůže** číst nastavení jiných uživatelů
❌ Uživatel **nemůže** měnit nastavení jiných uživatelů
❌ Nepřihlášený uživatel **nemůže** přistupovat k nastavením
❌ Žádný uživatel **nemůže** přistupovat k nastavením bez autentizace

## 📁 Struktura dat

### Cesta v Firestore:

```
users/
  {userId}/                          ← UID přihlášeného uživatele
    settings/                        ← Subkolekce nastavení
      cookieConsent/                 ← Dokument s cookie souhlasy
        necessary: true
        functional: false
        analytics: false
        marketing: false
        updatedAt: "2025-10-16T..."
      
      (další nastavení v budoucnu)
      dashboardPreferences/          ← Možné budoucí nastavení
      notificationSettings/          ← Možné budoucí nastavení
      privacySettings/               ← Možné budoucí nastavení
```

## 🚀 Nasazení

### 1. Aktualizace pravidel:

```bash
firebase deploy --only firestore:rules
```

### Výstup:

```
=== Deploying to 'svatbot-app'...

i  deploying firestore
i  cloud.firestore: checking firestore.rules for compilation errors...
✓  cloud.firestore: rules file firestore.rules compiled successfully
i  firestore: uploading rules firestore.rules...
✓  firestore: released rules firestore.rules to cloud.firestore

✓  Deploy complete!
```

### 2. Commit do Gitu:

```bash
git add firestore.rules
git commit -m "fix: Add Firestore security rules for cookie consent storage"
git push origin master
```

## ✅ Ověření

### Před opravou:

```javascript
// Console error:
Error saving cookie preferences to Firebase: 
FirebaseError: Missing or insufficient permissions.
```

### Po opravě:

```javascript
// Console log:
✅ Cookie preferences saved to Firebase
✅ Preferences synchronized across devices
```

## 🧪 Testování

### Test 1: Uložení cookie souhlasu

1. Přihlásit se do aplikace
2. Otevřít cookie banner
3. Kliknout na "Přijmout vše"
4. **Očekávaný výsledek:** Žádná chyba, souhlas uložen

### Test 2: Načtení cookie souhlasu

1. Přihlásit se do aplikace
2. Obnovit stránku
3. **Očekávaný výsledek:** Cookie banner se nezobrazí (preference načteny)

### Test 3: Synchronizace mezi zařízeními

1. Přihlásit se na PC, nastavit cookie preference
2. Přihlásit se na mobilu se stejným účtem
3. **Očekávaný výsledek:** Stejné preference na obou zařízeních

### Test 4: Izolace dat mezi uživateli

1. Uživatel A nastaví preference
2. Uživatel B se přihlásí
3. **Očekávaný výsledek:** Uživatel B vidí své vlastní preference, ne preference uživatele A

## 📊 Firestore Console

### Jak zkontrolovat data:

1. Otevřít Firebase Console: https://console.firebase.google.com
2. Vybrat projekt: `svatbot-app`
3. Kliknout na `Firestore Database`
4. Navigovat do:
   ```
   users → {userId} → settings → cookieConsent
   ```

### Příklad dat:

```json
{
  "necessary": true,
  "functional": true,
  "analytics": true,
  "marketing": false,
  "updatedAt": "2025-10-16T14:30:00.000Z"
}
```

## 🔍 Debugging

### Jak zkontrolovat, zda pravidla fungují:

1. **Firebase Console → Firestore Database → Rules**
2. Kliknout na "Rules Playground"
3. Testovat operace:

```
Location: /users/abc123/settings/cookieConsent
Operation: get
Auth: Authenticated as abc123
Result: ✅ Allow
```

```
Location: /users/abc123/settings/cookieConsent
Operation: get
Auth: Authenticated as xyz789
Result: ❌ Deny (different user)
```

## 📝 Poznámky

### Proč subkolekce `settings`?

✅ **Organizace:** Všechna uživatelská nastavení na jednom místě
✅ **Škálovatelnost:** Snadné přidání dalších nastavení v budoucnu
✅ **Bezpečnost:** Jednoduchá pravidla pro celou subkolekci
✅ **Výkon:** Efektivní dotazy na konkrétní nastavení

### Budoucí rozšíření:

Subkolekce `settings` může obsahovat:

- `cookieConsent` - souhlas s cookies ✅ (hotovo)
- `dashboardPreferences` - layout dashboardu
- `notificationSettings` - nastavení notifikací
- `privacySettings` - nastavení soukromí
- `themeSettings` - barevné schéma, dark mode
- `languageSettings` - preferovaný jazyk
- `emailSettings` - frekvence emailů

## 🎯 Výsledek

✅ **Chyba opravena:** Cookie souhlas se nyní úspěšně ukládá do Firebase
✅ **Pravidla nasazena:** Firestore Security Rules aktualizovány
✅ **Git aktualizován:** Změny commitnuty a pushnuty
✅ **Bezpečnost zachována:** Pouze vlastník může přistupovat ke svým nastavením
✅ **Připraveno pro budoucnost:** Struktura umožňuje snadné přidání dalších nastavení

---

**Datum opravy:** 16. října 2025  
**Commit:** `82ea2a0`  
**Status:** ✅ Vyřešeno a nasazeno

