import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, differenceInDays, parseISO } from 'date-fns'
import { cs } from 'date-fns/locale'

// Utility for merging Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Date utilities
export const dateUtils = {
  format: (date: Date | string, formatStr: string = 'dd.MM.yyyy') => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return format(dateObj, formatStr, { locale: cs })
  },

  formatRelative: (date: Date | string) => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return formatDistanceToNow(dateObj, { addSuffix: true, locale: cs })
  },

  daysUntilWedding: (weddingDate: Date | string) => {
    const dateObj = typeof weddingDate === 'string' ? parseISO(weddingDate) : weddingDate
    const today = new Date()

    // Set time to start of day for accurate day calculation
    const weddingDateStart = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate())
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())

    const days = differenceInDays(weddingDateStart, todayStart)

    // Debug logging
    console.log('🗓️ Date calculation debug:', {
      weddingDate: weddingDateStart.toISOString().split('T')[0],
      today: todayStart.toISOString().split('T')[0],
      daysUntil: days,
      actualToday: new Date().toLocaleDateString('cs-CZ'),
      actualWedding: dateObj.toLocaleDateString('cs-CZ')
    })

    return days
  },

  isDateInPast: (date: Date | string) => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return dateObj < new Date()
  },

  getWeddingPhase: (weddingDate: Date | string) => {
    const daysUntil = dateUtils.daysUntilWedding(weddingDate)

    if (daysUntil < 0) return 'completed'
    if (daysUntil <= 7) return 'final'
    if (daysUntil <= 30) return 'organization'
    if (daysUntil <= 60) return 'design'
    if (daysUntil <= 120) return 'budget'
    if (daysUntil <= 180) return 'guests'
    if (daysUntil <= 240) return 'venue'
    return 'foundation'
  }
}

// Currency utilities
export const currencyUtils = {
  format: (amount: number, currency: string = 'CZK') => {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  },

  formatShort: (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M Kč`
    }
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}k Kč`
    }
    return `${amount} Kč`
  }
}

// String utilities
export const stringUtils = {
  capitalize: (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
  },

  initials: (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  },

  truncate: (str: string, length: number = 50) => {
    if (str.length <= length) return str
    return str.slice(0, length) + '...'
  },

  slugify: (str: string) => {
    return str
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }
}

// Validation utilities
export const validationUtils = {
  isValidEmail: (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },

  isValidPhone: (phone: string) => {
    const phoneRegex = /^(\+420)?[0-9]{9}$/
    return phoneRegex.test(phone.replace(/\s/g, ''))
  },

  isValidPostalCode: (postalCode: string) => {
    const postalRegex = /^[0-9]{3}\s?[0-9]{2}$/
    return postalRegex.test(postalCode)
  }
}

// Progress utilities
export const progressUtils = {
  calculateOverallProgress: (phases: Record<string, number>) => {
    const values = Object.values(phases)
    return Math.round(values.reduce((sum, val) => sum + val, 0) / values.length)
  },

  getProgressColor: (progress: number) => {
    if (progress >= 80) return 'text-green-600'
    if (progress >= 60) return 'text-yellow-600'
    if (progress >= 40) return 'text-orange-600'
    return 'text-red-600'
  },

  getProgressBgColor: (progress: number) => {
    if (progress >= 80) return 'bg-green-100'
    if (progress >= 60) return 'bg-yellow-100'
    if (progress >= 40) return 'bg-orange-100'
    return 'bg-red-100'
  }
}

// Local storage utilities
export const storageUtils = {
  set: (key: string, value: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error('Error saving to localStorage:', error)
    }
  },

  get: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.error('Error reading from localStorage:', error)
      return defaultValue
    }
  },

  remove: (key: string) => {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error('Error removing from localStorage:', error)
    }
  }
}

// Array utilities
export const arrayUtils = {
  groupBy: <T>(array: T[], key: keyof T) => {
    return array.reduce((groups, item) => {
      const group = item[key] as string
      groups[group] = groups[group] || []
      groups[group].push(item)
      return groups
    }, {} as Record<string, T[]>)
  },

  sortBy: <T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc') => {
    return [...array].sort((a, b) => {
      const aVal = a[key]
      const bVal = b[key]

      if (aVal < bVal) return direction === 'asc' ? -1 : 1
      if (aVal > bVal) return direction === 'asc' ? 1 : -1
      return 0
    })
  },

  unique: <T>(array: T[], key?: keyof T) => {
    if (!key) {
      const seen = new Set<T>()
      return array.filter(item => {
        if (seen.has(item)) return false
        seen.add(item)
        return true
      })
    }

    const seen = new Set()
    return array.filter(item => {
      const value = item[key]
      if (seen.has(value)) return false
      seen.add(value)
      return true
    })
  }
}

// Error handling utilities
export const errorUtils = {
  getErrorMessage: (error: unknown): string => {
    if (error instanceof Error) return error.message
    if (typeof error === 'string') return error
    return 'Došlo k neočekávané chybě'
  },

  isNetworkError: (error: unknown): boolean => {
    return error instanceof Error &&
           (error.message.includes('network') ||
            error.message.includes('fetch'))
  }
}

// Wedding specific utilities
export const weddingUtils = {
  getWeddingStyleLabel: (style: string) => {
    const labels: Record<string, string> = {
      classic: 'Klasická elegantní',
      modern: 'Moderní minimální',
      rustic: 'Rustic/venkovská',
      vintage: 'Romanticky vintage',
      bohemian: 'Bohémská',
      minimalist: 'Minimalistická',
      garden: 'Zahradní',
      beach: 'Plážová',
      destination: 'Destination wedding'
    }
    return labels[style] || style
  },

  getPhaseLabel: (phase: string) => {
    const labels: Record<string, string> = {
      foundation: 'Základy svatby',
      venue: 'Místo konání',
      guests: 'Seznam hostů',
      budget: 'Rozpočet & služby',
      design: 'Design & detaily',
      organization: 'Organizace',
      final: 'Finální přípravy'
    }
    return labels[phase] || phase
  },

  getTaskPriorityColor: (priority: string) => {
    const colors: Record<string, string> = {
      high: 'text-red-600 bg-red-100',
      medium: 'text-yellow-600 bg-yellow-100',
      low: 'text-green-600 bg-green-100'
    }
    return colors[priority] || 'text-gray-600 bg-gray-100'
  }
}
