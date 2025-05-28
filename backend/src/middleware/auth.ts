import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { prisma } from '@/config/database'
import { logger } from '@/config/logger'
import { UserRole } from '@prisma/client'

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    email: string
    role: UserRole
    verified: boolean
  }
}

// JWT token verification middleware
export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access token required'
      })
      return
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string
      email: string
      role: UserRole
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        verified: true,
        active: true
      }
    })

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not found'
      })
      return
    }

    if (!user.active) {
      res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      })
      return
    }

    // Attach user to request
    req.user = user
    next()
  } catch (error) {
    logger.error('Authentication error:', error)
    
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: 'Invalid token'
      })
    } else if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: 'Token expired'
      })
    } else {
      res.status(500).json({
        success: false,
        message: 'Authentication failed'
      })
    }
  }
}

// Optional authentication - doesn't fail if no token
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      next()
      return
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string
      email: string
      role: UserRole
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        verified: true,
        active: true
      }
    })

    if (user && user.active) {
      req.user = user
    }

    next()
  } catch (error) {
    // Silently continue without authentication
    next()
  }
}

// Role-based authorization middleware
export const requireRole = (roles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      })
      return
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      })
      return
    }

    next()
  }
}

// Admin only middleware
export const requireAdmin = requireRole([UserRole.ADMIN, UserRole.SUPER_ADMIN])

// Super admin only middleware
export const requireSuperAdmin = requireRole([UserRole.SUPER_ADMIN])

// Vendor or admin middleware
export const requireVendorOrAdmin = requireRole([
  UserRole.VENDOR, 
  UserRole.ADMIN, 
  UserRole.SUPER_ADMIN
])

// Email verification middleware
export const requireVerifiedEmail = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required'
    })
    return
  }

  if (!req.user.verified) {
    res.status(403).json({
      success: false,
      message: 'Email verification required'
    })
    return
  }

  next()
}

// Vendor ownership middleware - checks if user owns the vendor
export const requireVendorOwnership = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      })
      return
    }

    // Admins can access any vendor
    if (req.user.role === UserRole.ADMIN || req.user.role === UserRole.SUPER_ADMIN) {
      next()
      return
    }

    const vendorId = req.params.id || req.params.vendorId
    if (!vendorId) {
      res.status(400).json({
        success: false,
        message: 'Vendor ID required'
      })
      return
    }

    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
      select: { userId: true }
    })

    if (!vendor) {
      res.status(404).json({
        success: false,
        message: 'Vendor not found'
      })
      return
    }

    if (vendor.userId !== req.user.id) {
      res.status(403).json({
        success: false,
        message: 'Access denied: You can only manage your own vendor profile'
      })
      return
    }

    next()
  } catch (error) {
    logger.error('Vendor ownership check error:', error)
    res.status(500).json({
      success: false,
      message: 'Authorization check failed'
    })
  }
}

// Generate JWT token
export const generateToken = (payload: {
  userId: string
  email: string
  role: UserRole
}): string => {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  })
}

// Generate refresh token
export const generateRefreshToken = (payload: {
  userId: string
  email: string
}): string => {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d'
  })
}

// Verify refresh token
export const verifyRefreshToken = (token: string): {
  userId: string
  email: string
} => {
  return jwt.verify(token, process.env.JWT_SECRET!) as {
    userId: string
    email: string
  }
}
