'use client'

import type { MarketplaceFilters } from '@/hooks/useMarketplace'
import { VendorCategory, VENDOR_CATEGORIES } from '@/types/vendor'
import {
  X,
  MapPin,
  DollarSign,
  Star,
  Verified,
  Crown,
  Filter
} from 'lucide-react'
import { useState } from 'react'

interface MarketplaceFiltersProps {
  filters: MarketplaceFilters
  onFiltersChange: (filters: MarketplaceFilters) => void
  onClearFilters?: () => void
  onClose?: () => void
  stats?: any
}

export default function MarketplaceFilters({
  filters,
  onFiltersChange,
  onClearFilters,
  onClose,
  stats
}: MarketplaceFiltersProps) {
  const [localFilters, setLocalFilters] = useState<MarketplaceFilters>(filters)

  // Apply filters
  const applyFilters = () => {
    onFiltersChange(localFilters)
    if (onClose) {
      onClose()
    }
  }

  // Clear filters
  const clearFilters = () => {
    const emptyFilters: MarketplaceFilters = {}
    setLocalFilters(emptyFilters)
    onFiltersChange(emptyFilters)
    if (onClearFilters) {
      onClearFilters()
    }
  }

  // Update local filter
  const updateFilter = (key: keyof MarketplaceFilters, value: any) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }))
  }

  // Czech regions
  const regions = [
    'Praha',
    'Středočeský kraj',
    'Jihočeský kraj',
    'Plzeňský kraj',
    'Karlovarský kraj',
    'Ústecký kraj',
    'Liberecký kraj',
    'Královéhradecký kraj',
    'Pardubický kraj',
    'Vysočina',
    'Jihomoravský kraj',
    'Olomoucký kraj',
    'Zlínský kraj',
    'Moravskoslezský kraj'
  ]

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filtry</h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kategorie
          </label>
          <select
            value={localFilters.category?.[0] || ''}
            onChange={(e) => updateFilter('category', e.target.value ? [e.target.value as VendorCategory] : undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Všechny kategorie</option>
            {Object.entries(VENDOR_CATEGORIES).map(([key, config]) => (
              <option key={key} value={key}>
                {config.icon} {config.name}
              </option>
            ))}
          </select>
        </div>

        {/* Location Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="w-4 h-4 inline mr-1" />
            Lokalita
          </label>
          <select
            value={localFilters.location || ''}
            onChange={(e) => updateFilter('location', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Všechny lokality</option>
            {regions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <DollarSign className="w-4 h-4 inline mr-1" />
            Cenové rozpětí
          </label>
          <div className="space-y-2">
            <input
              type="number"
              placeholder="Min. cena"
              value={localFilters.priceMin || ''}
              onChange={(e) => updateFilter('priceMin', e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <input
              type="number"
              placeholder="Max. cena"
              value={localFilters.priceMax || ''}
              onChange={(e) => updateFilter('priceMax', e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Rating Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Star className="w-4 h-4 inline mr-1" />
            Minimální hodnocení
          </label>
          <select
            value={localFilters.rating || ''}
            onChange={(e) => updateFilter('rating', e.target.value ? parseFloat(e.target.value) : undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Jakékoliv hodnocení</option>
            <option value="4.5">4.5+ hvězdiček</option>
            <option value="4.0">4.0+ hvězdiček</option>
            <option value="3.5">3.5+ hvězdiček</option>
            <option value="3.0">3.0+ hvězdiček</option>
          </select>
        </div>
      </div>

      {/* Special filters */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Speciální filtry</h4>

        <div className="flex flex-wrap gap-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={localFilters.verified || false}
              onChange={(e) => updateFilter('verified', e.target.checked || undefined)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700 flex items-center space-x-1">
              <Verified className="w-4 h-4 text-green-500" />
              <span>Pouze ověření</span>
            </span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={localFilters.featured || false}
              onChange={(e) => updateFilter('featured', e.target.checked || undefined)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700 flex items-center space-x-1">
              <Crown className="w-4 h-4 text-orange-500" />
              <span>Doporučené</span>
            </span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={localFilters.premium || false}
              onChange={(e) => updateFilter('premium', e.target.checked || undefined)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700 flex items-center space-x-1">
              <span className="w-4 h-4 bg-purple-500 rounded text-white text-xs flex items-center justify-center font-bold">P</span>
              <span>Premium</span>
            </span>
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-3 mt-6 pt-6 border-t border-gray-200">
        <button
          onClick={clearFilters}
          className="flex-1 btn-outline"
        >
          Vymazat filtry
        </button>
        <button
          onClick={applyFilters}
          className="flex-1 btn-primary"
        >
          Použít filtry
        </button>
      </div>
    </div>
  )
}
