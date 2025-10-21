import { Timestamp } from 'firebase/firestore'

// Affiliate Partner Status
export type AffiliateStatus = 
  | 'pending'      // Čeká na schválení
  | 'active'       // Aktivní partner
  | 'suspended'    // Dočasně pozastavený
  | 'rejected'     // Zamítnutý
  | 'terminated'   // Ukončený

// Commission Status
export type CommissionStatus =
  | 'pending'      // Čeká na potvrzení platby
  | 'confirmed'    // Potvrzená provize
  | 'paid'         // Vyplacená
  | 'cancelled'    // Zrušená (refund)

// Payout Status
export type PayoutStatus =
  | 'pending'      // Čeká na zpracování
  | 'processing'   // Zpracovává se
  | 'completed'    // Dokončená
  | 'failed'       // Selhala
  | 'cancelled'    // Zrušená

// Payout Method
export type PayoutMethod =
  | 'bank_transfer'  // Bankovní převod
  | 'paypal'         // PayPal
  | 'stripe'         // Stripe Connect

// Affiliate Partner
export interface AffiliatePartner {
  id: string
  userId: string  // Reference na Firebase Auth user
  
  // Personal Info
  firstName: string
  lastName: string
  email: string
  phone?: string
  company?: string
  website?: string
  
  // Status
  status: AffiliateStatus
  approvedAt?: Date
  approvedBy?: string  // Admin user ID
  rejectedAt?: Date
  rejectedReason?: string
  suspendedAt?: Date
  suspendedReason?: string
  terminatedAt?: Date
  terminatedReason?: string
  
  // Referral Info
  referralCode: string  // Unikátní kód partnera (např. "SVATBA2024")
  referralLink: string  // Plný odkaz: svatbot.cz?ref=SVATBA2024
  
  // Commission Settings
  commissionRate: number  // Default 10 (%)
  customCommissionRate?: number  // Vlastní sazba pro speciální partnery
  
  // Statistics
  stats: {
    totalClicks: number
    totalRegistrations: number
    totalConversions: number  // Počet platících zákazníků
    totalRevenue: number      // Celkový obrat v CZK
    totalCommission: number   // Celková provize v CZK
    pendingCommission: number // Nevyplacená provize v CZK
    paidCommission: number    // Vyplacená provize v CZK
  }
  
  // Payout Info
  payoutMethod: PayoutMethod
  payoutDetails: {
    // Bank Transfer
    bankAccount?: string
    bankCode?: string
    iban?: string
    swift?: string

    // PayPal
    paypalEmail?: string

    // Stripe
    stripeAccountId?: string
  }
  minPayoutAmount: number  // Minimální částka pro výplatu (default 1000 CZK)

  // Billing Address
  billingAddress?: {
    name: string           // Jméno/název firmy
    street: string         // Ulice a číslo popisné
    city: string           // Město
    postalCode: string     // PSČ
    country: string        // Země (default 'CZ')
    ico?: string           // IČO (pro firmy)
    dic?: string           // DIČ (pro firmy)
  }
  
  // Marketing Materials
  notes?: string
  marketingNotes?: string
  
  // Metadata
  createdAt: Date
  updatedAt: Date
  lastActivityAt?: Date
}

// Commission Record
export interface Commission {
  id: string
  affiliateId: string
  affiliateCode: string
  
  // Customer Info
  userId: string
  userEmail: string
  
  // Payment Info
  subscriptionId: string
  stripePaymentIntentId?: string
  stripeInvoiceId?: string
  
  // Plan Details
  plan: 'premium_monthly' | 'premium_yearly'
  amount: number          // Částka platby v CZK
  currency: string        // 'CZK'
  
  // Commission Details
  commissionRate: number  // Použitá sazba (%)
  commissionAmount: number // Vypočtená provize v CZK
  status: CommissionStatus
  
  // Dates
  createdAt: Date         // Kdy byla provize vytvořena
  confirmedAt?: Date      // Kdy byla potvrzena (po úspěšné platbě)
  paidAt?: Date          // Kdy byla vyplacena
  cancelledAt?: Date     // Kdy byla zrušena
  
  // Payout Reference
  payoutId?: string      // Reference na výplatu
  
  // Metadata
  notes?: string
}

// Payout Request
export interface Payout {
  id: string
  affiliateId: string
  
  // Amount
  amount: number         // Částka k výplatě v CZK
  currency: string       // 'CZK'
  
  // Commissions
  commissionIds: string[] // IDs provizí zahrnutých ve výplatě
  commissionCount: number
  
  // Status
  status: PayoutStatus
  method: PayoutMethod
  
  // Payment Details
  payoutDetails: {
    bankAccount?: string
    iban?: string
    paypalEmail?: string
    stripeTransferId?: string
  }
  
  // Dates
  requestedAt: Date
  processedAt?: Date
  completedAt?: Date
  failedAt?: Date
  failedReason?: string
  
  // Admin
  processedBy?: string   // Admin user ID
  notes?: string
  
  // Metadata
  createdAt: Date
  updatedAt: Date
}

// Affiliate Click Tracking
export interface AffiliateClick {
  id: string
  affiliateId: string
  affiliateCode: string
  
  // Tracking Info
  ipAddress?: string
  userAgent?: string
  referrer?: string
  landingPage: string
  
  // Conversion Tracking
  converted: boolean
  userId?: string        // Pokud se uživatel zaregistroval
  subscriptionId?: string // Pokud se uživatel stal platícím
  
  // Dates
  clickedAt: Date
  convertedAt?: Date
  
  // Metadata
  createdAt: Date
}

// Affiliate Statistics (agregovaná data)
export interface AffiliateStats {
  affiliateId: string
  period: 'day' | 'week' | 'month' | 'year' | 'all'
  periodStart: Date
  periodEnd: Date
  
  // Metrics
  clicks: number
  registrations: number
  conversions: number
  revenue: number
  commission: number
  
  // Conversion Rates
  clickToRegistration: number  // %
  registrationToConversion: number  // %
  clickToConversion: number  // %
  
  // Average Values
  avgOrderValue: number
  avgCommission: number
  
  // Top Performing
  topPlan?: 'premium_monthly' | 'premium_yearly'
  
  createdAt: Date
  updatedAt: Date
}

// Affiliate Application (pro registraci)
export interface AffiliateApplication {
  id: string
  
  // Personal Info
  firstName: string
  lastName: string
  email: string
  phone?: string
  company?: string
  website?: string
  
  // Application Details
  motivation: string  // Proč se chce stát partnerem
  experience: string  // Zkušenosti s affiliate marketingem
  audience: string    // Popis cílové skupiny
  promotionPlan: string // Jak plánuje propagovat
  
  // Social Media
  instagram?: string
  facebook?: string
  youtube?: string
  tiktok?: string
  blog?: string
  
  // Expected Performance
  expectedMonthlyClicks?: number
  expectedMonthlyConversions?: number
  
  // Status
  status: 'pending' | 'approved' | 'rejected'
  reviewedAt?: Date
  reviewedBy?: string
  reviewNotes?: string
  
  // Metadata
  createdAt: Date
  updatedAt: Date
}

// Affiliate Configuration
export interface AffiliateConfig {
  enabled: boolean
  defaultCommissionRate: number  // 10%
  minPayoutAmount: number        // 1000 CZK
  payoutSchedule: 'weekly' | 'biweekly' | 'monthly'
  cookieDuration: number         // Dny (default 30)
  termsUrl: string
  privacyUrl: string
  
  // Auto-approval settings
  autoApprove: boolean
  requireManualReview: boolean
  
  // Notifications
  notifyOnNewApplication: boolean
  notifyOnCommission: boolean
  notifyOnPayout: boolean
  
  updatedAt: Date
  updatedBy: string
}

