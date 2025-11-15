'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import MarketplaceVendorForm, { MarketplaceVendorFormData } from '@/components/marketplace/MarketplaceVendorForm'
import { ArrowLeft, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { db } from '@/config/firebase'
import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore'

// Recursively remove undefined values from objects (Firestore doesn't accept undefined)
function cleanForFirestore(obj: any): any {
  if (obj === null || obj === undefined) {
    return null
  }

  if (Array.isArray(obj)) {
    return obj.map(item => cleanForFirestore(item)).filter(item => item !== null && item !== undefined)
  }

  if (typeof obj === 'object') {
    const cleaned: any = {}
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        const cleanedValue = cleanForFirestore(value)
        if (cleanedValue !== null && cleanedValue !== undefined) {
          cleaned[key] = cleanedValue
        }
      }
    }
    return cleaned
  }

  return obj
}

interface PageProps {
  params: {
    token: string
  }
}

export default function MarketplaceEditPage({ params }: PageProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [vendorData, setVendorData] = useState<MarketplaceVendorFormData | null>(null)
  const [vendorId, setVendorId] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  // Load vendor data by token
  useEffect(() => {
    const loadVendorData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Query Firestore for vendor with this edit token
        const vendorsRef = collection(db, 'marketplaceVendors')
        const q = query(vendorsRef, where('editToken', '==', params.token))
        const querySnapshot = await getDocs(q)

        if (querySnapshot.empty) {
          setError('Neplatný editační odkaz. Zkontrolujte prosím, že jste použili správný odkaz.')
          setLoading(false)
          return
        }

        // Get the first (and should be only) matching vendor
        const vendorDoc = querySnapshot.docs[0]
        const data = vendorDoc.data() as MarketplaceVendorFormData

        setVendorId(vendorDoc.id)
        setVendorData(data)
        setLoading(false)

        console.log('✅ Vendor data loaded for editing:', vendorDoc.id)
      } catch (err) {
        console.error('Error loading vendor data:', err)
        setError('Chyba při načítání dat. Zkuste to prosím znovu.')
        setLoading(false)
      }
    }

    loadVendorData()
  }, [params.token])

  const handleSubmit = async (data: MarketplaceVendorFormData) => {
    if (!vendorId) {
      setError('Chyba: ID dodavatele nebylo nalezeno')
      return
    }

    setSaving(true)
    try {
      // Remove undefined values from data (Firestore doesn't accept undefined)
      const cleanData = cleanForFirestore(data) as MarketplaceVendorFormData

      // Update vendor in Firestore
      const vendorRef = doc(db, 'marketplaceVendors', vendorId)
      await updateDoc(vendorRef, {
        ...cleanData,
        updatedAt: serverTimestamp(),
        lastActive: serverTimestamp()
      })

      console.log('✅ Vendor updated successfully:', vendorId)

      setSaved(true)

      // Redirect to marketplace after 5 seconds
      setTimeout(() => {
        router.push('/marketplace')
      }, 5000)
    } catch (error) {
      console.error('Error updating vendor:', error)
      setError('Chyba při ukládání změn. Zkuste to prosím znovu.')
    } finally {
      setSaving(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Načítám data inzerátu...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error && !vendorData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Chyba</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/marketplace" className="btn-primary inline-flex items-center">
            Zpět na marketplace
          </Link>
        </div>
      </div>
    )
  }

  // Success state
  if (saved) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Změny uloženy!</h2>
          <p className="text-gray-600 mb-4">
            Váš inzerát byl úspěšně aktualizován.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              Budete automaticky přesměrováni na marketplace za 5 sekund...
            </p>
          </div>
          <Link href="/marketplace" className="btn-primary inline-flex items-center">
            Zpět na marketplace
          </Link>
        </div>
      </div>
    )
  }

  // Edit form
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/marketplace"
              className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Zpět na marketplace
            </Link>
            <div className="text-sm text-gray-500">
              Editace inzerátu
            </div>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border-b border-blue-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <p className="text-sm text-blue-800 text-center">
            💡 Upravte své údaje a klikněte na "Uložit změny" na konci formuláře
          </p>
        </div>
      </div>

      {/* Form */}
      {vendorData && (
        <MarketplaceVendorForm
          initialData={vendorData}
          onSubmit={handleSubmit}
          onCancel={() => router.push('/marketplace')}
          submitButtonText="Uložit změny"
        />
      )}

      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}
    </div>
  )
}

