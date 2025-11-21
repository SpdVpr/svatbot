'use client'

import { useColorTheme } from '../ColorThemeContext'
import { MenuContent } from '@/types/wedding-website'
import { Utensils, Wine, Coffee, Leaf, Wheat } from 'lucide-react'
import { useState, useEffect } from 'react'
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { MenuItem, DrinkItem } from '@/types/menu'

interface MenuSectionProps {
  content: MenuContent
  websiteId: string
}

export default function MenuSection({ content, websiteId }: MenuSectionProps) {
  const { theme } = useColorTheme()
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [drinkItems, setDrinkItems] = useState<DrinkItem[]>([])
  const [loading, setLoading] = useState(true)

  // Debug logging
  console.log('🍽️ MenuSection render:', {
    websiteId,
    enabled: content.enabled,
    contentKeys: Object.keys(content),
    content: content
  })

  // Load menu items for this wedding website (public access)
  useEffect(() => {
    const loadMenuItems = async () => {
      try {
        console.log('🍽️ MenuSection: Starting to load menu items for websiteId:', websiteId)
        setLoading(true)

        // First, get the weddingId from the website
        const websiteRef = doc(db, 'weddingWebsites', websiteId)
        const websiteSnap = await getDoc(websiteRef)

        if (!websiteSnap.exists()) {
          console.log('🍽️ MenuSection: Website not found:', websiteId)
          setLoading(false)
          return
        }

        const weddingId = websiteSnap.data().weddingId
        console.log('🍽️ MenuSection: Found weddingId:', weddingId)

        if (!weddingId) {
          console.log('🍽️ MenuSection: No weddingId in website')
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

        console.log('🍽️ MenuSection: Loaded menu items:', items.length, 'drinks:', drinks.length)
        console.log('🍽️ MenuSection: Menu items:', items)
        console.log('🍽️ MenuSection: Drink items:', drinks)
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
    console.log('🍽️ MenuSection: Section is DISABLED, returning null')
    return null
  }

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

  console.log('🍽️ MenuSection: Rendering section', {
    enabled: content.enabled,
    loading,
    hasMenuItems,
    hasDrinkItems,
    filteredMenuItemsCount: filteredMenuItems.length,
    drinkItemsCount: drinkItems.length,
    showDrinks: content.showDrinks
  })

  return (
    <section id="menu" className="py-20 bg-stone-50">
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

