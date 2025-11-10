'use client'

import { useState } from 'react'
import { BudgetItem, BudgetFilters, BudgetViewOptions, BUDGET_CATEGORIES } from '@/types/budget'
import { useBudget } from '@/hooks/useBudget'
import {
  Search,
  Filter,
  Plus,
  DollarSign,
  Calendar,
  CheckCircle2,
  Clock,
  X,
  AlertTriangle,
  MoreHorizontal,
  Edit,
  Trash2,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Coins
} from 'lucide-react'
import { getViewTransitionName } from '@/hooks/useViewTransition'

interface BudgetListProps {
  showHeader?: boolean
  showFilters?: boolean
  compact?: boolean
  viewMode?: 'list' | 'grid'
  onCreateItem?: () => void
  onEditItem?: (item: BudgetItem) => void
}

export default function BudgetList({
  showHeader = true,
  showFilters = true,
  compact = false,
  viewMode = 'list',
  onCreateItem,
  onEditItem
}: BudgetListProps) {
  const { 
    budgetItems, 
    loading, 
    error, 
    stats, 
    updateBudgetItem, 
    deleteBudgetItem,
    recordPayment,
    clearError 
  } = useBudget()

  const [filters, setFilters] = useState<BudgetFilters>({})
  const [viewOptions, setViewOptions] = useState<BudgetViewOptions>({
    groupBy: 'category',
    sortBy: 'name',
    sortOrder: 'asc',
    showPaid: true,
    showEstimates: true,
    currency: 'CZK'
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [showFiltersPanel, setShowFiltersPanel] = useState(false)
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  // Format currency
  const formatCurrency = (amount: number, currency: string = 'CZK') => {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  // Filter and sort budget items
  const filteredItems = budgetItems.filter(item => {
    // Search filter
    if (searchTerm && !item.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }
    
    // Category filter
    if (filters.category && !filters.category.includes(item.category)) {
      return false
    }
    
    // Payment status filter
    if (filters.paymentStatus && !filters.paymentStatus.includes(item.paymentStatus)) {
      return false
    }
    
    // Priority filter
    if (filters.priority && item.priority && !filters.priority.includes(item.priority)) {
      return false
    }
    
    // Show paid filter
    if (!viewOptions.showPaid && item.paymentStatus === 'paid') {
      return false
    }
    
    // Show estimates filter
    if (!viewOptions.showEstimates && item.isEstimate) {
      return false
    }
    
    return true
  })

  // Group budget items
  const groupedItems = groupItemsBy(filteredItems, viewOptions.groupBy)

  // Get payment status display
  const getPaymentStatusDisplay = (status: string) => {
    switch (status) {
      case 'paid':
        return { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50', label: 'Zaplaceno' }
      case 'partial':
        return { icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50', label: 'Částečně' }
      case 'overdue':
        return { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50', label: 'Po splatnosti' }
      case 'cancelled':
        return { icon: X, color: 'text-gray-500', bg: 'bg-gray-50', label: 'Zrušeno' }
      case 'pending':
        return { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-50', label: 'Čeká' }
      default:
        return { icon: Clock, color: 'text-gray-500', bg: 'bg-gray-50', label: 'Čeká' }
    }
  }

  // Get priority display
  const getPriorityDisplay = (priority?: string) => {
    switch (priority) {
      case 'critical':
        return { color: 'text-red-600', bg: 'bg-red-100', label: 'Kritická' }
      case 'high':
        return { color: 'text-orange-600', bg: 'bg-orange-100', label: 'Vysoká' }
      case 'medium':
        return { color: 'text-blue-600', bg: 'bg-blue-100', label: 'Střední' }
      case 'low':
        return { color: 'text-gray-600', bg: 'bg-gray-100', label: 'Nízká' }
      default:
        return null
    }
  }

  // Get payment method display
  const getPaymentMethodDisplay = (method?: string) => {
    switch (method) {
      case 'cash':
        return { icon: '💵', label: 'Hotovost', color: 'text-green-600', bg: 'bg-green-50' }
      case 'card':
        return { icon: '💳', label: 'Karta', color: 'text-blue-600', bg: 'bg-blue-50' }
      case 'transfer':
        return { icon: '🏦', label: 'Převod', color: 'text-purple-600', bg: 'bg-purple-50' }
      case 'invoice':
        return { icon: '📝', label: 'Faktura', color: 'text-orange-600', bg: 'bg-orange-50' }
      case 'after_wedding':
        return { icon: '💒', label: 'Po svatbě', color: 'text-pink-600', bg: 'bg-pink-50' }
      case 'at_wedding':
        return { icon: '🎉', label: 'Na svatbě', color: 'text-rose-600', bg: 'bg-rose-50' }
      case 'other':
        return { icon: '💰', label: 'Jiné', color: 'text-gray-600', bg: 'bg-gray-50' }
      default:
        return null
    }
  }

  // Get payment period display
  const getPaymentPeriodDisplay = (period?: string) => {
    switch (period) {
      case 'before-wedding':
        return { icon: '📅', label: 'Před svatbou', color: 'text-blue-600', bg: 'bg-blue-50' }
      case 'at-wedding':
        return { icon: '💒', label: 'Na svatbě', color: 'text-pink-600', bg: 'bg-pink-50' }
      case 'after-wedding':
        return { icon: '✨', label: 'Po svatbě', color: 'text-purple-600', bg: 'bg-purple-50' }
      default:
        return null
    }
  }

  // Handle payment record
  const handleRecordPayment = async (itemId: string, amount: number) => {
    try {
      await recordPayment(itemId, amount, 'card') // Default to card payment
    } catch (error) {
      console.error('Error recording payment:', error)
    }
  }

  // Handle item selection
  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  // Handle delete item
  const handleDeleteItem = async (itemId: string) => {
    const item = budgetItems.find(i => i.id === itemId)
    if (!item) return

    if (window.confirm(`Opravdu chcete smazat položku "${item.name}"?`)) {
      try {
        await deleteBudgetItem(itemId)
      } catch (error) {
        console.error('Error deleting budget item:', error)
      }
    }
  }

  // Handle add payment
  const handleAddPayment = (item: BudgetItem) => {
    // This will open the edit form with focus on payments
    onEditItem?.(item)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 loading-spinner" />
          <span className="text-text-muted">Načítání rozpočtu...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span className="text-red-700">{error}</span>
          </div>
          <button
            onClick={clearError}
            className="text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      {showHeader && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="heading-2">Rozpočet</h2>
            <p className="body-small text-text-muted">
              {formatCurrency(stats.totalPaid)} zaplaceno z {formatCurrency(stats.totalActual)}
            </p>
          </div>
          {onCreateItem && (
            <button 
              onClick={onCreateItem}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Přidat položku</span>
            </button>
          )}
        </div>
      )}



      {/* Filters */}
      {showFilters && (
        <div className="space-y-3">
          {/* Search and filter toggle */}
          <div className="flex items-center space-x-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Hledat položky..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setShowFiltersPanel(!showFiltersPanel)}
              className={`btn-outline flex items-center space-x-2 ${showFiltersPanel ? 'bg-primary-50 border-primary-300' : ''}`}
            >
              <Filter className="w-4 h-4" />
              <span>Filtry</span>
            </button>
          </div>

          {/* Filters panel */}
          {showFiltersPanel && (
            <div className="p-4 bg-gray-50 rounded-lg space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Category filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kategorie
                  </label>
                  <select
                    value={filters.category?.[0] || ''}
                    onChange={(e) => {
                      const value = e.target.value
                      setFilters(prev => ({
                        ...prev,
                        category: value && value !== '' ? [value as any] : undefined
                      }))
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Všechny kategorie</option>
                    {Object.entries(BUDGET_CATEGORIES).map(([key, category]) => (
                      <option key={key} value={key}>
                        {category.icon} {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Payment status filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stav platby
                  </label>
                  <select
                    value={filters.paymentStatus?.[0] || ''}
                    onChange={(e) => {
                      const value = e.target.value
                      setFilters(prev => ({
                        ...prev,
                        paymentStatus: value && value !== '' ? [value as any] : undefined
                      }))
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Všechny stavy</option>
                    <option value="pending">Čeká na platbu</option>
                    <option value="partial">Částečně zaplaceno</option>
                    <option value="paid">Zaplaceno</option>
                    <option value="overdue">Po splatnosti</option>
                    <option value="cancelled">Zrušeno</option>
                  </select>
                </div>

                {/* Priority filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priorita
                  </label>
                  <select
                    value={filters.priority?.[0] || ''}
                    onChange={(e) => {
                      const value = e.target.value
                      setFilters(prev => ({
                        ...prev,
                        priority: value && value !== '' ? [value as any] : undefined
                      }))
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Všechny priority</option>
                    <option value="critical">Kritická</option>
                    <option value="high">Vysoká</option>
                    <option value="medium">Střední</option>
                    <option value="low">Nízká</option>
                  </select>
                </div>
              </div>

              {/* View options */}
              <div className="flex items-center space-x-4 pt-2 border-t border-gray-200">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={viewOptions.showPaid}
                    onChange={(e) => setViewOptions(prev => ({
                      ...prev,
                      showPaid: e.target.checked
                    }))}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">Zobrazit zaplacené</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={viewOptions.showEstimates}
                    onChange={(e) => setViewOptions(prev => ({
                      ...prev,
                      showEstimates: e.target.checked
                    }))}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">Zobrazit odhady</span>
                </label>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Budget items list */}
      <div className="space-y-4">
        {Object.entries(groupedItems).map(([groupKey, groupItems]) => (
          <div key={groupKey} className="space-y-3">
            {/* Group header */}
            <div className="bg-primary-50 px-4 py-3 rounded-lg border border-primary-200 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
                  {viewOptions.groupBy === 'category' && BUDGET_CATEGORIES[groupKey as keyof typeof BUDGET_CATEGORIES] && (
                    <span>{BUDGET_CATEGORIES[groupKey as keyof typeof BUDGET_CATEGORIES].icon}</span>
                  )}
                  <span>
                    {viewOptions.groupBy === 'category'
                      ? BUDGET_CATEGORIES[groupKey as keyof typeof BUDGET_CATEGORIES]?.name || groupKey
                      : groupKey
                    }
                  </span>
                </h3>
                <span className="text-sm font-medium text-primary-700">
                  {groupItems.length} položek
                </span>
              </div>
            </div>

            {/* Items in group */}
            <div className="space-y-3">
              {groupItems.map((item) => {
                const statusDisplay = getPaymentStatusDisplay(item.paymentStatus)
                const priorityDisplay = getPriorityDisplay(item.priority)
                const isOverBudget = item.actualAmount > item.budgetedAmount

                return (
                  <div
                    key={item.id}
                    className="wedding-card !p-4"
                    style={getViewTransitionName(`budget-item-${item.id}`)}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      {/* Item info */}
                      <div className="flex-1 min-w-0">
                        {/* Name and Checkbox - First Row */}
                        <div className="flex items-center gap-2 mb-2">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(item.id)}
                            onChange={() => toggleItemSelection(item.id)}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 flex-shrink-0"
                          />
                          <h4 className="font-medium text-gray-900 truncate">
                            {item.name}
                          </h4>
                          {item.isEstimate && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full flex-shrink-0 whitespace-nowrap">
                              Odhad
                            </span>
                          )}
                        </div>

                        {/* Badges - Second Row with wrapping */}
                        <div className="flex items-center flex-wrap gap-2 mb-2">
                          {/* Payment Status */}
                          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${statusDisplay.bg} flex-shrink-0`}>
                            <statusDisplay.icon className={`w-3 h-3 ${statusDisplay.color}`} />
                            <span className={`text-xs font-medium ${statusDisplay.color} whitespace-nowrap`}>
                              {statusDisplay.label}
                            </span>
                          </div>

                          {/* Payment Method */}
                          {item.paymentMethod && getPaymentMethodDisplay(item.paymentMethod) && (
                            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${getPaymentMethodDisplay(item.paymentMethod)!.bg} flex-shrink-0`}>
                              <span>{getPaymentMethodDisplay(item.paymentMethod)!.icon}</span>
                              <span className={`text-xs font-medium ${getPaymentMethodDisplay(item.paymentMethod)!.color} whitespace-nowrap`}>
                                {getPaymentMethodDisplay(item.paymentMethod)!.label}
                              </span>
                            </div>
                          )}

                          {/* Payment Period */}
                          {item.paymentPeriod && getPaymentPeriodDisplay(item.paymentPeriod) && (
                            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${getPaymentPeriodDisplay(item.paymentPeriod)!.bg} flex-shrink-0`}>
                              <span>{getPaymentPeriodDisplay(item.paymentPeriod)!.icon}</span>
                              <span className={`text-xs font-medium ${getPaymentPeriodDisplay(item.paymentPeriod)!.color} whitespace-nowrap`}>
                                {getPaymentPeriodDisplay(item.paymentPeriod)!.label}
                              </span>
                            </div>
                          )}

                          {/* Priority */}
                          {priorityDisplay && (
                            <div className={`flex items-center px-2 py-1 rounded-full ${priorityDisplay.bg} flex-shrink-0`}>
                              <span className={`text-xs font-medium ${priorityDisplay.color} whitespace-nowrap`}>
                                {priorityDisplay.label}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Financial info */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-2">
                          <div>
                            <span className="text-gray-500">Předběžná částka:</span>
                            <p className="font-medium">{formatCurrency(item.budgetedAmount, item.currency)}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Skutečnost:</span>
                            <p className={`font-medium ${isOverBudget ? 'text-red-600' : 'text-gray-900'}`}>
                              {formatCurrency(item.actualAmount, item.currency)}
                              {isOverBudget && (
                                <span className="ml-1 text-xs">
                                  (+{formatCurrency(item.actualAmount - item.budgetedAmount, item.currency)})
                                </span>
                              )}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500">Zaplaceno:</span>
                            <p className="font-medium text-green-600">
                              {formatCurrency(item.paidAmount, item.currency)}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500">Zbývá:</span>
                            <p className="font-medium">
                              {formatCurrency(item.actualAmount - item.paidAmount, item.currency)}
                            </p>
                          </div>
                        </div>

                        {/* Sub-items breakdown */}
                        {item.subItems && item.subItems.length > 0 && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-blue-900">
                                Rozdělení položky ({item.subItems.length})
                              </span>
                              <span className="text-sm font-bold text-blue-600">
                                Celkem: {formatCurrency(item.subItems.reduce((sum, sub) => sum + sub.amount, 0), item.currency)}
                              </span>
                            </div>
                            <div className="space-y-1">
                              {item.subItems.map((subItem, index) => (
                                <div key={subItem.id} className="flex items-center justify-between text-sm">
                                  <span className="text-blue-800">
                                    {index + 1}. {subItem.name}
                                    {subItem.notes && <span className="text-blue-600 ml-1">({subItem.notes})</span>}
                                  </span>
                                  <span className="font-medium text-blue-900">
                                    {formatCurrency(subItem.amount, subItem.currency)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Vendor and dates */}
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          {item.vendorName && (
                            <span>📍 {item.vendorName}</span>
                          )}
                          {item.dueDate && (
                            <span>📅 Splatnost: {item.dueDate.toLocaleDateString('cs-CZ')}</span>
                          )}
                          {item.paidDate && (
                            <span>💳 Zaplaceno: {item.paidDate.toLocaleDateString('cs-CZ')}</span>
                          )}
                        </div>

                        {/* Payments */}
                        {item.payments && item.payments.length > 0 && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2">
                              <span className="text-sm font-medium text-gray-700">
                                Platby ({item.payments.length})
                              </span>
                              <span className="text-sm text-gray-500">
                                Celkem: {formatCurrency(item.payments.reduce((sum, p) => sum + p.amount, 0))}
                              </span>
                            </div>
                            <div className="space-y-2">
                              {item.payments.slice(0, 3).map((payment, index) => (
                                <div key={payment.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-xs">
                                  <div className="flex items-center space-x-2 flex-wrap">
                                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                      payment.status === 'completed' ? 'bg-green-500' :
                                      payment.status === 'pending' ? 'bg-yellow-500' :
                                      payment.status === 'failed' ? 'bg-red-500' :
                                      'bg-gray-500'
                                    }`} />
                                    <span className="font-medium">{formatCurrency(payment.amount, payment.currency)}</span>
                                    <span className="text-gray-500">
                                      {payment.date instanceof Date ?
                                        payment.date.toLocaleDateString('cs-CZ') :
                                        new Date(payment.date).toLocaleDateString('cs-CZ')
                                      }
                                    </span>
                                  </div>
                                  <span className="text-gray-500 sm:text-right">
                                    {payment.method ? (
                                      getPaymentMethodDisplay(payment.method)?.label || payment.method
                                    ) : 'Neurčeno'}
                                  </span>
                                </div>
                              ))}
                              {item.payments.length > 3 && (
                                <div className="text-xs text-gray-500 text-center pt-1">
                                  ... a {item.payments.length - 3} dalších plateb
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Tags */}
                        {item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {item.tags.map((tag) => (
                              <span
                                key={tag}
                                className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0 self-start">
                        {/* Add payment button */}
                        <button
                          onClick={() => handleAddPayment(item)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Přidat platbu"
                        >
                          <Plus className="w-4 h-4" />
                        </button>

                        {/* Edit button */}
                        <button
                          onClick={() => onEditItem?.(item)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded transition-colors"
                          title="Upravit položku"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        {/* Delete button */}
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Smazat položku"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {filteredItems.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {budgetItems.length === 0 ? 'Žádné rozpočtové položky' : 'Žádné položky nevyhovují filtrům'}
            </h3>
            <p className="text-text-muted">
              {budgetItems.length === 0 
                ? 'Začněte přidáním první rozpočtové položky.'
                : 'Zkuste upravit filtry nebo vyhledávání.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Bulk actions */}
      {selectedItems.length > 0 && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">
              {selectedItems.length} vybraných položek
            </span>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => {
                  // TODO: Implement bulk payment
                  console.log('Bulk payment for:', selectedItems)
                  alert('Funkce "Hromadná platba" bude implementována v další verzi')
                }}
                className="btn-outline btn-sm flex items-center space-x-1"
              >
                <CreditCard className="w-3 h-3" />
                <span>Označit jako zaplaceno</span>
              </button>
              <button 
                onClick={async () => {
                  if (window.confirm(`Opravdu chcete smazat ${selectedItems.length} položek?`)) {
                    try {
                      for (const itemId of selectedItems) {
                        await deleteBudgetItem(itemId)
                      }
                      setSelectedItems([])
                    } catch (error) {
                      console.error('Error deleting budget items:', error)
                    }
                  }
                }}
                className="btn-outline btn-sm text-red-600 border-red-300 hover:bg-red-50 flex items-center space-x-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>Smazat</span>
              </button>
            </div>
            <button
              onClick={() => setSelectedItems([])}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Helper function to group budget items
function groupItemsBy(items: BudgetItem[], groupBy: string): Record<string, BudgetItem[]> {
  const grouped: Record<string, BudgetItem[]> = {}

  items.forEach(item => {
    let key: string
    
    switch (groupBy) {
      case 'category':
        key = item.category
        break
      case 'status':
        key = item.paymentStatus
        break
      case 'priority':
        key = item.priority || 'Bez priority'
        break
      case 'vendor':
        key = item.vendorName || 'Bez dodavatele'
        break
      default:
        key = 'Všechny'
    }

    if (!grouped[key]) {
      grouped[key] = []
    }
    grouped[key].push(item)
  })

  // Sort items within each group
  Object.keys(grouped).forEach(key => {
    grouped[key].sort((a, b) => {
      return a.name.localeCompare(b.name)
    })
  })

  return grouped
}
