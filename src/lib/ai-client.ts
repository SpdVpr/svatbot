// Client-side AI wrapper that calls our API routes

export interface AIWeddingContext {
  budget?: number
  guestCount?: number
  weddingDate?: Date
  location?: string
  style?: string
  preferences?: string[]
  currentTasks?: any[]
  vendors?: any[]
  guests?: any[]
}

export class WeddingAI {
  
  // AI Wedding Assistant - General chat
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
