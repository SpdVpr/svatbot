'use client'

import { useState, useRef } from 'react'
import { Camera, Upload, X, Plus, Trash2, Eye, Download } from 'lucide-react'
import { useWeddingStore } from '@/stores/weddingStore'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from '@/config/firebase'
import { compressImage } from '@/utils/imageCompression'
import type { GalleryContent, GalleryImage } from '@/types/wedding-website'

interface GallerySectionEditorProps {
  content: GalleryContent
  onChange: (content: GalleryContent) => void
}

export default function GallerySectionEditor({ content, onChange }: GallerySectionEditorProps) {
  const { currentWedding: wedding } = useWeddingStore()
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleInputChange = (field: keyof GalleryContent, value: any) => {
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
            maxWidth: 1920,
            maxHeight: 1080,
            quality: 0.8
          })

          // Create unique filename
          const timestamp = Date.now()
          const filename = `wedding-websites/${wedding?.id || 'temp'}/gallery/${timestamp}_${index}_${file.name.replace(/\s+/g, '_')}`

          // Upload to Firebase Storage
          const storageRef = ref(storage, filename)
          const snapshot = await uploadBytes(storageRef, compressedResult.file)
          const downloadURL = await getDownloadURL(snapshot.ref)

          // Update progress
          setProgress(Math.round(((index + 1) / fileArray.length) * 100))

          return {
            id: `${timestamp}_${index}`,
            url: downloadURL,
            thumbnailUrl: downloadURL,
            caption: '',
            alt: file.name.replace(/\.[^/.]+$/, ''),
            uploadedAt: new Date()
          }
        } catch (error) {
          console.error(`Error uploading ${file.name}:`, error)
          throw error
        }
      })

      const uploadedImages = await Promise.all(uploadPromises)

      const updatedImages = [...(content.images || []), ...uploadedImages]
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

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm('Opravdu chcete smazat tuto fotku?')) return

    try {
      const images = content.images || []
      const imageToDelete = images.find(img => img.id === imageId)

      if (imageToDelete) {
        // Extract path from URL for deletion
        const url = new URL(imageToDelete.url)
        const pathParts = url.pathname.split('/')
        const bucketIndex = pathParts.findIndex(part => part.includes('svatbot-app.appspot.com'))
        if (bucketIndex !== -1) {
          const storagePath = pathParts.slice(bucketIndex + 2).join('/') // Skip bucket and 'o'
          const decodedPath = decodeURIComponent(storagePath)

          const storageRef = ref(storage, decodedPath)
          await deleteObject(storageRef)
        }
      }

      const updatedImages = images.filter(img => img.id !== imageId)
      handleInputChange('images', updatedImages)

      if (selectedImage?.id === imageId) {
        setSelectedImage(null)
      }
    } catch (error) {
      console.error('Error deleting image:', error)
      alert('Chyba při mazání fotky')
    }
  }

  const updateImageCaption = (imageId: string, caption: string) => {
    const images = content.images || []
    const updatedImages = images.map(img => 
      img.id === imageId ? { ...img, caption } : img
    )
    handleInputChange('images', updatedImages)
  }

  const importFromWedding = () => {
    if (!wedding) return

    const updatedContent: GalleryContent = {
      ...content,
      enabled: true,
      title: 'Fotogalerie',
      subtitle: 'Naše nejkrásnější okamžiky',
      description: 'Podívejte se na fotky z našeho velkého dne a příprav na svatbu.'
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
                Nastavit fotogalerii
              </h4>
              <p className="text-sm text-blue-700">
                Vytvoří základní nastavení pro fotogalerii
              </p>
            </div>
            <button
              onClick={importFromWedding}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Nastavit
            </button>
          </div>
        </div>
      )}

      {/* Základní nastavení */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Camera className="w-5 h-5 text-pink-600" />
          <h3 className="text-lg font-semibold text-gray-900">Základní informace</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nadpis sekce
            </label>
            <input
              type="text"
              value={content.title || ''}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Fotogalerie"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Podnadpis
            </label>
            <input
              type="text"
              value={content.subtitle || ''}
              onChange={(e) => handleInputChange('subtitle', e.target.value)}
              placeholder="Naše nejkrásnější okamžiky"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Popis
            </label>
            <textarea
              value={content.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Podívejte se na fotky z našeho velkého dne..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Upload fotek */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-pink-600" />
            <h3 className="text-lg font-semibold text-gray-900">Nahrát fotky</h3>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 bg-pink-500 text-white px-3 py-2 rounded-lg hover:bg-pink-600 transition-colors text-sm disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            Přidat fotky
          </button>
        </div>

        {/* Drag & Drop Area */}
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
          <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            Přetáhněte fotky sem
          </h4>
          <p className="text-gray-600 mb-4">
            Nebo klikněte pro výběr souborů
          </p>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />

          {uploading && (
            <div className="mt-4">
              <div className="bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className="bg-pink-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600">
                Nahrávání... {progress}%
              </p>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>
      </div>

      {/* Galerie fotek */}
      {content.images && content.images.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Nahrané fotky ({content.images.length})
            </h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {content.images.map((image) => (
              <div key={image.id} className="relative group">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={image.thumbnailUrl || image.url}
                    alt={image.alt}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedImage(image)}
                        className="bg-white text-gray-900 p-2 rounded-full hover:bg-gray-100 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteImage(image.id)}
                        className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Caption */}
                <div className="mt-2">
                  <input
                    type="text"
                    value={image.caption || ''}
                    onChange={(e) => updateImageCaption(image.id, e.target.value)}
                    placeholder="Popis fotky..."
                    className="w-full text-sm px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <img
              src={selectedImage.url}
              alt={selectedImage.alt}
              className="max-w-full max-h-full object-contain"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 bg-white text-gray-900 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Náhled */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Náhled galerie</h4>
        
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {content.title || 'Fotogalerie'}
            </h3>
            {content.subtitle && (
              <p className="text-gray-600 mb-4">{content.subtitle}</p>
            )}
            {content.description && (
              <p className="text-gray-700 max-w-2xl mx-auto">
                {content.description}
              </p>
            )}
          </div>

          {content.images && content.images.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {content.images.slice(0, 6).map((image) => (
                <div key={image.id} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={image.thumbnailUrl || image.url}
                    alt={image.alt}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              
              {content.images.length > 6 && (
                <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      +{content.images.length - 6} dalších
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Camera className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                Nahrajte fotky pro zobrazení galerie
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
