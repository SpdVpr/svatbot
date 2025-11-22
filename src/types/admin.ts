import { Timestamp } from 'firebase/firestore'

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
  resource: 'vendors' | 'users' | 'orders' | 'analytics' | 'settings' | 'messages' | 'feedback' | 'finance' | 'affiliate'
  actions: ('create' | 'read' | 'update' | 'delete')[]
}

export interface AdminSession {
  user: AdminUser
  token: string
  expiresAt: Date
}

// User Analytics
export interface UserAnalytics {
  id: string
  userId: string
  email: string
  displayName: string
  registeredAt: Timestamp
  lastLoginAt: Timestamp
  loginCount: number
  totalSessionTime: number // v minutách
  isOnline: boolean
  lastActivityAt: Timestamp
  sessions: UserSession[]
  pageViews: Record<string, number>
  featuresUsed: string[]
  aiQueriesCount?: number // Total AI queries from usageStats
  isTestAccount?: boolean // Flag for test accounts to exclude from production stats
}

export interface UserSession {
  sessionId: string
  startTime: Timestamp
  endTime?: Timestamp
  duration: number // v minutách
  pages: string[]
}

// Messaging System
export interface AdminConversation {
  id: string
  conversationId: string
  userId: string
  userName: string
  userEmail: string
  messages: AdminMessage[]
  status: 'open' | 'closed' | 'pending'
  lastMessageAt: Timestamp
  unreadCount: number
  createdAt: Timestamp
}

export interface AdminMessage {
  id: string
  senderId: string
  senderType: 'user' | 'admin'
  senderName: string
  content: string
  timestamp: Timestamp
  read: boolean
  attachments?: string[]
}

// Feedback System
export interface FeedbackMessage {
  from: 'user' | 'admin'
  message: string
  timestamp: Timestamp
  userName?: string
}

export interface UserFeedback {
  id: string
  userId: string
  userEmail: string
  userName?: string
  type: 'bug' | 'feature' | 'improvement' | 'other'
  subject: string
  message: string
  rating?: number
  page?: string
  screenshot?: string
  status: 'new' | 'in-progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high'
  createdAt: Timestamp
  updatedAt?: Timestamp
  resolvedAt?: Timestamp
  adminNotes?: string
  assignedTo?: string
  conversation?: FeedbackMessage[]
  unreadAdminReplies?: number  // Number of unread admin replies (for user)
  lastReadByUser?: Timestamp   // Last time user read the conversation
  unreadUserReplies?: number   // Number of unread user replies (for admin)
  lastReadByAdmin?: Timestamp  // Last time admin read the conversation
}

// Subscription & Finance
export interface UserSubscription {
  id: string
  userId: string
  userEmail: string
  plan: 'free' | 'basic' | 'premium' | 'enterprise'
  status: 'active' | 'cancelled' | 'expired' | 'trial'
  startDate: Timestamp
  endDate: Timestamp
  autoRenew: boolean
  paymentMethod?: string
  lastPaymentDate?: Timestamp
  nextPaymentDate?: Timestamp
  amount: number
  currency: string
  trialEndsAt?: Timestamp
}

export interface Payment {
  id: string
  userId: string
  userEmail: string
  subscriptionId: string
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  paymentMethod: string
  transactionId: string
  description?: string
  createdAt: Timestamp
  completedAt?: Timestamp
  failureReason?: string
}

// Affiliate Program
export interface AffiliatePartner {
  id: string
  affiliateId: string
  userId: string
  userEmail: string
  userName: string
  code: string
  referrals: number
  conversions: number
  totalEarnings: number
  pendingEarnings: number
  paidEarnings: number
  status: 'active' | 'inactive' | 'suspended'
  paymentInfo?: {
    method: string
    details: string
  }
  createdAt: Timestamp
  lastPayoutAt?: Timestamp
}

export interface AffiliateReferral {
  id: string
  affiliateId: string
  referredUserId: string
  referredUserEmail: string
  converted: boolean
  conversionDate?: Timestamp
  commission: number
  status: 'pending' | 'approved' | 'paid'
  createdAt: Timestamp
}

// Admin Dashboard Stats
export interface AdminStats {
  // Users
  totalUsers: number
  activeUsers: number
  onlineUsers: number
  newUsersToday: number
  newUsersThisWeek: number
  newUsersThisMonth: number

  // Vendors
  totalVendors: number
  activeVendors: number
  pendingApprovals: number

  // Finance
  monthlyRevenue: number
  totalRevenue: number
  activeSubscriptions: number
  trialUsers: number
  churnRate: number

  // Engagement
  avgSessionTime: number
  totalSessions: number
  avgSessionsPerUser: number

  // Wedding Website Analytics
  totalWebsiteViews: number
  totalUniqueVisitors: number
  publishedWebsites: number

  // Support
  openConversations: number
  pendingFeedback: number
  avgResponseTime: number

  // Top Categories
  topCategories: { category: string; count: number }[]

  // Charts Data
  userGrowth: { date: string; count: number }[]
  revenueGrowth: { date: string; amount: number }[]
  engagementTrend: { date: string; sessions: number; avgTime: number }[]
}

// Vendor Edit Form (existing)
export interface VendorEditForm {
  // Basic Info
  name: string
  category: string
  description: string
  shortDescription: string
  website?: string
  email: string
  phone: string

  // Social Media
  socialMedia?: {
    instagram?: string
    facebook?: string
    youtube?: string
    tiktok?: string
    linkedin?: string
  }

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
  logo?: string
  mainImage: string
  mainVideoUrl?: string
  images: string[]
  portfolioImages: string[]
  videoUrl?: string

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

  // Google Integration
  google?: {
    placeId?: string
    mapsUrl?: string
    rating?: number
    reviewCount?: number
    reviews?: any[]
    lastUpdated?: any
  }
}

export interface ImageUpload {
  file: File
  preview: string
  uploading: boolean
  uploaded: boolean
  url?: string
  error?: string
}
