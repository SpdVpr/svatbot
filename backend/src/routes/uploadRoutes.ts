import { Router } from 'express'
import multer from 'multer'
import { UploadController } from '@/controllers/uploadController'
import { authenticateToken } from '@/middleware/auth'
import { uploadRateLimit } from '@/middleware/rateLimiting'
import { validateImageUpload } from '@/middleware/validation'

const router = Router()

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
    files: parseInt(process.env.MAX_FILES_PER_UPLOAD || '10')
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Only JPEG, PNG, and WebP images are allowed'))
    }
  }
})

// Upload images
router.post('/images',
  authenticateToken,
  uploadRateLimit,
  upload.array('images', 10),
  validateImageUpload,
  UploadController.uploadImages
)

// Upload single image
router.post('/image',
  authenticateToken,
  uploadRateLimit,
  upload.single('image'),
  validateImageUpload,
  UploadController.uploadImage
)

// Delete image
router.delete('/images/:publicId',
  authenticateToken,
  UploadController.deleteImage
)

// Get image info
router.get('/images/:publicId/info',
  authenticateToken,
  UploadController.getImageInfo
)

// Generate optimized URL
router.post('/images/optimize',
  authenticateToken,
  UploadController.getOptimizedUrl
)

export default router
