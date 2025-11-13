export interface DashboardModule {
  id: string
  type: 'wedding-countdown' | 'quick-actions' | 'main-features' | 'marketplace' | 'task-management' | 'guest-management' | 'budget-tracking' | 'timeline-planning' | 'vendor-management' | 'seating-plan' | 'wedding-day-timeline' | 'moodboard' | 'wedding-checklist' | 'music-playlist' | 'food-drinks' | 'wedding-website' | 'accommodation-management' | 'shopping-list' | 'svatbot-coach'
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
  // Row 0 - 1 large (2 modules wide) + 1 medium
  {
    id: 'wedding-countdown',
    type: 'wedding-countdown',
    title: 'Odpočet do svatby',
    size: 'large',
    position: { x: 40, y: 40 },
    gridPosition: { row: 0, column: 0 },
    isVisible: true,
    isLocked: false,
    order: 0
  },
  {
    id: 'svatbot-coach',
    type: 'svatbot-coach',
    title: 'Svatbot - Váš AI Kouč',
    size: 'medium',
    position: { x: 840, y: 40 },
    customSize: { width: 360, height: 800 },
    gridPosition: { row: 0, column: 2 },
    isVisible: true,
    isLocked: false,
    order: 1
  },
  // Row 1 - 2 modules (under wedding-countdown) + 1 module continues from row 0 (svatbot-coach)
  {
    id: 'quick-actions',
    type: 'quick-actions',
    title: 'Rychlé akce',
    size: 'medium',
    position: { x: 40, y: 320 },
    gridPosition: { row: 1, column: 0 },
    isVisible: true,
    isLocked: false,
    order: 2
  },
  {
    id: 'task-management',
    type: 'task-management',
    title: 'Správa úkolů',
    size: 'medium',
    position: { x: 840, y: 1680 },
    customSize: { width: 360, height: 450 },
    gridPosition: { row: 1, column: 1 },
    isVisible: true,
    isLocked: false,
    order: 3
  },
  // Row 2 - 3 modules (svatbot-coach ends here)
  {
    id: 'guest-management',
    type: 'guest-management',
    title: 'Správa hostů',
    size: 'medium',
    position: { x: 40, y: 880 },
    gridPosition: { row: 2, column: 0 },
    isVisible: true,
    isLocked: false,
    order: 4
  },
  {
    id: 'seating-plan',
    type: 'seating-plan',
    title: 'Rozmístění hostů',
    size: 'medium',
    position: { x: 440, y: 880 },
    gridPosition: { row: 2, column: 1 },
    isVisible: true,
    isLocked: false,
    order: 5
  },
  {
    id: 'vendor-management',
    type: 'vendor-management',
    title: 'Dodavatelé',
    size: 'medium',
    position: { x: 840, y: 880 },
    gridPosition: { row: 2, column: 2 },
    isVisible: true,
    isLocked: false,
    order: 6
  },
  // Row 3 - Svatební checklist pod "Správa hostů" + 2 další moduly
  {
    id: 'wedding-checklist',
    type: 'wedding-checklist',
    title: 'Svatební checklist',
    size: 'medium',
    position: { x: 40, y: 1280 },
    customSize: { width: 360, height: 940 },
    gridPosition: { row: 3, column: 0 },
    isVisible: true,
    isLocked: false,
    order: 7
  },
  {
    id: 'budget-tracking',
    type: 'budget-tracking',
    title: 'Rozpočet',
    size: 'medium',
    position: { x: 440, y: 1280 },
    gridPosition: { row: 3, column: 1 },
    isVisible: true,
    isLocked: false,
    order: 8
  },
  {
    id: 'timeline-planning',
    type: 'timeline-planning',
    title: 'Časová osa',
    size: 'medium',
    position: { x: 840, y: 1280 },
    customSize: { width: 360, height: 353 },
    gridPosition: { row: 3, column: 2 },
    isVisible: true,
    isLocked: false,
    order: 9
  },
  // Row 4 - 2 moduly (marketplace a moodboard)
  {
    id: 'marketplace',
    type: 'marketplace',
    title: 'Najít dodavatele',
    size: 'medium',
    position: { x: 840, y: 2080 },
    gridPosition: { row: 4, column: 1 },
    isVisible: true,
    isLocked: false,
    order: 10
  },
  {
    id: 'moodboard',
    type: 'moodboard',
    title: 'Moodboard',
    size: 'medium',
    position: { x: 440, y: 320 },
    gridPosition: { row: 4, column: 2 },
    isVisible: true,
    isLocked: false,
    order: 11
  },
  // Row 5 - Harmonogram dne + 2 další moduly
  {
    id: 'wedding-day-timeline',
    type: 'wedding-day-timeline',
    title: 'Harmonogram dne',
    size: 'small',
    position: { x: 440, y: 2080 },
    customSize: { width: 360, height: 353 },
    gridPosition: { row: 5, column: 0 },
    isVisible: true,
    isLocked: false,
    order: 12
  },
  {
    id: 'food-drinks',
    type: 'food-drinks',
    title: 'Jídlo a Pití',
    size: 'medium',
    position: { x: 40, y: 2080 },
    customSize: { width: 360, height: 353 },
    gridPosition: { row: 5, column: 1 },
    isVisible: true,
    isLocked: false,
    order: 13
  },
  // Row 6 - 3 modules
  {
    id: 'music-playlist',
    type: 'music-playlist',
    title: 'Svatební hudba',
    size: 'medium',
    position: { x: 440, y: 2480 },
    gridPosition: { row: 6, column: 0 },
    isVisible: true,
    isLocked: false,
    order: 14
  },
  {
    id: 'shopping-list',
    type: 'shopping-list',
    title: 'Nákupní seznam',
    size: 'medium',
    position: { x: 440, y: 1680 },
    gridPosition: { row: 6, column: 1 },
    isVisible: true,
    isLocked: false,
    order: 15
  },
  {
    id: 'accommodation-management',
    type: 'accommodation-management',
    title: 'Ubytování',
    size: 'medium',
    position: { x: 40, y: 2480 },
    gridPosition: { row: 6, column: 2 },
    isVisible: true,
    isLocked: false,
    order: 16
  },
  // Row 7 - 1 module
  {
    id: 'wedding-website',
    type: 'wedding-website',
    title: 'Svatební web',
    size: 'medium',
    position: { x: 840, y: 2680 },
    gridPosition: { row: 7, column: 0 },
    isVisible: true,
    isLocked: false,
    order: 17
  }
]
