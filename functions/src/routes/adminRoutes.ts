import { Router } from 'express'
import { AdminController } from '../controllers/AdminController'
import { EmailStatsController } from '../controllers/EmailStatsController'
import { EmailTestController } from '../controllers/EmailTestController'
import { verifyToken, requireAdmin, requireSuperAdmin } from '../middleware/auth'
import { validateRequest, validatePagination } from '../middleware/validation'
import { body, query } from 'express-validator'

const router = Router()

// All admin routes require authentication
router.use(verifyToken)

// Dashboard and statistics
router.get('/stats',
  requireAdmin,
  AdminController.getStats
)

router.get('/analytics',
  requireAdmin,
  [
    query('period').optional().isIn(['7d', '30d', '90d', '1y']).withMessage('Invalid period'),
    query('startDate').optional().isISO8601().withMessage('Invalid start date'),
    query('endDate').optional().isISO8601().withMessage('Invalid end date')
  ],
  validateRequest,
  AdminController.getAnalytics
)

// Vendor management
router.get('/vendors',
  requireAdmin,
  validatePagination,
  [
    query('search').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Search must be 2-100 characters'),
    query('category').optional().isIn([
      'photographer', 'videographer', 'venue', 'catering', 'flowers',
      'music', 'decoration', 'dress', 'suit', 'makeup', 'hair',
      'transport', 'cake', 'jewelry', 'invitations', 'other'
    ]).withMessage('Invalid category'),
    query('verified').optional().isBoolean().withMessage('Verified must be a boolean'),
    query('featured').optional().isBoolean().withMessage('Featured must be a boolean'),
    query('active').optional().isBoolean().withMessage('Active must be a boolean')
  ],
  validateRequest,
  AdminController.getVendors
)

router.get('/vendors/:id',
  requireAdmin,
  AdminController.getVendor
)

router.put('/vendors/:id/verify',
  requireAdmin,
  [body('verified').isBoolean().withMessage('Verified must be a boolean')],
  validateRequest,
  AdminController.verifyVendor
)

router.put('/vendors/:id/feature',
  requireAdmin,
  [body('featured').isBoolean().withMessage('Featured must be a boolean')],
  validateRequest,
  AdminController.featureVendor
)

router.put('/vendors/:id/premium',
  requireAdmin,
  [body('premium').isBoolean().withMessage('Premium must be a boolean')],
  validateRequest,
  AdminController.setPremiumVendor
)

router.put('/vendors/:id/activate',
  requireAdmin,
  [body('active').isBoolean().withMessage('Active must be a boolean')],
  validateRequest,
  AdminController.activateVendor
)

router.delete('/vendors/:id',
  requireSuperAdmin,
  AdminController.deleteVendor
)

// User management
router.get('/users',
  requireAdmin,
  validatePagination,
  [
    query('search').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Search must be 2-100 characters'),
    query('role').optional().isIn(['user', 'vendor', 'admin', 'super_admin']).withMessage('Invalid role'),
    query('verified').optional().isBoolean().withMessage('Verified must be a boolean'),
    query('active').optional().isBoolean().withMessage('Active must be a boolean')
  ],
  validateRequest,
  AdminController.getUsers
)

router.get('/users/:id',
  requireAdmin,
  AdminController.getUser
)

router.put('/users/:id/activate',
  requireAdmin,
  [body('active').isBoolean().withMessage('Active must be a boolean')],
  validateRequest,
  AdminController.activateUser
)

router.put('/users/:id/verify',
  requireAdmin,
  [body('verified').isBoolean().withMessage('Verified must be a boolean')],
  validateRequest,
  AdminController.verifyUser
)

router.put('/users/:id/role',
  requireSuperAdmin,
  [body('role').isIn(['user', 'vendor', 'admin', 'super_admin']).withMessage('Invalid role')],
  validateRequest,
  AdminController.changeUserRole
)

router.delete('/users/:id',
  requireSuperAdmin,
  AdminController.deleteUser
)

// Review management
router.get('/reviews',
  requireAdmin,
  validatePagination,
  [
    query('vendorId').optional().isLength({ min: 1 }).withMessage('Invalid vendor ID'),
    query('verified').optional().isBoolean().withMessage('Verified must be a boolean'),
    query('minRating').optional().isInt({ min: 1, max: 5 }).withMessage('Min rating must be 1-5'),
    query('maxRating').optional().isInt({ min: 1, max: 5 }).withMessage('Max rating must be 1-5')
  ],
  validateRequest,
  AdminController.getReviews
)

router.put('/reviews/:id/verify',
  requireAdmin,
  [body('verified').isBoolean().withMessage('Verified must be a boolean')],
  validateRequest,
  AdminController.verifyReview
)

router.delete('/reviews/:id',
  requireAdmin,
  AdminController.deleteReview
)

// Inquiry management
router.get('/inquiries',
  requireAdmin,
  validatePagination,
  [
    query('vendorId').optional().isLength({ min: 1 }).withMessage('Invalid vendor ID'),
    query('status').optional().isIn(['new', 'viewed', 'responded', 'quoted', 'booked', 'declined', 'expired']).withMessage('Invalid status'),
    query('priority').optional().isIn(['low', 'normal', 'high', 'urgent']).withMessage('Invalid priority')
  ],
  validateRequest,
  AdminController.getInquiries
)

router.get('/inquiries/:id',
  requireAdmin,
  AdminController.getInquiry
)

// System management
router.get('/system/health',
  requireSuperAdmin,
  AdminController.getSystemHealth
)

router.get('/system/logs',
  requireSuperAdmin,
  [
    query('level').optional().isIn(['error', 'warn', 'info', 'debug']).withMessage('Invalid log level'),
    query('limit').optional().isInt({ min: 1, max: 1000 }).withMessage('Limit must be 1-1000')
  ],
  validateRequest,
  AdminController.getSystemLogs
)

router.post('/system/cache/clear',
  requireSuperAdmin,
  AdminController.clearCache
)

router.post('/system/emails/test',
  requireSuperAdmin,
  [body('email').optional().isEmail().withMessage('Valid email required')],
  validateRequest,
  AdminController.testEmail
)

// Export data
router.get('/export/vendors',
  requireAdmin,
  [
    query('format').optional().isIn(['json', 'csv']).withMessage('Format must be json or csv'),
    query('category').optional().isIn([
      'photographer', 'videographer', 'venue', 'catering', 'flowers',
      'music', 'decoration', 'dress', 'suit', 'makeup', 'hair',
      'transport', 'cake', 'jewelry', 'invitations', 'other'
    ]).withMessage('Invalid category')
  ],
  validateRequest,
  AdminController.exportVendors
)

router.get('/export/users',
  requireSuperAdmin,
  [
    query('format').optional().isIn(['json', 'csv']).withMessage('Format must be json or csv'),
    query('role').optional().isIn(['user', 'vendor', 'admin', 'super_admin']).withMessage('Invalid role')
  ],
  validateRequest,
  AdminController.exportUsers
)

router.get('/export/analytics',
  requireAdmin,
  [
    query('format').optional().isIn(['json', 'csv']).withMessage('Format must be json or csv'),
    query('period').optional().isIn(['7d', '30d', '90d', '1y']).withMessage('Invalid period')
  ],
  validateRequest,
  AdminController.exportAnalytics
)

// Notifications
router.post('/notifications/send',
  requireAdmin,
  [
    body('type').isIn(['inquiry_received', 'inquiry_response', 'review_received', 'vendor_verified', 'vendor_featured', 'system_update', 'promotion']).withMessage('Invalid notification type'),
    body('title').trim().isLength({ min: 1, max: 100 }).withMessage('Title must be 1-100 characters'),
    body('message').trim().isLength({ min: 1, max: 500 }).withMessage('Message must be 1-500 characters'),
    body('userIds').optional().isArray().withMessage('User IDs must be an array'),
    body('sendToAll').optional().isBoolean().withMessage('Send to all must be a boolean')
  ],
  validateRequest,
  AdminController.sendNotification
)

// Email statistics
router.get('/email-stats',
  requireAdmin,
  [
    query('startDate').optional().isISO8601().withMessage('Invalid start date'),
    query('endDate').optional().isISO8601().withMessage('Invalid end date'),
    query('type').optional().isIn(['registration', 'payment_success', 'trial_reminder', 'trial_expired', 'other']).withMessage('Invalid email type')
  ],
  validateRequest,
  EmailStatsController.getEmailStats
)

router.get('/email-stats/summary',
  requireAdmin,
  EmailStatsController.getEmailStatsSummary
)

router.get('/email-stats/daily',
  requireAdmin,
  [
    query('days').optional().isInt({ min: 1, max: 365 }).withMessage('Days must be 1-365')
  ],
  validateRequest,
  EmailStatsController.getDailyEmailStats
)

// Email testing endpoints
router.get('/email-test/status',
  requireAdmin,
  EmailTestController.getEmailServiceStatus
)

router.post('/email-test/registration',
  requireAdmin,
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('firstName').optional().trim().isLength({ min: 1, max: 100 }).withMessage('First name must be 1-100 characters')
  ],
  validateRequest,
  EmailTestController.testRegistrationEmail
)

router.post('/email-test/payment',
  requireAdmin,
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('firstName').optional().trim().isLength({ min: 1, max: 100 }).withMessage('First name must be 1-100 characters'),
    body('plan').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Plan must be 1-100 characters')
  ],
  validateRequest,
  EmailTestController.testPaymentEmail
)

router.post('/email-test/trial-reminder',
  requireAdmin,
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('firstName').optional().trim().isLength({ min: 1, max: 100 }).withMessage('First name must be 1-100 characters'),
    body('daysLeft').optional().isInt({ min: 1, max: 30 }).withMessage('Days left must be 1-30')
  ],
  validateRequest,
  EmailTestController.testTrialReminderEmail
)

export default router
