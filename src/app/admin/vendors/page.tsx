'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useMarketplaceVendors } from '@/hooks/useMarketplaceVendors'
import { VENDOR_CATEGORIES } from '@/types/vendor'
import {
  Plus,
  Search,
  Filter,
  Edit,
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  Star,
  MapPin,
  Phone,
  Mail,
  Globe
} from 'lucide-react'

export default function AdminVendorsPage() {
  const { vendors, loading, error, deleteVendor } = useMarketplaceVendors()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [deleting, setDeleting] = useState<string | null>(null)

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || vendor.category === selectedCategory
    const matchesStatus = !statusFilter ||
                         (statusFilter === 'active' && vendor.verified) ||
                         (statusFilter === 'pending' && !vendor.verified) ||
                         (statusFilter === 'approved' && vendor.status === 'approved') ||
                         (statusFilter === 'rejected' && vendor.status === 'rejected')

    return matchesSearch && matchesCategory && matchesStatus
  })

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="h-12 bg-gray-200 rounded"></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded"></div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Správa dodavatelů</h1>
          <p className="text-gray-600">Spravujte profily dodavatelů v marketplace</p>
        </div>
        <Link
          href="/admin/vendors/new"
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Přidat dodavatele</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Hledat dodavatele..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Všechny kategorie</option>
            {Object.entries(VENDOR_CATEGORIES).map(([key, config]) => (
              <option key={key} value={key}>
                {config.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Všechny stavy</option>
            <option value="active">Aktivní</option>
            <option value="pending">Čeká na schválení</option>
            <option value="featured">Doporučené</option>
          </select>

          {/* Results count */}
          <div className="flex items-center text-sm text-gray-600">
            Nalezeno: {filteredVendors.length} dodavatelů
          </div>
        </div>
      </div>

      {/* Vendors List */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        {filteredVendors.length === 0 ? (
          <div className="text-center py-12">
            <Filter className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Žádní dodavatelé</h3>
            <p className="mt-1 text-sm text-gray-500">
              Zkuste upravit filtry nebo přidat nového dodavatele.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredVendors.map((vendor) => (
              <div key={vendor.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Vendor Image */}
                    <div className="h-16 w-16 rounded-lg overflow-hidden bg-gray-100">
                      {vendor.images[0] ? (
                        <img
                          src={vendor.images[0]}
                          alt={vendor.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-gray-400">
                          {VENDOR_CATEGORIES[vendor.category as keyof typeof VENDOR_CATEGORIES]?.icon || '📷'}
                        </div>
                      )}
                    </div>

                    {/* Vendor Info */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-medium text-gray-900">{vendor.name}</h3>
                        <div className="flex items-center space-x-1">
                          {vendor.verified && (
                            <div title="Ověřeno">
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            </div>
                          )}
                          {vendor.status === 'approved' && (
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                              Schváleno
                            </span>
                          )}
                          {vendor.status === 'pending' && (
                            <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                              Čeká na schválení
                            </span>
                          )}
                          {vendor.status === 'rejected' && (
                            <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                              Zamítnuto
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mt-1">{vendor.shortDescription}</p>

                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center space-x-1">
                          <span>{VENDOR_CATEGORIES[vendor.category as keyof typeof VENDOR_CATEGORIES]?.icon}</span>
                          <span>{VENDOR_CATEGORIES[vendor.category as keyof typeof VENDOR_CATEGORIES]?.name}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{vendor.address.city}</span>
                        </span>
                      </div>

                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        {vendor.phone && (
                          <span className="flex items-center space-x-1">
                            <Phone className="h-4 w-4" />
                            <span>{vendor.phone}</span>
                          </span>
                        )}
                        {vendor.email && (
                          <span className="flex items-center space-x-1">
                            <Mail className="h-4 w-4" />
                            <span>{vendor.email}</span>
                          </span>
                        )}
                        {vendor.website && (
                          <span className="flex items-center space-x-1">
                            <Globe className="h-4 w-4" />
                            <span>Web</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/marketplace/vendor/${vendor.id}`}
                      className="p-2 text-gray-400 hover:text-gray-600"
                      title="Zobrazit"
                    >
                      <Eye className="h-5 w-5" />
                    </Link>
                    <Link
                      href={`/admin/vendors/${vendor.id}/edit`}
                      className="p-2 text-blue-400 hover:text-blue-600"
                      title="Upravit"
                    >
                      <Edit className="h-5 w-5" />
                    </Link>
                    <button
                      className="p-2 text-red-400 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Smazat"
                      disabled={deleting === vendor.id || !vendor.id}
                      onClick={async () => {
                        if (!vendor.id) return
                        if (confirm('Opravdu chcete smazat tohoto dodavatele? Tato akce je nevratná.')) {
                          setDeleting(vendor.id)
                          console.log('🗑️ Deleting vendor:', vendor.id)
                          const success = await deleteVendor(vendor.id)
                          console.log('🗑️ Delete result:', success)
                          if (!success) {
                            console.error('❌ Failed to delete vendor:', vendor.id)
                            alert('Chyba při mazání dodavatele. Zkontrolujte konzoli pro více informací.')
                          } else {
                            console.log('✅ Vendor deleted successfully:', vendor.id)
                          }
                          setDeleting(null)
                        }
                      }}
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
