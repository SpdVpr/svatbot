# 🚀 Vercel Environment Variables Setup

## ⚠️ DŮLEŽITÉ - Nastavte tyto proměnné na Vercelu!

Před nasazením do produkce musíte nastavit následující environment variables na Vercelu.

---

## 📝 Jak nastavit na Vercelu

1. **Jděte na:** https://vercel.com/spdvpr/svatbot/settings/environment-variables
2. **Přidejte následující proměnné**
3. **Vyberte prostředí:** Production, Preview, Development (všechny)
4. **Klikněte "Save"**
5. **Redeploy aplikaci** (Settings → Deployments → ... → Redeploy)

---

## 🔑 Environment Variables

### GoPay Credentials (PRODUKČNÍ)

**⚠️ POZOR:** Tyto jsou testovací credentials! Pro produkci potřebujete **produkční credentials** od GoPay!

```
NEXT_PUBLIC_GOPAY_GOID=8208931819
NEXT_PUBLIC_GOPAY_CLIENT_ID=1270557640
GOPAY_CLIENT_SECRET=fGe9aSFX
NEXT_PUBLIC_GOPAY_ENVIRONMENT=production
```

**Pro produkci změňte na:**
- Kontaktujte GoPay: obchod@gopay.cz
- Získejte produkční GoID, ClientID, ClientSecret
- Nastavte `NEXT_PUBLIC_GOPAY_ENVIRONMENT=production`

---

### Firebase Admin SDK

```
FIREBASE_ADMIN_PROJECT_ID=svatbot-app
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-fbsvc@svatbot-app.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDCxqVGKbwJqLLu\nYour_Private_Key_Here\n-----END PRIVATE KEY-----\n"
```

**Poznámka:** Private key už máte nastavený na Vercelu z předchozího setupu.

---

### Firebase Client SDK

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBYour_API_Key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=svatbot-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=svatbot-app
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=svatbot-app.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

**Poznámka:** Tyto už máte nastavené na Vercelu.

---

### Application URL

```
NEXT_PUBLIC_APP_URL=https://svatbot.cz
```

---

## ✅ Checklist před nasazením

### 1. GoPay Produkční Credentials
- [ ] Kontaktovali jste GoPay (obchod@gopay.cz)
- [ ] Získali jste produkční GoID
- [ ] Získali jste produkční ClientID
- [ ] Získali jste produkční ClientSecret
- [ ] Požádali jste o aktivaci **opakovaných plateb (recurrence)**
- [ ] Nastavili jste webhook URL: `https://svatbot.cz/api/gopay/webhook`

### 2. Vercel Environment Variables
- [ ] `NEXT_PUBLIC_GOPAY_GOID` - produkční hodnota
- [ ] `NEXT_PUBLIC_GOPAY_CLIENT_ID` - produkční hodnota
- [ ] `GOPAY_CLIENT_SECRET` - produkční hodnota
- [ ] `NEXT_PUBLIC_GOPAY_ENVIRONMENT=production`
- [ ] `FIREBASE_ADMIN_PROJECT_ID`
- [ ] `FIREBASE_ADMIN_CLIENT_EMAIL`
- [ ] `FIREBASE_ADMIN_PRIVATE_KEY`
- [ ] `NEXT_PUBLIC_APP_URL=https://svatbot.cz`

### 3. GoPay Admin Panel
- [ ] Přihlásili jste se do GoPay produkčního účtu
- [ ] Nastavili jste webhook URL: `https://svatbot.cz/api/gopay/webhook`
- [ ] Ověřili jste, že opakované platby jsou aktivní

### 4. Testování
- [ ] Vytvořili jste testovací platbu na produkci
- [ ] Ověřili jste, že webhook funguje
- [ ] Ověřili jste, že předplatné se aktivuje
- [ ] Počkáte 30 dní nebo použijete GoPay admin pro simulaci následné platby

---

## 🧪 Testování na produkci

### Krok 1: Vytvořte testovací platbu
1. Jděte na https://svatbot.cz
2. Přihlaste se
3. Jděte do **Můj účet → Předplatné**
4. Vyberte **Premium Měsíční**
5. Dokončete platbu **skutečnou kartou** (bude strženo 299 Kč)

### Krok 2: Ověřte webhook
1. Sledujte Vercel logs: https://vercel.com/spdvpr/svatbot/logs
2. Měli byste vidět:
   ```
   📥 GoPay webhook - INITIAL payment: XXXXXXX
   ✅ Subscription ACTIVATED (initial payment) for user: XXXXXX
   ```

### Krok 3: Ověřte předplatné
1. Obnovte stránku
2. Měli byste vidět **Premium Měsíční** místo Trial
3. Datum konce: za 30 dní

### Krok 4: Simulujte následnou platbu (volitelné)
1. Přihlaste se do GoPay produkčního účtu
2. Najděte platbu
3. Klikněte "Simulovat následnou platbu"
4. Ověřte, že předplatné se prodloužilo

---

## 🚨 Troubleshooting

### Chyba: "Missing or insufficient permissions"
- ✅ Zkontrolujte, že `FIREBASE_ADMIN_*` proměnné jsou nastavené
- ✅ Zkontrolujte, že private key je ve správném formátu (s `\n`)

### Chyba: "Invalid credentials"
- ✅ Zkontrolujte, že používáte **produkční** GoPay credentials
- ✅ Zkontrolujte, že `NEXT_PUBLIC_GOPAY_ENVIRONMENT=production`

### Webhook nefunguje
- ✅ Zkontrolujte, že webhook URL je nastavená v GoPay admin
- ✅ Zkontrolujte Vercel logs pro chyby
- ✅ Zkontrolujte, že `NEXT_PUBLIC_APP_URL=https://svatbot.cz`

### Opakované platby nefungují
- ✅ Zkontrolujte, že jste požádali GoPay o aktivaci recurrence
- ✅ Zkontrolujte, že první platba byla úspěšná
- ✅ Počkejte 30 dní nebo použijte GoPay admin pro simulaci

---

## 📞 Kontakty

**GoPay Obchodní tým:**
- Email: obchod@gopay.cz
- Telefon: +420 228 224 267

**GoPay Technická podpora:**
- Email: integrace@gopay.cz
- Telefon: +420 228 224 267

**Co říct GoPay:**
> "Dobrý den, potřebujeme aktivovat automatické opakované platby (recurrence) pro naše prodejní místo. Máme měsíční předplatné za 299 Kč. Webhook URL: https://svatbot.cz/api/gopay/webhook"

---

## 🎉 Po úspěšném nasazení

1. ✅ Aplikace běží na https://svatbot.cz
2. ✅ Platby fungují přes GoPay
3. ✅ Měsíční předplatné se automaticky opakuje
4. ✅ Roční předplatné je jednorázové
5. ✅ Webhook notifikace fungují
6. ✅ Předplatné se automaticky aktivuje a prodlužuje

---

**Připraveno k nasazení! 🚀**

