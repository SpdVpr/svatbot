'use client'

import { Utensils, Wine, Leaf } from 'lucide-react'
import { useMenu } from '@/hooks/useMenu'
import { FOOD_CATEGORY_LABELS, DRINK_CATEGORY_LABELS, FoodCategory, DrinkCategory } from '@/types/menu'
import type { MenuContent } from '@/types/wedding-website'

interface MenuSectionProps {
  content: MenuContent
}

export default function MenuSection({ content }: MenuSectionProps) {
  const { menuItems, drinkItems, loading } = useMenu()

  if (!content.enabled) return null

  if (loading) {
    return (
      <section className="relative py-24 bg-gradient-to-br from-rose-50 via-amber-50 to-pink-50 overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-gray-600">Načítání menu...</p>
        </div>
      </section>
    )
  }

  // Filter menu items based on settings
  const filteredMenuItems = menuItems.filter(item => {
    if (!content.showSideDishes && item.category === 'side-dish') return false
    if (!content.showDesserts && item.category === 'dessert') return false
    return true
  })

  // Group menu items by category
  const groupedMenuItems = filteredMenuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = []
    }
    acc[item.category].push(item)
    return acc
  }, {} as Record<FoodCategory, typeof filteredMenuItems>)

  // Group drink items by category
  const groupedDrinkItems = drinkItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = []
    }
    acc[item.category].push(item)
    return acc
  }, {} as Record<DrinkCategory, typeof drinkItems>)

  const hasMenuItems = filteredMenuItems.length > 0
  const hasDrinkItems = drinkItems.length > 0 && content.showDrinks

  if (!hasMenuItems && !hasDrinkItems) {
    return null
  }

  return (
    <section className="relative py-24 bg-gradient-to-br from-rose-50 via-amber-50 to-pink-50 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-rose-200 rounded-full blur-3xl opacity-20"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-200 rounded-full blur-3xl opacity-20"></div>

      <div className="relative max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-rose-300 rounded-full blur-xl opacity-50"></div>
              <div className="relative bg-gradient-to-br from-rose-100 to-amber-100 rounded-full p-5">
                <Utensils className="w-10 h-10 text-rose-600" />
              </div>
            </div>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-gray-800 mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            {content.title || 'Svatební menu'}
          </h2>
          {content.description && (
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">{content.description}</p>
          )}
        </div>

        {/* Food Items */}
        {hasMenuItems && (
          <div className="mb-12">
            {content.showCategories ? (
              // Show grouped by categories
              <div className="space-y-8">
                {Object.entries(groupedMenuItems).map(([category, items]) => (
                  <div key={category} className="bg-white rounded-3xl p-8 shadow-xl border-2 border-rose-100">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center" style={{ fontFamily: 'Playfair Display, serif' }}>
                      {FOOD_CATEGORY_LABELS[category as FoodCategory]}
                    </h3>
                    <div className="space-y-4">
                      {items.map((item) => (
                        <div key={item.id} className="border-b border-rose-100 last:border-0 pb-4 last:pb-0">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 text-lg">{item.name}</h4>
                              {item.description && (
                                <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                              )}
                              {content.showDietaryInfo && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {item.isVegetarian && (
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                      Vegetariánské
                                    </span>
                                  )}
                                  {item.isVegan && (
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                      Veganské
                                    </span>
                                  )}
                                  {item.isGlutenFree && (
                                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                                      Bezlepkové
                                    </span>
                                  )}
                                  {item.isLactoseFree && (
                                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                      Bez laktózy
                                    </span>
                                  )}
                                  {item.allergens && item.allergens.length > 0 && (
                                    <span className="text-xs bg-rose-100 text-rose-700 px-2 py-1 rounded-full">
                                      Alergeny: {item.allergens.join(', ')}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Show all items in one list
              <div className="bg-white rounded-3xl p-8 shadow-xl border-2 border-rose-100">
                <div className="space-y-4">
                  {filteredMenuItems.map((item) => (
                    <div key={item.id} className="border-b border-rose-100 last:border-0 pb-4 last:pb-0">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 text-lg">{item.name}</h4>
                          {item.description && (
                            <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                          )}
                          {content.showDietaryInfo && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {item.isVegetarian && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                  Vegetariánské
                                </span>
                              )}
                              {item.isVegan && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                  Veganské
                                </span>
                              )}
                              {item.isGlutenFree && (
                                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                                  Bezlepkové
                                </span>
                              )}
                              {item.isLactoseFree && (
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                  Bez laktózy
                                </span>
                              )}
                              {item.allergens && item.allergens.length > 0 && (
                                <span className="text-xs bg-rose-100 text-rose-700 px-2 py-1 rounded-full">
                                  Alergeny: {item.allergens.join(', ')}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Drink Items */}
        {hasDrinkItems && (
          <div className="bg-white rounded-3xl p-8 shadow-xl border-2 border-amber-100">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Wine className="w-6 h-6 text-amber-600" />
              <h3 className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'Playfair Display, serif' }}>
                Nápoje
              </h3>
            </div>
            {content.showCategories ? (
              <div className="space-y-6">
                {Object.entries(groupedDrinkItems).map(([category, items]) => (
                  <div key={category}>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">
                      {DRINK_CATEGORY_LABELS[category as DrinkCategory]}
                    </h4>
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div key={item.id} className="flex justify-between items-start">
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900">{item.name}</h5>
                            {item.description && (
                              <p className="text-gray-600 text-sm">{item.description}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {drinkItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-start border-b border-amber-100 last:border-0 pb-3 last:pb-0">
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900">{item.name}</h5>
                      {item.description && (
                        <p className="text-gray-600 text-sm">{item.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

