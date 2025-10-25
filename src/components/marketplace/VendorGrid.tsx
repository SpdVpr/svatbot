'use client'

import { MarketplaceVendor } from '@/types/vendor'
import VendorCard from './VendorCard'
import {
  Search,
  AlertTriangle,
  Loader2
} from 'lucide-react'

interface VendorGridProps {
  vendors: MarketplaceVendor[]
  loading?: boolean
  error?: string | null
  emptyMessage?: string
  isFavorite?: (vendorId: string) => boolean
  toggleFavorite?: (vendorId: string) => Promise<boolean>
}

export default function VendorGrid({ vendors, loading = false, error, emptyMessage, isFavorite, toggleFavorite }: VendorGridProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-3">
          <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
          <span className="text-gray-600">Načítání dodavatelů...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Chyba při načítání
        </h3>
        <p className="text-gray-600">{error}</p>
      </div>
    )
  }

  if (vendors.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <Search className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Žádní dodavatelé nenalezeni
        </h3>
        <p className="text-gray-600 mb-4">
          {emptyMessage || "Zkuste upravit filtry nebo vyhledávací kritéria."}
        </p>
        <button className="btn-outline">
          Vymazat filtry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Results header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          Nalezení dodavatelé ({vendors.length})
        </h2>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Řadit podle:</span>
          <select className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-primary-500 focus:border-transparent">
            <option value="rating">Hodnocení</option>
            <option value="price-low">Cena (nejnižší)</option>
            <option value="price-high">Cena (nejvyšší)</option>
            <option value="distance">Vzdálenost</option>
            <option value="reviews">Počet recenzí</option>
          </select>
        </div>
      </div>

      {/* Vendor grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vendors.map((vendor) => (
          <VendorCard 
            key={vendor.id} 
            vendor={vendor}
            isFavorite={isFavorite}
            toggleFavorite={toggleFavorite}
          />
        ))}
      </div>

      {/* Load more button (for pagination) */}
      {vendors.length >= 12 && (
        <div className="text-center pt-8">
          <button className="btn-outline">
            Načíst další dodavatele
          </button>
        </div>
      )}
    </div>
  )
}
