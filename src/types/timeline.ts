// Timeline & Planning Types for SvatBot.cz

export type MilestoneType =
  | 'engagement'      // Zasnoubení
  | 'venue-booking'   // Rezervace místa
  | 'vendor-booking'  // Rezervace dodavatelů
  | 'invitations'     // Rozeslání pozvánek
  | 'rsvp-deadline'   // Deadline RSVP
  | 'final-headcount' // Finální počet hostů
  | 'rehearsal'       // Zkouška
  | 'wedding-day'     // Den svatby
  | 'honeymoon'       // Svatební cesta
  | 'custom'          // Vlastní milník

export type MilestoneStatus =
  | 'upcoming'        // Nadcházející
  | 'in-progress'     // Probíhá
  | 'completed'       // Dokončeno
  | 'overdue'         // Po termínu
  | 'cancelled'       // Zrušeno

export type TimelinePeriod =
  | '12-months'       // 12 měsíců před
  | '9-months'        // 9 měsíců před
  | '6-months'        // 6 měsíců před
  | '3-months'        // 3 měsíce před
  | '1-month'         // 1 měsíc před
  | '2-weeks'         // 2 týdny před
  | '1-week'          // 1 týden před
  | 'wedding-day'     // Den svatby
  | 'after-wedding'   // Po svatbě

export type AppointmentType =
  | 'venue-visit'     // Prohlídka místa
  | 'vendor-meeting'  // Schůzka s dodavatelem
  | 'dress-fitting'   // Zkouška šatů
  | 'cake-tasting'    // Ochutnávka dortu
  | 'menu-tasting'    // Ochutnávka menu
  | 'rehearsal'       // Zkouška obřadu
  | 'other'           // Jiné

export interface Milestone {
  id: string
  weddingId: string

  // Basic info
  title: string
  description?: string
  type: MilestoneType

  // Timing
  targetDate: Date
  completedDate?: Date
  period: TimelinePeriod

  // Status
  status: MilestoneStatus
  progress: number // 0-100%

  // Dependencies
  dependsOn: string[] // IDs of other milestones
  blockedBy: string[] // IDs of milestones blocking this one

  // Related items
  taskIds: string[] // Related tasks
  budgetItemIds: string[] // Related budget items
  guestIds: string[] // Related guests
  vendorIds: string[] // Related vendors

  // Importance
  priority: 'low' | 'medium' | 'high' | 'critical'
  isRequired: boolean

  // Notifications
  reminderDays: number[] // Days before to remind (e.g., [7, 3, 1])
  notificationsSent: Date[]

  // Notes and attachments
  notes?: string
  attachments: string[] // URLs to files
  tags: string[]

  // Metadata
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

export interface Appointment {
  id: string
  weddingId: string
  milestoneId?: string

  // Basic info
  title: string
  description?: string
  type: AppointmentType

  // Timing
  startDate: Date
  endDate: Date
  duration: number // minutes

  // Location
  location?: {
    name: string
    address: string
    coordinates?: { lat: number; lng: number }
  }

  // Participants
  attendees: {
    id: string
    name: string
    email?: string
    phone?: string
    role: 'bride' | 'groom' | 'vendor' | 'family' | 'friend' | 'other'
    confirmed: boolean
  }[]

  // Vendor info
  vendorId?: string
  vendorName?: string
  vendorContact?: string

  // Status
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled'
  confirmationRequired: boolean

  // Preparation
  preparation?: {
    items: string[] // What to bring
    questions: string[] // Questions to ask
    documents: string[] // Documents needed
  }

  // Follow-up
  followUpRequired: boolean
  followUpDate?: Date
  followUpNotes?: string

  // Notes
  notes?: string
  tags: string[]

  // Metadata
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

export interface TimelineTemplate {
  id: string
  name: string
  description: string
  weddingType: 'small' | 'medium' | 'large' | 'destination' | 'elopement'
  milestones: {
    type: MilestoneType
    title: string
    description: string
    monthsBefore: number
    weeksBefore?: number
    daysBefore?: number
    priority: 'low' | 'medium' | 'high' | 'critical'
    isRequired: boolean
    reminderDays: number[]
    estimatedDuration?: number // days to complete
  }[]
  region: string // 'CZ', 'SK', 'EU'
}

export interface TimelineStats {
  totalMilestones: number
  completedMilestones: number
  upcomingMilestones: number
  overdueMilestones: number

  // Progress
  overallProgress: number // percentage
  onTrackPercentage: number

  // By period
  byPeriod: Record<TimelinePeriod, {
    total: number
    completed: number
    upcoming: number
    overdue: number
  }>

  // Critical path
  criticalMilestones: string[] // IDs of critical milestones
  nextDeadline?: {
    milestoneId: string
    title: string
    date: Date
    daysRemaining: number
  }

  // Appointments
  totalAppointments: number
  upcomingAppointments: number
  confirmedAppointments: number

  // Alerts
  overdueItems: number
  upcomingDeadlines: number
  unconfirmedAppointments: number
}

export interface TimelineFilters {
  search?: string
  type?: MilestoneType[]
  status?: MilestoneStatus[]
  period?: TimelinePeriod[]
  priority?: ('low' | 'medium' | 'high' | 'critical')[]
  dateRange?: {
    start: Date
    end: Date
  }
  tags?: string[]
  showCompleted?: boolean
  showOverdue?: boolean
}

export interface TimelineViewOptions {
  groupBy: 'period' | 'type' | 'status' | 'priority' | 'none'
  sortBy: 'date' | 'priority' | 'status' | 'created'
  sortOrder: 'asc' | 'desc'
  viewType: 'timeline' | 'calendar' | 'list' | 'kanban'
  showDependencies: boolean
  showProgress: boolean
  timeRange: 'all' | '3-months' | '6-months' | '1-year'
}

export interface MilestoneFormData {
  title: string
  description?: string
  type: MilestoneType
  targetDate: Date
  priority: 'low' | 'medium' | 'high' | 'critical'
  isRequired: boolean
  reminderDays: number[]
  notes?: string
  tags: string[]
  dependsOn: string[]
}

export interface AppointmentFormData {
  title: string
  description?: string
  type: AppointmentType
  startDate: Date
  endDate: Date
  location?: {
    name: string
    address: string
  }
  vendorName?: string
  vendorContact?: string
  attendees: {
    name: string
    email?: string
    role: 'bride' | 'groom' | 'vendor' | 'family' | 'friend' | 'other'
  }[]
  preparation?: {
    items: string[]
    questions: string[]
    documents: string[]
  }
  notes?: string
  tags: string[]
}

// Timeline templates for different wedding types
export const TIMELINE_TEMPLATES: TimelineTemplate[] = [
  {
    id: 'small-wedding-timeline',
    name: 'Malá svatba',
    description: 'Timeline pro intimní svatbu 30-50 hostů',
    weddingType: 'small',
    milestones: [
      {
        type: 'engagement',
        title: 'Zasnoubení',
        description: 'Začátek svatebního plánování',
        monthsBefore: 12,
        priority: 'high',
        isRequired: true,
        reminderDays: []
      },
      {
        type: 'venue-booking',
        title: 'Rezervace místa',
        description: 'Rezervace svatebního místa',
        monthsBefore: 9,
        priority: 'critical',
        isRequired: true,
        reminderDays: [30, 14, 7],
        estimatedDuration: 14
      },
      {
        type: 'vendor-booking',
        title: 'Rezervace dodavatelů',
        description: 'Fotograf, catering, hudba',
        monthsBefore: 6,
        priority: 'critical',
        isRequired: true,
        reminderDays: [30, 14, 7],
        estimatedDuration: 30
      },
      {
        type: 'invitations',
        title: 'Rozeslání pozvánek',
        description: 'Vytvoření a rozeslání svatebních pozvánek',
        monthsBefore: 2,
        priority: 'high',
        isRequired: true,
        reminderDays: [14, 7, 3],
        estimatedDuration: 7
      },
      {
        type: 'rsvp-deadline',
        title: 'Deadline RSVP',
        description: 'Konečný termín pro potvrzení účasti',
        monthsBefore: 1,
        priority: 'high',
        isRequired: true,
        reminderDays: [7, 3, 1]
      },
      {
        type: 'final-headcount',
        title: 'Finální počet hostů',
        description: 'Potvrzení konečného počtu hostů',
        monthsBefore: 0,
        weeksBefore: 2,
        priority: 'critical',
        isRequired: true,
        reminderDays: [7, 3, 1]
      },
      {
        type: 'rehearsal',
        title: 'Zkouška obřadu',
        description: 'Zkouška svatebního obřadu',
        monthsBefore: 0,
        daysBefore: 1,
        priority: 'medium',
        isRequired: false,
        reminderDays: [3, 1]
      },
      {
        type: 'wedding-day',
        title: 'Den svatby',
        description: 'Váš velký den!',
        monthsBefore: 0,
        daysBefore: 0,
        priority: 'critical',
        isRequired: true,
        reminderDays: [7, 3, 1]
      }
    ],
    region: 'CZ'
  }
]

export interface TimelineListProps {
  milestones: Milestone[]
  appointments: Appointment[]
  filters?: TimelineFilters
  viewOptions?: TimelineViewOptions
  onMilestoneUpdate: (milestone: Milestone) => void
  onMilestoneDelete: (milestoneId: string) => void
  onMilestoneCreate: (milestone: Omit<Milestone, 'id' | 'createdAt' | 'updatedAt'>) => void
  onAppointmentUpdate?: (appointment: Appointment) => void
  onAppointmentDelete?: (appointmentId: string) => void
  onAppointmentCreate?: (appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => void
  loading?: boolean
  error?: string
}

// Milestone type configurations
export const MILESTONE_TYPES = {
  engagement: {
    name: 'Zasnoubení',
    icon: '💍',
    color: 'bg-pink-100 text-pink-700',
    defaultPriority: 'high'
  },
  'venue-booking': {
    name: 'Rezervace místa',
    icon: '🏛️',
    color: 'bg-blue-100 text-blue-700',
    defaultPriority: 'critical'
  },
  'vendor-booking': {
    name: 'Rezervace dodavatelů',
    icon: '🤝',
    color: 'bg-green-100 text-green-700',
    defaultPriority: 'critical'
  },
  invitations: {
    name: 'Pozvánky',
    icon: '💌',
    color: 'bg-purple-100 text-purple-700',
    defaultPriority: 'high'
  },
  'rsvp-deadline': {
    name: 'Deadline RSVP',
    icon: '📅',
    color: 'bg-orange-100 text-orange-700',
    defaultPriority: 'high'
  },
  'final-headcount': {
    name: 'Finální počet',
    icon: '👥',
    color: 'bg-indigo-100 text-indigo-700',
    defaultPriority: 'critical'
  },
  rehearsal: {
    name: 'Zkouška',
    icon: '🎭',
    color: 'bg-yellow-100 text-yellow-700',
    defaultPriority: 'medium'
  },
  'wedding-day': {
    name: 'Den svatby',
    icon: '💒',
    color: 'bg-red-100 text-red-700',
    defaultPriority: 'critical'
  },
  honeymoon: {
    name: 'Svatební cesta',
    icon: '✈️',
    color: 'bg-teal-100 text-teal-700',
    defaultPriority: 'medium'
  },
  custom: {
    name: 'Vlastní',
    icon: '📋',
    color: 'bg-gray-100 text-gray-700',
    defaultPriority: 'medium'
  }
} as const
