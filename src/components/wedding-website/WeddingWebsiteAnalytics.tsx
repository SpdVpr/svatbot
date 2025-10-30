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

  useEffect(() => {
    // Only track once per page load
    if (hasTracked.current || !websiteId) return
    hasTracked.current = true

    const trackVisit = async () => {
      try {
        // Get visitor ID from localStorage or create new one
        const storageKey = 'svatbot_visitor_id'
        let visitorId = localStorage.getItem(storageKey)
        
        if (!visitorId) {
          visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          localStorage.setItem(storageKey, visitorId)
        }

        // Check if this visitor has visited this website before
        const visitorKey = `svatbot_visited_${websiteId}`
        const hasVisitedBefore = localStorage.getItem(visitorKey)

        const websiteRef = doc(db, 'weddingWebsites', websiteId)

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

        await updateDoc(websiteRef, updates)
        console.log('✅ Analytics updated successfully')
      } catch (error) {
        console.error('❌ Error tracking visit:', error)
      }
    }

    // Track after a short delay to ensure page is loaded
    const timer = setTimeout(trackVisit, 1000)

    return () => clearTimeout(timer)
  }, [websiteId])

  // This component doesn't render anything
  return null
}

