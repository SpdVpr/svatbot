'use client'

import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'
import { useWedding } from './useWedding'
import { db } from '@/config/firebase'
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore'
import {
  Subscription,
  SubscriptionPlan,
  SubscriptionStatus,
  Payment,
  UsageStats,
  SUBSCRIPTION_PLANS
} from '@/types/subscription'

export function useSubscription() {
  const { user } = useAuth()
  const { wedding } = useWedding()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load subscription data - only once when user/wedding changes
  useEffect(() => {
    if (!user || !wedding) {
      setLoading(false)
      return
    }

    loadSubscription()
    loadPayments()
    loadUsageStats()
  }, [user?.id, wedding?.id]) // Only depend on IDs to prevent unnecessary reloads

  // Load subscription
  const loadSubscription = async () => {
    if (!user || !wedding) return

    try {
      setLoading(true)
      const subscriptionRef = doc(db, 'subscriptions', user.id)
      const subscriptionDoc = await getDoc(subscriptionRef)

      if (subscriptionDoc.exists()) {
        const data = subscriptionDoc.data()
        setSubscription({
          id: subscriptionDoc.id,
          userId: data.userId,
          weddingId: data.weddingId,
          plan: data.plan,
          status: data.status,
          trialStartDate: data.trialStartDate?.toDate(),
          trialEndDate: data.trialEndDate?.toDate(),
          isTrialActive: data.isTrialActive,
          currentPeriodStart: data.currentPeriodStart?.toDate(),
          currentPeriodEnd: data.currentPeriodEnd?.toDate(),
          cancelAtPeriodEnd: data.cancelAtPeriodEnd || false,
          canceledAt: data.canceledAt?.toDate(),
          amount: data.amount,
          currency: data.currency,
          stripeCustomerId: data.stripeCustomerId,
          stripeSubscriptionId: data.stripeSubscriptionId,
          stripePaymentMethodId: data.stripePaymentMethodId,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        })
      } else {
        // Create initial free trial subscription
        await createTrialSubscription()
      }
    } catch (err: any) {
      // Silently handle permission errors (collection doesn't exist yet)
      if (err?.code === 'permission-denied' || err?.message?.includes('permission')) {
        console.log('ℹ️ Subscription not found, will create on first access')
        await createTrialSubscription()
      } else {
        console.error('Error loading subscription:', err)
        setError('Chyba při načítání předplatného')
      }
    } finally {
      setLoading(false)
    }
  }

  // Create trial subscription for new users
  const createTrialSubscription = async () => {
    if (!user || !wedding) return

    try {
      const now = new Date()
      const trialEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days

      const newSubscription: Subscription = {
        id: user.id,
        userId: user.id,
        weddingId: wedding.id,
        plan: 'free_trial',
        status: 'trialing',
        trialStartDate: now,
        trialEndDate: trialEnd,
        isTrialActive: true,
        currentPeriodStart: now,
        currentPeriodEnd: trialEnd,
        cancelAtPeriodEnd: false,
        amount: 0,
        currency: 'CZK',
        createdAt: now,
        updatedAt: now
      }

      const subscriptionRef = doc(db, 'subscriptions', user.id)
      await setDoc(subscriptionRef, {
        ...newSubscription,
        trialStartDate: Timestamp.fromDate(newSubscription.trialStartDate),
        trialEndDate: Timestamp.fromDate(newSubscription.trialEndDate),
        currentPeriodStart: Timestamp.fromDate(newSubscription.currentPeriodStart),
        currentPeriodEnd: Timestamp.fromDate(newSubscription.currentPeriodEnd),
        createdAt: Timestamp.fromDate(newSubscription.createdAt),
        updatedAt: Timestamp.fromDate(newSubscription.updatedAt)
      })

      setSubscription(newSubscription)
      console.log('✅ Trial subscription created')
    } catch (err) {
      console.error('Error creating trial subscription:', err)
      setError('Chyba při vytváření zkušebního období')
    }
  }

  // Load payment history
  const loadPayments = async () => {
    if (!user) return

    try {
      const paymentsRef = collection(db, 'payments')
      const q = query(
        paymentsRef,
        where('userId', '==', user.id),
        orderBy('createdAt', 'desc'),
        limit(50)
      )
      const snapshot = await getDocs(q)

      const paymentsData: Payment[] = snapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          userId: data.userId,
          subscriptionId: data.subscriptionId,
          amount: data.amount,
          currency: data.currency,
          status: data.status,
          paymentMethod: data.paymentMethod,
          last4: data.last4,
          createdAt: data.createdAt?.toDate(),
          paidAt: data.paidAt?.toDate(),
          invoiceUrl: data.invoiceUrl,
          invoiceNumber: data.invoiceNumber,
          stripePaymentIntentId: data.stripePaymentIntentId,
          stripeInvoiceId: data.stripeInvoiceId
        }
      })

      setPayments(paymentsData)
    } catch (err: any) {
      // Silently handle permission errors
      if (err?.code !== 'permission-denied' && !err?.message?.includes('permission')) {
        console.error('Error loading payments:', err)
      }
    }
  }

  // Load usage statistics
  const loadUsageStats = async () => {
    if (!user || !wedding) return

    try {
      const statsRef = doc(db, 'usageStats', user.id)
      const statsDoc = await getDoc(statsRef)

      if (statsDoc.exists()) {
        const data = statsDoc.data()
        setUsageStats({
          userId: data.userId,
          weddingId: data.weddingId,
          guestsCount: data.guestsCount || 0,
          tasksCount: data.tasksCount || 0,
          budgetItemsCount: data.budgetItemsCount || 0,
          vendorsCount: data.vendorsCount || 0,
          photosCount: data.photosCount || 0,
          lastLoginAt: data.lastLoginAt?.toDate(),
          totalLogins: data.totalLogins || 0,
          weddingWebsiteViews: data.weddingWebsiteViews || 0,
          rsvpResponses: data.rsvpResponses || 0,
          aiQueriesCount: data.aiQueriesCount || 0,
          updatedAt: data.updatedAt?.toDate()
        })
      }
    } catch (err: any) {
      // Silently handle permission errors
      if (err?.code !== 'permission-denied' && !err?.message?.includes('permission')) {
        console.error('Error loading usage stats:', err)
      }
    }
  }

  // Check if user has premium access
  const hasPremiumAccess = (): boolean => {
    if (!subscription) return false

    // Trial is active
    if (subscription.status === 'trialing' && subscription.isTrialActive) {
      const now = new Date()
      return now < subscription.trialEndDate
    }

    // Active paid subscription
    if (subscription.status === 'active' && 
        (subscription.plan === 'premium_monthly' || subscription.plan === 'premium_yearly')) {
      return true
    }

    return false
  }

  // Get days remaining in trial
  const getTrialDaysRemaining = (): number => {
    if (!subscription || !subscription.isTrialActive) return 0

    const now = new Date()
    const diff = subscription.trialEndDate.getTime() - now.getTime()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    return Math.max(0, days)
  }

  // Upgrade to premium
  const upgradeToPremium = async (plan: 'premium_monthly' | 'premium_yearly') => {
    if (!user || !subscription) return

    try {
      setLoading(true)

      // Import Stripe module dynamically
      const { createCheckoutSession } = await import('@/lib/stripe')

      // Create checkout session
      const checkoutUrl = await createCheckoutSession({
        userId: user.id,
        userEmail: user.email,
        plan,
        successUrl: `${window.location.origin}/dashboard?payment=success`,
        cancelUrl: `${window.location.origin}/dashboard?payment=canceled`
      })

      // Redirect to checkout (or success page in mock mode)
      window.location.href = checkoutUrl

    } catch (err) {
      console.error('Error upgrading subscription:', err)
      setError('Chyba při vytváření platby')
    } finally {
      setLoading(false)
    }
  }

  // Cancel subscription
  const cancelSubscription = async () => {
    if (!user || !subscription) return

    try {
      setLoading(true)

      // Import Stripe module dynamically
      const { cancelSubscription: cancelStripeSubscription } = await import('@/lib/stripe')

      // Cancel via Stripe (or mock)
      await cancelStripeSubscription(user.id, subscription.stripeSubscriptionId || subscription.id)

      setSubscription({
        ...subscription,
        cancelAtPeriodEnd: true,
        canceledAt: new Date(),
        updatedAt: new Date()
      })

      console.log('✅ Subscription canceled')
    } catch (err) {
      console.error('Error canceling subscription:', err)
      setError('Chyba při rušení předplatného')
    } finally {
      setLoading(false)
    }
  }

  // Reactivate subscription
  const reactivateSubscription = async () => {
    if (!user || !subscription) return

    try {
      setLoading(true)

      // Import Stripe module dynamically
      const { reactivateSubscription: reactivateStripeSubscription } = await import('@/lib/stripe')

      // Reactivate via Stripe (or mock)
      await reactivateStripeSubscription(user.id, subscription.stripeSubscriptionId || subscription.id)

      setSubscription({
        ...subscription,
        cancelAtPeriodEnd: false,
        canceledAt: undefined,
        updatedAt: new Date()
      })

      console.log('✅ Subscription reactivated')
    } catch (err) {
      console.error('Error reactivating subscription:', err)
      setError('Chyba při obnovení předplatného')
    } finally {
      setLoading(false)
    }
  }

  return {
    subscription,
    payments,
    usageStats,
    loading,
    error,
    hasPremiumAccess: hasPremiumAccess(),
    trialDaysRemaining: getTrialDaysRemaining(),
    plans: SUBSCRIPTION_PLANS,
    upgradeToPremium,
    cancelSubscription,
    reactivateSubscription,
    refreshSubscription: loadSubscription,
    refreshPayments: loadPayments,
    refreshUsageStats: loadUsageStats
  }
}

