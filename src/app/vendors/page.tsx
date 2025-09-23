'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useVendor } from '@/hooks/useVendor'
import { Vendor, VendorFormData } from '@/types/vendor'
import VendorStats from '@/components/vendors/VendorStats'
import VendorForm from '@/components/vendor/VendorForm'

import {
  Building,
  ArrowLeft,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'

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

  // Handle view vendor - for now just edit
  const handleViewVendor = (vendor: Vendor) => {
    handleEditVendor(vendor)
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
            role: 'primary',
            isPrimary: true
          }],
          address: data.address,
          businessName: data.businessName,
          services: data.services,
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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Přihlášení vyžadováno
          </h1>
          <p className="text-text-muted">
            Pro přístup ke správě dodavatelů se musíte přihlásit.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        {/* Breadcrumb - Hidden on mobile */}
        <div className="hidden sm:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2 py-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-gray-700 transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Dodavatelé</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Mobile header */}
          <div className="sm:hidden space-y-4 py-4">
            {/* Top row - Back button and title */}
            <div className="flex items-center space-x-3">
              <Link
                href="/"
                className="flex items-center justify-center w-8 h-8 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Dodavatelé</h1>
              </div>
            </div>

            {/* Main action button - prominent placement */}
            <div className="flex justify-center">
              <button
                onClick={handleAddVendor}
                className="btn-primary flex items-center space-x-2 px-6 py-3 text-base font-medium"
              >
                <Plus className="w-5 h-5" />
                <span>Přidat dodavatele</span>
              </button>
            </div>
          </div>

          {/* Desktop header */}
          <div className="hidden sm:flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                  <Building className="w-6 h-6 text-primary-600" />
                  <span>Správa dodavatelů</span>
                </h1>
                <p className="text-sm text-text-muted">
                  Spravujte všechny dodavatele pro vaši svatbu
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-primary-600">{stats.total}</div>
                <div className="text-sm text-gray-600">Dodavatelů</div>
              </div>
              <button
                onClick={handleAddVendor}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Přidat dodavatele</span>
              </button>
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

          {/* Vendor Stats with List */}
          <VendorStats
            onAddVendor={handleAddVendor}
            onEditVendor={handleEditVendor}
            onDeleteVendor={handleDeleteVendor}
            onViewVendor={handleViewVendor}
          />
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
