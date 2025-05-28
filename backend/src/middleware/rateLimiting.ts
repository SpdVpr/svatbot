import { Request, Response, NextFunction } from 'express'
import rateLimit from 'express-rate-limit'
import { RedisService } from '@/config/redis'
import { logger } from '@/config/logger'

// Custom rate limit store using Redis
class RedisStore {
  private prefix: string

  constructor(prefix = 'rl:') {
    this.prefix = prefix
  }

  async increment(key: string): Promise<{ totalHits: number; timeToExpire?: number }> {
    try {
      const redisKey = `${this.prefix}${key}`
      const current = await RedisService.incr(redisKey)
      
      if (current === 1) {
        // Set expiration on first request
        const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000') // 15 minutes
        await RedisService.expire(redisKey, Math.ceil(windowMs / 1000))
      }
      
      const ttl = await RedisService.getInstance().ttl(redisKey)
      
      return {
        totalHits: current,
        timeToExpire: ttl > 0 ? ttl * 1000 : undefined
      }
    } catch (error) {
      logger.error('Redis rate limit store error:', error)
      // Fallback to allowing the request
      return { totalHits: 1 }
    }
  }

  async decrement(key: string): Promise<void> {
    try {
      const redisKey = `${this.prefix}${key}`
      const current = await RedisService.getInstance().get(redisKey)
      
      if (current && parseInt(current) > 0) {
        await RedisService.getInstance().decr(redisKey)
      }
    } catch (error) {
      logger.error('Redis rate limit decrement error:', error)
    }
  }

  async resetKey(key: string): Promise<void> {
    try {
      const redisKey = `${this.prefix}${key}`
      await RedisService.del(redisKey)
    } catch (error) {
      logger.error('Redis rate limit reset error:', error)
    }
  }
}

// Create Redis store instance
const redisStore = new RedisStore()

// General API rate limiting
export const generalRateLimit = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // 100 requests per window
  message: {
    success: false,
    message: 'Too many requests, please try again later',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: RedisService.isConnected() ? redisStore : undefined,
  keyGenerator: (req: Request): string => {
    // Use IP address and user ID if authenticated
    const ip = req.ip || req.connection.remoteAddress || 'unknown'
    const userId = (req as any).user?.id
    return userId ? `${ip}:${userId}` : ip
  },
  handler: (req: Request, res: Response) => {
    logger.warn('Rate limit exceeded:', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
      userId: (req as any).user?.id
    })
    
    res.status(429).json({
      success: false,
      message: 'Too many requests, please try again later',
      retryAfter: '15 minutes'
    })
  }
})

// Strict rate limiting for authentication endpoints
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: RedisService.isConnected() ? new RedisStore('auth:') : undefined,
  keyGenerator: (req: Request): string => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown'
    const email = req.body.email || 'unknown'
    return `${ip}:${email}`
  },
  handler: (req: Request, res: Response) => {
    logger.warn('Auth rate limit exceeded:', {
      ip: req.ip,
      email: req.body.email,
      userAgent: req.get('User-Agent'),
      path: req.path
    })
    
    res.status(429).json({
      success: false,
      message: 'Too many authentication attempts, please try again later',
      retryAfter: '15 minutes'
    })
  }
})

// Rate limiting for file uploads
export const uploadRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // 50 uploads per hour
  message: {
    success: false,
    message: 'Too many file uploads, please try again later',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: RedisService.isConnected() ? new RedisStore('upload:') : undefined,
  keyGenerator: (req: Request): string => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown'
    const userId = (req as any).user?.id
    return userId ? `${ip}:${userId}` : ip
  }
})

// Rate limiting for contact/inquiry forms
export const contactRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 inquiries per hour
  message: {
    success: false,
    message: 'Too many inquiries sent, please try again later',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: RedisService.isConnected() ? new RedisStore('contact:') : undefined,
  keyGenerator: (req: Request): string => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown'
    const email = req.body.email || 'unknown'
    return `${ip}:${email}`
  }
})

// Rate limiting for password reset requests
export const passwordResetRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 password reset attempts per hour
  message: {
    success: false,
    message: 'Too many password reset attempts, please try again later',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: RedisService.isConnected() ? new RedisStore('reset:') : undefined,
  keyGenerator: (req: Request): string => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown'
    const email = req.body.email || 'unknown'
    return `${ip}:${email}`
  }
})

// Custom rate limiting middleware for specific endpoints
export const createCustomRateLimit = (options: {
  windowMs: number
  max: number
  message: string
  keyPrefix?: string
  keyGenerator?: (req: Request) => string
}) => {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    message: {
      success: false,
      message: options.message,
      retryAfter: `${Math.ceil(options.windowMs / 60000)} minutes`
    },
    standardHeaders: true,
    legacyHeaders: false,
    store: RedisService.isConnected() ? new RedisStore(options.keyPrefix) : undefined,
    keyGenerator: options.keyGenerator || ((req: Request): string => {
      const ip = req.ip || req.connection.remoteAddress || 'unknown'
      const userId = (req as any).user?.id
      return userId ? `${ip}:${userId}` : ip
    })
  })
}

// Middleware to check if user is rate limited
export const checkRateLimit = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!RedisService.isConnected()) {
      next()
      return
    }

    const ip = req.ip || req.connection.remoteAddress || 'unknown'
    const userId = (req as any).user?.id
    const key = userId ? `custom:${ip}:${userId}` : `custom:${ip}`
    
    const result = await RedisService.checkRateLimit(key, 100, 900) // 100 requests per 15 minutes
    
    if (!result.allowed) {
      res.status(429).json({
        success: false,
        message: 'Rate limit exceeded',
        remaining: result.remaining,
        resetTime: result.resetTime
      })
      return
    }
    
    // Add rate limit headers
    res.set({
      'X-RateLimit-Limit': '100',
      'X-RateLimit-Remaining': result.remaining.toString(),
      'X-RateLimit-Reset': new Date(result.resetTime).toISOString()
    })
    
    next()
  } catch (error) {
    logger.error('Rate limit check error:', error)
    next() // Continue on error
  }
}
