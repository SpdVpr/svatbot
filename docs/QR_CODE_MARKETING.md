# QR Kód Marketing Systém

## 📱 Přehled

Systém pro sledování návštěvnosti z offline marketingových materiálů pomocí QR kódů.

## 🎯 Funkce

### 1. QR Kód Generátor (Admin Dashboard)
- **Umístění**: Admin Dashboard → Marketing tab
- **URL**: `https://svatbot.cz?utm_source=qr_code&utm_medium=offline&utm_campaign=print_materials`
- **Funkce**:
  - Generování QR kódu s tracking parametry
  - Stažení PNG (vysoké rozlišení pro tisk)
  - Stažení SVG (pro další úpravy)
  - Tisk QR kódu
  - Kopírování tracking URL

### 2. Automatické Sledování Návštěv
- **Tracking Hook**: `useQRTracking()`
- **Spouští se**: Automaticky při načtení stránky s UTM parametry
- **Ukládá**:
  - Timestamp návštěvy
  - UTM parametry (source, medium, campaign)
  - User Agent (typ zařízení)
  - Referrer
  - Jazyk prohlížeče
  - Rozlišení obrazovky
  - URL a pathname

### 3. Statistiky v Admin Dashboardu
- **Celkem návštěv**: Všechny návštěvy přes QR kód
- **Dnes**: Návštěvy za dnešní den
- **Tento týden**: Posledních 7 dní
- **Tento měsíc**: Aktuální měsíc
- **Poslední návštěvy**: 10 nejnovějších návštěv s detaily

## 🔧 Technická Implementace

### Komponenty

#### 1. `AdminQRCode.tsx`
```typescript
// Generuje QR kód s tracking URL
<AdminQRCode 
  url="https://svatbot.cz" 
  size={300} 
/>
```

**Funkce**:
- QR kód s UTM parametry
- Download PNG (4x rozlišení pro tisk)
- Download SVG
- Tisk s formátováním
- Kopírování URL

#### 2. `QRCodeStats.tsx`
```typescript
// Zobrazuje statistiky návštěv
<QRCodeStats />
```

**Funkce**:
- Načítání dat z Firebase
- Výpočet statistik (dnes, týden, měsíc)
- Zobrazení posledních návštěv
- Real-time aktualizace

#### 3. `useQRTracking.ts`
```typescript
// Hook pro automatické sledování
useQRTracking()
```

**Funkce**:
- Detekce UTM parametrů
- Jednorázové sledování per session
- Ukládání do Firebase
- LocalStorage cache (1 hodina)

### Firebase Struktura

#### Kolekce: `qrCodeVisits`
```typescript
{
  timestamp: Timestamp,
  utmSource: 'qr_code',
  utmMedium: 'offline',
  utmCampaign: 'print_materials',
  userAgent: string,
  referrer: string,
  language: string,
  screenSize: string,
  url: string,
  pathname: string
}
```

#### Firestore Rules
```javascript
match /qrCodeVisits/{visitId} {
  // Anyone can create a visit (for tracking from QR codes)
  allow create: if true;

  // Only admins can read visits (for statistics)
  allow read: if isAdmin();

  // Only admins can update/delete visits
  allow update, delete: if isAdmin();
}
```

## 📊 Použití

### 1. Generování QR Kódu
1. Přihlaste se jako admin
2. Jděte na **Admin Dashboard → Marketing**
3. Najděte sekci "QR Kód pro svatbot.cz"
4. Stáhněte QR kód:
   - **PNG** - pro tisk (vysoké rozlišení)
   - **SVG** - pro grafické úpravy
   - **Tisk** - přímý tisk s formátováním

### 2. Použití v Materiálech
- ✅ Vizitky
- ✅ Letáky
- ✅ Roll-up bannery
- ✅ Tištěné reklamy
- ✅ Svatební veletrhy
- ✅ Časopisy
- ✅ Brožury

### 3. Sledování Statistik
1. Jděte na **Admin Dashboard → Marketing**
2. Prohlédněte si statistiky:
   - Celkový počet návštěv
   - Návštěvy dnes/týden/měsíc
   - Poslední návštěvy s detaily
3. Statistiky se aktualizují v reálném čase

## 🎨 Tipy pro Tisk

### Doporučené Velikosti
- **Vizitky**: 2x2 cm (minimální)
- **Letáky**: 3x3 cm (optimální)
- **Roll-up**: 10x10 cm (velké)
- **Časopisy**: 4x4 cm (střední)

### Kvalita Tisku
- Použijte **PNG verzi** pro tisk
- Rozlišení: 1200x1200 px (4x zvětšení)
- Formát: PNG s bílým pozadím
- Doporučený kontrast: Černý QR na bílém pozadí

### Umístění
- Viditelné místo
- Dostatečný kontrast
- Přidejte text: "Naskenujte pro více informací"
- URL pod QR kódem: `svatbot.cz`

## 🔍 Tracking Parametry

### UTM Parametry
```
utm_source=qr_code       // Zdroj: QR kód
utm_medium=offline       // Médium: Offline materiály
utm_campaign=print_materials  // Kampaň: Tištěné materiály
```

### Příklad URL
```
https://svatbot.cz?utm_source=qr_code&utm_medium=offline&utm_campaign=print_materials
```

## 📈 Metriky

### Sledované Metriky
- **Celkem návštěv**: Všechny návštěvy přes QR
- **Denní návštěvy**: Návštěvy za den
- **Týdenní návštěvy**: Posledních 7 dní
- **Měsíční návštěvy**: Aktuální měsíc
- **Typ zařízení**: Mobil vs Desktop
- **Čas návštěvy**: Timestamp každé návštěvy

### Budoucí Rozšíření
- [ ] Konverzní rate (registrace po QR návštěvě)
- [ ] Geografické rozložení
- [ ] A/B testování různých QR kampaní
- [ ] Export statistik do CSV/Excel
- [ ] Grafy a trendy v čase
- [ ] Porovnání s jinými zdroji návštěvnosti

## 🚀 Deployment

### 1. Deploy Firestore Rules
```bash
firebase deploy --only firestore:rules
```

### 2. Deploy Aplikace
```bash
npm run build
vercel --prod
```

## 🔐 Bezpečnost

- ✅ Pouze admini mohou číst statistiky
- ✅ Kdokoliv může vytvořit návštěvu (tracking)
- ✅ Žádné osobní údaje nejsou ukládány
- ✅ GDPR compliant (anonymní tracking)
- ✅ LocalStorage cache pro prevenci duplicit

## 📝 Poznámky

- Tracking funguje pouze s UTM parametry
- Jedna návštěva per session (1 hodina)
- Real-time statistiky v admin dashboardu
- Automatické sledování bez nutnosti konfigurace

