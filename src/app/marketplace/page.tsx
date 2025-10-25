'use client'

import { useState } from 'react'
import { useMarketplace } from '@/hooks/useMarketplace'
import { VendorCategory, VENDOR_CATEGORIES } from '@/types/vendor'
import FeaturedVendors from '@/components/marketplace/FeaturedVendors'
import CategoryGrid from '@/components/marketplace/CategoryGrid'
import VendorGrid from '@/components/marketplace/VendorGrid'
import MarketplaceFilters from '@/components/marketplace/MarketplaceFilters'
import { Search, Filter, TrendingUp, ArrowLeft, Home, Plus, Heart } from 'lucide-react'
import Link from 'next/link'
import { useFavoriteVendors } from '@/hooks/useFavoriteVendors'

export default function MarketplacePage() {
  const {
    filteredVendors,
    loading,
    error,
    stats,
    filters,
    setFilters,
    searchVendors,
    getFeaturedVendors,
    clearFilters
  } = useMarketplace()

  // Removed viewMode - using browse view as default (most comprehensive)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<VendorCategory | null>(null)
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)

  const { favorites, isFavorite, toggleFavorite } = useFavoriteVendors()
  const featuredVendors = getFeaturedVendors(6)
  
  // Filter vendors to show only favorites if active
  const displayVendors = showFavoritesOnly 
    ? filteredVendors.filter(vendor => favorites.includes(vendor.id))
    : filteredVendors

  // Handle category selection
  const handleCategorySelect = (category: VendorCategory) => {
    setSelectedCategory(category)
    setShowFavoritesOnly(false)
    // Clear all filters and set only the selected category
    setFilters({ category: [category] })
  }

  // Handle search
  const handleSearch = (query: string) => {
    setFilters({ ...filters, search: query })
  }

  // Clear all filters
  const handleClearFilters = () => {
    setSelectedCategory(null)
    setShowFavoritesOnly(false)
    setFilters({})
  }

  // Toggle favorites filter
  const handleToggleFavorites = () => {
    setShowFavoritesOnly(!showFavoritesOnly)
    if (!showFavoritesOnly) {
      setSelectedCategory(null)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="container-desktop py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Link href="/" className="btn-ghost p-2">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="heading-2">Marketplace</h1>
                <p className="body-normal text-text-secondary">
                  Najděte perfektní dodavatele pro váš velký den
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-text-muted">
                <TrendingUp className="w-4 h-4" />
                <span className="body-small">{stats.totalVendors} dodavatelů</span>
              </div>

              <Link
                href="/marketplace/register"
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Přidat inzerát</span>
              </Link>
            </div>
          </div>

          {/* Search and View Toggle */}
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-4 h-4" />
                <input
                  type="text"
                  placeholder="Hledat dodavatele..."
                  className="input-field pl-10"
                  value={filters.search || ''}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Browse view indicator */}
              <div className="flex bg-primary-100 rounded-lg px-3 py-2">
                <span className="text-sm font-medium text-primary-700">Procházet všechny dodavatele</span>
              </div>

              {/* Filters Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`btn-outline flex items-center space-x-2 ${
                  showFilters ? 'bg-primary-50 border-primary-200' : ''
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>Filtry</span>
                {Object.keys(filters).length > 0 && (
                  <span className="bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {Object.keys(filters).length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-6">
              <MarketplaceFilters
                filters={filters}
                onFiltersChange={setFilters}
                onClearFilters={handleClearFilters}
                stats={stats}
              />
            </div>
          )}

          {/* Category Quick Filter */}
          <div className="mt-6">
            <div className="grid grid-cols-5 md:grid-cols-7 lg:grid-cols-10 gap-2 md:gap-3">
              {/* All Categories Button */}
              <button
                onClick={handleClearFilters}
                className={`flex flex-col items-center justify-center px-2 py-3 rounded-xl transition-all ${
                  !selectedCategory && !showFavoritesOnly
                    ? 'bg-primary-500 text-white shadow-lg scale-105'
                    : 'bg-white border border-neutral-200 hover:border-primary-300 hover:shadow-md'
                }`}
              >
                <span className="text-2xl mb-1">🎯</span>
                <span className="text-xs font-medium text-center">Vše</span>
              </button>

              {/* Favorites Button */}
              <button
                onClick={handleToggleFavorites}
                className={`flex flex-col items-center justify-center px-2 py-3 rounded-xl transition-all ${
                  showFavoritesOnly
                    ? 'bg-red-500 text-white shadow-lg scale-105'
                    : 'bg-white border border-neutral-200 hover:border-red-300 hover:shadow-md'
                }`}
              >
                <Heart className={`w-6 h-6 mb-1 ${showFavoritesOnly ? 'fill-current' : ''}`} />
                <span className="text-xs font-medium text-center">Oblíbené</span>
                {favorites.length > 0 && (
                  <span className="text-[10px] text-gray-500 mt-0.5">({favorites.length})</span>
                )}
              </button>

              {/* Category Buttons */}
              {Object.entries(VENDOR_CATEGORIES).map(([key, category]) => (
                <button
                  key={key}
                  onClick={() => handleCategorySelect(key as VendorCategory)}
                  className={`flex flex-col items-center justify-center px-2 py-3 rounded-xl transition-all ${
                    selectedCategory === key
                      ? 'bg-primary-500 text-white shadow-lg scale-105'
                      : 'bg-white border border-neutral-200 hover:border-primary-300 hover:shadow-md'
                  }`}
                >
                  <span className="text-2xl mb-1">{category.icon}</span>
                  <span className="text-xs font-medium text-center leading-tight">
                    {category.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Active Filters */}
          {Object.keys(filters).length > 0 && (
            <div className="mt-4 flex items-center space-x-2">
              <span className="body-small text-text-muted">Aktivní filtry:</span>
              <div className="flex flex-wrap gap-2">
                {filters.category?.map(category => (
                  <span
                    key={category}
                    className="inline-flex items-center space-x-1 bg-primary-100 text-primary-700 px-2 py-1 rounded-md text-xs"
                  >
                    <span>{VENDOR_CATEGORIES[category].name}</span>
                    <button
                      onClick={() => {
                        const newCategories = filters.category?.filter(c => c !== category) || []
                        setFilters({ ...filters, category: newCategories.length > 0 ? newCategories : undefined })
                      }}
                      className="hover:text-primary-900"
                    >
                      ×
                    </button>
                  </span>
                ))}
                {filters.search && (
                  <span className="inline-flex items-center space-x-1 bg-primary-100 text-primary-700 px-2 py-1 rounded-md text-xs">
                    <span>"{filters.search}"</span>
                    <button
                      onClick={() => setFilters({ ...filters, search: undefined })}
                      className="hover:text-primary-900"
                    >
                      ×
                    </button>
                  </span>
                )}
                <button
                  onClick={handleClearFilters}
                  className="text-text-muted hover:text-text-primary text-xs underline"
                >
                  Vymazat vše
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="container-desktop py-8">
        {error && (
          <div className="bg-error-50 border border-error-200 rounded-lg p-4 mb-6">
            <p className="text-error-700">{error}</p>
          </div>
        )}

        {/* Browse View - comprehensive display */}
        <div className="space-y-8">
          {/* Featured Section - Hidden but kept for future use */}
          {false && Object.keys(filters).length === 0 && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="heading-3">Doporučení dodavatelé</h2>
              </div>
              <FeaturedVendors 
                vendors={featuredVendors.slice(0, 3)}
                isFavorite={isFavorite}
                toggleFavorite={toggleFavorite}
              />
            </div>
          )}

          {/* Vendors View - Always show vendor grid */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="heading-3">
                {showFavoritesOnly
                  ? `Oblíbení dodavatelé (${displayVendors.length})`
                  : selectedCategory
                    ? `${VENDOR_CATEGORIES[selectedCategory].name} (${displayVendors.length})`
                    : `Všichni dodavatelé (${displayVendors.length})`
                }
              </h2>

              {selectedCategory && (
                <button
                  onClick={() => {
                    setSelectedCategory(null)
                    setFilters({})
                  }}
                  className="btn-ghost text-sm"
                >
                  Zobrazit všechny dodavatele
                </button>
              )}
            </div>

            <VendorGrid
              vendors={displayVendors}
              loading={loading}
              isFavorite={isFavorite}
              toggleFavorite={toggleFavorite}
              emptyMessage={
                showFavoritesOnly
                  ? "Zatím nemáte žádné oblíbené dodavatele"
                  : Object.keys(filters).length > 0
                    ? "Žádní dodavatelé nevyhovují zadaným filtrům"
                    : "Zatím nejsou k dispozici žádní dodavatelé"
              }
            />
          </div>
        </div>
      </div>
    </div>
  )
}
