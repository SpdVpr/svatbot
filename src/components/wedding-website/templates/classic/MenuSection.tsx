'use client'

import { UtensilsCrossed, Wine, Leaf, Wheat } from 'lucide-react'
import { useMenu } from '@/hooks/useMenu'
import { FOOD_CATEGORY_LABELS, DRINK_CATEGORY_LABELS, FoodCategory, DrinkCategory } from '@/types/menu'
import type { MenuContent } from '@/types/wedding-website'
import { useColorTheme } from '../ColorThemeContext'

interface MenuSectionProps {
  content: MenuContent
}

export default function MenuSection({ content }: MenuSectionProps) {
  const { theme, themeName } = useColorTheme()
  const { menuItems, drinkItems, loading } = useMenu()

  if (loading) {
    return (
      <section id="menu" className="py-20" style={{ backgroundColor: themeName === 'default' ? '#ffffff' : theme.bgGradientFrom }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-600">Načítání menu...</p>
          </div>
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

  // Define category order
  const categoryOrder: FoodCategory[] = [
    'appetizer',      // Předkrmy
    'soup',           // Polévky
    'main-course',    // Hlavní jídla
    'side-dish',      // Přílohy
    'dessert',        // Dezerty
    'salad',          // Saláty
    'midnight-snack', // Noční svačina
    'buffet',         // Bufet
    'other'           // Ostatní
  ]

  // Group menu items by category
  const groupedMenuItems = filteredMenuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = []
    }
    acc[item.category].push(item)
    return acc
  }, {} as Record<FoodCategory, typeof filteredMenuItems>)

  // Sort grouped items by category order
  const sortedMenuCategories = categoryOrder.filter(category => groupedMenuItems[category])

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
    <section id="menu" className="py-20 relative overflow-hidden" style={{
      background: themeName === 'default' ? '#ffffff' : `linear-gradient(135deg, ${theme.bgGradientFrom} 0%, ${theme.bgGradientTo} 100%)`
    }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="font-serif text-5xl md:text-6xl font-bold mb-6" style={{ color: theme.primary }}>
            {content.title || 'Svatební menu'}
          </h2>

          {content.description && (
            <p className="text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed">
              {content.description}
            </p>
          )}
        </div>

        {/* Food Items */}
        {hasMenuItems && (
          <div className="mb-20">

            {content.showCategories ? (
              // Show grouped by categories in order
              <div className="space-y-12">
                {sortedMenuCategories.map((category) => {
                  const items = groupedMenuItems[category]
                  return (
                  <div key={category} className="mb-12">
                    {/* Category Header with Ornamental Design */}
                    <div className="text-center mb-8">
                      <div className="flex items-center justify-center gap-3 mb-6">
                        <div className="h-px w-12 bg-gradient-to-r from-transparent to-gray-300" />
                        <span className="font-serif text-2xl font-semibold px-8 py-3 rounded-lg shadow-md text-white"
                              style={{
                                background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`
                              }}>
                          {FOOD_CATEGORY_LABELS[category as FoodCategory]}
                        </span>
                        <div className="h-px w-12 bg-gradient-to-l from-transparent to-gray-300" />
                      </div>
                    </div>

                    {/* Menu Items as Elegant Cards */}
                    <div className="max-w-3xl mx-auto space-y-6">
                      {items.map((item, index) => (
                        <div key={item.id}
                             className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border-2"
                             style={{
                               borderColor: `${theme.primary}20`,
                               transform: 'translateY(0)',
                             }}
                             onMouseEnter={(e) => {
                               e.currentTarget.style.transform = 'translateY(-4px)'
                               e.currentTarget.style.borderColor = theme.primary
                             }}
                             onMouseLeave={(e) => {
                               e.currentTarget.style.transform = 'translateY(0)'
                               e.currentTarget.style.borderColor = `${theme.primary}20`
                             }}>

                          {/* Decorative Corner Elements */}
                          <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 rounded-tl-lg opacity-30"
                               style={{ borderColor: theme.primary }} />
                          <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 rounded-tr-lg opacity-30"
                               style={{ borderColor: theme.primary }} />
                          <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 rounded-bl-lg opacity-30"
                               style={{ borderColor: theme.primary }} />
                          <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 rounded-br-lg opacity-30"
                               style={{ borderColor: theme.primary }} />

                          {/* Item Number Badge */}
                          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg"
                               style={{ background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)` }}>
                            {index + 1}
                          </div>

                          <div className="text-center pt-4">
                            <h5 className="font-serif text-2xl font-bold mb-3" style={{ color: theme.primary }}>
                              {item.name}
                            </h5>

                            {item.description && (
                              <p className="text-gray-700 text-base leading-relaxed mb-4 italic">
                                {item.description}
                              </p>
                            )}

                            {/* Decorative Divider */}
                            {content.showDietaryInfo && (
                              <div className="flex items-center justify-center gap-2 my-4">
                                <div className="h-px w-16 bg-gradient-to-r from-transparent to-gray-300" />
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.accent }} />
                                <div className="h-px w-16 bg-gradient-to-l from-transparent to-gray-300" />
                              </div>
                            )}

                            {content.showDietaryInfo && (
                              <div className="flex gap-3 justify-center">
                                {item.isVegetarian && (
                                  <div className="flex flex-col items-center gap-1">
                                    <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                                      <Leaf className="w-5 h-5 text-green-600" />
                                    </div>
                                    <span className="text-xs text-gray-600">Vegetariánské</span>
                                  </div>
                                )}
                                {item.isVegan && (
                                  <div className="flex flex-col items-center gap-1">
                                    <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                                      <Leaf className="w-5 h-5 text-green-700 fill-current" />
                                    </div>
                                    <span className="text-xs text-gray-600">Veganské</span>
                                  </div>
                                )}
                                {item.isGlutenFree && (
                                  <div className="flex flex-col items-center gap-1">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                                      <Wheat className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <span className="text-xs text-gray-600">Bezlepkové</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  )
                })}
              </div>
            ) : (
              // Show all items without categories
              <div className="max-w-3xl mx-auto space-y-6">
                {filteredMenuItems.map((item, index) => (
                  <div key={item.id}
                       className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border-2"
                       style={{
                         borderColor: `${theme.primary}20`,
                         transform: 'translateY(0)',
                       }}
                       onMouseEnter={(e) => {
                         e.currentTarget.style.transform = 'translateY(-4px)'
                         e.currentTarget.style.borderColor = theme.primary
                       }}
                       onMouseLeave={(e) => {
                         e.currentTarget.style.transform = 'translateY(0)'
                         e.currentTarget.style.borderColor = `${theme.primary}20`
                       }}>

                    {/* Decorative Corner Elements */}
                    <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 rounded-tl-lg opacity-30"
                         style={{ borderColor: theme.primary }} />
                    <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 rounded-tr-lg opacity-30"
                         style={{ borderColor: theme.primary }} />
                    <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 rounded-bl-lg opacity-30"
                         style={{ borderColor: theme.primary }} />
                    <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 rounded-br-lg opacity-30"
                         style={{ borderColor: theme.primary }} />

                    {/* Item Number Badge */}
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg"
                         style={{ background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)` }}>
                      {index + 1}
                    </div>

                    <div className="text-center pt-4">
                      <h5 className="font-serif text-2xl font-bold mb-3" style={{ color: theme.primary }}>
                        {item.name}
                      </h5>

                      {item.description && (
                        <p className="text-gray-700 text-base leading-relaxed mb-4 italic">
                          {item.description}
                        </p>
                      )}

                      {/* Decorative Divider */}
                      {content.showDietaryInfo && (
                        <div className="flex items-center justify-center gap-2 my-4">
                          <div className="h-px w-16 bg-gradient-to-r from-transparent to-gray-300" />
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.accent }} />
                          <div className="h-px w-16 bg-gradient-to-l from-transparent to-gray-300" />
                        </div>
                      )}

                      {content.showDietaryInfo && (
                        <div className="flex gap-3 justify-center">
                          {item.isVegetarian && (
                            <div className="flex flex-col items-center gap-1">
                              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                                <Leaf className="w-5 h-5 text-green-600" />
                              </div>
                              <span className="text-xs text-gray-600">Vegetariánské</span>
                            </div>
                          )}
                          {item.isVegan && (
                            <div className="flex flex-col items-center gap-1">
                              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                                <Leaf className="w-5 h-5 text-green-700 fill-current" />
                              </div>
                              <span className="text-xs text-gray-600">Veganské</span>
                            </div>
                          )}
                          {item.isGlutenFree && (
                            <div className="flex flex-col items-center gap-1">
                              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                                <Wheat className="w-5 h-5 text-blue-600" />
                              </div>
                              <span className="text-xs text-gray-600">Bezlepkové</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Drink Items */}
        {hasDrinkItems && (
          <div className="mt-20">

            {content.showCategories ? (
              // Show grouped by categories
              <div className="space-y-12">
                {Object.entries(groupedDrinkItems).map(([category, items]) => (
                  <div key={category} className="mb-12">
                    {/* Category Header */}
                    <div className="text-center mb-8">
                      <div className="flex items-center justify-center gap-3 mb-6">
                        <div className="h-px w-12 bg-gradient-to-r from-transparent to-gray-300" />
                        <span className="font-serif text-2xl font-semibold px-8 py-3 rounded-lg shadow-md text-white"
                              style={{
                                background: `linear-gradient(135deg, ${theme.secondary} 0%, ${theme.accent} 100%)`
                              }}>
                          {DRINK_CATEGORY_LABELS[category as DrinkCategory]}
                        </span>
                        <div className="h-px w-12 bg-gradient-to-l from-transparent to-gray-300" />
                      </div>
                    </div>

                    {/* Drink Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {items.map((item) => (
                        <div key={item.id}
                             className="relative bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-2"
                             style={{
                               borderColor: `${theme.secondary}20`,
                               transform: 'translateY(0)',
                             }}
                             onMouseEnter={(e) => {
                               e.currentTarget.style.transform = 'translateY(-4px)'
                               e.currentTarget.style.borderColor = theme.secondary
                             }}
                             onMouseLeave={(e) => {
                               e.currentTarget.style.transform = 'translateY(0)'
                               e.currentTarget.style.borderColor = `${theme.secondary}20`
                             }}>

                          {/* Wine Glass Icon */}
                          <div className="flex justify-center mb-3">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-md"
                                 style={{ background: `linear-gradient(135deg, ${theme.secondary}20 0%, ${theme.accent}20 100%)` }}>
                              <Wine className="w-6 h-6" style={{ color: theme.secondary }} />
                            </div>
                          </div>

                          <div className="text-center">
                            <h5 className="font-serif text-lg font-bold mb-2" style={{ color: theme.secondary }}>
                              {item.name}
                            </h5>

                            {item.brand && (
                              <p className="text-sm font-medium mb-2" style={{ color: theme.accent }}>
                                {item.brand}
                              </p>
                            )}

                            {item.description && (
                              <p className="text-gray-600 text-sm leading-relaxed mb-3">
                                {item.description}
                              </p>
                            )}

                            {item.isAlcoholic && (
                              <span className="inline-block text-xs px-3 py-1 rounded-full shadow-sm"
                                    style={{
                                      backgroundColor: `${theme.secondary}15`,
                                      color: theme.secondary
                                    }}>
                                🍷 Alkoholický
                              </span>
                            )}
                          </div>
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
                  <div key={item.id}
                       className="relative bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-2"
                       style={{
                         borderColor: `${theme.secondary}20`,
                         transform: 'translateY(0)',
                       }}
                       onMouseEnter={(e) => {
                         e.currentTarget.style.transform = 'translateY(-4px)'
                         e.currentTarget.style.borderColor = theme.secondary
                       }}
                       onMouseLeave={(e) => {
                         e.currentTarget.style.transform = 'translateY(0)'
                         e.currentTarget.style.borderColor = `${theme.secondary}20`
                       }}>

                    {/* Wine Glass Icon */}
                    <div className="flex justify-center mb-3">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-md"
                           style={{ background: `linear-gradient(135deg, ${theme.secondary}20 0%, ${theme.accent}20 100%)` }}>
                        <Wine className="w-6 h-6" style={{ color: theme.secondary }} />
                      </div>
                    </div>

                    <div className="text-center">
                      <h5 className="font-serif text-lg font-bold mb-2" style={{ color: theme.secondary }}>
                        {item.name}
                      </h5>

                      {item.brand && (
                        <p className="text-sm font-medium mb-2" style={{ color: theme.accent }}>
                          {item.brand}
                        </p>
                      )}

                      {item.description && (
                        <p className="text-gray-600 text-sm leading-relaxed mb-3">
                          {item.description}
                        </p>
                      )}

                      {item.isAlcoholic && (
                        <span className="inline-block text-xs px-3 py-1 rounded-full shadow-sm"
                              style={{
                                backgroundColor: `${theme.secondary}15`,
                                color: theme.secondary
                              }}>
                          🍷 Alkoholický
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Dietary Info Legend */}
        {content.showDietaryInfo && hasMenuItems && (
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Leaf className="w-5 h-5 text-green-600" />
                <span>Vegetariánské</span>
              </div>
              <div className="flex items-center gap-2">
                <Leaf className="w-5 h-5 text-green-700 fill-current" />
                <span>Veganské</span>
              </div>
              <div className="flex items-center gap-2">
                <Wheat className="w-5 h-5 text-blue-600" />
                <span>Bezlepkové</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

