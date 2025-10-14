import { NextRequest, NextResponse } from 'next/server'
import { getPerplexityClient } from '@/lib/perplexity'

/**
 * AI Search API - Real-time information using Perplexity
 * 
 * Endpoints:
 * - POST /api/ai/search - General search
 * - POST /api/ai/search/vendors - Search vendors
 * - POST /api/ai/search/trends - Get trends
 * - POST /api/ai/search/prices - Get prices
 */

export async function POST(request: NextRequest) {
  try {
    const { query, context, type } = await request.json()

    if (!query) {
      return NextResponse.json(
        { error: 'Query je povinný parametr' },
        { status: 400 }
      )
    }

    const perplexity = getPerplexityClient()

    if (!perplexity.isAvailable()) {
      return NextResponse.json(
        { 
          error: 'Perplexity AI není nakonfigurováno',
          fallback: true 
        },
        { status: 503 }
      )
    }

    let result

    // Route based on search type
    switch (type) {
      case 'vendors':
        const { vendorType, location, style } = await request.json()
        result = await perplexity.searchVendors(vendorType, location, style)
        break

      case 'trends':
        const { year } = await request.json()
        result = await perplexity.getWeddingTrends(year || 2025)
        break

      case 'prices':
        const { service, priceLocation, guestCount } = await request.json()
        result = await perplexity.getServicePrices(service, priceLocation, guestCount)
        break

      case 'venues':
        const { venueLocation, venueGuestCount, venueStyle, budget } = await request.json()
        result = await perplexity.searchVenues(venueLocation, venueGuestCount, venueStyle, budget)
        break

      case 'inspiration':
        const { theme, season } = await request.json()
        result = await perplexity.getInspiration(theme, season)
        break

      case 'legal':
        const { topic } = await request.json()
        result = await perplexity.getLegalInfo(topic)
        break

      case 'seasonal':
        const { searchSeason, month } = await request.json()
        result = await perplexity.getSeasonalTips(searchSeason, month)
        break

      case 'accommodation':
        const { accommodationLocation, accommodationGuestCount, date } = await request.json()
        result = await perplexity.searchAccommodation(
          accommodationLocation,
          accommodationGuestCount,
          date ? new Date(date) : undefined
        )
        break

      default:
        // General search
        result = await perplexity.search(query, context)
    }

    return NextResponse.json({
      success: true,
      answer: result.answer,
      sources: result.sources,
      citations: result.citations,
      provider: 'perplexity'
    })
  } catch (error) {
    console.error('AI Search error:', error)
    return NextResponse.json(
      { 
        error: 'Nepodařilo se vyhledat informace',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

