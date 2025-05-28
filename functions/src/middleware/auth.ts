import { Request, Response, NextFunction } from 'express'
import { auth } from '../config/firebase'
import { UserRole } from '../types'

// Extend Express Request to include user
export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string
    email: string
    role: UserRole
    verified: boolean
    customClaims?: any
  }
}

// Verify Firebase Auth token
export const verifyToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Authorization header with Bearer token required'
      })
      return
    }

    const token = authHeader.split('Bearer ')[1]
    
    if (!token) {
      res.status(401).json({
        success: false,
        message: 'No token provided'
      })
      return
    }

    // Verify the token with Firebase Auth
    const decodedToken = await auth.verifyIdToken(token)
    
    // Get user custom claims for role information
    const userRecord = await auth.getUser(decodedToken.uid)
    
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || '',
      role: userRecord.customClaims?.role || UserRole.USER,
      verified: decodedToken.email_verified || false,
      customClaims: userRecord.customClaims
    }

    next()
  } catch (error) {
    console.error('Token verification error:', error)
    
    if (error.code === 'auth/id-token-expired') {
      res.status(401).json({
        success: false,
        message: 'Token expired'
      })
    } else if (error.code === 'auth/id-token-revoked') {
      res.status(401).json({
        success: false,
        message: 'Token revoked'
      })
    } else {
      res.status(401).json({
        success: false,
        message: 'Invalid token'
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
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next()
      return
    }

    const token = authHeader.split('Bearer ')[1]
    
    if (!token) {
      next()
      return
    }

    const decodedToken = await auth.verifyIdToken(token)
    const userRecord = await auth.getUser(decodedToken.uid)
    
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || '',
      role: userRecord.customClaims?.role || UserRole.USER,
      verified: decodedToken.email_verified || false,
      customClaims: userRecord.customClaims
    }

    next()
  } catch (error) {
    // Silently continue without authentication
    next()
  }
}

// Require specific role
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

// Admin only
export const requireAdmin = requireRole([UserRole.ADMIN, UserRole.SUPER_ADMIN])

// Super admin only
export const requireSuperAdmin = requireRole([UserRole.SUPER_ADMIN])

// Vendor or admin
export const requireVendorOrAdmin = requireRole([
  UserRole.VENDOR,
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN
])

// Email verification required
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

// Check vendor ownership
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

    // Import here to avoid circular dependency
    const { collections } = await import('../config/firebase')
    
    const vendorDoc = await collections.vendors.doc(vendorId).get()
    
    if (!vendorDoc.exists) {
      res.status(404).json({
        success: false,
        message: 'Vendor not found'
      })
      return
    }

    const vendorData = vendorDoc.data()
    
    if (vendorData?.userId !== req.user.uid) {
      res.status(403).json({
        success: false,
        message: 'Access denied: You can only manage your own vendor profile'
      })
      return
    }

    next()
  } catch (error) {
    console.error('Vendor ownership check error:', error)
    res.status(500).json({
      success: false,
      message: 'Authorization check failed'
    })
  }
}

// Set user role (admin function)
export const setUserRole = async (uid: string, role: UserRole): Promise<void> => {
  try {
    await auth.setCustomUserClaims(uid, { role })
  } catch (error) {
    console.error('Error setting user role:', error)
    throw error
  }
}

// Get user by email
export const getUserByEmail = async (email: string) => {
  try {
    return await auth.getUserByEmail(email)
  } catch (error) {
    console.error('Error getting user by email:', error)
    throw error
  }
}

// Create user
export const createUser = async (userData: {
  email: string
  password: string
  displayName?: string
  emailVerified?: boolean
}) => {
  try {
    return await auth.createUser(userData)
  } catch (error) {
    console.error('Error creating user:', error)
    throw error
  }
}

// Update user
export const updateUser = async (uid: string, userData: any) => {
  try {
    return await auth.updateUser(uid, userData)
  } catch (error) {
    console.error('Error updating user:', error)
    throw error
  }
}

// Delete user
export const deleteUser = async (uid: string) => {
  try {
    return await auth.deleteUser(uid)
  } catch (error) {
    console.error('Error deleting user:', error)
    throw error
  }
}

// Generate custom token
export const generateCustomToken = async (uid: string, additionalClaims?: any) => {
  try {
    return await auth.createCustomToken(uid, additionalClaims)
  } catch (error) {
    console.error('Error generating custom token:', error)
    throw error
  }
}

// Revoke refresh tokens
export const revokeRefreshTokens = async (uid: string) => {
  try {
    return await auth.revokeRefreshTokens(uid)
  } catch (error) {
    console.error('Error revoking refresh tokens:', error)
    throw error
  }
}
