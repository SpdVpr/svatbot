import { useState, useEffect } from 'react'
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  addDoc,
  doc,
  getDoc,
  getDocs,
  DocumentSnapshot
} from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'
import { db } from '../lib/firebase'
import { useMarketplaceAuth } from './useAuth'

interface VendorFilters {
  category?: string
  city?: string
  region?: string
  minPrice?: number
  maxPrice?: number
  verified?: boolean
  featured?: boolean
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

interface Vendor {
  id: string
  name: string
  category: string
  description: string
  shortDescription: string
  verified: boolean
  featured: boolean
  rating: {
    overall: number
    count: number
  }
  priceRange?: {
    min: number
    max: number
    currency: string
  }
  address: {
    city: string
    region: string
  }
  images: string[]
  isFavorited?: boolean
}

export function useVendors(filters: VendorFilters = {}, realTime = false) {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null)
  const { user } = useMarketplaceAuth()

  // Using Callable Function (recommended for complex queries) - disabled for now
  // const getVendorsCallable = httpsCallable(functions, 'getVendors')

  const loadVendors = async (page = 1, append = false) => {
    try {
      setLoading(true)
      setError(null)

      // Use direct Firestore query instead of callable function
      let q = query(
        collection(db, 'vendors'),
        where('active', '==', true),
        orderBy('createdAt', 'desc'),
        limit(20)
      )

      // Apply filters
      if (filters.category) {
        q = query(q, where('category', '==', filters.category))
      }
      if (filters.verified !== undefined) {
        q = query(q, where('verified', '==', filters.verified))
      }
      if (filters.featured !== undefined) {
        q = query(q, where('featured', '==', filters.featured))
      }

      const snapshot = await getDocs(q)
      const newVendors = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Vendor[]

      if (append) {
        setVendors(prev => [...prev, ...newVendors])
      } else {
        setVendors(newVendors)
      }

      setHasMore(newVendors.length === 20)
    } catch (err: any) {
      setError(err.message || 'Failed to load vendors')
    } finally {
      setLoading(false)
    }
  }

  // Real-time Firestore listener (for live updates)
  const setupRealTimeListener = () => {
    let q = query(
      collection(db, 'vendors'),
      where('active', '==', true),
      orderBy('createdAt', 'desc'),
      limit(20)
    )

    // Apply filters
    if (filters.category) {
      q = query(q, where('category', '==', filters.category))
    }
    if (filters.verified !== undefined) {
      q = query(q, where('verified', '==', filters.verified))
    }
    if (filters.featured !== undefined) {
      q = query(q, where('featured', '==', filters.featured))
    }

    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        const vendorData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Vendor[]

        setVendors(vendorData)
        setLoading(false)
      },
      (error) => {
        setError(error.message)
        setLoading(false)
      }
    )

    return unsubscribe
  }

  useEffect(() => {
    if (realTime) {
      const unsubscribe = setupRealTimeListener()
      return unsubscribe
    } else {
      loadVendors()
    }
  }, [filters, realTime])

  const loadMore = () => {
    if (hasMore && !loading) {
      const nextPage = Math.floor(vendors.length / 20) + 1
      loadVendors(nextPage, true)
    }
  }

  const refresh = () => {
    setLastDoc(null)
    loadVendors()
  }

  return {
    vendors,
    loading,
    error,
    hasMore,
    loadMore,
    refresh
  }
}

// Hook for single vendor with real-time updates
export function useVendor(vendorId: string) {
  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!vendorId) return

    const vendorRef = doc(db, 'vendors', vendorId)

    const unsubscribe = onSnapshot(vendorRef,
      (doc) => {
        if (doc.exists()) {
          setVendor({ id: doc.id, ...doc.data() } as Vendor)
        } else {
          setError('Vendor not found')
        }
        setLoading(false)
      },
      (error) => {
        setError(error.message)
        setLoading(false)
      }
    )

    return unsubscribe
  }, [vendorId])

  return { vendor, loading, error }
}

// Hook for vendor creation
export function useCreateVendor() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createVendor = async (vendorData: any) => {
    try {
      setLoading(true)
      setError(null)

      // Direct Firestore creation instead of callable function
      const vendorRef = await addDoc(collection(db, 'vendors'), {
        ...vendorData,
        active: true,
        verified: false,
        featured: false,
        createdAt: new Date(),
        updatedAt: new Date()
      })

      return { id: vendorRef.id, ...vendorData }
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { createVendor, loading, error }
}
