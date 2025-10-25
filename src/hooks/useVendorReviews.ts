'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  getDocs,
  getDoc,
  Timestamp,
  onSnapshot
} from 'firebase/firestore'
import { db } from '@/config/firebase'
import { useAuth } from './useAuth'
import type { VendorReview, CreateReviewData, ReviewStats, ReviewFilters } from '@/types/review'

export function useVendorReviews(vendorId?: string) {
  const { user } = useAuth()
  const [reviews, setReviews] = useState<VendorReview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Convert Firestore data to VendorReview
  const convertReview = (id: string, data: any): VendorReview => ({
    id,
    vendorId: data.vendorId,
    userId: data.userId,
    userName: data.userName,
    userEmail: data.userEmail,
    rating: data.rating,
    title: data.title,
    text: data.text,
    ratings: data.ratings,
    images: data.images || [],
    weddingDate: data.weddingDate?.toDate(),
    serviceUsed: data.serviceUsed,
    status: data.status,
    moderatedBy: data.moderatedBy,
    moderatedAt: data.moderatedAt?.toDate(),
    moderationNote: data.moderationNote,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
    response: data.response ? {
      text: data.response.text,
      createdAt: data.response.createdAt?.toDate() || new Date()
    } : undefined
  })

  // Load reviews for a specific vendor or all reviews (for admin)
  const loadReviews = useCallback(async (filters?: ReviewFilters) => {
    try {
      setLoading(true)
      setError(null)

      const reviewsRef = collection(db, 'vendorReviews')
      let q = query(reviewsRef, orderBy('createdAt', 'desc'))

      // Apply filters
      if (filters?.vendorId || vendorId) {
        q = query(q, where('vendorId', '==', filters?.vendorId || vendorId))
      }
      if (filters?.userId) {
        q = query(q, where('userId', '==', filters.userId))
      }
      if (filters?.status) {
        q = query(q, where('status', '==', filters.status))
      }

      const snapshot = await getDocs(q)
      const reviewsData = snapshot.docs.map(doc => convertReview(doc.id, doc.data()))

      // Apply additional filters (minRating, maxRating)
      let filteredReviews = reviewsData
      if (filters?.minRating) {
        filteredReviews = filteredReviews.filter(r => r.rating >= filters.minRating!)
      }
      if (filters?.maxRating) {
        filteredReviews = filteredReviews.filter(r => r.rating <= filters.maxRating!)
      }

      setReviews(filteredReviews)
    } catch (err: any) {
      console.error('Error loading reviews:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [vendorId])

  // Load reviews on mount
  useEffect(() => {
    if (vendorId || user) {
      loadReviews()
    }
  }, [loadReviews, vendorId, user])

  // Real-time subscription for vendor reviews
  useEffect(() => {
    if (!vendorId) return

    const reviewsRef = collection(db, 'vendorReviews')
    const q = query(
      reviewsRef,
      where('vendorId', '==', vendorId),
      where('status', '==', 'approved'),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reviewsData = snapshot.docs.map(doc => convertReview(doc.id, doc.data()))
      setReviews(reviewsData)
    })

    return () => unsubscribe()
  }, [vendorId])

  // Create a new review
  const createReview = async (data: CreateReviewData): Promise<string> => {
    if (!user) {
      throw new Error('Musíte být přihlášeni pro napsání recenze')
    }

    try {
      const reviewsRef = collection(db, 'vendorReviews')

      // Check if user already reviewed this vendor
      const existingQuery = query(
        reviewsRef,
        where('vendorId', '==', data.vendorId),
        where('userId', '==', user.id)
      )
      const existing = await getDocs(existingQuery)

      if (!existing.empty) {
        throw new Error('Již jste recenzovali tohoto dodavatele')
      }

      const newReview = {
        vendorId: data.vendorId,
        userId: user.id,
        userName: user.displayName || 'Anonymní uživatel',
        userEmail: user.email,
        rating: data.rating,
        text: data.text,
        ratings: data.ratings,
        images: data.images || [],
        weddingDate: data.weddingDate ? Timestamp.fromDate(data.weddingDate) : null,
        serviceUsed: data.serviceUsed || '',
        status: 'pending', // All reviews need admin approval
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }

      const docRef = await addDoc(reviewsRef, newReview)
      await loadReviews()
      return docRef.id
    } catch (err: any) {
      console.error('Error creating review:', err)
      throw err
    }
  }

  // Update review (only by owner)
  const updateReview = async (reviewId: string, updates: Partial<CreateReviewData>): Promise<void> => {
    if (!user) {
      throw new Error('Musíte být přihlášeni')
    }

    try {
      const reviewRef = doc(db, 'vendorReviews', reviewId)
      const reviewDoc = await getDoc(reviewRef)

      if (!reviewDoc.exists()) {
        throw new Error('Recenze nenalezena')
      }

      const reviewData = reviewDoc.data()
      if (reviewData.userId !== user.id) {
        throw new Error('Nemáte oprávnění upravovat tuto recenzi')
      }

      const updateData: any = {
        ...updates,
        updatedAt: Timestamp.now(),
        status: 'pending' // Reset to pending after edit
      }

      if (updates.weddingDate) {
        updateData.weddingDate = Timestamp.fromDate(updates.weddingDate)
      }

      await updateDoc(reviewRef, updateData)
      await loadReviews()
    } catch (err: any) {
      console.error('Error updating review:', err)
      throw err
    }
  }

  // Delete review (only by owner)
  const deleteReview = async (reviewId: string): Promise<void> => {
    if (!user) {
      throw new Error('Musíte být přihlášeni')
    }

    try {
      const reviewRef = doc(db, 'vendorReviews', reviewId)
      const reviewDoc = await getDoc(reviewRef)

      if (!reviewDoc.exists()) {
        throw new Error('Recenze nenalezena')
      }

      const reviewData = reviewDoc.data()
      if (reviewData.userId !== user.id) {
        throw new Error('Nemáte oprávnění smazat tuto recenzi')
      }

      await deleteDoc(reviewRef)
      await loadReviews()
    } catch (err: any) {
      console.error('Error deleting review:', err)
      throw err
    }
  }

  // Admin: Approve review
  const approveReview = async (reviewId: string, note?: string): Promise<void> => {
    if (!user) {
      throw new Error('Musíte být přihlášeni')
    }

    try {
      const reviewRef = doc(db, 'vendorReviews', reviewId)
      await updateDoc(reviewRef, {
        status: 'approved',
        moderatedBy: user.id,
        moderatedAt: Timestamp.now(),
        moderationNote: note || '',
        updatedAt: Timestamp.now()
      })
      await loadReviews()
    } catch (err: any) {
      console.error('Error approving review:', err)
      throw err
    }
  }

  // Admin: Reject review
  const rejectReview = async (reviewId: string, reason: string): Promise<void> => {
    if (!user) {
      throw new Error('Musíte být přihlášeni')
    }

    try {
      const reviewRef = doc(db, 'vendorReviews', reviewId)
      await updateDoc(reviewRef, {
        status: 'rejected',
        moderatedBy: user.id,
        moderatedAt: Timestamp.now(),
        moderationNote: reason,
        updatedAt: Timestamp.now()
      })
      await loadReviews()
    } catch (err: any) {
      console.error('Error rejecting review:', err)
      throw err
    }
  }

  // Get review statistics for a vendor
  const getReviewStats = useCallback((): ReviewStats => {
    const approvedReviews = reviews.filter(r => r.status === 'approved')

    if (approvedReviews.length === 0) {
      return {
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        averageRatings: {
          quality: 0,
          communication: 0,
          value: 0,
          professionalism: 0
        }
      }
    }

    const totalRating = approvedReviews.reduce((sum, r) => sum + r.rating, 0)
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }

    approvedReviews.forEach(r => {
      distribution[r.rating as keyof typeof distribution]++
    })

    const avgRatings = {
      quality: approvedReviews.reduce((sum, r) => sum + r.ratings.quality, 0) / approvedReviews.length,
      communication: approvedReviews.reduce((sum, r) => sum + r.ratings.communication, 0) / approvedReviews.length,
      value: approvedReviews.reduce((sum, r) => sum + r.ratings.value, 0) / approvedReviews.length,
      professionalism: approvedReviews.reduce((sum, r) => sum + r.ratings.professionalism, 0) / approvedReviews.length
    }

    return {
      totalReviews: approvedReviews.length,
      averageRating: totalRating / approvedReviews.length,
      ratingDistribution: distribution,
      averageRatings: avgRatings
    }
  }, [reviews])

  // Get approved reviews only (for public display)
  const approvedReviews = reviews.filter(r => r.status === 'approved')

  // Check if current user has already reviewed this vendor
  const hasUserReviewed = useCallback((vendorId: string): boolean => {
    if (!user) return false
    return reviews.some(r => r.vendorId === vendorId && r.userId === user.id)
  }, [user, reviews])

  return {
    reviews: approvedReviews,
    allReviews: reviews, // For admin use
    loading,
    error,
    stats: getReviewStats(),
    hasUserReviewed,
    createReview,
    updateReview,
    deleteReview,
    approveReview,
    rejectReview,
    loadReviews
  }
}