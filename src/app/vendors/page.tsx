'use client'

import { useState } from 'react'
import {
  Building,
  ArrowLeft,
  TrendingUp,
  Users,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Calendar,
  Star,
  Filter,
  BarChart3,
  Search,
  ShoppingBag,
  ExternalLink
} from 'lucide-react'
import Link from 'next/link'
import { useVendor } from '@/hooks/useVendor'
import { useAuth } from '@/hooks/useAuth'
import VendorForm from '@/components/vendor/VendorForm'
import VendorList from '@/components/vendor/VendorList'
import { Vendor, VendorFormData, VENDOR_CATEGORIES } from '@/types/vendor'
import { currencyUtils } from '@/utils'

export default function VendorsPage() {
  const { user } = useAuth()
  const {
    vendors,
    loading,
    error,
    stats,
    createVendor,
    updateVendor,
    deleteVendor,
    clearError
  } = useVendor()

  const [showForm, setShowForm] = useState(false)
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null)
  const [viewingVendor, setViewingVendor] = useState<Vendor | null>(null)

  // Handle add vendor
  const handleAddVendor = () => {
    setEditingVendor(null)
    setShowForm(true)
  }

  // Handle edit vendor
  const handleEditVendor = (vendor: Vendor) => {
    setEditingVendor(vendor)
    setShowForm(true)
  }

  // Handle view vendor
  const handleViewVendor = (vendor: Vendor) => {
    setViewingVendor(vendor)
  }

  // Handle delete vendor
  const handleDeleteVendor = async (vendorId: string) => {
    if (window.confirm('Opravdu chcete smazat tohoto dodavatele?')) {
      try {
        await deleteVendor(vendorId)
      } catch (error) {
        console.error('Error deleting vendor:', error)
      }
    }
  }

  // Handle form submit
  const handleFormSubmit = async (data: VendorFormData) => {
    try {
      if (editingVendor) {
        // Update existing vendor
        await updateVendor(editingVendor.id, {
          name: data.name,
          category: data.category,
          description: data.description,
          website: data.website,
          contacts: [{
            name: data.contactName,
            email: data.contactEmail,
            phone: data.contactPhone,
            isPrimary: true
          }],
          address: data.address ? {
            ...data.address,
            country: (data.address as any).country || 'Česká republika'
          } : undefined,
          businessName: data.businessName,
          services: data.services.map((service: any) => ({
            id: service.id || crypto.randomUUID(),
            name: service.name,
            description: service.description,
            price: service.price,
            priceType: service.priceType,
            duration: service.duration,
            included: service.included || [],
            excluded: service.excluded
          })),
          status: data.status,
          priority: data.priority,
          notes: data.notes,
          tags: data.tags
        })
      } else {
        // Create new vendor
        await createVendor(data)
      }

      setShowForm(false)
      setEditingVendor(null)
    } catch (error) {
      console.error('Error saving vendor:', error)
      throw error
    }
  }

  // Handle form cancel
  const handleFormCancel = () => {
    setShowForm(false)
    setEditingVendor(null)
  }

  // Get category stats for overview
  const categoryStats = Object.entries(VENDOR_CATEGORIES).map(([key, config]) => ({
    category: key,
    name: config.name,
    icon: config.icon,
    color: config.color,
    count: stats.byCategory[key as keyof typeof stats.byCategory] || 0,
    vendors: vendors.filter(v => v.category === key)
  })).filter(stat => stat.count > 0)

  if (!user) {
    return (
      <div className="min-h-screen wedding-gradient flex items-center justify-center">
        <div className="text-center">
          <Building className="w-16 h-16 text-primary-500 mx-auto mb-4" />
          <h2 className="heading-3 mb-2">Přihlaste se</h2>
          <p className="body-normal text-text-muted">
            Pro správu dodavatelů se musíte přihlásit.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container-desktop py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="heading-3 flex items-center space-x-2">
                  <Building className="w-6 h-6 text-primary-600" />
                  <span>Správa dodavatelů</span>
                </h1>
                <p className="body-small text-text-muted">
                  Spravujte všechny dodavatele pro vaši svatbu
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-primary-600">{stats.totalVendors}</div>
                <div className="text-sm text-gray-600">Dodavatelů</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-desktop py-8">
        <div className="space-y-8">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-red-700">{error}</p>
              </div>
              <button
                onClick={clearError}
                className="text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </div>
          )}

          {/* Marketplace Integration Info */}
          <div className="wedding-card bg-gradient-to-r from-primary-50 to-blue-50 border-primary-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-primary-100 rounded-xl">
                  <ShoppingBag className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="heading-4 text-primary-900">Najděte nové dodavatele</h3>
                  <p className="body-small text-primary-700">
                    Prohlédněte si marketplace s ověřenými dodavateli a přidejte je do svého seznamu
                  </p>
                </div>
              </div>
              <div className="flex space-x-3">
                <Link
                  href="/marketplace"
                  className="btn-primary flex items-center space-x-2"
                >
                  <Search className="w-4 h-4" />
                  <span>Procházet marketplace</span>
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-primary-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary-600">500+</div>
                  <div className="text-sm text-primary-700">Ověřených dodavatelů</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary-600">15</div>
                  <div className="text-sm text-primary-700">Kategorií služeb</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary-600">4.8★</div>
                  <div className="text-sm text-primary-700">Průměrné hodnocení</div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Vendors */}
            <div className="wedding-card">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-primary-100 rounded-xl">
                  <Building className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stats.totalVendors}</div>
                  <div className="text-sm text-gray-600">Celkem dodavatelů</div>
                </div>
              </div>
            </div>

            {/* Contracted Vendors */}
            <div className="wedding-card">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-green-100 rounded-xl">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {(stats.byStatus.contracted || 0) + (stats.byStatus.booked || 0)}
                  </div>
                  <div className="text-sm text-gray-600">Rezervováno</div>
                </div>
              </div>
            </div>

            {/* Total Services Value */}
            <div className="wedding-card">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {currencyUtils.formatShort(stats.totalContractValue)}
                  </div>
                  <div className="text-sm text-gray-600">Hodnota služeb</div>
                </div>
              </div>
            </div>

            {/* Completion Rate */}
            <div className="wedding-card">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stats.completionRate}%</div>
                  <div className="text-sm text-gray-600">Dokončeno</div>
                </div>
              </div>
            </div>
          </div>

          {/* Category Overview */}
          {categoryStats.length > 0 && (
            <div className="wedding-card">
              <h2 className="heading-4 mb-6 flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-primary-600" />
                <span>Přehled podle kategorií</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryStats.map((stat) => (
                  <div key={stat.category} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="text-2xl">{stat.icon}</span>
                      <div>
                        <h3 className="font-medium text-gray-900">{stat.name}</h3>
                        <p className="text-sm text-gray-600">{stat.count} dodavatelů</p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      {stat.vendors.slice(0, 3).map((vendor) => (
                        <div key={vendor.id} className="text-sm text-gray-600 truncate">
                          • {vendor.name}
                        </div>
                      ))}
                      {stat.vendors.length > 3 && (
                        <div className="text-sm text-gray-500">
                          a {stat.vendors.length - 3} dalších...
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Vendor List */}
          <div className="wedding-card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="heading-4">Seznam dodavatelů</h2>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Users className="w-4 h-4" />
                <span>{vendors.length} dodavatelů</span>
              </div>
            </div>

            <VendorList
              vendors={vendors}
              onAddVendor={handleAddVendor}
              onEditVendor={handleEditVendor}
              onDeleteVendor={handleDeleteVendor}
              onViewVendor={handleViewVendor}
              loading={loading}
            />
          </div>
        </div>
      </main>

      {/* Vendor Form Modal */}
      {showForm && (
        <VendorForm
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          initialData={editingVendor ? {
            name: editingVendor.name,
            category: editingVendor.category,
            description: editingVendor.description,
            website: editingVendor.website,
            contactName: editingVendor.contacts[0]?.name || '',
            contactEmail: editingVendor.contacts[0]?.email || '',
            contactPhone: editingVendor.contacts[0]?.phone || '',
            address: editingVendor.address,
            businessName: editingVendor.businessName,
            services: editingVendor.services,
            status: editingVendor.status,
            priority: editingVendor.priority,
            notes: editingVendor.notes,
            tags: editingVendor.tags
          } : undefined}
          isEditing={!!editingVendor}
        />
      )}
    </div>
  )
}
