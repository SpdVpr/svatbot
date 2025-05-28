'use client'

import { useAuth } from '@/hooks/useAuth'
import { useWedding } from '@/hooks/useWedding'
import WelcomeScreen from '@/components/onboarding/WelcomeScreen'
import OnboardingFlow from '@/components/onboarding/OnboardingFlow'
import Dashboard from '@/components/dashboard/Dashboard'
import LoadingScreen from '@/components/ui/LoadingScreen'

export default function HomePage() {
  const { user } = useAuth()
  const { wedding } = useWedding()

  // Show loading while checking auth state
  if (user === undefined) {
    return <LoadingScreen message="Načítání..." />
  }

  // Show welcome screen if not logged in
  if (!user) {
    return <WelcomeScreen />
  }

  // Show onboarding if user is logged in but has no wedding
  if (user && !wedding) {
    return (
      <OnboardingFlow
        onComplete={() => {
          // Wedding will be automatically loaded by useWedding hook
          console.log('Wedding created successfully')
        }}
        onSkip={() => {
          // For now, just show dashboard with demo data
          console.log('Onboarding skipped')
        }}
      />
    )
  }

  // Show dashboard if user is logged in and has wedding
  return <Dashboard />
}
