'use client'

import { MenuContent } from '@/types/wedding-website'
import SectionTitle from './SectionTitle'
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

  if (!content.enabled) return null

  if (loading) {
    return (
      <section className="py-20" style={{ background: 'linear-gradient(to bottom, #ffffff 0%, #faf8f3 100%)' }}>
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-gray-600">Načítání menu...</p>
          </div>
        </div>
      </section>
    )
  }

  // Filter menu items by category
  const appetizers = menuItems.filter(item => item.category === 'appetizer')
  const soups = menuItems.filter(item => item.category === 'soup')
  const mainCourses = menuItems.filter(item => item.category === 'main-course')
  const sideDishes = menuItems.filter(item => item.category === 'side-dish')
  const desserts = menuItems.filter(item => item.category === 'dessert')

  // Main courses and soups are ALWAYS shown if they exist
  const hasAppetizers = appetizers.length > 0 && (content.showAppetizers === true)
  const hasSoups = soups.length > 0  // Always show if exists
  const hasMainCourses = mainCourses.length > 0  // Always show if exists
  const hasSideDishes = sideDishes.length > 0 && (content.showSideDishes === true)
  const hasDesserts = desserts.length > 0 && (content.showDesserts === true)
  const hasDrinks = drinkItems.length > 0 && (content.showDrinks === true)

  return (
    <section id="menu" className="py-20 relative" style={{ background: 'linear-gradient(to bottom, #ffffff 0%, #faf8f3 100%)' }}>
      {/* Decorative Elements */}
      <div
        className="absolute left-0 top-20 w-24 h-24 opacity-20 hidden lg:block"
        style={{
          backgroundImage: 'url(/templates/pretty/images/rsvp-left-flower.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center'
        }}
      />
      <div
        className="absolute right-0 bottom-20 w-24 h-24 opacity-20 hidden lg:block"
        style={{
          backgroundImage: 'url(/templates/pretty/images/rsvp-right-flower.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center'
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
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
                      {content.showDietaryInfo && (
                        <p className="text-xs text-gray-500 mt-1">
                          {[
                            item.isVegetarian && 'Vegetariánské',
                            item.isVegan && 'Veganské',
                            item.isGlutenFree && 'Bezlepkové'
                          ].filter(Boolean).join(', ')}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Soups */}
            {hasSoups && (
              <div className="bg-white p-8 rounded-lg shadow-lg">
                <h3
                  className="text-3xl mb-6 text-center"
                  style={{ fontFamily: 'Great Vibes, cursive', color: '#b19a56' }}
                >
                  Polévky
                </h3>
                <ul className="space-y-4">
                  {soups.map((item) => (
                    <li key={item.id} className="border-b border-gray-200 pb-3">
                      <h4 className="font-semibold text-gray-800">{item.name}</h4>
                      {item.description && (
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      )}
                      {content.showDietaryInfo && (
                        <p className="text-xs text-gray-500 mt-1">
                          {[
                            item.isVegetarian && 'Vegetariánské',
                            item.isVegan && 'Veganské',
                            item.isGlutenFree && 'Bezlepkové'
                          ].filter(Boolean).join(', ')}
                        </p>
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
                      {content.showDietaryInfo && (
                        <p className="text-xs text-gray-500 mt-1">
                          {[
                            item.isVegetarian && 'Vegetariánské',
                            item.isVegan && 'Veganské',
                            item.isGlutenFree && 'Bezlepkové'
                          ].filter(Boolean).join(', ')}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Side Dishes */}
            {hasSideDishes && (
              <div className="bg-white p-8 rounded-lg shadow-lg">
                <h3
                  className="text-3xl mb-6 text-center"
                  style={{ fontFamily: 'Great Vibes, cursive', color: '#b19a56' }}
                >
                  Přílohy
                </h3>
                <ul className="space-y-4">
                  {sideDishes.map((item) => (
                    <li key={item.id} className="border-b border-gray-200 pb-3">
                      <h4 className="font-semibold text-gray-800">{item.name}</h4>
                      {item.description && (
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      )}
                      {content.showDietaryInfo && (
                        <p className="text-xs text-gray-500 mt-1">
                          {[
                            item.isVegetarian && 'Vegetariánské',
                            item.isVegan && 'Veganské',
                            item.isGlutenFree && 'Bezlepkové'
                          ].filter(Boolean).join(', ')}
                        </p>
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
                      {content.showDietaryInfo && (
                        <p className="text-xs text-gray-500 mt-1">
                          {[
                            item.isVegetarian && 'Vegetariánské',
                            item.isVegan && 'Veganské',
                            item.isGlutenFree && 'Bezlepkové'
                          ].filter(Boolean).join(', ')}
                        </p>
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
                  {drinkItems.map((item) => (
                    <li key={item.id} className="border-b border-gray-200 pb-3">
                      <h4 className="font-semibold text-gray-800">{item.name}</h4>
                      {item.description && (
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      )}
                      {content.showDietaryInfo && item.isAlcoholic && (
                        <p className="text-xs text-gray-500 mt-1">Alkoholické</p>
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

