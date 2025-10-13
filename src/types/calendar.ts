// Calendar & Events Types for SvatBot.cz

export type EventType =
  | 'task'              // Úkol
  | 'appointment'       // Schůzka
  | 'deadline'          // Deadline
  | 'wedding-day'       // Svatební den
  | 'vendor-meeting'    // Schůzka s dodavatelem
  | 'venue-visit'       // Návštěva místa
  | 'tasting'           // Ochutnávka
  | 'fitting'           // Zkouška oblečení
  | 'rehearsal'         // Zkouška obřadu
  | 'custom'            // Vlastní událost
  | 'other'             // Jiné

export type EventPriority = 'low' | 'medium' | 'high' | 'critical'

export type EventStatus = 'upcoming' | 'in-progress' | 'completed' | 'cancelled'

export type EventSource =
  | 'tasks'             // Z modulu úkolů
  | 'vendors'           // Z modulu dodavatelů
  | 'budget'            // Z modulu rozpočtu
  | 'wedding-day'       // Z svatebního dne
  | 'custom'            // Vlastní událost
  | 'imported'          // Importováno

export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'

export type ReminderType = 'notification' | 'email' | 'sms'

export interface CalendarEvent {
  id: string
  weddingId: string
  userId: string

  // Basic info
  title: string
  description?: string
  type: EventType
  source: EventSource
  sourceId?: string // ID of the source item (task, vendor, etc.)

  // Timing
  startDate: Date
  endDate?: Date
  startTime?: string // HH:MM format
  endTime?: string // HH:MM format
  isAllDay: boolean
  timezone?: string

  // Recurrence
  recurrence: RecurrenceType
  recurrenceEndDate?: Date
  recurrenceCount?: number

  // Location
  location?: string
  locationUrl?: string // Google Maps link
  isOnline: boolean
  meetingUrl?: string // Zoom, Meet, etc.

  // Status and priority
  status: EventStatus
  priority: EventPriority
  isCompleted: boolean
  completedAt?: Date

  // Participants
  attendees?: string[] // Guest IDs
  vendorIds?: string[] // Vendor IDs
  organizerId?: string // User ID

  // Reminders
  reminders: EventReminder[]

  // Attachments and notes
  notes?: string
  attachments?: string[] // URLs
  tags?: string[]
  color?: string // Custom color for calendar

  // Metadata
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

export interface EventReminder {
  id: string
  eventId: string
  type: ReminderType
  minutesBefore: number // Minutes before event
  isSent: boolean
  sentAt?: Date
}

export interface CalendarEventFormData {
  title: string
  description?: string
  type: EventType
  startDate: Date
  endDate?: Date
  startTime?: string
  endTime?: string
  isAllDay: boolean
  location?: string
  locationUrl?: string
  isOnline: boolean
  meetingUrl?: string
  priority: EventPriority
  attendees?: string[]
  vendorIds?: string[]
  reminders: {
    type: ReminderType
    minutesBefore: number
  }[]
  notes?: string
  tags?: string[]
  color?: string
  recurrence: RecurrenceType
  recurrenceEndDate?: Date
}

export interface CalendarStats {
  totalEvents: number
  upcomingEvents: number
  todayEvents: number
  thisWeekEvents: number
  thisMonthEvents: number
  completedEvents: number
  overdueEvents: number
  byType: Record<EventType, number>
  byPriority: Record<EventPriority, number>
  bySource: Record<EventSource, number>
}

export interface CalendarFilters {
  search?: string
  types?: EventType[]
  sources?: EventSource[]
  priorities?: EventPriority[]
  statuses?: EventStatus[]
  startDate?: Date
  endDate?: Date
  attendees?: string[]
  vendors?: string[]
  tags?: string[]
}

export interface CalendarViewOptions {
  view: 'month' | 'week' | 'day' | 'list' | 'agenda'
  showWeekends: boolean
  showCompleted: boolean
  groupBy: 'none' | 'type' | 'source' | 'priority'
  sortBy: 'date' | 'priority' | 'title' | 'type'
  sortOrder: 'asc' | 'desc'
}

// Export formats
export type ExportFormat = 'ical' | 'google' | 'apple' | 'outlook' | 'csv' | 'pdf'

export interface ExportOptions {
  format: ExportFormat
  includeCompleted: boolean
  includeReminders: boolean
  dateRange?: {
    start: Date
    end: Date
  }
  filters?: CalendarFilters
}

export interface ICalEvent {
  uid: string
  summary: string
  description?: string
  location?: string
  startDate: Date
  endDate?: Date
  isAllDay: boolean
  reminders?: number[] // Minutes before
  recurrence?: string // RRULE format
  url?: string
}

// Aggregated event from different sources
export interface AggregatedEvent {
  event: CalendarEvent
  sourceData?: {
    taskId?: string
    vendorId?: string
    budgetItemId?: string
    weddingDayEventId?: string
  }
  canEdit: boolean
  canDelete: boolean
}

// Notification settings
export interface CalendarNotificationSettings {
  enabled: boolean
  defaultReminders: {
    type: ReminderType
    minutesBefore: number
  }[]
  notifyForNewEvents: boolean
  notifyForChanges: boolean
  notifyForCancellations: boolean
  emailNotifications: boolean
  pushNotifications: boolean
  smsNotifications: boolean
}

// Calendar integration
export interface CalendarIntegration {
  id: string
  userId: string
  weddingId: string
  provider: 'google' | 'apple' | 'outlook'
  isConnected: boolean
  accessToken?: string
  refreshToken?: string
  expiresAt?: Date
  syncEnabled: boolean
  lastSyncAt?: Date
  calendarId?: string // External calendar ID
  createdAt: Date
  updatedAt: Date
}

// Event conflict detection
export interface EventConflict {
  event1: CalendarEvent
  event2: CalendarEvent
  overlapMinutes: number
  severity: 'warning' | 'error'
}

// Calendar sharing
export interface CalendarShare {
  id: string
  calendarId: string
  sharedWith: string // Email or user ID
  permission: 'view' | 'edit'
  createdAt: Date
  expiresAt?: Date
}

