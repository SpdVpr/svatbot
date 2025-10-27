import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// Initialize OpenAI
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
}) : null

export async function POST(request: NextRequest) {
  try {
    if (!openai) {
      return NextResponse.json(
        { error: 'OpenAI API není nakonfigurováno' },
        { status: 500 }
      )
    }

    const { analysis, generatedImageUrl, weddingContext } = await request.json()

    if (!analysis) {
      return NextResponse.json(
        { error: 'Analýza je povinná' },
        { status: 400 }
      )
    }

    // Build context string
    const contextString = weddingContext ? `
Kontext svatby:
- Datum: ${weddingContext.weddingDate ? new Date(weddingContext.weddingDate).toLocaleDateString('cs-CZ') : 'neurčeno'}
- Lokace: ${weddingContext.location || 'neurčena'}
- Styl: ${weddingContext.style || 'neurčen'}
- Počet hostů: ${weddingContext.guestCount || 'neurčen'}
` : ''

    const prompt = `${contextString}

Na základě této analýzy svatebních inspiračních fotografií:

Styl: ${analysis.style}
Barvy: ${analysis.colors?.join(', ')}
Nálada: ${analysis.mood}
Prvky: ${analysis.elements?.join(', ')}
Materiály: ${analysis.materials?.join(', ')}

Vytvoř KOMPLETNĚ V ČEŠTINĚ:
1. Inspirativní popis svatebního stylu (2-3 věty)
2. Detailní popis barevné palety a jak ji použít
3. 5 konkrétních doporučení pro svatbu v tomto stylu
4. Návrhy na dekorace, květiny a doplňky

DŮLEŽITÉ: Všechny texty musí být v češtině!

Odpověz ve formátu JSON:
{
  "styleDescription": "Klasické svatby ztělesňují eleganci a nadčasovost, kde romance rozkvétá prostřednictvím rafinovaných detailů a tradičních estetických prvků.",
  "colorPalette": {
    "description": "Jemná barevná paleta kombinující pastelové odstíny s přírodními tóny",
    "primary": ["růžová", "bílá", "zelená"],
    "accent": ["zlatá", "krémová"],
    "usage": "Použijte růžovou pro květiny a dekorace, bílou jako základ a zeleň pro přírodní akcenty"
  },
  "recommendations": [
    "Zvolte třípatrový svatební dort zdobený fondánem a cukrovými květinami jako středobod",
    "Prostřete stoly elegantními bílými ubrusy, zlatým nebo stříbrným příborem a skleněnými vázami plnými sezónních květů",
    "Využijte bujnou zeleň jako běhouny podél stolů nebo drapérie přes svatební oltář pro přírodní dotek",
    "Zvolte židle a dekorace ve vintage stylu pro posílení klasického pocitu místa",
    "Navrhněte svatební oznámení s elegantní typografií a jemnými květinovými motivy v zvolené barevné paletě"
  ],
  "decorationIdeas": {
    "flowers": "Růže, pivoňky a sezónní květiny v pastelových odstínech",
    "decorations": "Elegantní svícny, vintage rámy, jemné textilie",
    "accessories": "Zlaté nebo stříbrné doplňky, křišťálové sklo, přírodní prvky"
  },
  "summary": "Klasická svatba plná elegance, romantiky a nadčasové krásy"
}`

    console.log('✍️ Generating description with GPT-5-mini...')

    // GPT-5 uses Chat Completions API with max_completion_tokens
    const response = await openai.chat.completions.create({
      model: 'gpt-5-mini',
      messages: [
        {
          role: 'system',
          content: 'Jsi expert na svatební design a plánování. Vytváříš inspirativní a praktické popisy svatebních stylů s konkrétními doporučeními. DŮLEŽITÉ: Odpovídáš VŽDY V ČEŠTINĚ a POUZE ve formátu JSON bez jakéhokoliv dalšího textu. Všechny texty musí být v češtině, ne v angličtině.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_completion_tokens: 2500, // Increased to allow for reasoning + actual response
      reasoning_effort: 'low', // Low effort for faster generation
    })

    const content = response.choices[0]?.message?.content

    if (!content) {
      throw new Error('Nepodařilo se získat odpověď od AI')
    }

    // Parse JSON response
    let description
    try {
      // Remove markdown code blocks if present
      let cleanContent = content.trim()
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/```json\s*/, '').replace(/```\s*$/, '')
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/```\s*/, '').replace(/```\s*$/, '')
      }
      
      description = JSON.parse(cleanContent)
    } catch (parseError) {
      console.error('Failed to parse AI response:', content)
      throw new Error('Nepodařilo se zpracovat odpověď od AI')
    }

    // Validate response structure
    if (!description.styleDescription || !description.recommendations) {
      throw new Error('Neplatná struktura odpovědi od AI')
    }

    console.log('✅ Description generated successfully')

    return NextResponse.json({
      success: true,
      description: {
        styleDescription: description.styleDescription,
        colorPalette: description.colorPalette || {},
        recommendations: description.recommendations || [],
        decorationIdeas: description.decorationIdeas || {},
        summary: description.summary || ''
      }
    })

  } catch (error) {
    console.error('❌ Moodboard description error:', error)
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Nepodařilo se vygenerovat popis',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

