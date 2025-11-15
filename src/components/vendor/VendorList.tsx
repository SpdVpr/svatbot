'use client'

import { useState } from 'react'
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Phone,
  Mail,
  Globe,
  MapPin,
  Star,
  Calendar,
  DollarSign,
  Eye,
  MoreVertical,
  ShoppingBag,
  FileText,
  Download
} from 'lucide-react'
import Link from 'next/link'
import { Vendor, VendorFilters, VENDOR_CATEGORIES, VENDOR_STATUSES } from '@/types/vendor'
import { currencyUtils, dateUtils } from '@/utils'
import { useColorTheme } from '@/hooks/useColorTheme'

interface VendorListProps {
  vendors: Vendor[]
  onAddVendor: () => void
  onEditVendor: (vendor: Vendor) => void
  onDeleteVendor: (vendorId: string) => void
  onViewVendor: (vendor: Vendor) => void
  loading?: boolean
}

export default function VendorList({
  vendors,
  onAddVendor,
  onEditVendor,
  onDeleteVendor,
  onViewVendor,
  loading = false
}: VendorListProps) {
  const { currentPalette } = useColorTheme()
  const [filters, setFilters] = useState<VendorFilters>({
    search: '',
    showCompleted: true
  })
  const [showFilters, setShowFilters] = useState(false)
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null)

  // Filter vendors based on current filters
  const filteredVendors = vendors.filter(vendor => {
    if (filters.search && !vendor.name.toLowerCase().includes(filters.search.toLowerCase())) return false
    if (filters.category && !filters.category.includes(vendor.category)) return false
    if (filters.status && !filters.status.includes(vendor.status)) return false
    if (filters.priority && vendor.priority && !filters.priority.includes(vendor.priority)) return false
    if (filters.hasContract !== undefined && (!!vendor.contractId) !== filters.hasContract) return false
    if (filters.showCompleted === false && vendor.status === 'completed') return false
    return true
  })

  // Handle search
  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }))
  }

  // Handle filter change
  const handleFilterChange = (key: keyof VendorFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  // Get vendor category config
  const getCategoryConfig = (category: string) => {
    return VENDOR_CATEGORIES[category as keyof typeof VENDOR_CATEGORIES] || VENDOR_CATEGORIES.other
  }

  // Get vendor status config
  const getStatusConfig = (status: string) => {
    return VENDOR_STATUSES[status as keyof typeof VENDOR_STATUSES] || VENDOR_STATUSES.potential
  }

  // Get priority color
  const getPriorityColor = (priority?: string) => {
    if (!priority || priority === 'none') return null

    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-700'
      case 'high': return 'bg-orange-100 text-orange-700'
      case 'medium': return 'bg-yellow-100 text-yellow-700'
      case 'low': return 'bg-green-100 text-green-700'
      default: return null
    }
  }

  // Get priority label
  const getPriorityLabel = (priority?: string) => {
    if (!priority || priority === 'none') return null

    switch (priority) {
      case 'critical': return 'Kritická'
      case 'high': return 'Vysoká'
      case 'medium': return 'Střední'
      case 'low': return 'Nízká'
      default: return null
    }
  }

  // Get price type label
  const getPriceTypeLabel = (priceType: string) => {
    switch (priceType) {
      case 'fixed': return 'za službu'
      case 'hourly': return 'za hodinu'
      case 'per-person': return 'za osobu'
      case 'package': return 'balíček'
      case 'negotiable': return 'dohodou'
      default: return ''
    }
  }

  // Get primary contact
  const getPrimaryContact = (vendor: Vendor) => {
    return vendor.contacts.find(contact => contact.isPrimary) || vendor.contacts[0]
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="wedding-card animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="flex space-x-4">
              <div className="h-3 bg-gray-200 rounded w-1/6"></div>
              <div className="h-3 bg-gray-200 rounded w-1/6"></div>
              <div className="h-3 bg-gray-200 rounded w-1/6"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Hledat dodavatele..."
            value={filters.search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`btn-outline flex items-center space-x-2 ${showFilters ? 'bg-primary-50 border-primary-300' : ''}`}
        >
          <Filter className="w-4 h-4" />
          <span>Filtry</span>
        </button>

        {/* Add Vendor Button */}
        <button
          onClick={onAddVendor}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Přidat dodavatele</span>
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="wedding-card">
          <h3 className="font-medium text-gray-900 mb-4">Filtry</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategorie
              </label>
              <select
                value={filters.category?.[0] || ''}
                onChange={(e) => handleFilterChange('category', e.target.value ? [e.target.value] : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Všechny kategorie</option>
                {Object.entries(VENDOR_CATEGORIES).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.icon} {config.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filters.status?.[0] || ''}
                onChange={(e) => handleFilterChange('status', e.target.value ? [e.target.value] : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Všechny statusy</option>
                {Object.entries(VENDOR_STATUSES).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priorita
              </label>
              <select
                value={filters.priority?.[0] || ''}
                onChange={(e) => handleFilterChange('priority', e.target.value ? [e.target.value] : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Všechny priority</option>
                <option value="none">Bez priority</option>
                <option value="critical">Kritická</option>
                <option value="high">Vysoká</option>
                <option value="medium">Střední</option>
                <option value="low">Nízká</option>
              </select>
            </div>

            {/* Contract Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Smlouva
              </label>
              <select
                value={filters.hasContract === undefined ? '' : filters.hasContract ? 'yes' : 'no'}
                onChange={(e) => handleFilterChange('hasContract', e.target.value === '' ? undefined : e.target.value === 'yes')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Všichni</option>
                <option value="yes">Se smlouvou</option>
                <option value="no">Bez smlouvy</option>
              </select>
            </div>
          </div>

          {/* Show Completed Toggle */}
          <div className="mt-4 flex items-center">
            <input
              type="checkbox"
              id="showCompleted"
              checked={filters.showCompleted !== false}
              onChange={(e) => handleFilterChange('showCompleted', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="showCompleted" className="ml-2 text-sm text-gray-700">
              Zobrazit dokončené
            </label>
          </div>
        </div>
      )}

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          Zobrazeno {filteredVendors.length} z {vendors.length} dodavatelů
        </span>
        {filters.search && (
          <button
            onClick={() => handleSearch('')}
            className="text-primary-600 hover:text-primary-700"
          >
            Vymazat hledání
          </button>
        )}
      </div>

      {/* Vendor List */}
      {filteredVendors.length === 0 ? (
        <div className="wedding-card text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {vendors.length === 0 ? 'Žádní dodavatelé' : 'Žádní dodavatelé nevyhovují filtrům'}
          </h3>
          <p className="text-gray-600 mb-6">
            {vendors.length === 0
              ? 'Začněte přidáním prvního dodavatele pro vaši svatbu nebo prohlédněte marketplace.'
              : 'Zkuste upravit filtry nebo vyhledávání.'
            }
          </p>
          {vendors.length === 0 && (
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={onAddVendor}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Přidat dodavatele</span>
              </button>
              <Link
                href="/marketplace"
                className="btn-outline flex items-center space-x-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Procházet marketplace</span>
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredVendors.map((vendor) => {
            const categoryConfig = getCategoryConfig(vendor.category)
            const statusConfig = getStatusConfig(vendor.status)
            const primaryContact = getPrimaryContact(vendor)

            return (
              <div key={vendor.id} className="wedding-card">
                {/* Mobile: Stack layout, Desktop: Horizontal layout */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  {/* Main Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start space-x-3 sm:space-x-4">
                      {/* Category Icon */}
                      <div
                        className="p-2 sm:p-3 rounded-xl flex-shrink-0"
                        style={{
                          backgroundColor: currentPalette.colors.primaryLight,
                          color: currentPalette.colors.primary600
                        }}
                      >
                        <span className="text-base sm:text-lg">{categoryConfig.icon}</span>
                      </div>

                      {/* Vendor Info */}
                      <div className="flex-1 min-w-0">
                        {/* Header with badges - Stack on mobile */}
                        <div className="mb-2">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate mb-2">
                            {vendor.name}
                          </h3>

                          {/* Badges - Wrap on mobile */}
                          <div className="flex flex-wrap items-center gap-2">
                            {/* Status Badge */}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color} whitespace-nowrap`}>
                              {statusConfig.name}
                            </span>

                            {/* Priority Badge */}
                            {getPriorityColor(vendor.priority) && (
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(vendor.priority)} whitespace-nowrap`}>
                                {getPriorityLabel(vendor.priority)}
                              </span>
                            )}

                            {/* Documents Badge */}
                            {vendor.documents && vendor.documents.length > 0 && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex-shrink-0 whitespace-nowrap flex items-center gap-1">
                                <FileText className="w-3 h-3" />
                                {vendor.documents.length}
                              </span>
                            )}
                          </div>
                        </div>

                        <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2">
                          {categoryConfig.name} • {vendor.description || 'Bez popisu'}
                        </p>

                        {/* Contact Info - Stack on mobile */}
                        {primaryContact && (
                          <div className="space-y-1 sm:space-y-0 sm:flex sm:flex-wrap sm:items-center sm:gap-4 text-xs sm:text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <span className="font-medium truncate">{primaryContact.name}</span>
                            </div>

                            {primaryContact.email && (
                              <div className="flex items-center space-x-1 min-w-0">
                                <Mail className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                <span className="truncate">{primaryContact.email}</span>
                              </div>
                            )}

                            {primaryContact.phone && (
                              <div className="flex items-center space-x-1">
                                <Phone className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                <span className="whitespace-nowrap">{primaryContact.phone}</span>
                              </div>
                            )}

                            {vendor.website && (
                              <div className="flex items-center space-x-1">
                                <Globe className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                <a
                                  href={vendor.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary-600 hover:text-primary-700 truncate"
                                >
                                  Web
                                </a>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Services and Price - Stack on mobile */}
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div className="text-xs sm:text-sm text-gray-600 min-w-0">
                              {vendor.services.length > 0 ? (
                                <div className="flex flex-wrap items-center gap-1">
                                  <span className="font-medium whitespace-nowrap">{vendor.services.length} služeb</span>
                                  {vendor.services[0] && (
                                    <span className="truncate">• {vendor.services[0].name}</span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-500">Žádné služby</span>
                              )}
                            </div>

                            <div className="text-left sm:text-right flex-shrink-0">
                              {vendor.priceRange ? (
                                <div>
                                  {/* Check if any service has discount */}
                                  {vendor.services.some(s => s.discountedPrice && s.price) ? (() => {
                                    const serviceWithDiscount = vendor.services.find(s => s.discountedPrice && s.price)
                                    if (serviceWithDiscount && serviceWithDiscount.price && serviceWithDiscount.discountedPrice) {
                                      const discountPercent = Math.round(((serviceWithDiscount.price - serviceWithDiscount.discountedPrice) / serviceWithDiscount.price) * 100)
                                      // Calculate original price range
                                      const originalPrices = vendor.services
                                        .filter(s => s.price && s.price > 0)
                                        .map(s => s.price!)
                                      const originalMin = Math.min(...originalPrices)
                                      const originalMax = Math.max(...originalPrices)

                                      return (
                                        <div>
                                          {/* Original price (crossed out) with discount percentage */}
                                          <div className="text-xs text-gray-500 line-through">
                                            {originalMin === originalMax ? (
                                              <span>{currencyUtils.formatShort(originalMin)}</span>
                                            ) : (
                                              <span>{currencyUtils.formatShort(originalMin)} - {currencyUtils.formatShort(originalMax)}</span>
                                            )}
                                            <span className="text-green-600 font-medium ml-1 no-underline">-{discountPercent}%</span>
                                          </div>
                                          {/* Discounted price (larger, main) */}
                                          <div className="text-base font-bold text-gray-900 mt-1">
                                            {vendor.priceRange.min === vendor.priceRange.max ? (
                                              <span>{currencyUtils.formatShort(vendor.priceRange.min)}</span>
                                            ) : (
                                              <span>{currencyUtils.formatShort(vendor.priceRange.min)} - {currencyUtils.formatShort(vendor.priceRange.max)}</span>
                                            )}
                                          </div>
                                          {/* Price type */}
                                          {serviceWithDiscount.priceType && (
                                            <div className="text-xs text-gray-500 mt-0.5">
                                              {getPriceTypeLabel(serviceWithDiscount.priceType)}
                                            </div>
                                          )}
                                        </div>
                                      )
                                    }
                                    return null
                                  })() : (
                                    /* No discount - show regular price */
                                    <div>
                                      <div className="text-sm font-medium text-gray-900">
                                        {vendor.priceRange.min === vendor.priceRange.max ? (
                                          <span>{currencyUtils.formatShort(vendor.priceRange.min)}</span>
                                        ) : (
                                          <span>{currencyUtils.formatShort(vendor.priceRange.min)} - {currencyUtils.formatShort(vendor.priceRange.max)}</span>
                                        )}
                                      </div>
                                      {/* Price type */}
                                      {vendor.services.length > 0 && vendor.services[0].priceType && (
                                        <div className="text-xs text-gray-500 mt-0.5">
                                          {getPriceTypeLabel(vendor.services[0].priceType)}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              ) : vendor.services.some(s => s.priceType === 'negotiable') ? (
                                <div className="text-sm text-gray-600">Dohodou</div>
                              ) : vendor.services.length > 0 ? (
                                <div className="text-sm text-gray-500">Bez ceny</div>
                              ) : null}

                              {/* Show individual service prices if no price range */}
                              {!vendor.priceRange && vendor.services.length > 0 && (
                                <div className="text-xs text-gray-500 mt-1">
                                  {vendor.services.slice(0, 2).map((service, idx) => {
                                    const displayPrice = service.discountedPrice || service.price
                                    const hasDiscount = service.discountedPrice && service.price && service.discountedPrice < service.price
                                    const discountPercent = hasDiscount && service.price ? Math.round(((service.price - service.discountedPrice!) / service.price) * 100) : 0

                                    return (
                                      <div key={idx}>
                                        {displayPrice ? (
                                          <div>
                                            <span>{currencyUtils.formatShort(displayPrice)}</span>
                                            {hasDiscount && (
                                              <span className="text-green-600 ml-1">(-{discountPercent}%)</span>
                                            )}
                                          </div>
                                        ) : service.priceType === 'negotiable' ? 'Dohodou' : 'Bez ceny'}
                                      </div>
                                    )
                                  })}
                                  {vendor.services.length > 2 && (
                                    <div>+{vendor.services.length - 2} dalších</div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions - Hidden on mobile, shown on desktop in side */}
                  <div className="hidden sm:flex items-center space-x-2 ml-4 flex-shrink-0">
                    <button
                      onClick={() => onViewVendor(vendor)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Zobrazit detail"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onEditVendor(vendor)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Upravit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onDeleteVendor(vendor.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Smazat"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Mobile Actions - Bottom bar like budget module */}
                <div className="sm:hidden flex items-center justify-end space-x-2 pt-3 mt-3 border-t border-gray-100">
                  <button
                    onClick={() => onViewVendor(vendor)}
                    className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Detail</span>
                  </button>

                  <button
                    onClick={() => onEditVendor(vendor)}
                    className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Upravit</span>
                  </button>

                  <button
                    onClick={() => onDeleteVendor(vendor.id)}
                    className="flex items-center space-x-1 px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Smazat</span>
                  </button>
                </div>

                {/* Documents */}
                {vendor.documents && vendor.documents.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-2 mb-3">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">
                        Dokumenty ({vendor.documents.length})
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                      {vendor.documents.map((doc) => {
                        const docTypeLabel = doc.type === 'contract' ? 'Smlouva' :
                          doc.type === 'invoice' ? 'Faktura' :
                          doc.type === 'quote' ? 'Nabídka' :
                          doc.type === 'receipt' ? 'Účtenka' :
                          doc.type === 'insurance' ? 'Pojištění' :
                          doc.type === 'license' ? 'Licence' :
                          doc.type === 'portfolio' ? 'Portfolio' :
                          doc.type === 'delivery-note' ? 'Dodací list' :
                          doc.type === 'payment-proof' ? 'Doklad o platbě' :
                          'Ostatní'

                        return (
                          <a
                            key={doc.id}
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative aspect-square bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-primary-300 rounded-lg p-3 flex flex-col items-center justify-center transition-all hover:shadow-sm"
                            title={`${doc.name}${doc.notes ? ` - ${doc.notes}` : ''}`}
                          >
                            <FileText className="w-8 h-8 text-gray-400 group-hover:text-primary-600 transition-colors mb-2" />
                            <p className="text-xs font-medium text-gray-700 text-center line-clamp-2 mb-1">
                              {doc.name}
                            </p>
                            <p className="text-[10px] text-gray-500 text-center">
                              {docTypeLabel}
                            </p>
                            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Download className="w-3.5 h-3.5 text-primary-600" />
                            </div>
                          </a>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {vendor.tags.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex flex-wrap gap-2">
                      {vendor.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
