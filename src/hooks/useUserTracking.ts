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
import { db } from '@/config/firebase'
import { usePathname } from 'next/navigation'

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

  // Initialize session when user logs in
  useEffect(() => {
    if (!user) {
      // User logged out - end session
      if (sessionStartRef.current && sessionIdRef.current) {
        endSession()
      }
      return
    }

    // Start new session
    startSession()

    // Set up activity tracking
    setupActivityTracking()

    // Cleanup on unmount or logout
    return () => {
      if (sessionStartRef.current && sessionIdRef.current) {
        endSession()
      }
      if (activityIntervalRef.current) {
        clearInterval(activityIntervalRef.current)
      }
    }
  }, [user?.id])

  // Track page views
  useEffect(() => {
    if (!user || !pathname) return

    trackPageView(pathname)
  }, [pathname, user?.id])

  const startSession = async () => {
    if (!user) return

    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    sessionIdRef.current = sessionId
    sessionStartRef.current = new Date()

    const analyticsRef = doc(db, 'userAnalytics', user.id)

    try {
      // Check if document exists
      const analyticsDoc = await getDoc(analyticsRef)

      if (!analyticsDoc.exists()) {
        // Create new analytics document
        await setDoc(analyticsRef, {
          userId: user.id,
          email: user.email,
          displayName: user.displayName || 'Unknown',
          registeredAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
          loginCount: 1,
          totalSessionTime: 0,
          isOnline: true,
          lastActivityAt: serverTimestamp(),
          sessions: [{
            sessionId,
            startTime: serverTimestamp(),
            duration: 0,
            pages: []
          }],
          pageViews: {},
          featuresUsed: []
        })
      } else {
        // Update existing document
        await updateDoc(analyticsRef, {
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
        })
      }

      console.log('📊 Session started:', sessionId)
    } catch (error) {
      console.error('Error starting session:', error)
    }
  }

  const endSession = async () => {
    if (!user || !sessionStartRef.current || !sessionIdRef.current) return

    const sessionEnd = new Date()
    const sessionDuration = Math.floor((sessionEnd.getTime() - sessionStartRef.current.getTime()) / 1000 / 60) // minutes

    const analyticsRef = doc(db, 'userAnalytics', user.id)

    try {
      await updateDoc(analyticsRef, {
        isOnline: false,
        totalSessionTime: increment(sessionDuration),
        lastActivityAt: serverTimestamp()
      })

      console.log('📊 Session ended:', sessionIdRef.current, 'Duration:', sessionDuration, 'minutes')
    } catch (error) {
      console.error('Error ending session:', error)
    }

    sessionStartRef.current = null
    sessionIdRef.current = null
  }

  const setupActivityTracking = () => {
    // Update activity every 30 seconds
    activityIntervalRef.current = setInterval(() => {
      updateActivity()
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

  const updateActivity = async () => {
    if (!user) return

    const now = new Date()
    const timeSinceLastActivity = (now.getTime() - lastActivityRef.current.getTime()) / 1000 / 60 // minutes

    // If user has been inactive for more than 5 minutes, mark as offline
    if (timeSinceLastActivity > 5) {
      const analyticsRef = doc(db, 'userAnalytics', user.id)
      try {
        await updateDoc(analyticsRef, {
          isOnline: false
        })
      } catch (error) {
        console.error('Error updating activity:', error)
      }
    } else {
      // Update last activity
      const analyticsRef = doc(db, 'userAnalytics', user.id)
      try {
        await updateDoc(analyticsRef, {
          isOnline: true,
          lastActivityAt: serverTimestamp()
        })
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
      await updateDoc(analyticsRef, {
        [`pageViews.${page.replace(/\//g, '_')}`]: increment(1)
      })
    } catch (error) {
      console.error('Error tracking page view:', error)
    }
  }

  const trackFeatureUsage = async (featureName: string) => {
    if (!user) return

    const analyticsRef = doc(db, 'userAnalytics', user.id)

    try {
      await updateDoc(analyticsRef, {
        featuresUsed: arrayUnion(featureName)
      })
    } catch (error) {
      console.error('Error tracking feature usage:', error)
    }
  }

  return {
    trackFeatureUsage
  }
}

