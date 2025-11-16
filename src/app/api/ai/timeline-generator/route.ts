import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// Initialize OpenAI only if API key is available
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
}) : null

interface ActivitySelection {
  name: string
  category: string
  duration: string
  icon: string
}

interface WeddingContext {
  weddingDate?: Date | string
  estimatedGuestCount?: number
  budget?: number
  style?: string
  region?: string
  venue?: any
  brideName?: string
  groomName?: string
  accommodationCount?: number
  hasAccommodation?: boolean
}

export async function POST(request: NextRequest) {
  try {
    const { activities, context, generalNotes } = await request.json() as {
      activities: ActivitySelection[]
      context: WeddingContext
      generalNotes?: string
    }

    if (!activities || activities.length === 0) {
      return NextResponse.json(
        { error: 'Musíte vybrat alespoň jednu aktivitu' },
        { status: 400 }
      )
    }

    if (!openai) {
      return NextResponse.json(
        { error: 'AI služba není dostupná' },
        { status: 503 }
      )
    }

    // Prepare context information
    const weddingInfo = `
INFORMACE O SVATBĚ:
- Datum svatby: ${context.weddingDate ? new Date(context.weddingDate).toLocaleDateString('cs-CZ') : 'Neurčeno'}
- Počet hostů: ${context.estimatedGuestCount || 'Neurčeno'}
- Rozpočet: ${context.budget ? `${context.budget.toLocaleString('cs-CZ')} Kč` : 'Neurčeno'}
- Styl svatby: ${context.style || 'Neurčeno'}
- Region: ${context.region || 'Neurčeno'}
- Místo konání: ${context.venue?.name || 'Neurčeno'}
- Nevěsta: ${context.brideName || 'Neurčeno'}
- Ženich: ${context.groomName || 'Neurčeno'}
- Ubytování: ${context.hasAccommodation ? `Ano (${context.accommodationCount || 0} ubytování)` : 'Ne'}
    `.trim()

    const activitiesList = activities.map((a, i) =>
      `${i + 1}. ${a.name} (${a.category}, ${a.duration})`
    ).join('\n')

    const prompt = `
Jsi expert na plánování svateb v České republice. Vytvoř detailní časový harmonogram svatebního dne na základě vybraných aktivit a kontextu svatby.

${weddingInfo}

VYBRANÉ AKTIVITY:
${activitiesList}

${generalNotes ? `\nSPECIÁLNÍ POŽADAVKY UŽIVATELE:\n${generalNotes}` : ''}

ÚKOL:
Vytvoř kompletní harmonogram svatebního dne s přesnými časy pro každou aktivitu. Vezmi v úvahu:
1. Logickou návaznost aktivit
2. Počet hostů a jejich potřeby (přestávky, občerstvení)
3. Čas na přesuny mezi lokacemi
4. Rezervy pro zpoždění
5. Tradiční průběh českých svateb
6. Realistické časové odhady

FORMÁT ODPOVĚDI (JSON):
Vrať JSON objekt s následující strukturou:
{
  "timeline": [
    {
      "time": "HH:MM",
      "activity": "Název aktivity",
      "duration": "X hod/min",
      "category": "preparation|ceremony|photography|reception|party",
      "location": "Místo konání (pokud je relevantní)",
      "notes": "Důležité poznámky nebo tipy"
    }
  ],
  "explanation": "Detailní vysvětlení harmonogramu - proč jsi zvolil tento časový plán, jaké faktory jsi vzal v úvahu, jaké jsou klíčové momenty dne. Zahrň také 3-5 konkrétních tipů nebo rad, na co se zaměřit, nebo jaké aktivity by mohli ještě přidat pro dokonalý den."
}

DŮLEŽITÉ:
- Začni realistickým časem (např. 08:00-09:00 pro přípravu)
- Dodržuj logické pořadí (příprava → obřad → focení → hostina → zábava)
- Přidej i aktivity, které uživatel nevybral, ale jsou důležité (např. přestávky, přesuny)
- Každá aktivita musí mít přesný čas začátku
- Celý harmonogram by měl trvat realisticky (obvykle 12-16 hodin)
- Vezmi v úvahu speciální požadavky uživatele
- V "explanation" napiš 2-3 odstavce vysvětlení + konkrétní tipy (použij emoji pro lepší čitelnost)

Vrať POUZE validní JSON objekt, žádný další text.
    `.trim()

    console.log('🤖 Generating AI timeline with GPT-4...')

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Jsi expert na plánování svateb v České republice. Vytváříš detailní časové harmonogramy svatebních dnů. Vždy odpovídáš POUZE validním JSON polem, bez jakéhokoliv dalšího textu."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000,
      response_format: { type: "json_object" }
    })

    const content = response.choices[0]?.message?.content || ''
    console.log('🤖 GPT-4 Response:', content.substring(0, 200))

    // Parse JSON from response
    let timelineItems
    let explanation = 'Harmonogram byl vygenerován na základě vybraných aktivit a kontextu svatby.'

    try {
      const parsed = JSON.parse(content)
      // If response is wrapped in an object, extract the array
      timelineItems = Array.isArray(parsed) ? parsed : (parsed.timeline || parsed.items || [])

      // Extract explanation if present
      if (parsed.explanation) {
        explanation = parsed.explanation
      }

      if (!Array.isArray(timelineItems) || timelineItems.length === 0) {
        throw new Error('Invalid timeline format')
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError)
      console.error('Response content:', content)
      return NextResponse.json(
        { error: 'Nepodařilo se zpracovat odpověď AI' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      timeline: timelineItems,
      explanation: explanation,
      message: 'Harmonogram byl úspěšně vygenerován pomocí AI'
    })

  } catch (error) {
    console.error('AI Timeline Generator error:', error)
    return NextResponse.json(
      { error: 'Nepodařilo se vygenerovat harmonogram' },
      { status: 500 }
    )
  }
}

