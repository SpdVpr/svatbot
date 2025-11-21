'use client'

import { MenuContent } from '@/types/wedding-website'
import SectionTitle from './SectionTitle'
import { UtensilsCrossed, Wine } from 'lucide-react'
import { useState, useEffect } from 'react'
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { MenuItem, DrinkItem } from '@/types/menu'

interface MenuSectionProps {
  content: MenuContent
  websiteId: string
}

export default function MenuSection({ content, websiteId }: MenuSectionProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [drinkItems, setDrinkItems] = useState<DrinkItem[]>([])
  const [loading, setLoading] = useState(true)

  // Load menu items for this wedding website (public access)
  useEffect(() => {
    const loadMenuItems = async () => {
      try {
        setLoading(true)

        // First, get the weddingId from the website
        const websiteRef = doc(db, 'weddingWebsites', websiteId)
        const websiteSnap = await getDoc(websiteRef)

        if (!websiteSnap.exists()) {
          console.log('Website not found')
          setLoading(false)
          return
        }

        const weddingId = websiteSnap.data().weddingId

        if (!weddingId) {
          console.log('No weddingId in website')
          setLoading(false)
          return
        }

        // Load menu items for this wedding
        const menuQuery = query(
          collection(db, 'menuItems'),
          where('weddingId', '==', weddingId)
        )
        const menuSnapshot = await getDocs(menuQuery)
        const items = menuSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date()
        })) as MenuItem[]

        // Load drink items for this wedding
        const drinkQuery = query(
          collection(db, 'drinkItems'),
          where('weddingId', '==', weddingId)
        )
        const drinkSnapshot = await getDocs(drinkQuery)
        const drinks = drinkSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date()
        })) as DrinkItem[]

        console.log('🍽️ Loaded menu items:', items.length, 'drinks:', drinks.length)
        setMenuItems(items)
        setDrinkItems(drinks)
      } catch (error) {
        console.error('Error loading menu items:', error)
      } finally {
        setLoading(false)
      }
    }

    if (websiteId) {
      loadMenuItems()
    }
  }, [websiteId])

  if (!content.enabled) {
    return null
  }

  if (loading) {
    return (
      <div id="menu" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-gray-600">Načítání menu...</p>
          </div>
        </div>
      </div>
    )
  }

  // Filter menu items by category
  const appetizers = menuItems.filter(item => item.category === 'appetizer')
  const soups = menuItems.filter(item => item.category === 'soup')
  const mainCourses = menuItems.filter(item => item.category === 'main-course')
  const sideDishes = menuItems.filter(item => item.category === 'side-dish')
  const desserts = menuItems.filter(item => item.category === 'dessert')

  // Combine all food items
  const foodItems = [...appetizers, ...soups, ...mainCourses, ...sideDishes, ...desserts]

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
                      {content.showDietaryInfo && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {item.isVegetarian && (
                            <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                              Vegetariánské
                            </span>
                          )}
                          {item.isVegan && (
                            <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                              Veganské
                            </span>
                          )}
                          {item.isGlutenFree && (
                            <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                              Bezlepkové
                            </span>
                          )}
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
                      {content.showDietaryInfo && item.isAlcoholic && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          <span className="inline-block px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded">
                            Alkoholické
                          </span>
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

