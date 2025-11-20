'use client'

import { MenuContent } from '@/types/wedding-website'
import SectionTitle from './SectionTitle'
import { UtensilsCrossed, Wine } from 'lucide-react'

interface MenuSectionProps {
  content: MenuContent
}

export default function MenuSection({ content }: MenuSectionProps) {
  if (!content.enabled) {
    return null
  }

  const items = content.items || []

  // Separate food and drinks
  const foodItems = items.filter(item =>
    item.category === 'appetizer' ||
    item.category === 'soup' ||
    item.category === 'main' ||
    item.category === 'dessert' ||
    item.category === 'other'
  )
  const drinkItems = items.filter(item => item.category === 'drink')

  const hasFoodItems = foodItems.length > 0
  const hasDrinkItems = drinkItems.length > 0

  if (!hasFoodItems && !hasDrinkItems) {
    return null
  }

  // Category labels in Czech
  const getCategoryLabel = (category: string): string => {
    const labels: Record<string, string> = {
      'appetizer': 'Předkrm',
      'soup': 'Polévka',
      'main': 'Hlavní chod',
      'dessert': 'Dezert',
      'drink': 'Nápoj',
      'other': 'Ostatní'
    }
    return labels[category] || category
  }

  return (
    <div id="menu" className="py-20 bg-white">
      <SectionTitle title={content.title || "Svatební menu"} />

      {content.description && (
        <p className="text-center text-gray-600 max-w-2xl mx-auto mb-12 px-4" style={{ fontFamily: 'Muli, sans-serif' }}>
          {content.description}
        </p>
      )}

      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Food Menu */}
            {hasFoodItems && (
              <div>
                <div className="flex items-center justify-center gap-3 mb-8">
                  <UtensilsCrossed className="w-6 h-6 text-[#85aaba]" />
                  <h3 className="text-3xl text-gray-800" style={{ fontFamily: 'Great Vibes, cursive' }}>
                    Jídlo
                  </h3>
                </div>

                <div className="space-y-6">
                  {foodItems.map((item) => (
                    <div key={item.id} className="border-b border-[#b2c9d3]/30 pb-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-xl text-gray-800 font-medium" style={{ fontFamily: 'Muli, sans-serif' }}>
                          {item.name}
                        </h4>
                        {content.showCategories && (
                          <span className="text-sm text-[#85aaba] uppercase tracking-wider" style={{ fontFamily: 'Muli, sans-serif' }}>
                            {getCategoryLabel(item.category)}
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-gray-600 text-sm" style={{ fontFamily: 'Muli, sans-serif' }}>
                          {item.description}
                        </p>
                      )}
                      {content.showDietaryInfo && item.dietaryInfo && item.dietaryInfo.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {item.dietaryInfo.map((info, idx) => (
                            <span key={idx} className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                              {info}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Drinks Menu */}
            {hasDrinkItems && (
              <div>
                <div className="flex items-center justify-center gap-3 mb-8">
                  <Wine className="w-6 h-6 text-[#85aaba]" />
                  <h3 className="text-3xl text-gray-800" style={{ fontFamily: 'Great Vibes, cursive' }}>
                    Nápoje
                  </h3>
                </div>

                <div className="space-y-6">
                  {drinkItems.map((item) => (
                    <div key={item.id} className="border-b border-[#b2c9d3]/30 pb-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-xl text-gray-800 font-medium" style={{ fontFamily: 'Muli, sans-serif' }}>
                          {item.name}
                        </h4>
                      </div>
                      {item.description && (
                        <p className="text-gray-600 text-sm" style={{ fontFamily: 'Muli, sans-serif' }}>
                          {item.description}
                        </p>
                      )}
                      {content.showDietaryInfo && item.dietaryInfo && item.dietaryInfo.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {item.dietaryInfo.map((info, idx) => (
                            <span key={idx} className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                              {info}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>


        </div>
      </div>
    </div>
  )
}

