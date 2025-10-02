// Wedding Website Types

export type TemplateType = 
  | 'classic-elegance'
  | 'modern-minimalist'
  | 'rustic-romance'
  | 'bohemian-dream'
  | 'garden-party'
  | 'beach-vibes'
  | 'winter-wonderland'
  | 'vintage-charm'

export type RSVPStatus = 'attending' | 'declined' | 'maybe'

// Hero Section
export interface HeroContent {
  bride: string
  groom: string
  weddingDate: Date
  mainImage?: string
  tagline?: string
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

export interface StoryContent {
  enabled: boolean
  title?: string
  subtitle?: string
  description?: string
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

// Info Section
export interface VenueInfo {
  time: string
  venue: string
  address: string
  coordinates?: {
    lat: number
    lng: number
  }
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
  dressCode?: string
  dressCodeDetails?: string
  colorPalette?: string[] // Array of hex color codes for wedding color palette
  parking?: string
  accessibility?: string
  customInfo?: CustomInfo[]
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
  message?: string
  contactName?: string
  contactPhone?: string
  contactEmail?: string
}

// Accommodation Section
export interface AccommodationContent {
  enabled: boolean
  title?: string
  description?: string
  showPrices: boolean
  showAvailability: boolean
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

// Website Content
export interface WebsiteContent {
  hero: HeroContent
  story: StoryContent
  info: InfoContent
  schedule: ScheduleContent
  rsvp: RSVPContent
  accommodation: AccommodationContent
  gift: GiftContent
  gallery: GalleryContent
  contact: ContactContent
  faq: FAQContent
}

// Website Style
export interface WebsiteStyle {
  primaryColor: string
  secondaryColor: string
  accentColor: string
  fontFamily: string
  fontHeading: string
  backgroundColor: string
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

