'use client'

import { useAuth } from '@/hooks/useAuth'
import { usePathname } from 'next/navigation'
import FeedbackButton from './FeedbackButton'

/**
 * Global Feedback Button Wrapper
 * Shows feedback button on all pages except:
 * - Landing page (/)
 * - Admin pages
 * - Wedding website public pages
 */
export default function GlobalFeedbackButton() {
  const { user } = useAuth()
  const pathname = usePathname()

  // Don't show on these pages
  const excludedPaths = [
    '/admin',
    '/w/', // Wedding website public pages
    '/share/', // Shared pages
  ]

  // Check if current path should be excluded
  const isExcluded = excludedPaths.some(path => pathname.startsWith(path))

  // Don't show if:
  // - User is not logged in
  // - On excluded pages
  // - On landing page (when user is not logged in)
  if (!user || isExcluded || (pathname === '/' && !user)) {
    return null
  }

  return <FeedbackButton />
}

