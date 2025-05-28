import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import dotenv from 'dotenv'
import { createServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'

// Load environment variables
dotenv.config()

// Import configurations and services
import { logger } from './config/logger'
import { DatabaseService } from './config/database'
import { RedisService } from './config/redis'
import { EmailService } from './services/emailService'

// Import middleware
import { generalRateLimit } from './middleware/rateLimiting'
import { handleValidationErrors } from './middleware/validation'

// Import routes
import authRoutes from './routes/authRoutes'
import vendorRoutes from './routes/vendorRoutes'
import uploadRoutes from './routes/uploadRoutes'
import adminRoutes from './routes/adminRoutes'

// Create Express app
const app = express()
const server = createServer(app)

// Initialize Socket.IO
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
})

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false
}))

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}))

// Compression middleware
app.use(compression())

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Trust proxy (for rate limiting and IP detection)
app.set('trust proxy', 1)

// Rate limiting
app.use(generalRateLimit)

// Request logging middleware
app.use((req, res, next) => {
  logger.info('HTTP Request:', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  })
  next()
})

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const dbHealth = await DatabaseService.healthCheck()
    const redisHealth = RedisService.isConnected()
    const emailHealth = await EmailService.testConnection()

    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        database: dbHealth ? 'healthy' : 'unhealthy',
        redis: redisHealth ? 'healthy' : 'unhealthy',
        email: emailHealth ? 'healthy' : 'unhealthy'
      },
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    }

    const allHealthy = dbHealth && redisHealth && emailHealth
    res.status(allHealthy ? 200 : 503).json(health)
  } catch (error) {
    logger.error('Health check error:', error)
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      message: 'Health check failed'
    })
  }
})

// API routes
const API_PREFIX = `/api/${process.env.API_VERSION || 'v1'}`

app.use(`${API_PREFIX}/auth`, authRoutes)
app.use(`${API_PREFIX}/vendors`, vendorRoutes)
app.use(`${API_PREFIX}/upload`, uploadRoutes)
app.use(`${API_PREFIX}/admin`, adminRoutes)

// API documentation endpoint
app.get(`${API_PREFIX}/docs`, (req, res) => {
  res.json({
    name: 'SvatBot API',
    version: process.env.npm_package_version || '1.0.0',
    description: 'Wedding marketplace API for SvatBot.cz',
    endpoints: {
      auth: {
        'POST /auth/register': 'Register new user',
        'POST /auth/login': 'Login user',
        'POST /auth/refresh': 'Refresh access token',
        'POST /auth/logout': 'Logout user',
        'GET /auth/profile': 'Get user profile',
        'GET /auth/verify/:token': 'Verify email',
        'POST /auth/forgot-password': 'Request password reset',
        'POST /auth/reset-password': 'Reset password'
      },
      vendors: {
        'GET /vendors': 'Get vendors with filtering',
        'GET /vendors/:id': 'Get vendor by ID',
        'POST /vendors': 'Create vendor (authenticated)',
        'PUT /vendors/:id': 'Update vendor (authenticated)',
        'DELETE /vendors/:id': 'Delete vendor (authenticated)'
      },
      upload: {
        'POST /upload/images': 'Upload images (authenticated)',
        'DELETE /upload/images/:id': 'Delete image (authenticated)'
      },
      admin: {
        'GET /admin/stats': 'Get admin statistics',
        'GET /admin/vendors': 'Get all vendors for admin',
        'PUT /admin/vendors/:id/verify': 'Verify vendor',
        'PUT /admin/vendors/:id/feature': 'Feature vendor'
      }
    },
    authentication: 'Bearer token in Authorization header',
    rateLimit: '100 requests per 15 minutes',
    documentation: 'https://docs.svatbot.cz'
  })
})

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.info('Socket.IO client connected:', { socketId: socket.id })

  // Join vendor room for real-time updates
  socket.on('join-vendor', (vendorId: string) => {
    socket.join(`vendor-${vendorId}`)
    logger.info('Socket joined vendor room:', { socketId: socket.id, vendorId })
  })

  // Join admin room
  socket.on('join-admin', () => {
    socket.join('admin')
    logger.info('Socket joined admin room:', { socketId: socket.id })
  })

  // Handle disconnect
  socket.on('disconnect', () => {
    logger.info('Socket.IO client disconnected:', { socketId: socket.id })
  })
})

// Make io available to routes
app.set('io', io)

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

// Global error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip
  })

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  res.status(error.status || 500).json({
    success: false,
    message: isDevelopment ? error.message : 'Internal server error',
    ...(isDevelopment && { stack: error.stack }),
    timestamp: new Date().toISOString()
  })
})

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully')
  
  server.close(async () => {
    try {
      await DatabaseService.disconnect()
      await RedisService.disconnect()
      logger.info('Server shut down successfully')
      process.exit(0)
    } catch (error) {
      logger.error('Error during shutdown:', error)
      process.exit(1)
    }
  })
})

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully')
  
  server.close(async () => {
    try {
      await DatabaseService.disconnect()
      await RedisService.disconnect()
      logger.info('Server shut down successfully')
      process.exit(0)
    } catch (error) {
      logger.error('Error during shutdown:', error)
      process.exit(1)
    }
  })
})

// Initialize services and start server
async function startServer() {
  try {
    // Initialize database
    await DatabaseService.connect()
    
    // Initialize Redis
    await RedisService.connect()
    
    // Initialize email service
    EmailService.initialize()
    
    // Start server
    const PORT = process.env.PORT || 3001
    server.listen(PORT, () => {
      logger.info(`🚀 SvatBot API server running on port ${PORT}`)
      logger.info(`📚 API Documentation: http://localhost:${PORT}/api/v1/docs`)
      logger.info(`🏥 Health Check: http://localhost:${PORT}/health`)
      logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
    })
  } catch (error) {
    logger.error('Failed to start server:', error)
    process.exit(1)
  }
}

// Start the server
startServer()

export { app, server, io }
