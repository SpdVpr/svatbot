'use client'

import { useEffect, useRef } from 'react'
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
  const lastTrackedPath = useRef<string>('')

  // Track URL changes for affiliate clicks
  useEffect(() => {
    // Create a unique key for this path + search params
    const currentPath = `${pathname}${searchParams?.toString() ? `?${searchParams.toString()}` : ''}`

    // Skip if we already tracked this exact path
    if (lastTrackedPath.current === currentPath) {
      return
    }

    // Initialize affiliate tracking on mount and when URL changes
    initAffiliateTracking()
    lastTrackedPath.current = currentPath
  }, [pathname, searchParams])

  // Link user to affiliate only once when user logs in
  useEffect(() => {
    // Skip if no user
    if (!user?.id || !user?.email) return

    const affiliateCode = getAffiliateCookie()
    if (!affiliateCode) return

    // Check if we already linked this user to this affiliate
    const linkedKey = `affiliate_linked_${user.id}_${affiliateCode}`
    if (typeof window !== 'undefined') {
      const alreadyLinked = sessionStorage.getItem(linkedKey)
      if (alreadyLinked) {
        console.log('ℹ️ User already linked to affiliate in this session')
        return
      }
    }

    console.log('🔗 Linking existing user to affiliate:', { userId: user.id, affiliateCode })
    linkUserToAffiliate(user.id, user.email)
      .then(() => {
        // Mark as linked in this session to prevent re-linking
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(linkedKey, 'true')
        }
      })
      .catch(err => {
        console.error('Error linking user to affiliate:', err)
      })
  }, [user?.id]) // Only run when user ID changes (login/logout)

  // This component doesn't render anything
  return null
}

