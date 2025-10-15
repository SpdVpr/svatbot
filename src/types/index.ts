// User and Authentication Types
export interface User {
  id: string
  email: string
  displayName?: string
  photoURL?: string
  gender?: 'male' | 'female' | 'other'
  createdAt: Date
  updatedAt: Date
}

// Wedding Types
export interface Wedding {
  id: string
  userId: string
  brideName: string
  groomName: string
  weddingDate: Date | null
  estimatedGuestCount: number
  budget: number
  style?: string // Volné pole pro styl svatby (např. "rustikální", "moderní", vlastní text)
  region: string
  venue?: Venue
  status: WeddingStatus
  progress: WeddingProgress
  createdAt: Date
  updatedAt: Date
}

export type WeddingStyle = 
  | 'classic'
  | 'modern'
  | 'rustic'
  | 'vintage'
  | 'bohemian'
  | 'minimalist'
  | 'garden'
  | 'beach'
  | 'destination'

export type WeddingStatus = 
  | 'planning'
  | 'booked'
  | 'confirmed'
  | 'completed'
  | 'cancelled'

export interface WeddingProgress {
  overall: number // 0-100
  foundation: number // Fáze 1
  venue: number // Fáze 2
  guests: number // Fáze 3
  budget: number // Fáze 4
  design: number // Fáze 5
  organization: number // Fáze 6
  final: number // Fáze 7
}

// Guest Types
export interface Guest {
  id: string
  weddingId: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  address?: Address
  relationship: GuestRelationship
  category: GuestCategory
  rsvpStatus: RSVPStatus
  rsvpDate?: Date
  guestCount: number // including +1s
  dietaryRestrictions?: string[]
  accommodationNeeded: boolean
  accommodationId?: string // ID of selected accommodation
  roomId?: string // ID of selected room
  transportationNeeded: boolean
  tableNumber?: number
  seatNumber?: number
  specialRole?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export type GuestRelationship = 
  | 'family'
  | 'friend'
  | 'colleague'
  | 'other'

export type GuestCategory = 
  | 'bride-family'
  | 'groom-family'
  | 'bride-friends'
  | 'groom-friends'
  | 'mutual-friends'
  | 'colleagues'
  | 'other'

export type RSVPStatus = 
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'maybe'
  | 'no-response'

export interface Address {
  street: string
  city: string
  postalCode: string
  country: string
}

// Budget Types
export interface BudgetItem {
  id: string
  weddingId: string
  name: string
  category: BudgetCategory
  estimatedCost: number
  actualCost?: number
  paidAmount: number
  remainingAmount: number
  dueDate?: Date
  vendor?: Vendor
  priority: Priority
  status: BudgetItemStatus
  notes?: string
  attachments?: string[]
  createdAt: Date
  updatedAt: Date
}

export type BudgetCategory = 
  | 'venue'
  | 'catering'
  | 'photography'
  | 'videography'
  | 'music'
  | 'flowers'
  | 'decoration'
  | 'attire'
  | 'beauty'
  | 'transportation'
  | 'stationery'
  | 'gifts'
  | 'other'

export type Priority = 'high' | 'medium' | 'low'

export type BudgetItemStatus = 
  | 'planned'
  | 'quoted'
  | 'booked'
  | 'deposit-paid'
  | 'completed'
  | 'paid'

// Venue Types
export interface Venue {
  id: string
  name: string
  description: string
  address: Address
  coordinates: {
    lat: number
    lng: number
  }
  capacity: {
    min: number
    max: number
  }
  priceRange: {
    min: number
    max: number
  }
  venueType: VenueType
  style: WeddingStyle[]
  amenities: string[]
  images: string[]
  contactInfo: ContactInfo
  availability: Date[]
  rating: number
  reviewCount: number
  verified: boolean
  featured: boolean
  createdAt: Date
  updatedAt: Date
}

export type VenueType = 
  | 'castle'
  | 'hotel'
  | 'winery'
  | 'garden'
  | 'hall'
  | 'church'
  | 'outdoor'
  | 'restaurant'
  | 'unique'

export interface ContactInfo {
  email: string
  phone: string
  website?: string
  socialMedia?: {
    instagram?: string
    facebook?: string
  }
}

// Vendor Types
export interface Vendor {
  id: string
  name: string
  description: string
  category: VendorCategory
  services: string[]
  priceRange: {
    min: number
    max: number
  }
  location: string
  contactInfo: ContactInfo
  portfolio: string[]
  rating: number
  reviewCount: number
  verified: boolean
  featured: boolean
  availability: Date[]
  packages: VendorPackage[]
  createdAt: Date
  updatedAt: Date
}

export type VendorCategory = 
  | 'photographer'
  | 'videographer'
  | 'musician'
  | 'dj'
  | 'florist'
  | 'decorator'
  | 'caterer'
  | 'baker'
  | 'transportation'
  | 'beauty'
  | 'attire'
  | 'coordinator'
  | 'entertainment'
  | 'other'

export interface VendorPackage {
  id: string
  name: string
  description: string
  price: number
  duration?: string
  includes: string[]
  excludes?: string[]
}

// Task Types
export interface Task {
  id: string
  weddingId: string
  title: string
  description?: string
  category: TaskCategory
  phase: WeddingPhase
  priority: Priority
  status: TaskStatus
  dueDate?: Date
  completedDate?: Date
  assignedTo?: string
  estimatedCost?: number
  vendor?: Vendor
  dependencies?: string[] // task IDs
  attachments?: string[]
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export type TaskCategory = 
  | 'venue'
  | 'catering'
  | 'photography'
  | 'music'
  | 'flowers'
  | 'attire'
  | 'beauty'
  | 'transportation'
  | 'stationery'
  | 'legal'
  | 'other'

export type WeddingPhase = 
  | 'foundation' // 12-6 months
  | 'venue' // 6-4 months
  | 'guests' // 4-3 months
  | 'budget' // 3-2 months
  | 'design' // 2-1 month
  | 'organization' // 1 month-2 weeks
  | 'final' // 2 weeks-1 day

export type TaskStatus = 
  | 'not-started'
  | 'in-progress'
  | 'completed'
  | 'skipped'
  | 'blocked'

// Timeline Types
export interface TimelineEvent {
  id: string
  weddingId: string
  title: string
  description?: string
  startTime: Date
  endTime: Date
  location?: string
  type: TimelineEventType
  participants?: string[]
  vendor?: Vendor
  notes?: string
  isPhotographed: boolean
  createdAt: Date
  updatedAt: Date
}

export type TimelineEventType = 
  | 'preparation'
  | 'ceremony'
  | 'photoshoot'
  | 'cocktail'
  | 'dinner'
  | 'party'
  | 'transportation'
  | 'special'
  | 'other'

// Seating Plan Types
export interface SeatingPlan {
  id: string
  weddingId: string
  name: string
  layout: TableLayout[]
  createdAt: Date
  updatedAt: Date
}

export interface TableLayout {
  id: string
  tableNumber: number
  tableName?: string
  capacity: number
  shape: TableShape
  position: {
    x: number
    y: number
  }
  guests: string[] // guest IDs
  specialRequirements?: string[]
}

export type TableShape = 'round' | 'square' | 'rectangular' | 'oval'

// Gift Registry Types
export interface GiftItem {
  id: string
  weddingId: string
  name: string
  description?: string
  category: GiftCategory
  price: number
  quantity: number
  reservedQuantity: number
  purchasedQuantity: number
  priority: Priority
  store?: string
  url?: string
  image?: string
  reservations: GiftReservation[]
  createdAt: Date
  updatedAt: Date
}

export type GiftCategory = 
  | 'home'
  | 'kitchen'
  | 'bedroom'
  | 'bathroom'
  | 'experience'
  | 'money'
  | 'other'

export interface GiftReservation {
  id: string
  guestId: string
  quantity: number
  status: 'reserved' | 'purchased' | 'delivered'
  reservedAt: Date
  purchasedAt?: Date
  deliveredAt?: Date
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

// Accommodation Types
export interface Accommodation {
  id: string
  weddingId: string
  name: string
  description?: string
  address: Address
  coordinates?: {
    lat: number
    lng: number
  }
  contactInfo: ContactInfo
  website?: string
  images: string[]
  amenities: string[]
  rooms: Room[]
  policies?: AccommodationPolicies
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Room {
  id: string
  accommodationId: string
  name: string
  description?: string
  type: RoomType
  capacity: number // number of beds/people
  bedConfiguration: BedConfiguration[]
  pricePerNight: number
  totalPrice?: number // for entire stay
  amenities: string[]
  images: string[]
  isAvailable: boolean
  maxOccupancy: number
  reservations: RoomReservation[]
  createdAt: Date
  updatedAt: Date
}

export type RoomType =
  | 'single'
  | 'double'
  | 'twin'
  | 'suite'
  | 'family'
  | 'apartment'
  | 'other'

export interface BedConfiguration {
  type: BedType
  count: number
}

export type BedType =
  | 'single'
  | 'double'
  | 'queen'
  | 'king'
  | 'sofa-bed'
  | 'bunk-bed'
  | 'crib'

export interface AccommodationPolicies {
  checkIn: string // e.g., "15:00"
  checkOut: string // e.g., "11:00"
  cancellationPolicy?: string
  petPolicy?: string
  smokingPolicy?: string
  childrenPolicy?: string
  additionalFees?: string[]
}

export interface RoomReservation {
  id: string
  roomId: string
  guestId: string
  guestName: string
  guestEmail?: string
  guestPhone?: string
  checkIn: Date
  checkOut: Date
  numberOfGuests: number
  totalPrice: number
  status: ReservationStatus
  specialRequests?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export type ReservationStatus =
  | 'pending'
  | 'confirmed'
  | 'checked-in'
  | 'checked-out'
  | 'cancelled'
  | 'no-show'

// Form Types
export interface OnboardingData {
  brideName: string
  groomName: string
  email: string
  phone?: string
  weddingDate?: Date
  estimatedGuestCount: number
  budget: number
  style?: string // Volné pole pro styl svatby (nepovinné)
  region: string
}
