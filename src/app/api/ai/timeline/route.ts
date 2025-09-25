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
    const { context } = await request.json()

    const contextInfo = context ? `
      Kontext svatby:
      - Rozpočet: ${context.budget ? `${context.budget.toLocaleString()} Kč` : 'neurčen'}
      - Počet hostů: ${context.guestCount || 'neurčen'}
      - Datum: ${context.weddingDate ? new Date(context.weddingDate).toLocaleDateString('cs-CZ') : 'neurčeno'}
      - Lokace: ${context.location || 'neurčena'}
      - Styl: ${context.style || 'neurčen'}
    ` : ''

    const prompt = `
      Vytvoř detailní timeline svatebního dne pro českou svatbu.

      ${contextInfo}

      DŮLEŽITÉ: Vrať pouze čistý JSON bez markdown formátování, bez \`\`\`json bloků.

      Formát odpovědi:
      {
        "timeline": [
          {
            "time": "09:00",
            "activity": "Příprava nevěsty",
            "duration": "2 hodiny",
            "notes": "Volitelné poznámky"
          }
        ],
        "tips": ["tip 1", "tip 2", ...]
      }
    `

    let content: string

    if (!openai) {
      // Mock response when OpenAI is not available
      content = JSON.stringify({
        timeline: [
          { time: "09:00", activity: "Příprava nevěsty", duration: "2 hodiny", notes: "Líčení a účes" },
          { time: "11:00", activity: "Příprava ženicha", duration: "1 hodina", notes: "Oblékání a fotografie" },
          { time: "14:00", activity: "Obřad", duration: "30 minut", notes: "Hlavní ceremonie" },
          { time: "15:00", activity: "Gratulace a fotografování", duration: "1 hodina" },
          { time: "18:00", activity: "Svatební hostina", duration: "4 hodiny", notes: "Večeře a oslavy" }
        ],
        tips: [
          "Naplánujte si rezervní čas pro každou aktivitu",
          "Informujte všechny účastníky o časovém harmonogramu",
          "Připravte si kontakty na všechny dodavatele"
        ]
      })
    } else {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: WEDDING_CONTEXT },
          { role: "user", content: prompt }
        ],
        max_tokens: 800,
        temperature: 0.4
      })

      content = response.choices[0]?.message?.content || 'Nepodařilo se vygenerovat časový harmonogram'
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
    console.error('Timeline generation error:', error)
    return NextResponse.json({
      timeline: [],
      tips: ['Nepodařilo se vygenerovat timeline']
    })
  }
}
