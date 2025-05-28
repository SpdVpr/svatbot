import { useState, useEffect } from 'react'
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  limit
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useMarketplaceAuth } from './useAuth'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  data?: any
  read: boolean
  createdAt: any
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const { user } = useMarketplaceAuth()

  useEffect(() => {
    if (!user) {
      setNotifications([])
      setUnreadCount(0)
      setLoading(false)
      return
    }

    // Real-time listener for notifications
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(50)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notificationData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notification[]

      setNotifications(notificationData)
      setUnreadCount(notificationData.filter(n => !n.read).length)
      setLoading(false)
    })

    return unsubscribe
  }, [user])

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const notificationRef = doc(db, 'notifications', notificationId)
      await updateDoc(notificationRef, { read: true })
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read)

      const updatePromises = unreadNotifications.map(notification =>
        updateDoc(doc(db, 'notifications', notification.id), { read: true })
      )

      await Promise.all(updatePromises)
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead
  }
}

// Hook for showing toast notifications
export function useToastNotifications() {
  const [toasts, setToasts] = useState<Array<{
    id: string
    type: 'success' | 'error' | 'info' | 'warning'
    title: string
    message: string
  }>>([])

  const showToast = (
    type: 'success' | 'error' | 'info' | 'warning',
    title: string,
    message: string,
    duration = 5000
  ) => {
    const id = Date.now().toString()
    const toast = { id, type, title, message }

    setToasts(prev => [...prev, toast])

    // Auto remove after duration
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, duration)
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  return {
    toasts,
    showToast,
    removeToast,
    success: (title: string, message: string) => showToast('success', title, message),
    error: (title: string, message: string) => showToast('error', title, message),
    info: (title: string, message: string) => showToast('info', title, message),
    warning: (title: string, message: string) => showToast('warning', title, message)
  }
}
