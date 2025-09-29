import { NextRequest, NextResponse } from 'next/server'

interface PinterestPin {
  id: string
  url: string
  thumbnailUrl: string
  title: string
  description: string
  sourceUrl: string
  tags: string[]
}

// Pinterest RSS feed parser
async function fetchPinterestBoard(username: string, boardName: string): Promise<PinterestPin[]> {
  try {
    // Pinterest RSS feed URL
    const rssUrl = `https://www.pinterest.com/${username}/${boardName}.rss`
    
    const response = await fetch(rssUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const rssText = await response.text()
    
    // Parse RSS XML
    const pins: PinterestPin[] = []
    
    // Extract items from RSS
    const itemMatches = rssText.match(/<item[^>]*>[\s\S]*?<\/item>/g) || []
    
    for (let i = 0; i < Math.min(itemMatches.length, 50); i++) { // Limit to 50 pins
      const item = itemMatches[i]
      
      // Extract title
      const titleMatch = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)
      const title = titleMatch ? titleMatch[1] : 'Untitled'
      
      // Extract description
      const descMatch = item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)
      const description = descMatch ? descMatch[1].replace(/<[^>]*>/g, '').substring(0, 200) : ''
      
      // Extract link (Pinterest URL)
      const linkMatch = item.match(/<link>(.*?)<\/link>/)
      const sourceUrl = linkMatch ? linkMatch[1] : ''
      
      // Extract image URL from description
      const imgMatch = descMatch ? descMatch[1].match(/src="([^"]*)"/) : null
      const imageUrl = imgMatch ? imgMatch[1] : ''
      
      if (imageUrl && sourceUrl) {
        // Generate thumbnail URL (Pinterest format)
        const thumbnailUrl = imageUrl.replace(/\/\d+x/, '/400x')
        
        // Extract tags from title and description
        const tags = extractTags(title + ' ' + description)
        
        pins.push({
          id: `pin_${i}_${Date.now()}`,
          url: imageUrl,
          thumbnailUrl: thumbnailUrl,
          title: title,
          description: description,
          sourceUrl: sourceUrl,
          tags: tags
        })
      }
    }
    
    return pins
  } catch (error) {
    console.error('Error fetching Pinterest board:', error)
    throw error
  }
}

function extractTags(text: string): string[] {
  const commonWeddingTags = [
    'wedding', 'svatba', 'bride', 'nevěsta', 'groom', 'ženich',
    'dress', 'šaty', 'bouquet', 'kytice', 'flowers', 'květiny',
    'cake', 'dort', 'decoration', 'dekorace', 'venue', 'místo',
    'rings', 'prsteny', 'photography', 'fotografie', 'table', 'stůl',
    'centerpiece', 'aranžmá', 'invitation', 'pozvánka', 'shoes', 'boty'
  ]
  
  const foundTags: string[] = []
  const lowerText = text.toLowerCase()
  
  commonWeddingTags.forEach(tag => {
    if (lowerText.includes(tag.toLowerCase())) {
      foundTags.push(tag)
    }
  })
  
  // Add some generic tags based on content
  if (lowerText.includes('white') || lowerText.includes('bílá')) foundTags.push('white')
  if (lowerText.includes('pink') || lowerText.includes('růžová')) foundTags.push('pink')
  if (lowerText.includes('rustic') || lowerText.includes('rustikální')) foundTags.push('rustic')
  if (lowerText.includes('elegant') || lowerText.includes('elegantní')) foundTags.push('elegant')
  if (lowerText.includes('vintage') || lowerText.includes('vintage')) foundTags.push('vintage')
  
  return Array.from(new Set(foundTags)).slice(0, 8) // Remove duplicates and limit
}

export async function POST(request: NextRequest) {
  try {
    const { username, boardName, url } = await request.json()
    
    if (!username || !boardName) {
      return NextResponse.json(
        { error: 'Username and board name are required' },
        { status: 400 }
      )
    }
    
    console.log(`Fetching Pinterest board: ${username}/${boardName}`)
    
    const pins = await fetchPinterestBoard(username, boardName)
    
    return NextResponse.json({
      success: true,
      pins: pins,
      count: pins.length,
      boardInfo: {
        username,
        boardName,
        url
      }
    })
    
  } catch (error: any) {
    console.error('Pinterest board fetch error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch Pinterest board',
        details: error.message,
        pins: [] // Return empty array as fallback
      },
      { status: 500 }
    )
  }
}
