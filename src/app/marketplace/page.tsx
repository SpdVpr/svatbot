'use client'

import { useState } from 'react'
import { useMarketplace } from '@/hooks/useMarketplace'
import { VendorCategory, VENDOR_CATEGORIES } from '@/types/vendor'
import FeaturedVendors from '@/components/marketplace/FeaturedVendors'
import CategoryGrid from '@/components/marketplace/CategoryGrid'
import VendorGrid from '@/components/marketplace/VendorGrid'
import MarketplaceFilters from '@/components/marketplace/MarketplaceFilters'
import ModuleHeader from '@/components/common/ModuleHeader'
import { Search, Filter, TrendingUp, Store, Plus, Heart } from 'lucide-react'
import Link from 'next/link'
import { useFavoriteVendors } from '@/hooks/useFavoriteVendors'
import { useColorTheme } from '@/hooks/useColorTheme'

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

  const { currentPalette } = useColorTheme()

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

  // Handle sort change
  const handleSortChange = (sortBy: 'newest' | 'rating' | 'price-low' | 'price-high' | 'reviews') => {
    setFilters({ ...filters, sortBy })
  }

  // Clear all filters
  const handleClearFilters = () => {
    setSelectedCategory(null)
    setShowFavoritesOnly(false)
    setFilters({ sortBy: 'newest' })
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
      {/* Standardní horní lišta */}
      <ModuleHeader
        icon={Store}
        title="Marketplace"
        subtitle="Najděte perfektní dodavatele pro váš velký den"
        stats={
          <div className="flex items-center space-x-2 text-text-muted">
            <TrendingUp className="w-4 h-4" />
            <span className="body-small">{stats.totalVendors} dodavatelů</span>
          </div>
        }
        actions={
          <Link
            href="/marketplace/register"
            className="btn-primary flex items-center space-x-2 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Přidat inzerát</span>
            <span className="sm:hidden">Přidat</span>
          </Link>
        }
      />

      {/* Vyhledávací pole a kategorie se světlým pozadím z barevné palety */}
      <div
        className="border-b border-neutral-200"
        style={{ backgroundColor: currentPalette.colors.primaryLight }}
      >
        <div className="container-desktop py-4 md:py-6">
          {/* Search and View Toggle */}
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex-1 w-full lg:max-w-md">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
                  style={{ color: currentPalette.colors.primary600 }}
                />
                <input
                  type="text"
                  placeholder="Hledat dodavatele..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border-0 bg-white/70 backdrop-blur-sm focus:bg-white focus:outline-none focus:ring-2 transition-all"
                  style={{
                    '--tw-ring-color': currentPalette.colors.primary400
                  } as React.CSSProperties}
                  value={filters.search || ''}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3 w-full lg:w-auto">
              {/* Browse view indicator */}
              <div
                className="hidden md:flex rounded-lg px-3 py-2"
                style={{
                  backgroundColor: currentPalette.colors.primary200,
                  color: currentPalette.colors.primary700
                }}
              >
                <span className="text-sm font-medium whitespace-nowrap">Procházet všechny dodavatele</span>
              </div>

              {/* Filters Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn-outline flex items-center space-x-2 whitespace-nowrap bg-white/70 backdrop-blur-sm hover:bg-white"
                style={showFilters ? {
                  backgroundColor: currentPalette.colors.primaryLight,
                  borderColor: currentPalette.colors.primary300
                } : {}}
              >
                <Filter className="w-4 h-4" />
                <span>Filtry</span>
                {Object.keys(filters).length > 0 && (
                  <span
                    className="text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                    style={{ backgroundColor: currentPalette.colors.primary }}
                  >
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
                    ? 'shadow-lg scale-105'
                    : 'bg-white/70 backdrop-blur-sm border border-neutral-200 hover:border-primary-300 hover:shadow-md hover:bg-white'
                }`}
                style={!selectedCategory && !showFavoritesOnly ? {
                  backgroundColor: currentPalette.colors.primary,
                  color: 'white'
                } : {}}
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
                    : 'bg-white/70 backdrop-blur-sm border border-neutral-200 hover:border-red-300 hover:shadow-md hover:bg-white'
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
                      ? 'shadow-lg scale-105'
                      : 'bg-white/70 backdrop-blur-sm border border-neutral-200 hover:border-primary-300 hover:shadow-md hover:bg-white'
                  }`}
                  style={selectedCategory === key ? {
                    backgroundColor: currentPalette.colors.primary,
                    color: 'white'
                  } : {}}
                >
                  <span className="text-2xl mb-1">{category.icon}</span>
                  <span className="text-xs font-medium text-center leading-tight">
                    {category.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
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
              sortBy={filters.sortBy}
              onSortChange={handleSortChange}
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
