import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'

// Initialize Firebase Admin
admin.initializeApp()

// Initialize Express app
const app = express()

// Trust proxy - required for Firebase Functions and rate limiting
app.set('trust proxy', true)

// Security middleware
app.use(helmet())
app.use(cors({ origin: true }))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests, please try again later'
  }
})
app.use(limiter)

// Import routes
import authRoutes from './routes/authRoutes'
import vendorRoutes from './routes/vendorRoutes'
import adminRoutes from './routes/adminRoutes'
import uploadRoutes from './routes/uploadRoutes'

// API routes
// Note: The Firebase Function is already named 'api', so we don't need /api prefix here
app.use('/v1/auth', authRoutes)
app.use('/v1/vendors', vendorRoutes)
app.use('/v1/admin', adminRoutes)
app.use('/v1/upload', uploadRoutes)

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    service: 'svatbot-api'
  })
})

// API documentation
app.get('/v1/docs', (req, res) => {
  res.json({
    name: 'SvatBot Firebase API',
    version: '1.0.0',
    description: 'Wedding marketplace API powered by Firebase',
    endpoints: {
      auth: {
        'POST /auth/register': 'Register new user',
        'POST /auth/login': 'Login user',
        'GET /auth/profile': 'Get user profile',
        'PUT /auth/profile': 'Update user profile'
      },
      vendors: {
        'GET /vendors': 'Get vendors with filtering',
        'GET /vendors/:id': 'Get vendor by ID',
        'POST /vendors': 'Create vendor (authenticated)',
        'PUT /vendors/:id': 'Update vendor (authenticated)',
        'DELETE /vendors/:id': 'Delete vendor (authenticated)'
      },
      upload: {
        'POST /upload/images': 'Upload images to Firebase Storage',
        'DELETE /upload/images/:filename': 'Delete image from Firebase Storage'
      },
      admin: {
        'GET /admin/stats': 'Get admin statistics',
        'PUT /admin/vendors/:id/verify': 'Verify vendor',
        'PUT /admin/vendors/:id/feature': 'Feature vendor'
      }
    },
    authentication: 'Firebase Auth token in Authorization header',
    documentation: 'https://docs.svatbot.cz'
  })
})

// Error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('API Error:', error)
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    timestamp: new Date().toISOString()
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  })
})

// Export the Express app as a Firebase Function
export const api = functions.region('europe-west1').https.onRequest(app)

// Cloud Functions for specific operations
export { default as onUserCreate } from './triggers/onUserCreate'
export { default as onVendorUpdate } from './triggers/onVendorUpdate'
export { default as onReviewCreate } from './triggers/onReviewCreate'
export { default as onReviewUpdate } from './triggers/onReviewUpdate'
export { default as onInquiryCreate } from './triggers/onInquiryCreate'
export { default as scheduledCleanup } from './triggers/scheduledCleanup'

// Email triggers
export { default as onPaymentSuccess } from './triggers/onPaymentSuccess'
export { default as checkTrialExpiry } from './triggers/checkTrialExpiry'

// Marketplace vendor triggers
export { default as onMarketplaceVendorCreate } from './triggers/onMarketplaceVendorCreate'
export { default as onMarketplaceVendorUpdate } from './triggers/onMarketplaceVendorUpdate'

// HTTPS functions
export { sendVendorContactEmails } from './https/sendVendorContactEmails'
export { sendPaymentEmail } from './https/sendPaymentEmail'
export { sendContactFormEmail } from './https/sendContactFormEmail'

// Callable functions for client-side
export { default as getVendors } from './callable/getVendors'
export { default as createVendor } from './callable/createVendor'
// export { default as updateVendor } from './callable/updateVendor'
// export { default as deleteVendor } from './callable/deleteVendor'
// export { default as uploadImages } from './callable/uploadImages'
// export { default as sendInquiry } from './callable/sendInquiry'
// export { default as addReview } from './callable/addReview'
// export { default as toggleFavorite } from './callable/toggleFavorite'

// Admin setup function (one-time use)
export { setAdminRole } from './setAdminRole'
