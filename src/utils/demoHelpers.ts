import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

const DEMO_SETTINGS_DOC_ID = 'demo-config'

/**
 * Get the wedding date for a user
 * - For DEMO user: returns fixed wedding date from settings
 * - For regular users: returns their actual wedding date
 */
export async function getWeddingDateForUser(
  userId: string,
  actualWeddingDate: Date | null
): Promise<Date | null> {
  try {
    // Get demo settings
    const demoSettingsRef = doc(db, 'demoSettings', DEMO_SETTINGS_DOC_ID)
    const demoSettingsSnap = await getDoc(demoSettingsRef)
    
    if (demoSettingsSnap.exists()) {
      const demoSettings = demoSettingsSnap.data()
      
      // Check if this is the demo user
      if (demoSettings.demoUserId === userId && demoSettings.fixedWeddingDate) {
        console.log('🎭 Using fixed wedding date for DEMO user')
        return demoSettings.fixedWeddingDate.toDate()
      }
    }
    
    // Return actual wedding date for regular users
    return actualWeddingDate
  } catch (error) {
    console.error('Error getting wedding date:', error)
    return actualWeddingDate
  }
}

/**
 * Calculate days until wedding
 * - For DEMO user: uses fixed wedding date
 * - For regular users: uses actual wedding date
 */
export function calculateDaysUntilWedding(
  weddingDate: Date | null,
  isDemoUser: boolean = false
): number | null {
  if (!weddingDate) return null
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const wedding = new Date(weddingDate)
  wedding.setHours(0, 0, 0, 0)
  
  const diffTime = wedding.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (isDemoUser) {
    console.log('🎭 DEMO: Days until wedding:', diffDays)
  }
  
  return diffDays
}

/**
 * Check if user can make changes
 * - DEMO user with locked settings: cannot make changes
 * - All other users: can make changes
 */
export async function canUserMakeChanges(userId: string): Promise<boolean> {
  try {
    const demoSettingsRef = doc(db, 'demoSettings', DEMO_SETTINGS_DOC_ID)
    const demoSettingsSnap = await getDoc(demoSettingsRef)
    
    if (demoSettingsSnap.exists()) {
      const demoSettings = demoSettingsSnap.data()
      
      // Check if this is the demo user and if it's locked
      if (demoSettings.demoUserId === userId && demoSettings.isLocked) {
        console.log('🔒 DEMO account is locked - changes not allowed')
        return false
      }
    }
    
    return true
  } catch (error) {
    console.error('Error checking user permissions:', error)
    return true // Allow changes on error to not break functionality
  }
}

/**
 * Show alert if user tries to make changes in locked DEMO
 */
export function showDemoLockedAlert() {
  alert('🔒 DEMO účet je zamčený\n\nTento účet slouží pouze pro demonstraci funkcí. Změny nejsou povoleny.\n\nChcete-li vyzkoušet všechny funkce, zaregistrujte si vlastní účet zdarma!')
}

/**
 * Wrapper for mutation functions that checks if DEMO is locked
 * Throws error if DEMO is locked, otherwise executes the function
 */
export async function withDemoLockCheck<T>(
  userId: string | undefined,
  fn: () => Promise<T>
): Promise<T> {
  if (!userId) {
    throw new Error('User not authenticated')
  }

  const canMakeChanges = await canUserMakeChanges(userId)

  if (!canMakeChanges) {
    showDemoLockedAlert()
    throw new Error('DEMO_LOCKED')
  }

  return fn()
}

