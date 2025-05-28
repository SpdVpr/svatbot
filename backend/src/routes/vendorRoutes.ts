import { Router } from 'express'
import { VendorController } from '@/controllers/vendorController'
import { 
  authenticateToken,
  optionalAuth,
  requireVendorOrAdmin,
  requireVendorOwnership
} from '@/middleware/auth'
import {
  createVendorValidation,
  updateVendorValidation,
  vendorFilterValidation,
  handleValidationErrors,
  uuidValidation
} from '@/middleware/validation'

const router = Router()

// Public routes
router.get('/',
  vendorFilterValidation,
  handleValidationErrors,
  VendorController.getVendors
)

router.get('/:id',
  optionalAuth,
  VendorController.getVendor
)

// Protected routes
router.post('/',
  authenticateToken,
  createVendorValidation,
  handleValidationErrors,
  VendorController.createVendor
)

router.put('/:id',
  authenticateToken,
  uuidValidation('id'),
  updateVendorValidation,
  handleValidationErrors,
  requireVendorOwnership,
  VendorController.updateVendor
)

router.delete('/:id',
  authenticateToken,
  uuidValidation('id'),
  handleValidationErrors,
  requireVendorOwnership,
  VendorController.deleteVendor
)

// Vendor services routes
router.get('/:id/services',
  optionalAuth,
  uuidValidation('id'),
  handleValidationErrors,
  VendorController.getVendorServices
)

router.post('/:id/services',
  authenticateToken,
  uuidValidation('id'),
  // createServiceValidation,
  handleValidationErrors,
  requireVendorOwnership,
  VendorController.createVendorService
)

router.put('/:id/services/:serviceId',
  authenticateToken,
  uuidValidation('id'),
  uuidValidation('serviceId'),
  handleValidationErrors,
  requireVendorOwnership,
  VendorController.updateVendorService
)

router.delete('/:id/services/:serviceId',
  authenticateToken,
  uuidValidation('id'),
  uuidValidation('serviceId'),
  handleValidationErrors,
  requireVendorOwnership,
  VendorController.deleteVendorService
)

// Vendor images routes
router.post('/:id/images',
  authenticateToken,
  uuidValidation('id'),
  handleValidationErrors,
  requireVendorOwnership,
  VendorController.addVendorImages
)

router.delete('/:id/images/:imageId',
  authenticateToken,
  uuidValidation('id'),
  uuidValidation('imageId'),
  handleValidationErrors,
  requireVendorOwnership,
  VendorController.deleteVendorImage
)

router.put('/:id/images/reorder',
  authenticateToken,
  uuidValidation('id'),
  handleValidationErrors,
  requireVendorOwnership,
  VendorController.reorderVendorImages
)

// Vendor reviews routes
router.get('/:id/reviews',
  optionalAuth,
  uuidValidation('id'),
  handleValidationErrors,
  VendorController.getVendorReviews
)

router.post('/:id/reviews',
  authenticateToken,
  uuidValidation('id'),
  // createReviewValidation,
  handleValidationErrors,
  VendorController.createVendorReview
)

// Vendor favorites routes
router.post('/:id/favorite',
  authenticateToken,
  uuidValidation('id'),
  handleValidationErrors,
  VendorController.toggleVendorFavorite
)

router.get('/favorites/my',
  authenticateToken,
  VendorController.getMyFavorites
)

// Vendor inquiries routes
router.post('/:id/inquiries',
  optionalAuth,
  uuidValidation('id'),
  // createInquiryValidation,
  handleValidationErrors,
  VendorController.createVendorInquiry
)

router.get('/:id/inquiries',
  authenticateToken,
  uuidValidation('id'),
  handleValidationErrors,
  requireVendorOwnership,
  VendorController.getVendorInquiries
)

router.put('/:id/inquiries/:inquiryId',
  authenticateToken,
  uuidValidation('id'),
  uuidValidation('inquiryId'),
  handleValidationErrors,
  requireVendorOwnership,
  VendorController.updateVendorInquiry
)

// Vendor analytics routes
router.get('/:id/analytics',
  authenticateToken,
  uuidValidation('id'),
  handleValidationErrors,
  requireVendorOwnership,
  VendorController.getVendorAnalytics
)

// Search and filtering routes
router.get('/search/suggestions',
  VendorController.getSearchSuggestions
)

router.get('/categories/stats',
  VendorController.getCategoryStats
)

export default router
