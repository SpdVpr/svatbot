# Vendor Reviews - Quick Start Guide

## 🚀 Rychlé spuštění

### 1. Nasazení Firestore Rules a Indexů

```bash
# Nahrát Firestore security rules
firebase deploy --only firestore:rules

# Nahrát Firestore indexes
firebase deploy --only firestore:indexes
```

### 2. Test jako uživatel

1. **Přihlaste se** jako běžný uživatel na [svatbot.cz](https://svatbot.cz)
2. Jděte na **Marketplace** → vyberte dodavatele
3. Klikněte na **"Napsat recenzi"**
4. Vyplňte formulář:
   - Celkové hodnocení (1-5 ⭐)
   - Nadpis recenze
   - Text (min. 50 znaků)
   - Detailní hodnocení (kvalita, komunikace, cena/výkon, profesionalita)
   - Volitelně: datum svatby, využitá služba
5. **Odešlete** recenzi
6. Uvidíte zprávu: "Děkujeme! Vaše recenze bude zveřejněna po schválení."

### 3. Test jako admin

1. **Přihlaste se** jako admin
2. Otevřete **Admin Dashboard** → tab **"Recenze"**
3. Měli byste vidět:
   - Statistiku čekajících, schválených a zamítnutých recenzí
   - Seznam čekajících recenzí
4. Klikněte na recenzi:
   - **Schválit** → recenze se zobrazí veřejně
   - **Zamítnout** → zadejte důvod zamítnutí

### 4. Ověření veřejného zobrazení

1. Vraťte se na stránku dodavatele (bez přihlášení)
2. Měli byste vidět pouze **schválené recenze**
3. Vyzkoušejte:
   - ✅ Filtrování podle hodnocení (5⭐, 4⭐, atd.)
   - ✅ Řazení (nejnovější, nejstarší, nejvyšší/nejnižší hodnocení)
   - ✅ Statistiky hodnocení

## 📊 Klíčové funkce

### Pro uživatele:
- ✅ Psaní recenzí pouze pro přihlášené
- ✅ Jeden uživatel = jedna recenze na dodavatele
- ✅ Kontrola duplikací
- ✅ Min. 50 znaků v textu
- ✅ Automatický status "pending"

### Pro administrátory:
- ✅ Přehled všech recenzí
- ✅ Filtrování podle stavu (pending/approved/rejected)
- ✅ Schvalování/zamítání s poznámkou
- ✅ Statistiky (kolik čeká, schváleno, zamítnuto)

### Veřejné zobrazení:
- ✅ Pouze schválené recenze
- ✅ Celkové + detailní hodnocení
- ✅ Průměry a rozložení hodnocení
- ✅ Filtrování a řazení

## 🗂️ Datová struktura

```
vendorReviews/
  {reviewId}/
    - vendorId: string
    - userId: string (autor)
    - userName: string
    - userEmail: string
    - rating: number (1-5)
    - title: string
    - text: string (min. 50)
    - ratings: {
        quality: number (1-5)
        communication: number (1-5)
        value: number (1-5)
        professionalism: number (1-5)
      }
    - status: "pending" | "approved" | "rejected"
    - moderatedBy?: string (admin ID)
    - moderatedAt?: timestamp
    - moderationNote?: string
    - createdAt: timestamp
    - updatedAt: timestamp
```

## 🔒 Oprávnění

### Čtení recenzí:
- ✅ Kdokoli může číst **schválené** recenze
- ✅ Autoři vidí své vlastní (všechny stavy)
- ✅ Admini vidí všechny

### Vytvoření recenze:
- ✅ Pouze přihlášení uživatelé
- ✅ userId musí odpovídat auth.uid
- ✅ Status musí být "pending"
- ✅ Rating 1-5
- ✅ Text min. 50 znaků

### Úprava recenze:
- ✅ Autoři mohou upravovat své "pending" recenze
- ✅ Admini mohou upravovat všechny (moderace)

### Smazání recenze:
- ✅ Autoři mohou smazat své recenze
- ✅ Admini mohou smazat všechny

## 🔍 Testovací scénáře

### ✅ Test 1: Uživatel píše recenzi
1. Přihlaste se jako user
2. Otevřete dodavatele
3. Klikněte "Napsat recenzi"
4. Vyplňte formulář
5. Odešlete
6. ✅ Ověřte: recenze má status "pending"
7. ✅ Ověřte: recenze se nezobrazuje veřejně

### ✅ Test 2: Admin schvaluje
1. Přihlaste se jako admin
2. Otevřete Admin Dashboard → Recenze
3. ✅ Ověřte: vidíte čekající recenzi
4. Klikněte "Schválit"
5. ✅ Ověřte: status se změnil na "approved"
6. ✅ Ověřte: recenze se zobrazuje veřejně

### ✅ Test 3: Admin zamítá
1. Přihlaste se jako admin
2. Otevřete čekající recenzi
3. Klikněte "Zamítnout"
4. Zadejte důvod
5. ✅ Ověřte: status se změnil na "rejected"
6. ✅ Ověřte: recenze se nezobrazuje veřejně

### ✅ Test 4: Duplicitní recenze
1. Přihlaste se jako user
2. Zkuste napsat druhou recenzi na stejného dodavatele
3. ✅ Ověřte: zobrazí se chyba "Již jste recenzovali tohoto dodavatele"

### ✅ Test 5: Validace
1. Zkuste odeslat recenzi s textem kratším než 50 znaků
2. ✅ Ověřte: formulář neumožní odeslat
3. ✅ Ověřte: zobrazí se validační chyba

### ✅ Test 6: Filtrování a řazení
1. Otevřete stránku dodavatele s recenzemi
2. ✅ Vyzkoušejte filtr podle hodnocení (5⭐, 4⭐, ...)
3. ✅ Vyzkoušejte řazení (nejnovější, nejstarší, nejvyšší, nejnižší)
4. ✅ Ověřte správné zobrazení

## 📝 Komponenty

```
src/
  types/
    review.ts                          # TypeScript typy

  hooks/
    useVendorReviews.ts                # Hook pro správu recenzí

  components/
    marketplace/
      ReviewForm.tsx                   # Formulář pro novou recenzi
      ReviewCard.tsx                   # Zobrazení jedné recenze
      ReviewList.tsx                   # Seznam recenzí s filtrováním
      ReviewStats.tsx                  # Statistiky hodnocení
    
    admin/
      ReviewModeration.tsx             # Admin rozhraní pro moderaci

  app/
    marketplace/
      vendor/[id]/page.tsx             # Integrace na stránce dodavatele
    
    admin/
      dashboard/page.tsx               # Admin dashboard s tabem "Recenze"
```

## 🚨 Troubleshooting

### Problém: Recenze se nezobrazují
**Řešení:**
- Zkontrolujte status recenze (musí být "approved")
- Ověřte Firestore rules (`firebase deploy --only firestore:rules`)
- Zkontrolujte console log prohlížeče

### Problém: Nelze vytvořit recenzi
**Řešení:**
- Ověřte, že je uživatel přihlášen
- Zkontrolujte, zda uživatel již nerecenzoval tohoto dodavatele
- Ujistěte se, že text má min. 50 znaků

### Problém: Firestore query error
**Řešení:**
- Nasaďte indexy: `firebase deploy --only firestore:indexes`
- Nebo klikněte na link v error message v Firebase Console

### Problém: Admin nevidí čekající recenze
**Řešení:**
- Ověřte, že má uživatel admin role (custom claims)
- Zkontrolujte Firestore security rules
- Zkontrolujte console log pro chyby

## 📚 Další dokumentace

- [VENDOR_REVIEWS_SYSTEM.md](./VENDOR_REVIEWS_SYSTEM.md) - Kompletní technická dokumentace
- [firestore.rules](./firestore.rules) - Security rules
- [firestore.indexes.json](./firestore.indexes.json) - Firestore indexy

## 🎯 Co dál?

### Budoucí vylepšení:
- [ ] Nahrávání obrázků k recenzi
- [ ] Odpovědi dodavatelů na recenze
- [ ] Email notifikace adminům při nové recenzi
- [ ] Report nevhodných recenzí
- [ ] Hromadné schvalování
- [ ] Export do CSV
- [ ] AI moderace (auto-reject spam)

## 💡 Tipy

1. **Testujte v incognito** - pro ověření veřejného zobrazení
2. **Používejte více účtů** - jeden user, jeden admin
3. **Zkontrolujte Firebase Console** - pro debugování queries a rules
4. **Sledujte console log** - pro chyby a warningy

## 📞 Support

Pro otázky a problémy:
- Zkontrolujte console log prohlížeče
- Zkontrolujte Firebase Console (Firestore a Rules)
- Kontaktujte development team