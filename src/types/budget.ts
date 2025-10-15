// Budget Management Types for SvatBot.cz

export type BudgetCategory =
  | 'venue'           // Místo konání
  | 'catering'        // Catering
  | 'photography'     // Fotografie
  | 'videography'     // Videografie
  | 'flowers'         // Květiny
  | 'music'           // Hudba
  | 'decoration'      // Dekorace
  | 'dress'           // Šaty
  | 'suit'            // Oblek
  | 'rings'           // Prsteny
  | 'invitations'     // Pozvánky
  | 'transportation'  // Doprava
  | 'accommodation'   // Ubytování
  | 'beauty'          // Kosmetika
  | 'gifts'           // Dárky
  | 'children'        // Děti
  | 'honeymoon'       // Svatební cesta
  | 'other'           // Ostatní

export type PaymentStatus = 
  | 'pending'         // Čeká na platbu
  | 'partial'         // Částečně zaplaceno
  | 'paid'            // Zaplaceno
  | 'overdue'         // Po splatnosti
  | 'cancelled'       // Zrušeno

export type PaymentMethod =
  | 'cash'            // Hotovost
  | 'card'            // Karta
  | 'transfer'        // Převod
  | 'invoice'         // Faktura
  | 'other'           // Jiné

export type PaymentPeriod =
  | 'before-wedding'  // Před svatbou
  | 'at-wedding'      // Na svatbě
  | 'after-wedding'   // Po svatbě

export type VendorStatus =
  | 'researching'     // Hledání
  | 'contacted'       // Kontaktováno
  | 'quoted'          // Nabídka
  | 'booked'          // Rezervováno
  | 'confirmed'       // Potvrzeno
  | 'cancelled'       // Zrušeno

export interface BudgetItem {
  id: string
  weddingId: string
  
  // Basic info
  name: string
  description?: string
  category: BudgetCategory
  
  // Financial
  budgetedAmount: number
  actualAmount: number
  paidAmount: number
  currency: string // 'CZK', 'EUR', 'USD'
  
  // Vendor
  vendorId?: string
  vendorName?: string
  
  // Payment
  paymentStatus: PaymentStatus
  paymentMethod?: PaymentMethod
  paymentPeriod?: PaymentPeriod
  dueDate?: Date
  paidDate?: Date
  payments: BudgetItemPayment[]
  
  // Priority and notes
  priority?: 'low' | 'medium' | 'high' | 'critical'
  notes?: string
  tags: string[]

  // Sub-items for complex budget items
  subItems?: BudgetSubItem[]
  
  // Tracking
  isEstimate: boolean
  isRecurring: boolean
  recurringFrequency?: 'monthly' | 'quarterly' | 'yearly'
  
  // Metadata
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

export interface Vendor {
  id: string
  weddingId: string
  
  // Basic info
  name: string
  category: BudgetCategory
  description?: string
  
  // Contact
  email?: string
  phone?: string
  website?: string
  address?: {
    street: string
    city: string
    postalCode: string
    country: string
  }
  
  // Business info
  businessNumber?: string
  vatNumber?: string
  
  // Status and rating
  status: VendorStatus
  rating: number // 1-5 stars
  
  // Financial
  quotedAmount?: number
  finalAmount?: number
  currency: string
  
  // Contract
  contractSigned: boolean
  contractDate?: Date
  contractNotes?: string
  
  // Performance
  responseTime?: number // hours
  reliability: number // 1-5 scale
  quality: number // 1-5 scale
  
  // Notes and tags
  notes?: string
  tags: string[]
  
  // Metadata
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

export interface Payment {
  id: string
  budgetItemId: string
  vendorId?: string
  weddingId: string
  
  // Payment details
  amount: number
  currency: string
  method: PaymentMethod
  status: PaymentStatus
  
  // Dates
  dueDate: Date
  paidDate?: Date
  
  // Reference
  invoiceNumber?: string
  transactionId?: string
  receiptUrl?: string
  
  // Notes
  description?: string
  notes?: string
  
  // Metadata
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

export interface BudgetItemPayment {
  id: string
  amount: number
  currency: string
  method?: PaymentMethod
  date: Date
  description?: string
  reference?: string
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  createdAt: Date
}

export interface BudgetSubItem {
  id: string
  name: string
  description?: string
  amount: number
  currency: string
  notes?: string
}

export interface BudgetStats {
  // Overall budget
  totalBudget: number
  totalActual: number
  totalPaid: number
  totalRemaining: number
  
  // Percentages
  budgetUsed: number // percentage
  paidPercentage: number
  remainingPercentage: number
  
  // Status counts
  itemsPending: number
  itemsPaid: number
  itemsOverdue: number
  
  // By category
  byCategory: Record<BudgetCategory, {
    budgeted: number
    actual: number
    paid: number
    remaining: number
    itemCount: number
  }>
  
  // Vendor stats
  vendorsTotal: number
  vendorsBooked: number
  vendorsConfirmed: number
  
  // Payment timeline
  upcomingPayments: Payment[]
  overduePayments: Payment[]
  
  // Alerts
  overBudgetCategories: string[]
  criticalPayments: Payment[]
}

export interface BudgetFilters {
  search?: string
  category?: BudgetCategory[]
  paymentStatus?: PaymentStatus[]
  priority?: ('low' | 'medium' | 'high' | 'critical')[]
  vendor?: string[]
  dateRange?: {
    start: Date
    end: Date
  }
  amountRange?: {
    min: number
    max: number
  }
  tags?: string[]
}

export interface BudgetFormData {
  name: string
  description?: string
  category: BudgetCategory
  budgetedAmount: number
  actualAmount: number
  paidAmount: number
  currency: string
  vendorName?: string
  paymentStatus: PaymentStatus
  paymentMethod?: PaymentMethod
  paymentPeriod?: PaymentPeriod
  dueDate?: Date
  paidDate?: Date
  priority?: 'low' | 'medium' | 'high' | 'critical'
  notes?: string
  tags: string[]
  isEstimate: boolean
  payments?: BudgetItemPayment[]
  subItems?: BudgetSubItem[]
}

export interface VendorFormData {
  name: string
  category: BudgetCategory
  description?: string
  email?: string
  phone?: string
  website?: string
  address?: {
    street: string
    city: string
    postalCode: string
    country: string
  }
  quotedAmount?: number
  currency: string
  notes?: string
  tags: string[]
}

export interface BudgetViewOptions {
  groupBy: 'category' | 'vendor' | 'status' | 'priority' | 'none'
  sortBy: 'name' | 'amount' | 'due-date' | 'created' | 'priority'
  sortOrder: 'asc' | 'desc'
  showPaid: boolean
  showEstimates: boolean
  currency: string
}

export interface BudgetTemplate {
  id: string
  name: string
  description: string
  categories: {
    category: BudgetCategory
    percentage: number
    items: {
      name: string
      percentage: number
      priority: 'low' | 'medium' | 'high' | 'critical'
    }[]
  }[]
  totalBudgetRange: {
    min: number
    max: number
  }
  currency: string
  region: string // 'CZ', 'SK', 'EU'
}

export interface BudgetAlert {
  id: string
  type: 'over_budget' | 'payment_due' | 'payment_overdue' | 'vendor_needed'
  severity: 'info' | 'warning' | 'error' | 'critical'
  title: string
  message: string
  category?: BudgetCategory
  budgetItemId?: string
  vendorId?: string
  amount?: number
  dueDate?: Date
  actionRequired: boolean
  dismissed: boolean
  createdAt: Date
}

export interface BudgetReport {
  id: string
  weddingId: string
  type: 'overview' | 'category' | 'vendor' | 'timeline' | 'variance'
  title: string
  generatedAt: Date
  data: any // Flexible data structure for different report types
  filters?: BudgetFilters
  currency: string
}

// Budget category configurations
export const BUDGET_CATEGORIES = {
  venue: {
    name: 'Místo konání',
    icon: '🏛️',
    color: 'bg-blue-100 text-blue-700',
    defaultPercentage: 40,
    priority: 'critical'
  },
  catering: {
    name: 'Catering',
    icon: '🍽️',
    color: 'bg-green-100 text-green-700',
    defaultPercentage: 25,
    priority: 'critical'
  },
  photography: {
    name: 'Záznam',
    icon: '📸',
    color: 'bg-purple-100 text-purple-700',
    defaultPercentage: 8,
    priority: 'high'
  },
  videography: {
    name: 'Videografie',
    icon: '🎥',
    color: 'bg-indigo-100 text-indigo-700',
    defaultPercentage: 5,
    priority: 'medium'
  },
  flowers: {
    name: 'Květiny',
    icon: '🌸',
    color: 'bg-pink-100 text-pink-700',
    defaultPercentage: 4,
    priority: 'medium'
  },
  music: {
    name: 'Hudba',
    icon: '🎵',
    color: 'bg-yellow-100 text-yellow-700',
    defaultPercentage: 3,
    priority: 'medium'
  },
  decoration: {
    name: 'Dekorace',
    icon: '🎀',
    color: 'bg-orange-100 text-orange-700',
    defaultPercentage: 3,
    priority: 'low'
  },
  dress: {
    name: 'Nevěsta',
    icon: '👰',
    color: 'bg-rose-100 text-rose-700',
    defaultPercentage: 4,
    priority: 'high'
  },
  suit: {
    name: 'Ženich',
    icon: '🤵',
    color: 'bg-gray-100 text-gray-700',
    defaultPercentage: 2,
    priority: 'medium'
  },
  rings: {
    name: 'Prsteny',
    icon: '💍',
    color: 'bg-amber-100 text-amber-700',
    defaultPercentage: 2,
    priority: 'high'
  },
  invitations: {
    name: 'Tiskoviny',
    icon: '💌',
    color: 'bg-teal-100 text-teal-700',
    defaultPercentage: 1,
    priority: 'medium'
  },
  transportation: {
    name: 'Doprava',
    icon: '🚗',
    color: 'bg-cyan-100 text-cyan-700',
    defaultPercentage: 1,
    priority: 'low'
  },
  accommodation: {
    name: 'Ubytování',
    icon: '🏨',
    color: 'bg-emerald-100 text-emerald-700',
    defaultPercentage: 1,
    priority: 'low'
  },
  beauty: {
    name: 'Vzhled',
    icon: '💄',
    color: 'bg-fuchsia-100 text-fuchsia-700',
    defaultPercentage: 1,
    priority: 'medium'
  },
  gifts: {
    name: 'Dárky',
    icon: '🎁',
    color: 'bg-violet-100 text-violet-700',
    defaultPercentage: 1,
    priority: 'low'
  },
  children: {
    name: 'Děti',
    icon: '👶',
    color: 'bg-lime-100 text-lime-700',
    defaultPercentage: 1,
    priority: 'low'
  },
  honeymoon: {
    name: 'Svatební cesta',
    icon: '✈️',
    color: 'bg-sky-100 text-sky-700',
    defaultPercentage: 0,
    priority: 'low'
  },
  other: {
    name: 'Ostatní',
    icon: '📦',
    color: 'bg-slate-100 text-slate-700',
    defaultPercentage: 0,
    priority: 'low'
  }
} as const

export interface BudgetListProps {
  items: BudgetItem[]
  vendors: Vendor[]
  filters?: BudgetFilters
  viewOptions?: BudgetViewOptions
  onItemUpdate: (item: BudgetItem) => void
  onItemDelete: (itemId: string) => void
  onItemCreate: (item: Omit<BudgetItem, 'id' | 'createdAt' | 'updatedAt'>) => void
  onVendorUpdate?: (vendor: Vendor) => void
  onPaymentUpdate?: (payment: Payment) => void
  loading?: boolean
  error?: string
}
