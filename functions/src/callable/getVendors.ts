import * as functions from 'firebase-functions'
import { collections } from '../config/firebase'
import { VendorCategory } from '../types'

interface GetVendorsData {
  page?: number
  limit?: number
  category?: VendorCategory
  city?: string
  region?: string
  minPrice?: number
  maxPrice?: number
  verified?: boolean
  featured?: boolean
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// Callable function to get vendors with filtering
const getVendors = functions.https.onCall(async (data: GetVendorsData, context) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      city,
      region,
      minPrice,
      maxPrice,
      verified,
      featured,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = data

    // Validate pagination
    if (page < 1 || limit < 1 || limit > 100) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Invalid pagination parameters'
      )
    }

    let query = collections.vendors.where('active', '==', true)

    // Apply filters
    if (category) {
      query = query.where('category', '==', category)
    }

    if (city) {
      query = query.where('address.city', '==', city)
    }

    if (region) {
      query = query.where('address.region', '==', region)
    }

    if (verified !== undefined) {
      query = query.where('verified', '==', verified)
    }

    if (featured !== undefined) {
      query = query.where('featured', '==', featured)
    }

    // Apply sorting
    if (sortBy === 'name') {
      query = query.orderBy('name', sortOrder)
    } else if (sortBy === 'createdAt') {
      query = query.orderBy('createdAt', sortOrder)
    } else if (sortBy === 'rating') {
      query = query.orderBy('rating.overall', sortOrder)
    }

    // Apply pagination
    const offset = (page - 1) * limit
    query = query.limit(limit).offset(offset)

    const snapshot = await query.get()
    let vendors = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    // Apply search filter (client-side for now)
    if (search) {
      const searchTerm = search.toLowerCase()
      vendors = vendors.filter(vendor => 
        vendor.name.toLowerCase().includes(searchTerm) ||
        vendor.description.toLowerCase().includes(searchTerm) ||
        vendor.businessName.toLowerCase().includes(searchTerm) ||
        vendor.features?.some((feature: string) => feature.toLowerCase().includes(searchTerm)) ||
        vendor.specialties?.some((specialty: string) => specialty.toLowerCase().includes(searchTerm))
      )
    }

    // Apply price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      vendors = vendors.filter(vendor => {
        if (!vendor.priceRange) return true
        
        const min = minPrice !== undefined ? minPrice : 0
        const max = maxPrice !== undefined ? maxPrice : Infinity
        
        return vendor.priceRange.min >= min && vendor.priceRange.max <= max
      })
    }

    // Get total count for pagination
    const totalQuery = collections.vendors.where('active', '==', true)
    const totalSnapshot = await totalQuery.get()
    const total = totalSnapshot.size

    // Check if user has favorited any vendors
    let favoriteVendorIds: string[] = []
    if (context.auth) {
      const favoritesSnapshot = await collections.favorites
        .where('userId', '==', context.auth.uid)
        .get()
      
      favoriteVendorIds = favoritesSnapshot.docs.map(doc => doc.data().vendorId)
    }

    // Add isFavorited flag to vendors
    const vendorsWithFavorites = vendors.map(vendor => ({
      ...vendor,
      isFavorited: favoriteVendorIds.includes(vendor.id)
    }))

    return {
      success: true,
      data: {
        vendors: vendorsWithFavorites,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      }
    }
  } catch (error) {
    console.error('Get vendors error:', error)
    
    if (error instanceof functions.https.HttpsError) {
      throw error
    }
    
    throw new functions.https.HttpsError(
      'internal',
      'Failed to get vendors'
    )
  }
})

export default getVendors
