'use client'

import { useEffect, useRef } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/config/firebase'

/**
 * Hook for tracking QR code visits
 * Automatically tracks when user arrives via QR code (utm_source=qr_code)
 */
export function useQRTracking() {
  const hasTracked = useRef(false)

  useEffect(() => {
    console.log('🔍 QR Tracking hook mounted')

    // Only run on client side
    if (typeof window === 'undefined') {
      console.log('⚠️ Not on client side, skipping QR tracking')
      return
    }

    // Only track once per session
    if (hasTracked.current) {
      console.log('⚠️ Already tracked in this session')
      return
    }

    const trackQRVisit = async () => {
      try {
        console.log('🔍 Checking URL for QR parameters...')
        console.log('Current URL:', window.location.href)

        // Check if user came from QR code
        const urlParams = new URLSearchParams(window.location.search)
        const utmSource = urlParams.get('utm_source')
        const utmMedium = urlParams.get('utm_medium')
        const utmCampaign = urlParams.get('utm_campaign')

        console.log('UTM Parameters:', { utmSource, utmMedium, utmCampaign })

        // Only track if it's from QR code
        if (utmSource !== 'qr_code') {
          console.log('⚠️ Not from QR code (utm_source !== "qr_code"), skipping tracking')
          return
        }

        console.log('✅ QR code detected! Starting tracking...')

        // Mark as tracked
        hasTracked.current = true

        // Get visitor info
        const userAgent = navigator.userAgent
        const referrer = document.referrer
        const language = navigator.language
        const screenSize = `${window.screen.width}x${window.screen.height}`

        const visitData = {
          timestamp: serverTimestamp(),
          utmSource,
          utmMedium,
          utmCampaign,
          userAgent,
          referrer,
          language,
          screenSize,
          url: window.location.href,
          pathname: window.location.pathname
        }

        console.log('📝 Saving visit data:', visitData)

        // Track the visit
        const docRef = await addDoc(collection(db, 'qrCodeVisits'), visitData)

        console.log('✅ QR code visit tracked successfully! Doc ID:', docRef.id)

        // Store in localStorage to avoid duplicate tracking
        localStorage.setItem('qr_visit_tracked', Date.now().toString())
      } catch (error) {
        console.error('❌ Error tracking QR visit:', error)
        if (error instanceof Error) {
          console.error('Error details:', error.message)
          console.error('Error stack:', error.stack)
        }
      }
    }

    // Check if already tracked in this session (within last hour)
    const lastTracked = localStorage.getItem('qr_visit_tracked')
    if (lastTracked) {
      const hourAgo = Date.now() - 60 * 60 * 1000
      const lastTrackedTime = parseInt(lastTracked)
      if (lastTrackedTime > hourAgo) {
        console.log('⚠️ Already tracked within last hour:', new Date(lastTrackedTime).toLocaleString())
        hasTracked.current = true
        return
      } else {
        console.log('✅ Last tracking was more than 1 hour ago, will track again')
      }
    }

    // Track after a short delay to ensure page is loaded
    console.log('⏱️ Scheduling QR tracking in 1 second...')
    const timer = setTimeout(trackQRVisit, 1000)

    return () => {
      console.log('🧹 Cleaning up QR tracking timer')
      clearTimeout(timer)
    }
  }, [])
}

