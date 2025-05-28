import { Request, Response } from 'express'
import { prisma } from '@/config/database'
import { logger } from '@/config/logger'
import { AuthenticatedRequest } from '@/middleware/auth'
import { VendorCategory, Prisma } from '@prisma/client'
import { RedisService } from '@/config/redis'
import slugify from 'slugify'

export class VendorController {
  // Get all vendors with filtering and pagination
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

      const skip = (Number(page) - 1) * Number(limit)
      const take = Number(limit)

      // Build where clause
      const where: Prisma.VendorWhereInput = {
        active: true
      }

      if (category) {
        where.category = category as VendorCategory
      }

      if (city) {
        where.address = {
          city: {
            contains: city as string,
            mode: 'insensitive'
          }
        }
      }

      if (region) {
        where.address = {
          ...where.address,
          region: {
            contains: region as string,
            mode: 'insensitive'
          }
        }
      }

      if (verified !== undefined) {
        where.verified = verified === 'true'
      }

      if (featured !== undefined) {
        where.featured = featured === 'true'
      }

      if (minPrice || maxPrice) {
        where.priceRange = {}
        if (minPrice) {
          where.priceRange.min = { gte: Number(minPrice) }
        }
        if (maxPrice) {
          where.priceRange.max = { lte: Number(maxPrice) }
        }
      }

      if (search) {
        where.OR = [
          {
            name: {
              contains: search as string,
              mode: 'insensitive'
            }
          },
          {
            description: {
              contains: search as string,
              mode: 'insensitive'
            }
          },
          {
            businessName: {
              contains: search as string,
              mode: 'insensitive'
            }
          }
        ]
      }

      // Build order by clause
      const orderBy: Prisma.VendorOrderByWithRelationInput = {}
      if (sortBy === 'name') {
        orderBy.name = sortOrder as 'asc' | 'desc'
      } else if (sortBy === 'rating') {
        // For rating, we'll need to calculate average rating
        orderBy.createdAt = sortOrder as 'asc' | 'desc' // Fallback for now
      } else {
        orderBy[sortBy as keyof Prisma.VendorOrderByWithRelationInput] = sortOrder as 'asc' | 'desc'
      }

      // Check cache first
      const cacheKey = `vendors:${JSON.stringify({ page, limit, category, city, region, minPrice, maxPrice, verified, featured, search, sortBy, sortOrder })}`
      const cached = await RedisService.get(cacheKey)

      if (cached) {
        res.json(JSON.parse(cached))
        return
      }

      // Get vendors with relations
      const [vendors, total] = await Promise.all([
        prisma.vendor.findMany({
          where,
          skip,
          take,
          orderBy,
          include: {
            address: true,
            images: {
              orderBy: { sortOrder: 'asc' },
              take: 3
            },
            portfolioImages: {
              orderBy: { sortOrder: 'asc' },
              take: 6
            },
            priceRange: true,
            features: true,
            specialties: true,
            reviews: {
              select: {
                rating: true,
                quality: true,
                communication: true,
                value: true,
                professionalism: true
              }
            },
            _count: {
              select: {
                reviews: true,
                favorites: true
              }
            }
          }
        }),
        prisma.vendor.count({ where })
      ])

      // Calculate ratings for each vendor
      const vendorsWithRatings = vendors.map(vendor => {
        const reviews = vendor.reviews
        const reviewCount = reviews.length

        let overallRating = 0
        let qualityRating = 0
        let communicationRating = 0
        let valueRating = 0
        let professionalismRating = 0

        if (reviewCount > 0) {
          overallRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
          qualityRating = reviews.reduce((sum, review) => sum + review.quality, 0) / reviewCount
          communicationRating = reviews.reduce((sum, review) => sum + review.communication, 0) / reviewCount
          valueRating = reviews.reduce((sum, review) => sum + review.value, 0) / reviewCount
          professionalismRating = reviews.reduce((sum, review) => sum + review.professionalism, 0) / reviewCount
        }

        const { reviews: _, ...vendorWithoutReviews } = vendor

        return {
          ...vendorWithoutReviews,
          rating: {
            overall: Math.round(overallRating * 10) / 10,
            count: reviewCount,
            breakdown: {
              quality: Math.round(qualityRating * 10) / 10,
              communication: Math.round(communicationRating * 10) / 10,
              value: Math.round(valueRating * 10) / 10,
              professionalism: Math.round(professionalismRating * 10) / 10
            }
          },
          favoriteCount: vendor._count.favorites
        }
      })

      const result = {
        success: true,
        data: {
          vendors: vendorsWithRatings,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
          }
        }
      }

      // Cache for 5 minutes
      await RedisService.set(cacheKey, JSON.stringify(result), 300)

      res.json(result)
    } catch (error) {
      logger.error('Get vendors error:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to get vendors'
      })
    }
  }

  // Get vendor by ID or slug
  static async getVendor(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const userId = (req as AuthenticatedRequest).user?.id

      // Check cache first
      const cacheKey = `vendor:${id}`
      const cached = await RedisService.get(cacheKey)

      if (cached) {
        const vendor = JSON.parse(cached)

        // Track view if not cached
        if (userId) {
          VendorController.trackView(id, userId)
        }

        res.json(vendor)
        return
      }

      // Find vendor by ID or slug
      const vendor = await prisma.vendor.findFirst({
        where: {
          OR: [
            { id },
            { slug: id }
          ],
          active: true
        },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              phone: true
            }
          },
          address: true,
          services: {
            where: { active: true },
            orderBy: { sortOrder: 'asc' },
            include: {
              includes: {
                orderBy: { sortOrder: 'asc' }
              }
            }
          },
          images: {
            orderBy: { sortOrder: 'asc' }
          },
          portfolioImages: {
            orderBy: { sortOrder: 'asc' }
          },
          priceRange: true,
          features: true,
          specialties: true,
          availability: true,
          reviews: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true
                }
              }
            },
            orderBy: { createdAt: 'desc' }
          },
          _count: {
            select: {
              reviews: true,
              favorites: true
            }
          }
        }
      })

      if (!vendor) {
        res.status(404).json({
          success: false,
          message: 'Vendor not found'
        })
        return
      }

      // Calculate ratings
      const reviews = vendor.reviews
      const reviewCount = reviews.length

      let overallRating = 0
      let qualityRating = 0
      let communicationRating = 0
      let valueRating = 0
      let professionalismRating = 0

      if (reviewCount > 0) {
        overallRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
        qualityRating = reviews.reduce((sum, review) => sum + review.quality, 0) / reviewCount
        communicationRating = reviews.reduce((sum, review) => sum + review.communication, 0) / reviewCount
        valueRating = reviews.reduce((sum, review) => sum + review.value, 0) / reviewCount
        professionalismRating = reviews.reduce((sum, review) => sum + review.professionalism, 0) / reviewCount
      }

      // Check if user has favorited this vendor
      let isFavorited = false
      if (userId) {
        const favorite = await prisma.favorite.findUnique({
          where: {
            userId_vendorId: {
              userId,
              vendorId: vendor.id
            }
          }
        })
        isFavorited = !!favorite
      }

      const result = {
        success: true,
        data: {
          vendor: {
            ...vendor,
            rating: {
              overall: Math.round(overallRating * 10) / 10,
              count: reviewCount,
              breakdown: {
                quality: Math.round(qualityRating * 10) / 10,
                communication: Math.round(communicationRating * 10) / 10,
                value: Math.round(valueRating * 10) / 10,
                professionalism: Math.round(professionalismRating * 10) / 10
              }
            },
            favoriteCount: vendor._count.favorites,
            isFavorited
          }
        }
      }

      // Cache for 10 minutes
      await RedisService.set(cacheKey, JSON.stringify(result), 600)

      // Track view
      if (userId) {
        VendorController.trackView(vendor.id, userId)
      }

      res.json(result)
    } catch (error) {
      logger.error('Get vendor error:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to get vendor'
      })
    }
  }

  // Create new vendor
  static async createVendor(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
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
        workingRadius,
        address,
        priceRange,
        features,
        specialties,
        services
      } = req.body

      // Check if user already has a vendor profile
      const existingVendor = await prisma.vendor.findUnique({
        where: { userId: req.user.id }
      })

      if (existingVendor) {
        res.status(400).json({
          success: false,
          message: 'User already has a vendor profile'
        })
        return
      }

      // Generate unique slug
      let slug = slugify(name, { lower: true, strict: true })
      let slugExists = await prisma.vendor.findUnique({ where: { slug } })
      let counter = 1

      while (slugExists) {
        slug = `${slugify(name, { lower: true, strict: true })}-${counter}`
        slugExists = await prisma.vendor.findUnique({ where: { slug } })
        counter++
      }

      // Create vendor with transaction
      const vendor = await prisma.$transaction(async (tx) => {
        // Create vendor
        const newVendor = await tx.vendor.create({
          data: {
            userId: req.user!.id,
            name,
            slug,
            category,
            description,
            shortDescription,
            businessName,
            businessId,
            website,
            email,
            phone,
            workingRadius: workingRadius || 50,
            verified: req.user!.role === 'ADMIN' || req.user!.role === 'SUPER_ADMIN'
          }
        })

        // Create address if provided
        if (address) {
          await tx.address.create({
            data: {
              vendorId: newVendor.id,
              street: address.street || '',
              city: address.city,
              postalCode: address.postalCode || '',
              region: address.region || '',
              country: address.country || 'Czech Republic'
            }
          })
        }

        // Create price range if provided
        if (priceRange) {
          await tx.priceRange.create({
            data: {
              vendorId: newVendor.id,
              min: priceRange.min || 0,
              max: priceRange.max || 0,
              currency: priceRange.currency || 'CZK',
              unit: priceRange.unit || 'per-event'
            }
          })
        }

        // Create features
        if (features && features.length > 0) {
          await tx.feature.createMany({
            data: features.map((feature: string) => ({
              vendorId: newVendor.id,
              name: feature
            }))
          })
        }

        // Create specialties
        if (specialties && specialties.length > 0) {
          await tx.specialty.createMany({
            data: specialties.map((specialty: string) => ({
              vendorId: newVendor.id,
              name: specialty
            }))
          })
        }

        // Create services
        if (services && services.length > 0) {
          for (const service of services) {
            const newService = await tx.service.create({
              data: {
                vendorId: newVendor.id,
                name: service.name,
                description: service.description,
                price: service.price,
                priceType: service.priceType || 'FIXED',
                duration: service.duration,
                popular: service.popular || false,
                sortOrder: service.sortOrder || 0
              }
            })

            // Create service includes
            if (service.includes && service.includes.length > 0) {
              await tx.serviceInclude.createMany({
                data: service.includes.map((item: string, index: number) => ({
                  serviceId: newService.id,
                  item,
                  sortOrder: index
                }))
              })
            }
          }
        }

        return newVendor
      })

      // Clear vendors cache
      await VendorController.clearVendorsCache()

      logger.info('Vendor created successfully:', { vendorId: vendor.id, userId: req.user.id })

      res.status(201).json({
        success: true,
        message: 'Vendor created successfully',
        data: { vendor }
      })
    } catch (error) {
      logger.error('Create vendor error:', error)
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

      // Check if vendor exists and user has permission
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

      // Check permissions
      if (
        req.user!.role !== 'ADMIN' &&
        req.user!.role !== 'SUPER_ADMIN' &&
        vendor.userId !== req.user!.id
      ) {
        res.status(403).json({
          success: false,
          message: 'Access denied'
        })
        return
      }

      // Update vendor with transaction
      const updatedVendor = await prisma.$transaction(async (tx) => {
        // Update main vendor data
        const updated = await tx.vendor.update({
          where: { id },
          data: {
            name: updates.name,
            category: updates.category,
            description: updates.description,
            shortDescription: updates.shortDescription,
            businessName: updates.businessName,
            businessId: updates.businessId,
            website: updates.website,
            email: updates.email,
            phone: updates.phone,
            workingRadius: updates.workingRadius,
            verified: updates.verified,
            featured: updates.featured,
            premium: updates.premium,
            active: updates.active
          }
        })

        // Update address
        if (updates.address) {
          await tx.address.upsert({
            where: { vendorId: id },
            update: {
              street: updates.address.street,
              city: updates.address.city,
              postalCode: updates.address.postalCode,
              region: updates.address.region,
              country: updates.address.country || 'Czech Republic'
            },
            create: {
              vendorId: id,
              street: updates.address.street || '',
              city: updates.address.city,
              postalCode: updates.address.postalCode || '',
              region: updates.address.region || '',
              country: updates.address.country || 'Czech Republic'
            }
          })
        }

        // Update price range
        if (updates.priceRange) {
          await tx.priceRange.upsert({
            where: { vendorId: id },
            update: {
              min: updates.priceRange.min,
              max: updates.priceRange.max,
              currency: updates.priceRange.currency,
              unit: updates.priceRange.unit
            },
            create: {
              vendorId: id,
              min: updates.priceRange.min || 0,
              max: updates.priceRange.max || 0,
              currency: updates.priceRange.currency || 'CZK',
              unit: updates.priceRange.unit || 'per-event'
            }
          })
        }

        return updated
      })

      // Clear cache
      await VendorController.clearVendorCache(id)
      await VendorController.clearVendorsCache()

      logger.info('Vendor updated successfully:', { vendorId: id, userId: req.user!.id })

      res.json({
        success: true,
        message: 'Vendor updated successfully',
        data: { vendor: updatedVendor }
      })
    } catch (error) {
      logger.error('Update vendor error:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to update vendor'
      })
    }
  }

  // Delete vendor
  static async deleteVendor(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params

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

      // Check permissions
      if (
        req.user!.role !== 'ADMIN' &&
        req.user!.role !== 'SUPER_ADMIN' &&
        vendor.userId !== req.user!.id
      ) {
        res.status(403).json({
          success: false,
          message: 'Access denied'
        })
        return
      }

      // Soft delete (set active to false)
      await prisma.vendor.update({
        where: { id },
        data: { active: false }
      })

      // Clear cache
      await VendorController.clearVendorCache(id)
      await VendorController.clearVendorsCache()

      logger.info('Vendor deleted successfully:', { vendorId: id, userId: req.user!.id })

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

  // Cache management
  private static async clearVendorCache(vendorId: string): Promise<void> {
    try {
      await RedisService.del(`vendor:${vendorId}`)
    } catch (error) {
      logger.error('Clear vendor cache error:', error)
    }
  }

  private static async clearVendorsCache(): Promise<void> {
    try {
      // In a real implementation, you'd want to use a pattern to delete all vendor list caches
      // For now, we'll just clear a few common cache keys
      const keys = [
        'vendors:*'
      ]

      for (const key of keys) {
        await RedisService.del(key)
      }
    } catch (error) {
      logger.error('Clear vendors cache error:', error)
    }
  }

  // Track vendor view for analytics
  private static async trackView(vendorId: string, userId?: string): Promise<void> {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      await prisma.vendorAnalytics.upsert({
        where: {
          vendorId_date: {
            vendorId,
            date: today
          }
        },
        update: {
          views: { increment: 1 }
        },
        create: {
          vendorId,
          date: today,
          views: 1
        }
      })
    } catch (error) {
      logger.error('Track view error:', error)
      // Don't fail the request if analytics fail
    }
  }
}
