'use client'

import { useAuth } from '@/hooks/useAuth'
import { useWedding } from '@/hooks/useWedding'
import WelcomeScreen from '@/components/onboarding/WelcomeScreen'
import OnboardingFlow from '@/components/onboarding/OnboardingFlow'
import Dashboard from '@/components/dashboard/Dashboard'
import { useEffect, useState, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearchParams } from 'next/navigation'
import logger from '@/lib/logger'

function HomePageContent() {
  const { user, isInitialized, login } = useAuth()
  const { wedding, isLoading: isWeddingLoading } = useWedding()
  const [showContent, setShowContent] = useState(false)
  const [isDemoLoading, setIsDemoLoading] = useState(false)
  const searchParams = useSearchParams()

  // Auto-login to demo account if ?demo=true parameter is present
  useEffect(() => {
    const demoParam = searchParams.get('demo')

    if (demoParam === 'true' && isInitialized && !user && !isDemoLoading) {
      setIsDemoLoading(true)

      // Auto-login to demo account
      login({
        email: 'demo@svatbot.cz',
        password: 'demo123'
      }).catch((error) => {
        logger.error('Auto demo login failed:', error)
        setIsDemoLoading(false)
      })
    }
  }, [searchParams, isInitialized, user, login, isDemoLoading])

  // Show content only after both auth and wedding data are loaded
  useEffect(() => {
    if (isInitialized && !isWeddingLoading) {
      // Small delay to ensure smooth transition
      const timer = setTimeout(() => setShowContent(true), 50)
      return () => clearTimeout(timer)
    }
  }, [isInitialized, isWeddingLoading])

  // Show minimal loading with fade - no text or icons
  // Wait for both auth initialization AND wedding data loading to complete
  if (!isInitialized || !showContent || isDemoLoading || (user && isWeddingLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="w-16 h-16 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin"
        />
      </div>
    )
  }

  // Show dashboard without animation for faster perceived load
  if (user && (user?.email === 'demo@svatbot.cz' || wedding)) {
    return <Dashboard />
  }

  // Wrap other content in AnimatePresence for smooth transitions
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={user ? 'authenticated' : 'welcome'}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="w-full"
      >
        {!user ? (
          <WelcomeScreen />
        ) : !wedding ? (
          <OnboardingFlow
            onComplete={() => {
              logger.log('Wedding created successfully')
            }}
            onSkip={() => {
              logger.log('Onboarding skipped - will be handled in OnboardingFlow')
            }}
          />
        ) : null}
      </motion.div>
    </AnimatePresence>
  )
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="w-16 h-16 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin"
        />
      </div>
    }>
      <HomePageContent />
    </Suspense>
  )
}
