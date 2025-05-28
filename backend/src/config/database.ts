import { PrismaClient } from '@prisma/client'
import { logger } from './logger'

// Prisma client singleton
class DatabaseService {
  private static instance: PrismaClient
  
  public static getInstance(): PrismaClient {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new PrismaClient({
        log: [
          { level: 'query', emit: 'event' },
          { level: 'error', emit: 'event' },
          { level: 'info', emit: 'event' },
          { level: 'warn', emit: 'event' },
        ],
      })

      // Log database queries in development
      if (process.env.NODE_ENV === 'development') {
        DatabaseService.instance.$on('query', (e) => {
          logger.debug('Database Query:', {
            query: e.query,
            params: e.params,
            duration: `${e.duration}ms`,
          })
        })
      }

      // Log database errors
      DatabaseService.instance.$on('error', (e) => {
        logger.error('Database Error:', e)
      })

      // Log database info
      DatabaseService.instance.$on('info', (e) => {
        logger.info('Database Info:', e.message)
      })

      // Log database warnings
      DatabaseService.instance.$on('warn', (e) => {
        logger.warn('Database Warning:', e.message)
      })
    }
    
    return DatabaseService.instance
  }

  public static async connect(): Promise<void> {
    try {
      const prisma = DatabaseService.getInstance()
      await prisma.$connect()
      logger.info('Database connected successfully')
    } catch (error) {
      logger.error('Failed to connect to database:', error)
      throw error
    }
  }

  public static async disconnect(): Promise<void> {
    try {
      const prisma = DatabaseService.getInstance()
      await prisma.$disconnect()
      logger.info('Database disconnected successfully')
    } catch (error) {
      logger.error('Failed to disconnect from database:', error)
      throw error
    }
  }

  public static async healthCheck(): Promise<boolean> {
    try {
      const prisma = DatabaseService.getInstance()
      await prisma.$queryRaw`SELECT 1`
      return true
    } catch (error) {
      logger.error('Database health check failed:', error)
      return false
    }
  }
}

export const prisma = DatabaseService.getInstance()
export { DatabaseService }
