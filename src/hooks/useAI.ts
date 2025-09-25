'use client'

import { useState, useCallback } from 'react'
import { WeddingAI, AIWeddingContext } from '@/lib/ai-client'
import { useWedding } from './useWedding'
import { useGuest } from './useGuest'
import { useBudget } from './useBudget'
import { useTask } from './useTask'

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
}

export function useAI() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
  
  const { wedding } = useWedding()
  const { guests } = useGuest()
  const { budgetItems, stats } = useBudget()
  const { tasks } = useTask()

  // Build AI context from current wedding data
  const buildContext = useCallback((): AIWeddingContext => {
    return {
      budget: stats?.totalBudget || wedding?.budget,
      guestCount: wedding?.estimatedGuestCount || guests?.length,
      weddingDate: wedding?.weddingDate || undefined,
      location: wedding?.region,
      style: wedding?.style,
      preferences: [], // TODO: Add preferences to wedding type
      currentTasks: tasks,
      vendors: [], // TODO: Add vendors from marketplace
      guests: guests
    }
  }, [wedding, guests, budgetItems, tasks, stats])

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // AI Wedding Assistant Chat
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

      return suggestions
    } catch (err) {
      console.error('Error getting quick suggestions:', err)
      return [
        'Jak naplánovat perfektní svatbu?',
        'Jaký rozpočet je realistický?',
        'Kdy začít s přípravami?',
        'Jak vybrat dodavatele?'
      ]
    }
  }, [wedding, buildContext])

  return {
    // State
    loading,
    error,
    chatHistory,
    
    // Actions
    askAssistant,
    getVendorRecommendations,
    generateTimeline,
    optimizeBudget,
    prioritizeTasks,
    getWeddingInsights,
    getQuickSuggestions,
    clearError,
    clearChat,
    
    // Utils
    buildContext
  }
}

export default useAI
