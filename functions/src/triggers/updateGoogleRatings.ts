/**
 * Scheduled Function: Update Google Ratings
 * 
 * Runs daily at 3:00 AM (Europe/Prague timezone)
 * Updates Google Place data (rating, reviews) for all marketplace vendors
 * 
 * Cost: FREE (within Google Places API free tier)
 * - 100 vendors × 1 update/day = 3,000 requests/month
 * - Free tier: 11,700 requests/month
 */

import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

const db = admin.firestore()

interface GooglePlaceData {
  placeId: string
  name: string
  rating: number
  userRatingsTotal: number
  reviews: any[]
  url: string
}

/**
 * Fetch Google Place data from Google Places API
 */
async function fetchGooglePlaceData(placeId: string): Promise<GooglePlaceData | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY

  if (!apiKey) {
    console.warn('⚠️ Google Places API key not configured')
    return null
  }

  try {
    const url = new URL('https://maps.googleapis.com/maps/api/place/details/json')
    url.searchParams.append('place_id', placeId)
    url.searchParams.append('fields', 'name,rating,user_ratings_total,reviews,url')
    url.searchParams.append('reviews_sort', 'newest')
    url.searchParams.append('language', 'cs')
    url.searchParams.append('key', apiKey)

    const response = await fetch(url.toString())
    const data = await response.json()

    if (data.status !== 'OK') {
      console.error(`Google Places API error for ${placeId}:`, data.status)
      return null
    }

    const result = data.result

    return {
      placeId,
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
      url: result.url || `https://www.google.com/maps/place/?q=place_id:${placeId}`,
    }
  } catch (error) {
    console.error(`Error fetching Google Place data for ${placeId}:`, error)
    return null
  }
}

/**
 * Scheduled function to update Google ratings for all vendors
 * Runs daily at 3:00 AM Europe/Prague time
 */
export const updateGoogleRatings = functions
  .region('europe-west1')
  .pubsub
  .schedule('0 3 * * *') // Every day at 3:00 AM
  .timeZone('Europe/Prague')
  .onRun(async (context) => {
    console.log('🔄 Starting Google ratings update...')

    try {
      // Get all marketplace vendors with Google Place ID
      const vendorsSnapshot = await db
        .collection('marketplaceVendors')
        .where('google.placeId', '!=', null)
        .get()

      if (vendorsSnapshot.empty) {
        console.log('ℹ️ No vendors with Google Place ID found')
        return null
      }

      console.log(`📊 Found ${vendorsSnapshot.size} vendors to update`)

      let successCount = 0
      let errorCount = 0

      // Update each vendor
      for (const doc of vendorsSnapshot.docs) {
        const vendor = doc.data()
        const placeId = vendor.google?.placeId

        if (!placeId || !placeId.startsWith('ChIJ')) {
          console.log(`⏭️ Skipping ${vendor.name} - invalid Place ID: ${placeId}`)
          continue
        }

        console.log(`🔍 Fetching Google data for ${vendor.name} (${placeId})`)

        // Fetch Google Place data
        const googleData = await fetchGooglePlaceData(placeId)

        if (googleData) {
          // Update vendor document
          await doc.ref.update({
            'google.rating': googleData.rating,
            'google.reviewCount': googleData.userRatingsTotal,
            'google.reviews': googleData.reviews,
            'google.lastUpdated': admin.firestore.FieldValue.serverTimestamp(),
          })

          console.log(`✅ Updated ${vendor.name}: ${googleData.rating} ⭐ (${googleData.userRatingsTotal} reviews)`)
          successCount++
        } else {
          console.error(`❌ Failed to fetch Google data for ${vendor.name}`)
          errorCount++
        }

        // Rate limiting: wait 100ms between requests
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      console.log(`✨ Google ratings update complete: ${successCount} success, ${errorCount} errors`)

      return null
    } catch (error) {
      console.error('❌ Error updating Google ratings:', error)
      throw error
    }
  })

