import { Request, Response } from 'express'
import { collections, serverTimestamp, FieldValue } from '../config/firebase'
import { AuthenticatedRequest } from '../middleware/auth'
import { Vendor, VendorCategory, Service, Review, Inquiry, Favorite } from '../types'
import slugify from 'slugify'

export class VendorController {
  // Get vendors with filtering and pagination
  static async getVendors(req: Request, res: Response): Promise<void> {
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
      } = req.query

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
        query = query.where('verified', '==', verified === 'true')
      }

      if (featured !== undefined) {
        query = query.where('featured', '==', featured === 'true')
      }

      // Apply sorting
      if (sortBy === 'name') {
        query = query.orderBy('name', sortOrder as 'asc' | 'desc')
      } else if (sortBy === 'createdAt') {
        query = query.orderBy('createdAt', sortOrder as 'asc' | 'desc')
      } else if (sortBy === 'rating') {
        query = query.orderBy('rating.overall', sortOrder as 'asc' | 'desc')
      }

      // Apply pagination
      const offset = (Number(page) - 1) * Number(limit)
      query = query.limit(Number(limit)).offset(offset)

      const snapshot = await query.get()
      const vendors = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      // Apply search filter (client-side for now, could be improved with Algolia)
      let filteredVendors = vendors
      if (search) {
        const searchTerm = (search as string).toLowerCase()
        filteredVendors = vendors.filter(vendor => 
          vendor.name.toLowerCase().includes(searchTerm) ||
          vendor.description.toLowerCase().includes(searchTerm) ||
          vendor.businessName.toLowerCase().includes(searchTerm)
        )
      }

      // Apply price range filter
      if (minPrice || maxPrice) {
        filteredVendors = filteredVendors.filter(vendor => {
          if (!vendor.priceRange) return true
          
          const min = minPrice ? Number(minPrice) : 0
          const max = maxPrice ? Number(maxPrice) : Infinity
          
          return vendor.priceRange.min >= min && vendor.priceRange.max <= max
        })
      }

      // Get total count for pagination
      const totalQuery = collections.vendors.where('active', '==', true)
      const totalSnapshot = await totalQuery.get()
      const total = totalSnapshot.size

      res.json({
        success: true,
        data: {
          vendors: filteredVendors,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit)),
            hasNext: Number(page) * Number(limit) < total,
            hasPrev: Number(page) > 1
          }
        }
      })
    } catch (error) {
      console.error('Get vendors error:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to get vendors'
      })
    }
  }

  // Get vendor by ID
  static async getVendor(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const userId = req.user?.uid

      const vendorDoc = await collections.vendors.doc(id).get()

      if (!vendorDoc.exists) {
        res.status(404).json({
          success: false,
          message: 'Vendor not found'
        })
        return
      }

      const vendorData = vendorDoc.data() as Vendor

      // Check if vendor is active (unless it's the owner or admin)
      if (!vendorData.active && vendorData.userId !== userId && req.user?.role !== 'admin') {
        res.status(404).json({
          success: false,
          message: 'Vendor not found'
        })
        return
      }

      // Get services
      const servicesSnapshot = await collections.services
        .where('vendorId', '==', id)
        .where('active', '==', true)
        .orderBy('sortOrder')
        .get()

      const services = servicesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      // Get recent reviews
      const reviewsSnapshot = await collections.reviews
        .where('vendorId', '==', id)
        .where('verified', '==', true)
        .orderBy('createdAt', 'desc')
        .limit(5)
        .get()

      const reviews = reviewsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      // Check if user has favorited this vendor
      let isFavorited = false
      if (userId) {
        const favoriteDoc = await collections.favorites
          .where('userId', '==', userId)
          .where('vendorId', '==', id)
          .get()
        
        isFavorited = !favoriteDoc.empty
      }

      // Track view
      if (userId) {
        await VendorController.trackView(id, userId)
      }

      res.json({
        success: true,
        data: {
          vendor: {
            id: vendorDoc.id,
            ...vendorData,
            services,
            reviews,
            isFavorited
          }
        }
      })
    } catch (error) {
      console.error('Get vendor error:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to get vendor'
      })
    }
  }

  // Create vendor
  static async createVendor(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        })
        return
      }

      // Check if user already has a vendor profile
      const existingVendorSnapshot = await collections.vendors
        .where('userId', '==', req.user.uid)
        .get()

      if (!existingVendorSnapshot.empty) {
        res.status(400).json({
          success: false,
          message: 'User already has a vendor profile'
        })
        return
      }

      const {
        name,
        category,
        description,
        shortDescription,
        businessName,
        businessId,
        website,
        email,
        phone,
        workingRadius = 50,
        address,
        priceRange,
        features = [],
        specialties = []
      } = req.body

      // Generate unique slug
      let slug = slugify(name, { lower: true, strict: true })
      let slugExists = true
      let counter = 1

      while (slugExists) {
        const slugQuery = await collections.vendors.where('slug', '==', slug).get()
        if (slugQuery.empty) {
          slugExists = false
        } else {
          slug = `${slugify(name, { lower: true, strict: true })}-${counter}`
          counter++
        }
      }

      const vendorData: Omit<Vendor, 'id'> = {
        userId: req.user.uid,
        name,
        slug,
        category: category as VendorCategory,
        description,
        shortDescription,
        businessName,
        businessId: businessId || null,
        website: website || null,
        email,
        phone,
        workingRadius,
        verified: req.user.role === 'admin' || req.user.role === 'super_admin',
        featured: false,
        premium: false,
        active: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        address,
        priceRange: priceRange || null,
        images: [],
        portfolioImages: [],
        features,
        specialties,
        availability: {
          weekdays: [true, true, true, true, true, true, true],
          timeSlots: [],
          blackoutDates: [],
          advanceBooking: 30
        },
        rating: {
          overall: 0,
          count: 0,
          breakdown: {
            quality: 0,
            communication: 0,
            value: 0,
            professionalism: 0
          }
        },
        stats: {
          views: 0,
          inquiries: 0,
          bookings: 0,
          favorites: 0,
          responseRate: 0,
          responseTime: 0
        }
      }

      const vendorRef = await collections.vendors.add(vendorData)

      res.status(201).json({
        success: true,
        message: 'Vendor created successfully',
        data: {
          vendor: {
            id: vendorRef.id,
            ...vendorData
          }
        }
      })
    } catch (error) {
      console.error('Create vendor error:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to create vendor'
      })
    }
  }

  // Update vendor
  static async updateVendor(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const updates = req.body

      // Remove undefined values
      const cleanUpdates = Object.fromEntries(
        Object.entries(updates).filter(([_, value]) => value !== undefined)
      )

      cleanUpdates.updatedAt = serverTimestamp()

      await collections.vendors.doc(id).update(cleanUpdates)

      res.json({
        success: true,
        message: 'Vendor updated successfully'
      })
    } catch (error) {
      console.error('Update vendor error:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to update vendor'
      })
    }
  }

  // Delete vendor (soft delete)
  static async deleteVendor(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params

      await collections.vendors.doc(id).update({
        active: false,
        updatedAt: serverTimestamp()
      })

      res.json({
        success: true,
        message: 'Vendor deleted successfully'
      })
    } catch (error) {
      console.error('Delete vendor error:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to delete vendor'
      })
    }
  }

  // Get vendor categories with counts
  static async getCategories(req: Request, res: Response): Promise<void> {
    try {
      const categories = Object.values(VendorCategory)
      const categoryCounts: { [key: string]: number } = {}

      for (const category of categories) {
        const snapshot = await collections.vendors
          .where('category', '==', category)
          .where('active', '==', true)
          .get()
        
        categoryCounts[category] = snapshot.size
      }

      res.json({
        success: true,
        data: {
          categories: categories.map(category => ({
            value: category,
            label: category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' '),
            count: categoryCounts[category] || 0
          }))
        }
      })
    } catch (error) {
      console.error('Get categories error:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to get categories'
      })
    }
  }

  // Get search suggestions
  static async getSearchSuggestions(req: Request, res: Response): Promise<void> {
    try {
      const { q } = req.query
      const searchTerm = (q as string).toLowerCase()

      // Get vendors matching the search term
      const vendorsSnapshot = await collections.vendors
        .where('active', '==', true)
        .limit(10)
        .get()

      const suggestions = vendorsSnapshot.docs
        .map(doc => doc.data())
        .filter(vendor => 
          vendor.name.toLowerCase().includes(searchTerm) ||
          vendor.businessName.toLowerCase().includes(searchTerm)
        )
        .map(vendor => ({
          type: 'vendor',
          value: vendor.name,
          category: vendor.category
        }))
        .slice(0, 5)

      // Add category suggestions
      const categories = Object.values(VendorCategory)
        .filter(category => category.includes(searchTerm))
        .map(category => ({
          type: 'category',
          value: category,
          category: null
        }))
        .slice(0, 3)

      res.json({
        success: true,
        data: {
          suggestions: [...suggestions, ...categories]
        }
      })
    } catch (error) {
      console.error('Get search suggestions error:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to get search suggestions'
      })
    }
  }

  // Track vendor view for analytics
  private static async trackView(vendorId: string, userId?: string): Promise<void> {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const analyticsRef = collections.analytics.doc(`${vendorId}_${today.toISOString().split('T')[0]}`)
      
      await analyticsRef.set({
        vendorId,
        date: today,
        views: FieldValue.increment(1)
      }, { merge: true })

      // Update vendor stats
      await collections.vendors.doc(vendorId).update({
        'stats.views': FieldValue.increment(1)
      })
    } catch (error) {
      console.error('Track view error:', error)
      // Don't fail the request if analytics fail
    }
  }

  // Placeholder methods for other vendor operations
  static async getVendorServices(req: Request, res: Response): Promise<void> {
    res.json({ success: true, message: 'Not implemented yet' })
  }

  static async createService(req: AuthenticatedRequest, res: Response): Promise<void> {
    res.json({ success: true, message: 'Not implemented yet' })
  }

  static async updateService(req: AuthenticatedRequest, res: Response): Promise<void> {
    res.json({ success: true, message: 'Not implemented yet' })
  }

  static async deleteService(req: AuthenticatedRequest, res: Response): Promise<void> {
    res.json({ success: true, message: 'Not implemented yet' })
  }

  static async uploadImages(req: AuthenticatedRequest, res: Response): Promise<void> {
    res.json({ success: true, message: 'Not implemented yet' })
  }

  static async deleteImage(req: AuthenticatedRequest, res: Response): Promise<void> {
    res.json({ success: true, message: 'Not implemented yet' })
  }

  static async reorderImages(req: AuthenticatedRequest, res: Response): Promise<void> {
    res.json({ success: true, message: 'Not implemented yet' })
  }

  static async getVendorReviews(req: Request, res: Response): Promise<void> {
    res.json({ success: true, message: 'Not implemented yet' })
  }

  static async createReview(req: AuthenticatedRequest, res: Response): Promise<void> {
    res.json({ success: true, message: 'Not implemented yet' })
  }

  static async toggleFavorite(req: AuthenticatedRequest, res: Response): Promise<void> {
    res.json({ success: true, message: 'Not implemented yet' })
  }

  static async getMyFavorites(req: AuthenticatedRequest, res: Response): Promise<void> {
    res.json({ success: true, message: 'Not implemented yet' })
  }

  static async createInquiry(req: AuthenticatedRequest, res: Response): Promise<void> {
    res.json({ success: true, message: 'Not implemented yet' })
  }

  static async getVendorInquiries(req: AuthenticatedRequest, res: Response): Promise<void> {
    res.json({ success: true, message: 'Not implemented yet' })
  }

  static async updateInquiry(req: AuthenticatedRequest, res: Response): Promise<void> {
    res.json({ success: true, message: 'Not implemented yet' })
  }

  static async getAnalytics(req: AuthenticatedRequest, res: Response): Promise<void> {
    res.json({ success: true, message: 'Not implemented yet' })
  }
}
