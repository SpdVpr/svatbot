'use client'

import { useEffect } from 'react'
import { useUserTracking } from '@/hooks/useUserTracking'
import FeedbackButton from './FeedbackButton'

/**
 * Wrapper component that initializes user tracking
 * Should be placed in the root layout or main app component
 */
export default function UserTrackingWrapper({ children }: { children: React.ReactNode }) {
  // Initialize user tracking
  useUserTracking()

  return (
    <>
      {children}
      <FeedbackButton />
    </>
  )
}

