'use client'

import { useEffect, useRef } from 'react'
import { useAuth } from './useAuth'
import {
  doc,
  setDoc,
  updateDoc,
  serverTimestamp,
  increment,
  arrayUnion,
  getDoc
} from 'firebase/firestore'
import { db, auth } from '@/config/firebase'
import { usePathname } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'

/**
 * Hook pro sledování uživatelské aktivity
 * - Sleduje login events
 * - Měří čas strávený v aplikaci
 * - Sleduje online status
 * - Zaznamenává navštívené stránky
 */
export function useUserTracking() {
  const { user } = useAuth()
  const pathname = usePathname()
  const sessionStartRef = useRef<Date | null>(null)
  const sessionIdRef = useRef<string | null>(null)
  const lastActivityRef = useRef<Date>(new Date())
  const activityIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const pageViewsRef = useRef<Set<string>>(new Set())
  const lastUserIdRef = useRef<string | null>(null)

  // Initialize session when user logs in - listen to Firebase Auth directly
  useEffect(() => {
    let currentSessionUserId: string | null = null
    let previousUserId: string | null = null

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        console.log('👤 No Firebase user, skipping tracking')
        // User logged out - end session and mark as offline
        if (sessionStartRef.current && sessionIdRef.current && previousUserId) {
          await endSession(previousUserId)
        }
        currentSessionUserId = null
        previousUserId = null
        return
      }

      // Check if this is a new login (different user or first login in this session)
      const isNewLogin = currentSessionUserId !== firebaseUser.uid

      console.log('🔍 Auth state check:', {
        email: firebaseUser.email,
        uid: firebaseUser.uid,
        currentSessionUserId,
        previousUserId,
        isNewLogin
      })

      if (isNewLogin) {
        console.log('🚀 Starting user tracking for:', firebaseUser.email)

        // End previous user's session if exists (user switching)
        if (sessionStartRef.current && sessionIdRef.current && previousUserId && previousUserId !== firebaseUser.uid) {
          console.log('🔄 Switching users - ending previous session for:', previousUserId)
          await endSession(previousUserId)
        }

        currentSessionUserId = firebaseUser.uid
        previousUserId = firebaseUser.uid

        // Start new session
        await startSession(firebaseUser)

        // Set up activity tracking
        setupActivityTracking(firebaseUser)
      } else {
        console.log('✅ User already tracked in this session, skipping session start')
      }
    })

    // Cleanup on unmount
    return () => {
      console.log('🛑 Cleaning up tracking')
      if (sessionStartRef.current && sessionIdRef.current && previousUserId) {
        endSession(previousUserId)
      }
      if (activityIntervalRef.current) {
        clearInterval(activityIntervalRef.current)
      }
      unsubscribe()
    }
  }, [])

  // Track page views
  useEffect(() => {
    if (!user || !pathname) return

    trackPageView(pathname)
  }, [pathname, user?.id])

  const startSession = async (firebaseUser: any) => {
    if (!firebaseUser) return

    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    sessionIdRef.current = sessionId
    sessionStartRef.current = new Date()

    const analyticsRef = doc(db, 'userAnalytics', firebaseUser.uid)

    try {
      // Check if document exists
      const analyticsDoc = await getDoc(analyticsRef)

      if (!analyticsDoc.exists()) {
        // Create new analytics document
        console.log('📝 Creating new analytics document for:', firebaseUser.email)
        const now = new Date()
        await setDoc(analyticsRef, {
          userId: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || 'Unknown',
          registeredAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
          loginCount: 1,
          totalSessionTime: 0,
          isOnline: true,
          lastActivityAt: serverTimestamp(),
          sessions: [{
            sessionId,
            startTime: now,
            duration: 0,
            pages: []
          }],
          pageViews: {},
          featuresUsed: []
        })
        console.log('✅ Analytics document created')
      } else {
        // Update existing document
        console.log('🔄 Updating existing analytics for:', firebaseUser.email)
        const currentData = analyticsDoc.data()
        console.log('Current loginCount:', currentData.loginCount)

        await setDoc(analyticsRef, {
          email: firebaseUser.email, // Always update email
          displayName: firebaseUser.displayName || currentData.displayName || 'Unknown', // Update displayName if available
          lastLoginAt: serverTimestamp(),
          loginCount: increment(1),
          isOnline: true,
          lastActivityAt: serverTimestamp(),
          sessions: arrayUnion({
            sessionId,
            startTime: new Date(),
            duration: 0,
            pages: []
          })
        }, { merge: true })
        console.log('✅ Analytics updated, new loginCount:', (currentData.loginCount || 0) + 1)
      }

      console.log('📊 Session started:', sessionId)
    } catch (error) {
      console.error('Error starting session:', error)
    }
  }

  const endSession = async (userId?: string) => {
    // Use provided userId or current user
    const targetUserId = userId || auth.currentUser?.uid

    if (!targetUserId || !sessionStartRef.current || !sessionIdRef.current) {
      console.log('⚠️ Cannot end session - missing data', { targetUserId, hasSessionStart: !!sessionStartRef.current, hasSessionId: !!sessionIdRef.current })
      return
    }

    const sessionEnd = new Date()
    const sessionDuration = Math.floor((sessionEnd.getTime() - sessionStartRef.current.getTime()) / 1000 / 60) // minutes

    console.log('🏁 Ending session for userId:', targetUserId, 'Duration:', sessionDuration, 'minutes')

    const analyticsRef = doc(db, 'userAnalytics', targetUserId)

    try {
      await setDoc(analyticsRef, {
        isOnline: false,
        totalSessionTime: increment(sessionDuration),
        lastActivityAt: serverTimestamp()
      }, { merge: true })

      console.log('✅ Session ended successfully:', sessionIdRef.current, 'Total duration added:', sessionDuration, 'minutes')
    } catch (error) {
      console.error('❌ Error ending session:', error)
    }

    sessionStartRef.current = null
    sessionIdRef.current = null
  }

  const setupActivityTracking = (firebaseUser: any) => {
    // Clear any existing interval
    if (activityIntervalRef.current) {
      clearInterval(activityIntervalRef.current)
    }

    // Update activity every 30 seconds
    activityIntervalRef.current = setInterval(() => {
      updateActivity(firebaseUser)
    }, 30000)

    // Track user interactions
    const handleActivity = () => {
      lastActivityRef.current = new Date()
    }

    window.addEventListener('mousemove', handleActivity)
    window.addEventListener('keydown', handleActivity)
    window.addEventListener('click', handleActivity)
    window.addEventListener('scroll', handleActivity)

    return () => {
      window.removeEventListener('mousemove', handleActivity)
      window.removeEventListener('keydown', handleActivity)
      window.removeEventListener('click', handleActivity)
      window.removeEventListener('scroll', handleActivity)
    }
  }

  const updateActivity = async (firebaseUser: any) => {
    if (!firebaseUser) return

    const now = new Date()
    const timeSinceLastActivity = (now.getTime() - lastActivityRef.current.getTime()) / 1000 / 60 // minutes

    // If user has been inactive for more than 5 minutes, mark as offline
    if (timeSinceLastActivity > 5) {
      const analyticsRef = doc(db, 'userAnalytics', firebaseUser.uid)
      try {
        await setDoc(analyticsRef, {
          isOnline: false
        }, { merge: true })
      } catch (error) {
        console.error('Error updating activity:', error)
      }
    } else {
      // Update last activity
      const analyticsRef = doc(db, 'userAnalytics', firebaseUser.uid)
      try {
        await setDoc(analyticsRef, {
          isOnline: true,
          lastActivityAt: serverTimestamp()
        }, { merge: true })
      } catch (error) {
        console.error('Error updating activity:', error)
      }
    }
  }

  const trackPageView = async (page: string) => {
    if (!user || pageViewsRef.current.has(page)) return

    pageViewsRef.current.add(page)

    const analyticsRef = doc(db, 'userAnalytics', user.id)

    try {
      await setDoc(analyticsRef, {
        [`pageViews.${page.replace(/\//g, '_')}`]: increment(1)
      }, { merge: true })
    } catch (error) {
      console.error('Error tracking page view:', error)
    }
  }

  const trackFeatureUsage = async (featureName: string) => {
    if (!user) return

    const analyticsRef = doc(db, 'userAnalytics', user.id)

    try {
      await setDoc(analyticsRef, {
        featuresUsed: arrayUnion(featureName)
      }, { merge: true })
    } catch (error) {
      console.error('Error tracking feature usage:', error)
    }
  }

  return {
    trackFeatureUsage
  }
}

