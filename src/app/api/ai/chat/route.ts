import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

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
    const { question, context } = await request.json()

    if (!question) {
      return NextResponse.json(
        { error: 'Otázka je povinná' },
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
      - Preference: ${context.preferences?.join(', ') || 'žádné'}
    ` : ''

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: WEDDING_CONTEXT
        },
        {
          role: "user",
          content: `${contextInfo}\n\nOtázka: ${question}`
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('Prázdná odpověď od AI')
    }

    return NextResponse.json({ response: content })
  } catch (error) {
    console.error('AI Chat error:', error)
    return NextResponse.json(
      { error: 'Nepodařilo se získat odpověď od AI asistenta' },
      { status: 500 }
    )
  }
}
