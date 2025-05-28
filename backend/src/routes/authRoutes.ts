import { Router } from 'express'
import { AuthController } from '@/controllers/authController'
import { 
  authenticateToken,
  optionalAuth
} from '@/middleware/auth'
import {
  registerValidation,
  loginValidation,
  changePasswordValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  handleValidationErrors
} from '@/middleware/validation'
import { 
  authRateLimit,
  passwordResetRateLimit
} from '@/middleware/rateLimiting'

const router = Router()

// Public routes
router.post('/register', 
  authRateLimit,
  registerValidation,
  handleValidationErrors,
  AuthController.register
)

router.post('/login',
  authRateLimit,
  loginValidation,
  handleValidationErrors,
  AuthController.login
)

router.post('/refresh',
  authRateLimit,
  AuthController.refreshToken
)

router.post('/forgot-password',
  passwordResetRateLimit,
  forgotPasswordValidation,
  handleValidationErrors,
  AuthController.forgotPassword
)

router.post('/reset-password',
  passwordResetRateLimit,
  resetPasswordValidation,
  handleValidationErrors,
  AuthController.resetPassword
)

router.get('/verify/:token',
  AuthController.verifyEmail
)

// Protected routes
router.post('/logout',
  optionalAuth,
  AuthController.logout
)

router.get('/profile',
  authenticateToken,
  AuthController.getProfile
)

router.put('/profile',
  authenticateToken,
  // TODO: Add profile update validation
  AuthController.updateProfile
)

router.post('/change-password',
  authenticateToken,
  changePasswordValidation,
  handleValidationErrors,
  AuthController.changePassword
)

router.post('/resend-verification',
  authenticateToken,
  AuthController.resendVerification
)

export default router
