import { Request, Response } from 'express'
import { collections, serverTimestamp, FieldValue } from '../config/firebase'
import { AuthenticatedRequest } from '../middleware/auth'
import { AdminStats, VendorCategory, UserRole } from '../types'

export class AdminController {
  // Get admin dashboard statistics
  static async getStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Get user statistics
      const usersSnapshot = await collections.users.get()
      const users = usersSnapshot.docs.map(doc => doc.data())
      
      const userStats = {
        total: users.length,
        active: users.filter(user => user.active).length,
        verified: users.filter(user => user.verified).length,
        new: users.filter(user => {
          const createdAt = user.createdAt?.toDate()
          const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
          return createdAt && createdAt > dayAgo
        }).length
      }

      // Get vendor statistics
      const vendorsSnapshot = await collections.vendors.get()
      const vendors = vendorsSnapshot.docs.map(doc => doc.data())
      
      const vendorStats = {
        total: vendors.length,
        active: vendors.filter(vendor => vendor.active).length,
        verified: vendors.filter(vendor => vendor.verified).length,
        featured: vendors.filter(vendor => vendor.featured).length,
        pending: vendors.filter(vendor => !vendor.verified && vendor.active).length
      }

      // Get inquiry statistics
      const inquiriesSnapshot = await collections.inquiries.get()
      const inquiries = inquiriesSnapshot.docs.map(doc => doc.data())
      
      const inquiryStats = {
        total: inquiries.length,
        today: inquiries.filter(inquiry => {
          const createdAt = inquiry.createdAt?.toDate()
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          return createdAt && createdAt >= today
        }).length,
        pending: inquiries.filter(inquiry => inquiry.status === 'new').length
      }

      // Get review statistics
      const reviewsSnapshot = await collections.reviews.get()
      const reviews = reviewsSnapshot.docs.map(doc => doc.data())
      
      const reviewStats = {
        total: reviews.length,
        average: reviews.length > 0 
          ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
          : 0
      }

      // Get category breakdown
      const categoryStats = Object.values(VendorCategory).map(category => ({
        category,
        count: vendors.filter(vendor => vendor.category === category).length
      }))

      // Get recent activity
      const recentVendors = vendors
        .sort((a, b) => b.createdAt?.toDate() - a.createdAt?.toDate())
        .slice(0, 5)
        .map(vendor => ({
          id: vendor.id,
          name: vendor.name,
          category: vendor.category,
          verified: vendor.verified,
          createdAt: vendor.createdAt
        }))

      const recentUsers = users
        .sort((a, b) => b.createdAt?.toDate() - a.createdAt?.toDate())
        .slice(0, 5)
        .map(user => ({
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          verified: user.verified,
          createdAt: user.createdAt
        }))

      const stats: AdminStats = {
        users: userStats,
        vendors: vendorStats,
        inquiries: inquiryStats,
        reviews: reviewStats
      }

      res.json({
        success: true,
        data: {
          stats,
          categories: categoryStats,
          recent: {
            vendors: recentVendors,
            users: recentUsers
          }
        }
      })
    } catch (error) {
      console.error('Get admin stats error:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to get admin statistics'
      })
    }
  }

  // Get detailed analytics
  static async getAnalytics(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { period = '30d', startDate, endDate } = req.query

      let start: Date
      let end: Date = new Date()

      if (startDate && endDate) {
        start = new Date(startDate as string)
        end = new Date(endDate as string)
      } else {
        switch (period) {
          case '7d':
            start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            break
          case '30d':
            start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            break
          case '90d':
            start = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
            break
          case '1y':
            start = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
            break
          default:
            start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      }

      // Get analytics data for the period
      const analyticsSnapshot = await collections.analytics
        .where('date', '>=', start)
        .where('date', '<=', end)
        .orderBy('date')
        .get()

      const analyticsData = analyticsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      // Aggregate data by date
      const dailyStats = new Map()
      
      analyticsData.forEach(record => {
        const dateKey = record.date.toDate().toISOString().split('T')[0]
        
        if (!dailyStats.has(dateKey)) {
          dailyStats.set(dateKey, {
            date: dateKey,
            views: 0,
            inquiries: 0,
            favorites: 0
          })
        }
        
        const dayStats = dailyStats.get(dateKey)
        dayStats.views += record.views || 0
        dayStats.inquiries += record.inquiries || 0
        dayStats.favorites += record.favorites || 0
      })

      const chartData = Array.from(dailyStats.values()).sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      )

      res.json({
        success: true,
        data: {
          period,
          startDate: start,
          endDate: end,
          chartData,
          summary: {
            totalViews: chartData.reduce((sum, day) => sum + day.views, 0),
            totalInquiries: chartData.reduce((sum, day) => sum + day.inquiries, 0),
            totalFavorites: chartData.reduce((sum, day) => sum + day.favorites, 0)
          }
        }
      })
    } catch (error) {
      console.error('Get admin analytics error:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to get analytics data'
      })
    }
  }

  // Get all vendors for admin
  static async getVendors(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        category,
        verified,
        featured,
        active,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query

      let query = collections.vendors.orderBy(sortBy as string, sortOrder as 'asc' | 'desc')

      // Apply filters
      if (category) {
        query = query.where('category', '==', category)
      }

      if (verified !== undefined) {
        query = query.where('verified', '==', verified === 'true')
      }

      if (featured !== undefined) {
        query = query.where('featured', '==', featured === 'true')
      }

      if (active !== undefined) {
        query = query.where('active', '==', active === 'true')
      }

      // Apply pagination
      const offset = (Number(page) - 1) * Number(limit)
      query = query.limit(Number(limit)).offset(offset)

      const snapshot = await query.get()
      let vendors = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      // Apply search filter (client-side)
      if (search) {
        const searchTerm = (search as string).toLowerCase()
        vendors = vendors.filter(vendor => 
          vendor.name.toLowerCase().includes(searchTerm) ||
          vendor.businessName.toLowerCase().includes(searchTerm) ||
          vendor.email.toLowerCase().includes(searchTerm)
        )
      }

      // Get total count
      const totalSnapshot = await collections.vendors.get()
      const total = totalSnapshot.size

      res.json({
        success: true,
        data: {
          vendors,
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
      console.error('Get admin vendors error:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to get vendors'
      })
    }
  }

  // Verify vendor
  static async verifyVendor(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const { verified } = req.body

      await collections.vendors.doc(id).update({
        verified,
        updatedAt: serverTimestamp()
      })

      // Log admin action
      await collections.adminLogs.add({
        adminId: req.user!.uid,
        action: 'vendor_verify',
        targetId: id,
        details: { verified },
        timestamp: serverTimestamp()
      })

      res.json({
        success: true,
        message: `Vendor ${verified ? 'verified' : 'unverified'} successfully`
      })
    } catch (error) {
      console.error('Verify vendor error:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to update vendor verification'
      })
    }
  }

  // Feature vendor
  static async featureVendor(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const { featured } = req.body

      await collections.vendors.doc(id).update({
        featured,
        updatedAt: serverTimestamp()
      })

      // Log admin action
      await collections.adminLogs.add({
        adminId: req.user!.uid,
        action: 'vendor_feature',
        targetId: id,
        details: { featured },
        timestamp: serverTimestamp()
      })

      res.json({
        success: true,
        message: `Vendor ${featured ? 'featured' : 'unfeatured'} successfully`
      })
    } catch (error) {
      console.error('Feature vendor error:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to update vendor featured status'
      })
    }
  }

  // Set premium vendor
  static async setPremiumVendor(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const { premium } = req.body

      await collections.vendors.doc(id).update({
        premium,
        updatedAt: serverTimestamp()
      })

      res.json({
        success: true,
        message: `Vendor premium status ${premium ? 'enabled' : 'disabled'} successfully`
      })
    } catch (error) {
      console.error('Set premium vendor error:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to update vendor premium status'
      })
    }
  }

  // Activate/deactivate vendor
  static async activateVendor(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const { active } = req.body

      await collections.vendors.doc(id).update({
        active,
        updatedAt: serverTimestamp()
      })

      res.json({
        success: true,
        message: `Vendor ${active ? 'activated' : 'deactivated'} successfully`
      })
    } catch (error) {
      console.error('Activate vendor error:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to update vendor status'
      })
    }
  }

  // Delete vendor (super admin only)
  static async deleteVendor(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params

      await collections.vendors.doc(id).delete()

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

  // Get system health
  static async getSystemHealth(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Check Firestore connectivity
      let firestoreHealth = true
      try {
        await collections.users.limit(1).get()
      } catch {
        firestoreHealth = false
      }

      // Check Storage connectivity
      let storageHealth = true
      try {
        // Simple bucket access test
        const { bucket } = await import('../config/firebase')
        await bucket.getMetadata()
      } catch {
        storageHealth = false
      }

      const overall = firestoreHealth && storageHealth

      res.json({
        success: true,
        data: {
          firestore: firestoreHealth,
          storage: storageHealth,
          overall,
          timestamp: new Date().toISOString()
        }
      })
    } catch (error) {
      console.error('Get system health error:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to get system health'
      })
    }
  }

  // Placeholder methods for other admin functions
  static async getVendor(req: AuthenticatedRequest, res: Response): Promise<void> {
    res.json({ success: true, message: 'Not implemented yet' })
  }

  static async getUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
    res.json({ success: true, message: 'Not implemented yet' })
  }

  static async getUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    res.json({ success: true, message: 'Not implemented yet' })
  }

  static async activateUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    res.json({ success: true, message: 'Not implemented yet' })
  }

  static async verifyUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    res.json({ success: true, message: 'Not implemented yet' })
  }

  static async changeUserRole(req: AuthenticatedRequest, res: Response): Promise<void> {
    res.json({ success: true, message: 'Not implemented yet' })
  }

  static async deleteUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    res.json({ success: true, message: 'Not implemented yet' })
  }

  static async getReviews(req: AuthenticatedRequest, res: Response): Promise<void> {
    res.json({ success: true, message: 'Not implemented yet' })
  }

  static async verifyReview(req: AuthenticatedRequest, res: Response): Promise<void> {
    res.json({ success: true, message: 'Not implemented yet' })
  }

  static async deleteReview(req: AuthenticatedRequest, res: Response): Promise<void> {
    res.json({ success: true, message: 'Not implemented yet' })
  }

  static async getInquiries(req: AuthenticatedRequest, res: Response): Promise<void> {
    res.json({ success: true, message: 'Not implemented yet' })
  }

  static async getInquiry(req: AuthenticatedRequest, res: Response): Promise<void> {
    res.json({ success: true, message: 'Not implemented yet' })
  }

  static async getSystemLogs(req: AuthenticatedRequest, res: Response): Promise<void> {
    res.json({ success: true, message: 'Not implemented yet' })
  }

  static async clearCache(req: AuthenticatedRequest, res: Response): Promise<void> {
    res.json({ success: true, message: 'Cache cleared (no cache to clear in Firebase)' })
  }

  static async testEmail(req: AuthenticatedRequest, res: Response): Promise<void> {
    res.json({ success: true, message: 'Not implemented yet' })
  }

  static async exportVendors(req: AuthenticatedRequest, res: Response): Promise<void> {
    res.json({ success: true, message: 'Not implemented yet' })
  }

  static async exportUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
    res.json({ success: true, message: 'Not implemented yet' })
  }

  static async exportAnalytics(req: AuthenticatedRequest, res: Response): Promise<void> {
    res.json({ success: true, message: 'Not implemented yet' })
  }

  static async sendNotification(req: AuthenticatedRequest, res: Response): Promise<void> {
    res.json({ success: true, message: 'Not implemented yet' })
  }
}
