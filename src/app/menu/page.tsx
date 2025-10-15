'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useWedding } from '@/hooks/useWedding'
import { useMenu } from '@/hooks/useMenu'
import { MenuItem, DrinkItem, MenuFormData, DrinkFormData } from '@/types/menu'
import MenuItemForm from '@/components/menu/MenuItemForm'
import DrinkItemForm from '@/components/menu/DrinkItemForm'
import {
  Plus,
  UtensilsCrossed,
  Wine,
  ArrowLeft,
  Home,
  Filter,
  Search,
  Download,
  Upload,
  Edit,
  List,
  Trash2
} from 'lucide-react'
import Link from 'next/link'
import { FOOD_CATEGORY_LABELS, DRINK_CATEGORY_LABELS, FoodCategory, DrinkCategory } from '@/types/menu'

export default function MenuPage() {
  const { user } = useAuth()
  const { wedding } = useWedding()
  const { 
    menuItems, 
    drinkItems, 
    loading, 
    stats,
    createMenuItem, 
    updateMenuItem,
    deleteMenuItem,
    createDrinkItem,
    updateDrinkItem,
    deleteDrinkItem,
    error 
  } = useMenu()

  const [activeTab, setActiveTab] = useState<'food' | 'drinks'>('food')
  const [showFoodForm, setShowFoodForm] = useState(false)
  const [showDrinkForm, setShowDrinkForm] = useState(false)
  const [editingFood, setEditingFood] = useState<MenuItem | null>(null)
  const [editingDrink, setEditingDrink] = useState<DrinkItem | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [formLoading, setFormLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // Handle create/update menu item
  const handleMenuItemSubmit = async (data: MenuFormData) => {
    try {
      setFormLoading(true)
      if (editingFood) {
        await updateMenuItem(editingFood.id, data)
      } else {
        await createMenuItem(data)
      }
      setShowFoodForm(false)
      setEditingFood(null)
    } catch (error) {
      console.error('Error saving menu item:', error)
    } finally {
      setFormLoading(false)
    }
  }

  // Handle create/update drink item
  const handleDrinkItemSubmit = async (data: DrinkFormData) => {
    try {
      setFormLoading(true)
      if (editingDrink) {
        await updateDrinkItem(editingDrink.id, data)
      } else {
        await createDrinkItem(data)
      }
      setShowDrinkForm(false)
      setEditingDrink(null)
    } catch (error) {
      console.error('Error saving drink item:', error)
    } finally {
      setFormLoading(false)
    }
  }

  // Handle edit menu item
  const handleEditMenuItem = (item: MenuItem) => {
    setEditingFood(item)
    setShowFoodForm(true)
  }

  // Handle edit drink item
  const handleEditDrinkItem = (item: DrinkItem) => {
    setEditingDrink(item)
    setShowDrinkForm(true)
  }

  // Handle delete menu item
  const handleDeleteMenuItem = async (itemId: string) => {
    if (!confirm('Opravdu chcete smazat tuto položku?')) return
    try {
      await deleteMenuItem(itemId)
    } catch (error) {
      console.error('Error deleting menu item:', error)
    }
  }

  // Handle delete drink item
  const handleDeleteDrinkItem = async (itemId: string) => {
    if (!confirm('Opravdu chcete smazat tento nápoj?')) return
    try {
      await deleteDrinkItem(itemId)
    } catch (error) {
      console.error('Error deleting drink item:', error)
    }
  }

  // Check authentication
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Přihlaste se prosím</h2>
          <p className="text-gray-600 mb-4">Pro přístup k menu musíte být přihlášeni</p>
          <Link href="/" className="btn-primary">
            Přejít na hlavní stránku
          </Link>
        </div>
      </div>
    )
  }

  // Filter items based on search and category
  const filteredMenuItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const filteredDrinkItems = drinkItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.brand?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Group items by category
  const groupedMenuItems = filteredMenuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = []
    }
    acc[item.category].push(item)
    return acc
  }, {} as Record<FoodCategory, MenuItem[]>)

  const groupedDrinkItems = filteredDrinkItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = []
    }
    acc[item.category].push(item)
    return acc
  }, {} as Record<DrinkCategory, DrinkItem[]>)

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Zpět na dashboard"
              >
                <Home className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                  <UtensilsCrossed className="w-6 h-6 text-pink-600" />
                  <span>Jídlo a Pití</span>
                </h1>
                <p className="text-sm text-gray-600">Plánování svatebního menu</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => activeTab === 'food' ? setShowFoodForm(true) : setShowDrinkForm(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>{activeTab === 'food' ? 'Přidat jídlo' : 'Přidat nápoj'}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="wedding-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Celkem položek</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalMenuItems + stats.totalDrinkItems}
                </p>
              </div>
              <List className="w-8 h-8 text-pink-600" />
            </div>
          </div>

          <div className="wedding-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Jídla</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalMenuItems}</p>
              </div>
              <UtensilsCrossed className="w-8 h-8 text-orange-600" />
            </div>
          </div>

          <div className="wedding-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Nápoje</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalDrinkItems}</p>
              </div>
              <Wine className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="wedding-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Odhadované náklady</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(stats.totalEstimatedCost / 1000).toFixed(0)}k
                </p>
              </div>
              <div className="text-green-600 text-2xl">Kč</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="wedding-card mb-6">
          <div className="flex space-x-1 border-b border-gray-200">
            <button
              onClick={() => {
                setActiveTab('food')
                setSelectedCategory('all')
              }}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'food'
                  ? 'text-pink-600 border-b-2 border-pink-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center space-x-2">
                <UtensilsCrossed className="w-4 h-4" />
                <span>Jídlo ({stats.totalMenuItems})</span>
              </div>
            </button>
            <button
              onClick={() => {
                setActiveTab('drinks')
                setSelectedCategory('all')
              }}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'drinks'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Wine className="w-4 h-4" />
                <span>Nápoje ({stats.totalDrinkItems})</span>
              </div>
            </button>
          </div>

          {/* Search and Filter */}
          <div className="p-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={activeTab === 'food' ? 'Hledat jídlo...' : 'Hledat nápoj...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-pink-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Vše
              </button>
              {activeTab === 'food' ? (
                Object.entries(FOOD_CATEGORY_LABELS).map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => setSelectedCategory(value)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      selectedCategory === value
                        ? 'bg-pink-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {label}
                  </button>
                ))
              ) : (
                Object.entries(DRINK_CATEGORY_LABELS).map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => setSelectedCategory(value)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      selectedCategory === value
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {label}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="loading-spinner w-8 h-8" />
          </div>
        ) : (
          <div className="wedding-card">
            {activeTab === 'food' ? (
              <div>
                {filteredMenuItems.length === 0 ? (
                  <div className="text-center py-12">
                    <UtensilsCrossed className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">
                      {searchQuery || selectedCategory !== 'all' ? 'Žádné jídlo nenalezeno' : 'Zatím nemáte žádná jídla'}
                    </p>
                    {!searchQuery && selectedCategory === 'all' && (
                      <button
                        onClick={() => setShowFoodForm(true)}
                        className="btn-primary"
                      >
                        Přidat první jídlo
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-8">
                    {Object.entries(groupedMenuItems).map(([category, items]) => (
                      <div key={category}>
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                          <span className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-sm">
                            {FOOD_CATEGORY_LABELS[category as FoodCategory]}
                          </span>
                          <span className="ml-2 text-gray-500 text-sm">({items.length})</span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {items.map((item) => (
                            <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow relative">
                              <div className="absolute top-2 right-2 flex space-x-1">
                                <button
                                  onClick={() => handleEditMenuItem(item)}
                                  className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                                  title="Upravit"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteMenuItem(item.id)}
                                  className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                                  title="Smazat"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                              <h4 className="font-semibold text-lg mb-2 pr-20">{item.name}</h4>
                              {item.description && (
                                <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                              )}
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Množství:</span>
                                  <span className="font-medium">{item.estimatedQuantity} porcí</span>
                                </div>
                                {item.totalCost && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Cena:</span>
                                    <span className="font-medium">{item.totalCost} Kč</span>
                                  </div>
                                )}
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {item.isVegetarian && (
                                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                                      Vegetariánské
                                    </span>
                                  )}
                                  {item.isVegan && (
                                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                                      Veganské
                                    </span>
                                  )}
                                  {item.isGlutenFree && (
                                    <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full">
                                      Bezlepkové
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div>
                {filteredDrinkItems.length === 0 ? (
                  <div className="text-center py-12">
                    <Wine className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">
                      {searchQuery || selectedCategory !== 'all' ? 'Žádný nápoj nenalezen' : 'Zatím nemáte žádné nápoje'}
                    </p>
                    {!searchQuery && selectedCategory === 'all' && (
                      <button
                        onClick={() => setShowDrinkForm(true)}
                        className="btn-primary"
                      >
                        Přidat první nápoj
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-8">
                    {Object.entries(groupedDrinkItems).map(([category, items]) => (
                      <div key={category}>
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                          <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                            {DRINK_CATEGORY_LABELS[category as DrinkCategory]}
                          </span>
                          <span className="ml-2 text-gray-500 text-sm">({items.length})</span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {items.map((item) => (
                            <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow relative">
                              <div className="absolute top-2 right-2 flex space-x-1">
                                <button
                                  onClick={() => handleEditDrinkItem(item)}
                                  className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                                  title="Upravit"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteDrinkItem(item.id)}
                                  className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                                  title="Smazat"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                              <h4 className="font-semibold text-lg mb-2 pr-20">{item.name}</h4>
                              {item.brand && (
                                <p className="text-sm text-gray-600 mb-2">Značka: {item.brand}</p>
                              )}
                              {item.description && (
                                <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                              )}
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Množství:</span>
                                  <span className="font-medium">{item.estimatedQuantity}x</span>
                                </div>
                                {item.totalCost && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Cena:</span>
                                    <span className="font-medium">{item.totalCost} Kč</span>
                                  </div>
                                )}
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {item.isAlcoholic ? (
                                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                                      Alkoholické {item.alcoholContent && `(${item.alcoholContent}%)`}
                                    </span>
                                  ) : (
                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                      Nealko
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}
      </main>

      {/* Forms */}
      {showFoodForm && (
        <MenuItemForm
          onSubmit={handleMenuItemSubmit}
          onCancel={() => {
            setShowFoodForm(false)
            setEditingFood(null)
          }}
          initialData={editingFood || undefined}
          loading={formLoading}
        />
      )}

      {showDrinkForm && (
        <DrinkItemForm
          onSubmit={handleDrinkItemSubmit}
          onCancel={() => {
            setShowDrinkForm(false)
            setEditingDrink(null)
          }}
          initialData={editingDrink || undefined}
          loading={formLoading}
        />
      )}
    </div>
  )
}

