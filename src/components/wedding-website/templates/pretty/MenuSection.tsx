'use client'

import { MenuContent } from '@/types/wedding-website'
import SectionTitle from './SectionTitle'

interface MenuSectionProps {
  content: MenuContent
}

export default function MenuSection({ content }: MenuSectionProps) {
  if (!content.enabled || !content.items || content.items.length === 0) return null

  const appetizers = content.items.filter(item => item.category === 'appetizer')
  const soups = content.items.filter(item => item.category === 'soup')
  const mainCourses = content.items.filter(item => item.category === 'main')
  const desserts = content.items.filter(item => item.category === 'dessert')
  const drinks = content.items.filter(item => item.category === 'drink')

  const hasAppetizers = appetizers.length > 0
  const hasSoups = soups.length > 0
  const hasMainCourses = mainCourses.length > 0
  const hasDesserts = desserts.length > 0 && content.showDesserts
  const hasDrinks = drinks.length > 0 && content.showDrinks

  return (
    <section className="py-20" style={{ background: 'linear-gradient(to bottom, #ffffff 0%, #faf8f3 100%)' }}>
      <div className="container mx-auto px-4">
        <SectionTitle title={content.title || "Jídlo a pití"} subtitle={content.description} />

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Appetizers */}
            {hasAppetizers && (
              <div className="bg-white p-8 rounded-lg shadow-lg">
                <h3
                  className="text-3xl mb-6 text-center"
                  style={{ fontFamily: 'Great Vibes, cursive', color: '#b19a56' }}
                >
                  Předkrmy
                </h3>
                <ul className="space-y-4">
                  {appetizers.map((item) => (
                    <li key={item.id} className="border-b border-gray-200 pb-3">
                      <h4 className="font-semibold text-gray-800">{item.name}</h4>
                      {item.description && (
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      )}
                      {content.showDietaryInfo && item.dietaryInfo && item.dietaryInfo.length > 0 && (
                        <p className="text-xs text-gray-500 mt-1">{item.dietaryInfo.join(', ')}</p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Main Courses */}
            {hasMainCourses && (
              <div className="bg-white p-8 rounded-lg shadow-lg">
                <h3
                  className="text-3xl mb-6 text-center"
                  style={{ fontFamily: 'Great Vibes, cursive', color: '#b19a56' }}
                >
                  Hlavní chody
                </h3>
                <ul className="space-y-4">
                  {mainCourses.map((item) => (
                    <li key={item.id} className="border-b border-gray-200 pb-3">
                      <h4 className="font-semibold text-gray-800">{item.name}</h4>
                      {item.description && (
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      )}
                      {content.showDietaryInfo && item.dietaryInfo && item.dietaryInfo.length > 0 && (
                        <p className="text-xs text-gray-500 mt-1">{item.dietaryInfo.join(', ')}</p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Desserts */}
            {hasDesserts && (
              <div className="bg-white p-8 rounded-lg shadow-lg">
                <h3
                  className="text-3xl mb-6 text-center"
                  style={{ fontFamily: 'Great Vibes, cursive', color: '#b19a56' }}
                >
                  Dezerty
                </h3>
                <ul className="space-y-4">
                  {desserts.map((item) => (
                    <li key={item.id} className="border-b border-gray-200 pb-3">
                      <h4 className="font-semibold text-gray-800">{item.name}</h4>
                      {item.description && (
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      )}
                      {content.showDietaryInfo && item.dietaryInfo && item.dietaryInfo.length > 0 && (
                        <p className="text-xs text-gray-500 mt-1">{item.dietaryInfo.join(', ')}</p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Drinks */}
            {hasDrinks && (
              <div className="bg-white p-8 rounded-lg shadow-lg">
                <h3
                  className="text-3xl mb-6 text-center"
                  style={{ fontFamily: 'Great Vibes, cursive', color: '#b19a56' }}
                >
                  Nápoje
                </h3>
                <ul className="space-y-4">
                  {drinks.map((item) => (
                    <li key={item.id} className="border-b border-gray-200 pb-3">
                      <h4 className="font-semibold text-gray-800">{item.name}</h4>
                      {item.description && (
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      )}
                      {content.showDietaryInfo && item.dietaryInfo && item.dietaryInfo.length > 0 && (
                        <p className="text-xs text-gray-500 mt-1">{item.dietaryInfo.join(', ')}</p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Notes */}
          {content.description && (
            <div className="mt-8 p-6 rounded-lg text-center" style={{ backgroundColor: '#faf8f3' }}>
              <p className="text-gray-700 leading-relaxed">
                {content.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

