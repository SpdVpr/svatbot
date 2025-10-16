'use client'

import { useAuth } from '@/hooks/useAuth'
import { useWedding } from '@/hooks/useWedding'
import WelcomeScreen from '@/components/onboarding/WelcomeScreen'
import OnboardingFlow from '@/components/onboarding/OnboardingFlow'
import Dashboard from '@/components/dashboard/Dashboard'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function HomePage() {
  const { user, isInitialized } = useAuth()
  const { wedding } = useWedding()
  const [showContent, setShowContent] = useState(false)

  // Show content immediately after initialization to prevent flickering
  useEffect(() => {
    if (isInitialized) {
      // Small delay to ensure smooth transition
      const timer = setTimeout(() => setShowContent(true), 50)
      return () => clearTimeout(timer)
    }
  }, [isInitialized])

  // Show minimal loading with fade - no text or icons
  if (!isInitialized || !showContent) {
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

  // Wrap content in AnimatePresence for smooth transitions
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={user ? 'authenticated' : 'welcome'}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="w-full min-h-screen"
      >
        {!user ? (
          <WelcomeScreen />
        ) : user?.email === 'demo@svatbot.cz' ? (
          <Dashboard />
        ) : !wedding ? (
          <OnboardingFlow
            onComplete={() => {
              console.log('Wedding created successfully')
            }}
            onSkip={() => {
              console.log('Onboarding skipped - will be handled in OnboardingFlow')
            }}
          />
        ) : (
          <Dashboard />
        )}
      </motion.div>
    </AnimatePresence>
  )
}
