# Funkce "Zapomenuté heslo"

## ✅ Implementováno

Přidal jsem funkci "Zapomenuté heslo" do obou přihlašovacích stránek:

### 1. **Admin přihlášení** (`/admin/login`)
- Tlačítko "Zapomenuté heslo?" pod přihlašovacím formulářem
- Modal okno pro zadání emailu
- Odeslání reset emailu přes Firebase Authentication

### 2. **Uživatelské přihlášení** (AuthModal komponenta)
- Tlačítko "Zapomenuté heslo?" v přihlašovacím modalu
- Modal okno pro zadání emailu
- Odeslání reset emailu přes Firebase Authentication

## 🎯 Jak to funguje

1. **Uživatel klikne na "Zapomenuté heslo?"**
2. **Otevře se modal okno** s formulářem pro zadání emailu
3. **Uživatel zadá svůj email** a klikne na "Odeslat"
4. **Firebase odešle email** s odkazem pro reset hesla
5. **Uživatel klikne na odkaz v emailu** a je přesměrován na Firebase stránku
6. **Uživatel zadá nové heslo** a potvrdí
7. **Heslo je změněno** a uživatel se může přihlásit

## 📧 Firebase Email Template

Firebase Authentication automaticky používá šablonu "Password reset" kterou jste viděl v Firebase Console.

### Nastavení v Firebase Console:

1. Otevřete [Firebase Console - Templates](https://console.firebase.google.com/project/svatbot-app/authentication/emails)
2. Klikněte na **"Password reset"**
3. Můžete upravit:
   - **From name**: SvatBot
   - **Subject**: Obnovení hesla - SvatBot
   - **Body**: (Firebase má výchozí šablonu, kterou můžete upravit)

### Authorized Domains:

Ujistěte se, že máte přidané tyto domény v [Authorized domains](https://console.firebase.google.com/project/svatbot-app/authentication/settings):
- `svatbot.cz`
- `www.svatbot.cz`
- `localhost` (pro development)
- Vaše Vercel deployment URL

## 🔒 Bezpečnost

- Firebase automaticky validuje email
- Reset link je platný pouze 1 hodinu
- Link lze použít pouze jednou
- Rate limiting zabraňuje spamu

## 🎨 UI/UX

### Admin přihlášení:
- Tlačítko "Zapomenuté heslo?" je umístěno pod přihlašovacím formulářem
- Modal okno s jednoduchým formulářem
- Success message po odeslání emailu
- Automatické zavření modalu po 3 sekundách

### Uživatelské přihlášení:
- Tlačítko "Zapomenuté heslo?" je umístěno nad tlačítkem "Přihlásit se"
- Modal okno s designem konzistentním s hlavním modalem
- Success message po odeslání emailu
- Automatické zavření modalu po 3 sekundách

## 🧪 Testování

### Test 1: Admin přihlášení
1. Otevřete `http://localhost:3000/admin/login`
2. Klikněte na "Zapomenuté heslo?"
3. Zadejte email: `admin@svatbot.cz`
4. Klikněte na "Odeslat"
5. Zkontrolujte emailovou schránku

### Test 2: Uživatelské přihlášení
1. Otevřete `http://localhost:3000`
2. Klikněte na "Přihlásit se"
3. Klikněte na "Zapomenuté heslo?"
4. Zadejte email
5. Klikněte na "Odeslat"
6. Zkontrolujte emailovou schránku

## 📝 Chybové hlášky

Implementované chybové hlášky:
- ✅ "Uživatel s tímto emailem neexistuje" - když email není v databázi
- ✅ "Neplatný formát emailu" - když email není validní
- ✅ "Příliš mnoho pokusů. Zkuste to prosím později." - rate limiting
- ✅ Obecná chybová hláška pro ostatní chyby

## 🚀 Produkční nasazení

Před nasazením do produkce:

1. **Zkontrolujte Authorized domains** v Firebase Console
2. **Upravte email šablonu** v Firebase Console (volitelné)
3. **Otestujte funkci** na produkční doméně
4. **Zkontrolujte spam složku** - první emaily mohou skončit ve spamu

## 🔧 Technické detaily

### Soubory upravené:
- `src/app/admin/login/page.tsx` - Admin přihlášení
- `src/components/auth/AuthModal.tsx` - Uživatelské přihlášení

### Použité Firebase funkce:
- `sendPasswordResetEmail(auth, email, actionCodeSettings)`

### Action Code Settings:
```typescript
const actionCodeSettings = {
  url: `${window.location.origin}/admin/login`, // nebo jiná URL
  handleCodeInApp: false, // Firebase stránka pro reset
}
```

## 📚 Další možnosti

Pokud chcete vlastní stránku pro reset hesla (místo Firebase stránky):

1. Nastavte `handleCodeInApp: true`
2. Vytvořte vlastní stránku `/reset-password`
3. Použijte `confirmPasswordReset(auth, oobCode, newPassword)`

Ale doporučuji použít výchozí Firebase stránku - je bezpečná a funguje dobře.

