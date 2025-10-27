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

    // Keywords indicating questions about user's own data (NO web search needed)
    const personalDataKeywords = [
      'kolik mám', 'kolik máme', 'kolik je', 'kolik máš',
      'počet', 'celkem', 'celková', 'celkový',
      'potvrzeno', 'potvrzených', 'odmítnuto', 'odmítnutých',
      'zbývá', 'zbývající', 'utraceno', 'utracených',
      'dokončeno', 'dokončených', 'pending', 'čeká',
      'moje', 'můj', 'naše', 'náš', 'moji', 'naši',
      'v aplikaci', 'v systému', 'v databázi',
      'seznam', 'přehled', 'statistika', 'statistiky'
    ]

    // Keywords indicating need for external search (web search needed)
    const searchKeywords = [
      'najdi', 'vyhledej', 'hledám', 'doporuč', 'doporučení',
      'kde najdu', 'kde sehnat', 'kde koupit',
      'kontakt na', 'adresa', 'telefon na',
      'recenze', 'hodnocení', 'portfolio', 'fotky',
      'aktuální ceny', 'kolik stojí', 'cena za',
      'trendy', 'novinky', 'současný', 'moderní',
      'počasí', 'předpověď', 'teplota', 'bude', 'dnes',
      'zítra', 'víkend', 'prší', 'sněží', 'slunečno',
      'online', 'internet', 'web', 'stáhni', 'zjisti'
    ]

    // Vendor/service keywords (usually need search)
    const vendorKeywords = [
      'fotograf', 'catering', 'místo', 'lokace', 'hotel', 'ubytování',
      'květiny', 'hudba', 'dj', 'kapela', 'šaty', 'oblek',
      'vizážistka', 'kadeřnice', 'dort', 'cukrárna',
      'dodavatel', 'služba', 'firma', 'salon'
    ]

    // Explicit search commands (highest priority for search)
    const explicitSearchCommands = [
      'vyhledej', 'najdi', 'hledej', 'zjisti', 'stáhni',
      'online', 'z internetu', 'z webu'
    ]
    const hasExplicitSearchCommand = explicitSearchCommands.some(kw => lowerQuery.includes(kw))

    // Check for personal data queries
    const isPersonalDataQuery = personalDataKeywords.some(kw => lowerQuery.includes(kw))

    // Check for search queries
    const isSearchQuery = searchKeywords.some(kw => lowerQuery.includes(kw))
    const mentionsVendors = vendorKeywords.some(kw => lowerQuery.includes(kw))

    let queryType: 'personal' | 'search' | 'hybrid' = 'personal'
    let confidence = 0.5

    // Priority 0: Explicit search commands (ALWAYS use web search)
    if (hasExplicitSearchCommand) {
      queryType = 'search'
      confidence = 0.99
    }
    // Priority 1: Personal data queries (about user's own data in app)
    else if (isPersonalDataQuery || (hasContext && !isSearchQuery && !mentionsVendors)) {
      queryType = 'personal'
      confidence = 0.95
    }
    // Priority 2: Clear search queries
    else if (isSearchQuery && mentionsVendors) {
      queryType = 'search'
      confidence = 0.9
    }
    // Priority 3: Search queries without vendors (weather, etc.)
    else if (isSearchQuery) {
      queryType = 'search'
      confidence = 0.85
    }
    // Priority 4: Vendor mentions without clear search intent
    else if (mentionsVendors) {
      queryType = 'hybrid'
      confidence = 0.7
    }
    // Default: personal
    else {
      queryType = 'personal'
      confidence = 0.8
    }

    return {
      needsRealTimeData: isSearchQuery,
      needsExternalSources: isSearchQuery || mentionsVendors,
      needsPersonalContext: isPersonalDataQuery || hasContext,
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
    if (!this.openai) {
      throw new Error('OpenAI není nakonfigurováno')
    }

    // Analyze query to determine if web search is needed
    const analysis = this.analyzeQuery(query, !!context)

    // Decide whether to use web search based on query type
    const useWebSearch = analysis.queryType === 'search' || analysis.queryType === 'hybrid'

    if (useWebSearch) {
      console.log('🤖 AI Routing: Using GPT-5 with web search (query type:', analysis.queryType, ')')
    } else {
      console.log('🤖 AI Routing: Using GPT-5 without web search (personal query)')
    }

    return this.useGPT(query, context, systemPrompt, useWebSearch)
  }

  /**
   * Use GPT-5 for queries (with or without web search)
   */
  private async useGPT(
    query: string,
    context?: any,
    systemPrompt?: string,
    useWebSearch: boolean = false
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

DŮLEŽITÉ PRAVIDLO PRO VYHLEDÁVÁNÍ:
- Při vyhledávání míst, dodavatelů, služeb (hotely, fotografové, salony, atd.) VŽDY uveď MAXIMÁLNĚ 3 VÝSLEDKY
- Vyber 3 nejlepší/nejrelevantnější možnosti podle kvality, recenzí a ceny
- Pokud uživatel chce více, může požádat o další
- Toto pravidlo platí pro: hotely, fotografy, catering, salony, květinářství, hudbu, místa, atd.

Příklad dobře formátované odpovědi:

### 🏨 Doporučené hotely (TOP 3)

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
• **Kontakt**: +420 123 456 789

**3. Resort Zahrada**
• **Adresa**: Zahradní 10, Praha 6
• **Kapacita**: 30 pokojů
• **Cena**: 3 000 - 5 000 Kč/noc
• **Web**: [resortzahrada.cz](https://resortzahrada.cz)

💡 Chcete vidět další možnosti? Napište "další hotely".`

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

    // GPT-5 with Responses API
    // Convert messages to Responses API format
    const systemMessage = messages.find(m => m.role === 'system')
    const userMessages = messages.filter(m => m.role !== 'system')

    // Build input text from messages
    let inputText = typeof systemMessage?.content === 'string' ? systemMessage.content : ''
    userMessages.forEach(msg => {
      const content = typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)
      inputText += `\n\n${msg.role === 'user' ? 'Uživatel' : 'Asistent'}: ${content}`
    })

    // Configure tools based on whether web search is needed
    const tools = useWebSearch ? [{ type: 'web_search' as const }] : undefined

    let response = await this.openai.responses.create({
      model: 'gpt-5-mini',
      input: inputText,
      tools, // ✅ Conditionally enable web search
      reasoning: { effort: 'low' }, // Low effort for faster responses
      text: { verbosity: 'medium' },
      max_output_tokens: useWebSearch ? 3000 : 2000 // 3000 for web search (max 3 results), 2000 for personal
    })

    // If response is incomplete, poll for completion
    if (response.status === 'incomplete') {
      console.log('⏳ Response incomplete, polling for completion...')
      let attempts = 0
      const maxAttempts = 20 // Max 40 seconds (20 * 2s)

      while (response.status === 'incomplete' && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 2000)) // Wait 2 seconds
        response = await this.openai.responses.retrieve(response.id)
        attempts++
      }

      console.log(`✅ Polling complete after ${attempts} attempts, status: ${response.status}`)
    }

    // Extract text from Responses API output
    let answer = ''

    if (response.output && Array.isArray(response.output)) {
      const messages = response.output.filter((item: any) => item.type === 'message')

      for (const msg of messages) {
        if ('content' in msg && msg.content && Array.isArray(msg.content)) {
          for (const contentItem of msg.content) {
            if ('type' in contentItem && contentItem.type === 'output_text' && 'text' in contentItem && contentItem.text) {
              answer += contentItem.text + '\n\n'
            }
          }
        }
      }
    }

    if (!answer.trim()) {
      console.log('⚠️ No answer extracted, response status:', response.status)
      console.log('⚠️ Output items:', response.output?.map((item: any) => item.type).join(', '))
      answer = 'Nepodařilo se získat odpověď. Zkuste to prosím znovu.'
    }

    return {
      answer: answer.trim(),
      provider: 'gpt',
      reasoning: useWebSearch
        ? 'Použit GPT-5-mini s web search'
        : 'Použit GPT-5-mini (bez web search)'
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

        // GPT-5 uses Responses API - convert messages to input
        const systemMessage = messages.find(m => m.role === 'system')
        const userContent = `
Uživatel se ptá: ${query}

Aktuální informace z internetu:
${perplexityResult.answer}

Zdroje: ${perplexityResult.citations.join(', ')}

Kontext uživatele:
${JSON.stringify(contextWithoutHistory, null, 2)}

Poskytni personalizovanou odpověď, která kombinuje aktuální informace s kontextem uživatele.
DŮLEŽITÉ: Použij markdown formátování podle vzoru výše pro maximální čitelnost.
        `.trim()

        const inputText = systemMessage
          ? `${systemMessage.content}\n\n${userContent}`
          : userContent

        const response = await this.openai.responses.create({
          model: 'gpt-5-mini',
          input: inputText,
          reasoning: { effort: 'medium' }, // Medium reasoning for hybrid synthesis
          text: { verbosity: 'medium' },
          max_output_tokens: 1500
        })

        const synthesizedAnswer = response.output_text || perplexityResult.answer

        return {
          answer: synthesizedAnswer,
          sources: perplexityResult.sources,
          provider: 'hybrid',
          reasoning: 'Kombinace Perplexity (aktuální data) a GPT-5-mini (personalizace)'
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

