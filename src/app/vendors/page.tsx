'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useVendor } from '@/hooks/useVendor'
import { Vendor, VendorFormData } from '@/types/vendor'
import VendorStats from '@/components/vendors/VendorStats'
import VendorForm from '@/components/vendor/VendorForm'
import ModuleHeader from '@/components/common/ModuleHeader'

import {
  Briefcase,
  AlertCircle,
  Plus
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
          address: data.address ? {
            ...data.address,
            country: 'Czech Republic'
          } : undefined,
          businessName: data.businessName,
          services: data.services.map((service, index) => ({
            id: service.id || editingVendor.services[index]?.id || `service-${Date.now()}-${Math.random()}`,
            name: service.name,
            description: service.description,
            price: service.price,
            discountedPrice: service.discountedPrice,
            priceType: service.priceType,
            included: service.included || []
          })),
          status: data.status,
          priority: data.priority,
          notes: data.notes,
          tags: data.tags,
          documents: data.documents
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
    <div className="min-h-screen">
      {/* Header */}
      <ModuleHeader
        icon={Briefcase}
        title="Dodavatelé"
        subtitle={`${vendors.length} dodavatelů • ${stats.byStatus.contracted || 0} potvrzeno`}
        iconGradient="from-orange-500 to-amber-500"
        actions={
          <button
            onClick={handleAddVendor}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Přidat dodavatele</span>
            <span className="sm:hidden">Přidat</span>
          </button>
        }
      />

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
            tags: editingVendor.tags,
            documents: editingVendor.documents
          } : undefined}
          isEditing={!!editingVendor}
        />
      )}


    </div>
  )
}
