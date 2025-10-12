'use client'

import { useState, useRef } from 'react'
import { Shirt, Upload, X, Trash2, Image as ImageIcon, Plus } from 'lucide-react'
import { useWeddingStore } from '@/stores/weddingStore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '@/config/firebase'
import { compressImage } from '@/utils/imageCompression'
import type { DressCodeContent, ColorWithImages } from '@/types/wedding-website'

interface DressCodeSectionEditorProps {
  content: DressCodeContent
  onChange: (content: DressCodeContent) => void
}

export default function DressCodeSectionEditor({ content, onChange }: DressCodeSectionEditorProps) {
  const { currentWedding: wedding } = useWeddingStore()
  const [uploading, setUploading] = useState(false)
  const [uploadingColorIndex, setUploadingColorIndex] = useState<number | null>(null)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [newColorHex, setNewColorHex] = useState('#000000')
  const [newColorName, setNewColorName] = useState('')
  const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({})

  // Migrate legacy data to new structure
  const colors = content.colors || []

  const handleInputChange = (field: keyof DressCodeContent, value: any) => {
    onChange({
      ...content,
      [field]: value
    })
  }

  const addColor = () => {
    if (!newColorHex) return
    
    const newColor: ColorWithImages = {
      color: newColorHex,
      name: newColorName || undefined,
      images: []
    }
    
    handleInputChange('colors', [...colors, newColor])
    setNewColorHex('#000000')
    setNewColorName('')
  }

  const removeColor = (index: number) => {
    const updatedColors = colors.filter((_, i) => i !== index)
    handleInputChange('colors', updatedColors)
  }

  const updateColorName = (index: number, name: string) => {
    const updatedColors = [...colors]
    updatedColors[index] = { ...updatedColors[index], name }
    handleInputChange('colors', updatedColors)
  }

  const handleFileSelect = async (colorIndex: number, files: FileList | null) => {
    if (!files || files.length === 0) return

    setUploading(true)
    setUploadingColorIndex(colorIndex)
    setProgress(0)
    setError(null)

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

      if (fileArray.length === 0) {
        setUploading(false)
        return
      }

      const uploadPromises = fileArray.map(async (file, index) => {
        const compressedResult = await compressImage(file, {
          maxWidth: 1200,
          maxHeight: 1200,
          quality: 0.85
        })

        const timestamp = Date.now()
        const fileName = `${timestamp}_${index}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`
        const storageRef = ref(
          storage,
          `wedding-websites/wedding_${wedding?.userId}_${wedding?.createdAt?.getTime()}/dress-code/${fileName}`
        )

        await uploadBytes(storageRef, compressedResult.file)
        const downloadURL = await getDownloadURL(storageRef)

        setProgress(((index + 1) / fileArray.length) * 100)
        return downloadURL
      })

      const uploadedUrls = await Promise.all(uploadPromises)
      
      const updatedColors = [...colors]
      updatedColors[colorIndex] = {
        ...updatedColors[colorIndex],
        images: [...updatedColors[colorIndex].images, ...uploadedUrls]
      }
      handleInputChange('colors', updatedColors)

      setProgress(100)
    } catch (err) {
      console.error('Error uploading images:', err)
      setError('Chyba při nahrávání obrázků')
    } finally {
      setUploading(false)
      setUploadingColorIndex(null)
      setProgress(0)
    }
  }

  const removeImage = (colorIndex: number, imageIndex: number) => {
    const updatedColors = [...colors]
    updatedColors[colorIndex] = {
      ...updatedColors[colorIndex],
      images: updatedColors[colorIndex].images.filter((_, i) => i !== imageIndex)
    }
    handleInputChange('colors', updatedColors)
  }

  const dressCodeOptions = [
    { value: 'formal', label: 'Formální (smoking, večerní šaty)' },
    { value: 'semi-formal', label: 'Semi-formální (oblek, koktejlové šaty)' },
    { value: 'cocktail', label: 'Koktejlové (oblek, koktejlové šaty)' },
    { value: 'smart-casual', label: 'Smart Casual (sako, elegantní šaty)' },
    { value: 'casual', label: 'Casual (pohodlné oblečení)' },
    { value: 'beach', label: 'Plážové (lehké oblečení)' },
    { value: 'rustic', label: 'Rustikální (country styl)' },
    { value: 'bohemian', label: 'Bohémský (volný styl)' },
    { value: 'custom', label: 'Vlastní' }
  ]

  return (
    <div className="space-y-6">
      {/* Dress Code Selection */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shirt className="w-5 h-5 text-pink-600" />
          <h3 className="text-lg font-semibold text-gray-900">Dress Code</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Typ oblečení
            </label>
            <select
              value={content.dressCode || ''}
              onChange={(e) => handleInputChange('dressCode', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              <option value="">Vyberte dress code</option>
              {dressCodeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Doplňující informace
            </label>
            <textarea
              value={content.dressCodeDetails || ''}
              onChange={(e) => handleInputChange('dressCodeDetails', e.target.value)}
              placeholder="Např. 'Prosíme o elegantní oblečení v tónech burgundy a zlaté'"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
            />
          </div>
        </div>
      </div>

      {/* Color Palette with Images */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Barevná paleta s inspirací</h3>
        <p className="text-sm text-gray-600 mb-4">
          Přidejte barvy vaší svatby a k nim inspirační fotky
        </p>

        {/* Add New Color */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Přidat barvu</h4>
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <input
                type="color"
                value={newColorHex}
                onChange={(e) => setNewColorHex(e.target.value)}
                className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
              />
            </div>
            <input
              type="text"
              value={newColorName}
              onChange={(e) => setNewColorName(e.target.value)}
              placeholder="Název barvy (volitelné)"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
            <button
              onClick={addColor}
              className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Přidat
            </button>
          </div>
        </div>

        {/* Colors List */}
        <div className="space-y-6">
          {colors.map((colorItem, colorIndex) => (
            <div key={colorIndex} className="border border-gray-200 rounded-lg p-4">
              {/* Color Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-lg border-2 border-gray-300 shadow-sm"
                    style={{ backgroundColor: colorItem.color }}
                  />
                  <div>
                    <input
                      type="text"
                      value={colorItem.name || ''}
                      onChange={(e) => updateColorName(colorIndex, e.target.value)}
                      placeholder="Název barvy"
                      className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">{colorItem.color}</p>
                  </div>
                </div>
                <button
                  onClick={() => removeColor(colorIndex)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Upload Images for this Color */}
              <div className="mb-4">
                <button
                  onClick={() => fileInputRefs.current[colorIndex]?.click()}
                  disabled={uploading && uploadingColorIndex === colorIndex}
                  className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-pink-400 hover:bg-pink-50 transition-colors flex items-center justify-center gap-2 text-gray-600"
                >
                  <ImageIcon className="w-5 h-5" />
                  {uploading && uploadingColorIndex === colorIndex
                    ? `Nahrávání... ${progress}%`
                    : 'Přidat inspirační fotky'}
                </button>
                <input
                  ref={(el) => (fileInputRefs.current[colorIndex] = el)}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleFileSelect(colorIndex, e.target.files)}
                  className="hidden"
                />
              </div>

              {/* Images Grid */}
              {colorItem.images.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {colorItem.images.map((imageUrl, imageIndex) => (
                    <div key={imageIndex} className="relative group aspect-square">
                      <img
                        src={imageUrl}
                        alt={`${colorItem.name || 'Color'} inspiration ${imageIndex + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removeImage(colorIndex, imageIndex)}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {colors.length === 0 && (
            <p className="text-center text-gray-500 py-8">
              Zatím jste nepřidali žádné barvy
            </p>
          )}
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}

