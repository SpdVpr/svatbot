import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import { prisma } from '@/config/database'
import { logger } from '@/config/logger'
import {
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
  AuthenticatedRequest
} from '@/middleware/auth'
import { UserRole } from '@prisma/client'
import { EmailService } from '@/services/emailService'
import { RedisService } from '@/config/redis'
import crypto from 'crypto'

export class AuthController {
  // Register new user
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { firstName, lastName, email, password, phone, role = UserRole.USER } = req.body

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      })

      if (existingUser) {
        res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        })
        return
      }

      // Hash password
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12')
      const hashedPassword = await bcrypt.hash(password, saltRounds)

      // Create user
      const user = await prisma.user.create({
        data: {
          firstName,
          lastName,
          email,
          password: hashedPassword,
          phone,
          role,
          verified: false
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          role: true,
          verified: true,
          createdAt: true
        }
      })

      // Generate email verification token
      const verificationToken = crypto.randomBytes(32).toString('hex')
      await prisma.emailToken.create({
        data: {
          userId: user.id,
          token: verificationToken,
          type: 'EMAIL_VERIFICATION',
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        }
      })

      // Send verification email
      try {
        await EmailService.sendVerificationEmail(user.email, verificationToken)
      } catch (emailError) {
        logger.error('Failed to send verification email:', emailError)
        // Don't fail registration if email fails
      }

      // Generate tokens
      const accessToken = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role
      })

      const refreshToken = generateRefreshToken({
        userId: user.id,
        email: user.email
      })

      logger.info('User registered successfully:', { userId: user.id, email: user.email })

      res.status(201).json({
        success: true,
        message: 'User registered successfully. Please check your email for verification.',
        data: {
          user,
          accessToken,
          refreshToken
        }
      })
    } catch (error) {
      logger.error('Registration error:', error)
      res.status(500).json({
        success: false,
        message: 'Registration failed'
      })
    }
  }

  // Login user
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body

      // Find user
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          password: true,
          phone: true,
          role: true,
          verified: true,
          active: true
        }
      })

      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password'
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

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password)
      if (!isValidPassword) {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        })
        return
      }

      // Generate tokens
      const accessToken = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role
      })

      const refreshToken = generateRefreshToken({
        userId: user.id,
        email: user.email
      })

      // Store refresh token in database
      await prisma.adminSession.create({
        data: {
          userId: user.id,
          token: refreshToken,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        }
      })

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user

      logger.info('User logged in successfully:', { userId: user.id, email: user.email })

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: userWithoutPassword,
          accessToken,
          refreshToken
        }
      })
    } catch (error) {
      logger.error('Login error:', error)
      res.status(500).json({
        success: false,
        message: 'Login failed'
      })
    }
  }

  // Refresh access token
  static async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body

      if (!refreshToken) {
        res.status(401).json({
          success: false,
          message: 'Refresh token required'
        })
        return
      }

      // Verify refresh token
      const decoded = verifyRefreshToken(refreshToken)

      // Check if token exists in database
      const session = await prisma.adminSession.findUnique({
        where: { token: refreshToken },
        include: { user: true }
      })

      if (!session || session.expiresAt < new Date()) {
        res.status(401).json({
          success: false,
          message: 'Invalid or expired refresh token'
        })
        return
      }

      if (!session.user.active) {
        res.status(401).json({
          success: false,
          message: 'Account is deactivated'
        })
        return
      }

      // Generate new access token
      const accessToken = generateToken({
        userId: session.user.id,
        email: session.user.email,
        role: session.user.role
      })

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          accessToken
        }
      })
    } catch (error) {
      logger.error('Token refresh error:', error)
      res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      })
    }
  }

  // Logout user
  static async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body

      if (refreshToken) {
        // Remove refresh token from database
        await prisma.adminSession.deleteMany({
          where: { token: refreshToken }
        })
      }

      // If user is authenticated, remove all their sessions
      if (req.user) {
        await prisma.adminSession.deleteMany({
          where: { userId: req.user.id }
        })
      }

      res.json({
        success: true,
        message: 'Logout successful'
      })
    } catch (error) {
      logger.error('Logout error:', error)
      res.status(500).json({
        success: false,
        message: 'Logout failed'
      })
    }
  }

  // Get current user profile
  static async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        })
        return
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          role: true,
          verified: true,
          active: true,
          createdAt: true,
          updatedAt: true,
          vendor: {
            select: {
              id: true,
              name: true,
              slug: true,
              category: true,
              verified: true,
              featured: true,
              premium: true
            }
          }
        }
      })

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        })
        return
      }

      res.json({
        success: true,
        data: { user }
      })
    } catch (error) {
      logger.error('Get profile error:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to get user profile'
      })
    }
  }

  // Verify email
  static async verifyEmail(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.params

      const emailToken = await prisma.emailToken.findUnique({
        where: { token },
        include: { user: true }
      })

      if (!emailToken || emailToken.used || emailToken.expiresAt < new Date()) {
        res.status(400).json({
          success: false,
          message: 'Invalid or expired verification token'
        })
        return
      }

      // Update user as verified
      await prisma.user.update({
        where: { id: emailToken.userId },
        data: { verified: true }
      })

      // Mark token as used
      await prisma.emailToken.update({
        where: { id: emailToken.id },
        data: { used: true }
      })

      logger.info('Email verified successfully:', { userId: emailToken.userId })

      res.json({
        success: true,
        message: 'Email verified successfully'
      })
    } catch (error) {
      logger.error('Email verification error:', error)
      res.status(500).json({
        success: false,
        message: 'Email verification failed'
      })
    }
  }

  // Forgot password
  static async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body

      const user = await prisma.user.findUnique({
        where: { email }
      })

      if (!user) {
        // Don't reveal if email exists
        res.json({
          success: true,
          message: 'If the email exists, a password reset link has been sent'
        })
        return
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex')
      await prisma.passwordReset.create({
        data: {
          userId: user.id,
          token: resetToken,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
        }
      })

      // Send reset email
      try {
        await EmailService.sendPasswordResetEmail(user.email, resetToken)
      } catch (emailError) {
        logger.error('Failed to send password reset email:', emailError)
      }

      res.json({
        success: true,
        message: 'If the email exists, a password reset link has been sent'
      })
    } catch (error) {
      logger.error('Forgot password error:', error)
      res.status(500).json({
        success: false,
        message: 'Password reset request failed'
      })
    }
  }

  // Reset password
  static async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token, password } = req.body

      const resetToken = await prisma.passwordReset.findUnique({
        where: { token },
        include: { user: true }
      })

      if (!resetToken || resetToken.used || resetToken.expiresAt < new Date()) {
        res.status(400).json({
          success: false,
          message: 'Invalid or expired reset token'
        })
        return
      }

      // Hash new password
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12')
      const hashedPassword = await bcrypt.hash(password, saltRounds)

      // Update password
      await prisma.user.update({
        where: { id: resetToken.userId },
        data: { password: hashedPassword }
      })

      // Mark token as used
      await prisma.passwordReset.update({
        where: { id: resetToken.id },
        data: { used: true }
      })

      // Invalidate all user sessions
      await prisma.adminSession.deleteMany({
        where: { userId: resetToken.userId }
      })

      logger.info('Password reset successfully:', { userId: resetToken.userId })

      res.json({
        success: true,
        message: 'Password reset successfully'
      })
    } catch (error) {
      logger.error('Reset password error:', error)
      res.status(500).json({
        success: false,
        message: 'Password reset failed'
      })
    }
  }

  // Update user profile
  static async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        })
        return
      }

      const { firstName, lastName, phone } = req.body

      const updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: {
          firstName,
          lastName,
          phone
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          role: true,
          verified: true,
          active: true,
          createdAt: true,
          updatedAt: true
        }
      })

      logger.info('Profile updated successfully:', { userId: req.user.id })

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: { user: updatedUser }
      })
    } catch (error) {
      logger.error('Update profile error:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to update profile'
      })
    }
  }

  // Change password
  static async changePassword(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        })
        return
      }

      const { currentPassword, newPassword } = req.body

      // Get user with password
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { id: true, password: true }
      })

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        })
        return
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.password)
      if (!isValidPassword) {
        res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        })
        return
      }

      // Hash new password
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12')
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds)

      // Update password
      await prisma.user.update({
        where: { id: req.user.id },
        data: { password: hashedPassword }
      })

      // Invalidate all user sessions except current one
      await prisma.adminSession.deleteMany({
        where: { userId: req.user.id }
      })

      logger.info('Password changed successfully:', { userId: req.user.id })

      res.json({
        success: true,
        message: 'Password changed successfully'
      })
    } catch (error) {
      logger.error('Change password error:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to change password'
      })
    }
  }

  // Resend verification email
  static async resendVerification(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        })
        return
      }

      if (req.user.verified) {
        res.status(400).json({
          success: false,
          message: 'Email is already verified'
        })
        return
      }

      // Delete existing tokens
      await prisma.emailToken.deleteMany({
        where: {
          userId: req.user.id,
          type: 'EMAIL_VERIFICATION'
        }
      })

      // Generate new verification token
      const verificationToken = crypto.randomBytes(32).toString('hex')
      await prisma.emailToken.create({
        data: {
          userId: req.user.id,
          token: verificationToken,
          type: 'EMAIL_VERIFICATION',
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        }
      })

      // Send verification email
      try {
        await EmailService.sendVerificationEmail(req.user.email, verificationToken)
      } catch (emailError) {
        logger.error('Failed to send verification email:', emailError)
        res.status(500).json({
          success: false,
          message: 'Failed to send verification email'
        })
        return
      }

      res.json({
        success: true,
        message: 'Verification email sent successfully'
      })
    } catch (error) {
      logger.error('Resend verification error:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to resend verification email'
      })
    }
  }
}
