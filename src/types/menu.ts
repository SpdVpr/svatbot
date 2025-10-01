// Menu & Drinks Management Types for SvatBot.cz

export type FoodCategory =
  | 'appetizer'       // Předkrmy
  | 'soup'            // Polévky
  | 'main-course'     // Hlavní jídla
  | 'side-dish'       // Přílohy
  | 'salad'           // Saláty
  | 'dessert'         // Dezerty
  | 'midnight-snack'  // Noční svačina
  | 'buffet'          // Bufet
  | 'other'           // Ostatní

export type DrinkCategory =
  | 'welcome-drink'   // Welcome drink
  | 'non-alcoholic'   // Nealko nápoje
  | 'beer'            // Pivo
  | 'wine'            // Víno
  | 'champagne'       // Šampaňské/Prosecco
  | 'spirits'         // Destiláty
  | 'cocktails'       // Koktejly
  | 'coffee-tea'      // Káva a čaj
  | 'other'           // Ostatní

export type MenuItemStatus =
  | 'planned'         // Plánováno
  | 'confirmed'       // Potvrzeno
  | 'ordered'         // Objednáno
  | 'cancelled'       // Zrušeno

export type ServingStyle =
  | 'plated'          // Servírované
  | 'buffet'          // Formou bufetu
  | 'family-style'    // Rodinný styl
  | 'cocktail'        // Koktejlový styl

export interface MenuItem {
  id: string
  weddingId: string
  
  // Basic info
  name: string
  description?: string
  category: FoodCategory
  
  // Details
  servingSize?: string // "100g", "1 porce", etc.
  estimatedQuantity: number // Počet porcí
  actualQuantity?: number
  
  // Dietary info
  isVegetarian: boolean
  isVegan: boolean
  isGlutenFree: boolean
  isLactoseFree: boolean
  allergens: string[] // ['ořechy', 'mléko', 'vejce', etc.]
  
  // Cost
  pricePerServing?: number
  totalCost?: number
  currency: string // 'CZK'
  
  // Vendor
  vendorId?: string
  vendorName?: string
  
  // Status
  status: MenuItemStatus
  servingStyle?: ServingStyle
  servingTime?: string // "18:00", "Po obřadu", etc.
  
  // Notes
  notes?: string
  tags: string[]
  
  // Metadata
  createdAt: Date
  updatedAt: Date
}

export interface DrinkItem {
  id: string
  weddingId: string
  
  // Basic info
  name: string
  description?: string
  category: DrinkCategory
  
  // Details
  brand?: string
  volume?: string // "0.5L", "0.75L", etc.
  estimatedQuantity: number // Počet lahví/porcí
  actualQuantity?: number
  
  // Cost
  pricePerUnit?: number
  totalCost?: number
  currency: string // 'CZK'
  
  // Vendor
  vendorId?: string
  vendorName?: string
  
  // Status
  status: MenuItemStatus
  servingTime?: string // "Celý den", "Večer", etc.
  
  // Alcohol info
  isAlcoholic: boolean
  alcoholContent?: number // Procenta alkoholu
  
  // Notes
  notes?: string
  tags: string[]
  
  // Metadata
  createdAt: Date
  updatedAt: Date
}

export interface MenuFormData {
  name: string
  description?: string
  category: FoodCategory
  servingSize?: string
  estimatedQuantity: number
  isVegetarian: boolean
  isVegan: boolean
  isGlutenFree: boolean
  isLactoseFree: boolean
  allergens: string[]
  pricePerServing?: number
  vendorId?: string
  vendorName?: string
  status: MenuItemStatus
  servingStyle?: ServingStyle
  servingTime?: string
  notes?: string
  tags: string[]
}

export interface DrinkFormData {
  name: string
  description?: string
  category: DrinkCategory
  brand?: string
  volume?: string
  estimatedQuantity: number
  pricePerUnit?: number
  vendorId?: string
  vendorName?: string
  status: MenuItemStatus
  servingTime?: string
  isAlcoholic: boolean
  alcoholContent?: number
  notes?: string
  tags: string[]
}

export interface MenuStats {
  totalMenuItems: number
  totalDrinkItems: number
  totalEstimatedCost: number
  totalActualCost: number
  
  // Food stats
  vegetarianOptions: number
  veganOptions: number
  glutenFreeOptions: number
  
  // Drink stats
  alcoholicDrinks: number
  nonAlcoholicDrinks: number
  
  // Status breakdown
  plannedItems: number
  confirmedItems: number
  orderedItems: number
  
  // By category
  itemsByCategory: Record<FoodCategory | DrinkCategory, number>
}

export interface MenuFilters {
  category?: FoodCategory | DrinkCategory
  status?: MenuItemStatus
  isVegetarian?: boolean
  isVegan?: boolean
  isGlutenFree?: boolean
  isAlcoholic?: boolean
  vendorId?: string
  searchQuery?: string
}

// Czech translations
export const FOOD_CATEGORY_LABELS: Record<FoodCategory, string> = {
  'appetizer': 'Předkrmy',
  'soup': 'Polévky',
  'main-course': 'Hlavní jídla',
  'side-dish': 'Přílohy',
  'salad': 'Saláty',
  'dessert': 'Dezerty',
  'midnight-snack': 'Noční svačina',
  'buffet': 'Bufet',
  'other': 'Ostatní'
}

export const DRINK_CATEGORY_LABELS: Record<DrinkCategory, string> = {
  'welcome-drink': 'Welcome drink',
  'non-alcoholic': 'Nealko nápoje',
  'beer': 'Pivo',
  'wine': 'Víno',
  'champagne': 'Šampaňské',
  'spirits': 'Destiláty',
  'cocktails': 'Koktejly',
  'coffee-tea': 'Káva a čaj',
  'other': 'Ostatní'
}

export const MENU_STATUS_LABELS: Record<MenuItemStatus, string> = {
  'planned': 'Plánováno',
  'confirmed': 'Potvrzeno',
  'ordered': 'Objednáno',
  'cancelled': 'Zrušeno'
}

export const SERVING_STYLE_LABELS: Record<ServingStyle, string> = {
  'plated': 'Servírované',
  'buffet': 'Bufet',
  'family-style': 'Rodinný styl',
  'cocktail': 'Koktejlový styl'
}

// Common allergens in Czech
export const COMMON_ALLERGENS = [
  'Lepek',
  'Korýši',
  'Vejce',
  'Ryby',
  'Arašídy',
  'Sója',
  'Mléko',
  'Ořechy',
  'Celer',
  'Hořčice',
  'Sezam',
  'Oxid siřičitý',
  'Vlčí bob',
  'Měkkýši'
]

