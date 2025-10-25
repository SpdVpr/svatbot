# 🔐 Rychlý Průvodce Nastavením Admin Přístupu

## ⚠️ Problém: Admin Login Se Točí Donekonečna

Pokud se admin login točí donekonečna, znamená to, že uživatel **nemá nastavené admin custom claims** v Firebase Authentication.

## ✅ Řešení: Nastavit Admin Claims

### Metoda 1: Pomocí Node.js Scriptu (DOPORUČENO)

1. **Ujistěte se, že máte `serviceAccountKey.json`**
   - Stáhněte z Firebase Console → Project Settings → Service Accounts
   - Uložte do složky `functions/`
   - **NIKDY** necommitujte do Gitu!

2. **Spusťte script pro nastavení admin claims:**

```bash
cd functions
node setAdminClaims.js <USER_UID> super_admin
```

**Příklad:**
```bash
node setAdminClaims.js 3oFVSatEuOeecsiHVEfEoaE1RWk1 super_admin
```

3. **Výstup by měl být:**
```
Setting custom claims for user: 3oFVSatEuOeecsiHVEfEoaE1RWk1
Role: super_admin
✅ Custom claims set successfully!

📋 User custom claims: { role: 'super_admin', admin: true }

🎉 Done! User can now login as admin.
Note: User may need to logout and login again for claims to take effect.
```

4. **Odhlaste se a znovu se přihlaste**
   - Claims se aplikují až po novém přihlášení

### Metoda 2: Pomocí Firebase Console

1. Otevřete Firebase Console
2. Jděte na **Functions** → Deploy funkci `setAdminRole`
3. Zavolejte funkci s parametry:
```json
{
  "userId": "3oFVSatEuOeecsiHVEfEoaE1RWk1",
  "role": "super_admin",
  "secretKey": "your-secret-key"
}
```

### Metoda 3: Pomocí Admin Setup Page

1. Přihlaste se jako běžný uživatel
2. Jděte na `/admin/setup`
3. Vyplňte formulář:
   - Vyberte roli (super_admin)
   - Zadejte secret key
4. Klikněte "Set Admin Role"

## 🔍 Jak Zjistit User UID

### Možnost A: Firebase Console
1. Firebase Console → Authentication → Users
2. Najděte uživatele podle emailu
3. Zkopírujte UID

### Možnost B: Z Konzole Prohlížeče
1. Přihlaste se do aplikace
2. Otevřete Developer Tools (F12)
3. V konzoli zadejte:
```javascript
firebase.auth().currentUser.uid
```

### Možnost C: Z Logů
- Podívejte se do konzole prohlížeče při přihlášení
- Měli byste vidět log s UID

## 📋 Typy Admin Rolí

### super_admin
- Plný přístup ke všemu
- Může spravovat uživatele, vendors, marketplace, atd.
- Doporučeno pro hlavního admina

### admin
- Standardní admin práva
- Může číst a upravovat vendors
- Může číst uživatele a analytiku

### moderator
- Omezená práva
- Může pouze číst a upravovat vendors

## 🧪 Testování Admin Přístupu

1. **Nastavte admin claims** (viz výše)
2. **Odhlaste se** z aplikace
3. **Přihlaste se znovu**
4. **Jděte na** `/admin/login`
5. **Přihlaste se** s admin emailem a heslem
6. **Měli byste být přesměrováni** na `/admin/dashboard`

## ⚠️ Časté Problémy

### Problém: "Loading" se točí donekonečna
**Řešení:** 
- Uživatel nemá nastavené admin claims
- Nastavte claims pomocí scriptu výše
- Odhlaste se a znovu se přihlaste

### Problém: "Nemáte admin oprávnění"
**Řešení:**
- Claims jsou nastavené, ale nejsou správně
- Zkontrolujte, že `admin: true` a `role: 'super_admin'` jsou nastavené
- Spusťte script znovu

### Problém: Claims se neaplikují
**Řešení:**
- **MUSÍTE** se odhlásit a znovu přihlásit
- Claims se načítají pouze při novém přihlášení
- Zkuste vymazat cache prohlížeče

### Problém: "serviceAccountKey.json not found"
**Řešení:**
- Stáhněte service account key z Firebase Console
- Uložte do `functions/serviceAccountKey.json`
- Ujistěte se, že je v `.gitignore`

## 🔒 Bezpečnost

### ⚠️ DŮLEŽITÉ:
- **NIKDY** necommitujte `serviceAccountKey.json` do Gitu
- **NIKDY** nesdílejte service account key
- **VŽDY** používejte `.gitignore` pro citlivé soubory
- **ZMĚŇTE** secret key v produkci

### Doporučení:
- Používejte silná hesla pro admin účty
- Nastavte 2FA pro admin účty (pokud možno)
- Pravidelně kontrolujte admin přístupy
- Logujte všechny admin akce

## 📝 Kontrolní Seznam

- [ ] Stáhnout `serviceAccountKey.json` z Firebase Console
- [ ] Uložit do `functions/` složky
- [ ] Zjistit User UID z Firebase Console
- [ ] Spustit `node setAdminClaims.js <UID> super_admin`
- [ ] Zkontrolovat výstup - mělo by být "✅ Custom claims set successfully!"
- [ ] Odhlásit se z aplikace
- [ ] Znovu se přihlásit
- [ ] Jít na `/admin/login`
- [ ] Přihlásit se s admin údaji
- [ ] Měli byste vidět Admin Dashboard

## 🆘 Potřebujete Pomoc?

Pokud stále máte problémy:

1. **Zkontrolujte konzoli prohlížeče** - měli byste vidět logy
2. **Zkontrolujte Firebase Console** - Authentication → Users → Custom Claims
3. **Zkontrolujte, že máte správný UID**
4. **Zkuste vymazat localStorage** a cookies
5. **Zkuste jiný prohlížeč** nebo incognito mode

## 📚 Další Dokumentace

- `ADMIN_DASHBOARD_SETUP.md` - Kompletní setup guide
- `ADMIN_DASHBOARD_LOADING_FIX.md` - Řešení loading problémů
- `functions/setAdminClaims.js` - Script pro nastavení claims
- `functions/src/setAdminRole.ts` - Cloud Function pro nastavení role

