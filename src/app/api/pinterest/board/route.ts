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
      console.log(`📊 Method ${i + 1} returned ${result.length} pins`)
      if (result.length > 0) {
        console.log(`✅ Method ${i + 1} succeeded with ${result.length} pins`)
        return result
      } else {
        console.log(`⚠️ Method ${i + 1} returned empty result, trying next method...`)
      }
    } catch (error: any) {
      console.log(`❌ Method ${i + 1} failed:`, error.message)
      if (i === methods.length - 1) {
        // Don't throw error, return empty array instead
        console.log(`❌ All methods failed, returning empty result`)
        return []
      }
    }
  }

  throw new Error('All Pinterest fetch methods failed')
}

function parseRSSFeed(rssText: string): PinterestPin[] {
  console.log(`📄 RSS content length: ${rssText.length} characters`)
  console.log(`📄 RSS preview: ${rssText.substring(0, 1000)}...`)

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
    const rawDescription = descMatch ? descMatch[1] : ''
    const description = rawDescription.replace(/<[^>]*>/g, '').substring(0, 200)

    // Extract link (Pinterest URL)
    const linkMatch = item.match(/<link>(.*?)<\/link>/)
    const sourceUrl = linkMatch ? linkMatch[1] : ''

    // Try multiple patterns to extract image URL from description
    let imageUrl = ''

    if (descMatch) {
      console.log(`🔍 Raw description for pin ${i + 1}: ${rawDescription.substring(0, 200)}`)

      // Pattern 1: HTML entities escaped - src=&quot;...&quot;
      const imgMatch1 = rawDescription.match(/src=&quot;([^&]*?)&quot;/)
      if (imgMatch1) {
        imageUrl = imgMatch1[1]
        console.log(`✅ Pattern 1 matched: ${imageUrl}`)
      }

      // Pattern 2: Normal src="..." in img tag
      if (!imageUrl) {
        const imgMatch2 = rawDescription.match(/src="([^"]*)"/)
        if (imgMatch2) {
          imageUrl = imgMatch2[1]
          console.log(`✅ Pattern 2 matched: ${imageUrl}`)
        }
      }

      // Pattern 3: Look for Pinterest image URLs directly
      if (!imageUrl) {
        const imgMatch3 = rawDescription.match(/https:\/\/i\.pinimg\.com\/[^&"'\s]+/)
        if (imgMatch3) {
          imageUrl = imgMatch3[0]
          console.log(`✅ Pattern 3 matched: ${imageUrl}`)
        }
      }

      // Pattern 4: Any https image URL
      if (!imageUrl) {
        const imgMatch4 = rawDescription.match(/https:\/\/[^&"'\s]+\.(jpg|jpeg|png|webp)/i)
        if (imgMatch4) {
          imageUrl = imgMatch4[0]
          console.log(`✅ Pattern 4 matched: ${imageUrl}`)
        }
      }

      if (!imageUrl) {
        console.log(`❌ No image URL found in description`)
      }
    }

    console.log(`📌 Pin ${i + 1}: "${title.substring(0, 50)}" - Image: ${imageUrl ? 'Found' : 'Missing'} - URL: ${imageUrl.substring(0, 100)}`)

    if (imageUrl && sourceUrl) {
      // Generate thumbnail URL (Pinterest format)
      let thumbnailUrl = imageUrl
      if (imageUrl.includes('pinimg.com')) {
        thumbnailUrl = imageUrl.replace(/\/\d+x/, '/400x').replace(/\/originals\//, '/400x/')
      }

      const tags = extractTags(title + ' ' + description)

      pins.push({
        id: `pin_${i}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        url: imageUrl,
        thumbnailUrl: thumbnailUrl,
        title: title,
        description: description,
        sourceUrl: sourceUrl,
        tags: tags
      })
    } else {
      console.log(`❌ Skipping pin ${i + 1}: missing ${!imageUrl ? 'image' : 'source'} URL`)
    }
  }

  console.log(`✅ Successfully parsed ${pins.length} pins from ${itemMatches.length} RSS items`)
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

    console.log(`📌 Pinterest API called with:`, { username, boardName, url })

    if (!username || !boardName) {
      console.log(`❌ Missing required fields: username=${username}, boardName=${boardName}`)
      return NextResponse.json(
        { error: 'Username and board name are required' },
        { status: 400 }
      )
    }

    console.log(`🔍 Fetching Pinterest board: ${username}/${boardName}`)

    try {
      const pins = await fetchPinterestBoard(username, boardName)

      console.log(`✅ Successfully fetched ${pins.length} pins`)

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
    } catch (fetchError: any) {
      console.error(`❌ Pinterest fetch failed:`, fetchError.message)

      // Return empty result instead of error for better UX
      return NextResponse.json({
        success: false,
        pins: [],
        count: 0,
        error: 'Pinterest board could not be loaded. The board might be private or the URL might be incorrect.',
        details: fetchError.message,
        boardInfo: {
          username,
          boardName,
          url
        }
      })
    }

  } catch (error: any) {
    console.error('❌ Pinterest API error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process Pinterest board request',
        details: error.message,
        pins: []
      },
      { status: 500 }
    )
  }
}
