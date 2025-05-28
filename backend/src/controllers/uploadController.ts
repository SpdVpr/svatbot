import { Request, Response } from 'express'
import { CloudinaryService } from '@/config/cloudinary'
import { logger } from '@/config/logger'
import { AuthenticatedRequest } from '@/middleware/auth'

export class UploadController {
  // Upload multiple images
  static async uploadImages(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        })
        return
      }

      const files = req.files as Express.Multer.File[]
      if (!files || files.length === 0) {
        res.status(400).json({
          success: false,
          message: 'No files uploaded'
        })
        return
      }

      const { folder = 'svatbot', quality = 'auto:good' } = req.body

      // Upload all images to Cloudinary
      const uploadPromises = files.map(file => 
        CloudinaryService.uploadImage(file.buffer, {
          folder: `${folder}/${req.user!.id}`,
          quality,
          transformation: [
            { quality: 'auto:good' },
            { fetch_format: 'auto' },
            { width: 1920, height: 1080, crop: 'limit' }
          ]
        })
      )

      const results = await Promise.all(uploadPromises)

      logger.info('Images uploaded successfully:', {
        userId: req.user.id,
        count: results.length,
        publicIds: results.map(r => r.public_id)
      })

      res.json({
        success: true,
        message: `${results.length} images uploaded successfully`,
        data: {
          images: results.map(result => ({
            publicId: result.public_id,
            url: result.secure_url,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes
          }))
        }
      })
    } catch (error) {
      logger.error('Upload images error:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to upload images'
      })
    }
  }

  // Upload single image
  static async uploadImage(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        })
        return
      }

      const file = req.file
      if (!file) {
        res.status(400).json({
          success: false,
          message: 'No file uploaded'
        })
        return
      }

      const { folder = 'svatbot', quality = 'auto:good', width, height } = req.body

      const result = await CloudinaryService.uploadImage(file.buffer, {
        folder: `${folder}/${req.user.id}`,
        quality,
        width: width ? parseInt(width) : undefined,
        height: height ? parseInt(height) : undefined,
        transformation: [
          { quality: 'auto:good' },
          { fetch_format: 'auto' }
        ]
      })

      logger.info('Image uploaded successfully:', {
        userId: req.user.id,
        publicId: result.public_id
      })

      res.json({
        success: true,
        message: 'Image uploaded successfully',
        data: {
          image: {
            publicId: result.public_id,
            url: result.secure_url,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes
          }
        }
      })
    } catch (error) {
      logger.error('Upload image error:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to upload image'
      })
    }
  }

  // Delete image
  static async deleteImage(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        })
        return
      }

      const { publicId } = req.params

      // Decode public ID (it might be URL encoded)
      const decodedPublicId = decodeURIComponent(publicId)

      const success = await CloudinaryService.deleteImage(decodedPublicId)

      if (success) {
        logger.info('Image deleted successfully:', {
          userId: req.user.id,
          publicId: decodedPublicId
        })

        res.json({
          success: true,
          message: 'Image deleted successfully'
        })
      } else {
        res.status(404).json({
          success: false,
          message: 'Image not found or already deleted'
        })
      }
    } catch (error) {
      logger.error('Delete image error:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to delete image'
      })
    }
  }

  // Get image info
  static async getImageInfo(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        })
        return
      }

      const { publicId } = req.params
      const decodedPublicId = decodeURIComponent(publicId)

      const info = await CloudinaryService.getImageInfo(decodedPublicId)

      if (info) {
        res.json({
          success: true,
          data: { image: info }
        })
      } else {
        res.status(404).json({
          success: false,
          message: 'Image not found'
        })
      }
    } catch (error) {
      logger.error('Get image info error:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to get image info'
      })
    }
  }

  // Generate optimized URL
  static async getOptimizedUrl(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        })
        return
      }

      const { publicId, width, height, quality, format, crop } = req.body

      if (!publicId) {
        res.status(400).json({
          success: false,
          message: 'Public ID is required'
        })
        return
      }

      const optimizedUrl = CloudinaryService.getOptimizedUrl(publicId, {
        width: width ? parseInt(width) : undefined,
        height: height ? parseInt(height) : undefined,
        quality: quality || 'auto:good',
        format: format || 'webp',
        crop: crop || 'fill'
      })

      const thumbnailUrl = CloudinaryService.getThumbnailUrl(publicId, 300)

      res.json({
        success: true,
        data: {
          optimizedUrl,
          thumbnailUrl,
          originalUrl: `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${publicId}`
        }
      })
    } catch (error) {
      logger.error('Get optimized URL error:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to generate optimized URL'
      })
    }
  }
}
