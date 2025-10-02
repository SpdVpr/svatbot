'use client'

import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from '@/lib/firebase'
import { compressImage, formatFileSize } from '@/utils/imageCompression'
import { useAuth } from '@/hooks/useAuth'
import { useWedding } from '@/hooks/useWedding'

interface AccommodationImageUploadProps {
  images: string[]
  onImagesChange: (images: string[]) => void
  maxImages?: number
  disabled?: boolean
}

interface PendingImage {
  file: File
  preview: string
  isUploading: boolean
}

export default function AccommodationImageUpload({
  images,
  onImagesChange,
  maxImages = 15,
  disabled = false
}: AccommodationImageUploadProps) {
  const { user } = useAuth()
  const { wedding } = useWedding()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([])
  const [dragActive, setDragActive] = useState(false)

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

    if (images.length + pendingImages.length + validFiles.length > maxImages) {
      alert(`Můžete nahrát maximálně ${maxImages} fotek`)
      return
    }

    const newPendingImages: PendingImage[] = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      isUploading: false
    }))

    setPendingImages(prev => [...prev, ...newPendingImages])

    // Auto-upload images
    for (let i = 0; i < newPendingImages.length; i++) {
      uploadImage(pendingImages.length + i, newPendingImages[i])
    }
  }

  const uploadImage = async (index: number, pendingImage: PendingImage) => {
    if (!user || !wedding) return

    try {
      // Update status to uploading
      setPendingImages(prev => prev.map((img, i) =>
        i === index ? { ...img, isUploading: true } : img
      ))

      console.log(`📸 Komprese obrázku ubytování: ${pendingImage.file.name} (${formatFileSize(pendingImage.file.size)})`)

      // Compress image before upload
      const compressionOptions = {
        maxWidth: 1600,
        maxHeight: 1600,
        quality: 0.8,
        maxSizeKB: 800
      }

      const compressedResult = await compressImage(pendingImage.file, compressionOptions)

      console.log(`✅ Komprese dokončena: ${formatFileSize(compressedResult.originalSize)} → ${formatFileSize(compressedResult.compressedSize)} (${compressedResult.compressionRatio}% úspora)`)

      // Create unique filename
      const timestamp = Date.now()
      const filename = `weddings/${wedding.id}/accommodations/${timestamp}_${pendingImage.file.name.replace(/\s+/g, '_')}`

      // Upload to Firebase Storage
      const storageRef = ref(storage, filename)
      const snapshot = await uploadBytes(storageRef, compressedResult.file)
      const downloadURL = await getDownloadURL(snapshot.ref)

      console.log('✅ Obrázek ubytování nahrán:', downloadURL)

      // Add to images array
      onImagesChange([...images, downloadURL])

      // Remove from pending after successful upload
      setPendingImages(prev => prev.filter((_, i) => i !== index))

    } catch (error: any) {
      console.error('Chyba při nahrávání obrázku ubytování:', error)
      
      // Update pending image with error
      setPendingImages(prev => prev.map((img, i) =>
        i === index ? { ...img, isUploading: false } : img
      ))
      
      alert('Chyba při nahrávání obrázku: ' + error.message)
    }
  }

  const removeImage = async (imageUrl: string, index: number) => {
    try {
      // Extract filename from URL for deletion
      const urlParts = imageUrl.split('/')
      const fileNameWithParams = urlParts[urlParts.length - 1]
      const fileName = fileNameWithParams.split('?')[0]
      
      // Delete from Firebase Storage
      const storageRef = ref(storage, decodeURIComponent(fileName))
      await deleteObject(storageRef)
      
      // Remove from images array
      const updatedImages = images.filter((_, i) => i !== index)
      onImagesChange(updatedImages)
      
      console.log('✅ Obrázek ubytování smazán ze Storage')
    } catch (error) {
      console.error('Chyba při mazání obrázku:', error)
      // Still remove from UI even if Storage deletion fails
      const updatedImages = images.filter((_, i) => i !== index)
      onImagesChange(updatedImages)
    }
  }

  const removePendingImage = (index: number) => {
    setPendingImages(prev => {
      const updated = [...prev]
      URL.revokeObjectURL(updated[index].preview)
      updated.splice(index, 1)
      return updated
    })
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

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      {!disabled && images.length + pendingImages.length < maxImages && (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-primary-400 bg-primary-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Přetáhněte fotky sem nebo klikněte pro výběr
          </h3>
          <p className="text-gray-600 mb-4">
            Podporované formáty: JPG, PNG, WebP (max 10MB na fotku)
          </p>
          <p className="text-sm text-gray-500 mb-4">
            {images.length + pendingImages.length} / {maxImages} fotek
          </p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Upload className="w-4 h-4 mr-2" />
            Vybrat fotky
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
      )}

      {/* Images Grid */}
      {(images.length > 0 || pendingImages.length > 0) && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Uploaded Images */}
          {images.map((imageUrl, index) => (
            <div key={imageUrl} className="relative group">
              <div className="w-full h-32 rounded-lg overflow-hidden bg-gray-100 relative">
                <Image
                  src={imageUrl}
                  alt={`Ubytování ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                />
              </div>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeImage(imageUrl, index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}

          {/* Pending Images */}
          {pendingImages.map((pendingImage, index) => (
            <div key={index} className="relative group">
              <div className="w-full h-32 rounded-lg overflow-hidden bg-gray-100 relative">
                <Image
                  src={pendingImage.preview}
                  alt={`Nahrávání ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                />
                
                {/* Upload Overlay */}
                {pendingImage.isUploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                    <div className="text-center text-white px-2">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                      <p className="text-xs font-medium">Komprese a nahrávání...</p>
                    </div>
                  </div>
                )}
              </div>
              
              {!pendingImage.isUploading && (
                <button
                  type="button"
                  onClick={() => removePendingImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {images.length === 0 && pendingImages.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-sm">Zatím nemáte žádné fotky ubytování</p>
        </div>
      )}
    </div>
  )
}
