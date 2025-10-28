'use client'

import { useState, useEffect, useRef } from 'react'
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
import logger from '@/lib/logger'

export function useWedding() {
  const { user } = useAuthStore()
  const { currentWedding, setCurrentWedding, setLoading } = useWeddingStore()
  const [error, setError] = useState<string | null>(null)
  const loadingRef = useRef(false)

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
        logger.log('Wedding saved to Firestore successfully')
      } catch (firestoreError) {
        logger.warn('Firestore not available, using local storage fallback:', firestoreError)
        // Save to localStorage as fallback
        localStorage.setItem(`wedding_${user.id}`, JSON.stringify(wedding))
      }

      setCurrentWedding(wedding)
      return wedding
    } catch (error: any) {
      logger.error('Error creating wedding:', error)
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

      logger.log('🔄 Updating wedding with data:', updatedData)

      try {
        // Try to update in Firestore
        const weddingRef = doc(db, 'weddings', currentWedding.id)
        await updateDoc(weddingRef, convertToFirestoreData(updatedData))
        logger.log('✅ Wedding updated in Firestore')
      } catch (firestoreError) {
        logger.warn('⚠️ Firestore not available, using localStorage fallback')
        // Update in localStorage as fallback
        const updatedWedding = { ...currentWedding, ...updatedData }
        localStorage.setItem(`wedding_${user.id}`, JSON.stringify(updatedWedding))
        logger.log('📦 Wedding updated in localStorage')
      }

      // Update local state
      const updatedWedding = { ...currentWedding, ...updatedData }
      setCurrentWedding(updatedWedding)
      logger.log('🎯 Local state updated:', updatedWedding)
    } catch (error: any) {
      logger.error('Error updating wedding:', error)
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
      logger.error('Error updating progress:', error)
      setError('Chyba při aktualizaci pokroku')
    }
  }

  // Load user's wedding
  const loadUserWedding = async (): Promise<void> => {
    if (!user || loadingRef.current) return

    loadingRef.current = true

    try {
      setError(null)
      setLoading(true)

      // Load wedding from Firestore for all users (including demo)
      try {
        // For demo user, load the most recent wedding
        if (user.email === 'demo@svatbot.cz') {
          const weddingsQuery = query(
            collection(db, 'weddings'),
            where('userId', '==', user.id)
          )
          const querySnapshot = await getDocs(weddingsQuery)

          if (!querySnapshot.empty) {
            // Get the most recent wedding (last one created)
            const weddingDoc = querySnapshot.docs[querySnapshot.docs.length - 1]
            const wedding = convertFirestoreWedding(weddingDoc.id, weddingDoc.data())
            logger.log('✅ Demo wedding loaded from Firestore:', wedding)
            setCurrentWedding(wedding)
          } else {
            logger.error('❌ No demo wedding found in Firestore')
            setCurrentWedding(null)
          }
        } else {
          // For regular users, query by userId
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
        }
      } catch (firestoreError) {
        logger.error('❌ Error loading wedding from Firestore:', firestoreError)
        logger.warn('⚠️ Firestore not available, checking localStorage fallback')

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
      logger.error('Error loading wedding:', error)
      setError('Chyba při načítání svatby')
    } finally {
      setLoading(false)
      loadingRef.current = false
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

          // Only update if data actually changed (check updatedAt timestamp)
          const shouldUpdate = !currentWedding.updatedAt ||
            (wedding.updatedAt instanceof Date &&
             currentWedding.updatedAt instanceof Date &&
             wedding.updatedAt.getTime() !== currentWedding.updatedAt.getTime())

          if (shouldUpdate) {
            logger.log('📡 Wedding updated from Firestore snapshot')
            setCurrentWedding(wedding)
          }
        }
      }, (error) => {
        logger.warn('Wedding snapshot error (Firestore not available):', error)
      })

      return () => unsubscribe()
    } catch (error) {
      logger.warn('Real-time updates not available (Firestore not configured)')
      return () => {} // Return empty cleanup function
    }
  }, [user, currentWedding?.id])

  // Load wedding when user changes
  useEffect(() => {
    if (user && !currentWedding && !loadingRef.current) {
      loadUserWedding()
    } else if (!user) {
      setCurrentWedding(null)
      loadingRef.current = false
    }
  }, [user, currentWedding])

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
