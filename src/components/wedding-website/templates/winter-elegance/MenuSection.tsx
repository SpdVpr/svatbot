'use client'

import { useColorTheme } from '../ColorThemeContext'
import { MenuContent } from '@/types/wedding-website'
import { Utensils, Wine, Coffee, Leaf, Wheat } from 'lucide-react'
import { useMenu } from '@/hooks/useMenu'

interface MenuSectionProps {
  content: MenuContent
}

export default function MenuSection({ content }: MenuSectionProps) {
  const { theme } = useColorTheme()
  const { menuItems, drinkItems, loading } = useMenu()

  if (!content.enabled) return null

  if (loading) {
    return (
      <section className="py-20 bg-stone-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center">
            <p className="text-stone-600">Načítání menu...</p>
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

  // Group menu items by category
  const appetizers = filteredMenuItems.filter(item => item.category === 'appetizer')
  const soups = filteredMenuItems.filter(item => item.category === 'soup')
  const mains = filteredMenuItems.filter(item => item.category === 'main-course')
  const desserts = filteredMenuItems.filter(item => item.category === 'dessert')
  const sideDishes = filteredMenuItems.filter(item => item.category === 'side-dish')

  const hasMenuItems = filteredMenuItems.length > 0
  const hasDrinkItems = content.showDrinks && drinkItems.length > 0

  return (
    <section className="py-20 bg-stone-50">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-light text-stone-900 mb-6">
            {content.title || 'Svatební menu'}
          </h2>
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-stone-400 to-transparent mx-auto mb-8"></div>
          {content.description && (
            <p className="text-xl text-stone-600 leading-relaxed max-w-3xl mx-auto">
              {content.description}
            </p>
          )}
        </div>

        {/* Menu Content */}
        <div className="max-w-4xl mx-auto">
          {hasMenuItems || hasDrinkItems ? (
            <div className="space-y-12">
              {/* Předkrmy */}
              {appetizers.length > 0 && (
                <div className="bg-white rounded-2xl p-8 md:p-10 shadow-lg">
                  <div className="flex items-center justify-center gap-3 mb-8">
                    <Utensils className="w-6 h-6 text-stone-600" />
                    <h3 className="text-2xl font-serif font-light text-stone-900">Předkrmy</h3>
                  </div>
                  <div className="space-y-6">
                    {appetizers.map((item) => (
                      <div key={item.id} className="border-b border-stone-200 last:border-0 pb-6 last:pb-0">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-lg font-medium text-stone-900">{item.name}</h4>
                          {content.showDietaryInfo && (
                            <div className="flex gap-2 ml-2">
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
                                <span className="text-amber-600" title="Bezlepkové">
                                  <Wheat className="w-4 h-4" />
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-stone-600 text-sm leading-relaxed">{item.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Polévky */}
              {soups.length > 0 && (
                <div className="bg-white rounded-2xl p-8 md:p-10 shadow-lg">
                  <div className="flex items-center justify-center gap-3 mb-8">
                    <Utensils className="w-6 h-6 text-stone-600" />
                    <h3 className="text-2xl font-serif font-light text-stone-900">Polévky</h3>
                  </div>
                  <div className="space-y-6">
                    {soups.map((item) => (
                      <div key={item.id} className="border-b border-stone-200 last:border-0 pb-6 last:pb-0">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-lg font-medium text-stone-900">{item.name}</h4>
                          {content.showDietaryInfo && (
                            <div className="flex gap-2 ml-2">
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
                                <span className="text-amber-600" title="Bezlepkové">
                                  <Wheat className="w-4 h-4" />
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-stone-600 text-sm leading-relaxed">{item.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hlavní chody */}
              {mains.length > 0 && (
                <div className="bg-white rounded-2xl p-8 md:p-10 shadow-lg">
                  <div className="flex items-center justify-center gap-3 mb-8">
                    <Utensils className="w-6 h-6 text-stone-600" />
                    <h3 className="text-2xl font-serif font-light text-stone-900">Hlavní chody</h3>
                  </div>
                  <div className="space-y-6">
                    {mains.map((item) => (
                      <div key={item.id} className="border-b border-stone-200 last:border-0 pb-6 last:pb-0">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-lg font-medium text-stone-900">{item.name}</h4>
                          {content.showDietaryInfo && (
                            <div className="flex gap-2 ml-2">
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
                                <span className="text-amber-600" title="Bezlepkové">
                                  <Wheat className="w-4 h-4" />
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-stone-600 text-sm leading-relaxed">{item.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Přílohy */}
              {content.showSideDishes && sideDishes.length > 0 && (
                <div className="bg-white rounded-2xl p-8 md:p-10 shadow-lg">
                  <div className="flex items-center justify-center gap-3 mb-8">
                    <Utensils className="w-6 h-6 text-stone-600" />
                    <h3 className="text-2xl font-serif font-light text-stone-900">Přílohy</h3>
                  </div>
                  <div className="space-y-6">
                    {sideDishes.map((item) => (
                      <div key={item.id} className="border-b border-stone-200 last:border-0 pb-6 last:pb-0">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-lg font-medium text-stone-900">{item.name}</h4>
                          {content.showDietaryInfo && (
                            <div className="flex gap-2 ml-2">
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
                                <span className="text-amber-600" title="Bezlepkové">
                                  <Wheat className="w-4 h-4" />
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-stone-600 text-sm leading-relaxed">{item.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Dezerty */}
              {content.showDesserts && desserts.length > 0 && (
                <div className="bg-white rounded-2xl p-8 md:p-10 shadow-lg">
                  <div className="flex items-center justify-center gap-3 mb-8">
                    <Coffee className="w-6 h-6 text-stone-600" />
                    <h3 className="text-2xl font-serif font-light text-stone-900">Dezerty</h3>
                  </div>
                  <div className="space-y-6">
                    {desserts.map((item) => (
                      <div key={item.id} className="border-b border-stone-200 last:border-0 pb-6 last:pb-0">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-lg font-medium text-stone-900">{item.name}</h4>
                          {content.showDietaryInfo && (
                            <div className="flex gap-2 ml-2">
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
                                <span className="text-amber-600" title="Bezlepkové">
                                  <Wheat className="w-4 h-4" />
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-stone-600 text-sm leading-relaxed">{item.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Nápoje */}
              {hasDrinkItems && (
                <div className="bg-white rounded-2xl p-8 md:p-10 shadow-lg">
                  <div className="flex items-center justify-center gap-3 mb-8">
                    <Wine className="w-6 h-6 text-stone-600" />
                    <h3 className="text-2xl font-serif font-light text-stone-900">Nápoje</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {drinkItems.map((item) => (
                      <div key={item.id} className="border border-stone-200 rounded-xl p-6 hover:border-stone-400 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-lg font-medium text-stone-900">{item.name}</h4>
                          {item.isAlcoholic && (
                            <Wine className="w-4 h-4 text-stone-600" />
                          )}
                        </div>
                        {item.brand && (
                          <p className="text-stone-500 text-sm mb-2">{item.brand}</p>
                        )}
                        {item.description && (
                          <p className="text-stone-600 text-sm leading-relaxed">{item.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg text-center">
              <Utensils className="w-16 h-16 text-stone-400 mx-auto mb-6" />
              <p className="text-stone-600 text-lg">
                Detaily menu budou brzy k dispozici
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

