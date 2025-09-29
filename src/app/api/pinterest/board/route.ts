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

// Try multiple methods to fetch Pinterest board
async function fetchPinterestBoard(username: string, boardName: string): Promise<PinterestPin[]> {
  const methods = [
    // Method 1: RSS feed
    async () => {
      const rssUrl = `https://www.pinterest.com/${username}/${boardName}.rss`
      console.log(`🔍 Method 1 - Fetching Pinterest RSS: ${rssUrl}`)

      const response = await fetch(rssUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'application/rss+xml, application/xml, text/xml'
        }
      })

      if (!response.ok) {
        throw new Error(`RSS failed: ${response.status} ${response.statusText}`)
      }

      const rssText = await response.text()
      return parseRSSFeed(rssText)
    },

    // Method 2: JSON feed (alternative)
    async () => {
      const jsonUrl = `https://www.pinterest.com/${username}/${boardName}.json`
      console.log(`🔍 Method 2 - Fetching Pinterest JSON: ${jsonUrl}`)

      const response = await fetch(jsonUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`JSON failed: ${response.status} ${response.statusText}`)
      }

      const jsonData = await response.json()
      return parseJSONFeed(jsonData)
    }
  ]

  // Try each method until one succeeds
  for (let i = 0; i < methods.length; i++) {
    try {
      console.log(`🔄 Trying method ${i + 1}...`)
      const result = await methods[i]()
      if (result.length > 0) {
        console.log(`✅ Method ${i + 1} succeeded with ${result.length} pins`)
        return result
      }
    } catch (error: any) {
      console.log(`❌ Method ${i + 1} failed:`, error.message)
      if (i === methods.length - 1) {
        throw error // Re-throw the last error
      }
    }
  }

  throw new Error('All Pinterest fetch methods failed')
}

function parseRSSFeed(rssText: string): PinterestPin[] {
  console.log(`📄 RSS content length: ${rssText.length} characters`)

  const pins: PinterestPin[] = []

  // Extract items from RSS
  const itemMatches = rssText.match(/<item[^>]*>[\s\S]*?<\/item>/g) || []
  console.log(`🔍 Found ${itemMatches.length} RSS items`)

  for (let i = 0; i < Math.min(itemMatches.length, 50); i++) {
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
      const thumbnailUrl = imageUrl.replace(/\/\d+x/, '/400x')
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
}

function parseJSONFeed(jsonData: any): PinterestPin[] {
  console.log(`📄 JSON data received:`, Object.keys(jsonData))

  const pins: PinterestPin[] = []

  // Pinterest JSON structure varies, try common patterns
  const items = jsonData.data?.results || jsonData.results || jsonData.pins || []

  for (let i = 0; i < Math.min(items.length, 50); i++) {
    const item = items[i]

    if (item.images && item.images.orig) {
      const tags = extractTags((item.description || '') + ' ' + (item.title || ''))

      pins.push({
        id: `pin_${i}_${Date.now()}`,
        url: item.images.orig.url,
        thumbnailUrl: item.images['400x'] ? item.images['400x'].url : item.images.orig.url,
        title: item.title || item.description || 'Pinterest Pin',
        description: item.description || '',
        sourceUrl: `https://pinterest.com/pin/${item.id}/`,
        tags: tags
      })
    }
  }

  return pins
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
