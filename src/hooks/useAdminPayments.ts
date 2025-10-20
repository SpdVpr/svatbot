'use client'

import { useState, useEffect } from 'react'
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit,
  getDocs,
  onSnapshot,
  Timestamp,
  doc,
  getDoc
} from 'firebase/firestore'
import { db } from '@/config/firebase'

export interface AdminPaymentStats {
  // Revenue
  totalRevenue: number
  monthlyRevenue: number
  yearlyRevenue: number
  averageOrderValue: number
  
  // Subscriptions
  totalSubscriptions: number
  activeSubscriptions: number
  trialingSubscriptions: number
  canceledSubscriptions: number
  
  // Payments
  totalPayments: number
  successfulPayments: number
  failedPayments: number
  pendingPayments: number
  refundedPayments: number
  
  // Growth
  newSubscriptionsThisMonth: number
  newSubscriptionsThisWeek: number
  churnRate: number
  
  // Plans breakdown
  monthlyPlanCount: number
  yearlyPlanCount: number
  
  // MRR (Monthly Recurring Revenue)
  mrr: number
  arr: number // Annual Recurring Revenue
}

export interface AdminPaymentRecord {
  id: string
  userId: string
  userEmail: string
  userName?: string
  subscriptionId: string
  amount: number
  currency: string
  status: 'succeeded' | 'failed' | 'pending' | 'processing' | 'refunded' | 'canceled'
  paymentMethod: string
  last4?: string
  createdAt: Date
  paidAt?: Date
  invoiceUrl?: string
  invoiceNumber?: string
  stripePaymentIntentId?: string
  stripeInvoiceId?: string
  plan?: string
}

export interface AdminSubscriptionRecord {
  id: string
  userId: string
  userEmail: string
  userName?: string
  weddingId: string
  plan: string
  status: 'trialing' | 'active' | 'canceled' | 'past_due' | 'unpaid'
  amount: number
  currency: string
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
  canceledAt?: Date
  trialEndDate?: Date
  createdAt: Date
  updatedAt: Date
}

export function useAdminPayments(onNewPayment?: (payment: AdminPaymentRecord) => void) {
  const [stats, setStats] = useState<AdminPaymentStats | null>(null)
  const [payments, setPayments] = useState<AdminPaymentRecord[]>([])
  const [subscriptions, setSubscriptions] = useState<AdminSubscriptionRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastPaymentId, setLastPaymentId] = useState<string | null>(null)

  useEffect(() => {
    loadPaymentData()

    // Set up real-time listener for new payments
    const paymentsRef = collection(db, 'payments')
    const q = query(
      paymentsRef,
      orderBy('createdAt', 'desc'),
      limit(1)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const docId = change.doc.id

          // Skip if this is the initial load or we've already seen this payment
          if (lastPaymentId && docId !== lastPaymentId) {
            const data = change.doc.data()
            const newPayment: AdminPaymentRecord = {
              id: docId,
              userId: data.userId,
              userEmail: data.userEmail || 'Unknown',
              userName: data.userName,
              subscriptionId: data.subscriptionId,
              amount: data.amount,
              currency: data.currency,
              status: data.status,
              paymentMethod: data.paymentMethod,
              last4: data.last4,
              createdAt: data.createdAt?.toDate() || new Date(),
              paidAt: data.paidAt?.toDate(),
              invoiceUrl: data.invoiceUrl,
              invoiceNumber: data.invoiceNumber,
              stripePaymentIntentId: data.stripePaymentIntentId,
              stripeInvoiceId: data.stripeInvoiceId,
              plan: data.plan
            }

            // Call callback if provided
            if (onNewPayment) {
              onNewPayment(newPayment)
            }

            // Refresh data
            loadPaymentData()
          }

          setLastPaymentId(docId)
        }
      })
    })

    return () => unsubscribe()
  }, [lastPaymentId, onNewPayment])

  const loadPaymentData = async () => {
    try {
      setLoading(true)

      // Load all data in parallel
      await Promise.all([
        loadPayments(),
        loadSubscriptions()
      ])

      setLoading(false)
    } catch (err) {
      console.error('Error loading payment data:', err)
      setError('Nepodařilo se načíst platební data')
      setLoading(false)
    }
  }

  const loadPayments = async () => {
    try {
      const paymentsRef = collection(db, 'payments')
      const q = query(
        paymentsRef,
        orderBy('createdAt', 'desc'),
        limit(500)
      )

      const snapshot = await getDocs(q)
      const paymentsData: AdminPaymentRecord[] = []

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data()
        
        // Get user info
        let userEmail = data.userEmail || 'Unknown'
        let userName = data.userName
        
        if (data.userId && !userName) {
          try {
            const userDoc = await getDoc(doc(db, 'users', data.userId))
            if (userDoc.exists()) {
              const userData = userDoc.data()
              userEmail = userData.email || userEmail
              userName = userData.displayName || userData.email?.split('@')[0]
            }
          } catch (err) {
            console.log('Could not fetch user data for payment:', data.userId)
          }
        }

        paymentsData.push({
          id: docSnap.id,
          userId: data.userId,
          userEmail,
          userName,
          subscriptionId: data.subscriptionId,
          amount: data.amount,
          currency: data.currency,
          status: data.status,
          paymentMethod: data.paymentMethod,
          last4: data.last4,
          createdAt: data.createdAt?.toDate() || new Date(),
          paidAt: data.paidAt?.toDate(),
          invoiceUrl: data.invoiceUrl,
          invoiceNumber: data.invoiceNumber,
          stripePaymentIntentId: data.stripePaymentIntentId,
          stripeInvoiceId: data.stripeInvoiceId,
          plan: data.plan
        })
      }

      setPayments(paymentsData)
      calculateStats(paymentsData, subscriptions)
    } catch (err: any) {
      if (err?.code !== 'permission-denied' && !err?.message?.includes('permission')) {
        console.error('Error loading payments:', err)
      }
    }
  }

  const loadSubscriptions = async () => {
    try {
      const subscriptionsRef = collection(db, 'subscriptions')
      const q = query(
        subscriptionsRef,
        orderBy('createdAt', 'desc'),
        limit(500)
      )

      const snapshot = await getDocs(q)
      const subscriptionsData: AdminSubscriptionRecord[] = []

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data()
        
        // Get user info
        let userEmail = 'Unknown'
        let userName = undefined
        
        if (data.userId) {
          try {
            const userDoc = await getDoc(doc(db, 'users', data.userId))
            if (userDoc.exists()) {
              const userData = userDoc.data()
              userEmail = userData.email || userEmail
              userName = userData.displayName || userData.email?.split('@')[0]
            }
          } catch (err) {
            console.log('Could not fetch user data for subscription:', data.userId)
          }
        }

        subscriptionsData.push({
          id: docSnap.id,
          userId: data.userId,
          userEmail,
          userName,
          weddingId: data.weddingId,
          plan: data.plan,
          status: data.status,
          amount: data.amount || 0,
          currency: data.currency || 'CZK',
          currentPeriodStart: data.currentPeriodStart?.toDate() || new Date(),
          currentPeriodEnd: data.currentPeriodEnd?.toDate() || new Date(),
          cancelAtPeriodEnd: data.cancelAtPeriodEnd || false,
          canceledAt: data.canceledAt?.toDate(),
          trialEndDate: data.trialEndDate?.toDate(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        })
      }

      setSubscriptions(subscriptionsData)
      calculateStats(payments, subscriptionsData)
    } catch (err: any) {
      if (err?.code !== 'permission-denied' && !err?.message?.includes('permission')) {
        console.error('Error loading subscriptions:', err)
      }
    }
  }

  const calculateStats = (paymentsData: AdminPaymentRecord[], subscriptionsData: AdminSubscriptionRecord[]) => {
    const now = new Date()
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const thisYear = new Date(now.getFullYear(), 0, 1)

    // Revenue calculations
    let totalRevenue = 0
    let monthlyRevenue = 0
    let yearlyRevenue = 0
    let successfulPayments = 0
    let failedPayments = 0
    let pendingPayments = 0
    let refundedPayments = 0

    paymentsData.forEach(payment => {
      if (payment.status === 'succeeded') {
        totalRevenue += payment.amount
        successfulPayments++
        
        if (payment.createdAt >= thisMonth) {
          monthlyRevenue += payment.amount
        }
        if (payment.createdAt >= thisYear) {
          yearlyRevenue += payment.amount
        }
      } else if (payment.status === 'failed') {
        failedPayments++
      } else if (payment.status === 'pending' || payment.status === 'processing') {
        pendingPayments++
      } else if (payment.status === 'refunded') {
        refundedPayments++
      }
    })

    // Subscription calculations
    let activeSubscriptions = 0
    let trialingSubscriptions = 0
    let canceledSubscriptions = 0
    let monthlyPlanCount = 0
    let yearlyPlanCount = 0
    let newSubscriptionsThisMonth = 0
    let newSubscriptionsThisWeek = 0
    let mrr = 0

    subscriptionsData.forEach(sub => {
      if (sub.status === 'active') {
        activeSubscriptions++
        
        // Calculate MRR (use fixed prices from plans)
        if (sub.plan === 'premium_monthly') {
          mrr += 299 // 299 CZK per month
          monthlyPlanCount++
        } else if (sub.plan === 'premium_yearly') {
          mrr += 2999 / 12 // 2999 CZK per year = ~250 CZK per month
          yearlyPlanCount++
        }
      } else if (sub.status === 'trialing') {
        trialingSubscriptions++
      } else if (sub.status === 'canceled') {
        canceledSubscriptions++
      }

      if (sub.createdAt >= thisMonth) {
        newSubscriptionsThisMonth++
      }
      if (sub.createdAt >= thisWeek) {
        newSubscriptionsThisWeek++
      }
    })

    const totalSubscriptions = subscriptionsData.length
    const churnRate = totalSubscriptions > 0 
      ? (canceledSubscriptions / totalSubscriptions) * 100 
      : 0

    const averageOrderValue = successfulPayments > 0 
      ? totalRevenue / successfulPayments 
      : 0

    const arr = mrr * 12

    setStats({
      totalRevenue,
      monthlyRevenue,
      yearlyRevenue,
      averageOrderValue,
      totalSubscriptions,
      activeSubscriptions,
      trialingSubscriptions,
      canceledSubscriptions,
      totalPayments: paymentsData.length,
      successfulPayments,
      failedPayments,
      pendingPayments,
      refundedPayments,
      newSubscriptionsThisMonth,
      newSubscriptionsThisWeek,
      churnRate,
      monthlyPlanCount,
      yearlyPlanCount,
      mrr,
      arr
    })
  }

  return {
    stats,
    payments,
    subscriptions,
    loading,
    error,
    refresh: loadPaymentData
  }
}

