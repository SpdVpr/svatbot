'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { useVendorEdit } from '@/hooks/useVendorEdit'
import VendorEditForm from '@/components/admin/VendorEditForm'
import { Loader2, AlertCircle } from 'lucide-react'

interface VendorEditPageProps {
  params: Promise<{
    id: string
  }>
}

export default function VendorEditPage({ params }: VendorEditPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const {
    vendor,
    formData,
    loading,
    saving,
    error,
    saveVendor,
    updateFormData
  } = useVendorEdit(id)

  const handleSave = async (data: any) => {
    const success = await saveVendor(data)
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
          <p className="text-gray-600">Načítání dodavatele...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Chyba při načítání</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/admin/vendors')}
            className="btn-primary"
          >
            Zpět na seznam
          </button>
        </div>
      </div>
    )
  }

  if (!formData) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Dodavatel nenalezen</h2>
          <p className="text-gray-600 mb-4">Požadovaný dodavatel neexistuje nebo byl smazán.</p>
          <button
            onClick={() => router.push('/admin/vendors')}
            className="btn-primary"
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
      isNew={false}
    />
  )
}
