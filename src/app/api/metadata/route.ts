import { NextRequest, NextResponse } from 'next/server'
import * as cheerio from 'cheerio'

// Helper function to detect if URL is from Shein
function isSheinUrl(url: string): boolean {
  return url.includes('shein.com') || url.includes('sheincorp.com')
}

// Helper function to extract Shein product data
function extractSheinData(html: string): any {
  const metadata: any = {}

  try {
    // Try to find product data in script tags
    const productDataMatch = html.match(/window\.gbProductDetailData\s*=\s*({[\s\S]*?});/)
    if (productDataMatch) {
      const productData = JSON.parse(productDataMatch[1])
      if (productData.detail) {
        metadata.title = productData.detail.goods_name || ''
        metadata.image = productData.detail.goods_img || productData.detail.original_img || ''
        metadata.price = productData.detail.salePrice?.amount || productData.detail.retailPrice?.amount || ''
        metadata.currency = productData.detail.salePrice?.currencyCode || 'USD'
        metadata.description = productData.detail.goods_desc || ''
      }
    }

    // Fallback: Try to find data in other script tags
    if (!metadata.title) {
      const scriptMatch = html.match(/<script[^>]*>[\s\S]*?goods_name['"]\s*:\s*['"]([^'"]+)['"][\s\S]*?<\/script>/)
      if (scriptMatch) {
        metadata.title = scriptMatch[1]
      }
    }

    // Try to find image in various places
    if (!metadata.image) {
      const imgMatch = html.match(/goods_img['"]\s*:\s*['"]([^'"]+)['"]/) ||
                      html.match(/original_img['"]\s*:\s*['"]([^'"]+)['"]/)
      if (imgMatch) {
        metadata.image = imgMatch[1]
      }
    }

    // Try to find price
    if (!metadata.price) {
      const priceMatch = html.match(/salePrice['"]\s*:\s*{[^}]*amount['"]\s*:\s*['"]?([0-9.]+)['"]?/)
      if (priceMatch) {
        metadata.price = priceMatch[1]
      }
    }
  } catch (error) {
    console.error('Error parsing Shein data:', error)
  }

  return metadata
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const url = searchParams.get('url')

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 })
  }

  try {
    // Fetch the HTML content with better headers and error handling
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'cs-CZ,cs;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Upgrade-Insecure-Requests': '1'
      },
      redirect: 'follow',
      // Add timeout
      signal: AbortSignal.timeout(10000) // 10 seconds timeout
    })

    if (!response.ok) {
      console.error(`Failed to fetch URL: ${response.status} ${response.statusText}`)
      // Return empty metadata instead of error
      return NextResponse.json({
        title: '',
        description: '',
        image: '',
        price: '',
        currency: 'CZK',
        error: `Failed to fetch: ${response.status}`
      })
    }

    const html = await response.text()

    // Check if this is a Shein URL
    if (isSheinUrl(url)) {
      const sheinData = extractSheinData(html)
      if (sheinData.title || sheinData.image) {
        return NextResponse.json(sheinData)
      }
    }

    // Use cheerio for better HTML parsing
    const $ = cheerio.load(html)
    const metadata: any = {}

    // Title - try og:title first, then <title>
    metadata.title = $('meta[property="og:title"]').attr('content') ||
                     $('meta[name="og:title"]').attr('content') ||
                     $('title').text() ||
                     $('h1').first().text() ||
                     ''

    // Description - try og:description first, then meta description
    metadata.description = $('meta[property="og:description"]').attr('content') ||
                          $('meta[name="description"]').attr('content') ||
                          $('meta[name="og:description"]').attr('content') ||
                          ''

    // Image - try og:image and other common patterns
    metadata.image = $('meta[property="og:image"]').attr('content') ||
                     $('meta[name="og:image"]').attr('content') ||
                     $('meta[property="og:image:url"]').attr('content') ||
                     $('img[itemprop="image"]').attr('src') ||
                     $('img.product-image').first().attr('src') ||
                     ''

    // Price - try various price meta tags and structured data
    let price = $('meta[property="product:price:amount"]').attr('content') ||
                $('meta[property="og:price:amount"]').attr('content') ||
                $('meta[name="price"]').attr('content') ||
                $('[itemprop="price"]').attr('content') ||
                $('[itemprop="price"]').text() ||
                $('.price').first().text() ||
                ''

    // Extract numeric value from price string
    if (price) {
      const priceMatch = price.match(/[\d\s]+[.,]?\d*/)
      if (priceMatch) {
        metadata.price = priceMatch[0].replace(/\s/g, '').replace(',', '.')
      }
    }

    // Currency
    metadata.currency = $('meta[property="product:price:currency"]').attr('content') ||
                       $('meta[property="og:price:currency"]').attr('content') ||
                       $('[itemprop="priceCurrency"]').attr('content') ||
                       'CZK'

    // Clean up metadata
    Object.keys(metadata).forEach(key => {
      if (typeof metadata[key] === 'string') {
        metadata[key] = metadata[key]
          .replace(/&quot;/g, '"')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&#39;/g, "'")
          .replace(/\n/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
      }
    })

    return NextResponse.json(metadata)
  } catch (error: any) {
    console.error('Error fetching metadata:', error)

    // Return empty metadata with error message instead of 500
    return NextResponse.json({
      title: '',
      description: '',
      image: '',
      price: '',
      currency: 'CZK',
      error: error.message || 'Failed to fetch metadata'
    })
  }
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

