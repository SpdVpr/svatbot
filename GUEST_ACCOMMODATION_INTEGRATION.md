# 🏨 Integrace hostů s ubytováním - Dokumentace

## 🎯 Přehled

Kompletní integrace mezi správou hostů a správou ubytování. Hosté si mohou vybrat konkrétní ubytování a pokoje přímo z formuláře pro hosty.

## ✨ Nové funkce

### **1. Výběr ubytování v GuestForm**
- **Dropdown s ubytováními**: Zobrazuje všechna dostupná ubytování
- **Výběr pokoje**: Po výběru ubytování se zobrazí dostupné pokoje
- **Automatické resetování**: Při změně ubytování se resetuje výběr pokoje
- **Fallback pro prázdný seznam**: Tlačítko pro přidání nového ubytování

### **2. Zobrazení ubytování v GuestCard**
- **Barevné indikátory**:
  - 🟢 **Zelený**: Host má přiřazené konkrétní ubytování a pokoj
  - 🟠 **Oranžový**: Host má pouze poznámky k ubytování
  - 🟡 **Žlutý**: Host má zájem o ubytování, ale není přiřazený
- **Ikony**: Building2 pro ubytování, Bed pro pokoj
- **Quick action tlačítko**: Pro rychlé přiřazení ubytování

### **3. AccommodationSelector komponenta**
- **Modal dialog**: Pro rychlé přiřazení ubytování hostovi
- **Dropdown výběry**: Ubytování a pokoje
- **Preview**: Zobrazení vybrané kombinace
- **Fallback**: Tlačítko pro přidání nového ubytování

## 🔧 Technické implementace

### **Rozšířené typy**

#### **Guest interface** (`src/types/guest.ts`)
```typescript
export interface Guest {
  // ... existující pole
  accommodationId?: string // ID vybraného ubytování
  roomId?: string // ID vybraného pokoje
}
```

#### **GuestFormData interface** (`src/types/guest.ts`)
```typescript
export interface GuestFormData {
  // ... existující pole
  accommodationId?: string
  roomId?: string
}
```

### **Komponenty**

#### **GuestForm** (`src/components/guests/GuestForm.tsx`)
- **useAccommodation hook**: Pro načtení dostupných ubytování
- **Conditional rendering**: Zobrazení výběru pouze při zájmu o ubytování
- **Cascading dropdowns**: Ubytování → Pokoje
- **Fallback UI**: Informace o prázdném seznamu s tlačítkem pro přidání

#### **GuestCard** (`src/components/guests/GuestCard.tsx`)
- **useAccommodation hook**: Pro získání detailů ubytování
- **Barevné indikátory**: Podle stavu přiřazení ubytování
- **Quick action**: Tlačítko Building2 pro rychlé přiřazení
- **AccommodationSelector**: Modal pro výběr ubytování

#### **AccommodationSelector** (`src/components/guests/AccommodationSelector.tsx`)
- **Standalone komponenta**: Může být použita kdekoli
- **Guest preview**: Zobrazení informací o hostovi
- **Selection preview**: Náhled vybrané kombinace
- **Error handling**: Zpracování chyb při ukládání

### **Hooks aktualizace**

#### **useRobustGuests** (`src/hooks/useRobustGuests.ts`)
```typescript
const createGuest = useCallback(async (data: GuestFormData): Promise<Guest> => {
  const newGuest: Guest = {
    // ... existující pole
    accommodationId: data.accommodationId,
    roomId: data.roomId,
  }
  // ...
}, [])
```

## 🎨 UI/UX vylepšení

### **Barevné kódování**
- **Zelená**: Kompletní přiřazení (ubytování + pokoj)
- **Oranžová**: Částečné přiřazení (pouze poznámky)
- **Žlutá**: Zájem bez přiřazení
- **Šedá**: Bez zájmu o ubytování

### **Ikony**
- **Building2**: Ubytování
- **Bed**: Pokoj
- **AlertCircle**: Upozornění
- **Plus**: Přidání nového

### **Interakce**
- **Click na "Má zájem o ubytování"**: Otevře AccommodationSelector
- **Quick action tlačítko**: V GuestCard pro rychlé přiřazení
- **Fallback tlačítko**: Otevře nové okno s formulářem pro ubytování

## 📊 Statistiky

### **GuestStats rozšíření**
Existující statistiky už obsahují:
- **Má zájem o ubytování**: Počet hostů se zájmem
- **Nemá zájem**: Počet hostů bez zájmu
- **Platí host / Platí novomanželé**: Rozdělení podle způsobu platby

## 🔄 Workflow

### **1. Přidání nového hosta**
1. Vyplnění základních údajů
2. Výběr "Má zájem o ubytování"
3. Výběr konkrétního ubytování z dropdownu
4. Výběr konkrétního pokoje z dropdownu
5. Uložení hosta s přiřazeným ubytováním

### **2. Editace existujícího hosta**
1. Otevření GuestForm s předvyplněnými údaji
2. Změna výběru ubytování/pokoje
3. Uložení změn

### **3. Rychlé přiřazení**
1. Klik na Building2 tlačítko v GuestCard
2. Otevření AccommodationSelector modalu
3. Výběr ubytování a pokoje
4. Uložení změn

### **4. Fallback pro prázdný seznam**
1. Zobrazení upozornění o prázdném seznamu
2. Klik na "Přidat ubytování"
3. Otevření nového okna s formulářem
4. Návrat a refresh seznamu

## 🚀 Budoucí rozšíření

### **Možné vylepšení**
- **Kapacita pokojů**: Kontrola dostupnosti podle počtu hostů
- **Cenové kalkulace**: Automatický výpočet nákladů
- **Rezervační systém**: Správa dostupnosti pokojů
- **Email notifikace**: Automatické informování o přiřazení
- **Bulk operations**: Hromadné přiřazování ubytování

### **Integrace s dalšími moduly**
- **Budget**: Automatické přidání nákladů na ubytování
- **Timeline**: Termíny check-in/check-out
- **Website**: Zobrazení přiřazeného ubytování hostům

## 🎯 Výsledek

Kompletní integrace mezi hosty a ubytováním s intuitivním UI, které umožňuje:
- ✅ **Snadný výběr ubytování** při vytváření/editaci hostů
- ✅ **Vizuální indikátory** stavu přiřazení v seznamu hostů
- ✅ **Rychlé akce** pro přiřazení ubytování
- ✅ **Fallback řešení** pro prázdný seznam ubytování
- ✅ **Konzistentní UX** napříč celou aplikací

Systém je připraven pro produkční použití a další rozšíření! 🎉
