import { NextRequest, NextResponse } from 'next/server'
import { getIdeogramClient } from '@/lib/ideogram'

export async function POST(request: NextRequest) {
  try {
    const { prompt, options } = await request.json()

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt je povinný' },
        { status: 400 }
      )
    }

    console.log('🎨 Generating moodboard with Ideogram...')
    console.log('Prompt:', prompt)
    console.log('Options:', options)

    // Get Ideogram client
    const ideogram = getIdeogramClient()

    // Enhance prompt for wedding moodboard
    const enhancedPrompt = `Wedding moodboard collage: ${prompt}. Professional photography, elegant composition, cohesive color palette, inspirational mood board layout, high quality, aesthetic arrangement.`

    // Generate image
    const imageUrl = await ideogram.generateWeddingMoodboard(
      enhancedPrompt,
      {
        aspectRatio: options?.aspectRatio || 'ASPECT_16_9',
        style: options?.style || 'DESIGN',
        seed: options?.seed
      }
    )

    console.log('✅ Moodboard generated successfully')
    console.log('Image URL:', imageUrl)

    return NextResponse.json({
      success: true,
      imageUrl,
      prompt: enhancedPrompt
    })

  } catch (error) {
    console.error('❌ Moodboard generation error:', error)
    
    // Check if it's an Ideogram API error
    if (error instanceof Error && error.message.includes('Ideogram API error')) {
      return NextResponse.json(
        { 
          error: 'Chyba při generování obrázku',
          details: error.message
        },
        { status: 502 }
      )
    }

    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Nepodařilo se vygenerovat moodboard',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

