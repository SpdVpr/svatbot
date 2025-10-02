# 🏨 Propojení hostů s ubytováním - Obsazenost pokojů

## 📋 Přehled

Systém nyní plně propojuje data hostů s modulem ubytování, zobrazuje skutečnou obsazenost pokojů na základě přiřazených hostů a poskytuje detailní statistiky.

## 🔧 Technická implementace

### 1. **Nový hook: useAccommodationWithGuests**

Centralizovaný hook, který propojuje data z `useAccommodation` a `useRobustGuests`:

```typescript
// src/hooks/useAccommodationWithGuests.ts
export function useAccommodationWithGuests() {
  const { accommodations, loading: accommodationLoading, ...accommodationMethods } = useAccommodation()
  const { guests, loading: guestsLoading } = useRobustGuests()

  // Propojení dat hostů s pokoji
  const accommodationsWithOccupancy = useMemo(() => {
    return accommodations.map(accommodation => {
      const roomOccupancies = accommodation.rooms.map(room => {
        const assignedGuest = guests.find(guest => 
          guest.accommodationId === accommodation.id && guest.roomId === room.id
        )
        
        return {
          roomId: room.id,
          roomName: room.name,
          isOccupied: !!assignedGuest,
          occupiedBy: assignedGuest ? {
            guestId: assignedGuest.id,
            guestName: `${assignedGuest.firstName} ${assignedGuest.lastName}`,
            guestEmail: assignedGuest.email
          } : undefined
        }
      })
      
      return {
        ...accommodation,
        occupiedRooms: roomOccupancies.filter(r => r.isOccupied).length,
        availableRooms: roomOccupancies.length - occupiedRooms,
        occupancyRate: Math.round((occupiedRooms / totalRooms) * 100),
        roomOccupancies
      }
    })
  }, [accommodations, guests])
}
```

### 2. **Rozšířené typy**

```typescript
export interface RoomOccupancy {
  roomId: string
  roomName: string
  accommodationId: string
  accommodationName: string
  isOccupied: boolean
  occupiedBy?: {
    guestId: string
    guestName: string
    guestEmail?: string
  }
  capacity: number
  pricePerNight: number
}

export interface AccommodationWithOccupancy extends Accommodation {
  occupiedRooms: number
  availableRooms: number
  occupancyRate: number
  roomOccupancies: RoomOccupancy[]
}
```

## 🎨 Uživatelské rozhraní

### 1. **Dashboard modul** ✅

**Aktualizované statistiky:**
- 🏨 **Ubytování**: Celkový počet ubytování
- 🛏️ **Celkem pokojů**: Všechny pokoje
- 🟢 **Dostupné pokoje**: Nepřiřazené pokoje
- 🔴 **Obsazené pokoje**: Pokoje přiřazené hostům
- 📊 **Obsazenost**: Procento obsazenosti

**Nedávno přidaná ubytování:**
- Zobrazuje dostupné i obsazené pokoje
- Barevné rozlišení (zelená/červená)

### 2. **Hlavní stránka ubytování** ✅

**Rozšířené statistiky:**
```
┌─────────────────┬─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│   Ubytování     │  Celkem pokojů  │ Dostupné pokoje │ Obsazené pokoje │   Obsazenost    │
│       3         │       12        │        8        │        4        │      33%        │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┴─────────────────┘
```

**Seznam ubytování:**
- Grid layout se 3 sloupci statistik
- Zelené číslo pro dostupné pokoje
- Červené číslo pro obsazené pokoje

### 3. **Detail ubytování** ✅

**Statistiky obsazenosti:**
```
┌─────────────────────────────────────────────────────────────────┐
│                    Statistiky obsazenosti                      │
├─────────────────────────────────────────────────────────────────┤
│ Celkem pokojů:        12                                       │
│ Obsazené hosty:       4  (červená)                            │
│ Dostupné pokoje:      8  (zelená)                             │
│ Obsazenost:          33% (oranžová)                           │
├─────────────────────────────────────────────────────────────────┤
│                    Obsazené pokoje:                            │
│ Pokoj 101            Jan Novák                                │
│ Pokoj 205            Marie Svobodová                          │
│ Apartmán Deluxe      Petr Dvořák                             │
└─────────────────────────────────────────────────────────────────┘
```

**Pokoje tab:**
- Každý pokoj má badge: "Dostupný" (zelený) / "Obsazený" (červený)
- Obsazené pokoje zobrazují červený panel s informacemi o hostovi:
  ```
  ┌─────────────────────────────────────────────────────────────┐
  │ 👥 Obsazeno: Jan Novák                                     │
  │    jan.novak@email.cz                                      │
  └─────────────────────────────────────────────────────────────┘
  ```

### 4. **Štítek u jména hosta** ✅

**V GuestCard:**
- Modrý štítek s názvem pokoje přímo u jména hosta
- Ikona postele + název pokoje
- Kompaktní design: `🛏️ Pokoj 101`

## 🔄 Workflow

### 1. **Přiřazení ubytování hostovi**
```
Host vybere ubytování → Vybere pokoj → Uloží
                                    ↓
                            Data se uloží do:
                            - localStorage
                            - Firestore
                                    ↓
                        useAccommodationWithGuests
                        propojí data automaticky
                                    ↓
                        Aktualizují se všechny
                        statistiky v real-time
```

### 2. **Zobrazení obsazenosti**
```
useAccommodationWithGuests hook
        ↓
Načte accommodations + guests
        ↓
Pro každý pokoj najde přiřazeného hosta
        ↓
Vytvoří RoomOccupancy objekty
        ↓
Spočítá statistiky pro každé ubytování
        ↓
Zobrazí v UI s barevným rozlišením
```

## 📊 Statistiky

### Globální statistiky
- **totalAccommodations**: Počet ubytování
- **totalRooms**: Celkový počet pokojů
- **availableRooms**: Nepřiřazené pokoje
- **occupiedRooms**: Pokoje přiřazené hostům
- **occupancyRate**: Procento obsazenosti
- **guestAssignments**: Počet hostů s přiřazeným ubytováním

### Statistiky pro jednotlivá ubytování
- **occupiedRooms**: Obsazené pokoje v tomto ubytování
- **availableRooms**: Dostupné pokoje v tomto ubytování
- **occupancyRate**: Procento obsazenosti tohoto ubytování
- **roomOccupancies**: Detailní info o každém pokoji

## 🎯 Výhody

### 1. **Real-time synchronizace**
- Změny v přiřazení hostů se okamžitě projeví v modulu ubytování
- Žádné manuální aktualizace nejsou potřeba

### 2. **Přesné statistiky**
- Obsazenost na základě skutečných přiřazení hostů
- Ne pouze na základě `room.isAvailable` flagu

### 3. **Detailní informace**
- Kdo obsazuje který pokoj
- Kontaktní informace pro rychlé spojení

### 4. **Vizuální rozlišení**
- Barevné kódování (zelená/červená/oranžová)
- Jasné rozlišení dostupných a obsazených pokojů

## 🚀 Použití

### V komponentách
```typescript
// Místo useAccommodation použijte:
const { accommodations, stats, loading } = useAccommodationWithGuests()

// Přístup k obsazenosti:
const accommodation = getAccommodationWithOccupancy(accommodationId)
console.log(accommodation.occupiedRooms) // 4
console.log(accommodation.occupancyRate) // 33%

// Detaily obsazenosti:
accommodation.roomOccupancies.forEach(room => {
  if (room.isOccupied) {
    console.log(`${room.roomName} obsazen: ${room.occupiedBy.guestName}`)
  }
})
```

### Helper funkce
```typescript
const { getRoomOccupancy, getOccupiedRooms, getAvailableRooms } = useAccommodationWithGuests()

// Obsazenost konkrétního pokoje
const roomOccupancy = getRoomOccupancy('room-123')

// Všechny obsazené pokoje
const occupiedRooms = getOccupiedRooms()

// Všechny dostupné pokoje
const availableRooms = getAvailableRooms()
```

## ✅ Implementované funkce

- ✅ Propojení dat hostů s ubytováním
- ✅ Real-time statistiky obsazenosti
- ✅ Dashboard modul s aktualizovanými statistikami
- ✅ Hlavní stránka ubytování s obsazeností
- ✅ Detail ubytování se statistikami a seznamem obsazených pokojů
- ✅ Vizuální indikátory obsazenosti pokojů
- ✅ Informace o hostovi u obsazeného pokoje
- ✅ Modrý štítek s názvem pokoje u jména hosta
- ✅ Barevné rozlišení dostupných/obsazených pokojů

## 🎉 Výsledek

Systém nyní poskytuje **kompletní přehled obsazenosti** pokojů na základě skutečných přiřazení hostů, s **real-time aktualizacemi** a **detailními statistikami** ve všech částech aplikace!
