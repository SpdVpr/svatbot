'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ShoppingCart,
  Plus,
  Package,
  CheckCircle,
  Clock,
  TrendingUp,
  Filter,
  Search,
  Grid3X3,
  List
} from 'lucide-react'
import { useShopping } from '@/hooks/useShopping'
import { currencyUtils } from '@/utils'
import ShoppingItemCard from '@/components/shopping/ShoppingItemCard'
import ShoppingItemForm from '@/components/shopping/ShoppingItemForm'
import ModuleHeader from '@/components/common/ModuleHeader'
import { ShoppingCategory, SHOPPING_CATEGORIES } from '@/types/shopping'

export default function ShoppingPage() {
  const router = useRouter()
  const { items, stats, loading } = useShopping()
  const [showForm, setShowForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<ShoppingCategory | 'all'>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'purchased' | 'pending'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Filter items
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'purchased' && item.isPurchased) ||
                         (filterStatus === 'pending' && !item.isPurchased)
    
    return matchesSearch && matchesCategory && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading-spinner w-8 h-8" />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <ModuleHeader
        icon={ShoppingCart}
        title="Nákupní seznam"
        subtitle={`${stats.totalItems} produktů • ${stats.purchasedItems} zakoupeno • ${currencyUtils.format(stats.totalValue)} Kč`}
        iconGradient="from-amber-500 to-orange-500"
        actions={
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Přidat produkt</span>
          </button>
        }
      />

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="wedding-card">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">Celkem produktů</p>
                <p className="text-3xl font-bold text-purple-600 mb-1">
                  {stats.totalItems}
                </p>
                <p className="text-xs text-gray-500">V seznamu</p>
              </div>
              <div className="p-3 rounded-xl bg-purple-100">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="wedding-card">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">Zakoupeno</p>
                <p className="text-3xl font-bold text-green-600 mb-1">
                  {stats.purchasedItems}
                </p>
                <p className="text-xs text-gray-500">
                  {stats.totalItems > 0 ? Math.round((stats.purchasedItems / stats.totalItems) * 100) : 0}% hotovo
                </p>
              </div>
              <div className="p-3 rounded-xl bg-green-100">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="wedding-card">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">Zbývá koupit</p>
                <p className="text-3xl font-bold text-orange-600 mb-1">
                  {stats.pendingItems}
                </p>
                <p className="text-xs text-gray-500">Produktů</p>
              </div>
              <div className="p-3 rounded-xl bg-orange-100">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="wedding-card">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">Celková hodnota</p>
                <p className="text-3xl font-bold text-blue-600 mb-1">
                  {currencyUtils.formatShort(stats.totalValue)}
                </p>
                <p className="text-xs text-gray-500">
                  Zaplaceno: {currencyUtils.formatShort(stats.purchasedValue)}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-blue-100">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="wedding-card">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Hledat produkty..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value as ShoppingCategory | 'all')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">Všechny kategorie</option>
                {SHOPPING_CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'purchased' | 'pending')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">Všechny stavy</option>
              <option value="pending">Zbývá koupit</option>
              <option value="purchased">Zakoupeno</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 border border-gray-300 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-purple-100 text-purple-600' : 'text-gray-400'}`}
              >
                <Grid3X3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-purple-100 text-purple-600' : 'text-gray-400'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Products Gallery */}
        {filteredItems.length === 0 ? (
          <div className="wedding-card text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {items.length === 0 ? 'Žádné produkty' : 'Žádné výsledky'}
            </h3>
            <p className="text-gray-600 mb-6">
              {items.length === 0 
                ? 'Začněte přidáním prvního produktu do vašeho nákupního seznamu'
                : 'Zkuste změnit filtry nebo vyhledávání'
              }
            </p>
            {items.length === 0 && (
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary inline-flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Přidat první produkt</span>
              </button>
            )}
          </div>
        ) : (
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
          }>
            {filteredItems.map(item => (
              <ShoppingItemCard 
                key={item.id} 
                item={item}
                viewMode={viewMode}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <ShoppingItemForm
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  )
}

