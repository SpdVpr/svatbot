# ✅ Presentation Checklist - Demo Account

Rychlý checklist pro přípravu demo účtu před prezentací.

## 🎯 Před prezentací (15 minut)

### 1. Příprava demo účtu

```bash
# Vytvořte čistý demo účet
npm run demo:delete && npm run demo:create
```

- [ ] Skript proběhl bez chyb
- [ ] Zobrazilo se: "🎉 Demo account setup complete!"
- [ ] Vidíte přihlašovací údaje v konzoli

### 2. Ověření přihlášení

- [ ] Otevřete https://svatbot.cz (nebo localhost:3000)
- [ ] Přihlaste se:
  - Email: demo@svatbot.cz
  - Heslo: demo123
- [ ] Přihlášení proběhlo úspěšně
- [ ] Vidíte dashboard

### 3. Kontrola modulů

#### Dashboard
- [ ] Zobrazuje se svatební profil (Jana & Petr)
- [ ] Vidíte celkový pokrok (73%)
- [ ] Zobrazují se moduly s daty

#### Hosté
- [ ] Vidíte 3 hosty
- [ ] Marie Nováková - potvrzena ✅
- [ ] Jan Novák - potvrzena ✅ (s doprovodem)
- [ ] Petra Svobodová - čeká na potvrzení ⏳
- [ ] Funguje filtrování a vyhledávání

#### Úkoly
- [ ] Vidíte 3 úkoly
- [ ] 1 dokončený ✅
- [ ] 1 probíhá 🔄
- [ ] 1 čeká ⏳
- [ ] Funguje přidání nového úkolu

#### Ubytování
- [ ] Vidíte 2 ubytovací zařízení
- [ ] Hotel Château Mcely s obrázky
- [ ] Penzion U Lípy s obrázky
- [ ] Zobrazují se pokoje
- [ ] Obrázky se načítají správně

#### Moodboard
- [ ] Vidíte 6 obrázků
- [ ] Obrázky se načítají správně
- [ ] 4 oblíbené obrázky (⭐)
- [ ] Funguje filtrování podle kategorií
- [ ] Funguje přidání nového obrázku

#### Menu
- [ ] Vidíte 2 jídla (Svíčková, Losos)
- [ ] Vidíte 2 nápoje (Prosecco, Limonáda)
- [ ] Zobrazují se ceny
- [ ] Funguje přidání nové položky

#### Dodavatelé
- [ ] Vidíte 2 dodavatele
- [ ] Photo Nejedlí (fotograf) ⭐⭐⭐⭐⭐
- [ ] Catering Elegance ⭐⭐⭐⭐⭐
- [ ] Zobrazují se portfolio obrázky
- [ ] Funguje detail dodavatele

#### Hudba
- [ ] Vidíte DJ Martin
- [ ] Zobrazují se kategorie
- [ ] Nástup nevěsty: A Thousand Years
- [ ] První tanec: Perfect
- [ ] Funguje přidání nové písně

#### Poznámky
- [ ] Vidíte 2 poznámky
- [ ] Důležité kontakty (připnuto 📌)
- [ ] Nápady na dekorace
- [ ] Funguje vytvoření nové poznámky

#### Timeline
- [ ] Vidíte 2 milníky
- [ ] Rezervace místa - dokončeno ✅
- [ ] Výběr šatů - probíhá 🔄
- [ ] Zobrazuje se harmonogram svatebního dne (5 položek)
- [ ] Funguje přidání nového milníku

### 4. Kontrola obrázků

- [ ] Všechny obrázky se načítají
- [ ] Žádné chybějící obrázky (broken images)
- [ ] Obrázky mají dobrou kvalitu
- [ ] Thumbnaily fungují správně

### 5. Kontrola funkcí

- [ ] Funguje navigace mezi stránkami
- [ ] Funguje přidávání nových položek
- [ ] Funguje editace existujících položek
- [ ] Funguje mazání položek
- [ ] Funguje vyhledávání a filtrování

## 🎤 Během prezentace

### Scénář prezentace (15-20 minut)

#### 1. Úvod (2 minuty)
- [ ] Představte aplikaci Svatbot
- [ ] Vysvětlete účel - komplexní svatební plánovač
- [ ] Ukažte přihlašovací obrazovku

#### 2. Dashboard (3 minuty)
- [ ] Ukažte přehled svatby (Jana & Petr)
- [ ] Vysvětlete celkový pokrok (73%)
- [ ] Projděte jednotlivé kategorie pokroku
- [ ] Ukažte rychlé akce

#### 3. Správa hostů (3 minuty)
- [ ] Ukažte seznam hostů
- [ ] Demonstrujte různé kategorie
- [ ] Ukažte RSVP statusy
- [ ] Přidejte nového hosta (volitelně)
- [ ] Ukažte filtrování a export

#### 4. Plánování (3 minuty)
- [ ] Ukažte úkoly v různých stavech
- [ ] Demonstrujte timeline s milníky
- [ ] Ukažte harmonogram svatebního dne
- [ ] Vysvětlete automatické připomínky

#### 5. Ubytování (2 minuty)
- [ ] Ukažte ubytovací zařízení s obrázky
- [ ] Demonstrujte správu pokojů
- [ ] Ukažte přiřazení hostů k pokojům
- [ ] Vysvětlete cenové kalkulace

#### 6. Kreativní nástroje (2 minuty)
- [ ] Ukažte moodboard s inspiračními obrázky
- [ ] Demonstrujte kategorizaci
- [ ] Ukažte oblíbené položky
- [ ] Vysvětlete možnost nahrávání vlastních obrázků

#### 7. Dodavatelé a služby (2 minuty)
- [ ] Ukažte seznam dodavatelů
- [ ] Demonstrujte portfolio
- [ ] Ukažte kontaktní informace
- [ ] Vysvětlete propojení s rozpočtem

#### 8. Závěr (2 minuty)
- [ ] Shrňte klíčové funkce
- [ ] Ukažte mobilní responzivitu (volitelně)
- [ ] Zodpovězte otázky
- [ ] Poskytněte kontaktní informace

## 📱 Tipy pro prezentaci

### Technické tipy
- [ ] Použijte velký monitor nebo projektor
- [ ] Nastavte zoom prohlížeče na 110-125% pro lepší viditelnost
- [ ] Zavřete nepotřebné záložky
- [ ] Vypněte notifikace
- [ ] Připravte si záložní plán (offline demo)

### Prezentační tipy
- [ ] Mluvte pomalu a jasně
- [ ] Vysvětlujte, co děláte
- [ ] Nechte prostor pro otázky
- [ ] Ukažte reálné use-case scénáře
- [ ] Zdůrazněte unikátní funkce

### Co ukázat
- ✅ Komplexnost plánování svatby
- ✅ Intuitivní uživatelské rozhraní
- ✅ Vizuální atraktivitu (obrázky)
- ✅ Propojení mezi moduly
- ✅ Automatizaci a chytré funkce

### Co neukázat
- ❌ Technické detaily implementace
- ❌ Chyby nebo nedokončené funkce
- ❌ Složité administrativní funkce
- ❌ Příliš mnoho detailů najednou

## 🔧 Řešení problémů během prezentace

### Obrázky se nenačítají
**Řešení:** Zkontrolujte internetové připojení, obnovte stránku

### Data se nezobrazují
**Řešení:** Odhlaste se a přihlaste znovu

### Aplikace je pomalá
**Řešení:** Zavřete ostatní aplikace, obnovte stránku

### Něco nefunguje
**Řešení:** Přejděte k jinému modulu, vraťte se později

## ✅ Po prezentaci

### Okamžitě po prezentaci
- [ ] Zodpovězte otázky
- [ ] Poskytněte demo přístup (volitelně)
- [ ] Sdílejte kontaktní informace
- [ ] Domluvte další kroky

### Později
- [ ] Obnovte demo data (volitelně):
  ```bash
  npm run demo:delete && npm run demo:create
  ```
- [ ] Zaznamenejte feedback
- [ ] Aktualizujte demo data podle potřeby

## 📊 Metriky úspěchu

Po prezentaci vyhodnoťte:

- [ ] Všechny moduly fungovaly správně
- [ ] Obrázky se načetly bez problémů
- [ ] Prezentace trvala plánovanou dobu
- [ ] Publikum bylo zapojené
- [ ] Otázky byly relevantní
- [ ] Získali jste pozitivní feedback

## 🎯 Rychlá kontrola (2 minuty)

Před začátkem prezentace:

```bash
# 1. Vytvořte demo účet
npm run demo:delete && npm run demo:create

# 2. Přihlaste se
# Email: demo@svatbot.cz
# Heslo: demo123

# 3. Zkontrolujte:
✅ Dashboard - vidíte data
✅ Hosté - 3 hosté
✅ Ubytování - obrázky se načítají
✅ Moodboard - 6 obrázků
✅ Dodavatelé - portfolio se zobrazuje

# 4. Jste připraveni! 🎉
```

## 📞 Nouzové kontakty

Pokud něco selže:

1. **Technická podpora:** [váš kontakt]
2. **Firebase Console:** https://console.firebase.google.com/project/svatbot-app
3. **Záložní demo:** Použijte localhost místo produkce

---

**Hodně štěstí s prezentací! 🎉**

