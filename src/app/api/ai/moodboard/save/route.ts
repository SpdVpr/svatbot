import { NextRequest, NextResponse } from 'next/server'

/**
 * Download image from Ideogram and return as blob
 * This bypasses CORS issues by proxying the request through our server
 */
export async function POST(request: NextRequest) {
  try {
    const { imageUrl } = await request.json()

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      )
    }

    console.log('💾 Downloading image from Ideogram via proxy...')

    // Download image from Ideogram
    const imageResponse = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    if (!imageResponse.ok) {
      throw new Error(`Failed to download image: ${imageResponse.status}`)
    }

    const imageBuffer = await imageResponse.arrayBuffer()
    const contentType = imageResponse.headers.get('content-type') || 'image/png'

    console.log('✅ Image downloaded successfully')

    // Return image as blob with proper headers
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': imageBuffer.byteLength.toString(),
        'Cache-Control': 'public, max-age=31536000',
      },
    })

  } catch (error) {
    console.error('❌ Error downloading image:', error)

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to download image',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

