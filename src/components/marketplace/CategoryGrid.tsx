'use client'

import { VendorCategory, VENDOR_CATEGORIES } from '@/types/vendor'
import { useMarketplace } from '@/hooks/useMarketplace'
import {
  ArrowRight,
  TrendingUp
} from 'lucide-react'

interface CategoryGridProps {
  onCategorySelect: (category: VendorCategory) => void
  stats?: any
}

export default function CategoryGrid({ onCategorySelect, stats: propStats }: CategoryGridProps) {
  const { stats: hookStats } = useMarketplace()
  const stats = propStats || hookStats

  // Get category data with counts
  const categories = Object.entries(VENDOR_CATEGORIES).map(([key, config]) => ({
    key: key as VendorCategory,
    ...config,
    count: stats.byCategory[key as VendorCategory] || 0
  }))

  // Sort by count (most popular first)
  const sortedCategories = categories.sort((a, b) => b.count - a.count)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="heading-2 mb-4">Kategorie dodavatelů</h2>
        <p className="body-large text-text-muted max-w-2xl mx-auto">
          Vyberte kategorii a najděte nejlepší dodavatele pro vaši svatbu
        </p>
      </div>

      {/* Popular categories */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="w-5 h-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">Nejpopulárnější kategorie</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {sortedCategories.slice(0, 6).map((category) => (
            <button
              key={category.key}
              onClick={() => onCategorySelect(category.key)}
              className="wedding-card text-left hover:shadow-lg transition-all duration-300 group"
            >
              <div className="flex items-center space-x-4">
                <div className={`p-4 rounded-xl ${category.color} group-hover:scale-110 transition-transform`}>
                  <span className="text-2xl">{category.icon}</span>
                </div>

                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                    {category.name}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {category.description}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-medium text-primary-600">
                      {category.count} dodavatelů
                    </span>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary-600 transition-colors" />
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* All categories */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Všechny kategorie</h3>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {sortedCategories.map((category) => (
            <button
              key={category.key}
              onClick={() => onCategorySelect(category.key)}
              className="p-4 border border-gray-200 rounded-xl hover:border-primary-300 hover:bg-primary-50 transition-all duration-200 group"
            >
              <div className="text-center">
                <div className="text-3xl mb-2">{category.icon}</div>
                <h4 className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors text-sm">
                  {category.name}
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  {category.count} dodavatelů
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Category insights */}
      <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tipy pro výběr dodavatelů</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-xl">📸</span>
            </div>
            <h4 className="font-medium text-gray-900 mb-2">Fotograf & Video</h4>
            <p className="text-sm text-gray-600">
              Rezervujte co nejdříve, nejlepší fotografové jsou obsazeni měsíce dopředu
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-xl">🏛️</span>
            </div>
            <h4 className="font-medium text-gray-900 mb-2">Místo konání</h4>
            <p className="text-sm text-gray-600">
              Vyberte místo jako první - ovlivní to všechny ostatní dodavatele
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-xl">🍽️</span>
            </div>
            <h4 className="font-medium text-gray-900 mb-2">Catering</h4>
            <p className="text-sm text-gray-600">
              Počítejte s 30-40% rozpočtu na jídlo a pití pro vaše hosty
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
