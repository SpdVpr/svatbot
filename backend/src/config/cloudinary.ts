import { v2 as cloudinary } from 'cloudinary'
import { logger } from './logger'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export interface UploadResult {
  public_id: string
  secure_url: string
  width: number
  height: number
  format: string
  bytes: number
  created_at: string
}

export interface UploadOptions {
  folder?: string
  transformation?: object[]
  quality?: string | number
  format?: string
  width?: number
  height?: number
  crop?: string
}

class CloudinaryService {
  // Upload image from buffer
  public static async uploadImage(
    buffer: Buffer,
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    try {
      const defaultOptions = {
        folder: 'svatbot',
        quality: 'auto:good',
        format: 'webp',
        transformation: [
          { quality: 'auto:good' },
          { fetch_format: 'auto' }
        ]
      }

      const uploadOptions = { ...defaultOptions, ...options }

      const result = await new Promise<UploadResult>((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) {
              reject(error)
            } else if (result) {
              resolve(result as UploadResult)
            } else {
              reject(new Error('Upload failed: No result returned'))
            }
          }
        ).end(buffer)
      })

      logger.info('Image uploaded to Cloudinary:', {
        public_id: result.public_id,
        url: result.secure_url,
        size: result.bytes
      })

      return result
    } catch (error) {
      logger.error('Cloudinary upload error:', error)
      throw new Error('Failed to upload image to Cloudinary')
    }
  }

  // Upload multiple images
  public static async uploadImages(
    buffers: Buffer[],
    options: UploadOptions = {}
  ): Promise<UploadResult[]> {
    try {
      const uploadPromises = buffers.map(buffer => 
        CloudinaryService.uploadImage(buffer, options)
      )
      
      return await Promise.all(uploadPromises)
    } catch (error) {
      logger.error('Cloudinary multiple upload error:', error)
      throw new Error('Failed to upload images to Cloudinary')
    }
  }

  // Delete image
  public static async deleteImage(publicId: string): Promise<boolean> {
    try {
      const result = await cloudinary.uploader.destroy(publicId)
      
      if (result.result === 'ok') {
        logger.info('Image deleted from Cloudinary:', { public_id: publicId })
        return true
      } else {
        logger.warn('Failed to delete image from Cloudinary:', { 
          public_id: publicId, 
          result 
        })
        return false
      }
    } catch (error) {
      logger.error('Cloudinary delete error:', error)
      return false
    }
  }

  // Delete multiple images
  public static async deleteImages(publicIds: string[]): Promise<boolean[]> {
    try {
      const deletePromises = publicIds.map(publicId => 
        CloudinaryService.deleteImage(publicId)
      )
      
      return await Promise.all(deletePromises)
    } catch (error) {
      logger.error('Cloudinary multiple delete error:', error)
      return publicIds.map(() => false)
    }
  }

  // Generate optimized URL
  public static getOptimizedUrl(
    publicId: string,
    options: {
      width?: number
      height?: number
      quality?: string | number
      format?: string
      crop?: string
    } = {}
  ): string {
    try {
      return cloudinary.url(publicId, {
        quality: options.quality || 'auto:good',
        format: options.format || 'webp',
        width: options.width,
        height: options.height,
        crop: options.crop || 'fill',
        secure: true
      })
    } catch (error) {
      logger.error('Cloudinary URL generation error:', error)
      return ''
    }
  }

  // Generate thumbnail URL
  public static getThumbnailUrl(
    publicId: string,
    size: number = 300
  ): string {
    return CloudinaryService.getOptimizedUrl(publicId, {
      width: size,
      height: size,
      crop: 'fill',
      quality: 'auto:good'
    })
  }

  // Get image info
  public static async getImageInfo(publicId: string): Promise<any> {
    try {
      const result = await cloudinary.api.resource(publicId)
      return result
    } catch (error) {
      logger.error('Cloudinary get image info error:', error)
      return null
    }
  }

  // Check if Cloudinary is configured
  public static isConfigured(): boolean {
    return !!(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    )
  }

  // Health check
  public static async healthCheck(): Promise<boolean> {
    try {
      if (!CloudinaryService.isConfigured()) {
        return false
      }

      await cloudinary.api.ping()
      return true
    } catch (error) {
      logger.error('Cloudinary health check failed:', error)
      return false
    }
  }
}

export { CloudinaryService, cloudinary }
export default CloudinaryService
