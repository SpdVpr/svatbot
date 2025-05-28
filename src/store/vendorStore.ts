'use client'

import { MarketplaceVendor } from '@/types/vendor'
import { marketplaceVendors } from '@/data/marketplaceVendors'

// Global vendor store for real-time updates
class VendorStore {
  private vendors: MarketplaceVendor[] = [...marketplaceVendors]
  private listeners: Set<() => void> = new Set()

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

  // Load from localStorage
  loadFromLocalStorage(): void {
    try {
      const saved = localStorage.getItem('marketplace_vendors')
      if (saved) {
        const parsedVendors = JSON.parse(saved)
        // Validate and merge with default data
        if (Array.isArray(parsedVendors) && parsedVendors.length > 0) {
          this.vendors = parsedVendors.map(vendor => ({
            ...vendor,
            createdAt: new Date(vendor.createdAt),
            updatedAt: new Date(vendor.updatedAt),
            lastActive: vendor.lastActive ? new Date(vendor.lastActive) : new Date(),
            // Fix testimonial dates
            testimonials: vendor.testimonials?.map((testimonial: any) => ({
              ...testimonial,
              date: new Date(testimonial.date),
              weddingDate: new Date(testimonial.weddingDate)
            })) || []
          }))
          this.notifyListeners()
        }
      }
    } catch (error) {
      console.warn('Failed to load vendors from localStorage:', error)
    }
  }

  // Reset to default data
  reset(): void {
    this.vendors = [...marketplaceVendors]
    this.notifyListeners()
    localStorage.removeItem('marketplace_vendors')
  }
}

// Create singleton instance
export const vendorStore = new VendorStore()

// Initialize from localStorage on client side
if (typeof window !== 'undefined') {
  vendorStore.loadFromLocalStorage()
}
