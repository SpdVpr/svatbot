'use client'

import { useState } from 'react'
import { useMarketplaceVendors } from '@/hooks/useMarketplaceVendors'
import {
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  Clock,
  Mail,
  Phone,
  Globe,
  MapPin,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { VENDOR_CATEGORIES } from '@/types/vendor'
import MarketplaceSettingsPanel from '@/components/admin/MarketplaceSettingsPanel'

export default function AdminMarketplacePage() {
  const {
    vendors,
    loading,
    error,
    getPendingVendors,
    getApprovedVendors,
    approveVendor,
    rejectVendor,
    deleteVendor
  } = useMarketplaceVendors()

  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')
  const [selectedVendor, setSelectedVendor] = useState<any>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const pendingVendors = getPendingVendors()
  const approvedVendors = getApprovedVendors()

  const filteredVendors = vendors.filter(v => {
    if (filter === 'all') return true
    return v.status === filter
  })

  const handleApprove = async (vendorId: string) => {
    setActionLoading(vendorId)
    const success = await approveVendor(vendorId)
    if (success) {
      setSelectedVendor(null)
    }
    setActionLoading(null)
  }

  const handleReject = async (vendorId: string) => {
    if (!confirm('Opravdu chcete odmítnout tohoto dodavatele?')) return
    
    setActionLoading(vendorId)
    const success = await rejectVendor(vendorId)
    if (success) {
      setSelectedVendor(null)
    }
    setActionLoading(null)
  }

  const handleDelete = async (vendorId: string) => {
    if (!confirm('Opravdu chcete smazat tohoto dodavatele? Tato akce je nevratná.')) return
    
    setActionLoading(vendorId)
    const success = await deleteVendor(vendorId)
    if (success) {
      setSelectedVendor(null)
    }
    setActionLoading(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Načítání dodavatelů...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-start space-x-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-900">Chyba při načítání</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Marketplace - Správa dodavatelů</h1>
        <p className="text-gray-600 mt-2">
          Schvalujte nové registrace a spravujte marketplace dodavatele
        </p>
      </div>

      {/* Marketplace Settings Panel */}
      <MarketplaceSettingsPanel />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Čekající</p>
              <p className="text-2xl font-bold text-orange-600">{pendingVendors.length}</p>
            </div>
            <Clock className="w-8 h-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Schválení</p>
              <p className="text-2xl font-bold text-green-600">{approvedVendors.length}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Odmítnutí</p>
              <p className="text-2xl font-bold text-red-600">
                {vendors.filter(v => v.status === 'rejected').length}
              </p>
            </div>
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Celkem</p>
              <p className="text-2xl font-bold text-gray-900">{vendors.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Všichni ({vendors.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'pending'
                ? 'bg-orange-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Čekající ({pendingVendors.length})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'approved'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Schválení ({approvedVendors.length})
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'rejected'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Odmítnutí ({vendors.filter(v => v.status === 'rejected').length})
          </button>
        </div>
      </div>

      {/* Vendors List */}
      <div className="space-y-4">
        {filteredVendors.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <p className="text-gray-600">Žádní dodavatelé v této kategorii</p>
          </div>
        ) : (
          filteredVendors.map((vendor) => (
            <div
              key={vendor.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-2xl">
                      {VENDOR_CATEGORIES[vendor.category as keyof typeof VENDOR_CATEGORIES]?.icon || '📦'}
                    </span>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{vendor.name}</h3>
                      <p className="text-sm text-gray-600">
                        {VENDOR_CATEGORIES[vendor.category as keyof typeof VENDOR_CATEGORIES]?.name || vendor.category}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      vendor.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                      vendor.status === 'approved' ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {vendor.status === 'pending' ? 'Čeká na schválení' :
                       vendor.status === 'approved' ? 'Schváleno' :
                       'Odmítnuto'}
                    </span>
                  </div>

                  <p className="text-gray-700 mb-3">{vendor.shortDescription}</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span>{vendor.email}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{vendor.phone}</span>
                    </div>
                    {vendor.website && (
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Globe className="w-4 h-4" />
                        <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="hover:text-primary-600">
                          Web
                        </a>
                      </div>
                    )}
                    <div className="flex items-center space-x-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{vendor.address.city}, {vendor.address.region}</span>
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-gray-500">
                    Registrováno: {vendor.createdAt ? new Date(vendor.createdAt).toLocaleDateString('cs-CZ') : 'N/A'}
                  </div>
                </div>

                <div className="flex flex-col space-y-2 ml-4">
                  <button
                    onClick={() => setSelectedVendor(vendor)}
                    className="btn-ghost p-2"
                    title="Zobrazit detail"
                  >
                    <Eye className="w-5 h-5" />
                  </button>

                  {vendor.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(vendor.id!)}
                        disabled={actionLoading === vendor.id}
                        className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
                        title="Schválit"
                      >
                        {actionLoading === vendor.id ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <CheckCircle className="w-5 h-5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleReject(vendor.id!)}
                        disabled={actionLoading === vendor.id}
                        className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                        title="Odmítnout"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => handleDelete(vendor.id!)}
                    disabled={actionLoading === vendor.id}
                    className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                    title="Smazat"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Detail Modal */}
      {selectedVendor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">{selectedVendor.name}</h2>
                <button
                  onClick={() => setSelectedVendor(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <XCircle className="w-6 h-6 text-gray-400" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Popis</h3>
                <p className="text-gray-700">{selectedVendor.description}</p>
              </div>

              {/* Images */}
              {(selectedVendor.images?.length > 0 || selectedVendor.portfolioImages?.length > 0) && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Fotografie</h3>

                  {selectedVendor.images?.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">Hlavní obrázky ({selectedVendor.images.length})</p>
                      <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                        {selectedVendor.images.map((url: string, index: number) => (
                          <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                            <img
                              src={url}
                              alt={`Obrázek ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedVendor.portfolioImages?.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Portfolio ({selectedVendor.portfolioImages.length})</p>
                      <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                        {selectedVendor.portfolioImages.map((url: string, index: number) => (
                          <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                            <img
                              src={url}
                              alt={`Portfolio ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Služby</h3>
                <div className="space-y-3">
                  {selectedVendor.services.map((service: any, index: number) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900">{service.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                      {service.price && (
                        <p className="text-sm text-gray-700 mt-2">
                          Cena: {service.price} Kč ({service.priceType})
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {selectedVendor.features.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Vlastnosti</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedVendor.features.map((feature: string, index: number) => (
                      <span key={index} className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              {selectedVendor.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleApprove(selectedVendor.id!)}
                    disabled={actionLoading === selectedVendor.id}
                    className="btn-primary"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Schválit
                  </button>
                  <button
                    onClick={() => handleReject(selectedVendor.id!)}
                    disabled={actionLoading === selectedVendor.id}
                    className="btn-outline text-red-600 border-red-600 hover:bg-red-50"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Odmítnout
                  </button>
                </>
              )}
              <button
                onClick={() => setSelectedVendor(null)}
                className="btn-ghost"
              >
                Zavřít
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

