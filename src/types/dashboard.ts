export interface DashboardModule {
  id: string
  type: 'wedding-countdown' | 'quick-actions' | 'main-features' | 'upcoming-tasks' | 'marketplace' | 'phase-progress' | 'quick-stats' | 'coming-soon' | 'task-management' | 'guest-management' | 'budget-tracking' | 'timeline-planning' | 'vendor-management' | 'seating-plan' | 'ai-assistant' | 'ai-timeline' | 'moodboard'
  title: string
  size: 'small' | 'medium' | 'large' | 'full'
  position: {
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
    position: { row: 0, column: 0 },
    isVisible: true,
    isLocked: false,
    order: 0
  },
  {
    id: 'quick-actions',
    type: 'quick-actions',
    title: 'Rychlé akce',
    size: 'medium',
    position: { row: 0, column: 1 },
    isVisible: true,
    isLocked: false,
    order: 1
  },
  {
    id: 'task-management',
    type: 'task-management',
    title: 'Správa úkolů',
    size: 'medium',
    position: { row: 1, column: 0 },
    isVisible: true,
    isLocked: false,
    order: 2
  },
  {
    id: 'guest-management',
    type: 'guest-management',
    title: 'Správa hostů',
    size: 'medium',
    position: { row: 1, column: 1 },
    isVisible: true,
    isLocked: false,
    order: 3
  },
  {
    id: 'budget-tracking',
    type: 'budget-tracking',
    title: 'Rozpočet',
    size: 'medium',
    position: { row: 1, column: 2 },
    isVisible: true,
    isLocked: false,
    order: 4
  },
  {
    id: 'upcoming-tasks',
    type: 'upcoming-tasks',
    title: 'Nadcházející úkoly',
    size: 'large',
    position: { row: 2, column: 0 },
    isVisible: true,
    isLocked: false,
    order: 5
  },
  {
    id: 'marketplace',
    type: 'marketplace',
    title: 'Najít dodavatele',
    size: 'medium',
    position: { row: 2, column: 1 },
    isVisible: true,
    isLocked: false,
    order: 6
  },
  {
    id: 'timeline-planning',
    type: 'timeline-planning',
    title: 'Časový plán',
    size: 'medium',
    position: { row: 3, column: 0 },
    isVisible: true,
    isLocked: false,
    order: 7
  },
  {
    id: 'vendor-management',
    type: 'vendor-management',
    title: 'Dodavatelé',
    size: 'medium',
    position: { row: 3, column: 1 },
    isVisible: true,
    isLocked: false,
    order: 8
  },
  {
    id: 'seating-plan',
    type: 'seating-plan',
    title: 'Rozmístění hostů',
    size: 'medium',
    position: { row: 3, column: 2 },
    isVisible: true,
    isLocked: false,
    order: 9
  },
  {
    id: 'phase-progress',
    type: 'phase-progress',
    title: 'Pokrok podle fází',
    size: 'large',
    position: { row: 4, column: 0 },
    isVisible: true,
    isLocked: false,
    order: 10
  },
  {
    id: 'quick-stats',
    type: 'quick-stats',
    title: 'Rychlé statistiky',
    size: 'medium',
    position: { row: 4, column: 1 },
    isVisible: true,
    isLocked: false,
    order: 11
  },
  {
    id: 'ai-assistant',
    type: 'ai-assistant',
    title: 'AI Asistent',
    size: 'medium',
    position: { row: 4, column: 2 },
    isVisible: false,
    isLocked: false,
    order: 12
  },
  {
    id: 'ai-timeline',
    type: 'ai-timeline',
    title: 'AI Timeline',
    size: 'large',
    position: { row: 5, column: 0 },
    isVisible: true,
    isLocked: false,
    order: 13
  },
  {
    id: 'moodboard',
    type: 'moodboard',
    title: 'Moodboard',
    size: 'medium',
    position: { row: 5, column: 2 },
    isVisible: true,
    isLocked: false,
    order: 14
  },
  {
    id: 'coming-soon',
    type: 'coming-soon',
    title: 'Připravované funkce',
    size: 'full',
    position: { row: 6, column: 0 },
    isVisible: false,
    isLocked: false,
    order: 15
  }
]
