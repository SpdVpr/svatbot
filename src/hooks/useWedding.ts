'use client'

import { useState, useEffect } from 'react'
import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  query,
  where,
  getDocs,
  onSnapshot,
  Timestamp
} from 'firebase/firestore'
import { db } from '@/config/firebase'
import { useWeddingStore } from '@/stores/weddingStore'
import { useAuthStore } from '@/stores/authStore'
import { Wedding, OnboardingData, WeddingProgress } from '@/types'

export function useWedding() {
  const { user } = useAuthStore()
  const { currentWedding, setCurrentWedding, setLoading } = useWeddingStore()
  const [error, setError] = useState<string | null>(null)

  // Convert Firestore data to Wedding type
  const convertFirestoreWedding = (id: string, data: any): Wedding => {
    return {
      id,
      userId: data.userId,
      brideName: data.brideName,
      groomName: data.groomName,
      weddingDate: data.weddingDate?.toDate() || null,
      estimatedGuestCount: data.estimatedGuestCount,
      budget: data.budget,
      style: data.style,
      region: data.region,
      venue: data.venue,
      status: data.status || 'planning',
      progress: data.progress || {
        overall: 0,
        foundation: 0,
        venue: 0,
        guests: 0,
        budget: 0,
        design: 0,
        organization: 0,
        final: 0
      },
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date()
    }
  }

  // Convert Wedding to Firestore data
  const convertToFirestoreData = (wedding: Partial<Wedding>) => {
    const data: any = { ...wedding }

    // Convert dates to Firestore Timestamps
    if (data.weddingDate) {
      data.weddingDate = Timestamp.fromDate(data.weddingDate)
    }
    if (data.createdAt) {
      data.createdAt = Timestamp.fromDate(data.createdAt)
    }
    if (data.updatedAt) {
      data.updatedAt = Timestamp.fromDate(data.updatedAt)
    }

    return data
  }

  // Create wedding from onboarding data
  const createWedding = async (onboardingData: OnboardingData): Promise<Wedding> => {
    if (!user) {
      throw new Error('Uživatel není přihlášen')
    }

    try {
      setError(null)
      setLoading(true)

      const weddingId = `wedding_${user.id}_${Date.now()}`

      const weddingData: Omit<Wedding, 'id'> = {
        userId: user.id,
        brideName: onboardingData.brideName,
        groomName: onboardingData.groomName,
        weddingDate: onboardingData.weddingDate || null,
        estimatedGuestCount: onboardingData.estimatedGuestCount,
        budget: onboardingData.budget,
        style: onboardingData.style,
        region: onboardingData.region,
        status: 'planning',
        progress: {
          overall: 15,
          foundation: 100, // Completed onboarding
          venue: 0,
          guests: 0,
          budget: 0,
          design: 0,
          organization: 0,
          final: 0
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const wedding: Wedding = { id: weddingId, ...weddingData }

      try {
        // Try to save to Firestore
        const weddingRef = doc(db, 'weddings', weddingId)
        await setDoc(weddingRef, convertToFirestoreData(weddingData))
        console.log('Wedding saved to Firestore successfully')
      } catch (firestoreError) {
        console.warn('Firestore not available, using local storage fallback:', firestoreError)
        // Save to localStorage as fallback
        localStorage.setItem(`wedding_${user.id}`, JSON.stringify(wedding))
      }

      setCurrentWedding(wedding)
      return wedding
    } catch (error: any) {
      console.error('Error creating wedding:', error)
      setError('Chyba při vytváření svatby')
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Update wedding
  const updateWedding = async (updates: Partial<Wedding>): Promise<void> => {
    if (!currentWedding || !user) {
      throw new Error('Žádná svatba nebo uživatel není vybrán')
    }

    try {
      setError(null)

      const updatedData = {
        ...updates,
        updatedAt: new Date()
      }

      console.log('🔄 Updating wedding with data:', updatedData)

      try {
        // Try to update in Firestore
        const weddingRef = doc(db, 'weddings', currentWedding.id)
        await updateDoc(weddingRef, convertToFirestoreData(updatedData))
        console.log('✅ Wedding updated in Firestore')
      } catch (firestoreError) {
        console.warn('⚠️ Firestore not available, using localStorage fallback')
        // Update in localStorage as fallback
        const updatedWedding = { ...currentWedding, ...updatedData }
        localStorage.setItem(`wedding_${user.id}`, JSON.stringify(updatedWedding))
        console.log('📦 Wedding updated in localStorage')
      }

      // Update local state
      const updatedWedding = { ...currentWedding, ...updatedData }
      setCurrentWedding(updatedWedding)
      console.log('🎯 Local state updated:', updatedWedding)
    } catch (error: any) {
      console.error('Error updating wedding:', error)
      setError('Chyba při aktualizaci svatby')
      throw error
    }
  }

  // Update wedding progress
  const updateProgress = async (progressUpdates: Partial<WeddingProgress>): Promise<void> => {
    if (!currentWedding) return

    try {
      const newProgress = {
        ...currentWedding.progress,
        ...progressUpdates
      }

      // Calculate overall progress
      const phases = [
        newProgress.foundation,
        newProgress.venue,
        newProgress.guests,
        newProgress.budget,
        newProgress.design,
        newProgress.organization,
        newProgress.final
      ]

      newProgress.overall = Math.round(
        phases.reduce((sum, phase) => sum + phase, 0) / phases.length
      )

      await updateWedding({ progress: newProgress })
    } catch (error: any) {
      console.error('Error updating progress:', error)
      setError('Chyba při aktualizaci pokroku')
    }
  }

  // Load user's wedding
  const loadUserWedding = async (): Promise<void> => {
    if (!user) return

    try {
      setError(null)
      setLoading(true)

      try {
        // Try to load from Firestore
        const weddingsQuery = query(
          collection(db, 'weddings'),
          where('userId', '==', user.id)
        )

        const querySnapshot = await getDocs(weddingsQuery)

        if (!querySnapshot.empty) {
          const weddingDoc = querySnapshot.docs[0]
          const wedding = convertFirestoreWedding(weddingDoc.id, weddingDoc.data())
          setCurrentWedding(wedding)
        } else {
          setCurrentWedding(null)
        }
      } catch (firestoreError) {
        console.warn('⚠️ Firestore not available, checking localStorage fallback')

        // Try to load from localStorage
        const savedWedding = localStorage.getItem(`wedding_${user.id}`)
        if (savedWedding) {
          const wedding = JSON.parse(savedWedding)
          // Convert date strings back to Date objects
          if (wedding.weddingDate) {
            wedding.weddingDate = new Date(wedding.weddingDate)
          }
          wedding.createdAt = new Date(wedding.createdAt)
          wedding.updatedAt = new Date(wedding.updatedAt)
          setCurrentWedding(wedding)
        } else {
          setCurrentWedding(null)
        }
      }
    } catch (error: any) {
      console.error('Error loading wedding:', error)
      setError('Chyba při načítání svatby')
    } finally {
      setLoading(false)
    }
  }

  // Real-time wedding updates (only if Firestore is available)
  useEffect(() => {
    if (!user || !currentWedding) return

    try {
      const weddingRef = doc(db, 'weddings', currentWedding.id)

      const unsubscribe = onSnapshot(weddingRef, (doc) => {
        if (doc.exists()) {
          const wedding = convertFirestoreWedding(doc.id, doc.data())
          setCurrentWedding(wedding)
        }
      }, (error) => {
        console.warn('Wedding snapshot error (Firestore not available):', error)
      })

      return () => unsubscribe()
    } catch (error) {
      console.warn('Real-time updates not available (Firestore not configured)')
      return () => {} // Return empty cleanup function
    }
  }, [user, currentWedding?.id, setCurrentWedding])

  // Load wedding when user changes
  useEffect(() => {
    if (user && !currentWedding) {
      loadUserWedding()
    } else if (!user) {
      setCurrentWedding(null)
    }
  }, [user])

  // Clear error
  const clearError = () => setError(null)

  return {
    wedding: currentWedding,
    error,
    createWedding,
    updateWedding,
    updateProgress,
    loadUserWedding,
    clearError
  }
}
