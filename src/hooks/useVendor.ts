'use client'

import { useState, useEffect } from 'react'
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  Timestamp
} from 'firebase/firestore'
import { db } from '@/config/firebase'
import { useAuth } from './useAuth'
import { useWedding } from './useWedding'
import {
  Vendor,
  VendorFormData,
  VendorFilters,
  VendorStats,
  VendorCategory,
  VendorStatus,
  Contract,
  VendorMessage
} from '@/types/vendor'

interface UseVendorReturn {
  vendors: Vendor[]
  contracts: Contract[]
  messages: VendorMessage[]
  loading: boolean
  error: string | null
  stats: VendorStats
  createVendor: (data: VendorFormData) => Promise<Vendor>
  updateVendor: (vendorId: string, updates: Partial<Vendor>) => Promise<void>
  deleteVendor: (vendorId: string) => Promise<void>
  getFilteredVendors: (filters: VendorFilters) => Vendor[]
  getVendorsByCategory: (category: VendorCategory) => Vendor[]
  getVendorsByStatus: (status: VendorStatus) => Vendor[]
  clearError: () => void
}

export function useVendor(): UseVendorReturn {
  const { user } = useAuth()
  const { wedding } = useWedding()
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [contracts, setContracts] = useState<Contract[]>([])
  const [messages, setMessages] = useState<VendorMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Convert Firestore data to Vendor
  const convertFirestoreVendor = (id: string, data: any): Vendor => {
    return {
      id,
      weddingId: data.weddingId,
      name: data.name,
      category: data.category,
      description: data.description,
      website: data.website,
      contacts: data.contacts || [],
      address: data.address,
      businessName: data.businessName,
      businessId: data.businessId,
      vatNumber: data.vatNumber,
      services: data.services || [],
      priceRange: data.priceRange,
      availability: data.availability,
      status: data.status || 'potential',
      priority: (data.priority === 'none' || data.priority === null) ? undefined : data.priority,
      rating: data.rating,
      contractId: data.contractId,
      lastContactDate: data.lastContactDate?.toDate(),
      nextFollowUpDate: data.nextFollowUpDate?.toDate(),
      notes: data.notes,
      tags: data.tags || [],
      portfolio: data.portfolio || [],
      testimonials: data.testimonials || [],
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      createdBy: data.createdBy
    }
  }

  // Helper function to remove undefined values from object
  const removeUndefined = (obj: any): any => {
    if (obj === null || obj === undefined) {
      return null
    }

    // Handle arrays
    if (Array.isArray(obj)) {
      return obj.map(item => removeUndefined(item)).filter(item => item !== undefined)
    }

    // Handle Timestamp and other special objects
    if (obj instanceof Timestamp || obj instanceof Date) {
      return obj
    }

    // Handle plain objects
    if (typeof obj === 'object') {
      const cleaned: any = {}
      Object.keys(obj).forEach(key => {
        const value = obj[key]
        if (value !== undefined) {
          const cleanedValue = removeUndefined(value)
          if (cleanedValue !== undefined) {
            cleaned[key] = cleanedValue
          }
        }
      })
      return cleaned
    }

    // Return primitive values as-is
    return obj
  }

  // Convert Vendor to Firestore data
  const convertToFirestoreData = (vendor: Omit<Vendor, 'id'>): any => {
    const data = {
      weddingId: vendor.weddingId,
      name: vendor.name,
      category: vendor.category,
      description: vendor.description || null,
      website: vendor.website || null,
      contacts: vendor.contacts || [],
      address: vendor.address || null,
      businessName: vendor.businessName || null,
      businessId: vendor.businessId || null,
      vatNumber: vendor.vatNumber || null,
      services: vendor.services || [],
      priceRange: vendor.priceRange || null,
      availability: vendor.availability || null,
      status: vendor.status,
      priority: vendor.priority || null,
      rating: vendor.rating || null,
      contractId: vendor.contractId || null,
      lastContactDate: vendor.lastContactDate ? Timestamp.fromDate(vendor.lastContactDate) : null,
      nextFollowUpDate: vendor.nextFollowUpDate ? Timestamp.fromDate(vendor.nextFollowUpDate) : null,
      notes: vendor.notes || null,
      tags: vendor.tags || [],
      portfolio: vendor.portfolio || [],
      testimonials: vendor.testimonials || [],
      createdAt: Timestamp.fromDate(vendor.createdAt),
      updatedAt: Timestamp.fromDate(vendor.updatedAt),
      createdBy: vendor.createdBy
    }

    // Remove any undefined values that might have slipped through
    return removeUndefined(data)
  }

  // Convert partial Vendor updates to Firestore data
  const convertPartialToFirestoreData = (updates: Partial<Vendor>): any => {
    const data: any = {}

    // Only include fields that are present in updates
    if (updates.name !== undefined) data.name = updates.name
    if (updates.category !== undefined) data.category = updates.category
    if (updates.description !== undefined) data.description = updates.description || null
    if (updates.website !== undefined) data.website = updates.website || null
    if (updates.contacts !== undefined) data.contacts = updates.contacts || []
    if (updates.address !== undefined) data.address = updates.address || null
    if (updates.businessName !== undefined) data.businessName = updates.businessName || null
    if (updates.businessId !== undefined) data.businessId = updates.businessId || null
    if (updates.vatNumber !== undefined) data.vatNumber = updates.vatNumber || null
    if (updates.services !== undefined) data.services = updates.services || []
    if (updates.priceRange !== undefined) data.priceRange = updates.priceRange || null
    if (updates.availability !== undefined) data.availability = updates.availability || null
    if (updates.status !== undefined) data.status = updates.status
    // Priority: check if key exists in updates object (not just if value is undefined)
    if ('priority' in updates) {
      data.priority = updates.priority || null
      console.log('🔧 Priority update:', { original: updates.priority, converted: data.priority })
    }
    if (updates.rating !== undefined) data.rating = updates.rating || null
    if (updates.contractId !== undefined) data.contractId = updates.contractId || null
    if (updates.lastContactDate !== undefined) {
      data.lastContactDate = updates.lastContactDate ? Timestamp.fromDate(updates.lastContactDate) : null
    }
    if (updates.nextFollowUpDate !== undefined) {
      data.nextFollowUpDate = updates.nextFollowUpDate ? Timestamp.fromDate(updates.nextFollowUpDate) : null
    }
    if (updates.notes !== undefined) data.notes = updates.notes || null
    if (updates.tags !== undefined) data.tags = updates.tags || []
    if (updates.portfolio !== undefined) data.portfolio = updates.portfolio || []
    if (updates.testimonials !== undefined) data.testimonials = updates.testimonials || []
    if (updates.updatedAt !== undefined) data.updatedAt = Timestamp.fromDate(updates.updatedAt)

    console.log('📦 Firestore data before removeUndefined:', data)
    // Remove any undefined values that might have slipped through
    const cleaned = removeUndefined(data)
    console.log('📦 Firestore data after removeUndefined:', cleaned)
    return cleaned
  }

  // Create new vendor
  const createVendor = async (data: VendorFormData): Promise<Vendor> => {
    if (!wedding || !user) {
      throw new Error('Žádná svatba nebo uživatel není vybrán')
    }

    try {
      setError(null)
      setLoading(true)

      // Calculate price range from services (use discountedPrice if available)
      const servicePrices = data.services
        .filter(service => {
          const price = service.discountedPrice || service.price
          return price && price > 0
        })
        .map(service => service.discountedPrice || service.price!)

      const priceRange = servicePrices.length > 0 ? {
        min: Math.min(...servicePrices),
        max: Math.max(...servicePrices),
        currency: 'CZK'
      } : undefined

      const vendorData: Omit<Vendor, 'id'> = {
        weddingId: wedding.id,
        name: data.name,
        category: data.category,
        description: data.description,
        website: data.website,
        contacts: [{
          name: data.contactName,
          email: data.contactEmail,
          phone: data.contactPhone,
          isPrimary: true
        }],
        address: data.address ? {
          ...data.address,
          country: 'Česká republika'
        } : undefined,
        businessName: data.businessName,
        services: data.services.map(service => ({
          id: `service_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: service.name,
          description: service.description,
          price: service.price,
          discountedPrice: service.discountedPrice,
          priceType: service.priceType,
          included: [],
          duration: undefined
        })),
        priceRange,
        status: data.status,
        priority: data.priority,
        notes: data.notes,
        tags: data.tags,
        portfolio: [],
        testimonials: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: user.id
      }

      try {
        // Try to save to Firestore
        const firestoreData = convertToFirestoreData(vendorData)
        console.log('📝 Attempting to save vendor to Firestore:', firestoreData)
        console.log('📝 Firestore data as JSON:', JSON.stringify(firestoreData, null, 2))

        // Check for undefined values
        const checkForUndefined = (obj: any, path = ''): string[] => {
          const issues: string[] = []
          if (obj === undefined) {
            issues.push(path || 'root')
            return issues
          }
          if (Array.isArray(obj)) {
            obj.forEach((item, index) => {
              issues.push(...checkForUndefined(item, `${path}[${index}]`))
            })
          } else if (obj && typeof obj === 'object' && !(obj instanceof Timestamp) && !(obj instanceof Date)) {
            Object.keys(obj).forEach(key => {
              issues.push(...checkForUndefined(obj[key], path ? `${path}.${key}` : key))
            })
          }
          return issues
        }

        const undefinedPaths = checkForUndefined(firestoreData)
        if (undefinedPaths.length > 0) {
          console.error('❌ Found undefined values at paths:', undefinedPaths)
          throw new Error(`Data contains undefined values at: ${undefinedPaths.join(', ')}`)
        }

        const docRef = await addDoc(collection(db, 'vendors'), firestoreData)
        const newVendor: Vendor = { id: docRef.id, ...vendorData }

        console.log('✅ Vendor created in Firestore:', newVendor)

        // Update local state immediately
        setVendors(prev => {
          const updated = [...prev, newVendor]
          console.log('🏢 Updated local vendors state:', updated.length, updated)
          return updated
        })

        // Also save to localStorage for offline access
        const savedVendors = localStorage.getItem(`vendors_${wedding.id}`) || '[]'
        const existingVendors = JSON.parse(savedVendors)
        existingVendors.push(newVendor)
        localStorage.setItem(`vendors_${wedding.id}`, JSON.stringify(existingVendors))

        return newVendor
      } catch (firestoreError: any) {
        console.error('❌ Firestore error details:', firestoreError)
        console.error('Error code:', firestoreError.code)
        console.error('Error message:', firestoreError.message)
        console.warn('⚠️ Firestore not available, using localStorage fallback')

        // Create vendor with local ID
        const localId = `vendor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const newVendor: Vendor = { id: localId, ...vendorData }

        // Save to localStorage
        const savedVendors = localStorage.getItem(`vendors_${wedding.id}`) || '[]'
        const existingVendors = JSON.parse(savedVendors)
        existingVendors.push(newVendor)
        localStorage.setItem(`vendors_${wedding.id}`, JSON.stringify(existingVendors))

        // Update local state
        setVendors(prev => [...prev, newVendor])

        return newVendor
      }
    } catch (error: any) {
      console.error('Error creating vendor:', error)
      setError('Chyba při vytváření dodavatele')
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Update vendor
  const updateVendor = async (vendorId: string, updates: Partial<Vendor>): Promise<void> => {
    try {
      setError(null)

      // Calculate price range if services are being updated (use discountedPrice if available)
      let priceRange = updates.priceRange
      if (updates.services) {
        const servicePrices = updates.services
          .filter(service => {
            const price = service.discountedPrice || service.price
            return price && price > 0
          })
          .map(service => service.discountedPrice || service.price!)

        priceRange = servicePrices.length > 0 ? {
          min: Math.min(...servicePrices),
          max: Math.max(...servicePrices),
          currency: 'CZK'
        } : undefined
      }

      const updatedData = {
        ...updates,
        priceRange,
        updatedAt: new Date()
      }

      try {
        // Try to update in Firestore
        const vendorRef = doc(db, 'vendors', vendorId)
        const firestoreData = convertPartialToFirestoreData(updatedData)
        console.log('📝 Updating vendor in Firestore:', vendorId, firestoreData)
        await updateDoc(vendorRef, firestoreData)
        console.log('✅ Vendor updated successfully in Firestore')
      } catch (firestoreError) {
        console.error('❌ Firestore update error:', firestoreError)
        console.warn('⚠️ Firestore not available, updating localStorage fallback')
        if (wedding) {
          const savedVendors = localStorage.getItem(`vendors_${wedding.id}`) || '[]'
          const existingVendors = JSON.parse(savedVendors)
          const vendorIndex = existingVendors.findIndex((v: Vendor) => v.id === vendorId)
          if (vendorIndex !== -1) {
            existingVendors[vendorIndex] = { ...existingVendors[vendorIndex], ...updatedData }
            localStorage.setItem(`vendors_${wedding.id}`, JSON.stringify(existingVendors))
          }
        }
      }

      // Update local state
      setVendors(prev => prev.map(vendor =>
        vendor.id === vendorId ? { ...vendor, ...updatedData } : vendor
      ))
    } catch (error: any) {
      console.error('Error updating vendor:', error)
      setError('Chyba při aktualizaci dodavatele')
      throw error
    }
  }

  // Delete vendor
  const deleteVendor = async (vendorId: string): Promise<void> => {
    try {
      setError(null)

      try {
        // Try to delete from Firestore
        await deleteDoc(doc(db, 'vendors', vendorId))
      } catch (firestoreError) {
        console.warn('⚠️ Firestore not available, deleting from localStorage fallback')
        if (wedding) {
          const savedVendors = localStorage.getItem(`vendors_${wedding.id}`) || '[]'
          const existingVendors = JSON.parse(savedVendors)
          const filteredVendors = existingVendors.filter((v: Vendor) => v.id !== vendorId)
          localStorage.setItem(`vendors_${wedding.id}`, JSON.stringify(filteredVendors))
        }
      }

      // Update local state
      setVendors(prev => prev.filter(vendor => vendor.id !== vendorId))
    } catch (error: any) {
      console.error('Error deleting vendor:', error)
      setError('Chyba při mazání dodavatele')
      throw error
    }
  }

  // Filter vendors
  const getFilteredVendors = (filters: VendorFilters): Vendor[] => {
    return vendors.filter(vendor => {
      if (filters.search && !vendor.name.toLowerCase().includes(filters.search.toLowerCase())) return false
      if (filters.category && !filters.category.includes(vendor.category)) return false
      if (filters.status && !filters.status.includes(vendor.status)) return false
      if (filters.priority && vendor.priority && !filters.priority.includes(vendor.priority)) return false
      if (filters.hasContract !== undefined && (!!vendor.contractId) !== filters.hasContract) return false
      if (filters.showCompleted === false && vendor.status === 'completed') return false
      return true
    })
  }

  // Get vendors by category
  const getVendorsByCategory = (category: VendorCategory): Vendor[] => {
    return vendors.filter(vendor => vendor.category === category)
  }

  // Get vendors by status
  const getVendorsByStatus = (status: VendorStatus): Vendor[] => {
    return vendors.filter(vendor => vendor.status === status)
  }

  // Calculate vendor statistics
  const stats: VendorStats = {
    totalVendors: vendors.length,
    byCategory: vendors.reduce((acc, vendor) => {
      acc[vendor.category] = (acc[vendor.category] || 0) + 1
      return acc
    }, {} as Record<VendorCategory, number>),
    byStatus: vendors.reduce((acc, vendor) => {
      acc[vendor.status] = (acc[vendor.status] || 0) + 1
      return acc
    }, {} as Record<VendorStatus, number>),

    // Contract stats - using vendor services as proxy for contracts
    totalContracts: vendors.filter(v => v.status === 'contracted' || v.status === 'booked').length,
    signedContracts: vendors.filter(v => v.status === 'contracted').length,

    // Calculate total value from vendor services (not actual contracts yet)
    totalContractValue: vendors.reduce((sum, vendor) => {
      if (vendor.status === 'contracted' || vendor.status === 'booked') {
        // Use priceRange max or sum of service prices
        if (vendor.priceRange) {
          return sum + vendor.priceRange.max
        } else {
          const serviceTotal = vendor.services.reduce((serviceSum, service) => {
            return serviceSum + (service.price || 0)
          }, 0)
          return sum + serviceTotal
        }
      }
      return sum
    }, 0),

    // For now, assume 30% is paid upfront for contracted vendors
    paidAmount: vendors.reduce((sum, vendor) => {
      if (vendor.status === 'contracted') {
        const vendorValue = vendor.priceRange ? vendor.priceRange.max :
          vendor.services.reduce((serviceSum, service) => serviceSum + (service.price || 0), 0)
        return sum + (vendorValue * 0.3) // 30% upfront payment
      }
      return sum
    }, 0),

    // Pending amount is remaining 70% for contracted vendors
    pendingAmount: vendors.reduce((sum, vendor) => {
      if (vendor.status === 'contracted') {
        const vendorValue = vendor.priceRange ? vendor.priceRange.max :
          vendor.services.reduce((serviceSum, service) => serviceSum + (service.price || 0), 0)
        return sum + (vendorValue * 0.7) // 70% remaining
      }
      return sum
    }, 0),

    totalMessages: messages.length,
    unreadMessages: messages.filter(m => m.status === 'delivered').length,
    upcomingMeetings: messages.filter(m =>
      m.type === 'meeting' &&
      m.meetingDetails &&
      m.meetingDetails.date > new Date()
    ).length,
    overdueFollowUps: vendors.filter(v =>
      v.nextFollowUpDate && v.nextFollowUpDate < new Date()
    ).length,
    averageRating: vendors.filter(v => v.rating).reduce((sum, v) => sum + (v.rating?.overall || 0), 0) /
                   Math.max(vendors.filter(v => v.rating).length, 1),
    topRatedVendors: vendors
      .filter(v => v.rating && v.rating.overall >= 4)
      .sort((a, b) => (b.rating?.overall || 0) - (a.rating?.overall || 0))
      .slice(0, 5)
      .map(v => v.id),
    completionRate: vendors.length > 0 ?
      Math.round((vendors.filter(v => v.status === 'booked' || v.status === 'contracted' || v.status === 'completed').length / vendors.length) * 100) : 0,
    onBudget: true, // TODO: Calculate based on budget vs actual costs
    onSchedule: true // TODO: Calculate based on timeline
  }

  // Debug logging for stats
  console.log('📊 Vendor stats calculated:', {
    totalVendors: stats.totalVendors,
    totalContractValue: stats.totalContractValue,
    contractedVendors: stats.byStatus.contracted || 0,
    bookedVendors: stats.byStatus.booked || 0,
    vendorsWithPrices: vendors.filter(v => v.priceRange || v.services.some(s => s.price)).length
  })

  // Load vendors when wedding changes
  useEffect(() => {
    if (!wedding) {
      console.log('🏢 No wedding, clearing vendors')
      setVendors([])
      return
    }

    console.log('🏢 Loading vendors for wedding:', wedding.id)

    const loadVendors = async () => {
      try {
        setLoading(true)
        setError(null)

        // Always try localStorage first for immediate loading
        const savedVendors = localStorage.getItem(`vendors_${wedding.id}`)
        if (savedVendors) {
          try {
            const parsedVendors = JSON.parse(savedVendors).map((vendor: any) => ({
              ...vendor,
              lastContactDate: vendor.lastContactDate ? new Date(vendor.lastContactDate) : undefined,
              nextFollowUpDate: vendor.nextFollowUpDate ? new Date(vendor.nextFollowUpDate) : undefined,
              createdAt: new Date(vendor.createdAt),
              updatedAt: new Date(vendor.updatedAt)
            }))
            console.log('📦 Loaded vendors from localStorage immediately:', parsedVendors.length, parsedVendors)
            setVendors(parsedVendors)
          } catch (parseError) {
            console.error('Error parsing localStorage vendors:', parseError)
            localStorage.removeItem(`vendors_${wedding.id}`)
          }
        } else {
          console.log('📦 No vendors in localStorage for wedding:', wedding.id)
        }

        try {
          // Then try to load from Firestore for real-time updates
          const vendorsQuery = query(
            collection(db, 'vendors'),
            where('weddingId', '==', wedding.id)
          )

          console.log('🔍 Setting up Firestore listener for weddingId:', wedding.id)

          const unsubscribe = onSnapshot(vendorsQuery, (snapshot) => {
            console.log('📡 Firestore snapshot received:', snapshot.size, 'documents')
            snapshot.docs.forEach(doc => {
              console.log('📄 Document:', doc.id, doc.data())
            })

            const loadedVendors = snapshot.docs.map(doc =>
              convertFirestoreVendor(doc.id, doc.data())
            ).sort((a, b) => a.name.localeCompare(b.name))
            console.log('🏢 Loaded vendors from Firestore:', loadedVendors.length, loadedVendors)
            setVendors(loadedVendors)

            // Also update localStorage with Firestore data
            if (loadedVendors.length > 0) {
              localStorage.setItem(`vendors_${wedding.id}`, JSON.stringify(loadedVendors))
              console.log('📦 Updated localStorage with Firestore data')
            } else {
              console.log('📦 No vendors to save to localStorage')
            }
          }, (error) => {
            console.error('❌ Firestore snapshot error:', error)
            console.error('Error code:', error.code)
            console.error('Error message:', error.message)
            // Don't clear localStorage data on Firestore error
          })

          return unsubscribe
        } catch (firestoreError: any) {
          console.error('⚠️ Firestore not available:', firestoreError)
          console.error('Error code:', firestoreError.code)
          console.error('Error message:', firestoreError.message)
          // localStorage data is already loaded above
        }
      } catch (error: any) {
        console.error('Error loading vendors:', error)
        setError('Chyba při načítání dodavatelů')
      } finally {
        setLoading(false)
      }
    }

    loadVendors()
  }, [wedding?.id])

  // Clear error
  const clearError = () => setError(null)

  return {
    vendors,
    contracts,
    messages,
    loading,
    error,
    stats,
    createVendor,
    updateVendor,
    deleteVendor,
    getFilteredVendors,
    getVendorsByCategory,
    getVendorsByStatus,
    clearError
  }
}
