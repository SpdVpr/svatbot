'use client'

import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon, Plus } from 'lucide-react'
import Image from 'next/image'
import { WEDDING_CATEGORIES, WeddingCategory } from '@/hooks/useMoodboard'
import { formatFileSize } from '@/utils/imageCompression'

interface ImageUploadProps {
  onUpload: (file: File, metadata?: {
    title?: string
    description?: string
    tags?: string[]
    category?: WeddingCategory
  }) => Promise<any>
  isLoading: boolean
}

interface PendingImage {
  file: File
  preview: string
  title: string
  description: string
  tags: string[]
  category: WeddingCategory
  isUploading?: boolean
}

export default function ImageUpload({ onUpload, isLoading }: ImageUploadProps) {
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([])
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFiles = (files: FileList) => {
    const validFiles = Array.from(files).filter(file => {
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} není obrázek`)
        return false
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert(`${file.name} je příliš velký (max 10MB)`)
        return false
      }
      return true
    })

    const newPendingImages: PendingImage[] = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      title: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
      description: '',
      tags: [],
      category: 'other' as WeddingCategory
    }))

    setPendingImages(prev => [...prev, ...newPendingImages])
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files)
    }
  }

  const removePendingImage = (index: number) => {
    setPendingImages(prev => {
      const updated = [...prev]
      if (updated[index] && updated[index].preview) {
        URL.revokeObjectURL(updated[index].preview)
      }
      updated.splice(index, 1)
      return updated
    })
  }

  const updatePendingImage = (index: number, updates: Partial<PendingImage>) => {
    setPendingImages(prev => prev.map((img, i) => 
      i === index ? { ...img, ...updates } : img
    ))
  }

  const uploadImage = async (pendingImage: PendingImage) => {
    try {
      const metadata = {
        title: pendingImage.title,
        description: pendingImage.description,
        tags: pendingImage.tags,
        category: pendingImage.category
      }

      console.log('📤 Uploading image:', {
        title: pendingImage.title,
        category: pendingImage.category,
        tags: pendingImage.tags,
        metadata: metadata
      })

      await onUpload(pendingImage.file, metadata)

      return { success: true, image: pendingImage }
    } catch (err) {
      console.error('Upload error:', err)
      return { success: false, image: pendingImage, error: err }
    }
  }

  const uploadAllImages = async () => {
    console.log('📤 Starting upload all images...')
    console.log('📋 Current pending images:', pendingImages.length)

    if (pendingImages.length === 0) {
      console.warn('⚠️ No images to upload')
      return
    }

    // Store images to upload before state update
    const imagesToUpload = pendingImages.map(img => ({ ...img, isUploading: true }))
    console.log(`📤 Uploading ${imagesToUpload.length} images...`)

    // Mark all as uploading in state
    setPendingImages(imagesToUpload)

    try {
      // Upload all images using the current state
      const results = await Promise.allSettled(
        imagesToUpload.map(img => uploadImage(img))
      )

      console.log('✅ Upload results:', results)

      // Check for errors
      const errors = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success))

      if (errors.length > 0) {
        console.error('❌ Upload errors:', errors)
        alert(`Nepodařilo se nahrát ${errors.length} obrázků`)
      } else {
        console.log('✅ All images uploaded successfully')
      }

      // Clear all pending images after upload
      imagesToUpload.forEach(img => {
        if (img.preview) {
          URL.revokeObjectURL(img.preview)
        }
      })
      setPendingImages([])

    } catch (err) {
      console.error('❌ Upload all error:', err)
      setPendingImages(prev => prev.map(img => ({ ...img, isUploading: false })))
    }
  }

  const addTag = (index: number, tag: string) => {
    if (tag.trim() && !pendingImages[index].tags.includes(tag.trim())) {
      updatePendingImage(index, {
        tags: [...pendingImages[index].tags, tag.trim()]
      })
    }
  }

  const removeTag = (index: number, tagToRemove: string) => {
    updatePendingImage(index, {
      tags: pendingImages[index].tags.filter(tag => tag !== tagToRemove)
    })
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-pink-400 bg-pink-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Přetáhněte obrázky sem nebo klikněte pro výběr
        </h3>
        <p className="text-gray-600 mb-4">
          Podporované formáty: JPG, PNG, GIF, WebP (max 10MB)
        </p>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
        >
          <Upload className="w-4 h-4 mr-2" />
          Vybrat soubory
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
        />
      </div>

      {/* Pending Images */}
      {pendingImages.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              Připravené k nahrání ({pendingImages.length})
            </h3>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => {
                  pendingImages.forEach(img => {
                    if (img.preview) {
                      URL.revokeObjectURL(img.preview)
                    }
                  })
                  setPendingImages([])
                }}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
              >
                Zrušit vše
              </button>
              <button
                type="button"
                onClick={uploadAllImages}
                disabled={isLoading}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Nahrávám...' : 'Nahrát vše'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pendingImages.map((pendingImage, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex space-x-4">
                  {/* Preview */}
                  <div className="flex-shrink-0">
                    <div className="w-24 h-24 relative rounded-lg overflow-hidden">
                      <Image
                        src={pendingImage.preview}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>

                  {/* Form */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">Obrázek {index + 1}</h4>
                        <p className="text-sm text-gray-500">{formatFileSize(pendingImage.file.size)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removePendingImage(index)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <input
                      type="text"
                      placeholder="Název obrázku"
                      value={pendingImage.title}
                      onChange={(e) => updatePendingImage(index, { title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />

                    <textarea
                      placeholder="Popis (volitelný)"
                      value={pendingImage.description}
                      onChange={(e) => updatePendingImage(index, { description: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                    />

                    {/* Category */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kategorie
                      </label>
                      <select
                        value={pendingImage.category}
                        onChange={(e) => updatePendingImage(index, { category: e.target.value as WeddingCategory })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      >
                        {Object.entries(WEDDING_CATEGORIES).map(([key, category]) => (
                          <option key={key} value={key}>
                            {category.icon} {category.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Tags */}
                    <div>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {pendingImage.tags.map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="inline-flex items-center px-2 py-1 bg-pink-100 text-pink-700 text-xs rounded-full"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(index, tag)}
                              className="ml-1 text-pink-500 hover:text-pink-700"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                      <input
                        type="text"
                        placeholder="Přidat tag (Enter pro potvrzení)"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            addTag(index, e.currentTarget.value)
                            e.currentTarget.value = ''
                          }
                        }}
                        className="w-full px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={async () => {
                        updatePendingImage(index, { isUploading: true })
                        const result = await uploadImage(pendingImage)
                        if (result.success) {
                          removePendingImage(index)
                        } else {
                          updatePendingImage(index, { isUploading: false })
                          alert('Nepodařilo se nahrát obrázek')
                        }
                      }}
                      disabled={isLoading || pendingImage.isUploading}
                      className="w-full px-3 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      {pendingImage.isUploading ? 'Nahrávám...' : 'Nahrát tento obrázek'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
