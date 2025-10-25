'use client'

import { MarketplaceVendor } from '@/types/vendor'
import { marketplaceVendors } from '@/data/marketplaceVendors'
import { db } from '@/lib/firebase'
import { collection, query, where, onSnapshot, Timestamp } from 'firebase/firestore'

// Global vendor store for real-time updates
class VendorStore {
  private vendors: MarketplaceVendor[] = [...marketplaceVendors]
  private listeners: Set<() => void> = new Set()
  private unsubscribe: (() => void) | null = null
  private isInitialized = false

  // Get all vendors
  getVendors(): MarketplaceVendor[] {
    return [...this.vendors]
  }

  // Get vendor by ID
  getVendorById(id: string): MarketplaceVendor | undefined {
    return this.vendors.find(vendor => vendor.id === id)
  }

  // Update vendor
  updateVendor(id: string, updates: Partial<MarketplaceVendor>): boolean {
    const index = this.vendors.findIndex(vendor => vendor.id === id)
    if (index !== -1) {
      this.vendors[index] = {
        ...this.vendors[index],
        ...updates,
        updatedAt: new Date()
      }
      this.notifyListeners()
      this.saveToLocalStorage()
      return true
    }
    return false
  }

  // Add new vendor
  addVendor(vendor: MarketplaceVendor): void {
    this.vendors.push({
      ...vendor,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    this.notifyListeners()
    this.saveToLocalStorage()
  }

  // Delete vendor
  deleteVendor(id: string): boolean {
    const index = this.vendors.findIndex(vendor => vendor.id === id)
    if (index !== -1) {
      this.vendors.splice(index, 1)
      this.notifyListeners()
      this.saveToLocalStorage()
      return true
    }
    return false
  }

  // Subscribe to changes
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  // Notify all listeners
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener())
  }

  // Save to localStorage for persistence
  private saveToLocalStorage(): void {
    try {
      localStorage.setItem('marketplace_vendors', JSON.stringify(this.vendors))
    } catch (error) {
      console.warn('Failed to save vendors to localStorage:', error)
    }
  }

  // Initialize Firestore listener for real-time updates
  initializeFirestore(): void {
    if (this.isInitialized) {
      console.log('📦 VendorStore already initialized')
      return
    }

    console.log('🔥 Initializing VendorStore with Firestore...')
    this.isInitialized = true

    try {
      // Query only approved vendors
      const vendorsRef = collection(db, 'marketplaceVendors')
      const q = query(vendorsRef, where('status', '==', 'approved'))

      // Set up real-time listener
      this.unsubscribe = onSnapshot(q,
        (snapshot) => {
          console.log('📦 Firestore vendors snapshot:', snapshot.size, 'approved vendors')

          const firestoreVendors: MarketplaceVendor[] = []
          snapshot.forEach((doc) => {
            const data = doc.data()

            // Convert Firestore data to MarketplaceVendor
            const vendor: MarketplaceVendor = {
              id: doc.id,
              name: data.name || '',
              category: data.category,
              description: data.description || '',
              shortDescription: data.shortDescription || '',
              images: data.images || [],
              portfolioImages: data.portfolioImages || [],
              email: data.email || '',
              phone: data.phone || '',
              website: data.website || '',
              address: data.address || { city: '', region: '', street: '', postalCode: '', country: 'Czech Republic' },
              workingRadius: data.workingRadius || 50,
              priceRange: data.priceRange || { min: 0, max: 0, currency: 'CZK', unit: 'per-event' },
              services: data.services || [],
              features: data.features || [],
              specialties: data.specialties || [],
              availability: data.availability || {
                workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
                workingHours: { start: '09:00', end: '18:00' }
              },
              yearsInBusiness: data.yearsInBusiness || 0,
              responseTime: data.responseTime || '24 hodin',
              verified: data.verified || false,
              featured: data.featured || false,
              premium: data.premium || false,
              rating: data.rating || { overall: 0, count: 0, breakdown: { quality: 0, communication: 0, value: 0, professionalism: 0 } },
              testimonials: data.testimonials || [],
              awards: data.awards || [],
              certifications: data.certifications || [],
              tags: data.tags || [],
              keywords: data.keywords || [],
              createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
              updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(),
              lastActive: data.lastActive instanceof Timestamp ? data.lastActive.toDate() : new Date()
            }

            firestoreVendors.push(vendor)
          })

          // Merge with mock data (keep mock data for now, but Firestore takes priority)
          const mockVendorIds = marketplaceVendors.map(v => v.id)
          const firestoreVendorIds = firestoreVendors.map(v => v.id)

          // Keep mock vendors that don't conflict with Firestore
          const nonConflictingMockVendors = marketplaceVendors.filter(
            v => !firestoreVendorIds.includes(v.id)
          )

          this.vendors = [...firestoreVendors, ...nonConflictingMockVendors]
          console.log('✅ VendorStore updated:', this.vendors.length, 'total vendors')
          this.notifyListeners()
        },
        (error) => {
          console.error('❌ Firestore vendors listener error:', error)
          // Fall back to mock data on error
          this.vendors = [...marketplaceVendors]
          this.notifyListeners()
        }
      )
    } catch (error) {
      console.error('❌ Failed to initialize Firestore listener:', error)
      // Fall back to mock data
      this.vendors = [...marketplaceVendors]
      this.notifyListeners()
    }
  }

  // Load from localStorage (deprecated - now using Firestore)
  loadFromLocalStorage(): void {
    console.warn('⚠️ loadFromLocalStorage is deprecated, using Firestore instead')
    this.initializeFirestore()
  }

  // Reset to default data
  reset(): void {
    this.vendors = [...marketplaceVendors]
    this.notifyListeners()
    localStorage.removeItem('marketplace_vendors')
  }

  // Cleanup
  destroy(): void {
    if (this.unsubscribe) {
      this.unsubscribe()
      this.unsubscribe = null
    }
    this.isInitialized = false
  }
}

// Create singleton instance
export const vendorStore = new VendorStore()

// Initialize from Firestore on client side
if (typeof window !== 'undefined') {
  vendorStore.initializeFirestore()
}
