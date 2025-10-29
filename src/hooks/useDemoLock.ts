'use client'

import { useCallback } from 'react'
import { useAuth } from './useAuth'
import { useIsDemoUser } from './useDemoSettings'
import { showDemoLockedAlert } from '@/utils/demoHelpers'

/**
 * Hook to wrap mutation functions with DEMO lock check
 * Usage:
 * 
 * const { withDemoCheck } = useDemoLock()
 * 
 * const saveData = async () => {
 *   return withDemoCheck(async () => {
 *     // Your save logic here
 *     await updateDoc(...)
 *   })
 * }
 */
export function useDemoLock() {
  const { user } = useAuth()
  const { isDemoUser, isLocked, loading } = useIsDemoUser(user?.id)

  /**
   * Wraps a mutation function with DEMO lock check
   * Returns the result of the function if allowed, throws error if locked
   */
  const withDemoCheck = useCallback(async <T,>(
    fn: () => Promise<T>,
    options?: {
      silentFail?: boolean // If true, returns null instead of throwing
      customMessage?: string // Custom alert message
    }
  ): Promise<T | null> => {
    // If not demo user, always allow
    if (!isDemoUser) {
      return fn()
    }

    // If demo user and locked, prevent action
    if (isLocked) {
      console.log('🔒 DEMO account is locked - action prevented')
      
      if (options?.customMessage) {
        alert(options.customMessage)
      } else {
        showDemoLockedAlert()
      }

      if (options?.silentFail) {
        return null
      }

      throw new Error('DEMO_LOCKED')
    }

    // Demo user but unlocked - allow action
    return fn()
  }, [isDemoUser, isLocked])

  /**
   * Check if action is allowed (without executing anything)
   */
  const canMakeChanges = useCallback(() => {
    if (!isDemoUser) return true
    return !isLocked
  }, [isDemoUser, isLocked])

  return {
    withDemoCheck,
    canMakeChanges,
    isDemoUser,
    isLocked,
    loading
  }
}

