'use client'

import { useQRTracking } from '@/hooks/useQRTracking'

/**
 * Wrapper component that tracks QR code visits
 * Should be placed in the root layout to track all visits
 */
export default function QRTrackingWrapper({ children }: { children: React.ReactNode }) {
  useQRTracking()
  
  return <>{children}</>
}

