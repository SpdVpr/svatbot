export interface DashboardModule {
  id: string
  type: 'wedding-countdown' | 'quick-actions' | 'main-features' | 'upcoming-tasks' | 'marketplace' | 'task-management' | 'guest-management' | 'budget-tracking' | 'timeline-planning' | 'vendor-management' | 'seating-plan' | 'wedding-day-timeline' | 'moodboard' | 'wedding-checklist' | 'music-playlist' | 'food-drinks' | 'wedding-website' | 'accommodation-management' | 'shopping-list'
  title: string
  size: 'small' | 'medium' | 'large' | 'full'
  position?: {
    x: number
    y: number
  }
  // Custom size for free layout mode
  customSize?: {
    width: number
    height: number
  }
  // Legacy grid position (for backward compatibility)
  gridPosition?: {
    row: number
    column: number
  }
  isVisible: boolean
  isLocked: boolean
  order: number
}

export interface DashboardLayout {
  modules: DashboardModule[]
  isEditMode: boolean
  isLocked: boolean
  layoutMode?: 'grid' | 'free' // Preferred layout mode
}

export interface DashboardSettings {
  layout: DashboardLayout
  preferences: {
    showWelcomeMessage: boolean
    compactMode: boolean
    theme: 'light' | 'dark' | 'auto'
  }
}

export const DEFAULT_DASHBOARD_MODULES: DashboardModule[] = [
  {
    id: 'wedding-countdown',
    type: 'wedding-countdown',
    title: 'Odpočet do svatby',
    size: 'large',
    position: { x: 20, y: 20 },
    gridPosition: { row: 0, column: 0 },
    isVisible: true,
    isLocked: false,
    order: 0
  },
  {
    id: 'quick-actions',
    type: 'quick-actions',
    title: 'Rychlé akce',
    size: 'medium',
    position: { x: 720, y: 20 },
    gridPosition: { row: 0, column: 1 },
    isVisible: true,
    isLocked: false,
    order: 1
  },
  {
    id: 'task-management',
    type: 'task-management',
    title: 'Správa úkolů',
    size: 'medium',
    position: { x: 20, y: 490 },
    gridPosition: { row: 1, column: 0 },
    isVisible: true,
    isLocked: false,
    order: 2
  },
  {
    id: 'guest-management',
    type: 'guest-management',
    title: 'Správa hostů',
    size: 'medium',
    position: { x: 370, y: 490 },
    gridPosition: { row: 1, column: 1 },
    isVisible: true,
    isLocked: false,
    order: 3
  },
  {
    id: 'budget-tracking',
    type: 'budget-tracking',
    title: 'Rozpočet',
    size: 'medium',
    position: { x: 720, y: 490 },
    gridPosition: { row: 1, column: 2 },
    isVisible: true,
    isLocked: false,
    order: 4
  },
  {
    id: 'food-drinks',
    type: 'food-drinks',
    title: 'Jídlo a Pití',
    size: 'medium',
    position: { x: 1070, y: 490 },
    gridPosition: { row: 1, column: 3 },
    isVisible: true,
    isLocked: false,
    order: 14
  },
  {
    id: 'upcoming-tasks',
    type: 'upcoming-tasks',
    title: 'Nadcházející úkoly',
    size: 'large',
    position: { x: 20, y: 960 },
    gridPosition: { row: 2, column: 0 },
    isVisible: true,
    isLocked: false,
    order: 5
  },
  {
    id: 'marketplace',
    type: 'marketplace',
    title: 'Najít dodavatele',
    size: 'medium',
    position: { x: 720, y: 960 },
    gridPosition: { row: 2, column: 1 },
    isVisible: true,
    isLocked: false,
    order: 6
  },
  {
    id: 'music-playlist',
    type: 'music-playlist',
    title: 'Svatební hudba',
    size: 'medium',
    position: { x: 1070, y: 960 },
    gridPosition: { row: 2, column: 3 },
    isVisible: true,
    isLocked: false,
    order: 13
  },
  {
    id: 'timeline-planning',
    type: 'timeline-planning',
    title: 'Časový plán',
    size: 'medium',
    position: { x: 20, y: 1430 },
    gridPosition: { row: 3, column: 0 },
    isVisible: true,
    isLocked: false,
    order: 7
  },
  {
    id: 'vendor-management',
    type: 'vendor-management',
    title: 'Dodavatelé',
    size: 'medium',
    position: { x: 370, y: 1430 },
    gridPosition: { row: 3, column: 1 },
    isVisible: true,
    isLocked: false,
    order: 8
  },
  {
    id: 'shopping-list',
    type: 'shopping-list',
    title: 'Nákupní seznam',
    size: 'medium',
    position: { x: 720, y: 1430 },
    gridPosition: { row: 3, column: 2 },
    isVisible: true,
    isLocked: false,
    order: 9
  },
  {
    id: 'wedding-checklist',
    type: 'wedding-checklist',
    title: 'Svatební checklist',
    size: 'medium',
    position: { x: 1070, y: 1430 },
    gridPosition: { row: 3, column: 3 },
    isVisible: true,
    isLocked: false,
    order: 12
  },
  {
    id: 'seating-plan',
    type: 'seating-plan',
    title: 'Rozmístění hostů',
    size: 'medium',
    position: { x: 20, y: 1900 },
    gridPosition: { row: 4, column: 0 },
    isVisible: true,
    isLocked: false,
    order: 10
  },
  {
    id: 'accommodation-management',
    type: 'accommodation-management',
    title: 'Ubytování',
    size: 'medium',
    position: { x: 370, y: 1900 },
    gridPosition: { row: 4, column: 1 },
    isVisible: true,
    isLocked: false,
    order: 13
  },
  {
    id: 'wedding-website',
    type: 'wedding-website',
    title: 'Svatební web',
    size: 'medium',
    position: { x: 720, y: 1900 },
    gridPosition: { row: 4, column: 2 },
    isVisible: true,
    isLocked: false,
    order: 15
  },
  {
    id: 'moodboard',
    type: 'moodboard',
    title: 'Moodboard',
    size: 'medium',
    position: { x: 1070, y: 1900 },
    gridPosition: { row: 4, column: 3 },
    isVisible: true,
    isLocked: false,
    order: 11
  },
  {
    id: 'wedding-day-timeline',
    type: 'wedding-day-timeline',
    title: 'Harmonogram svatebního dne',
    size: 'large',
    position: { x: 20, y: 2370 },
    gridPosition: { row: 5, column: 0 },
    isVisible: true,
    isLocked: false,
    order: 10
  }
]
