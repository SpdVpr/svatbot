'use client'

import { UtensilsCrossed, Wine, Leaf, Wheat } from 'lucide-react'
import { useMenu } from '@/hooks/useMenu'
import { FOOD_CATEGORY_LABELS, DRINK_CATEGORY_LABELS, FoodCategory, DrinkCategory } from '@/types/menu'
import type { MenuContent } from '@/types/wedding-website'

interface MenuSectionProps {
  content: MenuContent
}

export default function MenuSection({ content }: MenuSectionProps) {
  const { menuItems, drinkItems, loading } = useMenu()

  if (loading) {
    return (
      <section id="menu" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-600">Načítání menu...</p>
          </div>
        </div>
      </section>
    )
  }

  // Group menu items by category
  const groupedMenuItems = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = []
    }
    acc[item.category].push(item)
    return acc
  }, {} as Record<FoodCategory, typeof menuItems>)

  // Group drink items by category
  const groupedDrinkItems = drinkItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = []
    }
    acc[item.category].push(item)
    return acc
  }, {} as Record<DrinkCategory, typeof drinkItems>)

  const hasMenuItems = menuItems.length > 0
  const hasDrinkItems = drinkItems.length > 0 && content.showDrinks

  if (!hasMenuItems && !hasDrinkItems) {
    return null
  }

  return (
    <section id="menu" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-900 rounded-full mb-6">
            <UtensilsCrossed className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-4xl md:text-5xl font-light text-gray-900 mb-4 tracking-tight">
            {content.title || 'Svatební menu'}
          </h2>
          {content.description && (
            <p className="text-lg text-gray-600 max-w-2xl mx-auto font-light">
              {content.description}
            </p>
          )}
        </div>

        {/* Food Items */}
        {hasMenuItems && (
          <div className="mb-16">
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="h-px w-12 bg-gray-300"></div>
              <h3 className="text-2xl font-light text-gray-900 tracking-wide">JÍDLO</h3>
              <div className="h-px w-12 bg-gray-300"></div>
            </div>

            {content.showCategories ? (
              // Show grouped by categories
              <div className="space-y-12">
                {Object.entries(groupedMenuItems).map(([category, items]) => (
                  <div key={category}>
                    <h4 className="text-lg font-medium text-gray-900 mb-6 text-center tracking-wide uppercase">
                      {FOOD_CATEGORY_LABELS[category as FoodCategory]}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {items.map((item) => (
                        <div key={item.id} className="border border-gray-200 rounded-none p-6 hover:border-gray-900 transition-colors">
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="font-medium text-gray-900">{item.name}</h5>
                            {content.showDietaryInfo && (
                              <div className="flex gap-1 ml-2">
                                {item.isVegetarian && (
                                  <span className="text-green-600" title="Vegetariánské">
                                    <Leaf className="w-4 h-4" />
                                  </span>
                                )}
                                {item.isVegan && (
                                  <span className="text-green-700" title="Veganské">
                                    <Leaf className="w-4 h-4 fill-current" />
                                  </span>
                                )}
                                {item.isGlutenFree && (
                                  <span className="text-blue-600" title="Bezlepkové">
                                    <Wheat className="w-4 h-4" />
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-gray-600 text-sm font-light">{item.description}</p>
                          )}
                          {content.showDietaryInfo && item.allergens.length > 0 && (
                            <p className="text-xs text-gray-500 mt-2 font-light">
                              Alergeny: {item.allergens.join(', ')}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Show all items without categories
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {menuItems.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-none p-6 hover:border-gray-900 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-medium text-gray-900">{item.name}</h5>
                      {content.showDietaryInfo && (
                        <div className="flex gap-1 ml-2">
                          {item.isVegetarian && (
                            <span className="text-green-600" title="Vegetariánské">
                              <Leaf className="w-4 h-4" />
                            </span>
                          )}
                          {item.isVegan && (
                            <span className="text-green-700" title="Veganské">
                              <Leaf className="w-4 h-4 fill-current" />
                            </span>
                          )}
                          {item.isGlutenFree && (
                            <span className="text-blue-600" title="Bezlepkové">
                              <Wheat className="w-4 h-4" />
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-gray-600 text-sm font-light">{item.description}</p>
                    )}
                    {content.showDietaryInfo && item.allergens.length > 0 && (
                      <p className="text-xs text-gray-500 mt-2 font-light">
                        Alergeny: {item.allergens.join(', ')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Drink Items */}
        {hasDrinkItems && (
          <div>
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="h-px w-12 bg-gray-300"></div>
              <h3 className="text-2xl font-light text-gray-900 tracking-wide">NÁPOJE</h3>
              <div className="h-px w-12 bg-gray-300"></div>
            </div>

            {content.showCategories ? (
              // Show grouped by categories
              <div className="space-y-12">
                {Object.entries(groupedDrinkItems).map(([category, items]) => (
                  <div key={category}>
                    <h4 className="text-lg font-medium text-gray-900 mb-6 text-center tracking-wide uppercase">
                      {DRINK_CATEGORY_LABELS[category as DrinkCategory]}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {items.map((item) => (
                        <div key={item.id} className="border border-gray-200 rounded-none p-6 hover:border-gray-900 transition-colors">
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="font-medium text-gray-900">{item.name}</h5>
                            {item.isAlcoholic && (
                              <span className="text-xs bg-gray-900 text-white px-2 py-1">
                                Alkohol
                              </span>
                            )}
                          </div>
                          {item.brand && (
                            <p className="text-sm text-gray-500 mb-1 font-light">{item.brand}</p>
                          )}
                          {item.description && (
                            <p className="text-gray-600 text-sm font-light">{item.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Show all items without categories
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {drinkItems.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-none p-6 hover:border-gray-900 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-medium text-gray-900">{item.name}</h5>
                      {item.isAlcoholic && (
                        <span className="text-xs bg-gray-900 text-white px-2 py-1">
                          Alkohol
                        </span>
                      )}
                    </div>
                    {item.brand && (
                      <p className="text-sm text-gray-500 mb-1 font-light">{item.brand}</p>
                    )}
                    {item.description && (
                      <p className="text-gray-600 text-sm font-light">{item.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Dietary Info Legend */}
        {content.showDietaryInfo && hasMenuItems && (
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600 font-light">
              <div className="flex items-center gap-2">
                <Leaf className="w-4 h-4 text-green-600" />
                <span>Vegetariánské</span>
              </div>
              <div className="flex items-center gap-2">
                <Leaf className="w-4 h-4 text-green-700 fill-current" />
                <span>Veganské</span>
              </div>
              <div className="flex items-center gap-2">
                <Wheat className="w-4 h-4 text-blue-600" />
                <span>Bezlepkové</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

