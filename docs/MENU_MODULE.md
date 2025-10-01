# Modul Jídlo a Pití

Kompletní systém pro správu svatebního menu a nápojů.

## Přehled

Modul "Jídlo a Pití" umožňuje párům plánovat a spravovat veškeré jídlo a nápoje pro jejich svatební den, včetně:
- Předkrmů
- Hlavních jídel
- Příloh
- Dezertů
- Noční svačiny/bufetu
- Welcome drinků
- Alkoholických a nealkoholických nápojů
- Piva, vína, šampaňského
- Koktejlů

## Struktura souborů

### Typy
- `src/types/menu.ts` - Definice typů pro menu položky a nápoje

### Hooks
- `src/hooks/useMenu.ts` - Hook pro správu menu dat s Firebase integrací

### Komponenty
- `src/components/Dashboard/modules/FoodDrinksModule.tsx` - Dashboard modul
- `src/components/menu/MenuItemForm.tsx` - Formulář pro přidání/úpravu jídla
- `src/components/menu/DrinkItemForm.tsx` - Formulář pro přidání/úpravu nápoje

### Stránky
- `src/app/menu/page.tsx` - Hlavní stránka pro správu menu

## Funkce

### Správa jídel
- ✅ Přidávání jídel s detailními informacemi
- ✅ Kategorizace (předkrmy, hlavní jídla, přílohy, dezerty, atd.)
- ✅ Dietní možnosti (vegetariánské, veganské, bezlepkové, bez laktózy)
- ✅ Správa alergenů
- ✅ Velikost porcí a množství
- ✅ Cenové kalkulace
- ✅ Způsob servírování (servírované, bufet, rodinný styl)
- ✅ Čas servírování
- ✅ Propojení s dodavateli

### Správa nápojů
- ✅ Přidávání nápojů s detailními informacemi
- ✅ Kategorizace (welcome drink, pivo, víno, šampaňské, koktejly, atd.)
- ✅ Značka a objem
- ✅ Alkoholické vs. nealkoholické
- ✅ Obsah alkoholu
- ✅ Množství a cenové kalkulace
- ✅ Čas servírování
- ✅ Propojení s dodavateli

### Dashboard modul
- ✅ Přehled celkových nákladů
- ✅ Počet jídel a nápojů
- ✅ Statistiky dietních možností
- ✅ Statistiky alkoholických/nealkoholických nápojů
- ✅ Stav příprav (plánováno, potvrzeno, objednáno)
- ✅ Rychlý přístup na detail stránku

### Hlavní stránka
- ✅ Přehledné statistiky
- ✅ Záložky pro jídla a nápoje
- ✅ Vyhledávání
- ✅ Přidávání a úprava položek
- ✅ Zobrazení všech detailů

## Datová struktura

### MenuItem (Jídlo)
```typescript
{
  id: string
  weddingId: string
  name: string
  description?: string
  category: FoodCategory
  servingSize?: string
  estimatedQuantity: number
  actualQuantity?: number
  isVegetarian: boolean
  isVegan: boolean
  isGlutenFree: boolean
  isLactoseFree: boolean
  allergens: string[]
  pricePerServing?: number
  totalCost?: number
  vendorId?: string
  vendorName?: string
  status: MenuItemStatus
  servingStyle?: ServingStyle
  servingTime?: string
  notes?: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
}
```

### DrinkItem (Nápoj)
```typescript
{
  id: string
  weddingId: string
  name: string
  description?: string
  category: DrinkCategory
  brand?: string
  volume?: string
  estimatedQuantity: number
  actualQuantity?: number
  pricePerUnit?: number
  totalCost?: number
  vendorId?: string
  vendorName?: string
  status: MenuItemStatus
  servingTime?: string
  isAlcoholic: boolean
  alcoholContent?: number
  notes?: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
}
```

## Kategorie

### Kategorie jídel
- `appetizer` - Předkrmy
- `soup` - Polévky
- `main-course` - Hlavní jídla
- `side-dish` - Přílohy
- `salad` - Saláty
- `dessert` - Dezerty
- `midnight-snack` - Noční svačina
- `buffet` - Bufet
- `other` - Ostatní

### Kategorie nápojů
- `welcome-drink` - Welcome drink
- `non-alcoholic` - Nealko nápoje
- `beer` - Pivo
- `wine` - Víno
- `champagne` - Šampaňské/Prosecco
- `spirits` - Destiláty
- `cocktails` - Koktejly
- `coffee-tea` - Káva a čaj
- `other` - Ostatní

## Stavy položek
- `planned` - Plánováno
- `confirmed` - Potvrzeno
- `ordered` - Objednáno
- `cancelled` - Zrušeno

## Způsoby servírování
- `plated` - Servírované
- `buffet` - Formou bufetu
- `family-style` - Rodinný styl
- `cocktail` - Koktejlový styl

## Alergeny
Systém podporuje běžné alergeny podle EU legislativy:
- Lepek
- Korýši
- Vejce
- Ryby
- Arašídy
- Sója
- Mléko
- Ořechy
- Celer
- Hořčice
- Sezam
- Oxid siřičitý
- Vlčí bob
- Měkkýši

## Firebase kolekce

### menuItems
Kolekce pro jídla:
- Indexy: `weddingId`, `createdAt`
- Pravidla: Přístup pouze pro vlastníka svatby

### drinkItems
Kolekce pro nápoje:
- Indexy: `weddingId`, `createdAt`
- Pravidla: Přístup pouze pro vlastníka svatby

## Použití

### Hook useMenu
```typescript
const {
  menuItems,           // Pole všech jídel
  drinkItems,          // Pole všech nápojů
  loading,             // Stav načítání
  error,               // Chybová zpráva
  stats,               // Statistiky
  createMenuItem,      // Vytvoření jídla
  updateMenuItem,      // Aktualizace jídla
  deleteMenuItem,      // Smazání jídla
  createDrinkItem,     // Vytvoření nápoje
  updateDrinkItem,     // Aktualizace nápoje
  deleteDrinkItem,     // Smazání nápoje
  getFilteredMenuItems,    // Filtrování jídel
  getFilteredDrinkItems,   // Filtrování nápojů
  getTotalEstimatedCost,   // Celkové odhadované náklady
  getTotalActualCost,      // Celkové skutečné náklady
  clearError           // Vymazání chyby
} = useMenu()
```

### Statistiky
```typescript
stats = {
  totalMenuItems: number
  totalDrinkItems: number
  totalEstimatedCost: number
  totalActualCost: number
  vegetarianOptions: number
  veganOptions: number
  glutenFreeOptions: number
  alcoholicDrinks: number
  nonAlcoholicDrinks: number
  plannedItems: number
  confirmedItems: number
  orderedItems: number
  itemsByCategory: Record<FoodCategory | DrinkCategory, number>
}
```

## Integrace s ostatními moduly

### Budget (Rozpočet)
- Menu položky mohou být propojeny s rozpočtovými položkami
- Automatické kalkulace celkových nákladů

### Vendors (Dodavatelé)
- Menu položky mohou být propojeny s dodavateli
- Sledování, který dodavatel poskytuje které položky

### Guests (Hosté)
- Počet porcí může být automaticky kalkulován podle počtu hostů
- Dietní preference hostů mohou ovlivnit výběr menu

## Budoucí vylepšení

### Plánované funkce
- [ ] Import menu z šablon
- [ ] Export menu do PDF
- [ ] Kalkulačka porcí podle počtu hostů
- [ ] Propojení s RSVP pro dietní preference
- [ ] Automatické návrhy menu podle rozpočtu
- [ ] Fotogalerie jídel
- [ ] Hodnocení a recenze dodavatelů
- [ ] Degustační poznámky
- [ ] Timeline servírování během dne
- [ ] Propojení s Google Calendar pro připomínky

## Testování

Pro testování modulu:
1. Přihlaste se do aplikace
2. Přejděte na dashboard
3. Najděte modul "Jídlo a Pití"
4. Klikněte na "Spravovat menu"
5. Přidejte testovací jídla a nápoje
6. Ověřte všechny funkce (přidání, úprava, mazání, filtrování)

## Podpora

Pro otázky nebo problémy s modulem kontaktujte vývojový tým.

