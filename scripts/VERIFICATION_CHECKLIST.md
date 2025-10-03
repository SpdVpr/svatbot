# ✅ Verification Checklist - Demo Account

Checklist pro ověření, že demo účet funguje správně.

## 🎯 Před spuštěním

### Požadavky
- [ ] Node.js 18+ nainstalován
- [ ] npm nebo yarn nainstalován
- [ ] firebase-admin nainstalován (`npm install firebase-admin`)
- [ ] Service Account Key stažen (`firebase-service-account.json`)
- [ ] Service Account Key umístěn v root adresáři

### Kontrola souborů
- [ ] `scripts/create-demo-account.js` existuje
- [ ] `scripts/delete-demo-account.js` existuje
- [ ] `scripts/update-demo-data.js` existuje
- [ ] `firebase-service-account.json` existuje v root
- [ ] `package.json` obsahuje demo skripty

## 🚀 Spuštění skriptu

### Vytvoření demo účtu
```bash
npm run demo:create
```

- [ ] Skript se spustil bez chyb
- [ ] Zobrazilo se: "🎭 Creating demo account..."
- [ ] Zobrazilo se: "✅ Demo user created" nebo "✅ Demo user already exists"
- [ ] Zobrazilo se: "✅ Demo wedding created"
- [ ] Zobrazilo se: "✅ Demo tasks created"
- [ ] Zobrazilo se: "✅ Demo guests created"
- [ ] Zobrazilo se: "✅ Demo accommodations created"
- [ ] Zobrazilo se: "✅ Demo moodboard images created"
- [ ] Zobrazilo se: "✅ Demo menu items created"
- [ ] Zobrazilo se: "✅ Demo drink items created"
- [ ] Zobrazilo se: "✅ Demo vendors created"
- [ ] Zobrazilo se: "✅ Demo music data created"
- [ ] Zobrazilo se: "✅ Demo notes created"
- [ ] Zobrazilo se: "✅ Demo timeline milestones created"
- [ ] Zobrazilo se: "✅ Demo AI timeline items created"
- [ ] Zobrazilo se: "🎉 Demo account setup complete!"
- [ ] Zobrazily se přihlašovací údaje

## 🔐 Přihlášení

### Otevření aplikace
- [ ] Otevřete https://svatbot.cz (nebo localhost:3000)
- [ ] Zobrazila se přihlašovací stránka

### Přihlášení
- [ ] Email: demo@svatbot.cz
- [ ] Heslo: demo123
- [ ] Přihlášení proběhlo úspěšně
- [ ] Přesměrování na dashboard

## 📊 Kontrola dat - Dashboard

- [ ] Zobrazuje se svatební profil
- [ ] Jména: Jana & Petr
- [ ] Datum svatby je zobrazeno
- [ ] Počet hostů: 85
- [ ] Rozpočet: 450 000 Kč
- [ ] Celkový pokrok: 73%
- [ ] Zobrazují se kategorie pokroku
- [ ] Základy: 100%
- [ ] Místo konání: 85%
- [ ] Hosté: 80%
- [ ] Rozpočet: 65%
- [ ] Design: 45%
- [ ] Organizace: 30%
- [ ] Finální přípravy: 0%

## 👥 Kontrola dat - Hosté

- [ ] Navigace na stránku Hosté funguje
- [ ] Zobrazuje se počet hostů: 3
- [ ] Zobrazuje se Marie Nováková
  - [ ] Kategorie: Rodina nevěsty
  - [ ] RSVP: Potvrzena ✅
  - [ ] Email: marie.novakova@email.cz
  - [ ] Telefon: +420 777 123 456
- [ ] Zobrazuje se Jan Novák
  - [ ] Kategorie: Rodina ženicha
  - [ ] RSVP: Potvrzena ✅
  - [ ] Doprovod: Eva Nováková
  - [ ] Děti: Tomáš (8 let)
- [ ] Zobrazuje se Petra Svobodová
  - [ ] Kategorie: Přátelé
  - [ ] RSVP: Čeká na potvrzení ⏳
  - [ ] Strava: Vegetariánka

## 📋 Kontrola dat - Úkoly

- [ ] Navigace na stránku Úkoly funguje
- [ ] Zobrazuje se počet úkolů: 3
- [ ] Zobrazuje se "Rezervovat místo konání"
  - [ ] Status: Dokončeno ✅
  - [ ] Priorita: Vysoká
- [ ] Zobrazuje se "Objednat svatební fotografa"
  - [ ] Status: Probíhá 🔄
  - [ ] Priorita: Vysoká
- [ ] Zobrazuje se "Vybrat svatební šaty"
  - [ ] Status: Čeká ⏳
  - [ ] Priorita: Střední

## 🏨 Kontrola dat - Ubytování

- [ ] Navigace na stránku Ubytování funguje
- [ ] Zobrazuje se počet ubytování: 2
- [ ] Zobrazuje se Hotel Château Mcely
  - [ ] Název je správný
  - [ ] Popis je zobrazen
  - [ ] Adresa: Mcely 61, 289 36 Mcely
  - [ ] Telefon: +420 325 600 000
  - [ ] Obrázky se načítají (3 obrázky)
  - [ ] Zobrazují se pokoje (2)
  - [ ] Deluxe pokoj - 3 500 Kč/noc
  - [ ] Rodinný apartmán - 5 000 Kč/noc
- [ ] Zobrazuje se Penzion U Lípy
  - [ ] Název je správný
  - [ ] Popis je zobrazen
  - [ ] Obrázky se načítají (2 obrázky)

## 🎨 Kontrola dat - Moodboard

- [ ] Navigace na stránku Moodboard funguje
- [ ] Zobrazuje se počet obrázků: 6
- [ ] Všechny obrázky se načítají
- [ ] Zobrazuje se "Svatební místo - zámek" ⭐
- [ ] Zobrazuje se "Květinová výzdoba" ⭐
- [ ] Zobrazuje se "Svatební šaty"
- [ ] Zobrazuje se "Svatební dort" ⭐
- [ ] Zobrazuje se "Stolní dekorace"
- [ ] Zobrazuje se "Svatební prsteny" ⭐
- [ ] 4 obrázky jsou označeny jako oblíbené
- [ ] Funguje filtrování podle kategorií

## 🍽️ Kontrola dat - Menu

- [ ] Navigace na stránku Menu funguje
- [ ] Zobrazují se jídla (2)
- [ ] Zobrazuje se "Hovězí svíčková"
  - [ ] Cena: 280 Kč/porce
  - [ ] Množství: 50 porcí
  - [ ] Celkem: 14 000 Kč
  - [ ] Dodavatel: Catering Elegance
- [ ] Zobrazuje se "Grilovaný losos"
  - [ ] Cena: 320 Kč/porce
  - [ ] Množství: 35 porcí
  - [ ] Celkem: 11 200 Kč
  - [ ] Bezlepkové: Ano
- [ ] Zobrazují se nápoje (2)
- [ ] Zobrazuje se "Prosecco"
  - [ ] Cena: 150 Kč/sklenice
  - [ ] Množství: 100 sklenic
  - [ ] Alkoholické: Ano
- [ ] Zobrazuje se "Domácí limonáda"
  - [ ] Cena: 40 Kč/sklenice
  - [ ] Množství: 150 sklenic
  - [ ] Nealkoholické: Ano

## 👔 Kontrola dat - Dodavatelé

- [ ] Navigace na stránku Dodavatelé funguje
- [ ] Zobrazuje se počet dodavatelů: 2
- [ ] Zobrazuje se Photo Nejedlí
  - [ ] Kategorie: Fotograf
  - [ ] Status: Rezervováno
  - [ ] Hodnocení: ⭐⭐⭐⭐⭐
  - [ ] Kontakt: Jan Nejedlý
  - [ ] Email: jan@photonejedli.cz
  - [ ] Telefon: +420 777 123 456
  - [ ] Portfolio obrázky se načítají (2)
- [ ] Zobrazuje se Catering Elegance
  - [ ] Kategorie: Catering
  - [ ] Status: Rezervováno
  - [ ] Hodnocení: ⭐⭐⭐⭐⭐
  - [ ] Kontakt: Marie Svobodová
  - [ ] Portfolio obrázky se načítají (2)

## 🎵 Kontrola dat - Hudba

- [ ] Navigace na stránku Hudba funguje
- [ ] Zobrazuje se DJ: DJ Martin
- [ ] Zobrazuje se kontakt
- [ ] Zobrazuje se kategorie "Nástup nevěsty"
  - [ ] Píseň: A Thousand Years - Christina Perri
- [ ] Zobrazuje se kategorie "První tanec"
  - [ ] Píseň: Perfect - Ed Sheeran

## 📝 Kontrola dat - Poznámky

- [ ] Navigace na stránku Poznámky funguje
- [ ] Zobrazuje se počet poznámek: 2
- [ ] Zobrazuje se "Důležité kontakty"
  - [ ] Je připnuta 📌
  - [ ] Obsahuje kontakty
- [ ] Zobrazuje se "Nápady na dekorace"
  - [ ] Obsahuje nápady

## 📅 Kontrola dat - Timeline

- [ ] Navigace na stránku Timeline funguje
- [ ] Zobrazují se milníky (2)
- [ ] Zobrazuje se "Rezervace místa konání"
  - [ ] Status: Dokončeno ✅
  - [ ] Pokrok: 100%
- [ ] Zobrazuje se "Výběr svatebních šatů"
  - [ ] Status: Probíhá 🔄
  - [ ] Pokrok: 50%
- [ ] Zobrazuje se harmonogram svatebního dne (5 položek)
- [ ] 09:00 - Příprava nevěsty
- [ ] 14:00 - Svatební obřad
- [ ] 15:00 - Gratulace a focení
- [ ] 18:00 - Svatební hostina
- [ ] 21:00 - První tanec a zábava

## 🖼️ Kontrola obrázků

### Ubytování
- [ ] Hotel Château Mcely - obrázek 1 se načítá
- [ ] Hotel Château Mcely - obrázek 2 se načítá
- [ ] Hotel Château Mcely - obrázek 3 se načítá
- [ ] Penzion U Lípy - obrázek 1 se načítá
- [ ] Penzion U Lípy - obrázek 2 se načítá
- [ ] Deluxe pokoj - obrázek se načítá
- [ ] Rodinný apartmán - obrázek se načítá

### Moodboard
- [ ] Všech 6 obrázků se načítá
- [ ] Žádné broken images
- [ ] Obrázky mají dobrou kvalitu

### Portfolio dodavatelů
- [ ] Photo Nejedlí - obrázek 1 se načítá
- [ ] Photo Nejedlí - obrázek 2 se načítá
- [ ] Catering Elegance - obrázek 1 se načítá
- [ ] Catering Elegance - obrázek 2 se načítá

## ⚙️ Kontrola funkcí

### Základní funkce
- [ ] Navigace mezi stránkami funguje
- [ ] Odhlášení funguje
- [ ] Přihlášení zpět funguje
- [ ] Data zůstávají zachována

### CRUD operace
- [ ] Lze přidat nového hosta
- [ ] Lze editovat existujícího hosta
- [ ] Lze smazat hosta
- [ ] Lze přidat nový úkol
- [ ] Lze editovat úkol
- [ ] Lze označit úkol jako dokončený

### Filtrování a vyhledávání
- [ ] Vyhledávání hostů funguje
- [ ] Filtrování hostů podle kategorie funguje
- [ ] Filtrování úkolů podle statusu funguje
- [ ] Filtrování moodboard podle kategorie funguje

## 🔥 Kontrola Firebase

### Firebase Console
- [ ] Otevřete [Firebase Console](https://console.firebase.google.com/project/svatbot-app)
- [ ] Přejděte do Authentication
- [ ] Vidíte uživatele demo@svatbot.cz
- [ ] Přejděte do Firestore
- [ ] Vidíte kolekci `weddings`
- [ ] Vidíte kolekci `guests` (3 dokumenty)
- [ ] Vidíte kolekci `tasks` (3 dokumenty)
- [ ] Vidíte kolekci `accommodations` (2 dokumenty)
- [ ] Vidíte kolekci `moodboards` (6 dokumentů)
- [ ] Vidíte kolekci `menuItems` (2 dokumenty)
- [ ] Vidíte kolekci `drinkItems` (2 dokumenty)
- [ ] Vidíte kolekci `vendors` (2 dokumenty)
- [ ] Vidíte kolekci `notes` (2 dokumenty)
- [ ] Vidíte kolekci `milestones` (2 dokumenty)
- [ ] Vidíte kolekci `aiTimelineItems` (5 dokumentů)

## 🧹 Smazání demo účtu

```bash
npm run demo:delete
```

- [ ] Skript se spustil bez chyb
- [ ] Zobrazilo se: "🗑️ Deleting demo account..."
- [ ] Zobrazilo se: "✅ Found demo user"
- [ ] Zobrazilo se: "✅ Found demo wedding"
- [ ] Zobrazilo se: "✅ Deleted [kolekce]" pro všechny kolekce
- [ ] Zobrazilo se: "✅ Deleted wedding"
- [ ] Zobrazilo se: "✅ Deleted user profile"
- [ ] Zobrazilo se: "✅ Deleted user from Authentication"
- [ ] Zobrazilo se: "🎉 Demo account deleted successfully!"

### Ověření smazání
- [ ] V Firebase Console není uživatel demo@svatbot.cz
- [ ] V Firestore nejsou demo data
- [ ] Přihlášení s demo@svatbot.cz nefunguje

## ✅ Finální kontrola

- [ ] Všechny moduly obsahují data
- [ ] Všechny obrázky se načítají
- [ ] Žádné chyby v konzoli
- [ ] Aplikace je responzivní
- [ ] Data jsou konzistentní
- [ ] Vytvoření demo účtu funguje
- [ ] Smazání demo účtu funguje
- [ ] Dokumentace je kompletní

## 📊 Výsledek

### Úspěšnost
- **Celkem kontrol:** ~150
- **Úspěšných:** _____ / 150
- **Neúspěšných:** _____ / 150
- **Úspěšnost:** _____ %

### Status
- [ ] ✅ Vše funguje perfektně (100%)
- [ ] ⚠️ Drobné problémy (90-99%)
- [ ] ❌ Závažné problémy (<90%)

### Poznámky
```
Zde zapište jakékoliv problémy nebo poznámky:




```

---

**Datum kontroly:** __________
**Kontroloval:** __________
**Verze:** 1.0.0

