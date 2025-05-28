import { Request, Response, NextFunction } from 'express'
import { body, param, query, validationResult, ValidationChain } from 'express-validator'
import { VendorCategory, UserRole } from '@prisma/client'

// Validation error handler
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.type === 'field' ? error.path : 'unknown',
        message: error.msg,
        value: error.type === 'field' ? error.value : undefined
      }))
    })
    return
  }

  next()
}

// Common validation rules
export const emailValidation = body('email')
  .isEmail()
  .normalizeEmail()
  .withMessage('Valid email is required')

export const passwordValidation = body('password')
  .isLength({ min: 8 })
  .withMessage('Password must be at least 8 characters long')
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number')

export const phoneValidation = body('phone')
  .optional()
  .matches(/^\+420\d{9}$/)
  .withMessage('Phone number must be in format +420XXXXXXXXX')

export const uuidValidation = (field: string) =>
  param(field)
    .isUUID()
    .withMessage(`${field} must be a valid UUID`)

// Auth validation schemas
export const registerValidation: ValidationChain[] = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),

  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),

  emailValidation,
  passwordValidation,
  phoneValidation,

  body('role')
    .optional()
    .isIn(Object.values(UserRole))
    .withMessage('Invalid user role')
]

export const loginValidation: ValidationChain[] = [
  emailValidation,
  body('password')
    .notEmpty()
    .withMessage('Password is required')
]

export const changePasswordValidation: ValidationChain[] = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),

  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number')
]

export const forgotPasswordValidation: ValidationChain[] = [
  emailValidation
]

export const resetPasswordValidation: ValidationChain[] = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),

  passwordValidation
]

// Vendor validation schemas
export const createVendorValidation: ValidationChain[] = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Vendor name must be between 2 and 100 characters'),

  body('category')
    .isIn(Object.values(VendorCategory))
    .withMessage('Invalid vendor category'),

  body('description')
    .trim()
    .isLength({ min: 50, max: 2000 })
    .withMessage('Description must be between 50 and 2000 characters'),

  body('shortDescription')
    .trim()
    .isLength({ min: 10, max: 150 })
    .withMessage('Short description must be between 10 and 150 characters'),

  body('businessName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Business name must be between 2 and 100 characters'),

  body('businessId')
    .optional()
    .trim()
    .isLength({ min: 8, max: 12 })
    .withMessage('Business ID must be between 8 and 12 characters'),

  body('website')
    .optional()
    .isURL()
    .withMessage('Website must be a valid URL'),

  emailValidation.withMessage('Valid business email is required'),
  phoneValidation.withMessage('Valid phone number is required'),

  body('workingRadius')
    .optional()
    .isInt({ min: 0, max: 500 })
    .withMessage('Working radius must be between 0 and 500 km'),

  // Address validation
  body('address.street')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Street address must be less than 100 characters'),

  body('address.city')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be between 2 and 50 characters'),

  body('address.postalCode')
    .optional()
    .trim()
    .matches(/^\d{3}\s?\d{2}$/)
    .withMessage('Postal code must be in format XXXXX or XXX XX'),

  body('address.region')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Region must be less than 50 characters'),

  // Price range validation
  body('priceRange.min')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Minimum price must be a positive number'),

  body('priceRange.max')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Maximum price must be a positive number')
    .custom((value, { req }) => {
      if (req.body.priceRange?.min && value < req.body.priceRange.min) {
        throw new Error('Maximum price must be greater than minimum price')
      }
      return true
    }),

  body('priceRange.currency')
    .optional()
    .isIn(['CZK', 'EUR', 'USD'])
    .withMessage('Currency must be CZK, EUR, or USD'),

  body('priceRange.unit')
    .optional()
    .isIn(['per-event', 'per-person', 'per-hour', 'per-day'])
    .withMessage('Invalid price unit')
]

export const updateVendorValidation: ValidationChain[] = [
  uuidValidation('id'),
  ...createVendorValidation.map(validation => validation.optional())
]

// Service validation schemas
export const createServiceValidation: ValidationChain[] = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Service name must be between 2 and 100 characters'),

  body('description')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Service description must be between 10 and 500 characters'),

  body('price')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Price must be a positive number'),

  body('priceType')
    .optional()
    .isIn(['FIXED', 'PER_PERSON', 'PER_HOUR', 'PER_DAY', 'PACKAGE'])
    .withMessage('Invalid price type'),

  body('duration')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Duration must be less than 50 characters'),

  body('includes')
    .optional()
    .isArray()
    .withMessage('Includes must be an array'),

  body('includes.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Each include item must be between 1 and 100 characters')
]

// Review validation schemas
export const createReviewValidation: ValidationChain[] = [
  uuidValidation('vendorId'),

  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),

  body('title')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Review title must be less than 100 characters'),

  body('text')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Review text must be between 10 and 1000 characters'),

  body('quality')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Quality rating must be between 1 and 5'),

  body('communication')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Communication rating must be between 1 and 5'),

  body('value')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Value rating must be between 1 and 5'),

  body('professionalism')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Professionalism rating must be between 1 and 5'),

  body('weddingDate')
    .optional()
    .isISO8601()
    .withMessage('Wedding date must be a valid date')
]

// Inquiry validation schemas
export const createInquiryValidation: ValidationChain[] = [
  uuidValidation('vendorId'),

  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),

  emailValidation,
  phoneValidation,

  body('weddingDate')
    .optional()
    .isISO8601()
    .withMessage('Wedding date must be a valid date'),

  body('message')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Message must be between 10 and 1000 characters')
]

// Query validation schemas
export const paginationValidation: ValidationChain[] = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('sortBy')
    .optional()
    .isIn(['name', 'createdAt', 'updatedAt', 'rating', 'price'])
    .withMessage('Invalid sort field'),

  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc')
]

export const vendorFilterValidation: ValidationChain[] = [
  ...paginationValidation,

  query('category')
    .optional()
    .isIn(Object.values(VendorCategory))
    .withMessage('Invalid vendor category'),

  query('city')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be between 2 and 50 characters'),

  query('region')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Region must be between 2 and 50 characters'),

  query('minPrice')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Minimum price must be a positive number'),

  query('maxPrice')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Maximum price must be a positive number'),

  query('verified')
    .optional()
    .isBoolean()
    .withMessage('Verified must be a boolean'),

  query('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be a boolean'),

  query('search')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Search query must be between 2 and 100 characters')
]

// File upload validation
export const validateImageUpload = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
    res.status(400).json({
      success: false,
      message: 'No files uploaded'
    })
    return
  }

  const files = Array.isArray(req.files) ? req.files : [req.files]
  const maxSize = parseInt(process.env.MAX_FILE_SIZE || '10485760') // 10MB
  const maxFiles = parseInt(process.env.MAX_FILES_PER_UPLOAD || '10')
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

  if (files.length > maxFiles) {
    res.status(400).json({
      success: false,
      message: `Maximum ${maxFiles} files allowed`
    })
    return
  }

  for (const file of files) {
    if (!allowedTypes.includes(file.mimetype)) {
      res.status(400).json({
        success: false,
        message: 'Only JPEG, PNG, and WebP images are allowed'
      })
      return
    }

    if (file.size > maxSize) {
      res.status(400).json({
        success: false,
        message: `File size must be less than ${maxSize / 1024 / 1024}MB`
      })
      return
    }
  }

  next()
}
]
