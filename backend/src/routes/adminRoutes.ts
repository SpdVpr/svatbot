import { Router } from 'express'
import { AdminController } from '@/controllers/adminController'
import { 
  authenticateToken,
  requireAdmin,
  requireSuperAdmin
} from '@/middleware/auth'
import {
  handleValidationErrors,
  uuidValidation,
  paginationValidation
} from '@/middleware/validation'

const router = Router()

// All admin routes require authentication
router.use(authenticateToken)

// Dashboard and statistics
router.get('/stats',
  requireAdmin,
  AdminController.getStats
)

router.get('/analytics',
  requireAdmin,
  AdminController.getAnalytics
)

// Vendor management
router.get('/vendors',
  requireAdmin,
  paginationValidation,
  handleValidationErrors,
  AdminController.getVendors
)

router.get('/vendors/:id',
  requireAdmin,
  uuidValidation('id'),
  handleValidationErrors,
  AdminController.getVendor
)

router.put('/vendors/:id/verify',
  requireAdmin,
  uuidValidation('id'),
  handleValidationErrors,
  AdminController.verifyVendor
)

router.put('/vendors/:id/feature',
  requireAdmin,
  uuidValidation('id'),
  handleValidationErrors,
  AdminController.featureVendor
)

router.put('/vendors/:id/premium',
  requireAdmin,
  uuidValidation('id'),
  handleValidationErrors,
  AdminController.setPremiumVendor
)

router.put('/vendors/:id/activate',
  requireAdmin,
  uuidValidation('id'),
  handleValidationErrors,
  AdminController.activateVendor
)

router.delete('/vendors/:id',
  requireSuperAdmin,
  uuidValidation('id'),
  handleValidationErrors,
  AdminController.deleteVendor
)

// User management
router.get('/users',
  requireAdmin,
  paginationValidation,
  handleValidationErrors,
  AdminController.getUsers
)

router.get('/users/:id',
  requireAdmin,
  uuidValidation('id'),
  handleValidationErrors,
  AdminController.getUser
)

router.put('/users/:id/activate',
  requireAdmin,
  uuidValidation('id'),
  handleValidationErrors,
  AdminController.activateUser
)

router.put('/users/:id/verify',
  requireAdmin,
  uuidValidation('id'),
  handleValidationErrors,
  AdminController.verifyUser
)

router.put('/users/:id/role',
  requireSuperAdmin,
  uuidValidation('id'),
  handleValidationErrors,
  AdminController.changeUserRole
)

router.delete('/users/:id',
  requireSuperAdmin,
  uuidValidation('id'),
  handleValidationErrors,
  AdminController.deleteUser
)

// Review management
router.get('/reviews',
  requireAdmin,
  paginationValidation,
  handleValidationErrors,
  AdminController.getReviews
)

router.put('/reviews/:id/verify',
  requireAdmin,
  uuidValidation('id'),
  handleValidationErrors,
  AdminController.verifyReview
)

router.delete('/reviews/:id',
  requireAdmin,
  uuidValidation('id'),
  handleValidationErrors,
  AdminController.deleteReview
)

// Inquiry management
router.get('/inquiries',
  requireAdmin,
  paginationValidation,
  handleValidationErrors,
  AdminController.getInquiries
)

router.get('/inquiries/:id',
  requireAdmin,
  uuidValidation('id'),
  handleValidationErrors,
  AdminController.getInquiry
)

// System management
router.get('/system/health',
  requireSuperAdmin,
  AdminController.getSystemHealth
)

router.get('/system/logs',
  requireSuperAdmin,
  AdminController.getSystemLogs
)

router.post('/system/cache/clear',
  requireSuperAdmin,
  AdminController.clearCache
)

router.post('/system/emails/test',
  requireSuperAdmin,
  AdminController.testEmail
)

// Export data
router.get('/export/vendors',
  requireAdmin,
  AdminController.exportVendors
)

router.get('/export/users',
  requireSuperAdmin,
  AdminController.exportUsers
)

router.get('/export/analytics',
  requireAdmin,
  AdminController.exportAnalytics
)

export default router
