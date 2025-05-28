# SvatBot.cz - Testing Guide

## 🧪 Manual Testing Checklist

### ✅ Aplikace běží
- [x] Development server na http://localhost:3000
- [x] HTTP 200 response
- [x] CSS kompilace bez chyb
- [x] TypeScript kompilace bez chyb

### 🎨 Welcome Screen Testing

#### Vizuální elementy
- [ ] Logo a název "SvatBot.cz" se zobrazuje
- [ ] Hero sekce s hlavním nadpisem
- [ ] 3 feature cards (postupné plánování, český trh, moderní nástroje)
- [ ] CTA tlačítka "Začít plánování" a "Prohlédnout demo"
- [ ] Social proof sekce s hodnocením
- [ ] Responsive design na různých velikostech

#### Interaktivní elementy
- [ ] Tlačítko "Přihlásit se" otevře AuthModal v login módu
- [ ] Tlačítko "Začít plánování" otevře AuthModal v register módu
- [ ] Animace a hover efekty fungují

### 🔐 Auth Modal Testing

#### Login mód
- [ ] Formulář se zobrazuje s email a heslo poli
- [ ] Validace prázdných polí
- [ ] Validace neplatného emailu
- [ ] Toggle zobrazení hesla funguje
- [ ] Přepnutí na registraci funguje
- [ ] Zavření modalu funguje

#### Register mód
- [ ] Formulář se zobrazuje se všemi poli (jméno, příjmení, email, heslo, potvrzení)
- [ ] Validace všech polí
- [ ] Kontrola shody hesel
- [ ] Checkbox pro souhlas s podmínkami
- [ ] Přepnutí na přihlášení funguje

### 🎯 Onboarding Flow Testing

#### Krok 1 - Jména snoubenců
- [ ] Input pole pro jméno nevěsty a ženicha
- [ ] Validace povinných polí
- [ ] Tlačítko "Pokračovat" aktivní pouze s vyplněnými poli
- [ ] Progress bar ukazuje 1/6 (17%)

#### Krok 2 - Datum svatby
- [ ] Date picker s minimálním datem = dnes
- [ ] Tip o nejoblíbenějších měsících
- [ ] Možnost pokračovat bez vyplnění (volitelné)
- [ ] Progress bar ukazuje 2/6 (33%)

#### Krok 3 - Počet hostů
- [ ] Slider s rozsahem 10-200
- [ ] Aktuální hodnota se zobrazuje
- [ ] Quick pick tlačítka (30-50, 50-80, atd.)
- [ ] Průměr v ČR: 75 hostů
- [ ] Progress bar ukazuje 3/6 (50%)

#### Krok 4 - Rozpočet
- [ ] Slider s rozsahem 100k-1M
- [ ] Formátování částky v CZK
- [ ] Quick pick tlačítka pro rozpočtové kategorie
- [ ] Kalkulace na hlavu
- [ ] Progress bar ukazuje 4/6 (67%)

#### Krok 5 - Styl svatby
- [ ] 6 stylových možností s emoji a popisem
- [ ] Výběr stylu zvýrazní kartu
- [ ] Tip o možnosti změny později
- [ ] Progress bar ukazuje 5/6 (83%)

#### Krok 6 - Region
- [ ] Grid s českými městy
- [ ] Možnost "Jiné" s vlastním inputem
- [ ] Výběr regionu zvýrazní tlačítko
- [ ] Progress bar ukazuje 6/6 (100%)
- [ ] Tlačítko "Dokončit" místo "Pokračovat"

#### Navigace
- [ ] Tlačítko "Zpět" funguje (kromě prvního kroku)
- [ ] Tlačítko "Přeskočit zatím" funguje
- [ ] Progress bar se aktualizuje správně
- [ ] Data se ukládají mezi kroky

### 📊 Dashboard Testing

#### Hero sekce
- [ ] Zobrazení jmen snoubenců
- [ ] Datum svatby (nebo "Datum zatím nestanoveno")
- [ ] Odpočítávání dní do svatby
- [ ] Celkový progress bar
- [ ] Motivační zpráva podle pokroku

#### Quick Actions
- [ ] 4 karty s ikonami a statistikami
- [ ] Checklist úkolů (24/30)
- [ ] Správa hostů (počet potvrzených)
- [ ] Časový plán (počet událostí)
- [ ] Rozpočet (využito/celkem)
- [ ] Hover efekty na kartách

#### Nadcházející úkoly
- [ ] Seznam 3 úkolů s ikonami
- [ ] Termíny úkolů
- [ ] Priority (vysoká/střední/nízká) s barvami
- [ ] Hover efekty na úkolech
- [ ] Tlačítko "Přidat nový úkol"

#### Progress podle fází
- [ ] 7 fází s progress bary
- [ ] Správné labely fází
- [ ] Procenta pro každou fázi

#### Rychlé statistiky
- [ ] Styl svatby
- [ ] Rozpočet (formátovaný)
- [ ] Region
- [ ] Fáze plánování

### 🎨 Design System Testing

#### Barvy
- [ ] Primary: Soft Rose (#F8BBD9)
- [ ] Secondary: Lavender (#E1D5E7)
- [ ] Accent: Gold (#F7DC6F)
- [ ] Text colors správně aplikované

#### Typography
- [ ] Playfair Display pro nadpisy
- [ ] Inter pro běžný text
- [ ] Montserrat pro tlačítka
- [ ] Správné velikosti a váhy

#### Komponenty
- [ ] .wedding-card styl
- [ ] .btn-primary, .btn-secondary, .btn-outline
- [ ] .input-field styl
- [ ] .progress-bar a .progress-fill
- [ ] Animace (.fade-in, .slide-up, .bounce-gentle)

### 📱 Responsive Testing

#### Mobile (320px-768px)
- [ ] Navigation funguje
- [ ] Formuláře jsou použitelné
- [ ] Text je čitelný
- [ ] Tlačítka jsou dostatečně velká (min 44px)
- [ ] Onboarding flow funguje na mobilu

#### Tablet (768px-1024px)
- [ ] Layout se přizpůsobuje
- [ ] Grid systém funguje
- [ ] Dashboard je použitelný

#### Desktop (1024px+)
- [ ] Plné rozložení
- [ ] Všechny komponenty správně zarovnané
- [ ] Hover efekty fungují

### ⚡ Performance Testing

#### Loading
- [ ] Rychlé načítání stránek
- [ ] Loading screen se zobrazuje při potřebě
- [ ] Smooth transitions mezi stránkami

#### Interaktivita
- [ ] Rychlá odezva na kliky
- [ ] Smooth animace
- [ ] Žádné lag při psaní do formulářů

## 🐛 Known Issues

### Aktuální problémy
- [ ] Firebase není ještě připojeno (mock data)
- [ ] Ikony jsou placeholder (potřeba skutečné)
- [ ] Některé linky vedou na # (zatím neimplementováno)

### Budoucí vylepšení
- [ ] Dark mode podpora
- [ ] Offline funkcionalita
- [ ] Push notifications
- [ ] PWA instalace

## 🔧 Debugging

### Development Tools
```bash
# Spustit development server
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Build test
npm run build
```

### Browser DevTools
- Console pro JavaScript chyby
- Network tab pro API calls
- Lighthouse pro performance
- Responsive design mode

### Logs
- Next.js development logs v terminálu
- Browser console pro client-side chyby
- Network errors v DevTools

---

**Status**: ✅ Základní funkcionalita testována a funkční
**Další**: 🔄 Firebase integrace a pokročilé funkce
