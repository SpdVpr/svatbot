/**
 * Image compression utility for optimizing images before upload
 */

export interface CompressionOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  maxSizeKB?: number
}

export interface CompressedImageResult {
  file: File
  originalSize: number
  compressedSize: number
  compressionRatio: number
}

/**
 * Compress an image file to reduce size while maintaining quality
 */
export async function compressImage(
  file: File, 
  options: CompressionOptions = {}
): Promise<CompressedImageResult> {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.8,
    maxSizeKB = 500
  } = options

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    if (!ctx) {
      reject(new Error('Canvas context not available'))
      return
    }

    img.onload = () => {
      // Calculate new dimensions while maintaining aspect ratio
      let { width, height } = img
      const aspectRatio = width / height

      if (width > maxWidth) {
        width = maxWidth
        height = width / aspectRatio
      }

      if (height > maxHeight) {
        height = maxHeight
        width = height * aspectRatio
      }

      // Set canvas dimensions
      canvas.width = width
      canvas.height = height

      // Draw and compress image
      ctx.drawImage(img, 0, 0, width, height)

      // Try different quality levels to meet size requirements
      let currentQuality = quality
      let attempts = 0
      const maxAttempts = 5

      const tryCompress = () => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'))
              return
            }

            const compressedSizeKB = blob.size / 1024

            // If size is acceptable or we've tried enough times, use this result
            if (compressedSizeKB <= maxSizeKB || attempts >= maxAttempts) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              })

              resolve({
                file: compressedFile,
                originalSize: file.size,
                compressedSize: blob.size,
                compressionRatio: Math.round((1 - blob.size / file.size) * 100)
              })
            } else {
              // Try with lower quality
              attempts++
              currentQuality = Math.max(0.1, currentQuality - 0.1)
              tryCompress()
            }
          },
          'image/jpeg',
          currentQuality
        )
      }

      tryCompress()
    }

    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }

    // Load the image
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Create a thumbnail version of an image
 */
export async function createThumbnail(
  file: File,
  size: number = 200
): Promise<File> {
  const result = await compressImage(file, {
    maxWidth: size,
    maxHeight: size,
    quality: 0.7,
    maxSizeKB: 50 // Very small for thumbnails
  })

  return new File([result.file], `thumb_${file.name}`, {
    type: 'image/jpeg',
    lastModified: Date.now()
  })
}

/**
 * Validate if file is a supported image type
 */
export function isValidImageFile(file: File): boolean {
  const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  return supportedTypes.includes(file.type)
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}
