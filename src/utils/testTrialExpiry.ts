/**
 * Utility functions for testing trial expiry functionality
 * 
 * These functions help developers test the trial expiry modal
 * by temporarily modifying subscription data in Firestore
 */

import { doc, updateDoc, Timestamp } from 'firebase/firestore'
import { db } from '@/config/firebase'

/**
 * Set trial to expired for testing
 * This will trigger the trial expired modal
 */
export async function setTrialExpired(userId: string): Promise<void> {
  try {
    const subscriptionRef = doc(db, 'subscriptions', userId)
    
    // Set trial end date to yesterday
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    
    await updateDoc(subscriptionRef, {
      trialEndDate: Timestamp.fromDate(yesterday),
      isTrialActive: false,
      status: 'trialing', // Keep status as trialing but with expired date
      updatedAt: Timestamp.now()
    })
    
    console.log('✅ Trial set to expired for testing')
    console.log('🔄 Refresh the page to see the trial expired modal')
  } catch (error) {
    console.error('Error setting trial to expired:', error)
  }
}

/**
 * Reset trial to active for testing
 * This will remove the trial expired modal
 */
export async function resetTrialToActive(userId: string): Promise<void> {
  try {
    const subscriptionRef = doc(db, 'subscriptions', userId)
    
    // Set trial end date to 30 days from now
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 30)
    
    await updateDoc(subscriptionRef, {
      trialEndDate: Timestamp.fromDate(futureDate),
      isTrialActive: true,
      status: 'trialing',
      updatedAt: Timestamp.now()
    })
    
    console.log('✅ Trial reset to active for testing')
    console.log('🔄 Refresh the page to see normal dashboard')
  } catch (error) {
    console.error('Error resetting trial:', error)
  }
}

/**
 * Set trial to expire in X days
 */
export async function setTrialExpiryInDays(userId: string, days: number): Promise<void> {
  try {
    const subscriptionRef = doc(db, 'subscriptions', userId)
    
    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + days)
    
    await updateDoc(subscriptionRef, {
      trialEndDate: Timestamp.fromDate(expiryDate),
      isTrialActive: days > 0,
      status: 'trialing',
      updatedAt: Timestamp.now()
    })
    
    console.log(`✅ Trial set to expire in ${days} days`)
  } catch (error) {
    console.error('Error setting trial expiry:', error)
  }
}

// Make functions available in browser console for testing
if (typeof window !== 'undefined') {
  (window as any).testTrialExpiry = {
    setExpired: setTrialExpired,
    resetToActive: resetTrialToActive,
    setExpiryInDays: setTrialExpiryInDays
  }
  
  console.log('🧪 Trial expiry test functions loaded!')
  console.log('Usage:')
  console.log('  testTrialExpiry.setExpired("your-user-id") - Set trial to expired')
  console.log('  testTrialExpiry.resetToActive("your-user-id") - Reset trial to active')
  console.log('  testTrialExpiry.setExpiryInDays("your-user-id", 2) - Set trial to expire in 2 days')
}

