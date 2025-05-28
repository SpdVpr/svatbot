export interface AdminUser {
  id: string
  email: string
  name: string
  role: 'super_admin' | 'admin' | 'moderator'
  permissions: AdminPermission[]
  createdAt: Date
  lastLogin?: Date
  isActive: boolean
}

export interface AdminPermission {
  resource: 'vendors' | 'users' | 'orders' | 'analytics' | 'settings'
  actions: ('create' | 'read' | 'update' | 'delete')[]
}

export interface AdminSession {
  user: AdminUser
  token: string
  expiresAt: Date
}

export interface VendorEditForm {
  // Basic Info
  name: string
  category: string
  description: string
  shortDescription: string
  website?: string
  email: string
  phone: string
  
  // Address
  address: {
    street: string
    city: string
    postalCode: string
    region: string
  }
  
  // Business Info
  businessName: string
  businessId?: string
  
  // Services
  services: {
    id: string
    name: string
    description: string
    price: number
    priceType: 'fixed' | 'per-person' | 'per-hour' | 'package'
    duration?: string
    includes: string[]
    popular?: boolean
  }[]
  
  // Pricing
  priceRange: {
    min: number
    max: number
    currency: string
    unit: string
  }
  
  // Images
  images: string[]
  portfolioImages: string[]
  
  // Features & Specialties
  features: string[]
  specialties: string[]
  
  // Availability
  workingRadius: number
  availability: {
    workingDays: string[]
    workingHours: { start: string; end: string }
  }
  
  // Status
  verified: boolean
  featured: boolean
  premium: boolean
  isActive: boolean
  
  // SEO
  tags: string[]
  keywords: string[]
}

export interface ImageUpload {
  file: File
  preview: string
  uploading: boolean
  uploaded: boolean
  url?: string
  error?: string
}

export interface AdminStats {
  totalVendors: number
  activeVendors: number
  pendingApprovals: number
  totalUsers: number
  monthlyRevenue: number
  topCategories: { category: string; count: number }[]
}
