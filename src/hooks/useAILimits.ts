'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'
import { useWedding } from './useWedding'
import { useSubscription } from './useSubscription'
import { useIsDemoUser } from './useDemoSettings'
import { db } from '@/config/firebase'
import { doc, getDoc, setDoc, updateDoc, increment, Timestamp } from 'firebase/firestore'

export type AIFeatureType = 'chat' | 'moodboard'

export interface AILimitsInfo {
  // Chat limits
  chatQueriesUsed: number
  chatQueriesLimit: number | 'unlimited'
  chatQueriesRemaining: number | 'unlimited'
  canUseChat: boolean
  
  // Moodboard limits
  moodboardsUsed: number
  moodboardsLimit: number | 'unlimited'
  moodboardsRemaining: number | 'unlimited'
  canUseMoodboard: boolean
  
  // General
  isLoading: boolean
  error: string | null
  lastResetDate: string
}

export function useAILimits() {
  const { user } = useAuth()
  const { wedding } = useWedding()
  const { subscription, hasPremiumAccess } = useSubscription()
  const { isDemoUser, isLocked } = useIsDemoUser(user?.id)

  const [limitsInfo, setLimitsInfo] = useState<AILimitsInfo>({
    chatQueriesUsed: 0,
    chatQueriesLimit: 3,
    chatQueriesRemaining: 3,
    canUseChat: true,
    moodboardsUsed: 0,
    moodboardsLimit: 1,
    moodboardsRemaining: 1,
    canUseMoodboard: true,
    isLoading: true,
    error: null,
    lastResetDate: new Date().toISOString().split('T')[0]
  })

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => new Date().toISOString().split('T')[0]

  // Load current usage stats
  const loadUsageStats = useCallback(async () => {
    if (!user || !wedding) {
      setLimitsInfo(prev => ({ ...prev, isLoading: false }))
      return
    }

    try {
      const statsRef = doc(db, 'usageStats', user.id)
      const statsDoc = await getDoc(statsRef)

      const today = getTodayDate()
      let chatUsed = 0
      let moodboardUsed = 0
      let lastReset = today

      if (statsDoc.exists()) {
        const data = statsDoc.data()
        lastReset = data.lastAIResetDate || today

        // Check if we need to reset (new day)
        if (lastReset !== today) {
          // Reset counters for new day
          await updateDoc(statsRef, {
            aiChatQueriesToday: 0,
            aiMoodboardsToday: 0,
            lastAIResetDate: today,
            updatedAt: Timestamp.now()
          })
          chatUsed = 0
          moodboardUsed = 0
        } else {
          chatUsed = data.aiChatQueriesToday || 0
          moodboardUsed = data.aiMoodboardsToday || 0
        }
      } else {
        // Create initial stats document
        await setDoc(statsRef, {
          userId: user.id,
          weddingId: wedding.id,
          guestsCount: 0,
          tasksCount: 0,
          budgetItemsCount: 0,
          vendorsCount: 0,
          photosCount: 0,
          lastLoginAt: Timestamp.now(),
          totalLogins: 1,
          weddingWebsiteViews: 0,
          rsvpResponses: 0,
          aiQueriesCount: 0,
          aiChatQueriesToday: 0,
          aiMoodboardsToday: 0,
          lastAIResetDate: today,
          updatedAt: Timestamp.now()
        })
      }

      // Check if this is a locked DEMO account
      if (isDemoUser && isLocked) {
        // DEMO account has 0 queries available
        setLimitsInfo({
          chatQueriesUsed: 0,
          chatQueriesLimit: 0,
          chatQueriesRemaining: 0,
          canUseChat: false,
          moodboardsUsed: 0,
          moodboardsLimit: 0,
          moodboardsRemaining: 0,
          canUseMoodboard: false,
          isLoading: false,
          error: null,
          lastResetDate: today
        })
        return
      }

      // Get limits from subscription
      const plan = subscription?.plan || 'free_trial'
      const planDetails = await import('@/types/subscription').then(m =>
        m.SUBSCRIPTION_PLANS.find(p => p.id === plan)
      )

      const chatLimit = hasPremiumAccess
        ? 'unlimited'
        : (planDetails?.limits.aiChatQueriesPerDay || 3)

      const moodboardLimit = hasPremiumAccess
        ? 'unlimited'
        : (planDetails?.limits.aiMoodboardsPerDay || 1)

      const chatRemaining = chatLimit === 'unlimited'
        ? 'unlimited'
        : Math.max(0, chatLimit - chatUsed)

      const moodboardRemaining = moodboardLimit === 'unlimited'
        ? 'unlimited'
        : Math.max(0, moodboardLimit - moodboardUsed)

      setLimitsInfo({
        chatQueriesUsed: chatUsed,
        chatQueriesLimit: chatLimit,
        chatQueriesRemaining: chatRemaining,
        canUseChat: chatLimit === 'unlimited' || chatUsed < chatLimit,
        moodboardsUsed: moodboardUsed,
        moodboardsLimit: moodboardLimit,
        moodboardsRemaining: moodboardRemaining,
        canUseMoodboard: moodboardLimit === 'unlimited' || moodboardUsed < moodboardLimit,
        isLoading: false,
        error: null,
        lastResetDate: today
      })

    } catch (err) {
      console.error('Error loading AI usage stats:', err)
      setLimitsInfo(prev => ({
        ...prev,
        isLoading: false,
        error: 'Chyba při načítání limitů AI funkcí'
      }))
    }
  }, [user?.id, wedding?.id, subscription?.plan, hasPremiumAccess, isDemoUser, isLocked])

  // Load on mount and when dependencies change
  useEffect(() => {
    loadUsageStats()
  }, [loadUsageStats])

  // Increment usage counter
  const incrementUsage = async (featureType: AIFeatureType): Promise<boolean> => {
    if (!user || !wedding) {
      throw new Error('Musíte být přihlášeni')
    }

    // Check if user can use this feature
    if (featureType === 'chat' && !limitsInfo.canUseChat) {
      throw new Error('Dosáhli jste denního limitu AI dotazů')
    }
    if (featureType === 'moodboard' && !limitsInfo.canUseMoodboard) {
      throw new Error('Dosáhli jste denního limitu AI moodboardů')
    }

    try {
      const statsRef = doc(db, 'usageStats', user.id)
      const today = getTodayDate()

      // Increment the appropriate counter
      const fieldName = featureType === 'chat' ? 'aiChatQueriesToday' : 'aiMoodboardsToday'
      
      await updateDoc(statsRef, {
        [fieldName]: increment(1),
        aiQueriesCount: increment(1), // Total counter
        lastAIResetDate: today,
        updatedAt: Timestamp.now()
      })

      // Reload stats to update UI
      await loadUsageStats()

      return true
    } catch (err) {
      console.error('Error incrementing AI usage:', err)
      throw new Error('Chyba při aktualizaci použití AI')
    }
  }

  // Check if user can use a feature (without incrementing)
  const canUseFeature = (featureType: AIFeatureType): boolean => {
    if (featureType === 'chat') {
      return limitsInfo.canUseChat
    }
    return limitsInfo.canUseMoodboard
  }

  // Get remaining uses for a feature
  const getRemainingUses = (featureType: AIFeatureType): number | 'unlimited' => {
    if (featureType === 'chat') {
      return limitsInfo.chatQueriesRemaining
    }
    return limitsInfo.moodboardsRemaining
  }

  // Get limit message for UI
  const getLimitMessage = (featureType: AIFeatureType): string => {
    // DEMO account message
    if (isDemoUser && isLocked) {
      return 'DEMO účet nemá přístup k AI funkcím. Registrujte se pro 3 dotazy denně zdarma.'
    }

    if (hasPremiumAccess) {
      return 'Neomezené použití s Premium členstvím'
    }

    if (featureType === 'chat') {
      const remaining = limitsInfo.chatQueriesRemaining
      if (remaining === 0) {
        return 'Dosáhli jste denního limitu 3 dotazů. Upgrade na Premium pro neomezené dotazy.'
      }
      return `Zbývá ${remaining} z ${limitsInfo.chatQueriesLimit} dotazů dnes`
    } else {
      const remaining = limitsInfo.moodboardsRemaining
      if (remaining === 0) {
        return 'Dosáhli jste denního limitu 1 moodboard. Upgrade na Premium pro neomezené generování.'
      }
      return `Zbývá ${remaining} z ${limitsInfo.moodboardsLimit} moodboardů dnes`
    }
  }

  return {
    limitsInfo,
    incrementUsage,
    canUseFeature,
    getRemainingUses,
    getLimitMessage,
    refreshLimits: loadUsageStats,
    isLoading: limitsInfo.isLoading,
    error: limitsInfo.error
  }
}

