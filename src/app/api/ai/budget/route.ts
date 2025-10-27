import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// Initialize OpenAI only if API key is available
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
}) : null

const WEDDING_CONTEXT = `
Jsi expert na svatební plánování v České republice. Znáš:
- České svatební tradice a zvyky
- Průměrné ceny služeb v ČR (aktuální rok 2025-2026)
- Sezónní faktory (květen-září hlavní sezóna)
- Regionální rozdíly (Praha dražší než venkov)
- Právní požadavky (matrika, církevní obřad)
- Časové plánování (12-18 měsíců dopředu)

Odpovídáš vždy v češtině, prakticky a s konkrétními čísly.
`

export async function POST(request: NextRequest) {
  try {
    const { currentBudget, totalBudget, context } = await request.json()

    if (!currentBudget || !totalBudget) {
      return NextResponse.json(
        { error: 'Rozpočet je povinný' },
        { status: 400 }
      )
    }

    const budgetBreakdown = currentBudget.map((item: any) =>
      `${item.name} (${item.category}): ${item.budgetedAmount.toLocaleString()} Kč (skutečné: ${item.actualAmount.toLocaleString()} Kč)`
    ).join('\n')

    const contextInfo = context ? `
      Kontext svatby:
      - Počet hostů: ${context.guestCount || 'neurčen'}
      - Datum: ${context.weddingDate ? new Date(context.weddingDate).toLocaleDateString('cs-CZ') : 'neurčeno'}
      - Lokace: ${context.location || 'neurčena'}
      - Styl: ${context.style || 'neurčen'}
    ` : ''

    const prompt = `
      Analyzuj tento svatební rozpočet a navrhni optimalizace:

      Celkový rozpočet: ${totalBudget.toLocaleString()} Kč
      Současné rozdělení:
      ${budgetBreakdown}

      ${contextInfo}

      DŮLEŽITÉ: Vrať pouze čistý JSON bez markdown formátování, bez \`\`\`json bloků.

      Formát odpovědi:
      {
        "analysis": "analýza současného rozpočtu",
        "suggestions": ["návrh 1", "návrh 2", ...],
        "optimizedAllocation": {"kategorie": částka_v_kč}
      }
    `

    let content: string

    if (!openai) {
      // Mock response when OpenAI is not available
      content = JSON.stringify({
        analysis: "Rozpočet vypadá rozumně rozložený. Doporučuji sledovat skutečné náklady a upravit alokaci podle potřeby.",
        suggestions: [
          "Zvažte rezervu 10-15% na neočekávané výdaje",
          "Porovnejte ceny u více dodavatelů",
          "Sledujte sezónní slevy a akce"
        ],
        optimizedAllocation: currentBudget.reduce((acc: any, item: any) => {
          acc[item.category] = Math.round(item.budgetedAmount * 0.95)
          return acc
        }, {})
      })
    } else {
      // Add current date to context
      const today = new Date()
      const currentDateInfo = `\n\nAktuální datum: ${today.toLocaleDateString('cs-CZ')} (${today.toISOString().split('T')[0]})`

      // GPT-5 uses Responses API
      const inputText = `${WEDDING_CONTEXT}${currentDateInfo}\n\n${prompt}`

      const response = await openai.responses.create({
        model: "gpt-5-mini",
        input: inputText,
        reasoning: { effort: 'medium' }, // Medium reasoning for budget analysis
        text: { verbosity: 'medium' },
        max_output_tokens: 700
      })

      content = response.output_text || 'Nepodařilo se získat odpověď od AI'
    }

    // Clean up the response - remove markdown code blocks if present
    let cleanContent = content.trim()
    if (cleanContent.startsWith('```json')) {
      cleanContent = cleanContent.replace(/```json\s*/, '').replace(/```\s*$/, '')
    } else if (cleanContent.startsWith('```')) {
      cleanContent = cleanContent.replace(/```\s*/, '').replace(/```\s*$/, '')
    }

    const parsed = JSON.parse(cleanContent)
    return NextResponse.json(parsed)
  } catch (error) {
    console.error('Budget optimization error:', error)
    return NextResponse.json({
      analysis: 'Nepodařilo se analyzovat rozpočet',
      suggestions: [],
      optimizedAllocation: {}
    })
  }
}
