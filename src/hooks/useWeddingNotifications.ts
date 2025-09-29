'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
  deleteDoc,
  getDocs,
  serverTimestamp,
  limit
} from 'firebase/firestore'
import { db } from '@/config/firebase'
import { useAuth } from '@/hooks/useAuth'

export interface WeddingNotification {
  id: string
  userId: string
  type: WeddingNotificationType
  title: string
  message: string
  data?: any
  read: boolean
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: 'task' | 'timeline' | 'budget' | 'guest' | 'vendor' | 'system'
  actionUrl?: string
  createdAt: any
  expiresAt?: any
}

export enum WeddingNotificationType {
  // Task notifications
  TASK_DUE_SOON = 'task_due_soon',
  TASK_OVERDUE = 'task_overdue',
  TASK_COMPLETED = 'task_completed',
  TASK_ASSIGNED = 'task_assigned',
  
  // Timeline notifications
  TIMELINE_REMINDER = 'timeline_reminder',
  TIMELINE_CONFLICT = 'timeline_conflict',
  TIMELINE_UPDATED = 'timeline_updated',
  
  // Budget notifications
  BUDGET_EXCEEDED = 'budget_exceeded',
  BUDGET_WARNING = 'budget_warning',
  PAYMENT_DUE = 'payment_due',
  PAYMENT_OVERDUE = 'payment_overdue',
  
  // Guest notifications
  RSVP_RECEIVED = 'rsvp_received',
  RSVP_REMINDER = 'rsvp_reminder',
  GUEST_DIETARY_UPDATE = 'guest_dietary_update',
  
  // Vendor notifications
  VENDOR_MESSAGE = 'vendor_message',
  VENDOR_MEETING_REMINDER = 'vendor_meeting_reminder',
  VENDOR_CONTRACT_EXPIRING = 'vendor_contract_expiring',
  
  // System notifications
  WEDDING_COUNTDOWN = 'wedding_countdown',
  BACKUP_REMINDER = 'backup_reminder',
  SYSTEM_UPDATE = 'system_update'
}

export function useWeddingNotifications() {
  const [notifications, setNotifications] = useState<WeddingNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [cleanupDone, setCleanupDone] = useState(false)
  const { user } = useAuth()
  const listenerRef = useRef<(() => void) | null>(null)

  // Cleanup duplicates on first load (only once per user)
  useEffect(() => {
    if (!user?.id || cleanupDone) return

    // Check if cleanup was already done for this user
    const cleanupKey = `notifications-cleanup-done-${user.id}`
    const wasCleanupDone = localStorage.getItem(cleanupKey)

    if (wasCleanupDone) {
      console.log('🧹 Notifications cleanup already done for user:', user.id)
      setCleanupDone(true)
      return
    }

    const cleanupDuplicates = async () => {
      try {
        console.log('🧹 Cleaning up duplicate notifications for user:', user.id)

        // Direct Firestore cleanup instead of API call
        const q = query(
          collection(db, 'weddingNotifications'),
          where('userId', '==', user.id),
          orderBy('createdAt', 'desc')
        )

        const snapshot = await getDocs(q)
        const seen = new Set<string>()
        const toDelete: string[] = []

        // Find duplicates - group by unique key and keep the most recent one
        const notificationGroups = new Map<string, any[]>()

        for (const docSnapshot of snapshot.docs) {
          const data = docSnapshot.data()
          const uniqueKey = `${data.userId}_${data.type}_${data.title}_${data.message}`

          if (!notificationGroups.has(uniqueKey)) {
            notificationGroups.set(uniqueKey, [])
          }

          notificationGroups.get(uniqueKey)!.push({
            id: docSnapshot.id,
            data: data,
            createdAt: data.createdAt?.toDate() || new Date(0)
          })
        }

        // For each group, keep the most recent one and delete the rest
        notificationGroups.forEach((notifications, uniqueKey) => {
          if (notifications.length > 1) {
            // Sort by creation date (newest first)
            notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

            // Keep the first (newest) one, delete the rest
            for (let i = 1; i < notifications.length; i++) {
              toDelete.push(notifications[i].id)
            }
          }
        })

        // Delete duplicates
        for (const notificationId of toDelete) {
          await deleteDoc(doc(db, 'weddingNotifications', notificationId))
        }

        if (toDelete.length > 0) {
          console.log(`✅ Cleaned up ${toDelete.length} duplicate notifications`)
        }

        // Mark cleanup as done for this user
        localStorage.setItem(cleanupKey, 'true')
        setCleanupDone(true)
      } catch (error) {
        console.error('❌ Error cleaning up notifications:', error)
        // Mark cleanup as done even on error to prevent infinite retries
        localStorage.setItem(cleanupKey, 'true')
        setCleanupDone(true)
      }
    }

    cleanupDuplicates()
  }, [user?.id, cleanupDone])

  useEffect(() => {
    if (!user?.id || !cleanupDone) {
      setNotifications([])
      setUnreadCount(0)
      setLoading(false)
      return
    }

    // Cleanup existing listener
    if (listenerRef.current) {
      console.log('🧹 Cleaning up existing listener')
      listenerRef.current()
      listenerRef.current = null
    }

    console.log('Setting up notifications listener for user:', user.id)

    // Real-time listener for wedding notifications
    const q = query(
      collection(db, 'weddingNotifications'),
      where('userId', '==', user.id),
      orderBy('createdAt', 'desc'),
      limit(100)
    )

    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('Notifications snapshot received:', snapshot.docs.length)
        }
        const notificationData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as WeddingNotification[]

        // Filter out expired notifications
        const now = new Date()
        const activeNotifications = notificationData.filter(n =>
          !n.expiresAt || n.expiresAt.toDate() > now
        )

        setNotifications(activeNotifications)
        setUnreadCount(activeNotifications.filter(n => !n.read).length)
        setLoading(false)
      },
      (error) => {
        console.error('Notifications listener error:', error)
        setLoading(false)
        // For demo purposes, set some mock notifications
        setNotifications([])
        setUnreadCount(0)
      }
    )

    // Store the unsubscribe function
    listenerRef.current = unsubscribe

    return () => {
      if (listenerRef.current) {
        listenerRef.current()
        listenerRef.current = null
      }
    }
  }, [user?.id, cleanupDone]) // Only depend on user.id and cleanup status

  // Create new notification
  const createNotification = useCallback(async (
    type: WeddingNotificationType,
    title: string,
    message: string,
    options?: {
      priority?: 'low' | 'medium' | 'high' | 'urgent'
      category?: 'task' | 'timeline' | 'budget' | 'guest' | 'vendor' | 'system'
      data?: any
      actionUrl?: string
      expiresIn?: number // minutes
    }
  ) => {
    if (!user?.id) return

    try {
      const notification: Omit<WeddingNotification, 'id'> = {
        userId: user.id,
        type,
        title,
        message,
        priority: options?.priority || 'medium',
        category: options?.category || 'system',
        data: options?.data,
        actionUrl: options?.actionUrl,
        read: false,
        createdAt: serverTimestamp()
      }

      // Only add expiresAt if expiresIn is provided
      if (options?.expiresIn) {
        notification.expiresAt = new Date(Date.now() + options.expiresIn * 60 * 1000)
      }

      await addDoc(collection(db, 'weddingNotifications'), notification)
    } catch (error) {
      console.error('Error creating notification:', error)
    }
  }, [user])

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const notificationRef = doc(db, 'weddingNotifications', notificationId)
      await updateDoc(notificationRef, { read: true })
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }, [])

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read)
      const updatePromises = unreadNotifications.map(notification =>
        updateDoc(doc(db, 'weddingNotifications', notification.id), { read: true })
      )
      await Promise.all(updatePromises)
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }, [notifications])

  // Get notifications by category
  const getNotificationsByCategory = useCallback((category: string) => {
    return notifications.filter(n => n.category === category)
  }, [notifications])

  // Get notifications by priority
  const getNotificationsByPriority = useCallback((priority: string) => {
    return notifications.filter(n => n.priority === priority)
  }, [notifications])

  // Reset cleanup flag (for debugging)
  const resetCleanup = useCallback(() => {
    if (user?.id) {
      const cleanupKey = `notifications-cleanup-done-${user.id}`
      localStorage.removeItem(cleanupKey)
      setCleanupDone(false)
      console.log('🔄 Cleanup flag reset for user:', user.id)
    }
  }, [user?.id])

  // Delete all notifications for current user (for debugging)
  const deleteAllNotifications = useCallback(async () => {
    if (!user?.id) return

    try {
      console.log('🗑️ Deleting all notifications for user:', user.id)

      const q = query(
        collection(db, 'weddingNotifications'),
        where('userId', '==', user.id)
      )

      const snapshot = await getDocs(q)
      let deletedCount = 0

      for (const docSnapshot of snapshot.docs) {
        await deleteDoc(doc(db, 'weddingNotifications', docSnapshot.id))
        deletedCount++
      }

      console.log(`✅ Deleted ${deletedCount} notifications`)

      // Reset cleanup flag so cleanup can run again if needed
      const cleanupKey = `notifications-cleanup-done-${user.id}`
      localStorage.removeItem(cleanupKey)
      setCleanupDone(false)

      return { success: true, deletedCount }
    } catch (error) {
      console.error('❌ Error deleting notifications:', error)
      return { success: false, error }
    }
  }, [user?.id])

  return {
    notifications,
    unreadCount,
    loading,
    createNotification,
    markAsRead,
    markAllAsRead,
    getNotificationsByCategory,
    getNotificationsByPriority,
    resetCleanup,
    deleteAllNotifications
  }
}

// Hook for live toast notifications
export function useLiveToastNotifications() {
  const [toasts, setToasts] = useState<Array<{
    id: string
    type: 'success' | 'error' | 'info' | 'warning'
    title: string
    message: string
    priority: 'low' | 'medium' | 'high' | 'urgent'
    actionUrl?: string
  }>>([])

  const showToast = useCallback((
    type: 'success' | 'error' | 'info' | 'warning',
    title: string,
    message: string,
    options?: {
      priority?: 'low' | 'medium' | 'high' | 'urgent'
      actionUrl?: string
      duration?: number
    }
  ) => {
    const id = Date.now().toString()
    const toast = { 
      id, 
      type, 
      title, 
      message, 
      priority: options?.priority || 'medium',
      actionUrl: options?.actionUrl
    }

    setToasts(prev => [...prev, toast])

    // Auto remove based on priority
    const duration = options?.duration || (
      options?.priority === 'urgent' ? 10000 :
      options?.priority === 'high' ? 7000 :
      options?.priority === 'medium' ? 5000 : 3000
    )

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, duration)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return {
    toasts,
    showToast,
    removeToast,
    success: (title: string, message: string, options?: any) => 
      showToast('success', title, message, options),
    error: (title: string, message: string, options?: any) => 
      showToast('error', title, message, options),
    info: (title: string, message: string, options?: any) => 
      showToast('info', title, message, options),
    warning: (title: string, message: string, options?: any) => 
      showToast('warning', title, message, options)
  }
}
