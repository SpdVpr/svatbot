'use client'

import { useEffect, useRef } from 'react'
import { doc, updateDoc, increment, getDoc } from 'firebase/firestore'
import { db } from '@/config/firebase'

interface WeddingWebsiteAnalyticsProps {
  websiteId: string
}

/**
 * Component to track wedding website analytics
 * Tracks views and unique visitors
 */
export default function WeddingWebsiteAnalytics({ websiteId }: WeddingWebsiteAnalyticsProps) {
  const hasTracked = useRef(false)

  console.log('🎯 WeddingWebsiteAnalytics component rendered with websiteId:', websiteId)
  console.log('🔥 Firebase db instance:', db ? 'initialized' : 'NOT initialized')

  useEffect(() => {
    console.log('🎯 WeddingWebsiteAnalytics useEffect triggered (CLIENT SIDE)', {
      websiteId,
      hasTracked: hasTracked.current,
      dbInitialized: !!db,
      isClient: typeof window !== 'undefined'
    })

    // Only track once per page load
    if (hasTracked.current) {
      console.log('⏭️ Skipping analytics tracking - already tracked')
      return
    }

    if (!websiteId) {
      console.log('⏭️ Skipping analytics tracking - no websiteId')
      return
    }

    if (!db) {
      console.error('❌ Firebase db not initialized!')
      return
    }

    hasTracked.current = true

    const trackVisit = async () => {
      try {
        console.log('📊 Starting analytics tracking for website:', websiteId)

        // Get visitor ID from localStorage or create new one
        const storageKey = 'svatbot_visitor_id'
        let visitorId = localStorage.getItem(storageKey)

        if (!visitorId) {
          visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          localStorage.setItem(storageKey, visitorId)
          console.log('🆕 Created new visitor ID:', visitorId)
        } else {
          console.log('♻️ Using existing visitor ID:', visitorId)
        }

        // Check if this visitor has visited this website before
        const visitorKey = `svatbot_visited_${websiteId}`
        const hasVisitedBefore = localStorage.getItem(visitorKey)

        const websiteRef = doc(db, 'weddingWebsites', websiteId)
        console.log('📝 Firestore reference:', `weddingWebsites/${websiteId}`)

        // Always increment views
        const updates: any = {
          'analytics.views': increment(1),
          'analytics.lastVisit': new Date()
        }

        // Only increment unique visitors if first visit
        if (!hasVisitedBefore) {
          updates['analytics.uniqueVisitors'] = increment(1)
          localStorage.setItem(visitorKey, 'true')
          console.log('📊 New unique visitor tracked for website:', websiteId)
        } else {
          console.log('📊 Returning visitor tracked for website:', websiteId)
        }

        console.log('💾 Updating Firestore with:', updates)
        await updateDoc(websiteRef, updates)
        console.log('✅ Analytics updated successfully')
      } catch (error) {
        console.error('❌ Error tracking visit:', error)
      }
    }

    // Track after a short delay to ensure page is loaded
    console.log('⏱️ Scheduling analytics tracking in 1 second...')
    const timer = setTimeout(trackVisit, 1000)

    return () => {
      console.log('🧹 Cleaning up analytics tracker')
      clearTimeout(timer)
    }
  }, [websiteId])

  // This component doesn't render anything
  return null
}

