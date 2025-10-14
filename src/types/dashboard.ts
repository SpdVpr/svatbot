export interface DashboardModule {
  id: string
  type: 'wedding-countdown' | 'quick-actions' | 'main-features' | 'upcoming-tasks' | 'marketplace' | 'task-management' | 'guest-management' | 'budget-tracking' | 'timeline-planning' | 'vendor-management' | 'seating-plan' | 'wedding-day-timeline' | 'moodboard' | 'wedding-checklist' | 'music-playlist' | 'food-drinks' | 'wedding-website' | 'accommodation-management' | 'shopping-list' | 'svatbot-coach' | 'onboarding-guide'
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
  // Row 0 - Onboarding guide (full width for new users)
  {
    id: 'onboarding-guide',
    type: 'onboarding-guide',
    title: 'Průvodce nastavením',
    size: 'large',
    position: { x: 40, y: 40 },
    gridPosition: { row: 0, column: 0 },
    isVisible: true,
    isLocked: false,
    order: 0
  },
  // Row 1 - 1 large (2 modules wide) + 1 medium
  {
    id: 'wedding-countdown',
    type: 'wedding-countdown',
    title: 'Odpočet do svatby',
    size: 'large',
    position: { x: 40, y: 530 },
    gridPosition: { row: 1, column: 0 },
    isVisible: true,
    isLocked: false,
    order: 1
  },
  {
    id: 'svatbot-coach',
    type: 'svatbot-coach',
    title: 'Svatbot - Váš AI Kouč',
    size: 'medium',
    position: { x: 840, y: 530 },
    customSize: { width: 360, height: 940 }, // 2 modules tall (450 + 40 + 450)
    gridPosition: { row: 1, column: 2 },
    isVisible: true,
    isLocked: false,
    order: 2
  },
  // Row 2 - 2 modules (under wedding-countdown) + 1 module continues from row 1 (svatbot-coach)
  {
    id: 'quick-actions',
    type: 'quick-actions',
    title: 'Rychlé akce',
    size: 'medium',
    position: { x: 40, y: 1020 },
    gridPosition: { row: 2, column: 0 },
    isVisible: true,
    isLocked: false,
    order: 3
  },
  {
    id: 'task-management',
    type: 'task-management',
    title: 'Správa úkolů',
    size: 'medium',
    position: { x: 440, y: 1020 },
    gridPosition: { row: 2, column: 1 },
    isVisible: true,
    isLocked: false,
    order: 4
  },
  // Row 3 - 3 modules (svatbot-coach ends here, so all 3 columns available)
  {
    id: 'guest-management',
    type: 'guest-management',
    title: 'Správa hostů',
    size: 'medium',
    position: { x: 40, y: 1510 },
    gridPosition: { row: 3, column: 0 },
    isVisible: true,
    isLocked: false,
    order: 5
  },
  {
    id: 'budget-tracking',
    type: 'budget-tracking',
    title: 'Rozpočet',
    size: 'medium',
    position: { x: 440, y: 1510 },
    gridPosition: { row: 3, column: 1 },
    isVisible: true,
    isLocked: false,
    order: 6
  },
  {
    id: 'timeline-planning',
    type: 'timeline-planning',
    title: 'Časová osa',
    size: 'medium',
    position: { x: 840, y: 1510 },
    gridPosition: { row: 3, column: 2 },
    isVisible: true,
    isLocked: false,
    order: 7
  },
  // Row 4 - 3 modules
  {
    id: 'vendor-management',
    type: 'vendor-management',
    title: 'Dodavatelé',
    size: 'medium',
    position: { x: 40, y: 2000 },
    gridPosition: { row: 4, column: 0 },
    isVisible: true,
    isLocked: false,
    order: 8
  },
  {
    id: 'seating-plan',
    type: 'seating-plan',
    title: 'Rozmístění hostů',
    size: 'medium',
    position: { x: 440, y: 2000 },
    gridPosition: { row: 4, column: 1 },
    isVisible: true,
    isLocked: false,
    order: 9
  },
  {
    id: 'marketplace',
    type: 'marketplace',
    title: 'Najít dodavatele',
    size: 'medium',
    position: { x: 840, y: 2000 },
    gridPosition: { row: 4, column: 2 },
    isVisible: true,
    isLocked: false,
    order: 10
  },
  // Row 5 - 3 modules
  {
    id: 'food-drinks',
    type: 'food-drinks',
    title: 'Jídlo a Pití',
    size: 'medium',
    position: { x: 40, y: 2490 },
    gridPosition: { row: 5, column: 0 },
    isVisible: true,
    isLocked: false,
    order: 11
  },
  {
    id: 'music-playlist',
    type: 'music-playlist',
    title: 'Svatební hudba',
    size: 'medium',
    position: { x: 440, y: 2490 },
    gridPosition: { row: 5, column: 1 },
    isVisible: true,
    isLocked: false,
    order: 12
  },
  {
    id: 'upcoming-tasks',
    type: 'upcoming-tasks',
    title: 'Nadcházející úkoly',
    size: 'medium',
    position: { x: 840, y: 2490 },
    gridPosition: { row: 5, column: 2 },
    isVisible: true,
    isLocked: false,
    order: 13
  },
  // Row 6 - 3 modules
  {
    id: 'shopping-list',
    type: 'shopping-list',
    title: 'Nákupní seznam',
    size: 'medium',
    position: { x: 40, y: 2980 },
    gridPosition: { row: 6, column: 0 },
    isVisible: true,
    isLocked: false,
    order: 14
  },
  {
    id: 'wedding-checklist',
    type: 'wedding-checklist',
    title: 'Svatební checklist',
    size: 'medium',
    position: { x: 440, y: 2980 },
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
    position: { x: 840, y: 2980 },
    gridPosition: { row: 6, column: 2 },
    isVisible: true,
    isLocked: false,
    order: 16
  },
  // Row 7 - 3 modules
  {
    id: 'wedding-website',
    type: 'wedding-website',
    title: 'Svatební web',
    size: 'medium',
    position: { x: 40, y: 3470 },
    gridPosition: { row: 7, column: 0 },
    isVisible: true,
    isLocked: false,
    order: 17
  },
  {
    id: 'moodboard',
    type: 'moodboard',
    title: 'Moodboard',
    size: 'medium',
    position: { x: 440, y: 3470 },
    gridPosition: { row: 7, column: 1 },
    isVisible: true,
    isLocked: false,
    order: 18
  },
  {
    id: 'wedding-day-timeline',
    type: 'wedding-day-timeline',
    title: 'Harmonogram svatebního dne',
    size: 'large',
    position: { x: 840, y: 3470 },
    gridPosition: { row: 7, column: 2 },
    isVisible: true,
    isLocked: false,
    order: 19
  }
]
