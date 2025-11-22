'use client'

import React, { useState, useEffect } from 'react'
import { Section } from './Section'
import { Heading, SubHeading } from './Typography'
import { MenuContent } from '@/types/wedding-website'
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
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        })) as MenuItem[]

        // Load drink items for this wedding
        const drinksQuery = query(
          collection(db, 'drinkItems'),
          where('weddingId', '==', weddingId)
        )
        const drinksSnapshot = await getDocs(drinksQuery)

        const drinks = drinksSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        })) as DrinkItem[]

        console.log('🍽️ Noir & Blanc - Loaded menu items:', items.length, 'drinks:', drinks.length)
        console.log('🍽️ Noir & Blanc - Menu items:', items)
        console.log('🍽️ Noir & Blanc - Drink items:', drinks)
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
      <Section id="menu" className="bg-white border-t border-black">
        <div className="text-center">
          <p className="text-black/60">Načítání menu...</p>
        </div>
      </Section>
    )
  }

  // Filter menu items based on content settings
  const filteredMenuItems = menuItems.filter(item => {
    if (item.category === 'appetizer' && !content.showAppetizers) return false
    if (item.category === 'dessert' && !content.showDesserts) return false
    if (item.category === 'side-dish' && !content.showSideDishes) return false
    return true
  })

  const filteredDrinkItems = content.showDrinks ? drinkItems : []

  // Group food items by category
  const appetizers = filteredMenuItems.filter(item => item.category === 'appetizer')
  const soups = filteredMenuItems.filter(item => item.category === 'soup')
  const mains = filteredMenuItems.filter(item => item.category === 'main-course')
  const desserts = filteredMenuItems.filter(item => item.category === 'dessert')
  const sides = filteredMenuItems.filter(item => item.category === 'side-dish')

  const hasMenuItems = filteredMenuItems.length > 0
  const hasDrinkItems = filteredDrinkItems.length > 0

  console.log('🍽️ Noir & Blanc - Rendering:', {
    enabled: content.enabled,
    loading,
    hasMenuItems,
    hasDrinkItems,
    appetizersCount: appetizers.length,
    soupsCount: soups.length,
    mainsCount: mains.length,
    dessertsCount: desserts.length,
    sidesCount: sides.length,
    drinksCount: filteredDrinkItems.length,
    showAppetizers: content.showAppetizers,
    showDesserts: content.showDesserts,
    showSideDishes: content.showSideDishes,
    showDrinks: content.showDrinks
  })

  if (!hasMenuItems && !hasDrinkItems) {
    console.log('🍽️ Noir & Blanc - No items to display, returning null')
    return null
  }

  return (
    <Section id="menu" className="bg-white border-t border-black">
      <div className="text-center mb-16">
        <Heading>{content.title || 'Menu'}</Heading>
        {content.description && (
          <p className="text-black/70 mt-4 max-w-2xl mx-auto">{content.description}</p>
        )}
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Food Section - Two Columns */}
        {hasMenuItems && (
          <div className="mb-16">
            <div className="font-serif text-4xl mb-12 italic text-center">Jídlo</div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              {/* Left Column: Appetizers + Soups */}
              <div className="space-y-12">
                {appetizers.length > 0 && (
                  <div>
                    <h4 className="font-sans font-bold uppercase tracking-widest mb-6 text-center border-b border-black pb-4">Předkrmy</h4>
                    <div className="space-y-6">
                      {appetizers.map((item) => (
                        <div key={item.id}>
                          <h5 className="font-serif text-xl">{item.name}</h5>
                          {item.description && (
                            <p className="font-light opacity-70 text-sm">{item.description}</p>
                          )}
                          {content.showDietaryInfo && (
                            <div className="text-[10px] uppercase tracking-widest text-black/40 mt-1">
                              {[
                                item.isVegetarian && 'Vegetariánské',
                                item.isVegan && 'Veganské',
                                item.isGlutenFree && 'Bezlepkové'
                              ].filter(Boolean).join(', ')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {soups.length > 0 && (
                  <div>
                    <h4 className="font-sans font-bold uppercase tracking-widest mb-6 text-center border-b border-black pb-4">Polévky</h4>
                    <div className="space-y-6">
                      {soups.map((item) => (
                        <div key={item.id}>
                          <h5 className="font-serif text-xl">{item.name}</h5>
                          {item.description && (
                            <p className="font-light opacity-70 text-sm">{item.description}</p>
                          )}
                          {content.showDietaryInfo && (
                            <div className="text-[10px] uppercase tracking-widest text-black/40 mt-1">
                              {[
                                item.isVegetarian && 'Vegetariánské',
                                item.isVegan && 'Veganské',
                                item.isGlutenFree && 'Bezlepkové'
                              ].filter(Boolean).join(', ')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Main Courses + Desserts */}
              <div className="space-y-12">
                {mains.length > 0 && (
                  <div>
                    <h4 className="font-sans font-bold uppercase tracking-widest mb-6 text-center border-b border-black pb-4">Hlavní chody</h4>
                    <div className="space-y-6">
                      {mains.map((item) => (
                        <div key={item.id}>
                          <h5 className="font-serif text-xl">{item.name}</h5>
                          {item.description && (
                            <p className="font-light opacity-70 text-sm">{item.description}</p>
                          )}
                          {content.showDietaryInfo && (
                            <div className="text-[10px] uppercase tracking-widest text-black/40 mt-1">
                              {[
                                item.isVegetarian && 'Vegetariánské',
                                item.isVegan && 'Veganské',
                                item.isGlutenFree && 'Bezlepkové'
                              ].filter(Boolean).join(', ')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {desserts.length > 0 && (
                  <div>
                    <h4 className="font-sans font-bold uppercase tracking-widest mb-6 text-center border-b border-black pb-4">Dezerty</h4>
                    <div className="space-y-6">
                      {desserts.map((item) => (
                        <div key={item.id}>
                          <h5 className="font-serif text-xl">{item.name}</h5>
                          {item.description && (
                            <p className="font-light opacity-70 text-sm">{item.description}</p>
                          )}
                          {content.showDietaryInfo && (
                            <div className="text-[10px] uppercase tracking-widest text-black/40 mt-1">
                              {[
                                item.isVegetarian && 'Vegetariánské',
                                item.isVegan && 'Veganské',
                                item.isGlutenFree && 'Bezlepkové'
                              ].filter(Boolean).join(', ')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {sides.length > 0 && (
                  <div>
                    <h4 className="font-sans font-bold uppercase tracking-widest mb-6 text-center border-b border-black pb-4">Přílohy</h4>
                    <div className="space-y-6">
                      {sides.map((item) => (
                        <div key={item.id}>
                          <h5 className="font-serif text-xl">{item.name}</h5>
                          {item.description && (
                            <p className="font-light opacity-70 text-sm">{item.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Drinks Section - Full Width */}
        {hasDrinkItems && (
          <div className="border-t border-black pt-16">
            <div className="font-serif text-4xl mb-12 italic text-center">Nápoje</div>
            <div className="max-w-3xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                {filteredDrinkItems.map((item) => (
                  <div key={item.id}>
                    <h5 className="font-serif text-xl">{item.name}</h5>
                    {item.description && (
                      <p className="font-light opacity-70 text-sm">{item.description}</p>
                    )}
                    {item.brand && (
                      <div className="text-[10px] uppercase tracking-widest text-black/40 mt-1">
                        {item.brand}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Section>
  )
}

