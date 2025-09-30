'use client'

import { useState, useEffect } from 'react'
import { db } from '@/config/firebase'
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  serverTimestamp,
  orderBy,
  Timestamp
} from 'firebase/firestore'
import { MarketplaceVendor } from '@/types/vendor'

export interface MarketplaceVendorRegistration {
  id?: string
  name: string
  category: string
  description: string
  shortDescription: string
  email: string
  phone: string
  website?: string
  address: {
    street: string
    city: string
    postalCode: string
    region: string
  }
  businessName?: string
  businessId?: string
  vatNumber?: string
  services: any[]
  priceRange: {
    min: number
    max: number
    currency: string
    unit: string
  }
  features: string[]
  specialties: string[]
  workingRadius: number
  yearsInBusiness: number
  availability: {
    workingDays: string[]
    workingHours: {
      start: string
      end: string
    }
  }
  images: string[]
  portfolioImages: string[]
  videoUrl?: string
  responseTime: string
  verified: boolean
  status: 'pending' | 'approved' | 'rejected'
  createdAt?: any
  updatedAt?: any
}

export function useMarketplaceVendors() {
  const [vendors, setVendors] = useState<MarketplaceVendorRegistration[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load vendors from Firestore
  const loadVendors = async () => {
    try {
      setLoading(true)
      setError(null)

      const vendorsRef = collection(db, 'marketplaceVendors')
      const q = query(vendorsRef, orderBy('createdAt', 'desc'))
      const snapshot = await getDocs(q)

      const vendorsList: MarketplaceVendorRegistration[] = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        vendorsList.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
          updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date()
        } as MarketplaceVendorRegistration)
      })

      setVendors(vendorsList)
      console.log('✅ Loaded marketplace vendors:', vendorsList.length)
    } catch (err: any) {
      console.error('Error loading marketplace vendors:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Load vendors on mount
  useEffect(() => {
    loadVendors()
  }, [])

  // Get pending vendors (waiting for approval)
  const getPendingVendors = () => {
    return vendors.filter(v => v.status === 'pending')
  }

  // Get approved vendors
  const getApprovedVendors = () => {
    return vendors.filter(v => v.status === 'approved' && v.verified)
  }

  // Approve vendor (admin only)
  const approveVendor = async (vendorId: string) => {
    try {
      const vendorRef = doc(db, 'marketplaceVendors', vendorId)
      await updateDoc(vendorRef, {
        status: 'approved',
        verified: true,
        updatedAt: serverTimestamp()
      })

      // Update local state
      setVendors(prev => prev.map(v => 
        v.id === vendorId 
          ? { ...v, status: 'approved' as const, verified: true, updatedAt: new Date() }
          : v
      ))

      console.log('✅ Vendor approved:', vendorId)
      return true
    } catch (err: any) {
      console.error('Error approving vendor:', err)
      setError(err.message)
      return false
    }
  }

  // Reject vendor (admin only)
  const rejectVendor = async (vendorId: string) => {
    try {
      const vendorRef = doc(db, 'marketplaceVendors', vendorId)
      await updateDoc(vendorRef, {
        status: 'rejected',
        updatedAt: serverTimestamp()
      })

      // Update local state
      setVendors(prev => prev.map(v => 
        v.id === vendorId 
          ? { ...v, status: 'rejected' as const, updatedAt: new Date() }
          : v
      ))

      console.log('✅ Vendor rejected:', vendorId)
      return true
    } catch (err: any) {
      console.error('Error rejecting vendor:', err)
      setError(err.message)
      return false
    }
  }

  // Delete vendor (admin only)
  const deleteVendor = async (vendorId: string) => {
    try {
      const vendorRef = doc(db, 'marketplaceVendors', vendorId)
      await deleteDoc(vendorRef)

      // Update local state
      setVendors(prev => prev.filter(v => v.id !== vendorId))

      console.log('✅ Vendor deleted:', vendorId)
      return true
    } catch (err: any) {
      console.error('Error deleting vendor:', err)
      setError(err.message)
      return false
    }
  }

  // Update vendor (admin only)
  const updateVendor = async (vendorId: string, updates: Partial<MarketplaceVendorRegistration>) => {
    try {
      const vendorRef = doc(db, 'marketplaceVendors', vendorId)
      await updateDoc(vendorRef, {
        ...updates,
        updatedAt: serverTimestamp()
      })

      // Update local state
      setVendors(prev => prev.map(v => 
        v.id === vendorId 
          ? { ...v, ...updates, updatedAt: new Date() }
          : v
      ))

      console.log('✅ Vendor updated:', vendorId)
      return true
    } catch (err: any) {
      console.error('Error updating vendor:', err)
      setError(err.message)
      return false
    }
  }

  return {
    vendors,
    loading,
    error,
    loadVendors,
    getPendingVendors,
    getApprovedVendors,
    approveVendor,
    rejectVendor,
    deleteVendor,
    updateVendor
  }
}

