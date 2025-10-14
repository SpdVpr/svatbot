/**
 * Perplexity AI Client
 * Real-time search and information retrieval for wedding planning
 */

export interface PerplexityMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface PerplexityResponse {
  id: string
  model: string
  created: number
  choices: Array<{
    index: number
    finish_reason: string
    message: {
      role: string
      content: string
    }
    delta?: {
      role?: string
      content?: string
    }
  }>
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
  citations?: string[]
}

export interface PerplexitySearchResult {
  answer: string
  sources: Array<{
    title: string
    url: string
    snippet?: string
  }>
  citations: string[]
}

/**
 * Perplexity AI Client
 * Uses Perplexity's API for real-time information retrieval
 */
export class PerplexityClient {
  private apiKey: string
  private baseUrl = 'https://api.perplexity.ai'

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.PERPLEXITY_API_KEY || ''
    
    if (!this.apiKey) {
      console.warn('⚠️ Perplexity API key not configured')
    }
  }

  /**
   * Check if Perplexity is available
   */
  isAvailable(): boolean {
    return !!this.apiKey
  }

  /**
   * Search for real-time information
   * @param query - Search query
   * @param context - Optional context for better results
   */
  async search(
    query: string,
    context?: string
  ): Promise<PerplexitySearchResult> {
    if (!this.isAvailable()) {
      throw new Error('Perplexity API key not configured')
    }

    try {
      console.log('🔍 Perplexity search started:', new Date().toISOString())
      const startTime = Date.now()

      const messages: PerplexityMessage[] = []

      // Only add system context if it's short and necessary
      if (context && context.length < 100) {
        messages.push({
          role: 'system',
          content: context
        })
      }

      messages.push({
        role: 'user',
        content: query
      })

      console.log('📤 Sending request to Perplexity API...')
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'sonar', // Fast, lightweight search model
          messages,
          temperature: 0.0, // Deterministic for maximum speed
          max_tokens: 600, // Shorter responses = faster
          return_citations: true,
          return_images: false, // Skip images for speed
          return_related_questions: false, // Skip related questions for speed
          search_recency_filter: 'month' // Recent information
        })
      })

      if (!response.ok) {
        const error = await response.text()
        console.error('❌ Perplexity API error:', response.status, error)
        throw new Error(`Perplexity API error: ${response.status} - ${error}`)
      }

      console.log('📥 Response received, parsing...')
      const data: PerplexityResponse = await response.json()

      const endTime = Date.now()
      const duration = endTime - startTime
      console.log(`✅ Perplexity search completed in ${duration}ms (${(duration/1000).toFixed(1)}s)`)

      const answer = data.choices[0]?.message?.content || ''
      const citations = data.citations || []

      // Extract sources from citations
      const sources = citations.map((url, index) => ({
        title: `Zdroj ${index + 1}`,
        url,
        snippet: undefined
      }))

      console.log(`📊 Response: ${answer.length} chars, ${citations.length} citations`)

      return {
        answer,
        sources,
        citations
      }
    } catch (error) {
      console.error('Perplexity search error:', error)
      throw error
    }
  }

  /**
   * Search for wedding vendors in a specific location
   */
  async searchVendors(
    vendorType: string,
    location: string,
    style?: string
  ): Promise<PerplexitySearchResult> {
    const query = `Najdi ${vendorType} pro svatbu v okolí ${location}${style ? ` ve stylu ${style}` : ''}. Zahrň kontakty, ceny a hodnocení.`
    
    const context = `Jsi expert na svatební služby v České republice. Hledáš aktuální informace o dodavatelích svatebních služeb. Poskytni konkrétní doporučení s kontakty a cenami.`

    return this.search(query, context)
  }

  /**
   * Get current wedding trends
   */
  async getWeddingTrends(year: number = 2025): Promise<PerplexitySearchResult> {
    const query = `Jaké jsou aktuální svatební trendy v roce ${year} v České republice? Zaměř se na dekoraci, styl, barvy a témata.`
    
    const context = `Jsi svatební expert sledující nejnovější trendy. Poskytni aktuální informace o svatebních trendech v ČR.`

    return this.search(query, context)
  }

  /**
   * Get average prices for wedding services
   */
  async getServicePrices(
    service: string,
    location: string,
    guestCount?: number
  ): Promise<PerplexitySearchResult> {
    const query = `Kolik stojí ${service} pro svatbu v ${location}${guestCount ? ` pro ${guestCount} hostů` : ''}? Jaké jsou průměrné ceny v roce 2025?`
    
    const context = `Jsi expert na svatební rozpočty v ČR. Poskytni aktuální cenové informace pro svatební služby.`

    return this.search(query, context)
  }

  /**
   * Get wedding venue recommendations
   */
  async searchVenues(
    location: string,
    guestCount: number,
    style?: string,
    budget?: number
  ): Promise<PerplexitySearchResult> {
    let query = `Doporuč svatební místa v okolí ${location} pro ${guestCount} hostů`
    
    if (style) {
      query += ` ve stylu ${style}`
    }
    
    if (budget) {
      query += ` s rozpočtem do ${budget.toLocaleString('cs-CZ')} Kč`
    }
    
    query += '. Zahrň kontakty, kapacitu a orientační ceny.'

    const context = `Jsi expert na svatební lokace v České republice. Poskytni aktuální informace o dostupných místech konání svateb.`

    return this.search(query, context)
  }

  /**
   * Get wedding inspiration
   */
  async getInspiration(
    theme: string,
    season?: string
  ): Promise<PerplexitySearchResult> {
    const query = `Inspirace pro svatbu v tématu ${theme}${season ? ` v ${season}` : ''}. Zaměř se na dekoraci, barvy, květiny a celkový koncept.`
    
    const context = `Jsi svatební designér poskytující inspiraci pro svatby. Zaměř se na aktuální trendy a praktické nápady.`

    return this.search(query, context)
  }

  /**
   * Get legal requirements for weddings in Czech Republic
   */
  async getLegalInfo(topic: string): Promise<PerplexitySearchResult> {
    const query = `Jaké jsou právní požadavky a postup pro ${topic} při svatbě v České republice v roce 2025?`
    
    const context = `Jsi expert na české svatební právo a administrativu. Poskytni aktuální a přesné informace o právních požadavcích.`

    return this.search(query, context)
  }

  /**
   * Get seasonal wedding tips
   */
  async getSeasonalTips(
    season: string,
    month?: string
  ): Promise<PerplexitySearchResult> {
    const query = `Tipy a doporučení pro ${season} svatbu${month ? ` v měsíci ${month}` : ''} v České republice. Co je třeba zvážit?`
    
    const context = `Jsi svatební plánovač specializující se na sezónní svatby. Poskytni praktické rady a tipy.`

    return this.search(query, context)
  }

  /**
   * Search for accommodation options
   */
  async searchAccommodation(
    location: string,
    guestCount: number,
    date?: Date
  ): Promise<PerplexitySearchResult> {
    let query = `Najdi ubytování pro svatební hosty v okolí ${location} pro přibližně ${guestCount} lidí`
    
    if (date) {
      query += ` na ${date.toLocaleDateString('cs-CZ')}`
    }
    
    query += '. Zahrň hotely, penziony a další možnosti s cenami.'

    const context = `Jsi expert na svatební ubytování. Poskytni aktuální informace o dostupných možnostech ubytování pro svatební hosty.`

    return this.search(query, context)
  }
}

// Singleton instance
let perplexityInstance: PerplexityClient | null = null

/**
 * Get Perplexity client instance
 */
export function getPerplexityClient(): PerplexityClient {
  if (!perplexityInstance) {
    perplexityInstance = new PerplexityClient()
  }
  return perplexityInstance
}

/**
 * Check if Perplexity is available
 */
export function isPerplexityAvailable(): boolean {
  return getPerplexityClient().isAvailable()
}

