// Guest Management Types for SvatBot.cz

export type RSVPStatus = 'pending' | 'attending' | 'declined' | 'maybe'

export type GuestCategory =
  | 'family-bride'     // Rodina nevěsty
  | 'family-groom'     // Rodina ženicha
  | 'friends-bride'    // Přátelé nevěsty
  | 'friends-groom'    // Přátelé ženicha
  | 'colleagues-bride' // Kolegové nevěsty
  | 'colleagues-groom' // Kolegové ženicha
  | 'other'           // Ostatní

export type InvitationType =
  | 'ceremony-reception' // Obřad + hostina
  | 'ceremony-only'      // Pouze obřad
  | 'reception-only'     // Pouze hostina

export type DietaryRestriction =
  | 'vegetarian'    // Vegetariánská
  | 'vegan'         // Veganská
  | 'gluten-free'   // Bezlepková
  | 'lactose-free'  // Bez laktózy
  | 'kosher'        // Košer
  | 'halal'         // Halal
  | 'diabetic'      // Diabetická
  | 'allergies'     // Alergie
  | 'other'         // Jiné

export interface Guest {
  id: string
  weddingId: string

  // Basic info
  firstName: string
  lastName: string
  email?: string
  phone?: string

  // Address
  address?: {
    street: string
    city: string
    postalCode: string
    country: string
  }

  // Wedding specific
  category: GuestCategory
  invitationType: InvitationType
  rsvpStatus: RSVPStatus
  rsvpDate?: Date

  // Plus one
  hasPlusOne: boolean
  plusOneName?: string
  plusOneRsvpStatus?: RSVPStatus

  // Special requirements
  dietaryRestrictions: DietaryRestriction[]
  dietaryNotes?: string
  accessibilityNeeds?: string
  accommodationNeeds?: string

  // Contact preferences
  preferredContactMethod: 'email' | 'phone' | 'mail'
  language: 'cs' | 'en' | 'sk' | 'de' // Preferovaný jazyk

  // Internal notes
  notes?: string
  tags: string[] // Custom tags for organization

  // Tracking
  invitationSent: boolean
  invitationSentDate?: Date
  reminderSent: boolean
  reminderSentDate?: Date

  // Metadata
  sortOrder?: number // For drag and drop ordering
  createdAt: Date
  updatedAt: Date
  createdBy: string // User ID who added the guest
}

export interface GuestGroup {
  id: string
  weddingId: string
  name: string
  description?: string
  guestIds: string[]
  color?: string
  createdAt: Date
  updatedAt: Date
}

export interface RSVPResponse {
  id: string
  guestId: string
  weddingId: string

  // Response details
  attending: boolean
  plusOneAttending?: boolean
  guestCount: number // Total attending (guest + plus one)

  // Meal preferences
  mealChoice?: string
  plusOneMealChoice?: string
  dietaryRestrictions: DietaryRestriction[]
  dietaryNotes?: string

  // Additional info
  songRequests?: string
  specialRequests?: string
  accommodationNeeded: boolean
  transportationNeeded: boolean

  // Response metadata
  responseDate: Date
  responseMethod: 'online' | 'phone' | 'email' | 'mail'
  ipAddress?: string
  userAgent?: string
}

export interface GuestStats {
  total: number
  invited: number
  attending: number
  declined: number
  pending: number
  maybe: number

  // Plus ones
  totalWithPlusOnes: number
  plusOnesAttending: number
  plusOnes: number

  // By category
  byCategory: Record<GuestCategory, {
    total: number
    attending: number
    declined: number
    pending: number
  }>

  // By invitation type
  ceremonyOnly: number
  receptionOnly: number
  ceremonyAndReception: number

  // Special requirements
  dietaryRestrictions: Record<DietaryRestriction, number>
  accessibilityNeeds: number
  accommodationNeeds: number
}

export interface GuestFilters {
  search?: string
  category?: GuestCategory[]
  rsvpStatus?: RSVPStatus[]
  invitationType?: InvitationType[]
  hasPlusOne?: boolean
  dietaryRestrictions?: DietaryRestriction[]
  invitationSent?: boolean
  tags?: string[]
  groupId?: string
}

export interface GuestFormData {
  firstName: string
  lastName: string
  email?: string
  phone?: string
  address?: {
    street: string
    city: string
    postalCode: string
    country: string
  }
  category: GuestCategory
  invitationType: InvitationType
  hasPlusOne: boolean
  plusOneName?: string
  dietaryRestrictions: DietaryRestriction[]
  dietaryNotes?: string
  accessibilityNeeds?: string
  accommodationNeeds?: string
  preferredContactMethod: 'email' | 'phone' | 'mail'
  language: 'cs' | 'en' | 'sk' | 'de'
  notes?: string
  tags: string[]
}

export interface BulkGuestOperation {
  guestIds: string[]
  operation: 'delete' | 'update-category' | 'update-rsvp' | 'send-invitation' | 'send-reminder' | 'export'
  data?: Partial<Guest>
}

export interface GuestImportData {
  firstName: string
  lastName: string
  email?: string
  phone?: string
  category?: string
  notes?: string
}

export interface GuestExportOptions {
  format: 'csv' | 'excel' | 'pdf'
  fields: string[]
  filters?: GuestFilters
  includeRSVP: boolean
  includePlusOnes: boolean
}

// RSVP Form for public-facing pages
export interface PublicRSVPForm {
  guestId: string
  accessCode: string
  attending: boolean
  plusOneAttending?: boolean
  mealChoice?: string
  plusOneMealChoice?: string
  dietaryRestrictions: DietaryRestriction[]
  dietaryNotes?: string
  songRequests?: string
  specialRequests?: string
  accommodationNeeded: boolean
  transportationNeeded: boolean
}

// Seating arrangement types
export interface Table {
  id: string
  weddingId: string
  name: string
  capacity: number
  shape: 'round' | 'rectangular' | 'square'
  guestIds: string[]
  notes?: string
  position?: { x: number; y: number }
}

export interface SeatingArrangement {
  id: string
  weddingId: string
  name: string
  description?: string
  tables: Table[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// Guest list view options
export interface GuestViewOptions {
  groupBy: 'category' | 'rsvp-status' | 'invitation-type' | 'none'
  sortBy: 'name' | 'category' | 'rsvp-date' | 'created' | 'last-name'
  sortOrder: 'asc' | 'desc'
  showPlusOnes: boolean
  showContactInfo: boolean
  showNotes: boolean
}

export interface GuestListProps {
  guests: Guest[]
  filters?: GuestFilters
  viewOptions?: GuestViewOptions
  onGuestUpdate: (guest: Guest) => void
  onGuestDelete: (guestId: string) => void
  onGuestCreate: (guest: Omit<Guest, 'id' | 'createdAt' | 'updatedAt'>) => void
  onBulkOperation?: (operation: BulkGuestOperation) => void
  onRSVPUpdate?: (guestId: string, rsvpData: Partial<RSVPResponse>) => void
  loading?: boolean
  error?: string
}

// Enhanced RSVP System Types
export interface RSVPInvitation {
  id: string
  weddingId: string
  guestId: string
  invitationCode: string // Unique code for guest access

  // Email settings
  emailSent: boolean
  emailSentAt?: Date
  emailTemplate: string
  customMessage?: string

  // Access settings
  expiresAt?: Date
  isActive: boolean
  maxResponses: number // For plus ones

  // Tracking
  viewedAt?: Date
  respondedAt?: Date
  remindersSent: number
  lastReminderAt?: Date

  // Metadata
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

export interface RSVPTemplate {
  id: string
  name: string
  subject: string
  htmlContent: string
  textContent: string

  // Template variables available:
  // {{guestName}}, {{weddingDate}}, {{venueName}}, {{rsvpLink}}, {{customMessage}}

  isDefault: boolean
  createdAt: Date
  updatedAt: Date
}

export interface RSVPSettings {
  id: string
  weddingId: string

  // General settings
  isEnabled: boolean
  rsvpDeadline: Date
  allowPlusOnes: boolean
  requireDietaryInfo: boolean
  requireAccommodationInfo: boolean

  // Email settings
  senderName: string
  senderEmail: string
  replyToEmail: string

  // Reminder settings
  sendReminders: boolean
  reminderDays: number[] // Days before deadline to send reminders
  maxReminders: number

  // Customization
  welcomeMessage: string
  thankYouMessage: string
  customQuestions: RSVPCustomQuestion[]

  // Branding
  primaryColor: string
  logoUrl?: string
  backgroundImage?: string

  // Metadata
  createdAt: Date
  updatedAt: Date
}

export interface RSVPCustomQuestion {
  id: string
  question: string
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'radio'
  options?: string[] // For select/radio questions
  required: boolean
  order: number
}

export interface RSVPStats {
  totalInvitations: number
  sentInvitations: number
  viewedInvitations: number
  respondedInvitations: number

  // Response breakdown
  attending: number
  notAttending: number
  pending: number

  // Plus ones
  plusOnesInvited: number
  plusOnesAttending: number

  // Response rates
  responseRate: number // Percentage
  attendanceRate: number // Percentage of responses that are attending

  // Timeline
  responsesPerDay: Record<string, number>
  averageResponseTime: number // Hours

  // Special needs
  dietaryRestrictions: number
  accessibilityNeeds: number
  accommodationNeeded: number
  transportNeeded: number
}
