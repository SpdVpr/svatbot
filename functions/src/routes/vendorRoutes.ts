import { Router } from 'express'
import { VendorController } from '../controllers/VendorController'
import { verifyToken, optionalAuth, requireVendorOwnership } from '../middleware/auth'
import { validateRequest, validatePagination, validateSort, validateSearch } from '../middleware/validation'
import { body, query } from 'express-validator'

const router = Router()

// Validation rules
const createVendorValidation = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('category').isIn([
    'photographer', 'videographer', 'venue', 'catering', 'flowers',
    'music', 'decoration', 'dress', 'suit', 'makeup', 'hair',
    'transport', 'cake', 'jewelry', 'invitations', 'other'
  ]).withMessage('Invalid category'),
  body('description').trim().isLength({ min: 50, max: 2000 }).withMessage('Description must be 50-2000 characters'),
  body('shortDescription').trim().isLength({ min: 10, max: 150 }).withMessage('Short description must be 10-150 characters'),
  body('businessName').trim().isLength({ min: 2, max: 100 }).withMessage('Business name must be 2-100 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').matches(/^\+420\d{9}$/).withMessage('Phone must be in format +420XXXXXXXXX'),
  body('address.city').trim().isLength({ min: 2, max: 50 }).withMessage('City must be 2-50 characters'),
  body('address.country').optional().trim().isLength({ max: 50 }).withMessage('Country must be less than 50 characters')
]

const updateVendorValidation = [
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('category').optional().isIn([
    'photographer', 'videographer', 'venue', 'catering', 'flowers',
    'music', 'decoration', 'dress', 'suit', 'makeup', 'hair',
    'transport', 'cake', 'jewelry', 'invitations', 'other'
  ]).withMessage('Invalid category'),
  body('description').optional().trim().isLength({ min: 50, max: 2000 }).withMessage('Description must be 50-2000 characters'),
  body('shortDescription').optional().trim().isLength({ min: 10, max: 150 }).withMessage('Short description must be 10-150 characters'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').optional().matches(/^\+420\d{9}$/).withMessage('Phone must be in format +420XXXXXXXXX')
]

const createServiceValidation = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Service name must be 2-100 characters'),
  body('description').trim().isLength({ min: 10, max: 500 }).withMessage('Description must be 10-500 characters'),
  body('price').optional().isNumeric().withMessage('Price must be a number'),
  body('priceType').isIn(['fixed', 'per_person', 'per_hour', 'per_day', 'package', 'custom']).withMessage('Invalid price type'),
  body('includes').optional().isArray().withMessage('Includes must be an array')
]

const createReviewValidation = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('text').trim().isLength({ min: 10, max: 1000 }).withMessage('Review text must be 10-1000 characters'),
  body('quality').optional().isInt({ min: 1, max: 5 }).withMessage('Quality rating must be between 1 and 5'),
  body('communication').optional().isInt({ min: 1, max: 5 }).withMessage('Communication rating must be between 1 and 5'),
  body('value').optional().isInt({ min: 1, max: 5 }).withMessage('Value rating must be between 1 and 5'),
  body('professionalism').optional().isInt({ min: 1, max: 5 }).withMessage('Professionalism rating must be between 1 and 5')
]

const createInquiryValidation = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').optional().matches(/^\+420\d{9}$/).withMessage('Phone must be in format +420XXXXXXXXX'),
  body('message').trim().isLength({ min: 10, max: 1000 }).withMessage('Message must be 10-1000 characters'),
  body('weddingDate').optional().isISO8601().withMessage('Wedding date must be a valid date'),
  body('guestCount').optional().isInt({ min: 1 }).withMessage('Guest count must be a positive number'),
  body('budget').optional().isNumeric().withMessage('Budget must be a number')
]

// Public routes
router.get('/',
  validatePagination,
  validateSort,
  validateSearch,
  [
    query('category').optional().isIn([
      'photographer', 'videographer', 'venue', 'catering', 'flowers',
      'music', 'decoration', 'dress', 'suit', 'makeup', 'hair',
      'transport', 'cake', 'jewelry', 'invitations', 'other'
    ]).withMessage('Invalid category'),
    query('city').optional().trim().isLength({ min: 2, max: 50 }).withMessage('City must be 2-50 characters'),
    query('verified').optional().isBoolean().withMessage('Verified must be a boolean'),
    query('featured').optional().isBoolean().withMessage('Featured must be a boolean'),
    query('minPrice').optional().isNumeric().withMessage('Min price must be a number'),
    query('maxPrice').optional().isNumeric().withMessage('Max price must be a number')
  ],
  validateRequest,
  VendorController.getVendors
)

router.get('/categories',
  VendorController.getCategories
)

router.get('/search/suggestions',
  [query('q').trim().isLength({ min: 2, max: 50 }).withMessage('Query must be 2-50 characters')],
  validateRequest,
  VendorController.getSearchSuggestions
)

router.get('/:id',
  optionalAuth,
  VendorController.getVendor
)

// Vendor services
router.get('/:id/services',
  VendorController.getVendorServices
)

// Vendor reviews
router.get('/:id/reviews',
  validatePagination,
  validateSort,
  VendorController.getVendorReviews
)

// Protected routes
router.post('/',
  verifyToken,
  createVendorValidation,
  validateRequest,
  VendorController.createVendor
)

router.put('/:id',
  verifyToken,
  requireVendorOwnership,
  updateVendorValidation,
  validateRequest,
  VendorController.updateVendor
)

router.delete('/:id',
  verifyToken,
  requireVendorOwnership,
  VendorController.deleteVendor
)

// Vendor services management
router.post('/:id/services',
  verifyToken,
  requireVendorOwnership,
  createServiceValidation,
  validateRequest,
  VendorController.createService
)

router.put('/:id/services/:serviceId',
  verifyToken,
  requireVendorOwnership,
  createServiceValidation,
  validateRequest,
  VendorController.updateService
)

router.delete('/:id/services/:serviceId',
  verifyToken,
  requireVendorOwnership,
  VendorController.deleteService
)

// Vendor images management
router.post('/:id/images',
  verifyToken,
  requireVendorOwnership,
  VendorController.uploadImages
)

router.delete('/:id/images/:imageId',
  verifyToken,
  requireVendorOwnership,
  VendorController.deleteImage
)

router.put('/:id/images/reorder',
  verifyToken,
  requireVendorOwnership,
  [body('imageIds').isArray().withMessage('Image IDs must be an array')],
  validateRequest,
  VendorController.reorderImages
)

// Reviews
router.post('/:id/reviews',
  verifyToken,
  createReviewValidation,
  validateRequest,
  VendorController.createReview
)

// Favorites
router.post('/:id/favorite',
  verifyToken,
  VendorController.toggleFavorite
)

router.get('/favorites/my',
  verifyToken,
  validatePagination,
  VendorController.getMyFavorites
)

// Inquiries
router.post('/:id/inquiries',
  optionalAuth,
  createInquiryValidation,
  validateRequest,
  VendorController.createInquiry
)

router.get('/:id/inquiries',
  verifyToken,
  requireVendorOwnership,
  validatePagination,
  validateSort,
  VendorController.getVendorInquiries
)

router.put('/:id/inquiries/:inquiryId',
  verifyToken,
  requireVendorOwnership,
  [
    body('status').optional().isIn(['new', 'viewed', 'responded', 'quoted', 'booked', 'declined', 'expired']).withMessage('Invalid status'),
    body('priority').optional().isIn(['low', 'normal', 'high', 'urgent']).withMessage('Invalid priority'),
    body('response').optional().trim().isLength({ min: 1, max: 1000 }).withMessage('Response must be 1-1000 characters')
  ],
  validateRequest,
  VendorController.updateInquiry
)

// Analytics
router.get('/:id/analytics',
  verifyToken,
  requireVendorOwnership,
  [
    query('period').optional().isIn(['7d', '30d', '90d', '1y']).withMessage('Invalid period'),
    query('startDate').optional().isISO8601().withMessage('Invalid start date'),
    query('endDate').optional().isISO8601().withMessage('Invalid end date')
  ],
  validateRequest,
  VendorController.getAnalytics
)

export default router
