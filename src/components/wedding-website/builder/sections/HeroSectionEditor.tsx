'use client'

import { useState, useRef, useEffect } from 'react'
import { Calendar, Upload, X, Image as ImageIcon, Move, RotateCw, Loader2 } from 'lucide-react'
import { useWeddingStore } from '@/stores/weddingStore'
import { useWeddingImageUpload } from '@/hooks/useWeddingImageUpload'
import type { HeroContent } from '@/types/wedding-website'
import { Timestamp } from 'firebase/firestore'

// Helper funkce pro formátování data
const formatDate = (date: any): string => {
  if (!date) return ''

  let dateObj: Date

  if (date instanceof Date) {
    dateObj = date
  } else if (date instanceof Timestamp) {
    dateObj = date.toDate()
  } else if (typeof date === 'string') {
    dateObj = new Date(date)
  } else if (date.seconds) {
    // Firestore Timestamp object
    dateObj = new Date(date.seconds * 1000)
  } else {
    return ''
  }

  return dateObj.toLocaleDateString('cs-CZ', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

interface HeroSectionEditorProps {
  content: HeroContent
  onChange: (content: HeroContent) => void
}

export default function HeroSectionEditor({ content, onChange }: HeroSectionEditorProps) {
  const { currentWedding: wedding } = useWeddingStore()
  const { uploadImage, uploading, progress, error: uploadError } = useWeddingImageUpload()
  const [dragOver, setDragOver] = useState(false)
  const [imagePosition, setImagePosition] = useState(content.imagePosition || { x: 50, y: 50 })
  const [imageScale, setImageScale] = useState(content.imageScale || 100)
  const imageRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    setImagePosition(content.imagePosition || { x: 50, y: 50 })
    setImageScale(content.imageScale || 100)
  }, [content.imagePosition, content.imageScale])

  // Auto-import dat ze svatby
  const importFromWedding = () => {
    if (!wedding) return

    const updatedContent: HeroContent = {
      ...content,
      bride: wedding.brideName || content.bride,
      groom: wedding.groomName || content.groom,
      weddingDate: wedding.weddingDate || content.weddingDate,
    }

    onChange(updatedContent)
  }

  const handleInputChange = (field: keyof HeroContent, value: any) => {
    onChange({
      ...content,
      [field]: value
    })
  }

  const handleImageUpload = async (file: File) => {
    try {
      console.log('🖼️ Nahrávání obrázku do Firebase Storage...')
      // Use higher quality for hero image
      const result = await uploadImage(file, 'wedding-websites', {
        maxWidth: 2560,
        maxHeight: 1440,
        quality: 0.92,
        maxSizeKB: 2500 // Max 2.5MB for better quality
      })
      console.log('✅ Obrázek nahrán:', result.url)
      handleInputChange('mainImage', result.url)
    } catch (error) {
      console.error('❌ Chyba při nahrávání obrázku:', error)
      // Fallback to base64 if upload fails
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string
        handleInputChange('mainImage', imageUrl)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    const imageFile = files.find(file => file.type.startsWith('image/'))
    
    if (imageFile) {
      handleImageUpload(imageFile)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      handleImageUpload(file)
    }
  }

  const formatDateForInput = (date: Date | any | null) => {
    if (!date) return ''

    // Handle Firestore Timestamp
    if (date && typeof date.toDate === 'function') {
      return date.toDate().toISOString().split('T')[0]
    }

    // Handle Date object
    if (date instanceof Date) {
      return date.toISOString().split('T')[0]
    }

    // Handle string dates
    if (typeof date === 'string') {
      return new Date(date).toISOString().split('T')[0]
    }

    return ''
  }

  const parseInputDate = (dateString: string) => {
    return dateString ? new Date(dateString) : null
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
                Automaticky vyplnit jména a datum z vašich svatebních údajů
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

      {/* Jména snoubenců */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Jméno nevěsty *
          </label>
          <input
            type="text"
            value={content.bride}
            onChange={(e) => handleInputChange('bride', e.target.value)}
            placeholder="Jana"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Jméno ženicha *
          </label>
          <input
            type="text"
            value={content.groom}
            onChange={(e) => handleInputChange('groom', e.target.value)}
            placeholder="Petr"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            required
          />
        </div>
      </div>

      {/* Datum svatby */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Datum svatby *
        </label>
        <div className="relative">
          <input
            type="date"
            value={formatDateForInput(content.weddingDate)}
            onChange={(e) => handleInputChange('weddingDate', parseInputDate(e.target.value))}
            className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            required
          />
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* Tagline */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tagline (volitelné)
        </label>
        <input
          type="text"
          value={content.tagline || ''}
          onChange={(e) => handleInputChange('tagline', e.target.value)}
          placeholder="Naše láska začíná novou kapitolu..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
        />
        <p className="text-sm text-gray-500 mt-1">
          Krátký romantický text, který se zobrazí pod jmény
        </p>
      </div>

      {/* Hlavní fotka */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Hlavní fotka
        </label>
        
        {content.mainImage ? (
          <div className="space-y-4">
            {/* Image Preview */}
            <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ height: '300px' }}>
              <img
                ref={imageRef}
                src={content.mainImage}
                alt="Hlavní fotka"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-200"
                style={{
                  objectPosition: `${imagePosition.x}% ${imagePosition.y}%`,
                  transform: `scale(${imageScale / 100})`
                }}
              />

              {/* Overlay controls */}
              <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
                <div className="bg-white rounded-lg p-2 shadow-lg">
                  <Move className="w-5 h-5 text-gray-600" />
                </div>
              </div>

              {/* Remove button */}
              <button
                onClick={() => handleInputChange('mainImage', undefined)}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Position Controls */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              <h4 className="font-medium text-gray-900 mb-3">Pozice a velikost fotky</h4>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Horizontální pozice
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={imagePosition.x}
                    onChange={(e) => {
                      const newPosition = { ...imagePosition, x: parseInt(e.target.value) }
                      setImagePosition(newPosition)
                      handleInputChange('imagePosition', newPosition)
                    }}
                    className="w-full"
                  />
                  <div className="text-xs text-gray-500 mt-1">{imagePosition.x}%</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vertikální pozice
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={imagePosition.y}
                    onChange={(e) => {
                      const newPosition = { ...imagePosition, y: parseInt(e.target.value) }
                      setImagePosition(newPosition)
                      handleInputChange('imagePosition', newPosition)
                    }}
                    className="w-full"
                  />
                  <div className="text-xs text-gray-500 mt-1">{imagePosition.y}%</div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Velikost fotky
                </label>
                <input
                  type="range"
                  min="50"
                  max="200"
                  value={imageScale}
                  onChange={(e) => {
                    const newScale = parseInt(e.target.value)
                    setImageScale(newScale)
                    handleInputChange('imageScale', newScale)
                  }}
                  className="w-full"
                />
                <div className="text-xs text-gray-500 mt-1">{imageScale}%</div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const defaultPosition = { x: 50, y: 50 }
                    const defaultScale = 100
                    setImagePosition(defaultPosition)
                    setImageScale(defaultScale)
                    handleInputChange('imagePosition', defaultPosition)
                    handleInputChange('imageScale', defaultScale)
                  }}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                >
                  <RotateCw className="w-4 h-4" />
                  Resetovat
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragOver
                ? 'border-pink-400 bg-pink-50'
                : 'border-gray-300 hover:border-pink-400'
            }`}
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
          >
            <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              Nahrajte hlavní fotku
            </h4>
            <p className="text-gray-600 mb-4">
              Přetáhněte fotku sem nebo klikněte pro výběr
            </p>
            
            <label className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors cursor-pointer ${
              uploading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-pink-500 hover:bg-pink-600'
            } text-white`}>
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Nahrávání... {progress > 0 && `${Math.round(progress)}%`}
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Vybrat fotku
                </>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={uploading}
              />
            </label>

            {uploadError && (
              <p className="text-red-600 text-sm mt-2">
                Chyba při nahrávání: {uploadError}
              </p>
            )}
            
            <p className="text-sm text-gray-500 mt-2">
              Doporučená velikost: 1920x1080px, max 5MB
            </p>
          </div>
        )}
      </div>

      {/* Náhled */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Náhled</h4>
        <div 
          className="relative bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg p-8 text-center min-h-[200px] flex flex-col justify-center"
          style={content.mainImage ? {
            backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${content.mainImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          } : {}}
        >
          <h1 className={`text-4xl font-bold mb-2 ${content.mainImage ? 'text-white' : 'text-gray-900'}`}>
            {content.bride && content.groom ? `${content.bride} & ${content.groom}` : 'Jména snoubenců'}
          </h1>
          
          {content.weddingDate && (
            <p className={`text-lg mb-2 ${content.mainImage ? 'text-white' : 'text-gray-700'}`}>
              {formatDate(content.weddingDate)}
            </p>
          )}
          
          {content.tagline && (
            <p className={`text-sm italic ${content.mainImage ? 'text-white' : 'text-gray-600'}`}>
              {content.tagline}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
