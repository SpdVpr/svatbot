import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// Initialize OpenAI only if API key is available
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
}) : null

const WEDDING_CONTEXT = `
Jsi expert na svatební plánování v České republice. Znáš:
- České svatební tradice a zvyky
- Průměrné ceny služeb v ČR (2024-2025)
- Sezónní faktory (květen-září hlavní sezóna)
- Regionální rozdíly (Praha dražší než venkov)
- Právní požadavky (matrika, církevní obřad)
- Časové plánování (12-18 měsíců dopředu)

Odpovídáš vždy v češtině, prakticky a s konkrétními čísly.
`

export async function POST(request: NextRequest) {
  try {
    const { category, context } = await request.json()

    if (!category) {
      return NextResponse.json(
        { error: 'Kategorie je povinná' },
        { status: 400 }
      )
    }

    const contextInfo = context ? `
      Kontext svatby:
      - Rozpočet: ${context.budget ? `${context.budget.toLocaleString()} Kč` : 'neurčen'}
      - Počet hostů: ${context.guestCount || 'neurčen'}
      - Datum: ${context.weddingDate ? new Date(context.weddingDate).toLocaleDateString('cs-CZ') : 'neurčeno'}
      - Lokace: ${context.location || 'neurčena'}
      - Styl: ${context.style || 'neurčen'}
    ` : ''

    const prompt = `
      Doporuč 3-5 konkrétních dodavatelů pro kategorii "${category}" na svatbu v České republice.

      ${contextInfo}

      DŮLEŽITÉ: Vrať pouze čistý JSON bez markdown formátování, bez \`\`\`json bloků.

      Formát odpovědi:
      {
        "recommendations": ["konkrétní doporučení 1", "konkrétní doporučení 2", ...],
        "reasoning": "vysvětlení proč tato doporučení",
        "budgetGuidance": "kolik by mělo stát v daném rozpočtu"
      }
    `

    let content: string

    if (!openai) {
      // Mock response when OpenAI is not available
      content = JSON.stringify({
        recommendations: [
          `Doporučujeme hledat ${category} v regionu ${context.location || 'vaší lokace'}`,
          "Porovnejte si nabídky od alespoň 3 dodavatelů",
          "Zkontrolujte reference a recenze předchozích klientů",
          "Ujistěte se, že dodavatel má volný termín vašeho svatebního dne",
          "Sjednejte si osobní schůzku nebo ochutnávku"
        ],
        reasoning: `Pro kategorii ${category} je důležité najít spolehlivého dodavatele s dobrou pověstí. Ceny se mohou lišit podle regionu a sezóny.`,
        budgetGuidance: `Pro ${category} počítejte s rozpočtem 10-20% z celkového svatebního rozpočtu, v závislosti na vašich prioritách.`
      })
    } else {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: WEDDING_CONTEXT },
          { role: "user", content: prompt }
        ],
        max_tokens: 600,
        temperature: 0.4
      })

      content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error('Prázdná odpověď od AI')
      }
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
    console.error('Vendor recommendations error:', error)
    return NextResponse.json({
      recommendations: ['Nepodařilo se získat doporučení'],
      reasoning: 'AI doporučení na základě vašich preferencí',
      budgetGuidance: 'Zkuste to prosím později'
    })
  }
}
