'use client'

import { useState, useEffect } from 'react'
import { UtensilsCrossed, Download, Eye, EyeOff, Info } from 'lucide-react'
import { FOOD_CATEGORY_LABELS, DRINK_CATEGORY_LABELS } from '@/types/menu'
import type { MenuContent } from '@/types/wedding-website'
import type { MenuItem, DrinkItem } from '@/types/menu'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { useWeddingStore } from '@/stores/weddingStore'

interface MenuSectionEditorProps {
  content?: MenuContent
  onChange: (content: MenuContent) => void
}

export default function MenuSectionEditor({ content, onChange }: MenuSectionEditorProps) {
  const { currentWedding: wedding } = useWeddingStore()
  const [importing, setImporting] = useState(false)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [drinkItems, setDrinkItems] = useState<DrinkItem[]>([])
  const [loading, setLoading] = useState(false)
  const [dataLoaded, setDataLoaded] = useState(false)

  // Use content directly from props, no local state needed
  const currentContent: MenuContent = {
    enabled: content?.enabled || false,
    title: content?.title || 'Svatební menu',
    description: content?.description || 'Připravili jsme pro vás výběr chutných jídel a nápojů.',
    showCategories: content?.showCategories ?? true,
    showDietaryInfo: content?.showDietaryInfo ?? true,
    showDrinks: content?.showDrinks ?? true,
    showSideDishes: content?.showSideDishes ?? true,
    showDesserts: content?.showDesserts ?? true
  }

  const updateContent = (updates: Partial<MenuContent>) => {
    const newContent = { ...currentContent, ...updates }
    onChange(newContent)
  }

  const loadMenuData = async () => {
    if (!wedding?.id) return

    try {
      setLoading(true)

      // Load menu items
      const menuQuery = query(
        collection(db, 'menuItems'),
        where('weddingId', '==', wedding.id)
      )
      const menuSnapshot = await getDocs(menuQuery)
      const items = menuSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as MenuItem[]
      setMenuItems(items)

      // Load drink items
      const drinkQuery = query(
        collection(db, 'drinkItems'),
        where('weddingId', '==', wedding.id)
      )
      const drinkSnapshot = await getDocs(drinkQuery)
      const drinks = drinkSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as DrinkItem[]
      setDrinkItems(drinks)

      // Convert to MenuItem[] format for content.items
      const convertedItems: any[] = [
        ...items.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description,
          category: item.category,
          dietaryInfo: [
            ...(item.isVegetarian ? ['Vegetariánské'] : []),
            ...(item.isVegan ? ['Veganské'] : []),
            ...(item.isGlutenFree ? ['Bezlepkové'] : [])
          ]
        })),
        ...drinks.map(drink => ({
          id: drink.id,
          name: drink.name,
          description: drink.description,
          category: 'drink' as const,
          dietaryInfo: drink.isAlcoholic ? ['Alkoholické'] : []
        }))
      ]

      // Update content with items
      updateContent({ items: convertedItems })

      setDataLoaded(true)
      setLoading(false)
    } catch (error) {
      console.error('Error loading menu data:', error)
      setLoading(false)
    }
  }

  // Load data when component mounts and auto-sync if enabled but no items
  useEffect(() => {
    if (wedding?.id && !dataLoaded) {
      loadMenuData()
    }
  }, [wedding?.id, dataLoaded])

  // Auto-sync if section is enabled but has no items
  useEffect(() => {
    if (content?.enabled && dataLoaded && (!content.items || content.items.length === 0) && (menuItems.length > 0 || drinkItems.length > 0)) {
      console.log('🍽️ Auto-syncing menu items to content...')
      const convertedItems: any[] = [
        ...menuItems.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description,
          category: item.category,
          dietaryInfo: [
            ...(item.isVegetarian ? ['Vegetariánské'] : []),
            ...(item.isVegan ? ['Veganské'] : []),
            ...(item.isGlutenFree ? ['Bezlepkové'] : [])
          ]
        })),
        ...drinkItems.map(drink => ({
          id: drink.id,
          name: drink.name,
          description: drink.description,
          category: 'drink' as const,
          dietaryInfo: drink.isAlcoholic ? ['Alkoholické'] : []
        }))
      ]
      updateContent({ items: convertedItems })
    }
  }, [content?.enabled, dataLoaded, menuItems, drinkItems])

  const handleImportFromMenu = async () => {
    setImporting(true)
    await loadMenuData()
    updateContent({ enabled: true })
    setImporting(false)
  }

  const totalItems = menuItems.length + drinkItems.length
  const stats = {
    totalMenuItems: menuItems.length,
    totalDrinkItems: drinkItems.length
  }

  return (
    <div className="space-y-6">
      {/* Enable/Disable Toggle */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-3">
          <UtensilsCrossed className="w-5 h-5 text-gray-400" />
          <div>
            <p className="font-medium text-gray-900">Zobrazit sekci Jídlo a Pití</p>
            <p className="text-sm text-gray-600">Ukázat svatební menu hostům</p>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={content?.enabled || false}
            onChange={(e) => updateContent({ enabled: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
        </label>
      </div>

      {(content?.enabled || false) && (
        <>
          {/* Import from Menu Module */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <UtensilsCrossed className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">Import z modulu Jídlo a Pití</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Máte {totalItems} položek v modulu Jídlo a Pití ({stats.totalMenuItems} jídel, {stats.totalDrinkItems} nápojů).
                  Data se automaticky synchronizují s vaším svatebním webem.
                </p>
                {totalItems === 0 && (
                  <div className="flex items-start gap-2 mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <Info className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-yellow-800">
                      Zatím nemáte žádné položky v modulu Jídlo a Pití. Přejděte do modulu a přidejte jídla a nápoje, které chcete zobrazit na webu.
                    </p>
                  </div>
                )}
              </div>
              <button
                onClick={handleImportFromMenu}
                disabled={importing || totalItems === 0}
                className="btn-secondary flex items-center gap-2 whitespace-nowrap"
              >
                <Download className="w-4 h-4" />
                {importing ? 'Importuji...' : 'Synchronizovat'}
              </button>
            </div>
          </div>

          {/* Content Settings */}
          <div className="wedding-card space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <UtensilsCrossed className="w-5 h-5 text-primary-600" />
              Nastavení obsahu
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nadpis sekce
                </label>
                <input
                  type="text"
                  value={content?.title || 'Svatební menu'}
                  onChange={(e) => updateContent({ title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Svatební menu"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Popis
                </label>
                <textarea
                  value={content?.description || 'Připravili jsme pro vás výběr chutných jídel a nápojů.'}
                  onChange={(e) => updateContent({ description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Krátký popis pro hosty..."
                />
              </div>
            </div>
          </div>

          {/* Display Options */}
          <div className="wedding-card space-y-4">
            <h3 className="font-semibold text-gray-900">Možnosti zobrazení</h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Eye className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">Zobrazit kategorie</p>
                    <p className="text-sm text-gray-600">Seskupit jídla podle kategorií (předkrmy, hlavní jídla, atd.)</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={content?.showCategories ?? true}
                    onChange={(e) => updateContent({ showCategories: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Info className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">Zobrazit dietní informace</p>
                    <p className="text-sm text-gray-600">Ukázat ikony pro vegetariánské, veganské a bezlepkové pokrmy</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={content?.showDietaryInfo ?? true}
                    onChange={(e) => updateContent({ showDietaryInfo: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <UtensilsCrossed className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">Zobrazit přílohy</p>
                    <p className="text-sm text-gray-600">Ukázat přílohy v menu</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={content?.showSideDishes ?? true}
                    onChange={(e) => updateContent({ showSideDishes: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <UtensilsCrossed className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">Zobrazit dezerty</p>
                    <p className="text-sm text-gray-600">Ukázat dezerty v menu</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={content?.showDesserts ?? true}
                    onChange={(e) => updateContent({ showDesserts: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <UtensilsCrossed className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">Zobrazit nápoje</p>
                    <p className="text-sm text-gray-600">Ukázat sekci s nápoji</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={content?.showDrinks ?? true}
                    onChange={(e) => updateContent({ showDrinks: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Preview */}
          {totalItems > 0 && (
            <div className="wedding-card">
              <h3 className="font-semibold text-gray-900 mb-4">Náhled dat</h3>
              
              <div className="space-y-4">
                {/* Food Items Preview */}
                {menuItems.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Jídla ({menuItems.length})</h4>
                    <div className="space-y-2">
                      {menuItems.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          <UtensilsCrossed className="w-4 h-4 text-gray-400 mt-1" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900">{item.name}</p>
                            <p className="text-sm text-gray-600">{FOOD_CATEGORY_LABELS[item.category]}</p>
                            {(content?.showDietaryInfo ?? true) && (
                              <div className="flex gap-2 mt-1">
                                {item.isVegetarian && (
                                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Vegetariánské</span>
                                )}
                                {item.isVegan && (
                                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Veganské</span>
                                )}
                                {item.isGlutenFree && (
                                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Bezlepkové</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      {menuItems.length > 3 && (
                        <p className="text-sm text-gray-500 text-center">... a dalších {menuItems.length - 3} položek</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Drink Items Preview */}
                {(content?.showDrinks ?? true) && drinkItems.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Nápoje ({drinkItems.length})</h4>
                    <div className="space-y-2">
                      {drinkItems.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          <UtensilsCrossed className="w-4 h-4 text-gray-400 mt-1" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900">{item.name}</p>
                            <p className="text-sm text-gray-600">{DRINK_CATEGORY_LABELS[item.category]}</p>
                            {item.isAlcoholic && (
                              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded mt-1 inline-block">Alkoholické</span>
                            )}
                          </div>
                        </div>
                      ))}
                      {drinkItems.length > 3 && (
                        <p className="text-sm text-gray-500 text-center">... a dalších {drinkItems.length - 3} položek</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
