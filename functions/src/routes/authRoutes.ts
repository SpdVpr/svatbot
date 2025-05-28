import { Router } from 'express'
import { AuthController } from '../controllers/AuthController'
import { verifyToken, optionalAuth } from '../middleware/auth'
import { validateRequest } from '../middleware/validation'
import { body } from 'express-validator'

const router = Router()

// Validation rules
const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('firstName').trim().isLength({ min: 2, max: 50 }).withMessage('First name must be 2-50 characters'),
  body('lastName').trim().isLength({ min: 2, max: 50 }).withMessage('Last name must be 2-50 characters'),
  body('phone').optional().matches(/^\+420\d{9}$/).withMessage('Phone must be in format +420XXXXXXXXX')
]

const updateProfileValidation = [
  body('firstName').optional().trim().isLength({ min: 2, max: 50 }).withMessage('First name must be 2-50 characters'),
  body('lastName').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Last name must be 2-50 characters'),
  body('phone').optional().matches(/^\+420\d{9}$/).withMessage('Phone must be in format +420XXXXXXXXX')
]

// Public routes
router.post('/register', 
  registerValidation,
  validateRequest,
  AuthController.register
)

router.post('/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
  ],
  validateRequest,
  AuthController.login
)

router.post('/verify-email',
  [body('oobCode').notEmpty().withMessage('Verification code is required')],
  validateRequest,
  AuthController.verifyEmail
)

router.post('/send-verification',
  verifyToken,
  AuthController.sendVerificationEmail
)

router.post('/reset-password',
  [body('email').isEmail().normalizeEmail()],
  validateRequest,
  AuthController.sendPasswordReset
)

router.post('/confirm-password-reset',
  [
    body('oobCode').notEmpty().withMessage('Reset code is required'),
    body('newPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
  ],
  validateRequest,
  AuthController.confirmPasswordReset
)

// Protected routes
router.get('/profile',
  verifyToken,
  AuthController.getProfile
)

router.put('/profile',
  verifyToken,
  updateProfileValidation,
  validateRequest,
  AuthController.updateProfile
)

router.post('/change-password',
  verifyToken,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
  ],
  validateRequest,
  AuthController.changePassword
)

router.post('/logout',
  verifyToken,
  AuthController.logout
)

router.delete('/account',
  verifyToken,
  [body('password').notEmpty().withMessage('Password confirmation required')],
  validateRequest,
  AuthController.deleteAccount
)

// Admin routes
router.post('/set-role',
  verifyToken,
  [
    body('userId').notEmpty().withMessage('User ID is required'),
    body('role').isIn(['user', 'vendor', 'admin', 'super_admin']).withMessage('Invalid role')
  ],
  validateRequest,
  AuthController.setUserRole
)

router.get('/users',
  verifyToken,
  AuthController.getUsers
)

export default router
