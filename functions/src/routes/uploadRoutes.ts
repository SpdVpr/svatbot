import { Router } from 'express'
import { UploadController } from '../controllers/UploadController'
import { verifyToken } from '../middleware/auth'
import { validateImageUpload } from '../middleware/validation'
import multer from 'multer'

const router = Router()

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 10
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

// Upload multiple images
router.post('/images',
  verifyToken,
  upload.array('images', 10),
  validateImageUpload,
  UploadController.uploadImages
)

// Upload single image
router.post('/image',
  verifyToken,
  upload.single('image'),
  validateImageUpload,
  UploadController.uploadImage
)

// Delete image
router.delete('/images/:filename',
  verifyToken,
  UploadController.deleteImage
)

// Get image info
router.get('/images/:filename/info',
  verifyToken,
  UploadController.getImageInfo
)

// Generate optimized URL
router.post('/images/optimize',
  verifyToken,
  UploadController.getOptimizedUrl
)

export default router
