// Client-side AI wrapper that calls our API routes
// NOTE: This file is deprecated. Use ai-client.ts instead.
// Keeping for backward compatibility.

import { Guest } from '@/types/guest'
import { BudgetItem } from '@/types/budget'
import { Task } from '@/types/task'
import { CalendarEvent } from '@/types/calendar'
import { Vendor } from '@/types/vendor'

export interface AIWeddingContext {
  // Basic wedding info
  budget?: number
  guestCount?: number
  weddingDate?: Date
  location?: string
  style?: string
  preferences?: string[]

  // Detailed data for AI analysis
  guests?: Guest[]
  budgetItems?: BudgetItem[]
  currentTasks?: Task[]
  calendarEvents?: CalendarEvent[]
  vendors?: Vendor[]

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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, context })
      })

      if (!response.ok) {
        throw new Error('Failed to get AI response')
      }

      const data = await response.json()

      return data.response || 'Omlouvám se, nepodařilo se mi odpovědět na vaši otázku.'
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
    category: string,
    context: AIWeddingContext
  ): Promise<{
    recommendations: string[]
    reasoning: string
    budgetGuidance: string
  }> {
    try {
      console.log('Vendor recommendations - context:', context)
      console.log('Vendor recommendations - category:', category)
      const prompt = `
        Doporuč 5 nejlepších ${category} pro svatbu s těmito parametry:
        - Rozpočet: ${context.budget?.toLocaleString()} Kč
        - Počet hostů: ${context.guestCount}
        - Lokace: ${context.location}
        - Styl: ${context.style}
        - Datum: ${context.weddingDate?.toLocaleDateString('cs-CZ')}

        Odpověz ve formátu JSON:
        {
          "recommendations": ["konkrétní doporučení 1", "doporučení 2", ...],
          "reasoning": "proč právě tyto možnosti",
          "budgetGuidance": "kolik by mělo stát v daném rozpočtu"
        }
      `

      // TODO: Implement API call to /api/ai/vendors
      const response = await fetch('/api/ai/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, context })
      })

      if (!response.ok) {
        throw new Error('Failed to get vendor recommendations')
      }

      const data = await response.json()
      const content = data.response
      console.log('Vendor recommendations - AI response:', content)

      if (!content) throw new Error('No response from AI')

      const parsed = JSON.parse(content)
      console.log('Vendor recommendations - parsed:', parsed)
      return parsed
    } catch (error) {
      console.error('Vendor recommendation error:', error)
      return {
        recommendations: ['Nepodařilo se získat doporučení'],
        reasoning: 'Došlo k chybě při generování doporučení',
        budgetGuidance: 'Zkuste to prosím později'
      }
    }
  }

  // Intelligent Timeline Generator
  static async generateTimeline(
    context: AIWeddingContext
  ): Promise<{
    timeline: Array<{
      time: string
      activity: string
      duration: string
      notes?: string
    }>
    tips: string[]
  }> {
    try {
      console.log('Timeline generation - context:', context)
      const prompt = `
        Vytvoř detailní timeline svatebního dne pro:
        - Počet hostů: ${context.guestCount}
        - Styl: ${context.style}
        - Lokace: ${context.location}
        
        Začni v 8:00 ráno a skončí kolem 2:00 v noci.
        Zahrň: přípravy, obřad, focení, hostinu, zábavu.
        
        Odpověz ve formátu JSON:
        {
          "timeline": [
            {"time": "8:00", "activity": "aktivita", "duration": "2h", "notes": "poznámky"}
          ],
          "tips": ["tip 1", "tip 2", ...]
        }
      `

      // TODO: Implement API call to /api/ai/timeline
      const response = await fetch('/api/ai/timeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context })
      })

      if (!response.ok) {
        throw new Error('Failed to generate timeline')
      }

      const data = await response.json()
      const content = data.response
      console.log('Timeline generation - AI response:', content)

      if (!content) throw new Error('No response from AI')

      const parsed = JSON.parse(content)
      console.log('Timeline generation - parsed:', parsed)
      return parsed
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
      console.log('Budget optimization - currentBudget:', currentBudget)
      console.log('Budget optimization - totalBudget:', totalBudget)
      console.log('Budget optimization - context:', context)

      const budgetBreakdown = currentBudget.map(item =>
        `${item.category}: ${item.amount.toLocaleString()} Kč`
      ).join('\n')

      const prompt = `
        Analyzuj tento svatební rozpočet a navrhni optimalizace:
        
        Celkový rozpočet: ${totalBudget.toLocaleString()} Kč
        Současné rozdělení:
        ${budgetBreakdown}
        
        Kontext:
        - Počet hostů: ${context.guestCount}
        - Styl: ${context.style}
        - Lokace: ${context.location}
        
        Odpověz ve formátu JSON:
        {
          "analysis": "celková analýza rozpočtu",
          "suggestions": ["konkrétní návrh 1", "návrh 2", ...],
          "optimizedAllocation": {"kategorie": částka_v_kč}
        }
      `

      // TODO: Implement API call to /api/ai/budget
      const response = await fetch('/api/ai/budget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentBudget, totalBudget, context })
      })

      if (!response.ok) {
        throw new Error('Failed to optimize budget')
      }

      const data = await response.json()
      const content = data.response
      console.log('Budget optimization - AI response:', content)

      if (!content) throw new Error('No response from AI')

      const parsed = JSON.parse(content)
      console.log('Budget optimization - parsed:', parsed)
      return parsed
    } catch (error) {
      console.error('Budget optimization error:', error)
      return {
        analysis: 'Nepodařilo se analyzovat rozpočet',
        suggestions: [],
        optimizedAllocation: {}
      }
    }
  }

  // Smart Task Prioritization
  static async prioritizeTasks(
    tasks: any[],
    weddingDate: Date,
    context: AIWeddingContext
  ): Promise<{
    prioritizedTasks: Array<{
      id: string
      title: string
      priority: 'critical' | 'high' | 'medium' | 'low'
      deadline: string
      reasoning: string
    }>
    insights: string[]
  }> {
    try {
      const daysUntilWedding = Math.ceil(
        (weddingDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      )

      const taskList = tasks.map(task => 
        `${task.id}: ${task.title} (${task.status})`
      ).join('\n')

      const prompt = `
        Prioritizuj tyto svatební úkoly podle důležitosti a času:
        
        Dní do svatby: ${daysUntilWedding}
        Úkoly:
        ${taskList}
        
        Kontext:
        - Rozpočet: ${context.budget?.toLocaleString()} Kč
        - Počet hostů: ${context.guestCount}
        - Styl: ${context.style}
        
        Odpověz ve formátu JSON s prioritami a deadliny.
      `

      // TODO: Implement API call for task optimization
      const response = await fetch('/api/ai/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks, context })
      })

      if (!response.ok) {
        throw new Error('Failed to optimize tasks')
      }

      const data = await response.json()
      const content = data.response
      if (!content) throw new Error('No response from AI')

      return JSON.parse(content)
    } catch (error) {
      console.error('Task prioritization error:', error)
      return {
        prioritizedTasks: [],
        insights: ['Nepodařilo se prioritizovat úkoly']
      }
    }
  }

  // Get Wedding Insights
  static async getWeddingInsights(context: AIWeddingContext): Promise<string> {
    try {
      const prompt = `
        Analyzuj současný stav této svatby a poskytni personalizované doporučení:

        Kontext:
        - Rozpočet: ${context.budget?.toLocaleString()} Kč
        - Počet hostů: ${context.guestCount}
        - Datum: ${context.weddingDate?.toLocaleDateString('cs-CZ')}
        - Styl: ${context.style}
        - Lokace: ${context.location}
        - Počet úkolů: ${context.currentTasks?.length || 0}

        Poskytni konkrétní, praktické doporučení v 2-3 větách. Zaměř se na nejdůležitější kroky.
      `

      // TODO: Implement API call for smart suggestions
      const response = await fetch('/api/ai/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context })
      })

      if (!response.ok) {
        throw new Error('Failed to get smart suggestions')
      }

      const data = await response.json()
      const content = data.response
      if (!content) throw new Error('No response from AI')

      return content.trim()
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
