// Wedding Website Types

export type TemplateType =
  | 'winter-elegance'
  | 'twain-love'
  | 'pretty'

export type RSVPStatus = 'attending' | 'declined' | 'maybe'

// Hero Section
export interface HeroContent {
  bride: string
  groom: string
  weddingDate: Date
  mainImage?: string
  tagline?: string
  imagePosition?: { x: number; y: number }
  imageScale?: number
}

// Story Section
export interface StoryTimelineItem {
  id: string
  date: string
  title: string
  description: string
  icon: string
  image?: string
}

export interface PersonProfile {
  name: string
  description: string
  image?: string
  hobbies?: string
  favoriteThings?: string
}

export interface StoryContent {
  enabled: boolean
  title?: string
  subtitle?: string
  description?: string
  bride?: PersonProfile
  groom?: PersonProfile
  howWeMet?: {
    title: string
    text: string
    image?: string
    date?: Date
  }
  proposal?: {
    title: string
    text: string
    image?: string
    date?: Date
  }
  timeline?: StoryTimelineItem[]
}

// Info Section (Venue)
export interface VenueInfo {
  time: string
  venue: string
  address: string
  mapUrl?: string
  coordinates?: {
    lat: number
    lng: number
  }
  images?: string[] // Array of image URLs for venue photos
}

export interface CustomInfo {
  id: string
  title: string
  description: string
  icon: string
}

export interface InfoContent {
  enabled: boolean
  ceremony?: VenueInfo
  reception?: VenueInfo
  parking?: string
  accessibility?: string
  customInfo?: CustomInfo[]
}

// Dress Code Section
export interface ColorWithImages {
  color: string // Hex color code
  name?: string // Optional color name (e.g., "Burgundy", "Navy Blue")
  images: string[] // Array of image URLs for this color inspiration
}

export interface DressCodeContent {
  enabled: boolean
  dressCode?: string
  dressCodeDetails?: string
  colors?: ColorWithImages[] // Array of colors with their inspiration images
  // Legacy support - will be migrated to colors array
  colorPalette?: string[]
  images?: string[]
}

// Schedule Section
export interface ScheduleItem {
  time: string
  title: string
  description?: string
  icon?: string
}

export interface ScheduleContent {
  enabled: boolean
  items: ScheduleItem[]
}

// RSVP Section
export interface MealOption {
  id: string
  name: string
  description: string
}

export interface RSVPContent {
  enabled: boolean
  deadline?: Date
  mealSelection: boolean
  mealOptions?: MealOption[]
  plusOneAllowed: boolean
  songRequests: boolean
  dietaryRestrictions?: boolean
  accommodationSelection?: boolean
  message?: string
  contactName?: string
  contactPhone?: string
  contactEmail?: string
}

// Accommodation Section
export interface WebsiteAccommodation {
  id: string
  name: string
  description?: string
  address: string
  phone?: string
  email?: string
  website?: string
  image?: string
  rooms: WebsiteRoom[]
}

export interface WebsiteRoom {
  name: string
  description?: string
  pricePerNight: number
  capacity: number
  count: number // Number of identical rooms available
}

export interface AccommodationContent {
  enabled: boolean
  title?: string
  description?: string
  showPrices: boolean
  showAvailability: boolean
  accommodations?: WebsiteAccommodation[] // Imported accommodations
  contactInfo?: {
    name: string
    phone?: string
    email?: string
    message?: string
  }
}

// Gift Section
export interface RegistryItem {
  name: string
  url: string
  description?: string
}

export interface GiftContent {
  enabled: boolean
  message?: string
  bankAccount?: string
  registry?: RegistryItem[]
}

// Gallery Section
export interface GalleryImage {
  id: string
  url: string
  thumbnailUrl?: string
  caption?: string
  alt: string
  uploadedBy?: string
  uploadedAt: Date
}

export interface GalleryContent {
  enabled: boolean
  title?: string
  subtitle?: string
  description?: string
  images?: GalleryImage[]
  allowGuestUploads?: boolean
}

// Contact Section
export interface ContactPerson {
  name: string
  email?: string
  phone?: string
}

export interface ContactContent {
  enabled: boolean
  bride?: ContactPerson
  groom?: ContactPerson
  bridesmaids?: Array<{ name: string; phone?: string }>
  groomsmen?: Array<{ name: string; phone?: string }>
}

// FAQ Section
export interface FAQItem {
  question: string
  answer: string
}

export interface FAQContent {
  enabled: boolean
  items: FAQItem[]
}

// Menu Section (Food & Drinks)
export interface MenuItem {
  id: string
  name: string
  description?: string
  category: 'appetizer' | 'soup' | 'main' | 'dessert' | 'drink' | 'other'
  dietaryInfo?: string[]
}

export interface MenuContent {
  enabled: boolean
  title?: string
  description?: string
  showCategories: boolean
  showDietaryInfo: boolean
  showDrinks: boolean
  showSideDishes: boolean
  showDesserts: boolean
  items?: MenuItem[]
}

// Section order type
export type SectionType = 'hero' | 'story' | 'info' | 'dressCode' | 'schedule' | 'rsvp' | 'accommodation' | 'gift' | 'gallery' | 'contact' | 'faq' | 'menu'

// Website Content
export interface WebsiteContent {
  hero: HeroContent
  story: StoryContent
  info: InfoContent
  dressCode: DressCodeContent
  schedule: ScheduleContent
  rsvp: RSVPContent
  accommodation: AccommodationContent
  gift: GiftContent
  gallery: GalleryContent
  contact: ContactContent
  faq: FAQContent
  menu: MenuContent
  sectionOrder?: SectionType[] // Custom order of sections
}

// Website Style
export interface WebsiteStyle {
  primaryColor: string
  secondaryColor: string
  accentColor: string
  fontFamily: string
  fontHeading: string
  backgroundColor: string
  colorTheme?: string // 'amber' | 'purple' | 'blue' | 'green' | 'rose' | 'burgundy' | 'navy' | 'sage' | 'custom'
  customColors?: {
    name: string
    primary: string
    secondary: string
    accent: string
    bgGradientFrom: string
    bgGradientTo: string
  }
}

// Website Settings
export interface WebsiteSettings {
  isPasswordProtected: boolean
  password?: string
  seoTitle?: string
  seoDescription?: string
  ogImage?: string
  favicon?: string
  customCSS?: string
}

// Website Analytics
export interface WebsiteAnalytics {
  views: number
  uniqueVisitors: number
  lastVisit?: Date
}

// Main Wedding Website Interface
export interface WeddingWebsite {
  id: string
  weddingId: string
  userId: string
  
  // URL
  customUrl: string
  subdomain: string
  
  // Status
  isPublished: boolean
  isDraft: boolean
  
  // Template
  template: TemplateType
  
  // Content
  content: WebsiteContent
  
  // Style
  style: WebsiteStyle
  
  // Settings
  settings: WebsiteSettings
  
  // Analytics
  analytics: WebsiteAnalytics
  
  // Timestamps
  createdAt: Date
  updatedAt: Date
  publishedAt?: Date
}

// RSVP Interface
export interface PlusOneInfo {
  name: string
  email?: string
}

export interface RSVP {
  id: string
  websiteId: string
  weddingId: string
  guestId?: string
  
  // Guest info
  name: string
  email: string
  phone?: string
  
  // Response
  status: RSVPStatus
  guestCount: number
  plusOne?: PlusOneInfo
  
  // Meal selection
  mealChoice?: string
  plusOneMealChoice?: string
  dietaryRestrictions?: string
  
  // Additional
  songRequest?: string
  message?: string
  
  // Metadata
  submittedAt: Date
  ipAddress?: string
  userAgent?: string
  
  // Admin
  notes?: string
  confirmed: boolean
}

// Form Data Types
export interface RSVPFormData {
  name: string
  email: string
  phone?: string
  status: RSVPStatus
  guestCount: number
  plusOne?: PlusOneInfo
  mealChoice?: string
  plusOneMealChoice?: string
  dietaryRestrictions?: string
  songRequest?: string
  accommodationId?: string
  roomId?: string
  message?: string
}

export interface WebsiteFormData {
  customUrl: string
  template: TemplateType
  content: Partial<WebsiteContent>
  style?: Partial<WebsiteStyle>
  settings?: Partial<WebsiteSettings>
}

// Template Configuration
export interface TemplateConfig {
  id: TemplateType
  name: string
  description: string
  thumbnail: string
  category: string
  colors: {
    primary: string
    secondary: string
    accent: string
  }
  fonts: {
    heading: string
    body: string
  }
  features: string[]
  suitableFor: string[]
}

// Builder State
export interface BuilderState {
  website: WeddingWebsite | null
  currentSection: keyof WebsiteContent | null
  isPreviewMode: boolean
  isSaving: boolean
  hasUnsavedChanges: boolean
}

