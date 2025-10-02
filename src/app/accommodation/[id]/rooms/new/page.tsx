'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Bed, Save, Users, DollarSign, Plus, X, Copy } from 'lucide-react'
import { useAccommodation, type RoomFormData } from '@/hooks/useAccommodation'
import type { RoomType, BedType } from '@/types'
import SimpleRoomImageUpload from '@/components/accommodation/SimpleRoomImageUpload'

interface NewRoomPageProps {
  params: {
    id: string
  }
}

export default function NewRoomPage({ params }: NewRoomPageProps) {
  const router = useRouter()
  const { getAccommodationById, addRoom, loading } = useAccommodation()
  const accommodation = getAccommodationById(params.id)
  
  const [formData, setFormData] = useState<RoomFormData>({
    name: '',
    description: '',
    type: 'double',
    capacity: 2,
    maxOccupancy: 2,
    pricePerNight: 0,
    totalPrice: 0,
    amenities: [],
    bedConfiguration: [{ type: 'double', count: 1 }]
  })

  const [newAmenity, setNewAmenity] = useState('')
  const [roomImages, setRoomImages] = useState<string[]>([])
  const [copyCount, setCopyCount] = useState(1)
  const [showCopyOptions, setShowCopyOptions] = useState(false)

  const roomTypes: { value: RoomType; label: string }[] = [
    { value: 'single', label: 'Jednolůžkový' },
    { value: 'double', label: 'Dvoulůžkový' },
    { value: 'twin', label: 'Twin (2 postele)' },
    { value: 'suite', label: 'Apartmá' },
    { value: 'family', label: 'Rodinný pokoj' },
    { value: 'apartment', label: 'Apartmán' },
    { value: 'other', label: 'Jiný' }
  ]

  const bedTypes: { value: BedType; label: string }[] = [
    { value: 'single', label: 'Jednolůžko' },
    { value: 'double', label: 'Manželská postel' },
    { value: 'queen', label: 'Queen size' },
    { value: 'king', label: 'King size' },
    { value: 'sofa-bed', label: 'Rozkládací pohovka' },
    { value: 'bunk-bed', label: 'Patrová postel' }
  ]

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addAmenity = () => {
    if (newAmenity.trim()) {
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

  const updateBedConfiguration = (index: number, field: 'type' | 'count', value: any) => {
    setFormData(prev => ({
      ...prev,
      bedConfiguration: prev.bedConfiguration.map((bed, i) => 
        i === index ? { ...bed, [field]: value } : bed
      )
    }))
  }

  const addBedConfiguration = () => {
    setFormData(prev => ({
      ...prev,
      bedConfiguration: [...prev.bedConfiguration, { type: 'single', count: 1 }]
    }))
  }

  const removeBedConfiguration = (index: number) => {
    if (formData.bedConfiguration.length > 1) {
      setFormData(prev => ({
        ...prev,
        bedConfiguration: prev.bedConfiguration.filter((_, i) => i !== index)
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!accommodation) {
      alert('Ubytování nenalezeno')
      return
    }

    try {
      // Include room images in form data
      const roomDataWithImages = {
        ...formData,
        images: roomImages
      }

      // Create multiple rooms if copyCount > 1
      if (copyCount > 1) {
        const promises = []
        for (let i = 1; i <= copyCount; i++) {
          const copyRoomData = {
            ...roomDataWithImages,
            name: `${formData.name} ${i}`
          }
          promises.push(addRoom(accommodation.id, copyRoomData))
        }
        await Promise.all(promises)
      } else {
        await addRoom(accommodation.id, roomDataWithImages)
      }

      router.push(`/accommodation/${accommodation.id}?tab=rooms`)
    } catch (error) {
      console.error('Error creating room(s):', error)
      alert('Chyba při vytváření pokoje/pokojů')
    }
  }

  if (!accommodation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Bed className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Ubytování nenalezeno</h2>
          <button
            onClick={() => router.push('/accommodation')}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Zpět na přehled
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/accommodation')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Zpět na ubytování"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Bed className="w-6 h-6 text-primary-600" />
                  Nový pokoj
                </h1>
                <p className="text-sm text-gray-600">
                  {accommodation.name}
                </p>
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
                  Název pokoje *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Pokoj č. 101, Deluxe Suite..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Typ pokoje *
                </label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value as RoomType)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {roomTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kapacita (počet lůžek) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="10"
                  value={formData.capacity}
                  onChange={(e) => handleInputChange('capacity', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max. obsazenost *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="15"
                  value={formData.maxOccupancy}
                  onChange={(e) => handleInputChange('maxOccupancy', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cena za noc (Kč) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.pricePerNight}
                  onChange={(e) => handleInputChange('pricePerNight', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Popis pokoje
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Popis pokoje, výhled, speciální vybavení..."
                />
              </div>
            </div>
          </div>

          {/* Bed Configuration */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Konfigurace lůžek</h2>
              <button
                type="button"
                onClick={addBedConfiguration}
                className="inline-flex items-center gap-1 px-3 py-1 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
              >
                <Plus className="w-3 h-3" />
                Přidat lůžko
              </button>
            </div>
            
            <div className="space-y-4">
              {formData.bedConfiguration.map((bed, index) => (
                <div key={index} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Typ lůžka
                    </label>
                    <select
                      value={bed.type}
                      onChange={(e) => updateBedConfiguration(index, 'type', e.target.value as BedType)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      {bedTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="w-24">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Počet
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={bed.count}
                      onChange={(e) => updateBedConfiguration(index, 'count', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  
                  {formData.bedConfiguration.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeBedConfiguration(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Amenities */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Vybavení pokoje</h2>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newAmenity}
                  onChange={(e) => setNewAmenity(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Klimatizace, TV, Minibar..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
                />
                <button
                  type="button"
                  onClick={addAmenity}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {formData.amenities.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.amenities.map((amenity, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm"
                    >
                      {amenity}
                      <button
                        type="button"
                        onClick={() => removeAmenity(index)}
                        className="hover:text-primary-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Room Images */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Fotky pokoje</h2>
            <SimpleRoomImageUpload
              images={roomImages}
              onImagesChange={setRoomImages}
              maxImages={10}
            />
          </div>

          {/* Copy Options */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Kopírování pokojů</h2>
              <button
                type="button"
                onClick={() => setShowCopyOptions(!showCopyOptions)}
                className="inline-flex items-center gap-2 px-3 py-1 text-sm bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors"
              >
                <Copy className="w-4 h-4" />
                {showCopyOptions ? 'Skrýt možnosti' : 'Zobrazit možnosti'}
              </button>
            </div>

            {showCopyOptions && (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800 mb-3">
                    <strong>Tip:</strong> Pokud hotel nabízí více stejných pokojů (např. 5 dvoulůžkových pokojů ve stejné kategorii),
                    můžete je vytvořit najednou. Pokoje budou automaticky očíslovány.
                  </p>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-gray-700">
                        Počet pokojů k vytvoření:
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={copyCount}
                        onChange={(e) => setCopyCount(parseInt(e.target.value) || 1)}
                        className="w-20 px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-center"
                      />
                    </div>

                    {copyCount > 1 && (
                      <div className="text-sm text-gray-600">
                        Vytvoří se pokoje: <strong>{formData.name} 1</strong>, <strong>{formData.name} 2</strong>
                        {copyCount > 2 && <span>, ... <strong>{formData.name} {copyCount}</strong></span>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Zrušit
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <div className="loading-spinner w-4 h-4" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {copyCount > 1 ? `Vytvořit ${copyCount} pokojů` : 'Vytvořit pokoj'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
