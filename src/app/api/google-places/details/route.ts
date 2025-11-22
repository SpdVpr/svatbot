import { NextRequest, NextResponse } from 'next/server'

/**
 * Google Places API - Place Details Endpoint
 * 
 * Fetches place details including rating and reviews from Google Places API
 * 
 * NOTE: This is a placeholder implementation. To use this in production:
 * 1. Get Google Places API key from Google Cloud Console
 * 2. Enable Places API
 * 3. Add GOOGLE_PLACES_API_KEY to environment variables
 * 4. Implement proper caching to stay within free tier
 */

export async function POST(request: NextRequest) {
  try {
    const { placeId } = await request.json()

    if (!placeId) {
      return NextResponse.json(
        { error: 'Place ID is required' },
        { status: 400 }
      )
    }

    // Check if API key is configured
    const apiKey = process.env.GOOGLE_PLACES_API_KEY

    if (!apiKey) {
      console.warn('⚠️ Google Places API key not configured. Returning mock data.')
      
      // Return mock data for development
      return NextResponse.json({
        placeId,
        name: 'Demo Vendor',
        rating: 4.8,
        userRatingsTotal: 127,
        reviews: [
          {
            author_name: 'Jan Novák',
            author_url: 'https://www.google.com/maps/contrib/123',
            language: 'cs',
            profile_photo_url: 'https://lh3.googleusercontent.com/a-/AOh14Gi...',
            rating: 5,
            relative_time_description: 'před 2 měsíci',
            text: 'Skvělá služba, profesionální přístup. Určitě doporučuji!',
            time: Math.floor(Date.now() / 1000) - 60 * 60 * 24 * 60, // 60 days ago
          },
          {
            author_name: 'Marie Svobodová',
            author_url: 'https://www.google.com/maps/contrib/456',
            language: 'cs',
            rating: 5,
            relative_time_description: 'před 3 měsíci',
            text: 'Naprosto spokojeni, vše proběhlo bez problémů. Děkujeme!',
            time: Math.floor(Date.now() / 1000) - 60 * 60 * 24 * 90, // 90 days ago
          },
          {
            author_name: 'Petr Dvořák',
            author_url: 'https://www.google.com/maps/contrib/789',
            language: 'cs',
            rating: 4,
            relative_time_description: 'před 5 měsíci',
            text: 'Velmi dobré, jen malé zpoždění při dodání.',
            time: Math.floor(Date.now() / 1000) - 60 * 60 * 24 * 150, // 150 days ago
          },
        ],
        url: `https://www.google.com/maps/place/?q=place_id:${placeId}`,
      })
    }

    // Handle different Place ID formats
    let actualPlaceId = placeId

    // If it's a CID, we need to convert it (this is simplified)
    if (placeId.startsWith('cid:')) {
      const cid = placeId.replace('cid:', '')
      // In production, you'd need to use Find Place API to convert CID to Place ID
      console.warn('CID conversion not implemented. Use Place ID directly.')
      return NextResponse.json(
        { error: 'Please provide a Place ID (starting with ChIJ) instead of CID' },
        { status: 400 }
      )
    }

    // Fetch place details from Google Places API
    const url = new URL('https://maps.googleapis.com/maps/api/place/details/json')
    url.searchParams.append('place_id', actualPlaceId)
    url.searchParams.append('fields', 'name,rating,user_ratings_total,reviews,url')
    url.searchParams.append('reviews_sort', 'newest')
    url.searchParams.append('language', 'cs')
    url.searchParams.append('key', apiKey)

    const response = await fetch(url.toString())
    const data = await response.json()

    if (data.status !== 'OK') {
      console.error('Google Places API error:', data)
      return NextResponse.json(
        { error: `Google Places API error: ${data.status}` },
        { status: 400 }
      )
    }

    const result = data.result

    // Return formatted data
    return NextResponse.json({
      placeId: actualPlaceId,
      name: result.name,
      rating: result.rating || 0,
      userRatingsTotal: result.user_ratings_total || 0,
      reviews: (result.reviews || []).slice(0, 5).map((review: any) => ({
        author_name: review.author_name,
        author_url: review.author_url,
        language: review.language,
        profile_photo_url: review.profile_photo_url,
        rating: review.rating,
        relative_time_description: review.relative_time_description,
        text: review.text,
        time: review.time,
      })),
      url: result.url || `https://www.google.com/maps/place/?q=place_id:${actualPlaceId}`,
    })

  } catch (error) {
    console.error('Error fetching Google Place details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch place details' },
      { status: 500 }
    )
  }
}

