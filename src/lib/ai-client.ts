// Client-side AI wrapper that calls our API routes

import { Guest } from '@/types/guest'
import { BudgetItem } from '@/types/budget'
import { Task } from '@/types/task'
import { CalendarEvent } from '@/types/calendar'
import { Vendor } from '@/types/vendor'
import { Table } from '@/types/seating'
import { WeddingWebsite } from '@/types/wedding-website'
import { Accommodation } from '@/types'
import { ShoppingItem } from '@/types/shopping'

export interface AIWeddingContext {
  // Basic wedding info
  budget?: number
  guestCount?: number
  weddingDate?: Date
  location?: string
  style?: string
  preferences?: string[]
  brideName?: string
  groomName?: string

  // Detailed data for AI analysis
  guests?: Guest[]
  budgetItems?: BudgetItem[]
  currentTasks?: Task[]
  calendarEvents?: CalendarEvent[]
  vendors?: Vendor[]

  // Seating plan data
  seatingPlan?: {
    tables?: Table[]
    totalSeats?: number
    assignedSeats?: number
    unassignedGuests?: number
  }

  // Wedding website data
  weddingWebsite?: {
    customUrl?: string
    isPublished?: boolean
    hasRSVP?: boolean
    views?: number
  }

  // Accommodation data
  accommodations?: Accommodation[]
  accommodationStats?: {
    total?: number
    totalRooms?: number
    reservedRooms?: number
    availableRooms?: number
  }

  // Shopping list data
  shoppingItems?: ShoppingItem[]
  shoppingStats?: {
    total?: number
    purchased?: number
    totalCost?: number
    remainingCost?: number
  }

  // Computed stats
  budgetStats?: {
    totalBudget: number
    totalSpent: number
    totalPaid: number
    remaining: number
    budgetUsed: number // percentage
  }

  taskStats?: {
    total: number
    completed: number
    pending: number
    overdue: number
  }

  guestStats?: {
    total: number
    confirmed: number
    declined: number
    pending: number
    withDietaryRestrictions: number
    needingAccommodation: number
  }

  calendarStats?: {
    total: number
    upcoming: number
    today: number
    thisWeek: number
  }
}

export interface AISource {
  title: string
  url: string
  snippet?: string
}

export interface AIResponse {
  response: string
  sources?: AISource[]
  provider?: 'gpt' | 'perplexity' | 'hybrid'
  reasoning?: string
}

export class WeddingAI {

  // AI Wedding Assistant - General chat (Legacy - uses GPT only)
  static async askAssistant(
    question: string,
    context?: AIWeddingContext
  ): Promise<string> {
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          context
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      return data.response
    } catch (error) {
      console.error('AI Assistant error:', error)
      if (error instanceof Error) {
        throw new Error(`AI chyba: ${error.message}`)
      }
      throw new Error('Nepodařilo se získat odpověď od AI asistenta')
    }
  }

  // AI Wedding Assistant - Hybrid (GPT + Perplexity)
  static async askHybrid(
    question: string,
    context?: AIWeddingContext,
    chatHistory?: Array<{ role: string; content: string }>
  ): Promise<AIResponse> {
    try {
      const response = await fetch('/api/ai/hybrid-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          context,
          chatHistory  // ✅ NOVÉ: Posíláme historii chatu
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      return {
        response: data.response,
        sources: data.sources,
        provider: data.provider,
        reasoning: data.reasoning
      }
    } catch (error) {
      console.error('Hybrid AI error:', error)
      if (error instanceof Error) {
        throw new Error(`AI chyba: ${error.message}`)
      }
      throw new Error('Nepodařilo se získat odpověď od AI asistenta')
    }
  }

  // Search for real-time information using Perplexity
  static async search(
    query: string,
    type?: 'vendors' | 'trends' | 'prices' | 'venues' | 'inspiration' | 'legal' | 'seasonal' | 'accommodation',
    params?: any
  ): Promise<AIResponse> {
    try {
      const response = await fetch('/api/ai/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          type,
          ...params
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      return {
        response: data.answer,
        sources: data.sources,
        provider: 'perplexity'
      }
    } catch (error) {
      console.error('AI Search error:', error)
      if (error instanceof Error) {
        throw new Error(`Vyhledávání selhalo: ${error.message}`)
      }
      throw new Error('Nepodařilo se vyhledat informace')
    }
  }

  // Find vendors using Perplexity
  static async findVendors(
    vendorType: string,
    location: string,
    style?: string
  ): Promise<AIResponse> {
    return this.search(
      `Hledám ${vendorType} pro svatbu v okolí ${location}${style ? ` ve stylu ${style}` : ''}`,
      'vendors',
      { vendorType, location, style }
    )
  }

  // Get current wedding trends
  static async getTrends(year: number = 2025): Promise<AIResponse> {
    return this.search(
      `Jaké jsou aktuální svatební trendy v roce ${year}?`,
      'trends',
      { year }
    )
  }

  // Get service prices
  static async getPrices(
    service: string,
    location: string,
    guestCount?: number
  ): Promise<AIResponse> {
    return this.search(
      `Kolik stojí ${service} pro svatbu v ${location}${guestCount ? ` pro ${guestCount} hostů` : ''}?`,
      'prices',
      { service, priceLocation: location, guestCount }
    )
  }

  // Search venues
  static async searchVenues(
    location: string,
    guestCount: number,
    style?: string,
    budget?: number
  ): Promise<AIResponse> {
    return this.search(
      `Svatební místa v okolí ${location} pro ${guestCount} hostů`,
      'venues',
      { venueLocation: location, venueGuestCount: guestCount, venueStyle: style, budget }
    )
  }

  // Get inspiration
  static async getInspiration(
    theme: string,
    season?: string
  ): Promise<AIResponse> {
    return this.search(
      `Inspirace pro svatbu v tématu ${theme}${season ? ` v ${season}` : ''}`,
      'inspiration',
      { theme, season }
    )
  }

  // Get legal information
  static async getLegalInfo(topic: string): Promise<AIResponse> {
    return this.search(
      `Právní požadavky pro ${topic} při svatbě v ČR`,
      'legal',
      { topic }
    )
  }

  // Get seasonal tips
  static async getSeasonalTips(
    season: string,
    month?: string
  ): Promise<AIResponse> {
    return this.search(
      `Tipy pro ${season} svatbu${month ? ` v měsíci ${month}` : ''}`,
      'seasonal',
      { searchSeason: season, month }
    )
  }

  // Search accommodation
  static async searchAccommodation(
    location: string,
    guestCount: number,
    date?: Date
  ): Promise<AIResponse> {
    return this.search(
      `Ubytování pro svatební hosty v okolí ${location}`,
      'accommodation',
      { accommodationLocation: location, accommodationGuestCount: guestCount, date: date?.toISOString() }
    )
  }

  // Smart Vendor Recommendations
  static async recommendVendors(
    context: AIWeddingContext,
    category: string
  ): Promise<{
    recommendations: string[]
    reasoning: string
    budgetGuidance: string
  }> {
    try {
      const response = await fetch('/api/ai/vendors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category,
          context
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Vendor recommendation error:', error)
      return {
        recommendations: ['Nepodařilo se získat doporučení'],
        reasoning: 'AI doporučení na základě vašich preferencí',
        budgetGuidance: 'Zkuste to prosím později'
      }
    }
  }

  // Generate Wedding Timeline
  static async generateTimeline(context: AIWeddingContext): Promise<{
    timeline: Array<{
      time: string
      activity: string
      duration: string
      notes?: string
    }>
    tips: string[]
  }> {
    try {
      const response = await fetch('/api/ai/timeline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          context
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Timeline generation error:', error)
      return {
        timeline: [],
        tips: ['Nepodařilo se vygenerovat timeline']
      }
    }
  }

  // Budget Optimization
  static async optimizeBudget(
    currentBudget: any[],
    totalBudget: number,
    context: AIWeddingContext
  ): Promise<{
    analysis: string
    suggestions: string[]
    optimizedAllocation: Record<string, number>
  }> {
    try {
      const response = await fetch('/api/ai/budget', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentBudget,
          totalBudget,
          context
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Budget optimization error:', error)
      return {
        analysis: 'Nepodařilo se analyzovat rozpočet',
        suggestions: [],
        optimizedAllocation: {}
      }
    }
  }

  // Task Prioritization (placeholder - can be implemented later)
  static async prioritizeTasks(context: AIWeddingContext): Promise<{
    prioritizedTasks: Array<{
      id: string
      title: string
      priority: 'critical' | 'high' | 'medium' | 'low'
      deadline: string
      reasoning: string
    }>
    insights: string[]
  }> {
    // For now, return mock data
    return {
      prioritizedTasks: [],
      insights: ['Prioritizace úkolů bude implementována později']
    }
  }

  // Get Wedding Insights
  static async getWeddingInsights(context: AIWeddingContext): Promise<string> {
    try {
      const response = await this.askAssistant(
        'Analyzuj moji svatbu a poskytni 3 nejdůležitější doporučení pro další kroky.',
        context
      )
      return response
    } catch (error) {
      console.error('Wedding insights error:', error)
      return 'Na základě vašich údajů doporučuji začít s rezervací místa konání a výběrem fotografa. Tyto služby se rychle vyprodávají, zejména v hlavní svatební sezóně.'
    }
  }

  // Get Quick Suggestions
  static async getQuickSuggestions(context: AIWeddingContext): Promise<string[]> {
    const daysUntilWedding = context.weddingDate 
      ? Math.ceil((context.weddingDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      : null

    if (daysUntilWedding) {
      if (daysUntilWedding > 365) {
        return [
          'Jak vybrat správné místo konání?',
          'Jaký rozpočet je realistický pro naši svatbu?',
          'Kdy objednat fotografa a videografa?',
          'Jak naplánovat save the dates?'
        ]
      } else if (daysUntilWedding > 180) {
        return [
          'Jaké dodavatele objednat jako první?',
          'Jak naplánovat svatební menu?',
          'Kdy poslat svatební pozvánky?',
          'Jak vybrat svatební šaty a oblek?'
        ]
      } else if (daysUntilWedding > 30) {
        return [
          'Finální přípravy - co nesmím zapomenout?',
          'Jak naplánovat timeline svatebního dne?',
          'Jaké dekorace jsou aktuálně trendy?',
          'Jak připravit seating plan pro hosty?'
        ]
      } else {
        return [
          'Last minute checklist před svatbou',
          'Co si vzít na svatbu - emergency kit',
          'Jak se připravit den před svatbou?',
          'Tipy pro klidný svatební den'
        ]
      }
    } else {
      return [
        'Jak začít plánovat svatbu krok za krokem?',
        'Jaký je první krok při plánování?',
        'Jak realisticky stanovit rozpočet?',
        'Kdy začít s přípravami svatby?'
      ]
    }
  }
}

export default WeddingAI
