'use client'

import { useState, useRef } from 'react'
import { MapPin, Clock, Car, Plus, X, Upload, Trash2, Image as ImageIcon } from 'lucide-react'
import { useWeddingStore } from '@/stores/weddingStore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '@/config/firebase'
import { compressImage } from '@/utils/imageCompression'
import type { InfoContent, VenueInfo } from '@/types/wedding-website'
import VenueAddressAutocomplete from '../VenueAddressAutocomplete'

interface InfoSectionEditorProps {
  content: InfoContent
  onChange: (content: InfoContent) => void
}

export default function InfoSectionEditor({ content, onChange }: InfoSectionEditorProps) {
  const { currentWedding: wedding } = useWeddingStore()
  const [uploadingCeremony, setUploadingCeremony] = useState(false)
  const [uploadingReception, setUploadingReception] = useState(false)
  const ceremonyFileInputRef = useRef<HTMLInputElement>(null)
  const receptionFileInputRef = useRef<HTMLInputElement>(null)

  const handleInputChange = (field: keyof InfoContent, value: any) => {
    onChange({
      ...content,
      [field]: value
    })
  }

  const handleVenueImageUpload = async (
    files: FileList | null,
    venueType: 'ceremony' | 'reception'
  ) => {
    if (!files || files.length === 0) return

    const setUploading = venueType === 'ceremony' ? setUploadingCeremony : setUploadingReception
    setUploading(true)

    try {
      const fileArray = Array.from(files).filter(file => {
        if (!file.type.startsWith('image/')) {
          alert(`Soubor ${file.name} není obrázek`)
          return false
        }
        if (file.size > 10 * 1024 * 1024) {
          alert(`Soubor ${file.name} je příliš velký (max 10MB)`)
          return false
        }
        return true
      })

      if (fileArray.length === 0) return

      const uploadPromises = fileArray.map(async (file, index) => {
        const compressedResult = await compressImage(file, {
          maxWidth: 1200,
          maxHeight: 800,
          quality: 0.85
        })

        const timestamp = Date.now()
        const filename = `wedding-websites/${wedding?.id || 'temp'}/venues/${venueType}/${timestamp}_${index}_${file.name.replace(/\s+/g, '_')}`

        const storageRef = ref(storage, filename)
        const snapshot = await uploadBytes(storageRef, compressedResult.file)
        return await getDownloadURL(snapshot.ref)
      })

      const uploadedUrls = await Promise.all(uploadPromises)
      const currentVenue: VenueInfo = content[venueType] || { time: '', venue: '', address: '' }
      const updatedImages = [...(currentVenue.images || []), ...uploadedUrls]

      handleInputChange(venueType, {
        ...currentVenue,
        images: updatedImages
      })
    } catch (error) {
      console.error('Error uploading images:', error)
      alert('Chyba při nahrávání fotek')
    } finally {
      setUploading(false)
    }
  }

  const removeVenueImage = (venueType: 'ceremony' | 'reception', index: number) => {
    const currentVenue: VenueInfo = content[venueType] || { time: '', venue: '', address: '' }
    const updatedImages = (currentVenue.images || []).filter((_, i) => i !== index)

    handleInputChange(venueType, {
      ...currentVenue,
      images: updatedImages
    })
  }

  const addCustomInfo = () => {
    const customInfo = content.customInfo || []
    const newInfo = {
      id: Date.now().toString(),
      title: '',
      description: '',
      icon: 'info'
    }
    
    handleInputChange('customInfo', [...customInfo, newInfo])
  }

  const updateCustomInfo = (id: string, field: string, value: string) => {
    const customInfo = content.customInfo || []
    const updatedInfo = customInfo.map(info => 
      info.id === id ? { ...info, [field]: value } : info
    )
    
    handleInputChange('customInfo', updatedInfo)
  }

  const removeCustomInfo = (id: string) => {
    const customInfo = content.customInfo || []
    const filteredInfo = customInfo.filter(info => info.id !== id)
    
    handleInputChange('customInfo', filteredInfo)
  }

  // Auto-import dat ze svatby
  const importFromWedding = () => {
    if (!wedding) return

    const updatedContent: InfoContent = {
      ...content,
      enabled: true,
      ceremony: {
        time: content.ceremony?.time || '',
        venue: typeof wedding.venue === 'string' ? wedding.venue : wedding.venue?.name || content.ceremony?.venue || '',
        address: typeof wedding.venue === 'object' && wedding.venue?.address
          ? `${wedding.venue.address.street}, ${wedding.venue.address.city} ${wedding.venue.address.postalCode}`.trim()
          : content.ceremony?.address || '',
        coordinates: content.ceremony?.coordinates
      }
    }

    onChange(updatedContent)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Auto-import */}
      {wedding && (
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">
                Importovat ze svatby
              </h4>
              <p className="text-sm text-blue-700">
                Automaticky vyplnit místo konání z vašich svatebních údajů
              </p>
            </div>
            <button
              onClick={importFromWedding}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Importovat
            </button>
          </div>
        </div>
      )}

      {/* Obřad */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-pink-600" />
          <h3 className="text-lg font-semibold text-gray-900">Obřad</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Místo konání *
            </label>
            <input
              type="text"
              value={content.ceremony?.venue || ''}
              onChange={(e) => handleInputChange('ceremony', { 
                ...content.ceremony, 
                venue: e.target.value 
              })}
              placeholder="Kostel sv. Václava"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Čas
            </label>
            <input
              type="time"
              value={content.ceremony?.time || ''}
              onChange={(e) => handleInputChange('ceremony', { 
                ...content.ceremony, 
                time: e.target.value 
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>

          <div className="md:col-span-2">
            <VenueAddressAutocomplete
              address={content.ceremony?.address || ''}
              onAddressChange={(address) => handleInputChange('ceremony', {
                ...content.ceremony,
                address
              })}
              mapUrl={content.ceremony?.mapUrl}
              onMapUrlChange={(mapUrl) => handleInputChange('ceremony', {
                ...content.ceremony,
                mapUrl
              })}
              placeholder="Václavské náměstí 1, Praha 1"
              label="Adresa"
            />
          </div>
        </div>

        {/* Ceremony Photos */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fotky místa obřadu
          </label>
          <input
            ref={ceremonyFileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleVenueImageUpload(e.target.files, 'ceremony')}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => ceremonyFileInputRef.current?.click()}
            disabled={uploadingCeremony}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {uploadingCeremony ? (
              <>
                <div className="w-4 h-4 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
                Nahrávání...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Nahrát fotky
              </>
            )}
          </button>

          {content.ceremony?.images && content.ceremony.images.length > 0 && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              {content.ceremony.images.map((imageUrl, index) => (
                <div key={index} className="relative group aspect-video">
                  <img
                    src={imageUrl}
                    alt={`Obřad ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removeVenueImage('ceremony', index)}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Hostina */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-pink-600" />
          <h3 className="text-lg font-semibold text-gray-900">Hostina</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Místo konání
            </label>
            <input
              type="text"
              value={content.reception?.venue || ''}
              onChange={(e) => handleInputChange('reception', { 
                ...content.reception, 
                venue: e.target.value 
              })}
              placeholder="Hotel Grand"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Čas
            </label>
            <input
              type="time"
              value={content.reception?.time || ''}
              onChange={(e) => handleInputChange('reception', { 
                ...content.reception, 
                time: e.target.value 
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>

          <div className="md:col-span-2">
            <VenueAddressAutocomplete
              address={content.reception?.address || ''}
              onAddressChange={(address) => handleInputChange('reception', {
                ...content.reception,
                address
              })}
              mapUrl={content.reception?.mapUrl}
              onMapUrlChange={(mapUrl) => handleInputChange('reception', {
                ...content.reception,
                mapUrl
              })}
              placeholder="Národní třída 10, Praha 1"
              label="Adresa"
            />
          </div>
        </div>

        {/* Reception Photos */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fotky místa hostiny
          </label>
          <input
            ref={receptionFileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleVenueImageUpload(e.target.files, 'reception')}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => receptionFileInputRef.current?.click()}
            disabled={uploadingReception}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {uploadingReception ? (
              <>
                <div className="w-4 h-4 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
                Nahrávání...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Nahrát fotky
              </>
            )}
          </button>

          {content.reception?.images && content.reception.images.length > 0 && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              {content.reception.images.map((imageUrl, index) => (
                <div key={index} className="relative group aspect-video">
                  <img
                    src={imageUrl}
                    alt={`Hostina ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removeVenueImage('reception', index)}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Parkování */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Car className="w-5 h-5 text-pink-600" />
          <h3 className="text-lg font-semibold text-gray-900">Parkování</h3>
        </div>

        <textarea
          value={content.parking || ''}
          onChange={(e) => handleInputChange('parking', e.target.value)}
          placeholder="Informace o parkování - kde zaparkovat, zda je parkování zdarma, atd."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
        />
      </div>

      {/* Vlastní informace */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Další informace</h3>
          <button
            onClick={addCustomInfo}
            className="inline-flex items-center gap-2 bg-pink-500 text-white px-3 py-2 rounded-lg hover:bg-pink-600 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Přidat
          </button>
        </div>

        {content.customInfo && content.customInfo.length > 0 ? (
          <div className="space-y-4">
            {content.customInfo.map((info) => (
              <div key={info.id} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-1 space-y-3">
                  <input
                    type="text"
                    value={info.title}
                    onChange={(e) => updateCustomInfo(info.id, 'title', e.target.value)}
                    placeholder="Nadpis (např. Doprava)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                  <textarea
                    value={info.description}
                    onChange={(e) => updateCustomInfo(info.id, 'description', e.target.value)}
                    placeholder="Popis informace..."
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={() => removeCustomInfo(info.id)}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">
            Zatím nemáte žádné další informace. Klikněte na "Přidat" pro vytvoření nové.
          </p>
        )}
      </div>
    </div>
  )
}
