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

    const { imageUrls, weddingContext, userPrompt } = await request.json()

    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      return NextResponse.json(
        { error: 'Musíte poskytnout alespoň jeden obrázek' },
        { status: 400 }
      )
    }

    if (imageUrls.length > 10) {
      return NextResponse.json(
        { error: 'Maximální počet obrázků je 10' },
        { status: 400 }
      )
    }

    // Build context string
    const contextString = weddingContext ? `
Kontext svatby:
- Datum: ${weddingContext.weddingDate ? new Date(weddingContext.weddingDate).toLocaleDateString('cs-CZ') : 'neurčeno'}
- Lokace: ${weddingContext.location || 'neurčena'}
- Styl: ${weddingContext.style || 'neurčen'}
- Barvy: ${weddingContext.colors?.join(', ') || 'neurčeny'}
- Počet hostů: ${weddingContext.guestCount || 'neurčen'}
` : ''

    // Add user prompt if provided
    const userPromptString = userPrompt ? `

DŮLEŽITÉ - Uživatelské instrukce:
"${userPrompt}"

Vezmi tyto instrukce v úvahu při analýze a vytváření promptu. Zaměř se na prvky, které uživatel zmínil.
` : ''

    // Prepare messages for GPT-4o-mini with vision
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: `Jsi expert na svatební design a vizuální styl. Analyzuješ svatební inspirační fotografie a vytváříš detailní popisy pro generování AI moodboardů.

Tvým úkolem je:
1. Analyzovat všechny poskytnuté obrázky
2. Identifikovat společné prvky (barvy, styl, atmosféru, materiály, dekorace)
3. Vytvořit detailní prompt pro generování vizuální koláže (v angličtině)
4. Poskytnout strukturovanou analýzu (V ČEŠTINĚ!)

DŮLEŽITÉ: Všechny hodnoty kromě "prompt" musí být VŽDY V ČEŠTINĚ, ne v angličtině!

Odpovídej POUZE ve formátu JSON bez jakéhokoliv dalšího textu.`
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `${contextString}${userPromptString}

Analyzuj tyto svatební inspirační fotografie a vytvoř:
1. Detailní prompt pro generování svatebního moodboardu (v angličtině, optimalizovaný pro AI generování)
2. Analýzu stylu, barev a atmosféry (VŽDY V ČEŠTINĚ!)

DŮLEŽITÉ: Všechny hodnoty kromě "prompt" musí být V ČEŠTINĚ!

Odpověz ve formátu JSON:
{
  "prompt": "detailní anglický prompt pro AI generování koláže",
  "style": "rustikální",
  "colors": ["bílá", "zelená", "růžová"],
  "mood": "romantická a přírodní atmosféra",
  "elements": ["květiny", "dřevo", "krajka"],
  "materials": ["dřevo", "len", "bavlna"],
  "summary": "Rustikální svatba s přírodními prvky a romantickou atmosférou"
}`
          },
          // Add all images
          ...imageUrls.map((url: string) => ({
            type: 'image_url' as const,
            image_url: {
              url: url,
              detail: 'high' as const
            }
          }))
        ]
      }
    ]

    console.log('🔍 Analyzing images with GPT-5-mini Vision...')

    // GPT-5 with vision uses Chat Completions API with max_completion_tokens
    const response = await openai.chat.completions.create({
      model: 'gpt-5-mini',
      messages,
      max_completion_tokens: 3000, // Increased to allow for reasoning + actual response
      reasoning_effort: 'low', // Low effort for faster analysis
    })

    console.log('🔍 Response received:', {
      choices: response.choices?.length,
      finishReason: response.choices?.[0]?.finish_reason,
      hasContent: !!response.choices?.[0]?.message?.content
    })

    const content = response.choices[0]?.message?.content

    if (!content) {
      console.error('❌ No content in response:', JSON.stringify(response, null, 2))
      throw new Error('Nepodařilo se získat odpověď od AI')
    }

    // Parse JSON response
    let analysis
    try {
      // Remove markdown code blocks if present
      let cleanContent = content.trim()
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/```json\s*/, '').replace(/```\s*$/, '')
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/```\s*/, '').replace(/```\s*$/, '')
      }
      
      analysis = JSON.parse(cleanContent)
    } catch (parseError) {
      console.error('Failed to parse AI response:', content)
      throw new Error('Nepodařilo se zpracovat odpověď od AI')
    }

    // Validate response structure
    if (!analysis.prompt || !analysis.style || !analysis.colors) {
      throw new Error('Neplatná struktura odpovědi od AI')
    }

    console.log('✅ Analysis complete:', {
      style: analysis.style,
      colors: analysis.colors,
      elementsCount: analysis.elements?.length || 0
    })

    return NextResponse.json({
      success: true,
      analysis: {
        prompt: analysis.prompt,
        style: analysis.style,
        colors: analysis.colors || [],
        mood: analysis.mood || '',
        elements: analysis.elements || [],
        materials: analysis.materials || [],
        summary: analysis.summary || ''
      }
    })

  } catch (error) {
    console.error('❌ Moodboard analysis error:', error)
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Nepodařilo se analyzovat obrázky',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

