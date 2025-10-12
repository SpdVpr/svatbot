'use client'

import { useState, useRef } from 'react'
import { Shirt, Upload, X, Trash2, Image as ImageIcon } from 'lucide-react'
import { useWeddingStore } from '@/stores/weddingStore'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from '@/config/firebase'
import { compressImage } from '@/utils/imageCompression'
import type { DressCodeContent } from '@/types/wedding-website'

interface DressCodeSectionEditorProps {
  content: DressCodeContent
  onChange: (content: DressCodeContent) => void
}

export default function DressCodeSectionEditor({ content, onChange }: DressCodeSectionEditorProps) {
  const { currentWedding: wedding } = useWeddingStore()
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleInputChange = (field: keyof DressCodeContent, value: any) => {
    onChange({
      ...content,
      [field]: value
    })
  }

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    setUploading(true)
    setProgress(0)
    setError(null)

    try {
      const fileArray = Array.from(files).filter(file => {
        if (!file.type.startsWith('image/')) {
          alert(`Soubor ${file.name} není obrázek`)
          return false
        }
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
          alert(`Soubor ${file.name} je příliš velký (max 10MB)`)
          return false
        }
        return true
      })

      if (fileArray.length === 0) return

      const uploadPromises = fileArray.map(async (file, index) => {
        try {
          // Compress image
          const compressedResult = await compressImage(file, {
            maxWidth: 1200,
            maxHeight: 1200,
            quality: 0.85
          })

          // Create unique filename
          const timestamp = Date.now()
          const filename = `wedding-websites/${wedding?.id || 'temp'}/dress-code/${timestamp}_${index}_${file.name.replace(/\s+/g, '_')}`

          // Upload to Firebase Storage
          const storageRef = ref(storage, filename)
          const snapshot = await uploadBytes(storageRef, compressedResult.file)
          const downloadURL = await getDownloadURL(snapshot.ref)

          // Update progress
          setProgress(Math.round(((index + 1) / fileArray.length) * 100))

          return downloadURL
        } catch (error) {
          console.error(`Error uploading ${file.name}:`, error)
          throw error
        }
      })

      const uploadedUrls = await Promise.all(uploadPromises)
      console.log('📤 Uploaded URLs:', uploadedUrls)
      const updatedImages = [...(content.images || []), ...uploadedUrls]
      console.log('🖼️ Updated images array:', updatedImages)
      handleInputChange('images', updatedImages)

    } catch (error) {
      console.error('Error uploading images:', error)
      setError(`Chyba při nahrávání: ${error instanceof Error ? error.message : 'Neznámá chyba'}`)
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => {
    setDragOver(false)
  }

  const removeImage = (index: number) => {
    const updatedImages = (content.images || []).filter((_, i) => i !== index)
    handleInputChange('images', updatedImages)
  }

  // Debug logging
  console.log('🎨 DressCodeSectionEditor - content.images:', content.images)
  console.log('🎨 DressCodeSectionEditor - images count:', content.images?.length || 0)

  return (
    <div className="p-6 space-y-6">
      {/* Dress Code */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shirt className="w-5 h-5 text-pink-600" />
          <h3 className="text-lg font-semibold text-gray-900">Dress Code</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Požadované oblečení
            </label>
            <select
              value={content.dressCode || ''}
              onChange={(e) => handleInputChange('dressCode', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              <option value="">Vyberte dress code</option>
              <option value="formal">Formální (oblek/večerní šaty)</option>
              <option value="semi-formal">Poloformální (košile/koktejlové šaty)</option>
              <option value="casual">Neformální</option>
              <option value="cocktail">Koktejlové oblečení</option>
              <option value="black-tie">Black tie</option>
              <option value="custom">Vlastní požadavky</option>
            </select>

            {content.dressCode === 'custom' && (
              <textarea
                value={content.dressCodeDetails || ''}
                onChange={(e) => handleInputChange('dressCodeDetails', e.target.value)}
                placeholder="Popište požadavky na oblečení..."
                rows={3}
                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            )}
          </div>
        </div>
      </div>

      {/* Color Palette */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Barevná paleta svatby</h3>
        
        <div className="space-y-2">
          {(content.colorPalette || []).map((color, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="color"
                value={color}
                onChange={(e) => {
                  const newPalette = [...(content.colorPalette || [])]
                  newPalette[index] = e.target.value
                  handleInputChange('colorPalette', newPalette)
                }}
                className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={color}
                onChange={(e) => {
                  const newPalette = [...(content.colorPalette || [])]
                  newPalette[index] = e.target.value
                  handleInputChange('colorPalette', newPalette)
                }}
                placeholder="#000000"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => {
                  const newPalette = (content.colorPalette || []).filter((_, i) => i !== index)
                  handleInputChange('colorPalette', newPalette)
                }}
                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                Odstranit
              </button>
            </div>
          ))}

          {(!content.colorPalette || content.colorPalette.length < 6) && (
            <button
              type="button"
              onClick={() => {
                const newPalette = [...(content.colorPalette || []), '#000000']
                handleInputChange('colorPalette', newPalette)
              }}
              className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-pink-500 hover:text-pink-600 transition-colors"
            >
              + Přidat barvu
            </button>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Přidejte barvy, které se budou objevovat na vaší svatbě (max. 6 barev)
        </p>
      </div>

      {/* Inspiration Gallery */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Inspirační galerie</h3>
        <p className="text-sm text-gray-600 mb-4">
          Přidejte fotky pro lepší ilustraci dress code a barevné palety
        </p>

        {/* Upload Area */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragOver
              ? 'border-pink-500 bg-pink-50'
              : 'border-gray-300 hover:border-pink-400'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />

          {uploading ? (
            <div className="space-y-2">
              <div className="w-16 h-16 mx-auto border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-600">Nahrávání... {progress}%</p>
            </div>
          ) : (
            <>
              <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-2">
                Přetáhněte fotky sem nebo{' '}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-pink-600 hover:text-pink-700 font-medium"
                >
                  vyberte soubory
                </button>
              </p>
              <p className="text-xs text-gray-500">
                Podporované formáty: JPG, PNG, WEBP (max 10MB)
              </p>
            </>
          )}
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Image Grid */}
        {content.images && content.images.length > 0 && (
          <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {content.images.map((imageUrl, index) => (
              <div key={index} className="relative group aspect-square">
                <img
                  src={imageUrl}
                  alt={`Dress code inspiration ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

