import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'
import { db } from '@/lib/firebase'
import { collection, doc, setDoc, deleteDoc, getDocs, query, where } from 'firebase/firestore'

export interface FavoriteVendor {
  vendorId: string
  addedAt: Date
}

export function useFavoriteVendors() {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  // Load favorites from Firebase
  useEffect(() => {
    if (!user || !user.id) {
      setFavorites([])
      setLoading(false)
      return
    }

    const loadFavorites = async () => {
      try {
        const favoritesRef = collection(db, 'users', user.id, 'favoriteVendors')
        const snapshot = await getDocs(favoritesRef)
        const favoriteIds = snapshot.docs.map(doc => doc.id)
        setFavorites(favoriteIds)
      } catch (error) {
        console.error('Error loading favorite vendors:', error)
      } finally {
        setLoading(false)
      }
    }

    loadFavorites()
  }, [user])

  // Check if vendor is favorite
  const isFavorite = (vendorId: string): boolean => {
    return favorites.includes(vendorId)
  }

  // Toggle favorite
  const toggleFavorite = async (vendorId: string): Promise<boolean> => {
    if (!user || !user.id) {
      console.warn('User must be logged in to add favorites')
      return false
    }

    try {
      const favoriteRef = doc(db, 'users', user.id, 'favoriteVendors', vendorId)

      if (favorites.includes(vendorId)) {
        // Remove from favorites
        await deleteDoc(favoriteRef)
        setFavorites(prev => prev.filter(id => id !== vendorId))
        return false
      } else {
        // Add to favorites
        await setDoc(favoriteRef, {
          vendorId,
          addedAt: new Date()
        })
        setFavorites(prev => [...prev, vendorId])
        return true
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      return isFavorite(vendorId)
    }
  }

  // Add to favorites
  const addFavorite = async (vendorId: string): Promise<void> => {
    if (!user || !user.id || favorites.includes(vendorId)) return

    try {
      const favoriteRef = doc(db, 'users', user.id, 'favoriteVendors', vendorId)
      await setDoc(favoriteRef, {
        vendorId,
        addedAt: new Date()
      })
      setFavorites(prev => [...prev, vendorId])
    } catch (error) {
      console.error('Error adding favorite:', error)
    }
  }

  // Remove from favorites
  const removeFavorite = async (vendorId: string): Promise<void> => {
    if (!user || !user.id || !favorites.includes(vendorId)) return

    try {
      const favoriteRef = doc(db, 'users', user.id, 'favoriteVendors', vendorId)
      await deleteDoc(favoriteRef)
      setFavorites(prev => prev.filter(id => id !== vendorId))
    } catch (error) {
      console.error('Error removing favorite:', error)
    }
  }

  return {
    favorites,
    loading,
    isFavorite,
    toggleFavorite,
    addFavorite,
    removeFavorite
  }
}