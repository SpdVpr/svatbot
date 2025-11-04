// Subscription and Monetization Types

export type SubscriptionPlan = 'free_trial' | 'premium_monthly' | 'premium_yearly' | 'test_daily'

export type SubscriptionStatus = 
  | 'trialing'      // Free trial period
  | 'active'        // Active paid subscription
  | 'past_due'      // Payment failed
  | 'canceled'      // Canceled by user
  | 'expired'       // Trial or subscription expired
  | 'incomplete'    // Payment incomplete

export interface Subscription {
  id: string
  userId: string
  weddingId: string
  
  // Plan details
  plan: SubscriptionPlan
  status: SubscriptionStatus
  
  // Trial information
  trialStartDate: Date
  trialEndDate: Date
  isTrialActive: boolean
  
  // Subscription dates
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
  canceledAt?: Date
  
  // Pricing
  amount: number
  currency: string // 'CZK'
  
  // Payment provider (Firebase Extensions - Stripe)
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  stripePaymentMethodId?: string
  
  // Metadata
  createdAt: Date
  updatedAt: Date
}

export interface SubscriptionPlanDetails {
  id: SubscriptionPlan
  name: string
  description: string
  price: number
  currency: string
  interval: 'month' | 'year'
  intervalCount: number
  features: string[]
  limits: SubscriptionLimits
  popular?: boolean
  savings?: string // e.g., "Ušetříte 600 Kč"
}

export interface SubscriptionLimits {
  maxGuests: number | 'unlimited'
  maxTasks: number | 'unlimited'
  maxBudgetItems: number | 'unlimited'
  maxVendors: number | 'unlimited'
  maxPhotos: number | 'unlimited'
  weddingWebsite: boolean
  onlineRSVP: boolean
  photoGallery: boolean
  emailNotifications: boolean
  customDomain: boolean
  prioritySupport: boolean
  aiAssistant: boolean
  advancedAnalytics: boolean
  // AI Feature Limits (daily)
  aiChatQueriesPerDay: number | 'unlimited'
  aiMoodboardsPerDay: number | 'unlimited'
  // Website Template Limits
  websiteTemplates: 'basic' | 'all' // 'basic' = first 2 templates, 'all' = all templates
}

// Subscription plans configuration
export const SUBSCRIPTION_PLANS: SubscriptionPlanDetails[] = [
  {
    id: 'free_trial',
    name: 'Zkušební období',
    description: '30 dní zdarma pro vyzkoušení funkcí',
    price: 0,
    currency: 'CZK',
    interval: 'month',
    intervalCount: 1,
    features: [
      'Neomezený počet hostů',
      'Svatební web (2 základní šablony)',
      'Online RSVP',
      'AI asistent (3 dotazy denně)',
      'AI Moodboard (1 denně)',
      'Pokročilá analytika'
    ],
    limits: {
      maxGuests: 'unlimited',
      maxTasks: 'unlimited',
      maxBudgetItems: 'unlimited',
      maxVendors: 'unlimited',
      maxPhotos: 'unlimited',
      weddingWebsite: true,
      onlineRSVP: true,
      photoGallery: true,
      emailNotifications: true,
      customDomain: false,
      prioritySupport: false,
      aiAssistant: true,
      advancedAnalytics: true,
      aiChatQueriesPerDay: 3,
      aiMoodboardsPerDay: 1,
      websiteTemplates: 'basic'
    }
  },
  {
    id: 'premium_monthly',
    name: 'Premium měsíční',
    description: 'Měsíční předplatné s plným přístupem',
    price: 299,
    currency: 'CZK',
    interval: 'month',
    intervalCount: 1,
    features: [
      'Všechny funkce aplikace',
      'Neomezený počet hostů',
      'Svatební web (všechny šablony)',
      'Online RSVP systém',
      'AI asistent (neomezené dotazy)',
      'AI Moodboard (neomezené)',
      'Pokročilá analytika',
      'Email notifikace',
      'Prioritní podpora'
    ],
    limits: {
      maxGuests: 'unlimited',
      maxTasks: 'unlimited',
      maxBudgetItems: 'unlimited',
      maxVendors: 'unlimited',
      maxPhotos: 'unlimited',
      weddingWebsite: true,
      onlineRSVP: true,
      photoGallery: true,
      emailNotifications: true,
      customDomain: false,
      prioritySupport: true,
      aiAssistant: true,
      advancedAnalytics: true,
      aiChatQueriesPerDay: 'unlimited',
      aiMoodboardsPerDay: 'unlimited',
      websiteTemplates: 'all'
    }
  },
  {
    id: 'premium_yearly',
    name: 'Premium roční',
    description: 'Roční předplatné se slevou',
    price: 2999,
    currency: 'CZK',
    interval: 'year',
    intervalCount: 1,
    popular: true,
    savings: 'Ušetříte 589 Kč',
    features: [
      'Všechny funkce aplikace',
      'Neomezený počet hostů',
      'Svatební web (všechny šablony)',
      'Online RSVP systém',
      'AI asistent (neomezené dotazy)',
      'AI Moodboard (neomezené)',
      'Pokročilá analytika',
      'Email notifikace',
      'Prioritní podpora',
      'Vlastní doména (příplatek)'
    ],
    limits: {
      maxGuests: 'unlimited',
      maxTasks: 'unlimited',
      maxBudgetItems: 'unlimited',
      maxVendors: 'unlimited',
      maxPhotos: 'unlimited',
      weddingWebsite: true,
      onlineRSVP: true,
      photoGallery: true,
      emailNotifications: true,
      customDomain: true,
      prioritySupport: true,
      aiAssistant: true,
      advancedAnalytics: true,
      aiChatQueriesPerDay: 'unlimited',
      aiMoodboardsPerDay: 'unlimited',
      websiteTemplates: 'all'
    }
  },
  {
    id: 'test_daily',
    name: 'Test denní',
    description: '⚠️ Pouze pro testování - opakování každý den',
    price: 10,
    currency: 'CZK',
    interval: 'month',
    intervalCount: 1,
    features: [
      '⚠️ TESTOVACÍ PŘEDPLATNÉ',
      'Opakování každý den',
      'Pro testování recurring plateb',
      'Všechny Premium funkce'
    ],
    limits: {
      maxGuests: 'unlimited',
      maxTasks: 'unlimited',
      maxBudgetItems: 'unlimited',
      maxVendors: 'unlimited',
      maxPhotos: 'unlimited',
      weddingWebsite: true,
      onlineRSVP: true,
      photoGallery: true,
      emailNotifications: true,
      customDomain: false,
      prioritySupport: true,
      aiAssistant: true,
      advancedAnalytics: true,
      aiChatQueriesPerDay: 'unlimited',
      aiMoodboardsPerDay: 'unlimited',
      websiteTemplates: 'all'
    }
  }
]

// Payment history
export interface Payment {
  id: string
  userId: string
  subscriptionId: string
  
  // Payment details
  amount: number
  currency: string
  status: PaymentStatus
  
  // Payment method
  paymentMethod: PaymentMethod
  last4?: string // Last 4 digits of card
  
  // Dates
  createdAt: Date
  paidAt?: Date
  
  // Invoice
  invoiceUrl?: string
  invoiceNumber?: string
  
  // Stripe
  stripePaymentIntentId?: string
  stripeInvoiceId?: string
}

export type PaymentStatus = 
  | 'pending'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'canceled'
  | 'refunded'

export type PaymentMethod = 
  | 'card'
  | 'bank_transfer'
  | 'other'

// Usage statistics
export interface UsageStats {
  userId: string
  weddingId: string

  // Current usage
  guestsCount: number
  tasksCount: number
  budgetItemsCount: number
  vendorsCount: number
  photosCount: number

  // Activity
  lastLoginAt: Date
  totalLogins: number

  // Features usage
  weddingWebsiteViews: number
  rsvpResponses: number
  aiQueriesCount: number

  // AI Daily Usage (resets daily)
  aiChatQueriesToday: number
  aiMoodboardsToday: number
  lastAIResetDate: string // YYYY-MM-DD format for daily reset

  // Metadata
  updatedAt: Date
}

// User account profile
export interface UserProfile {
  id: string
  email: string
  displayName?: string
  firstName?: string
  lastName?: string
  phone?: string
  photoURL?: string
  
  // Account settings
  emailVerified: boolean
  phoneVerified: boolean
  
  // Preferences
  language: string
  timezone: string
  currency: string
  
  // Notifications
  emailNotifications: boolean
  pushNotifications: boolean
  marketingEmails: boolean
  
  // Metadata
  createdAt: Date
  updatedAt: Date
  lastLoginAt?: Date
}

