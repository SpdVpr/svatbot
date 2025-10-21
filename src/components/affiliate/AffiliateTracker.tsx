'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { initAffiliateTracking, linkUserToAffiliate, getAffiliateCookie } from '@/lib/affiliateTracking'
import { useAuth } from '@/hooks/useAuth'

/**
 * Affiliate Tracker Component
 *
 * This component should be placed in the root layout to track affiliate clicks
 * across the entire application.
 *
 * Features:
 * - Tracks affiliate clicks for all visitors
 * - Links existing users to affiliate when they click affiliate link
 * - Supports both new registrations and existing user conversions
 */
export default function AffiliateTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { user } = useAuth()

  useEffect(() => {
    // Initialize affiliate tracking on mount and when URL changes
    initAffiliateTracking()

    // If user is logged in and has affiliate cookie, link them to affiliate
    if (user?.id && user?.email) {
      const affiliateCode = getAffiliateCookie()
      if (affiliateCode) {
        console.log('🔗 Linking existing user to affiliate:', { userId: user.id, affiliateCode })
        linkUserToAffiliate(user.id, user.email).catch(err => {
          console.error('Error linking user to affiliate:', err)
        })
      }
    }
  }, [pathname, searchParams, user?.id, user?.email])

  // This component doesn't render anything
  return null
}

