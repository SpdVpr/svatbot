import { useState, useEffect } from 'react'
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  addDoc,
  deleteDoc,
  getDocs
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useMarketplaceAuth } from './useAuth'

interface Favorite {
  id: string
  userId: string
  vendorId: string
  createdAt: any
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useMarketplaceAuth()

  useEffect(() => {
    if (!user) {
      setFavorites([])
      return
    }

    // Real-time listener for user's favorites
    const q = query(
      collection(db, 'favorites'),
      where('userId', '==', user.uid)
    )

    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        const favoriteVendorIds = snapshot.docs.map(doc => doc.data().vendorId)
        setFavorites(favoriteVendorIds)
      },
      (error) => {
        console.error('Error fetching favorites:', error)
        setError(error.message)
      }
    )

    return unsubscribe
  }, [user])

  const toggleFavorite = async (vendorId: string) => {
    if (!user) {
      setError('Authentication required')
      return false
    }

    try {
      setLoading(true)
      setError(null)

      const isFavorited = favorites.includes(vendorId)

      if (isFavorited) {
        // Remove from favorites
        const q = query(
          collection(db, 'favorites'),
          where('userId', '==', user.uid),
          where('vendorId', '==', vendorId)
        )

        const snapshot = await getDocs(q)
        const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref))
        await Promise.all(deletePromises)
      } else {
        // Add to favorites
        await addDoc(collection(db, 'favorites'), {
          userId: user.uid,
          vendorId,
          createdAt: new Date()
        })
      }

      return true
    } catch (err: any) {
      setError(err.message)
      return false
    } finally {
      setLoading(false)
    }
  }

  const isFavorited = (vendorId: string) => {
    return favorites.includes(vendorId)
  }

  return {
    favorites,
    loading,
    error,
    toggleFavorite,
    isFavorited
  }
}
