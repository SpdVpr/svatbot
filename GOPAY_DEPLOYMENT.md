# 🚀 GoPay Nasazení na Produkci

## 📋 Přehled

Tento dokument popisuje kroky pro nasazení GoPay platební brány na produkční prostředí svatbot.cz.

---

## ✅ Předpoklady

- [x] GoPay integrace implementována
- [x] Testovací údaje nastaveny
- [x] Lokální testování dokončeno
- [ ] Produkční GoPay účet aktivován
- [ ] Produkční přihlašovací údaje získány

---

## 🔧 Krok 1: Příprava GoPay účtu

### 1.1 Aktivace produkčního účtu

1. **Přihlaste se do GoPay:**
   - URL: https://gate.gopay.cz/
   - Použijte své produkční přihlašovací údaje

2. **Ověřte nastavení:**
   - Prodejní místo: https://www.svatbot.cz
   - Název: SvatBot.cz
   - IČ a další firemní údaje

### 1.2 Získání produkčních údajů

1. **Přejděte do nastavení:**
   - Obchodní účet → Nastavení → Integrace

2. **Získejte údaje:**
   - **GoID:** (např. 1234567890)
   - **Client ID:** (např. 9876543210)
   - **Client Secret:** (např. AbCdEfGh)

3. **Poznamenejte si je** - budete je potřebovat v dalších krocích

---

## 🌐 Krok 2: Nastavení Webhooku

### 2.1 V GoPay obchodním účtu

1. **Přejděte do nastavení:**
   - Obchodní účet → Nastavení → HTTP notifikace

2. **Nastavte URL:**
   ```
   https://svatbot.cz/api/gopay/webhook
   ```

3. **Formát:**
   - Metoda: GET
   - Parametry: `?id={PAYMENT_ID}`

4. **Uložte změny**

### 2.2 Testování webhooku

Po nasazení otestujte webhook:

```bash
# Vytvořte testovací platbu
# GoPay automaticky zavolá webhook

# Zkontrolujte logy na Vercel
vercel logs
```

---

## 🔐 Krok 3: Nastavení Environment Variables na Vercel

### 3.1 Přihlášení do Vercel

```bash
vercel login
```

### 3.2 Nastavení proměnných

```bash
# GoPay GoID
vercel env add NEXT_PUBLIC_GOPAY_GOID
# Zadejte: vaše_produkční_goid

# GoPay Client ID
vercel env add NEXT_PUBLIC_GOPAY_CLIENT_ID
# Zadejte: vaše_produkční_client_id

# GoPay Client Secret (SENSITIVE!)
vercel env add GOPAY_CLIENT_SECRET
# Zadejte: vaše_produkční_client_secret

# Environment (production)
vercel env add NEXT_PUBLIC_GOPAY_ENVIRONMENT
# Zadejte: production
```

### 3.3 Ověření proměnných

```bash
vercel env ls
```

Měli byste vidět:
```
NEXT_PUBLIC_GOPAY_GOID          production
NEXT_PUBLIC_GOPAY_CLIENT_ID     production
GOPAY_CLIENT_SECRET             production
NEXT_PUBLIC_GOPAY_ENVIRONMENT   production
```

---

## 📦 Krok 4: Deploy na Vercel

### 4.1 Commit změn

```bash
git add .
git commit -m "feat: GoPay payment integration"
git push origin main
```

### 4.2 Automatický deploy

Vercel automaticky nasadí změny z main branch.

### 4.3 Manuální deploy (alternativa)

```bash
vercel --prod
```

---

## 🧪 Krok 5: Testování na produkci

### 5.1 Testovací platba

1. **Přihlaste se na svatbot.cz**
2. **Jděte do Můj účet → Předplatné**
3. **Vyberte tarif a klikněte Upgradovat**
4. **Použijte testovací kartu:**
   - Číslo: `4111111111111111`
   - Expirační datum: jakékoliv budoucí
   - CVV: `123`

### 5.2 Ověření

1. **Zkontrolujte platbu v GoPay:**
   - Přihlaste se do GoPay obchodního účtu
   - Přejděte na Přehled plateb
   - Měli byste vidět novou platbu

2. **Zkontrolujte Firestore:**
   - Firebase Console → Firestore
   - Kolekce `payments` - nová platba
   - Kolekce `subscriptions` - aktualizované předplatné

3. **Zkontrolujte frontend:**
   - Můj účet → Předplatné - mělo by být aktivní
   - Můj účet → Platby - měla by být vidět platba

---

## 📊 Krok 6: Monitoring

### 6.1 Vercel Logs

```bash
# Real-time logs
vercel logs --follow

# Logs pro konkrétní deployment
vercel logs <deployment-url>
```

### 6.2 GoPay Dashboard

Sledujte:
- **Přehled plateb** - všechny transakce
- **Statistiky** - úspěšnost plateb
- **Notifikace** - webhook volání

### 6.3 Firebase Console

Sledujte:
- **Firestore** - nové platby a předplatná
- **Functions** - logy (pokud používáte)

---

## 🔒 Krok 7: Bezpečnost

### 7.1 Ověření HTTPS

```bash
curl -I https://svatbot.cz/api/gopay/webhook
```

Měli byste vidět:
```
HTTP/2 200
```

### 7.2 Ochrana API endpointů

Webhook endpoint je chráněn:
- ✅ Ověření platby přes GoPay API
- ✅ Firebase Admin SDK pro zápis
- ✅ HTTPS komunikace

### 7.3 Secrets Management

- ✅ Client Secret je v environment variables
- ✅ Není v kódu ani v git
- ✅ Přístup pouze přes Vercel

---

## 📧 Krok 8: Email notifikace (Volitelné)

### 8.1 Nastavení SendGrid

```bash
vercel env add SENDGRID_API_KEY
vercel env add SENDGRID_FROM_EMAIL
```

### 8.2 Email šablony

Vytvořte šablony pro:
- ✅ Potvrzení platby
- ✅ Aktivace předplatného
- ✅ Připomenutí obnovení
- ✅ Zrušení předplatného

---

## 🐛 Troubleshooting

### Problém: Webhook se nevolá

**Řešení:**
1. Zkontrolujte URL v GoPay nastavení
2. Ověřte, že URL je veřejně dostupná
3. Zkontrolujte Vercel logs
4. Testujte manuálně: `curl https://svatbot.cz/api/gopay/webhook?id=123`

### Problém: Platba se nezobrazuje

**Řešení:**
1. Zkontrolujte Firestore pravidla
2. Ověřte, že webhook byl úspěšně zpracován
3. Zkontrolujte logy v Vercel
4. Ověřte GoPay payment ID

### Problém: Chyba autentizace

**Řešení:**
1. Zkontrolujte environment variables na Vercel
2. Ověřte Client ID a Client Secret
3. Zkontrolujte, že používáte produkční údaje
4. Restartujte deployment: `vercel --prod --force`

---

## 📋 Checklist před spuštěním

### Příprava
- [ ] GoPay produkční účet aktivován
- [ ] Produkční přihlašovací údaje získány
- [ ] Webhook URL nastaven v GoPay
- [ ] Environment variables nastaveny na Vercel

### Testování
- [ ] Testovací platba úspěšná
- [ ] Webhook funguje správně
- [ ] Předplatné se aktivuje
- [ ] Platba se zobrazuje v historii

### Monitoring
- [ ] Vercel logs fungují
- [ ] GoPay dashboard přístupný
- [ ] Firebase Console přístupná
- [ ] Email notifikace fungují (pokud nastaveny)

### Dokumentace
- [ ] Tým informován o změnách
- [ ] Dokumentace aktualizována
- [ ] Kontakty na podporu připraveny

---

## 🎉 Po nasazení

### Co sledovat prvních 24 hodin:

1. **Platby:**
   - Úspěšnost plateb
   - Průměrná doba zpracování
   - Chybovost

2. **Webhooks:**
   - Počet volaných webhooků
   - Úspěšnost zpracování
   - Chyby

3. **Uživatelé:**
   - Počet nových předplatných
   - Konverzní poměr
   - Feedback

### Kontakty na podporu:

**GoPay Technická podpora:**
- Email: integrace@gopay.cz
- Telefon: +420 228 224 267
- Dostupnost: Po-Pá 9:00-17:00

**Vercel Support:**
- Dashboard: https://vercel.com/support
- Dokumentace: https://vercel.com/docs

---

## ✅ Hotovo!

Po dokončení všech kroků:
- ✅ GoPay je plně funkční na produkci
- ✅ Uživatelé mohou platit
- ✅ Předplatná se automaticky aktivují
- ✅ Monitoring je nastaven

**Gratulujeme k úspěšnému nasazení! 🚀**

---

## 📞 Kontakt

Pro technickou podporu:
- **Email:** info@svatbot.cz
- **Web:** https://svatbot.cz

