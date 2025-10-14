'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'
import { useWedding } from './useWedding'
import { useTask } from './useTask'
import { useGuest } from './useGuest'
import { db } from '@/config/firebase'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'

export interface OnboardingStep {
  id: string
  title: string
  description: string
  icon: string
  completed: boolean
  actionUrl?: string
  actionLabel?: string
  tips?: string[]
  priority: number
}

export interface OnboardingState {
  isNewUser: boolean
  hasCompletedOnboarding: boolean
  currentStep: number
  completedSteps: string[]
  showWelcome: boolean
  lastInteraction: Date | null
}

const ONBOARDING_STEPS: Omit<OnboardingStep, 'completed'>[] = [
  {
    id: 'welcome',
    title: '👋 Vítejte v SvatBot!',
    description: 'Jsem Svatbot, váš osobní AI svatební kouč. Pomohu vám naplánovat dokonalou svatbu krok za krokem!',
    icon: '🤖',
    priority: 1,
    tips: [
      'Budu vás provázet celým procesem plánování',
      'Dostanete personalizovaná doporučení',
      'Pomohu vám s časovým plánováním a rozpočtem'
    ]
  },
  {
    id: 'basic-info',
    title: '💑 Základní informace',
    description: 'Začněme se základními informacemi o vaší svatbě. Nastavte datum, jména a rozpočet.',
    icon: '📝',
    actionUrl: '/dashboard',
    actionLabel: 'Nastavit základní info',
    priority: 2,
    tips: [
      'Datum svatby je klíčové pro plánování',
      'Rozpočet vám pomůže držet výdaje pod kontrolou',
      'Tyto informace můžete kdykoliv změnit'
    ]
  },
  {
    id: 'first-tasks',
    title: '✅ První úkoly',
    description: 'Vytvořte si první úkoly. Doporučuji začít s výběrem místa obřadu a hostiny.',
    icon: '📋',
    actionUrl: '/tasks',
    actionLabel: 'Přejít na úkoly',
    priority: 3,
    tips: [
      'Začněte s nejdůležitějšími úkoly (místo, fotograf)',
      'Nastavte si termíny dokončení',
      'Můžete přiřadit úkoly partnerovi nebo rodině'
    ]
  },
  {
    id: 'guest-list',
    title: '👥 Seznam hostů',
    description: 'Vytvořte seznam hostů. Můžete je importovat z Excelu nebo přidat ručně.',
    icon: '📇',
    actionUrl: '/guests',
    actionLabel: 'Spravovat hosty',
    priority: 4,
    tips: [
      'Začněte s přibližným počtem hostů',
      'Můžete je rozdělit do skupin (rodina, přátelé, kolegové)',
      'Import z Excelu vám ušetří čas'
    ]
  },
  {
    id: 'budget-setup',
    title: '💰 Rozpočet',
    description: 'Nastavte si rozpočet a sledujte výdaje. Pomohu vám optimalizovat náklady.',
    icon: '💵',
    actionUrl: '/budget',
    actionLabel: 'Nastavit rozpočet',
    priority: 5,
    tips: [
      'Průměrná svatba v ČR stojí 300-500 tis. Kč',
      'Největší výdaje: místo, catering, fotograf',
      'Nechte si rezervu 10-15% na neočekávané výdaje'
    ]
  },
  {
    id: 'timeline',
    title: '📅 Časová osa',
    description: 'Vytvořte si časovou osu příprav. Ukážu vám, co dělat kdy.',
    icon: '⏰',
    actionUrl: '/calendar',
    actionLabel: 'Vytvořit timeline',
    priority: 6,
    tips: [
      'Ideální je začít 12-18 měsíců dopředu',
      '6 měsíců před: finalizace detailů',
      '1 měsíc před: potvrzení všech dodavatelů'
    ]
  },
  {
    id: 'vendors',
    title: '🎯 Dodavatelé',
    description: 'Najděte si dodavatele v našem marketplace nebo přidejte vlastní.',
    icon: '🏪',
    actionUrl: '/marketplace',
    actionLabel: 'Prozkoumat marketplace',
    priority: 7,
    tips: [
      'Začněte s klíčovými dodavateli (místo, fotograf, catering)',
      'Porovnejte nabídky a recenze',
      'Rezervujte si termíny co nejdříve'
    ]
  },
  {
    id: 'seating',
    title: '🪑 Rozmístění hostů',
    description: 'Vytvořte plán rozmístění hostů u stolů. Můžete to udělat později.',
    icon: '🗺️',
    actionUrl: '/seating',
    actionLabel: 'Vytvořit plán',
    priority: 8,
    tips: [
      'Toto můžete udělat 1-2 měsíce před svatbou',
      'Zvažte vztahy mezi hosty',
      'Nechte prostor pro last-minute změny'
    ]
  },
  {
    id: 'explore',
    title: '🚀 Prozkoumejte aplikaci',
    description: 'Skvělá práce! Teď už znáte základy. Prozkoumejte další funkce jako AI chat, moodboard nebo svatební web.',
    icon: '✨',
    actionUrl: '/ai',
    actionLabel: 'Otevřít AI chat',
    priority: 9,
    tips: [
      'AI chat vám poradí s čímkoliv',
      'Moodboard pro inspiraci',
      'Vytvořte si vlastní svatební web'
    ]
  }
]

export function useOnboarding() {
  const { user } = useAuth()
  const { wedding } = useWedding()
  const { tasks } = useTask()
  const { guests } = useGuest()
  
  const [onboardingState, setOnboardingState] = useState<OnboardingState>({
    isNewUser: false,
    hasCompletedOnboarding: false,
    currentStep: 0,
    completedSteps: [],
    showWelcome: false,
    lastInteraction: null
  })
  
  const [loading, setLoading] = useState(true)
  const [steps, setSteps] = useState<OnboardingStep[]>([])

  // Load onboarding state from Firestore
  useEffect(() => {
    if (!user?.id) {
      setLoading(false)
      return
    }

    const loadOnboardingState = async () => {
      try {
        const onboardingRef = doc(db, 'onboarding', user.id)
        const onboardingDoc = await getDoc(onboardingRef)

        if (onboardingDoc.exists()) {
          const data = onboardingDoc.data()
          setOnboardingState({
            isNewUser: data.isNewUser || false,
            hasCompletedOnboarding: data.hasCompletedOnboarding || false,
            currentStep: data.currentStep || 0,
            completedSteps: data.completedSteps || [],
            showWelcome: data.showWelcome || false,
            lastInteraction: data.lastInteraction?.toDate() || null
          })
        } else {
          // New user - create onboarding state
          const newState: OnboardingState = {
            isNewUser: true,
            hasCompletedOnboarding: false,
            currentStep: 0,
            completedSteps: [],
            showWelcome: true,
            lastInteraction: new Date()
          }

          await setDoc(onboardingRef, {
            userId: user.id,
            ...newState,
            createdAt: new Date()
          })

          setOnboardingState(newState)
        }
      } catch (error) {
        console.error('Error loading onboarding state:', error)
      } finally {
        setLoading(false)
      }
    }

    loadOnboardingState()
  }, [user?.id])

  // Auto-detect completed steps based on user data
  useEffect(() => {
    if (!user || !wedding) return

    const autoCompletedSteps: string[] = [...onboardingState.completedSteps]

    // Check if basic info is set
    if (wedding.weddingDate && wedding.brideName && wedding.groomName) {
      if (!autoCompletedSteps.includes('basic-info')) {
        autoCompletedSteps.push('basic-info')
      }
    }

    // Check if tasks exist
    if (tasks && tasks.length > 0) {
      if (!autoCompletedSteps.includes('first-tasks')) {
        autoCompletedSteps.push('first-tasks')
      }
    }

    // Check if guests exist
    if (guests && guests.length > 0) {
      if (!autoCompletedSteps.includes('guest-list')) {
        autoCompletedSteps.push('guest-list')
      }
    }

    // Check if budget is set
    if (wedding.budget && wedding.budget > 0) {
      if (!autoCompletedSteps.includes('budget-setup')) {
        autoCompletedSteps.push('budget-setup')
      }
    }

    // Update if changed
    if (autoCompletedSteps.length !== onboardingState.completedSteps.length) {
      updateOnboardingState({ completedSteps: autoCompletedSteps })
    }
  }, [wedding, tasks, guests, onboardingState.completedSteps, user])

  // Generate steps with completion status
  useEffect(() => {
    const stepsWithStatus = ONBOARDING_STEPS.map(step => ({
      ...step,
      completed: onboardingState.completedSteps.includes(step.id)
    }))
    setSteps(stepsWithStatus)
  }, [onboardingState.completedSteps])

  // Update onboarding state in Firestore
  const updateOnboardingState = useCallback(async (updates: Partial<OnboardingState>) => {
    if (!user?.id) return

    try {
      const onboardingRef = doc(db, 'onboarding', user.id)
      const newState = { ...onboardingState, ...updates, lastInteraction: new Date() }

      await setDoc(onboardingRef, {
        ...newState,
        lastInteraction: new Date()
      }, { merge: true })
      
      setOnboardingState(newState)
    } catch (error) {
      console.error('Error updating onboarding state:', error)
    }
  }, [user?.id, onboardingState])

  // Mark step as completed
  const completeStep = useCallback(async (stepId: string) => {
    if (onboardingState.completedSteps.includes(stepId)) return

    const newCompletedSteps = [...onboardingState.completedSteps, stepId]
    await updateOnboardingState({ completedSteps: newCompletedSteps })
  }, [onboardingState.completedSteps, updateOnboardingState])

  // Complete onboarding
  const completeOnboarding = useCallback(async () => {
    await updateOnboardingState({ 
      hasCompletedOnboarding: true,
      showWelcome: false
    })
  }, [updateOnboardingState])

  // Dismiss welcome
  const dismissWelcome = useCallback(async () => {
    await updateOnboardingState({ showWelcome: false })
  }, [updateOnboardingState])

  // Get next step
  const getNextStep = useCallback((): OnboardingStep | null => {
    const incompleteSteps = steps.filter(s => !s.completed)
    return incompleteSteps.length > 0 ? incompleteSteps[0] : null
  }, [steps])

  // Get progress percentage
  const getProgress = useCallback((): number => {
    if (steps.length === 0) return 0
    return Math.round((onboardingState.completedSteps.length / steps.length) * 100)
  }, [steps.length, onboardingState.completedSteps.length])

  return {
    onboardingState,
    steps,
    loading,
    completeStep,
    completeOnboarding,
    dismissWelcome,
    getNextStep,
    getProgress,
    updateOnboardingState
  }
}

