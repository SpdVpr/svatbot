'use client'

import { useState, useEffect, useMemo } from 'react'
import { MarketplaceVendor, VendorCategory } from '@/types/vendor'
import { vendorStore } from '@/store/vendorStore'

export interface MarketplaceFilters {
  category?: VendorCategory[]
  location?: string
  priceMin?: number
  priceMax?: number
  rating?: number
  verified?: boolean
  featured?: boolean
  premium?: boolean
  search?: string
  radius?: number // km from user location
  availability?: Date
}

export interface MarketplaceStats {
  totalVendors: number
  byCategory: Record<VendorCategory, number>
  averageRating: number
  verifiedCount: number
  featuredCount: number
  premiumCount: number
  priceRanges: {
    category: VendorCategory
    min: number
    max: number
    average: number
  }[]
}

interface UseMarketplaceReturn {
  vendors: MarketplaceVendor[]
  filteredVendors: MarketplaceVendor[]
  loading: boolean
  error: string | null
  stats: MarketplaceStats
  filters: MarketplaceFilters
  setFilters: (filters: MarketplaceFilters) => void
  searchVendors: (query: string) => void
  getVendorById: (id: string) => MarketplaceVendor | undefined
  getFeaturedVendors: (limit?: number) => MarketplaceVendor[]
  getVendorsByCategory: (category: VendorCategory) => MarketplaceVendor[]
  getNearbyVendors: (lat: number, lng: number, radius: number) => MarketplaceVendor[]
  clearFilters: () => void
}

export function useMarketplace(): UseMarketplaceReturn {
  const [vendors, setVendors] = useState<MarketplaceVendor[]>(vendorStore.getVendors())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<MarketplaceFilters>({})

  // Subscribe to vendor store changes
  useEffect(() => {
    const unsubscribe = vendorStore.subscribe(() => {
      setVendors(vendorStore.getVendors())
    })
    return unsubscribe
  }, [])

  // Filter vendors based on current filters
  const filteredVendors = useMemo(() => {
    let filtered = [...vendors]

    // Category filter
    if (filters.category && filters.category.length > 0) {
      filtered = filtered.filter(vendor =>
        filters.category!.includes(vendor.category)
      )
    }

    // Location filter (city/region)
    if (filters.location) {
      const locationLower = filters.location.toLowerCase()
      filtered = filtered.filter(vendor =>
        vendor.address.city.toLowerCase().includes(locationLower) ||
        vendor.address.region.toLowerCase().includes(locationLower)
      )
    }

    // Price range filter
    if (filters.priceMin !== undefined) {
      filtered = filtered.filter(vendor => vendor.priceRange.min >= filters.priceMin!)
    }
    if (filters.priceMax !== undefined) {
      filtered = filtered.filter(vendor => vendor.priceRange.max <= filters.priceMax!)
    }

    // Rating filter
    if (filters.rating !== undefined) {
      filtered = filtered.filter(vendor => vendor.rating.overall >= filters.rating!)
    }

    // Verified filter
    if (filters.verified !== undefined) {
      filtered = filtered.filter(vendor => vendor.verified === filters.verified)
    }

    // Featured filter
    if (filters.featured !== undefined) {
      filtered = filtered.filter(vendor => vendor.featured === filters.featured)
    }

    // Premium filter
    if (filters.premium !== undefined) {
      filtered = filtered.filter(vendor => vendor.premium === filters.premium)
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(vendor =>
        vendor.name.toLowerCase().includes(searchLower) ||
        vendor.description.toLowerCase().includes(searchLower) ||
        vendor.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
        vendor.keywords.some(keyword => keyword.toLowerCase().includes(searchLower)) ||
        vendor.specialties.some(specialty => specialty.toLowerCase().includes(searchLower))
      )
    }

    // Sort by rating and featured status
    filtered.sort((a, b) => {
      // Featured vendors first
      if (a.featured && !b.featured) return -1
      if (!a.featured && b.featured) return 1

      // Then by premium
      if (a.premium && !b.premium) return -1
      if (!a.premium && b.premium) return 1

      // Then by rating
      return b.rating.overall - a.rating.overall
    })

    return filtered
  }, [vendors, filters])

  // Calculate marketplace statistics
  const stats = useMemo((): MarketplaceStats => {
    const byCategory = vendors.reduce((acc, vendor) => {
      acc[vendor.category] = (acc[vendor.category] || 0) + 1
      return acc
    }, {} as Record<VendorCategory, number>)

    const averageRating = vendors.reduce((sum, vendor) => sum + vendor.rating.overall, 0) / vendors.length

    const priceRanges = Object.keys(byCategory).map(category => {
      const categoryVendors = vendors.filter(v => v.category === category as VendorCategory)
      const prices = categoryVendors.map(v => (v.priceRange.min + v.priceRange.max) / 2)

      return {
        category: category as VendorCategory,
        min: Math.min(...categoryVendors.map(v => v.priceRange.min)),
        max: Math.max(...categoryVendors.map(v => v.priceRange.max)),
        average: prices.reduce((sum, price) => sum + price, 0) / prices.length
      }
    })

    return {
      totalVendors: vendors.length,
      byCategory,
      averageRating,
      verifiedCount: vendors.filter(v => v.verified).length,
      featuredCount: vendors.filter(v => v.featured).length,
      premiumCount: vendors.filter(v => v.premium).length,
      priceRanges
    }
  }, [vendors])

  // Search vendors
  const searchVendors = (query: string) => {
    setFilters(prev => ({ ...prev, search: query }))
  }

  // Get vendor by ID
  const getVendorById = (id: string): MarketplaceVendor | undefined => {
    return vendorStore.getVendorById(id)
  }

  // Get featured vendors
  const getFeaturedVendors = (limit = 6): MarketplaceVendor[] => {
    return vendors
      .filter(vendor => vendor.featured)
      .sort((a, b) => b.rating.overall - a.rating.overall)
      .slice(0, limit)
  }

  // Get vendors by category
  const getVendorsByCategory = (category: VendorCategory): MarketplaceVendor[] => {
    return vendors
      .filter(vendor => vendor.category === category)
      .sort((a, b) => b.rating.overall - a.rating.overall)
  }

  // Get nearby vendors (simplified - in real app would use proper geolocation)
  const getNearbyVendors = (lat: number, lng: number, radius: number): MarketplaceVendor[] => {
    return vendors.filter(vendor => {
      if (!vendor.address.coordinates) return false

      // Simple distance calculation (in real app would use proper geolocation library)
      const distance = Math.sqrt(
        Math.pow(vendor.address.coordinates.lat - lat, 2) +
        Math.pow(vendor.address.coordinates.lng - lng, 2)
      ) * 111 // rough km conversion

      return distance <= radius
    })
  }

  // Clear all filters
  const clearFilters = () => {
    setFilters({})
  }

  return {
    vendors,
    filteredVendors,
    loading,
    error,
    stats,
    filters,
    setFilters,
    searchVendors,
    getVendorById,
    getFeaturedVendors,
    getVendorsByCategory,
    getNearbyVendors,
    clearFilters
  }
}
