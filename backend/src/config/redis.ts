import { createClient, RedisClientType } from 'redis'
import { logger } from './logger'

class RedisService {
  private static instance: RedisClientType
  private static connected = false

  public static getInstance(): RedisClientType {
    if (!RedisService.instance) {
      RedisService.instance = createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > 10) {
              logger.error('Redis: Too many reconnection attempts, giving up')
              return new Error('Too many reconnection attempts')
            }
            return Math.min(retries * 50, 1000)
          }
        }
      })

      // Event listeners
      RedisService.instance.on('connect', () => {
        logger.info('Redis: Connecting...')
      })

      RedisService.instance.on('ready', () => {
        logger.info('Redis: Connected and ready')
        RedisService.connected = true
      })

      RedisService.instance.on('error', (error) => {
        logger.error('Redis Error:', error)
        RedisService.connected = false
      })

      RedisService.instance.on('end', () => {
        logger.info('Redis: Connection ended')
        RedisService.connected = false
      })

      RedisService.instance.on('reconnecting', () => {
        logger.info('Redis: Reconnecting...')
      })
    }

    return RedisService.instance
  }

  public static async connect(): Promise<void> {
    try {
      const client = RedisService.getInstance()
      if (!RedisService.connected) {
        await client.connect()
      }
    } catch (error) {
      logger.error('Failed to connect to Redis:', error)
      throw error
    }
  }

  public static async disconnect(): Promise<void> {
    try {
      const client = RedisService.getInstance()
      if (RedisService.connected) {
        await client.disconnect()
      }
    } catch (error) {
      logger.error('Failed to disconnect from Redis:', error)
      throw error
    }
  }

  public static isConnected(): boolean {
    return RedisService.connected
  }

  // Cache helpers
  public static async get(key: string): Promise<string | null> {
    try {
      const client = RedisService.getInstance()
      return await client.get(key)
    } catch (error) {
      logger.error('Redis GET error:', error)
      return null
    }
  }

  public static async set(
    key: string, 
    value: string, 
    ttl?: number
  ): Promise<boolean> {
    try {
      const client = RedisService.getInstance()
      if (ttl) {
        await client.setEx(key, ttl, value)
      } else {
        await client.set(key, value)
      }
      return true
    } catch (error) {
      logger.error('Redis SET error:', error)
      return false
    }
  }

  public static async del(key: string): Promise<boolean> {
    try {
      const client = RedisService.getInstance()
      await client.del(key)
      return true
    } catch (error) {
      logger.error('Redis DEL error:', error)
      return false
    }
  }

  public static async exists(key: string): Promise<boolean> {
    try {
      const client = RedisService.getInstance()
      const result = await client.exists(key)
      return result === 1
    } catch (error) {
      logger.error('Redis EXISTS error:', error)
      return false
    }
  }

  public static async incr(key: string): Promise<number> {
    try {
      const client = RedisService.getInstance()
      return await client.incr(key)
    } catch (error) {
      logger.error('Redis INCR error:', error)
      return 0
    }
  }

  public static async expire(key: string, ttl: number): Promise<boolean> {
    try {
      const client = RedisService.getInstance()
      await client.expire(key, ttl)
      return true
    } catch (error) {
      logger.error('Redis EXPIRE error:', error)
      return false
    }
  }

  // Session helpers
  public static async setSession(
    sessionId: string, 
    data: object, 
    ttl: number = 86400
  ): Promise<boolean> {
    return await RedisService.set(
      `session:${sessionId}`, 
      JSON.stringify(data), 
      ttl
    )
  }

  public static async getSession(sessionId: string): Promise<object | null> {
    try {
      const data = await RedisService.get(`session:${sessionId}`)
      return data ? JSON.parse(data) : null
    } catch (error) {
      logger.error('Redis session GET error:', error)
      return null
    }
  }

  public static async deleteSession(sessionId: string): Promise<boolean> {
    return await RedisService.del(`session:${sessionId}`)
  }

  // Rate limiting helpers
  public static async checkRateLimit(
    key: string, 
    limit: number, 
    window: number
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    try {
      const client = RedisService.getInstance()
      const current = await client.incr(key)
      
      if (current === 1) {
        await client.expire(key, window)
      }
      
      const ttl = await client.ttl(key)
      const resetTime = Date.now() + (ttl * 1000)
      
      return {
        allowed: current <= limit,
        remaining: Math.max(0, limit - current),
        resetTime
      }
    } catch (error) {
      logger.error('Redis rate limit error:', error)
      return { allowed: true, remaining: limit, resetTime: Date.now() + window * 1000 }
    }
  }
}

export const redis = RedisService.getInstance()
export { RedisService }
