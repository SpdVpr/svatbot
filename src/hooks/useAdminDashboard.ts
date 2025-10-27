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
  getDoc,
  updateDoc,
  addDoc,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '@/config/firebase'
import { 
  AdminStats, 
  UserAnalytics, 
  AdminConversation,
  UserFeedback,
  UserSubscription,
  Payment,
  AffiliatePartner
} from '@/types/admin'

export function useAdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDashboardStats()
  }, [])

  const loadDashboardStats = async () => {
    try {
      setLoading(true)

      // Load all stats in parallel
      const [
        userAnalytics,
        subscriptions,
        payments,
        conversations,
        feedback
      ] = await Promise.all([
        getDocs(collection(db, 'userAnalytics')),
        getDocs(collection(db, 'subscriptions')),
        getDocs(collection(db, 'payments')),
        getDocs(collection(db, 'adminMessages')),
        getDocs(collection(db, 'feedback'))
      ])

      // Calculate user stats
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

      let totalUsers = 0
      let activeUsers = 0
      let onlineUsers = 0
      let newUsersToday = 0
      let newUsersThisWeek = 0
      let newUsersThisMonth = 0
      let totalSessionTime = 0
      let totalSessions = 0

      userAnalytics.forEach(doc => {
        const data = doc.data() as UserAnalytics
        totalUsers++
        
        if (data.isOnline) onlineUsers++
        
        const lastActivity = data.lastActivityAt?.toDate()
        if (lastActivity && (now.getTime() - lastActivity.getTime()) < 24 * 60 * 60 * 1000) {
          activeUsers++
        }

        const registeredAt = data.registeredAt?.toDate()
        if (registeredAt) {
          if (registeredAt >= today) newUsersToday++
          if (registeredAt >= weekAgo) newUsersThisWeek++
          if (registeredAt >= monthAgo) newUsersThisMonth++
        }

        totalSessionTime += data.totalSessionTime || 0
        totalSessions += data.sessions?.length || 0
      })

      // Calculate subscription stats
      let activeSubscriptions = 0
      let trialUsers = 0
      let monthlyRevenue = 0
      let totalRevenue = 0

      subscriptions.forEach(doc => {
        const data = doc.data() as UserSubscription
        if (data.status === 'active') activeSubscriptions++
        if (data.status === 'trial') trialUsers++
        
        const startDate = data.startDate?.toDate()
        if (startDate && startDate >= monthAgo) {
          monthlyRevenue += data.amount || 0
        }
      })

      // Calculate total revenue from payments
      payments.forEach(doc => {
        const data = doc.data() as Payment
        if (data.status === 'completed') {
          totalRevenue += data.amount || 0
        }
      })

      // Calculate support stats
      let openConversations = 0
      conversations.forEach(doc => {
        const data = doc.data() as AdminConversation
        if (data.status === 'open' || data.status === 'pending') {
          openConversations++
        }
      })

      let pendingFeedback = 0
      feedback.forEach(doc => {
        const data = doc.data() as UserFeedback
        if (data.status === 'new' || data.status === 'in-progress') {
          pendingFeedback++
        }
      })

      // Calculate churn rate (simplified)
      const churnRate = activeSubscriptions > 0 
        ? ((totalUsers - activeSubscriptions) / totalUsers) * 100 
        : 0

      const avgSessionTime = totalUsers > 0 ? totalSessionTime / totalUsers : 0
      const avgSessionsPerUser = totalUsers > 0 ? totalSessions / totalUsers : 0

      const dashboardStats: AdminStats = {
        totalUsers,
        activeUsers,
        onlineUsers,
        newUsersToday,
        newUsersThisWeek,
        newUsersThisMonth,
        totalVendors: 0, // TODO: Load from vendors collection
        activeVendors: 0,
        pendingApprovals: 0,
        monthlyRevenue,
        totalRevenue,
        activeSubscriptions,
        trialUsers,
        churnRate,
        avgSessionTime,
        totalSessions,
        avgSessionsPerUser,
        openConversations,
        pendingFeedback,
        avgResponseTime: 0, // TODO: Calculate from messages
        topCategories: [],
        userGrowth: [],
        revenueGrowth: [],
        engagementTrend: []
      }

      setStats(dashboardStats)
      setLoading(false)
    } catch (err) {
      console.error('Error loading dashboard stats:', err)
      setError('Nepodařilo se načíst statistiky')
      setLoading(false)
    }
  }

  return {
    stats,
    loading,
    error,
    refresh: loadDashboardStats
  }
}

export function useUserAnalytics() {
  const [users, setUsers] = useState<UserAnalytics[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load all users first, then enrich with analytics data
    const usersQuery = query(
      collection(db, 'users'),
      limit(100)
    )

    const unsubscribe = onSnapshot(usersQuery, async (snapshot) => {
      try {
        // Get all users
        const allUsers = snapshot.docs.map(doc => ({
          id: doc.id,
          email: doc.data().email || '',
          displayName: doc.data().displayName || doc.data().email?.split('@')[0] || 'Unknown',
          createdAt: doc.data().createdAt
        }))

        // Enrich with analytics data
        const enrichedUsers = await Promise.all(
          allUsers.map(async (user) => {
            let analyticsData: any = {
              userId: user.id,
              email: user.email,
              displayName: user.displayName,
              registeredAt: user.createdAt || Timestamp.now(),
              lastLoginAt: user.createdAt || Timestamp.now(),
              lastActivityAt: user.createdAt || Timestamp.now(),
              isOnline: false,
              loginCount: 0,
              totalSessionTime: 0,
              sessions: [],
              pageViews: {},
              featuresUsed: [],
              aiQueriesCount: 0
            }

            // Try to load analytics data
            try {
              const analyticsDoc = await getDoc(doc(db, 'userAnalytics', user.id))
              if (analyticsDoc.exists()) {
                const data = analyticsDoc.data()
                analyticsData = {
                  ...analyticsData,
                  registeredAt: data.registeredAt || analyticsData.registeredAt,
                  lastLoginAt: data.lastLoginAt || analyticsData.lastLoginAt,
                  lastActivityAt: data.lastActivityAt || analyticsData.lastActivityAt,
                  isOnline: data.isOnline || false,
                  loginCount: data.loginCount || 0,
                  totalSessionTime: data.totalSessionTime || 0,
                  sessions: data.sessions || [],
                  pageViews: data.pageViews || {},
                  featuresUsed: data.featuresUsed || []
                }
              }
            } catch (error) {
              console.error(`Error loading analytics for user ${user.id}:`, error)
            }

            // Try to load AI queries from usageStats
            try {
              const statsDoc = await getDoc(doc(db, 'usageStats', user.id))
              if (statsDoc.exists()) {
                const statsData = statsDoc.data()
                analyticsData.aiQueriesCount = statsData.aiQueriesCount || 0
              }
            } catch (error) {
              console.error(`Error loading stats for user ${user.id}:`, error)
            }

            return {
              id: user.id,
              ...analyticsData
            } as UserAnalytics
          })
        )

        setUsers(enrichedUsers)
        setLoading(false)
      } catch (error) {
        console.error('Error loading user analytics:', error)
        setLoading(false)
      }
    }, (error) => {
      console.error('Error loading users:', error)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return { users, loading }
}

export function useAdminMessages() {
  const [conversations, setConversations] = useState<AdminConversation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(
      collection(db, 'adminMessages'),
      orderBy('lastMessageAt', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const convData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AdminConversation[]
      
      setConversations(convData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const sendMessage = async (conversationId: string, content: string, adminId: string, adminName: string) => {
    try {
      const convRef = doc(db, 'adminMessages', conversationId)
      const convDoc = await getDoc(convRef)
      
      if (!convDoc.exists()) {
        throw new Error('Conversation not found')
      }

      const conversation = convDoc.data() as AdminConversation
      const newMessage = {
        id: `msg_${Date.now()}`,
        senderId: adminId,
        senderType: 'admin' as const,
        senderName: adminName,
        content,
        timestamp: Timestamp.now(),
        read: false
      }

      await updateDoc(convRef, {
        messages: [...conversation.messages, newMessage],
        lastMessageAt: serverTimestamp(),
        status: 'open'
      })

      return true
    } catch (error) {
      console.error('Error sending message:', error)
      return false
    }
  }

  const closeConversation = async (conversationId: string) => {
    try {
      await updateDoc(doc(db, 'adminMessages', conversationId), {
        status: 'closed'
      })
      return true
    } catch (error) {
      console.error('Error closing conversation:', error)
      return false
    }
  }

  return { conversations, loading, sendMessage, closeConversation }
}

export function useFeedback() {
  const [feedback, setFeedback] = useState<UserFeedback[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(
      collection(db, 'feedback'),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const feedbackData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as UserFeedback[]
      
      setFeedback(feedbackData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const updateFeedbackStatus = async (feedbackId: string, status: UserFeedback['status'], adminNotes?: string) => {
    try {
      const updates: any = { status }
      if (status === 'resolved') {
        updates.resolvedAt = serverTimestamp()
      }
      if (adminNotes) {
        updates.adminNotes = adminNotes
      }

      await updateDoc(doc(db, 'feedback', feedbackId), updates)
      return true
    } catch (error) {
      console.error('Error updating feedback:', error)
      return false
    }
  }

  return { feedback, loading, updateFeedbackStatus }
}

