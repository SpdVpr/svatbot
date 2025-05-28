'use client'

import { useRouter } from 'next/navigation'
import { useVendorEdit } from '@/hooks/useVendorEdit'
import VendorEditForm from '@/components/admin/VendorEditForm'
import { Loader2 } from 'lucide-react'

export default function NewVendorPage() {
  const router = useRouter()
  const {
    formData,
    loading,
    saving,
    error,
    saveVendor,
    updateFormData
  } = useVendorEdit() // No ID = new vendor

  const handleSave = async (data: any) => {
    // Generate new ID for new vendor
    const newVendorData = {
      ...data,
      id: `vendor-${Date.now()}`
    }
    
    const success = await saveVendor(newVendorData)
    if (success) {
      router.push('/admin/vendors')
    }
    return success
  }

  const handleCancel = () => {
    router.push('/admin/vendors')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Příprava formuláře...</p>
        </div>
      </div>
    )
  }

  if (!formData) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <p className="text-gray-600">Chyba při inicializaci formuláře</p>
          <button
            onClick={() => router.push('/admin/vendors')}
            className="btn-primary mt-4"
          >
            Zpět na seznam
          </button>
        </div>
      </div>
    )
  }

  return (
    <VendorEditForm
      formData={formData}
      onUpdate={updateFormData}
      onSave={handleSave}
      onCancel={handleCancel}
      saving={saving}
      isNew={true}
    />
  )
}
