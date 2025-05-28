import { useState, useEffect } from 'react'
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useMarketplaceAuth } from './useAuth'

interface Wedding {
  id: string
  userId: string
  brideName: string
  groomName: string
  weddingDate: Date
  venue?: string
  guestCount?: number
  budget?: number
  createdAt: Date
  updatedAt: Date
}

export function useWedding() {
  const [wedding, setWedding] = useState<Wedding | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useMarketplaceAuth()

  useEffect(() => {
    if (!user) {
      setWedding(null)
      setLoading(false)
      return
    }

    // Real-time listener for user's wedding
    const weddingRef = doc(db, 'weddings', user.uid)

    const unsubscribe = onSnapshot(weddingRef,
      (doc) => {
        if (doc.exists()) {
          const data = doc.data()
          setWedding({
            id: doc.id,
            ...data,
            weddingDate: data.weddingDate?.toDate(),
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate()
          } as Wedding)
        } else {
          setWedding(null)
        }
        setLoading(false)
      },
      (error) => {
        console.error('Error fetching wedding:', error)
        setError(error.message)
        setLoading(false)
      }
    )

    return unsubscribe
  }, [user])

  const createWedding = async (weddingData: Partial<Wedding>) => {
    if (!user) {
      throw new Error('User must be authenticated')
    }

    try {
      setLoading(true)
      setError(null)

      const newWedding = {
        userId: user.uid,
        brideName: weddingData.brideName || '',
        groomName: weddingData.groomName || '',
        weddingDate: weddingData.weddingDate || new Date(),
        venue: weddingData.venue || '',
        guestCount: weddingData.guestCount || 0,
        budget: weddingData.budget || 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      await setDoc(doc(db, 'weddings', user.uid), newWedding)

      return true
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateWedding = async (updates: Partial<Wedding>) => {
    if (!user || !wedding) {
      throw new Error('Wedding not found')
    }

    try {
      setLoading(true)
      setError(null)

      const updatedData = {
        ...updates,
        updatedAt: new Date()
      }

      await updateDoc(doc(db, 'weddings', user.uid), updatedData)

      return true
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    wedding,
    loading,
    error,
    createWedding,
    updateWedding,
    hasWedding: !!wedding
  }
}
