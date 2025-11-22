/**
 * Callable Function: Refresh Google Rating
 * 
 * Manually refresh Google Place data for a specific vendor
 * Only accessible by admin users
 * Rate limited to prevent abuse (max 1 refresh per vendor per 24 hours)
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

    console.log(`🔍 Fetching Google Place data from: ${url.toString().replace(apiKey, 'API_KEY_HIDDEN')}`)

    const response = await fetch(url.toString())
    const data = await response.json()

    console.log(`📦 Google Places API response:`, JSON.stringify(data, null, 2))

    if (data.status !== 'OK') {
      console.error(`❌ Google Places API error for ${placeId}:`, data.status)
      if (data.error_message) {
        console.error(`📝 Error message:`, data.error_message)
      }
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
 * Remove undefined values from object recursively
 */
function removeUndefined(obj: any): any {
  if (obj === null || obj === undefined) {
    return null
  }

  if (Array.isArray(obj)) {
    return obj.map(item => removeUndefined(item)).filter(item => item !== null)
  }

  if (typeof obj === 'object') {
    const cleaned: any = {}
    for (const key in obj) {
      const value = removeUndefined(obj[key])
      if (value !== null && value !== undefined) {
        cleaned[key] = value
      }
    }
    return cleaned
  }

  return obj
}

/**
 * Callable function to manually refresh Google rating for a vendor
 */
export default functions
  .region('europe-west1')
  .https
  .onCall(async (data, context) => {
    // Check authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated to refresh Google ratings'
      )
    }

    // Check if user is admin (check custom claims first, then user document)
    const isAdminClaim = context.auth.token.isAdmin === true ||
                         context.auth.token.role === 'admin' ||
                         context.auth.token.role === 'super_admin'

    if (!isAdminClaim) {
      // Fallback: check user document
      const userDoc = await db.collection('users').doc(context.auth.uid).get()
      const userData = userDoc.data()

      if (!userData || (userData.role !== 'admin' && userData.role !== 'super_admin')) {
        throw new functions.https.HttpsError(
          'permission-denied',
          'Only admins can manually refresh Google ratings'
        )
      }
    }

    const { vendorId } = data

    if (!vendorId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Vendor ID is required'
      )
    }

    try {
      // Get vendor document
      const vendorDoc = await db.collection('marketplaceVendors').doc(vendorId).get()

      if (!vendorDoc.exists) {
        throw new functions.https.HttpsError(
          'not-found',
          'Vendor not found'
        )
      }

      const vendor = vendorDoc.data()
      const placeId = vendor?.google?.placeId

      if (!placeId || !placeId.startsWith('ChIJ')) {
        throw new functions.https.HttpsError(
          'failed-precondition',
          'Vendor does not have a valid Google Place ID'
        )
      }

      // Check rate limiting (max 1 refresh per 24 hours)
      const lastUpdated = vendor?.google?.lastUpdated?.toDate()
      if (lastUpdated) {
        const hoursSinceUpdate = (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60)
        if (hoursSinceUpdate < 24) {
          throw new functions.https.HttpsError(
            'resource-exhausted',
            `Google data was updated ${Math.floor(hoursSinceUpdate)} hours ago. Please wait ${Math.ceil(24 - hoursSinceUpdate)} more hours.`
          )
        }
      }

      // Fetch Google Place data
      console.log(`🔍 Admin refresh: Fetching Google data for ${vendor.name} (${placeId})`)
      const googleData = await fetchGooglePlaceData(placeId)

      if (!googleData) {
        throw new functions.https.HttpsError(
          'internal',
          'Failed to fetch Google Place data. Please check the Place ID.'
        )
      }

      // Clean reviews data (remove undefined values)
      const cleanedReviews = removeUndefined(googleData.reviews)

      // Update vendor document
      await vendorDoc.ref.update({
        'google.rating': googleData.rating,
        'google.reviewCount': googleData.userRatingsTotal,
        'google.reviews': cleanedReviews,
        'google.lastUpdated': admin.firestore.FieldValue.serverTimestamp(),
      })

      console.log(`✅ Admin refresh successful for ${vendor.name}: ${googleData.rating} ⭐ (${googleData.userRatingsTotal} reviews)`)

      return {
        success: true,
        data: {
          rating: googleData.rating,
          reviewCount: googleData.userRatingsTotal,
          reviewsCount: googleData.reviews.length,
        },
        message: 'Google rating refreshed successfully',
      }
    } catch (error: any) {
      console.error('❌ Error refreshing Google rating:', error)
      
      if (error instanceof functions.https.HttpsError) {
        throw error
      }

      throw new functions.https.HttpsError(
        'internal',
        'Failed to refresh Google rating'
      )
    }
  })

