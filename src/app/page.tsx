'use client'

import { useAuth } from '@/hooks/useAuth'
import { useWedding } from '@/hooks/useWedding'
import WelcomeScreen from '@/components/onboarding/WelcomeScreen'
import OnboardingFlow from '@/components/onboarding/OnboardingFlow'
import Dashboard from '@/components/dashboard/Dashboard'
import LoadingScreen from '@/components/ui/LoadingScreen'
import { useEffect, useState } from 'react'

export default function HomePage() {
  const { user, isInitialized } = useAuth()
  const { wedding } = useWedding()
  const [showContent, setShowContent] = useState(false)

  // Show content immediately after initialization to prevent flickering
  useEffect(() => {
    if (isInitialized) {
      setShowContent(true)
    }
  }, [isInitialized])

  // Show minimal loading only on first load
  if (!isInitialized || !showContent) {
    return <LoadingScreen message="Načítání..." />
  }

  // Show welcome screen if not logged in
  if (!user) {
    return <WelcomeScreen />
  }

  // Check if this is a demo user
  const isDemoUser = user?.email === 'demo@svatbot.cz'

  // For demo users, always show dashboard immediately
  if (isDemoUser) {
    return <Dashboard />
  }

  // For regular users, show onboarding if no wedding exists
  if (!wedding) {
    return (
      <OnboardingFlow
        onComplete={() => {
          console.log('Wedding created successfully')
        }}
        onSkip={() => {
          console.log('Onboarding skipped - will be handled in OnboardingFlow')
        }}
      />
    )
  }

  // Show dashboard for regular users with wedding
  return <Dashboard />
}
