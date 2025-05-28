import { Request, Response } from 'express'
import { prisma } from '@/config/database'
import { logger } from '@/config/logger'
import { AuthenticatedRequest } from '@/middleware/auth'
import { RedisService } from '@/config/redis'
import { EmailService } from '@/services/emailService'
import { DatabaseService } from '@/config/database'
import { CloudinaryService } from '@/config/cloudinary'

export class AdminController {
  // Get admin dashboard statistics
  static async getStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Check cache first
      const cacheKey = 'admin:stats'
      const cached = await RedisService.get(cacheKey)

      if (cached) {
        res.json(JSON.parse(cached))
        return
      }

      // Get statistics from database
      const [
        totalVendors,
        activeVendors,
        verifiedVendors,
        featuredVendors,
        premiumVendors,
        pendingVendors,
        totalUsers,
        activeUsers,
        verifiedUsers,
        totalReviews,
        totalInquiries,
        todayInquiries,
        categoryStats
      ] = await Promise.all([
        prisma.vendor.count(),
        prisma.vendor.count({ where: { active: true } }),
        prisma.vendor.count({ where: { verified: true } }),
        prisma.vendor.count({ where: { featured: true } }),
        prisma.vendor.count({ where: { premium: true } }),
        prisma.vendor.count({ where: { verified: false, active: true } }),
        prisma.user.count(),
        prisma.user.count({ where: { active: true } }),
        prisma.user.count({ where: { verified: true } }),
        prisma.review.count(),
        prisma.inquiry.count(),
        prisma.inquiry.count({
          where: {
            createdAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0))
            }
          }
        }),
        prisma.vendor.groupBy({
          by: ['category'],
          _count: { category: true },
          orderBy: { _count: { category: 'desc' } }
        })
      ])

      // Get recent activity
      const recentVendors = await prisma.vendor.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          category: true,
          verified: true,
          createdAt: true
        }
      })

      const recentUsers = await prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          verified: true,
          createdAt: true
        }
      })

      const recentInquiries = await prisma.inquiry.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          vendor: {
            select: { name: true }
          }
        }
      })

      const stats = {
        success: true,
        data: {
          overview: {
            totalVendors,
            activeVendors,
            verifiedVendors,
            featuredVendors,
            premiumVendors,
            pendingVendors,
            totalUsers,
            activeUsers,
            verifiedUsers,
            totalReviews,
            totalInquiries,
            todayInquiries
          },
          categories: categoryStats.map(stat => ({
            category: stat.category,
            count: stat._count.category
          })),
          recent: {
            vendors: recentVendors,
            users: recentUsers,
            inquiries: recentInquiries
          }
        }
      }

      // Cache for 5 minutes
      await RedisService.set(cacheKey, JSON.stringify(stats), 300)

      res.json(stats)
    } catch (error) {
      logger.error('Get admin stats error:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to get admin statistics'
      })
    }
  }

  // Get detailed analytics
  static async getAnalytics(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { period = '30d' } = req.query

      let startDate: Date
      const endDate = new Date()

      switch (period) {
        case '7d':
          startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          break
        case '30d':
          startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          break
        case '90d':
          startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
          break
        case '1y':
          startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
          break
        default:
          startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      }

      // Get analytics data
      const [
        vendorGrowth,
        userGrowth,
        inquiryTrends,
        topVendors,
        categoryPerformance
      ] = await Promise.all([
        // Vendor registration growth
        prisma.$queryRaw`
          SELECT DATE(created_at) as date, COUNT(*) as count
          FROM vendors
          WHERE created_at >= ${startDate} AND created_at <= ${endDate}
          GROUP BY DATE(created_at)
          ORDER BY date
        `,

        // User registration growth
        prisma.$queryRaw`
          SELECT DATE(created_at) as date, COUNT(*) as count
          FROM users
          WHERE created_at >= ${startDate} AND created_at <= ${endDate}
          GROUP BY DATE(created_at)
          ORDER BY date
        `,

        // Inquiry trends
        prisma.$queryRaw`
          SELECT DATE(created_at) as date, COUNT(*) as count
          FROM inquiries
          WHERE created_at >= ${startDate} AND created_at <= ${endDate}
          GROUP BY DATE(created_at)
          ORDER BY date
        `,

        // Top performing vendors
        prisma.vendor.findMany({
          take: 10,
          include: {
            _count: {
              select: {
                inquiries: true,
                reviews: true,
                favorites: true
              }
            },
            reviews: {
              select: { rating: true }
            }
          },
          orderBy: {
            inquiries: {
              _count: 'desc'
            }
          }
        }),

        // Category performance
        prisma.vendor.groupBy({
          by: ['category'],
          _count: {
            inquiries: true,
            reviews: true,
            favorites: true
          },
          _avg: {
            reviews: {
              rating: true
            }
          }
        })
      ])

      // Calculate average ratings for top vendors
      const topVendorsWithRatings = topVendors.map(vendor => {
        const avgRating = vendor.reviews.length > 0
          ? vendor.reviews.reduce((sum, review) => sum + review.rating, 0) / vendor.reviews.length
          : 0

        return {
          id: vendor.id,
          name: vendor.name,
          category: vendor.category,
          verified: vendor.verified,
          featured: vendor.featured,
          inquiries: vendor._count.inquiries,
          reviews: vendor._count.reviews,
          favorites: vendor._count.favorites,
          avgRating: Math.round(avgRating * 10) / 10
        }
      })

      res.json({
        success: true,
        data: {
          period,
          startDate,
          endDate,
          growth: {
            vendors: vendorGrowth,
            users: userGrowth
          },
          trends: {
            inquiries: inquiryTrends
          },
          topVendors: topVendorsWithRatings,
          categories: categoryPerformance
        }
      })
    } catch (error) {
      logger.error('Get admin analytics error:', error)
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

      const skip = (Number(page) - 1) * Number(limit)
      const take = Number(limit)

      // Build where clause
      const where: any = {}

      if (search) {
        where.OR = [
          { name: { contains: search as string, mode: 'insensitive' } },
          { businessName: { contains: search as string, mode: 'insensitive' } },
          { email: { contains: search as string, mode: 'insensitive' } }
        ]
      }

      if (category) {
        where.category = category
      }

      if (verified !== undefined) {
        where.verified = verified === 'true'
      }

      if (featured !== undefined) {
        where.featured = featured === 'true'
      }

      if (active !== undefined) {
        where.active = active === 'true'
      }

      // Build order by
      const orderBy: any = {}
      orderBy[sortBy as string] = sortOrder

      const [vendors, total] = await Promise.all([
        prisma.vendor.findMany({
          where,
          skip,
          take,
          orderBy,
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                verified: true
              }
            },
            address: true,
            _count: {
              select: {
                inquiries: true,
                reviews: true,
                favorites: true
              }
            }
          }
        }),
        prisma.vendor.count({ where })
      ])

      res.json({
        success: true,
        data: {
          vendors,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
          }
        }
      })
    } catch (error) {
      logger.error('Get admin vendors error:', error)
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
      const { verified = true } = req.body

      const vendor = await prisma.vendor.findUnique({
        where: { id },
        include: { user: true }
      })

      if (!vendor) {
        res.status(404).json({
          success: false,
          message: 'Vendor not found'
        })
        return
      }

      // Update vendor verification status
      const updatedVendor = await prisma.vendor.update({
        where: { id },
        data: { verified }
      })

      // Send notification email if verified
      if (verified && !vendor.verified) {
        try {
          await EmailService.sendVendorWelcomeEmail(
            vendor.user.email,
            vendor.name,
            true
          )
        } catch (emailError) {
          logger.error('Failed to send vendor verification email:', emailError)
        }
      }

      // Emit real-time update
      const io = req.app.get('io')
      io.to('admin').emit('vendor_verified', {
        vendorId: id,
        verified,
        vendorName: vendor.name
      })

      logger.info('Vendor verification updated:', {
        vendorId: id,
        verified,
        adminId: req.user!.id
      })

      res.json({
        success: true,
        message: `Vendor ${verified ? 'verified' : 'unverified'} successfully`,
        data: { vendor: updatedVendor }
      })
    } catch (error) {
      logger.error('Verify vendor error:', error)
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
      const { featured = true } = req.body

      const updatedVendor = await prisma.vendor.update({
        where: { id },
        data: { featured }
      })

      // Emit real-time update
      const io = req.app.get('io')
      io.to('admin').emit('vendor_featured', {
        vendorId: id,
        featured
      })

      res.json({
        success: true,
        message: `Vendor ${featured ? 'featured' : 'unfeatured'} successfully`,
        data: { vendor: updatedVendor }
      })
    } catch (error) {
      logger.error('Feature vendor error:', error)
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
      const { premium = true } = req.body

      const updatedVendor = await prisma.vendor.update({
        where: { id },
        data: { premium }
      })

      res.json({
        success: true,
        message: `Vendor premium status ${premium ? 'enabled' : 'disabled'} successfully`,
        data: { vendor: updatedVendor }
      })
    } catch (error) {
      logger.error('Set premium vendor error:', error)
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
      const { active = true } = req.body

      const updatedVendor = await prisma.vendor.update({
        where: { id },
        data: { active }
      })

      res.json({
        success: true,
        message: `Vendor ${active ? 'activated' : 'deactivated'} successfully`,
        data: { vendor: updatedVendor }
      })
    } catch (error) {
      logger.error('Activate vendor error:', error)
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

      await prisma.vendor.delete({
        where: { id }
      })

      res.json({
        success: true,
        message: 'Vendor deleted successfully'
      })
    } catch (error) {
      logger.error('Delete vendor error:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to delete vendor'
      })
    }
  }

  // Get system health
  static async getSystemHealth(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const dbHealth = await DatabaseService.healthCheck()
      const redisHealth = RedisService.isConnected()
      const emailHealth = await EmailService.testConnection()
      const cloudinaryHealth = await CloudinaryService.healthCheck()

      res.json({
        success: true,
        data: {
          database: dbHealth,
          redis: redisHealth,
          email: emailHealth,
          cloudinary: cloudinaryHealth,
          overall: dbHealth && redisHealth && emailHealth && cloudinaryHealth
        }
      })
    } catch (error) {
      logger.error('Get system health error:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to get system health'
      })
    }
  }

  // Clear cache
  static async clearCache(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Clear all cache keys (in production, you'd want to be more selective)
      const client = RedisService.getInstance()
      await client.flushAll()

      logger.info('Cache cleared by admin:', { adminId: req.user!.id })

      res.json({
        success: true,
        message: 'Cache cleared successfully'
      })
    } catch (error) {
      logger.error('Clear cache error:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to clear cache'
      })
    }
  }

  // Test email
  static async testEmail(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { email } = req.body

      await EmailService.sendVerificationEmail(
        email || req.user!.email,
        'test-token-123'
      )

      res.json({
        success: true,
        message: 'Test email sent successfully'
      })
    } catch (error) {
      logger.error('Test email error:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to send test email'
      })
    }
  }

  // Placeholder methods for other admin functions
  static async getUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
    // TODO: Implement user management
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

  static async exportVendors(req: AuthenticatedRequest, res: Response): Promise<void> {
    res.json({ success: true, message: 'Not implemented yet' })
  }

  static async exportUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
    res.json({ success: true, message: 'Not implemented yet' })
  }

  static async exportAnalytics(req: AuthenticatedRequest, res: Response): Promise<void> {
    res.json({ success: true, message: 'Not implemented yet' })
  }

  static async getVendor(req: AuthenticatedRequest, res: Response): Promise<void> {
    res.json({ success: true, message: 'Not implemented yet' })
  }
}
