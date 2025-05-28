import { Request, Response, NextFunction } from 'express'
import { validationResult, ValidationChain } from 'express-validator'

// Validation error handler
export const validateRequest = (
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
  const maxSize = 10 * 1024 * 1024 // 10MB
  const maxFiles = 10
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

// Sanitize input data
export const sanitizeInput = (data: any): any => {
  if (typeof data === 'string') {
    return data.trim()
  }
  
  if (Array.isArray(data)) {
    return data.map(sanitizeInput)
  }
  
  if (typeof data === 'object' && data !== null) {
    const sanitized: any = {}
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeInput(value)
    }
    return sanitized
  }
  
  return data
}

// Pagination validation
export const validatePagination = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { page = 1, limit = 20 } = req.query
  
  const pageNum = parseInt(page as string)
  const limitNum = parseInt(limit as string)
  
  if (isNaN(pageNum) || pageNum < 1) {
    res.status(400).json({
      success: false,
      message: 'Page must be a positive integer'
    })
    return
  }
  
  if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
    res.status(400).json({
      success: false,
      message: 'Limit must be between 1 and 100'
    })
    return
  }
  
  req.query.page = pageNum.toString()
  req.query.limit = limitNum.toString()
  
  next()
}

// Validate UUID
export const validateUUID = (paramName: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const uuid = req.params[paramName]
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    
    if (!uuid || !uuidRegex.test(uuid)) {
      res.status(400).json({
        success: false,
        message: `Invalid ${paramName} format`
      })
      return
    }
    
    next()
  }
}

// Validate vendor category
export const validateVendorCategory = (category: string): boolean => {
  const validCategories = [
    'photographer', 'videographer', 'venue', 'catering', 'flowers',
    'music', 'decoration', 'dress', 'suit', 'makeup', 'hair',
    'transport', 'cake', 'jewelry', 'invitations', 'other'
  ]
  
  return validCategories.includes(category)
}

// Validate price range
export const validatePriceRange = (priceRange: any): boolean => {
  if (!priceRange || typeof priceRange !== 'object') {
    return false
  }
  
  const { min, max, currency, unit } = priceRange
  
  if (typeof min !== 'number' || min < 0) {
    return false
  }
  
  if (typeof max !== 'number' || max < 0) {
    return false
  }
  
  if (min > max) {
    return false
  }
  
  const validCurrencies = ['CZK', 'EUR', 'USD']
  if (!validCurrencies.includes(currency)) {
    return false
  }
  
  const validUnits = ['per_event', 'per_person', 'per_hour', 'per_day', 'package']
  if (!validUnits.includes(unit)) {
    return false
  }
  
  return true
}

// Validate email format
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validate phone number (Czech format)
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^\+420\d{9}$/
  return phoneRegex.test(phone)
}

// Validate URL
export const validateURL = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Rate limiting validation
export const validateRateLimit = (
  maxRequests: number,
  windowMs: number,
  keyGenerator?: (req: Request) => string
) => {
  const requests = new Map<string, { count: number; resetTime: number }>()
  
  return (req: Request, res: Response, next: NextFunction): void => {
    const key = keyGenerator ? keyGenerator(req) : req.ip || 'unknown'
    const now = Date.now()
    const windowStart = now - windowMs
    
    // Clean up old entries
    for (const [k, v] of requests.entries()) {
      if (v.resetTime < now) {
        requests.delete(k)
      }
    }
    
    const current = requests.get(key)
    
    if (!current) {
      requests.set(key, { count: 1, resetTime: now + windowMs })
      next()
      return
    }
    
    if (current.count >= maxRequests) {
      res.status(429).json({
        success: false,
        message: 'Too many requests, please try again later',
        retryAfter: Math.ceil((current.resetTime - now) / 1000)
      })
      return
    }
    
    current.count++
    next()
  }
}

// Validate sort parameters
export const validateSort = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { sortBy, sortOrder = 'desc' } = req.query
  
  if (sortBy) {
    const validSortFields = ['name', 'createdAt', 'updatedAt', 'rating', 'price']
    if (!validSortFields.includes(sortBy as string)) {
      res.status(400).json({
        success: false,
        message: 'Invalid sort field'
      })
      return
    }
  }
  
  if (sortOrder && !['asc', 'desc'].includes(sortOrder as string)) {
    res.status(400).json({
      success: false,
      message: 'Sort order must be asc or desc'
    })
    return
  }
  
  next()
}

// Validate search query
export const validateSearch = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { search } = req.query
  
  if (search) {
    const searchStr = search as string
    
    if (searchStr.length < 2) {
      res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      })
      return
    }
    
    if (searchStr.length > 100) {
      res.status(400).json({
        success: false,
        message: 'Search query must be less than 100 characters'
      })
      return
    }
    
    // Sanitize search query
    req.query.search = searchStr.trim().toLowerCase()
  }
  
  next()
}

// Validate date range
export const validateDateRange = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { startDate, endDate } = req.query
  
  if (startDate) {
    const start = new Date(startDate as string)
    if (isNaN(start.getTime())) {
      res.status(400).json({
        success: false,
        message: 'Invalid start date format'
      })
      return
    }
  }
  
  if (endDate) {
    const end = new Date(endDate as string)
    if (isNaN(end.getTime())) {
      res.status(400).json({
        success: false,
        message: 'Invalid end date format'
      })
      return
    }
  }
  
  if (startDate && endDate) {
    const start = new Date(startDate as string)
    const end = new Date(endDate as string)
    
    if (start > end) {
      res.status(400).json({
        success: false,
        message: 'Start date must be before end date'
      })
      return
    }
  }
  
  next()
}
