'use client'

import { useEffect } from 'react'
import { initAffiliateTracking } from '@/lib/affiliateTracking'

/**
 * Affiliate Tracker Component
 * 
 * This component should be placed in the root layout to track affiliate clicks
 * across the entire application.
 */
export default function AffiliateTracker() {
  useEffect(() => {
    // Initialize affiliate tracking on mount
    initAffiliateTracking()
  }, [])

  // This component doesn't render anything
  return null
}

