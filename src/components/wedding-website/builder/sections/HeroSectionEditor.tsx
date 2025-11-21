'use client'

import { useState } from 'react'
import { Calendar, Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'
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

      {/* Místo konání */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Místo konání (volitelné)
        </label>
        <input
          type="text"
          value={content.venue || ''}
          onChange={(e) => handleInputChange('venue', e.target.value)}
          placeholder="Zámek Průhonice"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
        />
        <p className="text-sm text-gray-500 mt-1">
          Název místa, kde se svatba koná
        </p>
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
            <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Fotka nahrána</p>
                  <p className="text-xs text-gray-500">Fotka se zobrazí na hlavní stránce</p>
                </div>
              </div>
              <button
                onClick={() => handleInputChange('mainImage', undefined)}
                className="flex items-center gap-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
              >
                <X className="w-4 h-4" />
                Odstranit
              </button>
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
