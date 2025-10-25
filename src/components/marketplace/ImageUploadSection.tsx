'use client'

import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon, Loader2, AlertCircle } from 'lucide-react'
import { compressImage, formatFileSize } from '@/utils/imageCompression'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '@/config/firebase'
import { useAuth } from '@/hooks/useAuth'

interface ImageUploadSectionProps {
  images: string[]
  onImagesChange: (images: string[]) => void
  maxImages?: number
  title: string
  description: string
  type: 'main' | 'portfolio'
}

interface PendingImage {
  file: File
  preview: string
  uploading: boolean
  uploaded: boolean
  url?: string
  error?: string
  originalSize?: number
  compressedSize?: number
  compressionRatio?: number
}

export default function ImageUploadSection({
  images,
  onImagesChange,
  maxImages = 10,
  title,
  description,
  type
}: ImageUploadSectionProps) {
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([])
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user } = useAuth()

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

    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      handleFiles(files)
    }
  }

  const handleFiles = (files: File[]) => {
    // Filter only images
    const imageFiles = files.filter(file => file.type.startsWith('image/'))
    
    // Check max images limit
    const totalImages = images.length + pendingImages.length + imageFiles.length
    if (totalImages > maxImages) {
      alert(`Můžete nahrát maximálně ${maxImages} obrázků`)
      return
    }

    // Validate file size (max 5MB per image)
    const maxSize = 5 * 1024 * 1024 // 5MB
    const oversizedFiles = imageFiles.filter(file => file.size > maxSize)
    if (oversizedFiles.length > 0) {
      alert('Některé soubory jsou příliš velké. Maximální velikost je 5MB.')
      return
    }

    // Create pending images
    const newPendingImages: PendingImage[] = imageFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      uploading: false,
      uploaded: false
    }))

    setPendingImages(prev => [...prev, ...newPendingImages])

    // Auto-upload images
    newPendingImages.forEach((img, index) => {
      uploadImage(img, pendingImages.length + index)
    })
  }

  const uploadImage = async (pendingImage: PendingImage, index: number) => {
    // Allow upload without authentication for marketplace vendor registration
    // Use 'anonymous' as userId if not authenticated
    const userId = user?.id || 'anonymous'

    try {
      // Update status to uploading
      setPendingImages(prev => prev.map((img, i) =>
        i === index ? { ...img, uploading: true, error: undefined } : img
      ))

      console.log(`📸 Komprese obrázku: ${pendingImage.file.name} (${formatFileSize(pendingImage.file.size)})`)

      // Compress image before upload
      const compressionOptions = type === 'main'
        ? { maxWidth: 1920, maxHeight: 1920, quality: 0.85, maxSizeKB: 800 }
        : { maxWidth: 1600, maxHeight: 1600, quality: 0.8, maxSizeKB: 600 }

      const compressedResult = await compressImage(pendingImage.file, compressionOptions)

      console.log(`✅ Komprese dokončena: ${formatFileSize(compressedResult.originalSize)} → ${formatFileSize(compressedResult.compressedSize)} (${compressedResult.compressionRatio}% úspora)`)

      // Create unique filename
      const timestamp = Date.now()
      const folder = type === 'main' ? 'svatbot' : 'portfolio'
      const filename = `${folder}/${userId}/${timestamp}_${pendingImage.file.name.replace(/\s+/g, '_')}`

      // Upload to Firebase Storage
      const storageRef = ref(storage, filename)
      const snapshot = await uploadBytes(storageRef, compressedResult.file)
      const downloadURL = await getDownloadURL(snapshot.ref)

      console.log(`🔥 Nahrán do Firebase Storage: ${filename}`)

      // Update pending image as uploaded
      setPendingImages(prev => prev.map((img, i) =>
        i === index ? {
          ...img,
          uploading: false,
          uploaded: true,
          url: downloadURL,
          originalSize: compressedResult.originalSize,
          compressedSize: compressedResult.compressedSize,
          compressionRatio: compressedResult.compressionRatio
        } : img
      ))

      // Add to images array
      onImagesChange([...images, downloadURL])

      // Remove from pending after a short delay
      setTimeout(() => {
        setPendingImages(prev => prev.filter((_, i) => i !== index))
      }, 1000)
    } catch (error) {
      console.error('Upload error:', error)
      setPendingImages(prev => prev.map((img, i) =>
        i === index ? {
          ...img,
          uploading: false,
          error: error instanceof Error ? error.message : 'Chyba při nahrávání'
        } : img
      ))
    }
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    onImagesChange(newImages)
  }

  const removePendingImage = (index: number) => {
    setPendingImages(prev => {
      const img = prev[index]
      URL.revokeObjectURL(img.preview)
      return prev.filter((_, i) => i !== index)
    })
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>

      {/* Upload Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          dragActive
            ? 'border-primary-600 bg-primary-50'
            : 'border-gray-300 hover:border-primary-600 hover:bg-gray-50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
        />
        
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-700 font-medium mb-1">
          Klikněte nebo přetáhněte obrázky
        </p>
        <p className="text-sm text-gray-500">
          PNG, JPG, WEBP do 5MB • Max {maxImages} obrázků
        </p>
        <p className="text-xs text-gray-400 mt-2">
          {images.length + pendingImages.length} / {maxImages} nahráno
        </p>
      </div>

      {/* Pending Images */}
      {pendingImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {pendingImages.map((img, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-200">
                <img
                  src={img.preview}
                  alt="Náhled"
                  className="w-full h-full object-cover"
                />
                
                {/* Uploading overlay */}
                {img.uploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                    <div className="text-center text-white px-2">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                      <p className="text-xs font-medium">Komprese a nahrávání...</p>
                    </div>
                  </div>
                )}

                {/* Uploaded overlay */}
                {img.uploaded && (
                  <div className="absolute inset-0 bg-green-500 bg-opacity-20 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      {img.compressionRatio && (
                        <div className="bg-green-600 text-white text-xs px-2 py-1 rounded">
                          -{img.compressionRatio}% velikost
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Error overlay */}
                {img.error && (
                  <div className="absolute inset-0 bg-red-500 bg-opacity-20 flex items-center justify-center">
                    <div className="text-center text-white">
                      <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-xs">{img.error}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Remove button */}
              {!img.uploading && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    removePendingImage(index)
                  }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Uploaded Images */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((url, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 border-green-200">
                <img
                  src={url}
                  alt={`Obrázek ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Remove button */}
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Image number badge */}
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {images.length === 0 && pendingImages.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <ImageIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">Zatím nebyly nahrány žádné obrázky</p>
        </div>
      )}
    </div>
  )
}

