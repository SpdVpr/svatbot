'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { initAffiliateTracking } from '@/lib/affiliateTracking'

/**
 * Affiliate Tracker Component
 *
 * This component should be placed in the root layout to track affiliate clicks
 * across the entire application.
 */
export default function AffiliateTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Initialize affiliate tracking on mount and when URL changes
    initAffiliateTracking()
  }, [pathname, searchParams])

  // This component doesn't render anything
  return null
}

