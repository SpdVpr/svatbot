# Systém správy ubytování - Dokumentace

## 📋 Přehled

Kompletní systém správy ubytování pro svatební plánovač umožňuje organizátorům spravovat ubytování pro hosty a integruje se s celou aplikací.

## 🏗️ Architektura systému

### 1. **Datové typy** (`src/types/index.ts`)

#### Accommodation Interface
```typescript
interface Accommodation {
  id: string
  weddingId: string
  name: string
  description?: string
  address: Address
  coordinates?: { lat: number; lng: number }
  contactInfo: ContactInfo
  website?: string
  images: string[]
  amenities: string[]
  rooms: Room[]
  policies?: AccommodationPolicies
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
```

#### Room Interface
```typescript
interface Room {
  id: string
  accommodationId: string
  name: string
  description?: string
  type: RoomType
  capacity: number
  bedConfiguration: BedConfiguration[]
  pricePerNight: number
  totalPrice?: number
  amenities: string[]
  images: string[]
  isAvailable: boolean
  maxOccupancy: number
  reservations: RoomReservation[]
  createdAt: Date
  updatedAt: Date
}
```

### 2. **Custom Hook** (`src/hooks/useAccommodation.ts`)

Centralizovaný hook pro správu ubytování s funkcemi:
- ✅ Real-time načítání ubytování z Firestore
- ✅ CRUD operace pro ubytování a pokoje
- ✅ Statistiky (obsazenost, dostupné pokoje)
- ✅ Rezervační systém
- ✅ Helper funkce pro dotazy

### 3. **Dashboard modul** (`src/components/dashboard/modules/AccommodationManagementModule.tsx`)

Přehledový modul na dashboardu zobrazující:
- 📊 Statistiky ubytování (počet ubytování, pokojů, obsazenost)
- 🏨 Nedávno přidaná ubytování
- 🔗 Rychlé odkazy na správu

## 🖥️ Uživatelské rozhraní

### 1. **Hlavní stránka správy** (`src/app/accommodation/page.tsx`)

**Funkce:**
- 📋 Seznam všech ubytování s filtry
- 📊 Statistiky v kartách nahoře
- 🔍 Vyhledávání podle názvu/města
- ➕ Přidání nového ubytování
- ✏️ Editace/mazání existujících

**Zobrazované informace:**
- Název a adresa ubytování
- Počet pokojů a dostupnost
- Kontaktní informace
- Fotografie (pokud jsou nahrané)
- Status (aktivní/neaktivní)

### 2. **Přidání ubytování** (`src/app/accommodation/new/page.tsx`)

**Formulář obsahuje:**
- 📝 Základní informace (název, popis)
- 📍 Adresa (ulice, město, PSČ)
- 📞 Kontaktní údaje (email, telefon, web)
- 🏷️ Vybavení (WiFi, parkování, atd.)
- 📋 Pravidla a podmínky

### 3. **Detail ubytování** (`src/app/accommodation/[id]/page.tsx`)

**Taby:**
- **Přehled:** Základní info, vybavení, adresa, kontakt
- **Pokoje:** Seznam pokojů s možností přidání/editace
- **Rezervace:** Správa rezervací (připraveno pro budoucí rozšíření)

### 4. **Přidání pokoje** (`src/app/accommodation/[id]/rooms/new/page.tsx`)

**Formulář pokoje:**
- 🛏️ Základní info (název, typ, kapacita)
- 💰 Cena za noc
- 🛏️ Konfigurace lůžek (typ a počet)
- 🏷️ Vybavení pokoje
- 📝 Popis

## 🔗 Integrace s hosty

### Guest Form rozšíření (`src/components/guests/GuestForm.tsx`)

**Nová sekce "Ubytování":**
- ☑️ Checkbox "Host potřebuje ubytování"
- 🏨 Dropdown výběr ubytování
- 🛏️ Dropdown výběr pokoje
- ℹ️ Zobrazení detailů vybraného pokoje

**Propojení dat:**
- `accommodationNeeded: boolean`
- `accommodationId?: string`
- `roomId?: string`

## 🌐 Integrace do svatebního webu

### 1. **Wedding Builder** (`src/components/wedding-website/builder/sections/AccommodationSectionEditor.tsx`)

**Nastavení sekce:**
- ✅ Zapnutí/vypnutí sekce
- 📝 Vlastní nadpis a popis
- 💰 Zobrazení cen (ano/ne)
- 👥 Zobrazení dostupnosti (ano/ne)
- 📞 Kontaktní informace pro rezervace

### 2. **Zobrazení na webu**

#### Classic šablona (`src/components/wedding-website/templates/classic/AccommodationSection.tsx`)
- 🎨 Elegantní design s kartami
- 📸 Fotografie ubytování
- 💰 Cenové rozpětí pokojů
- 🏷️ Vybavení (první 3 + počet dalších)
- 📞 Kontaktní informace

#### Modern šablona (`src/components/wedding-website/templates/modern/AccommodationSection.tsx`)
- 🎨 Minimalistický design
- 📱 Responzivní layout
- 💫 Hover efekty
- 📊 Stejné informace jako Classic

## 🔥 Firebase integrace

### Firestore kolekce:
```
weddings/{weddingId}/accommodations/{accommodationId}
```

### Bezpečnostní pravidla:
- ✅ Izolace dat podle weddingId
- ✅ Pouze vlastník svatby může číst/zapisovat
- ✅ Real-time synchronizace

## 📊 Statistiky a metriky

**Dashboard zobrazuje:**
- 🏨 Celkový počet ubytování
- 🛏️ Celkový počet pokojů
- ✅ Dostupné pokoje
- 📈 Procento obsazenosti
- 📋 Počet rezervací

## 🚀 Použití

### 1. **Pro organizátory svatby:**
1. Přejít na Dashboard → kliknout na modul "Ubytování"
2. Přidat nové ubytování s kontaktními údaji
3. Přidat pokoje s cenami a vybavením
4. Aktivovat sekci v Wedding Builderu
5. Hosté uvidí ubytování na svatebním webu

### 2. **Pro hosty:**
1. Organizátor přiřadí ubytování při správě hostů
2. Host vidí doporučená ubytování na svatebním webu
3. Kontaktuje ubytování přímo nebo organizátora

## 🔮 Budoucí rozšíření

**Připraveno pro:**
- 📅 Rezervační kalendář
- 💳 Online platby
- 📧 Automatické emaily
- 📱 Mobilní notifikace
- 🔄 Synchronizace s booking systémy
- 📊 Pokročilé reporty

## 🧪 Testování

**Implementované testy:**
- ✅ Komponenty ubytování
- ✅ Hook funkcionalita
- ✅ Integrace s wedding builderem

**Spuštění testů:**
```bash
npm test -- --testPathPattern=accommodation
```

## 📝 Poznámky pro vývojáře

1. **Všechny komponenty jsou TypeScript** s plnou typovou bezpečností
2. **Real-time updates** díky Firestore onSnapshot
3. **Responzivní design** pro všechna zařízení
4. **Accessibility** - správné labely a ARIA atributy
5. **Error handling** - graceful degradation při chybách
6. **Loading states** - indikátory načítání
7. **Optimalizace** - lazy loading a memoization kde je to vhodné

---

**Status:** ✅ **KOMPLETNÍ IMPLEMENTACE**
**Verze:** 1.0.0
**Datum:** 2025-01-02
