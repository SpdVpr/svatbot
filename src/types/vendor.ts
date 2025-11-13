// Vendor Management Types for SvatBot.cz

export type VendorCategory =
  | 'photographer'    // Fotograf
  | 'videographer'    // Kameraman
  | 'catering'        // Catering
  | 'venue'           // Místo konání
  | 'music'           // Hudba/DJ
  | 'flowers'         // Květiny
  | 'decoration'      // Dekorace
  | 'transport'       // Doprava
  | 'beauty'          // Kosmetika/kadeřnictví
  | 'dress'           // Svatební šaty
  | 'suit'            // Oblek
  | 'jewelry'         // Šperky
  | 'cake'            // Dort
  | 'entertainment'   // Zábava
  | 'accommodation'   // Ubytování
  | 'coordinator'     // Svatební koordinátor
  | 'stationery'      // Tiskoviny
  | 'other'           // Ostatní

// Import shared document types from budget
import { DocumentType, Document } from './budget'

export type VendorDocumentType = DocumentType
export type VendorDocument = Document

// Marketplace vendor - předpřipravený dodavatel
export interface MarketplaceVendor {
  id: string
  name: string
  category: VendorCategory
  description: string
  shortDescription: string

  // Contact and location
  website?: string
  email?: string
  phone?: string
  address: {
    street: string
    city: string
    postalCode: string
    region: string
    coordinates?: {
      lat: number
      lng: number
    }
  }

  // Business details
  businessName?: string
  businessId?: string // IČO
  vatNumber?: string // DIČ

  // Services and pricing
  services: MarketplaceService[]
  priceRange: {
    min: number
    max: number
    currency: string
    unit: string // 'per-hour', 'per-day', 'per-event', 'per-person'
  }

  // Portfolio and media
  images: string[]
  portfolioImages: string[]
  videoUrl?: string

  // Ratings and reviews
  rating: {
    overall: number
    count: number
    breakdown: {
      quality: number
      communication: number
      value: number
      professionalism: number
    }
  }

  // Features and specialties
  features: string[]
  specialties: string[]
  workingRadius: number // km from base location

  // Availability
  availability: {
    workingDays: string[] // ['monday', 'tuesday', ...]
    workingHours: {
      start: string // HH:mm
      end: string   // HH:mm
    }
    seasonalAvailability?: {
      peak: string[] // months
      low: string[]  // months
    }
  }

  // Social proof
  testimonials: MarketplaceTestimonial[]
  awards?: string[]
  certifications?: string[]
  yearsInBusiness: number

  // Marketplace specific
  verified: boolean
  featured: boolean
  premium: boolean
  responseTime: string // '< 1 hour', '< 24 hours', etc.

  // SEO and discovery
  tags: string[]
  keywords: string[]

  // Metadata
  createdAt: Date
  updatedAt: Date
  lastActive: Date
}

export interface MarketplaceService {
  id: string
  name: string
  description: string
  price?: number
  priceType: 'fixed' | 'hourly' | 'per-person' | 'package' | 'negotiable'
  duration?: string
  includes: string[]
  excludes?: string[]
  popular?: boolean
}

export interface MarketplaceTestimonial {
  id: string
  author: string
  text: string
  rating: number
  date: Date
  weddingDate?: Date
  verified: boolean
  images?: string[]
}

export type VendorStatus =
  | 'potential'       // Potenciální
  | 'contacted'       // Kontaktován
  | 'meeting-scheduled' // Naplánována schůzka
  | 'quote-received'  // Obdržena nabídka
  | 'negotiating'     // Vyjednávání
  | 'booked'          // Rezervován
  | 'confirmed'       // Potvrzeno
  | 'contracted'      // Smlouva podepsána
  | 'cancelled'       // Zrušeno
  | 'completed'       // Dokončeno

export type ContractStatus =
  | 'draft'           // Návrh
  | 'sent'            // Odesláno
  | 'reviewed'        // Zkontrolováno
  | 'signed'          // Podepsáno
  | 'active'          // Aktivní
  | 'completed'       // Dokončeno
  | 'cancelled'       // Zrušeno

export type PaymentStatus =
  | 'pending'         // Čeká na platbu
  | 'partial'         // Částečně zaplaceno
  | 'paid'            // Zaplaceno
  | 'overdue'         // Po splatnosti
  | 'refunded'        // Vráceno

export interface VendorContact {
  name: string
  role?: string
  email?: string
  phone?: string
  isPrimary: boolean
}

export interface VendorAddress {
  street: string
  city: string
  postalCode: string
  region: string
  country: string
}

export interface VendorRating {
  overall: number // 1-5
  communication: number
  quality: number
  value: number
  reliability: number
  reviewText?: string
  reviewDate: Date
  reviewerName?: string
}

export interface VendorService {
  id: string
  name: string
  description: string
  price?: number
  discountedPrice?: number
  priceType: 'fixed' | 'hourly' | 'per-person' | 'package' | 'negotiable'
  duration?: number // minutes
  included: string[]
  excluded?: string[]
}

export interface Contract {
  id: string
  vendorId: string
  weddingId: string

  // Contract details
  title: string
  description?: string
  status: ContractStatus

  // Services and pricing
  services: VendorService[]
  totalAmount: number
  currency: string

  // Payment terms
  paymentSchedule: {
    id: string
    description: string
    amount: number
    dueDate: Date
    status: PaymentStatus
    paidDate?: Date
    paidAmount?: number
  }[]

  // Contract dates
  signedDate?: Date
  startDate: Date
  endDate: Date

  // Terms and conditions
  terms?: string
  cancellationPolicy?: string

  // Documents
  contractDocument?: string // URL to contract file
  attachments: string[] // URLs to additional files

  // Notes
  notes?: string

  // Metadata
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

export interface Vendor {
  id: string
  weddingId: string

  // Basic information
  name: string
  category: VendorCategory
  description?: string
  website?: string

  // Contact information
  contacts: VendorContact[]
  address?: VendorAddress

  // Business details
  businessName?: string
  businessId?: string // IČO
  vatNumber?: string // DIČ

  // Services and pricing
  services: VendorService[]
  priceRange?: {
    min: number
    max: number
    currency: string
  }

  // Availability
  availability?: {
    availableDates: Date[]
    unavailableDates: Date[]
    workingHours?: {
      start: string // HH:mm
      end: string   // HH:mm
    }
  }

  // Status and progress
  status: VendorStatus
  priority?: 'low' | 'medium' | 'high' | 'critical'

  // Ratings and reviews
  rating?: VendorRating

  // Contract information
  contractId?: string

  // Communication
  lastContactDate?: Date
  nextFollowUpDate?: Date

  // Notes and tags
  notes?: string
  tags: string[]

  // Social proof
  portfolio: string[] // URLs to portfolio images
  testimonials?: {
    text: string
    author: string
    rating: number
    date: Date
  }[]

  // Documents (smlouvy, faktury, atd.)
  documents: VendorDocument[]

  // Metadata
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

export interface VendorMessage {
  id: string
  vendorId: string
  weddingId: string

  // Message details
  subject: string
  content: string
  type: 'email' | 'phone' | 'meeting' | 'note'

  // Participants
  from: {
    name: string
    email?: string
    role: 'client' | 'vendor'
  }
  to: {
    name: string
    email?: string
    role: 'client' | 'vendor'
  }[]

  // Status
  status: 'draft' | 'sent' | 'delivered' | 'read' | 'replied'

  // Attachments
  attachments: string[]

  // Meeting details (if type is meeting)
  meetingDetails?: {
    date: Date
    duration: number
    location: string
    agenda?: string
    attendees: string[]
    notes?: string
  }

  // Metadata
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

export interface VendorStats {
  totalVendors: number
  byCategory: Record<VendorCategory, number>
  byStatus: Record<VendorStatus, number>

  // Contract stats
  totalContracts: number
  signedContracts: number
  totalContractValue: number
  paidAmount: number
  pendingAmount: number

  // Communication stats
  totalMessages: number
  unreadMessages: number
  upcomingMeetings: number
  overdueFollowUps: number

  // Performance
  averageRating: number
  topRatedVendors: string[] // vendor IDs

  // Progress
  completionRate: number // percentage of booked vendors
  onBudget: boolean
  onSchedule: boolean
}

export interface VendorFilters {
  search?: string
  category?: VendorCategory[]
  status?: VendorStatus[]
  priority?: ('low' | 'medium' | 'high' | 'critical')[]
  priceRange?: {
    min: number
    max: number
  }
  rating?: {
    min: number
    max: number
  }
  availability?: {
    startDate: Date
    endDate: Date
  }
  tags?: string[]
  region?: string[]
  hasContract?: boolean
  showCompleted?: boolean
}

export interface VendorFormData {
  name: string
  category: VendorCategory
  description?: string
  website?: string

  // Primary contact
  contactName: string
  contactEmail?: string
  contactPhone?: string

  // Address
  address?: {
    street: string
    city: string
    postalCode: string
    region: string
  }

  // Business
  businessName?: string

  // Services
  services: {
    id?: string
    name: string
    description: string
    price?: number
    discountedPrice?: number
    priceType: 'fixed' | 'hourly' | 'per-person' | 'package' | 'negotiable'
    included?: string[]
  }[]

  // Status
  status: VendorStatus
  priority?: 'low' | 'medium' | 'high' | 'critical'

  // Notes
  notes?: string
  tags: string[]

  // Documents
  documents?: VendorDocument[]
}

// Vendor category configurations
export const VENDOR_CATEGORIES = {
  photographer: {
    name: 'Fotograf',
    icon: '📸',
    color: 'bg-blue-100 text-blue-700',
    description: 'Svatební fotografie'
  },
  videographer: {
    name: 'Kameraman',
    icon: '🎥',
    color: 'bg-purple-100 text-purple-700',
    description: 'Svatební video'
  },
  catering: {
    name: 'Catering',
    icon: '🍽️',
    color: 'bg-green-100 text-green-700',
    description: 'Občerstvení a catering'
  },
  venue: {
    name: 'Místo konání',
    icon: '🏛️',
    color: 'bg-indigo-100 text-indigo-700',
    description: 'Svatební místa'
  },
  music: {
    name: 'Hudba/DJ',
    icon: '🎵',
    color: 'bg-pink-100 text-pink-700',
    description: 'Hudba a zábava'
  },
  flowers: {
    name: 'Květiny',
    icon: '🌸',
    color: 'bg-rose-100 text-rose-700',
    description: 'Květinová výzdoba'
  },
  decoration: {
    name: 'Dekorace',
    icon: '🎨',
    color: 'bg-orange-100 text-orange-700',
    description: 'Svatební dekorace'
  },
  transport: {
    name: 'Doprava',
    icon: '🚗',
    color: 'bg-gray-100 text-gray-700',
    description: 'Svatební doprava'
  },
  beauty: {
    name: 'Kosmetika',
    icon: '💄',
    color: 'bg-red-100 text-red-700',
    description: 'Kosmetika a kadeřnictví'
  },
  dress: {
    name: 'Svatební šaty',
    icon: '👗',
    color: 'bg-pink-100 text-pink-700',
    description: 'Svatební šaty'
  },
  suit: {
    name: 'Oblek',
    icon: '🤵',
    color: 'bg-slate-100 text-slate-700',
    description: 'Pánské obleky'
  },
  jewelry: {
    name: 'Šperky',
    icon: '💍',
    color: 'bg-yellow-100 text-yellow-700',
    description: 'Svatební šperky'
  },
  cake: {
    name: 'Dort',
    icon: '🎂',
    color: 'bg-amber-100 text-amber-700',
    description: 'Svatební dort'
  },
  entertainment: {
    name: 'Zábava',
    icon: '🎪',
    color: 'bg-violet-100 text-violet-700',
    description: 'Zábavní program'
  },
  accommodation: {
    name: 'Ubytování',
    icon: '🏨',
    color: 'bg-teal-100 text-teal-700',
    description: 'Ubytování hostů'
  },
  coordinator: {
    name: 'Svatební koordinátor',
    icon: '👰',
    color: 'bg-purple-100 text-purple-700',
    description: 'Svatební koordinace'
  },
  stationery: {
    name: 'Tiskoviny',
    icon: '📄',
    color: 'bg-blue-100 text-blue-700',
    description: 'Svatební tiskoviny'
  },
  other: {
    name: 'Ostatní',
    icon: '📋',
    color: 'bg-gray-100 text-gray-700',
    description: 'Ostatní služby'
  }
} as const

// Vendor status configurations
export const VENDOR_STATUSES = {
  potential: {
    name: 'Potenciální',
    color: 'bg-gray-100 text-gray-700',
    description: 'Zvažovaný dodavatel'
  },
  contacted: {
    name: 'Kontaktován',
    color: 'bg-blue-100 text-blue-700',
    description: 'Byl kontaktován'
  },
  'meeting-scheduled': {
    name: 'Schůzka naplánována',
    color: 'bg-yellow-100 text-yellow-700',
    description: 'Naplánována schůzka'
  },
  'quote-received': {
    name: 'Nabídka obdržena',
    color: 'bg-purple-100 text-purple-700',
    description: 'Obdržena cenová nabídka'
  },
  negotiating: {
    name: 'Vyjednávání',
    color: 'bg-orange-100 text-orange-700',
    description: 'Probíhá vyjednávání'
  },
  booked: {
    name: 'Rezervován',
    color: 'bg-orange-100 text-orange-700',
    description: 'Rezervován pro svatbu'
  },
  confirmed: {
    name: 'Potvrzeno',
    color: 'bg-green-100 text-green-700',
    description: 'Spolupráce potvrzena'
  },
  contracted: {
    name: 'Smlouva podepsána',
    color: 'bg-green-100 text-green-700',
    description: 'Smlouva je podepsána'
  },
  cancelled: {
    name: 'Zrušeno',
    color: 'bg-red-100 text-red-700',
    description: 'Spolupráce zrušena'
  },
  completed: {
    name: 'Dokončeno',
    color: 'bg-green-100 text-green-700',
    description: 'Služba dokončena'
  }
} as const
