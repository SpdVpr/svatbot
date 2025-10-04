'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Building2, Save, MapPin, Phone, Mail, Globe, Plus, X } from 'lucide-react'
import { useAccommodation, type AccommodationFormData } from '@/hooks/useAccommodation'
import AccommodationImageUpload from '@/components/accommodation/AccommodationImageUpload'

interface EditAccommodationPageProps {
  params: {
    id: string
  }
}

export default function EditAccommodationPage({ params }: EditAccommodationPageProps) {
  const router = useRouter()
  const { getAccommodationById, updateAccommodation, loading } = useAccommodation()
  
  const accommodation = getAccommodationById(params.id)

  const [formData, setFormData] = useState<AccommodationFormData>({
    name: '',
    description: '',
    address: {
      street: '',
      city: '',
      postalCode: '',
      country: 'Česká republika'
    },
    contactInfo: {
      phone: '',
      email: '',
      website: ''
    },
    amenities: [],
    policies: {
      checkIn: '15:00',
      checkOut: '11:00',
      cancellationPolicy: '',
      petPolicy: '',
      smokingPolicy: '',
      childrenPolicy: '',
      additionalFees: []
    }
  })

  const [accommodationImages, setAccommodationImages] = useState<string[]>([])
  const [newAmenity, setNewAmenity] = useState('')
  const [saving, setSaving] = useState(false)

  // Initialize form data when accommodation is loaded
  useEffect(() => {
    if (accommodation) {
      setFormData({
        name: accommodation.name,
        description: accommodation.description || '',
        address: { ...accommodation.address },
        contactInfo: { ...accommodation.contactInfo },
        amenities: [...accommodation.amenities],
        policies: accommodation.policies ? { ...accommodation.policies } : {
          checkIn: '15:00',
          checkOut: '11:00',
          cancellationPolicy: '',
          petPolicy: '',
          smokingPolicy: '',
          childrenPolicy: '',
          additionalFees: []
        }
      })
      setAccommodationImages([...accommodation.images])
    }
  }, [accommodation])

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof AccommodationFormData] as any),
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const addAmenity = () => {
    if (newAmenity.trim() && !formData.amenities.includes(newAmenity.trim())) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, newAmenity.trim()]
      }))
      setNewAmenity('')
    }
  }

  const removeAmenity = (index: number) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!accommodation) {
      alert('Ubytování nenalezeno')
      return
    }

    try {
      setSaving(true)
      
      // Include accommodation images in form data
      const accommodationDataWithImages = {
        ...formData,
        images: accommodationImages
      }
      
      await updateAccommodation(accommodation.id, accommodationDataWithImages)
      router.push(`/accommodation/${accommodation.id}`)
    } catch (error) {
      console.error('Error updating accommodation:', error)
      alert('Chyba při aktualizaci ubytování')
    } finally {
      setSaving(false)
    }
  }

  if (!accommodation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Ubytování nenalezeno</h2>
          <button
            onClick={() => router.push('/accommodation')}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Zpět na ubytování
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/accommodation')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Zpět na ubytování"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Upravit ubytování</h1>
                <p className="text-gray-600">{accommodation.name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Základní informace</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Název ubytování *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Hotel Paradise, Penzion U Lesa..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Poznámky k ubytování
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Poznámky, důležité informace..."
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Adresa</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ulice a číslo popisné *
                </label>
                <input
                  type="text"
                  required
                  value={formData.address.street}
                  onChange={(e) => handleInputChange('address.street', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Hlavní 123"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Město *
                </label>
                <input
                  type="text"
                  required
                  value={formData.address.city}
                  onChange={(e) => handleInputChange('address.city', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Praha"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PSČ *
                </label>
                <input
                  type="text"
                  required
                  value={formData.address.postalCode}
                  onChange={(e) => handleInputChange('address.postalCode', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="110 00"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Kontaktní informace</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefon
                </label>
                <input
                  type="tel"
                  value={formData.contactInfo.phone}
                  onChange={(e) => handleInputChange('contactInfo.phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="+420 123 456 789"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.contactInfo.email}
                  onChange={(e) => handleInputChange('contactInfo.email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="info@hotel.cz"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Webové stránky
                </label>
                <input
                  type="url"
                  value={formData.contactInfo.website}
                  onChange={(e) => handleInputChange('contactInfo.website', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="https://www.hotel.cz"
                />
              </div>
            </div>
          </div>



          {/* Accommodation Images */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Fotky ubytování</h2>
            <AccommodationImageUpload
              images={accommodationImages}
              onImagesChange={setAccommodationImages}
              maxImages={15}
              disabled={saving}
            />
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={() => router.push(`/accommodation/${accommodation.id}`)}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Zrušit
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              {saving ? (
                <div className="loading-spinner w-4 h-4" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Uložit změny
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
