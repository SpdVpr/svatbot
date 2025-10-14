/**
 * Hybrid AI Router
 * Intelligently routes queries between GPT-4 and Perplexity based on query type
 */

import { getPerplexityClient, PerplexitySearchResult } from './perplexity'
import OpenAI from 'openai'

export interface HybridAIResponse {
  answer: string
  sources?: Array<{
    title: string
    url: string
    snippet?: string
  }>
  provider: 'gpt' | 'perplexity' | 'hybrid'
  reasoning?: string
}

export interface QueryAnalysis {
  needsRealTimeData: boolean
  needsExternalSources: boolean
  needsPersonalContext: boolean
  queryType: 'personal' | 'search' | 'hybrid'
  confidence: number
}

/**
 * Hybrid AI Router
 * Combines GPT-4 for personal planning and Perplexity for real-time information
 */
export class HybridAI {
  private openai: OpenAI | null
  private perplexity: ReturnType<typeof getPerplexityClient>

  constructor() {
    this.openai = process.env.OPENAI_API_KEY
      ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
      : null
    this.perplexity = getPerplexityClient()
  }

  /**
   * Analyze query to determine which AI to use
   */
  private analyzeQuery(query: string, hasContext: boolean): QueryAnalysis {
    const lowerQuery = query.toLowerCase()

    // Keywords indicating need for real-time data
    const realTimeKeywords = [
      'aktuální', 'současný', 'trendy', 'ceny', 'kolik stojí',
      'najdi', 'hledám', 'doporuč', 'kde', 'kontakt',
      'recenze', 'hodnocení', 'portfolio', 'fotky',
      '2025', '2026', 'letos', 'příští rok'
    ]

    // Keywords indicating need for personal context
    const personalKeywords = [
      'moje', 'můj', 'naše', 'náš', 'svatba',
      'hosté', 'rozpočet', 'úkoly', 'timeline',
      'plán', 'organizace', 'co mám', 'jak mám'
    ]

    // Keywords indicating search queries
    const searchKeywords = [
      'fotograf', 'catering', 'místo', 'lokace', 'hotel',
      'květiny', 'hudba', 'dj', 'kapela', 'šaty',
      'oblek', 'vizážistka', 'kadeřnice', 'dort',
      'dodavatel', 'služba', 'firma'
    ]

    const needsRealTimeData = realTimeKeywords.some(kw => lowerQuery.includes(kw))
    const needsPersonalContext = personalKeywords.some(kw => lowerQuery.includes(kw)) || hasContext
    const needsExternalSources = searchKeywords.some(kw => lowerQuery.includes(kw))

    let queryType: 'personal' | 'search' | 'hybrid' = 'personal'
    let confidence = 0.5

    if (needsRealTimeData && needsExternalSources && !needsPersonalContext) {
      queryType = 'search'
      confidence = 0.9
    } else if (needsPersonalContext && !needsRealTimeData) {
      queryType = 'personal'
      confidence = 0.9
    } else if (needsRealTimeData || needsExternalSources) {
      queryType = 'hybrid'
      confidence = 0.7
    }

    return {
      needsRealTimeData,
      needsExternalSources,
      needsPersonalContext,
      queryType,
      confidence
    }
  }

  /**
   * Route query to appropriate AI
   */
  async ask(
    query: string,
    context?: any,
    systemPrompt?: string
  ): Promise<HybridAIResponse> {
    const analysis = this.analyzeQuery(query, !!context)

    console.log('🤖 Hybrid AI Analysis:', {
      query: query.substring(0, 50) + '...',
      analysis
    })

    // Route based on analysis
    if (analysis.queryType === 'search' && this.perplexity.isAvailable()) {
      return this.usePerplexity(query, systemPrompt)
    } else if (analysis.queryType === 'personal' && this.openai) {
      return this.useGPT(query, context, systemPrompt)
    } else if (analysis.queryType === 'hybrid') {
      return this.useHybrid(query, context, systemPrompt)
    } else {
      // Fallback to GPT
      return this.useGPT(query, context, systemPrompt)
    }
  }

  /**
   * Use GPT-4 for personal planning
   */
  private async useGPT(
    query: string,
    context?: any,
    systemPrompt?: string
  ): Promise<HybridAIResponse> {
    if (!this.openai) {
      throw new Error('OpenAI not configured')
    }

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = []

    const enhancedPrompt = systemPrompt || `Jsi Svatbot - AI svatební kouč. Pomáháš párům plánovat jejich svatbu.

DŮLEŽITÉ PRAVIDLO FORMÁTOVÁNÍ:
- Používej markdown formátování pro lepší čitelnost
- Používej **tučné písmo** pro důležité informace (názvy, ceny, adresy)
- Používej odrážky (•) nebo číslované seznamy pro výčty
- Používej nadpisy (###) pro sekce
- Používej prázdné řádky mezi sekcemi
- Pro kontakty a odkazy používej formát: **Web**: [text](url)

Příklad dobře formátované odpovědi:

### 🏨 Doporučené hotely

**1. Hotel Grandior**
• **Adresa**: Hlavní 123, Praha 1
• **Kapacita**: 50 pokojů
• **Cena**: 2 500 - 4 000 Kč/noc
• **Web**: [hotelgrandior.cz](https://hotelgrandior.cz)
• **Vybavení**: Restaurace, parkování, wellness

**2. Penzion U Lípy**
• **Adresa**: Lipová 45, Praha 5
• **Kapacita**: 15 pokojů
• **Cena**: 1 500 - 2 500 Kč/noc
• **Kontakt**: +420 123 456 789`

    messages.push({
      role: 'system',
      content: enhancedPrompt
    })

    // ✅ NOVÉ: Přidáme historii chatu pro kontext
    if (context?.chatHistory && Array.isArray(context.chatHistory)) {
      context.chatHistory.forEach((msg: any) => {
        messages.push({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        })
      })
    }

    // Přidáme kontext a aktuální otázku
    let userContent = query
    if (context) {
      const contextWithoutHistory = { ...context }
      delete contextWithoutHistory.chatHistory  // Odstraníme historii z kontextu (už je v messages)
      userContent = `Kontext:\n${JSON.stringify(contextWithoutHistory, null, 2)}\n\nOtázka: ${query}`
    }

    messages.push({
      role: 'user',
      content: userContent
    })

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.7,
      max_tokens: 1500
    })

    const answer = response.choices[0]?.message?.content || 'Nepodařilo se získat odpověď.'

    return {
      answer,
      provider: 'gpt',
      reasoning: 'Použit GPT-4 pro personalizované plánování'
    }
  }

  /**
   * Use Perplexity for real-time search
   */
  private async usePerplexity(
    query: string,
    systemPrompt?: string
  ): Promise<HybridAIResponse> {
    const result = await this.perplexity.search(query, systemPrompt)

    return {
      answer: result.answer,
      sources: result.sources,
      provider: 'perplexity',
      reasoning: 'Použita Perplexity pro aktuální informace z internetu'
    }
  }

  /**
   * Use hybrid approach - Perplexity for data, GPT for synthesis
   */
  private async useHybrid(
    query: string,
    context?: any,
    systemPrompt?: string
  ): Promise<HybridAIResponse> {
    try {
      console.log('🤖 Hybrid AI: Starting search...')

      // First, get real-time data from Perplexity
      // Note: Removed long system prompt for speed - Perplexity is fast without it
      const perplexityResult = await this.perplexity.search(query)

      // If no meaningful personal context, return Perplexity result directly (faster)
      const hasPersonalContext = context && (
        context.weddingDate ||
        context.budget ||
        context.guestCount ||
        context.venue ||
        (context.tasks && context.tasks.length > 0) ||
        (context.guests && context.guests.length > 0)
      )

      if (!hasPersonalContext || !this.openai) {
        return {
          answer: perplexityResult.answer,
          sources: perplexityResult.sources,
          provider: 'perplexity',
          reasoning: 'Použita Perplexity pro aktuální informace z internetu'
        }
      }

      // Only synthesize with GPT if there's meaningful personal context
      if (this.openai && hasPersonalContext) {
        const synthesisPrompt = systemPrompt || `Jsi Svatbot - AI svatební kouč.

DŮLEŽITÉ PRAVIDLO FORMÁTOVÁNÍ:
- Používej markdown formátování pro lepší čitelnost
- Používej **tučné písmo** pro důležité informace (názvy, ceny, adresy)
- Používej odrážky (•) nebo číslované seznamy pro výčty
- Používej nadpisy (###) pro sekce
- Používej prázdné řádky mezi sekcemi
- Pro kontakty a odkazy používej formát: **Web**: [text](url)
- Používej emoji pro lepší vizuální orientaci (🏨, 📍, 💰, 📞, 🌐)

Příklad dobře formátované odpovědi:

### 🏨 Doporučené hotely

**1. Hotel Grandior**
• **Adresa**: Hlavní 123, Praha 1
• **Kapacita**: 50 pokojů
• **Cena**: 2 500 - 4 000 Kč/noc
• **Web**: [hotelgrandior.cz](https://hotelgrandior.cz)
• **Vybavení**: Restaurace, parkování, wellness

**2. Penzion U Lípy**
• **Adresa**: Lipová 45, Praha 5
• **Kapacita**: 15 pokojů
• **Cena**: 1 500 - 2 500 Kč/noc
• **Kontakt**: +420 123 456 789`

        const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
          {
            role: 'system',
            content: synthesisPrompt
          }
        ]

        // ✅ NOVÉ: Přidáme historii chatu pro kontext
        if (context?.chatHistory && Array.isArray(context.chatHistory)) {
          context.chatHistory.forEach((msg: any) => {
            messages.push({
              role: msg.role as 'user' | 'assistant',
              content: msg.content
            })
          })
        }

        // Přidáme aktuální dotaz s Perplexity výsledky
        const contextWithoutHistory = { ...context }
        delete contextWithoutHistory.chatHistory

        messages.push({
          role: 'user',
          content: `
Uživatel se ptá: ${query}

Aktuální informace z internetu:
${perplexityResult.answer}

Zdroje: ${perplexityResult.citations.join(', ')}

Kontext uživatele:
${JSON.stringify(contextWithoutHistory, null, 2)}

Poskytni personalizovanou odpověď, která kombinuje aktuální informace s kontextem uživatele.
DŮLEŽITÉ: Použij markdown formátování podle vzoru výše pro maximální čitelnost.
          `.trim()
        })

        const response = await this.openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages,
          temperature: 0.7,
          max_tokens: 1500
        })

        const synthesizedAnswer = response.choices[0]?.message?.content || perplexityResult.answer

        return {
          answer: synthesizedAnswer,
          sources: perplexityResult.sources,
          provider: 'hybrid',
          reasoning: 'Kombinace Perplexity (aktuální data) a GPT-4 (personalizace)'
        }
      }

      // If no GPT available, return Perplexity result
      return {
        answer: perplexityResult.answer,
        sources: perplexityResult.sources,
        provider: 'perplexity',
        reasoning: 'Použita Perplexity pro aktuální informace'
      }
    } catch (error) {
      console.error('Hybrid AI error:', error)
      // Fallback to GPT only
      return this.useGPT(query, context, systemPrompt)
    }
  }

  /**
   * Specialized methods for common wedding queries
   */

  async findVendors(
    vendorType: string,
    location: string,
    context?: any
  ): Promise<HybridAIResponse> {
    const query = `Hledám ${vendorType} pro svatbu v okolí ${location}. Doporuč mi konkrétní firmy s kontakty a cenami.`
    return this.ask(query, context)
  }

  async getTrends(year: number = 2025): Promise<HybridAIResponse> {
    const query = `Jaké jsou aktuální svatební trendy v roce ${year} v České republice?`
    return this.ask(query)
  }

  async getPrices(
    service: string,
    location: string,
    context?: any
  ): Promise<HybridAIResponse> {
    const query = `Kolik stojí ${service} pro svatbu v ${location}? Jaké jsou aktuální ceny?`
    return this.ask(query, context)
  }

  async getInspiration(
    theme: string,
    context?: any
  ): Promise<HybridAIResponse> {
    const query = `Inspirace pro svatbu v tématu ${theme}. Jaké jsou aktuální nápady a trendy?`
    return this.ask(query, context)
  }
}

// Singleton instance
let hybridAIInstance: HybridAI | null = null

/**
 * Get Hybrid AI instance
 */
export function getHybridAI(): HybridAI {
  if (!hybridAIInstance) {
    hybridAIInstance = new HybridAI()
  }
  return hybridAIInstance
}

