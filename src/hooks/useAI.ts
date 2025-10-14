'use client'

import { useState, useCallback } from 'react'
import { WeddingAI, AIWeddingContext, AIResponse as AIClientResponse, AISource } from '@/lib/ai-client'
import { useWedding } from './useWedding'
import { useGuest } from './useGuest'
import { useBudget } from './useBudget'
import { useTask } from './useTask'
import { useSeating } from './useSeating'
import { useWeddingWebsite } from './useWeddingWebsite'
import { useAccommodation } from './useAccommodation'
import { useShopping } from './useShopping'
import { useCalendar } from './useCalendar'

export interface AIResponse {
  success: boolean
  data?: any
  error?: string
  loading?: boolean
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  sources?: AISource[]
  provider?: 'gpt' | 'perplexity' | 'hybrid'
  reasoning?: string
}

export function useAI() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])

  const { wedding } = useWedding()
  const { guests } = useGuest()
  const { budgetItems, stats } = useBudget()
  const { tasks } = useTask()
  const { tables, stats: seatingStats } = useSeating()
  const { website } = useWeddingWebsite()
  const { accommodations, stats: accommodationStats } = useAccommodation()
  const { items: shoppingItems, stats: shoppingStats } = useShopping()
  const { events: calendarEvents, stats: calendarStats } = useCalendar()

  // Build AI context from current wedding data
  const buildContext = useCallback((): AIWeddingContext => {
    // Calculate guest stats
    const guestStats = guests ? {
      total: guests.length,
      confirmed: guests.filter(g => g.rsvpStatus === 'attending').length,
      declined: guests.filter(g => g.rsvpStatus === 'declined').length,
      pending: guests.filter(g => g.rsvpStatus === 'pending' || g.rsvpStatus === 'maybe').length,
      withDietaryRestrictions: guests.filter(g => g.dietaryRestrictions && g.dietaryRestrictions.length > 0).length,
      needingAccommodation: guests.filter(g => g.accommodationInterest === 'interested').length
    } : undefined

    // Calculate task stats
    const taskStats = tasks ? {
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'completed').length,
      pending: tasks.filter(t => t.status === 'pending').length,
      overdue: tasks.filter(t => {
        if (!t.dueDate || t.status === 'completed') return false
        return new Date(t.dueDate) < new Date()
      }).length
    } : undefined

    // Calculate budget stats
    const budgetStats = stats ? {
      totalBudget: stats.totalBudget || 0,
      totalSpent: stats.totalActual || 0,
      totalPaid: stats.totalPaid || 0,
      remaining: stats.totalRemaining || 0,
      budgetUsed: stats.budgetUsed || 0
    } : undefined

    // Calculate seating plan stats
    const seatingPlanData = seatingStats && tables && tables.length > 0 ? {
      tables: tables,
      totalSeats: seatingStats.totalSeats,
      assignedSeats: seatingStats.assignedSeats,
      unassignedGuests: seatingStats.totalSeats - seatingStats.assignedSeats
    } : undefined

    // Wedding website data
    const weddingWebsiteData = website ? {
      customUrl: website.customUrl,
      isPublished: website.isPublished,
      hasRSVP: website.content?.rsvp?.enabled || false,
      views: website.analytics?.views || 0
    } : undefined

    // Calendar stats
    const calendarStatsData = calendarStats ? {
      total: calendarStats.totalEvents,
      upcoming: calendarStats.upcomingEvents,
      today: calendarStats.todayEvents,
      thisWeek: calendarStats.thisWeekEvents
    } : undefined

    return {
      // Basic info
      budget: stats?.totalBudget || wedding?.budget,
      guestCount: wedding?.estimatedGuestCount || guests?.length,
      weddingDate: wedding?.weddingDate || undefined,
      location: wedding?.region,
      style: wedding?.style,
      preferences: [],
      brideName: wedding?.brideName,
      groomName: wedding?.groomName,

      // Detailed data
      guests: guests,
      budgetItems: budgetItems,
      currentTasks: tasks,
      calendarEvents: calendarEvents?.map(e => e.event),
      vendors: [],

      // Seating plan
      seatingPlan: seatingPlanData,

      // Wedding website
      weddingWebsite: weddingWebsiteData,

      // Accommodations
      accommodations: accommodations,
      accommodationStats: accommodationStats ? {
        total: accommodationStats.totalAccommodations,
        totalRooms: accommodationStats.totalRooms,
        reservedRooms: accommodationStats.reservedRooms,
        availableRooms: accommodationStats.availableRooms
      } : undefined,

      // Shopping list
      shoppingItems: shoppingItems,
      shoppingStats: shoppingStats ? {
        total: shoppingStats.totalItems,
        purchased: shoppingStats.purchasedItems,
        totalCost: shoppingStats.totalValue,
        remainingCost: shoppingStats.pendingValue
      } : undefined,

      // Stats
      guestStats,
      taskStats,
      budgetStats,
      calendarStats: calendarStatsData
    }
  }, [wedding, guests, budgetItems, tasks, stats, tables, seatingStats, website, accommodations, accommodationStats, shoppingItems, shoppingStats, calendarEvents, calendarStats])

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // AI Wedding Assistant Chat (Legacy - GPT only)
  const askAssistant = useCallback(async (question: string): Promise<string> => {
    setLoading(true)
    setError(null)

    try {
      // Add user message to chat
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: question,
        timestamp: new Date()
      }
      setChatHistory(prev => [...prev, userMessage])

      const context = buildContext()
      const response = await WeddingAI.askAssistant(question, context)

      // Add AI response to chat
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      }
      setChatHistory(prev => [...prev, aiMessage])

      return response
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Neočekávaná chyba'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [buildContext])

  // AI Wedding Assistant Chat (Hybrid - GPT + Perplexity)
  const askHybrid = useCallback(async (question: string): Promise<ChatMessage> => {
    setLoading(true)
    setError(null)

    try {
      // Add user message to chat
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: question,
        timestamp: new Date()
      }

      // Get current chat history before adding new message
      const currentHistory = chatHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      }))

      setChatHistory(prev => [...prev, userMessage])

      const context = buildContext()
      // ✅ NOVÉ: Posíláme historii chatu pro kontext
      const result = await WeddingAI.askHybrid(question, context, currentHistory)

      // Add AI response to chat with sources
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.response,
        timestamp: new Date(),
        sources: result.sources,
        provider: result.provider,
        reasoning: result.reasoning
      }
      setChatHistory(prev => [...prev, aiMessage])

      return aiMessage
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Neočekávaná chyba'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [buildContext])

  // Search for real-time information
  const searchInfo = useCallback(async (
    query: string,
    type?: 'vendors' | 'trends' | 'prices' | 'venues' | 'inspiration' | 'legal' | 'seasonal' | 'accommodation'
  ): Promise<AIClientResponse> => {
    setLoading(true)
    setError(null)

    try {
      const result = await WeddingAI.search(query, type)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Neočekávaná chyba'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Find vendors using Perplexity
  const findVendors = useCallback(async (
    vendorType: string,
    location?: string,
    style?: string
  ): Promise<AIClientResponse> => {
    setLoading(true)
    setError(null)

    try {
      const loc = location || wedding?.region || 'Praha'
      const result = await WeddingAI.findVendors(vendorType, loc, style)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Neočekávaná chyba'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [wedding])

  // Get current trends
  const getTrends = useCallback(async (year: number = 2025): Promise<AIClientResponse> => {
    setLoading(true)
    setError(null)

    try {
      const result = await WeddingAI.getTrends(year)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Neočekávaná chyba'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Get service prices
  const getPrices = useCallback(async (
    service: string,
    location?: string,
    guestCount?: number
  ): Promise<AIClientResponse> => {
    setLoading(true)
    setError(null)

    try {
      const loc = location || wedding?.region || 'Praha'
      const count = guestCount || guests?.length
      const result = await WeddingAI.getPrices(service, loc, count)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Neočekávaná chyba'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [wedding, guests])

  // Smart Vendor Recommendations
  const getVendorRecommendations = useCallback(async (category: string) => {
    setLoading(true)
    setError(null)

    try {
      const context = buildContext()
      const recommendations = await WeddingAI.recommendVendors(context, category)
      return recommendations
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Chyba při získávání doporučení'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [buildContext])

  // Generate Wedding Timeline
  const generateTimeline = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const context = buildContext()
      const timeline = await WeddingAI.generateTimeline(context)
      return timeline
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Chyba při generování timeline'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [buildContext])

  // Optimize Budget
  const optimizeBudget = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Check if we have budget data
      if (!budgetItems || budgetItems.length === 0) {
        throw new Error('Nejdříve vytvořte rozpočtové položky v sekci Rozpočet')
      }

      const totalBudgetAmount = stats?.totalBudget || 0
      if (totalBudgetAmount === 0) {
        throw new Error('Nejdříve nastavte celkový rozpočet svatby')
      }

      const context = buildContext()
      const optimization = await WeddingAI.optimizeBudget(budgetItems, totalBudgetAmount, context)
      return optimization
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Chyba při optimalizaci rozpočtu'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [budgetItems, stats?.totalBudget, buildContext])

  // Prioritize Tasks
  const prioritizeTasks = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      if (!tasks || !wedding?.weddingDate) {
        throw new Error('Nejdříve vytvořte úkoly a nastavte datum svatby')
      }

      const context = buildContext()
      const prioritization = await WeddingAI.prioritizeTasks(context)
      return prioritization
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Chyba při prioritizaci úkolů'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [tasks, wedding?.weddingDate, buildContext])

  // Get AI Insights for current wedding
  const getWeddingInsights = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const context = buildContext()
      const insights = await WeddingAI.askAssistant(
        'Analyzuj moji svatbu a poskytni 5 nejdůležitějších doporučení pro další kroky.',
        context
      )
      return insights
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Chyba při získávání insights'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [buildContext])

  // Clear chat history
  const clearChat = useCallback(() => {
    setChatHistory([])
  }, [])

  // Get quick suggestions based on current state
  const getQuickSuggestions = useCallback(async (): Promise<string[]> => {
    try {
      const context = buildContext()
      const daysUntilWedding = wedding?.weddingDate
        ? Math.ceil((wedding.weddingDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        : null

      let suggestions: string[] = []

      // Add data-specific suggestions based on what user has
      const dataSpecificSuggestions: string[] = []

      if (guests && guests.length > 0) {
        const guestsWithDietary = guests.filter(g => g.dietaryRestrictions && g.dietaryRestrictions.length > 0)
        if (guestsWithDietary.length > 0) {
          dataSpecificSuggestions.push('Kdo z hostů má dietní omezení?')
        }

        const pendingGuests = guests.filter(g => g.rsvpStatus === 'pending' || g.rsvpStatus === 'maybe')
        if (pendingGuests.length > 0) {
          dataSpecificSuggestions.push('Kteří hosté ještě nepotvrdili účast?')
        }
      }

      if (budgetItems && budgetItems.length > 0) {
        dataSpecificSuggestions.push('Jsem v rámci rozpočtu?')
        dataSpecificSuggestions.push('Jaké jsou moje největší výdaje?')
      }

      if (tasks && tasks.length > 0) {
        const overdueTasks = tasks.filter(t => {
          if (!t.dueDate || t.status === 'completed') return false
          return new Date(t.dueDate) < new Date()
        })
        if (overdueTasks.length > 0) {
          dataSpecificSuggestions.push('Které úkoly jsou po termínu?')
        }
        dataSpecificSuggestions.push('Stíhám všechno podle plánu?')
      }

      // Time-based suggestions
      if (daysUntilWedding) {
        if (daysUntilWedding > 365) {
          suggestions = [
            'Jak vybrat správné místo konání?',
            'Jaký rozpočet je realistický?',
            'Kdy objednat fotografa?',
            'Jak naplánovat save the dates?'
          ]
        } else if (daysUntilWedding > 180) {
          suggestions = [
            'Jaké dodavatele objednat jako první?',
            'Jak naplánovat menu?',
            'Kdy poslat pozvánky?',
            'Jak vybrat svatební šaty?'
          ]
        } else if (daysUntilWedding > 30) {
          suggestions = [
            'Finální přípravy - co nesmím zapomenout?',
            'Jak naplánovat timeline svatebního dne?',
            'Jaké dekorace jsou trendy?',
            'Jak připravit seating plan?'
          ]
        } else {
          suggestions = [
            'Last minute checklist',
            'Co vzít na svatbu?',
            'Jak se připravit den před?',
            'Emergency kit pro svatební den'
          ]
        }
      } else {
        suggestions = [
          'Jak začít plánovat svatbu?',
          'Jaký je první krok?',
          'Jak stanovit rozpočet?',
          'Kdy začít s přípravami?'
        ]
      }

      // Mix data-specific and time-based suggestions
      // Prioritize data-specific suggestions
      const finalSuggestions = [
        ...dataSpecificSuggestions.slice(0, 2),
        ...suggestions.slice(0, 2)
      ]

      return finalSuggestions.length > 0 ? finalSuggestions : suggestions
    } catch (err) {
      console.error('Error getting quick suggestions:', err)
      return [
        'Jak naplánovat perfektní svatbu?',
        'Jaký rozpočet je realistický?',
        'Kdy začít s přípravami?',
        'Jak vybrat dodavatele?'
      ]
    }
  }, [wedding, guests, budgetItems, tasks, buildContext])

  return {
    // State
    loading,
    error,
    chatHistory,

    // Actions - Legacy (GPT only)
    askAssistant,
    getVendorRecommendations,
    generateTimeline,
    optimizeBudget,
    prioritizeTasks,
    getWeddingInsights,
    getQuickSuggestions,
    clearError,
    clearChat,

    // Actions - Hybrid (GPT + Perplexity)
    askHybrid,
    searchInfo,
    findVendors,
    getTrends,
    getPrices,

    // Utils
    buildContext
  }
}

export default useAI
