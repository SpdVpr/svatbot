'use client'

import { useState, useEffect } from 'react'
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  where,
  Timestamp,
  updateDoc,
  doc,
  getDocs
} from 'firebase/firestore'
import { db } from '@/config/firebase'

export interface AdminNotification {
  id: string
  type: 'registration' | 'payment' | 'inquiry' | 'feedback' | 'review' | 'vendor_registration' | 'subscription'
  title: string
  message: string
  data?: any
  read: boolean
  createdAt: Timestamp
  userId?: string
  userName?: string
  userEmail?: string
  amount?: number
}

export function useAdminNotifications() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Listen to recent user registrations
    const usersQuery = query(
      collection(db, 'users'),
      orderBy('createdAt', 'desc'),
      limit(50)
    )

    // Listen to recent payments
    const paymentsQuery = query(
      collection(db, 'payments'),
      orderBy('createdAt', 'desc'),
      limit(50)
    )

    // Listen to recent inquiries
    const inquiriesQuery = query(
      collection(db, 'vendorInquiries'),
      orderBy('createdAt', 'desc'),
      limit(50)
    )

    // Listen to recent feedback
    const feedbackQuery = query(
      collection(db, 'feedback'),
      orderBy('createdAt', 'desc'),
      limit(50)
    )

    // Listen to recent marketplace vendor registrations
    const vendorRegistrationsQuery = query(
      collection(db, 'marketplaceVendors'),
      orderBy('createdAt', 'desc'),
      limit(50)
    )

    const allNotifications: AdminNotification[] = []

    // Subscribe to users
    const unsubUsers = onSnapshot(usersQuery, (snapshot) => {
      const userNotifications: AdminNotification[] = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        const createdAt = data.createdAt as Timestamp
        
        // Only show registrations from last 7 days
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        
        if (createdAt && createdAt.toDate() > sevenDaysAgo) {
          userNotifications.push({
            id: `user-${doc.id}`,
            type: 'registration',
            title: 'Nová registrace',
            message: `${data.name || data.email} se zaregistroval`,
            data: { userId: doc.id },
            read: false,
            createdAt,
            userId: doc.id,
            userName: data.name,
            userEmail: data.email
          })
        }
      })
      
      updateNotifications(userNotifications, 'registration')
    })

    // Subscribe to payments
    const unsubPayments = onSnapshot(paymentsQuery, (snapshot) => {
      const paymentNotifications: AdminNotification[] = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        const createdAt = data.createdAt as Timestamp
        
        // Only show payments from last 30 days
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        
        if (createdAt && createdAt.toDate() > thirtyDaysAgo && data.status === 'succeeded') {
          paymentNotifications.push({
            id: `payment-${doc.id}`,
            type: 'payment',
            title: 'Nová platba',
            message: `Platba ${data.amount} Kč od ${data.customerName || data.customerEmail}`,
            data: { paymentId: doc.id },
            read: false,
            createdAt,
            userId: data.userId,
            userName: data.customerName,
            userEmail: data.customerEmail,
            amount: data.amount
          })
        }
      })
      
      updateNotifications(paymentNotifications, 'payment')
    })

    // Subscribe to inquiries
    const unsubInquiries = onSnapshot(inquiriesQuery, (snapshot) => {
      const inquiryNotifications: AdminNotification[] = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        const createdAt = data.createdAt as Timestamp
        
        // Only show inquiries from last 7 days
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        
        if (createdAt && createdAt.toDate() > sevenDaysAgo) {
          inquiryNotifications.push({
            id: `inquiry-${doc.id}`,
            type: 'inquiry',
            title: 'Nová poptávka',
            message: `${data.customerName} poslal poptávku na ${data.vendorName}`,
            data: { inquiryId: doc.id, vendorId: data.vendorId },
            read: false,
            createdAt,
            userName: data.customerName,
            userEmail: data.customerEmail
          })
        }
      })
      
      updateNotifications(inquiryNotifications, 'inquiry')
    })

    // Subscribe to feedback
    const unsubFeedback = onSnapshot(feedbackQuery, (snapshot) => {
      const feedbackNotifications: AdminNotification[] = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        const createdAt = data.createdAt as Timestamp

        // Only show feedback from last 7 days
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

        if (createdAt && createdAt.toDate() > sevenDaysAgo) {
          feedbackNotifications.push({
            id: `feedback-${doc.id}`,
            type: 'feedback',
            title: 'Nový feedback',
            message: `${data.userName || data.userEmail} poslal feedback: ${data.subject}`,
            data: { feedbackId: doc.id },
            read: false,
            createdAt,
            userName: data.userName,
            userEmail: data.userEmail
          })
        }
      })

      updateNotifications(feedbackNotifications, 'feedback')
      setLoading(false)
    })

    // Subscribe to marketplace vendor registrations
    const unsubVendorRegistrations = onSnapshot(vendorRegistrationsQuery, (snapshot) => {
      const vendorNotifications: AdminNotification[] = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        const createdAt = data.createdAt as Timestamp

        // Only show registrations from last 7 days
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

        if (createdAt && createdAt.toDate() > sevenDaysAgo) {
          vendorNotifications.push({
            id: `vendor-reg-${doc.id}`,
            type: 'vendor_registration',
            title: 'Nová registrace dodavatele',
            message: `${data.name} se zaregistroval jako ${data.category}`,
            data: { vendorId: doc.id, category: data.category, status: data.status },
            read: false,
            createdAt,
            userName: data.name,
            userEmail: data.email
          })
        }
      })

      updateNotifications(vendorNotifications, 'vendor_registration')
    })

    function updateNotifications(newNotifs: AdminNotification[], type: string) {
      setNotifications(prev => {
        // Remove old notifications of this type
        const filtered = prev.filter(n => n.type !== type)
        // Add new notifications and sort by date
        const combined = [...filtered, ...newNotifs]
        combined.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis())
        return combined.slice(0, 100) // Keep only 100 most recent
      })
    }

    return () => {
      unsubUsers()
      unsubPayments()
      unsubInquiries()
      unsubFeedback()
      unsubVendorRegistrations()
    }
  }, [])

  // Calculate unread count
  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.read).length)
  }, [notifications])

  return {
    notifications,
    unreadCount,
    loading
  }
}

