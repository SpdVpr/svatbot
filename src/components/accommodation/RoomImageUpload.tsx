'use client'

import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon, Loader2, AlertCircle } from 'lucide-react'
import Image from 'next/image'
import { compressImage, formatFileSize } from '@/utils/imageCompression'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from '@/config/firebase'
import { useAuth } from '@/hooks/useAuth'
import { useWedding } from '@/hooks/useWedding'

interface RoomImageUploadProps {
  images: string[]
  onImagesChange: (images: string[]) => void
  maxImages?: number
  disabled?: boolean
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
  progress?: number
}

export default function RoomImageUpload({
  images,
  onImagesChange,
  maxImages = 10,
  disabled = false
}: RoomImageUploadProps) {
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([])
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user } = useAuth()
  const { wedding } = useWedding()

  const canAddMore = images.length + pendingImages.length < maxImages

  const handleFiles = async (files: FileList | null) => {
    if (!files || !user || !wedding) return

    const fileArray = Array.from(files)
    const validFiles = fileArray.filter(file => {
      if (!file.type.startsWith('image/')) {
        console.warn(`Soubor ${file.name} není obrázek`)
        return false
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        console.warn(`Soubor ${file.name} je příliš velký (max 10MB)`)
        return false
      }
      return true
    })

    if (validFiles.length === 0) return

    // Limit to remaining slots
    const remainingSlots = maxImages - images.length - pendingImages.length
    const filesToProcess = validFiles.slice(0, remainingSlots)

    // Create pending images
    const newPendingImages: PendingImage[] = filesToProcess.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      uploading: false,
      uploaded: false,
      originalSize: file.size
    }))

    const startIndex = pendingImages.length
    setPendingImages(prev => [...prev, ...newPendingImages])

    console.log(`📸 Přidáno ${newPendingImages.length} pending images, celkem: ${startIndex + newPendingImages.length}`)

    // Start uploading each image
    for (let i = 0; i < newPendingImages.length; i++) {
      uploadImage(startIndex + i, newPendingImages[i])
    }
  }

  const uploadImage = async (index: number, pendingImage: PendingImage) => {
    if (!user || !wedding) return

    let progressInterval: NodeJS.Timeout | null = null

    try {
      // Update status to uploading
      setPendingImages(prev => prev.map((img, i) =>
        i === index ? { ...img, uploading: true, error: undefined, progress: 0 } : img
      ))

      // Simulate compression progress
      progressInterval = setInterval(() => {
        setPendingImages(prev => prev.map((img, i) => {
          if (i === index && img.uploading && (img.progress || 0) < 70) {
            return { ...img, progress: (img.progress || 0) + Math.random() * 15 }
          }
          return img
        }))
      }, 200)

      console.log(`📸 Komprese obrázku pokoje: ${pendingImage.file.name} (${formatFileSize(pendingImage.file.size)})`)

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
      const filename = `weddings/${wedding.id}/accommodations/rooms/${timestamp}_${pendingImage.file.name.replace(/\s+/g, '_')}`

      // Clear progress interval and set upload progress
      if (progressInterval) clearInterval(progressInterval)
      setPendingImages(prev => prev.map((img, i) =>
        i === index ? { ...img, progress: 85 } : img
      ))

      // Upload to Firebase Storage
      const storageRef = ref(storage, filename)
      const snapshot = await uploadBytes(storageRef, compressedResult.file)

      // Set final progress
      setPendingImages(prev => prev.map((img, i) =>
        i === index ? { ...img, progress: 100 } : img
      ))

      const downloadURL = await getDownloadURL(snapshot.ref)

      console.log('✅ Obrázek pokoje nahrán:', downloadURL)

      // Update pending image with success
      setPendingImages(prev => prev.map((img, i) =>
        i === index ? {
          ...img,
          uploading: false,
          uploaded: true,
          url: downloadURL,
          compressedSize: compressedResult.compressedSize,
          compressionRatio: compressedResult.compressionRatio
        } : img
      ))

      // Add to images array
      onImagesChange([...images, downloadURL])

      // Show success state for 3 seconds, then remove from pending
      setTimeout(() => {
        setPendingImages(prev => prev.filter((_, i) => i !== index))
      }, 3000)

    } catch (error: any) {
      console.error('Chyba při nahrávání obrázku pokoje:', error)

      // Clear progress interval
      if (progressInterval) clearInterval(progressInterval)

      // Update pending image with error
      setPendingImages(prev => prev.map((img, i) =>
        i === index ? {
          ...img,
          uploading: false,
          error: error.message || 'Chyba při nahrávání'
        } : img
      ))
    }
  }

  const removeImage = async (imageUrl: string, index: number) => {
    try {
      // Extract filename from URL for deletion
      const urlParts = imageUrl.split('/')
      const filename = urlParts[urlParts.length - 1].split('?')[0]
      const fullPath = `weddings/${wedding?.id}/accommodations/rooms/${filename}`
      
      // Delete from Firebase Storage
      const imageRef = ref(storage, fullPath)
      await deleteObject(imageRef)
      
      // Remove from images array
      const newImages = images.filter((_, i) => i !== index)
      onImagesChange(newImages)
      
      console.log('🗑️ Obrázek pokoje smazán:', imageUrl)
    } catch (error) {
      console.error('Chyba při mazání obrázku pokoje:', error)
    }
  }

  const removePendingImage = (index: number) => {
    setPendingImages(prev => {
      const newPending = [...prev]
      // Revoke object URL to prevent memory leaks
      URL.revokeObjectURL(newPending[index].preview)
      newPending.splice(index, 1)
      return newPending
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
    
    if (disabled || !canAddMore) return
    
    const files = e.dataTransfer.files
    handleFiles(files)
  }

  const openFileDialog = () => {
    if (disabled || !canAddMore) return
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Fotky pokoje
        </label>
        <span className="text-xs text-gray-500">
          {images.length + pendingImages.length}/{maxImages}
        </span>
      </div>

      {/* Upload Area */}
      {canAddMore && !disabled && (
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive
              ? 'border-rose-400 bg-rose-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
          />

          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            Přetáhněte fotky pokoje nebo
          </p>
          <button
            type="button"
            onClick={openFileDialog}
            className="mt-2 inline-flex items-center px-4 py-2 bg-rose-600 text-white text-sm font-medium rounded-lg hover:bg-rose-700 transition-colors"
          >
            <Upload className="w-4 h-4 mr-2" />
            Vybrat fotky
          </button>
          <p className="text-xs text-gray-500 mt-2">
            PNG, JPG, WEBP do 10MB
          </p>
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
                  alt={`Pokoj ${index + 1}`}
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
                {pendingImage.uploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center">
                    <Loader2 className="h-8 w-8 text-white animate-spin mb-3" />
                    <div className="text-center text-white px-2">
                      <p className="text-xs font-medium mb-2">
                        {pendingImage.progress && pendingImage.progress > 0
                          ? `${Math.round(pendingImage.progress)}%`
                          : 'Komprese...'}
                      </p>
                      {pendingImage.progress && pendingImage.progress > 0 && (
                        <div className="w-20 bg-gray-200 bg-opacity-30 rounded-full h-1.5">
                          <div
                            className="bg-white h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(pendingImage.progress, 100)}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Success Overlay */}
                {pendingImage.uploaded && (
                  <div className="absolute inset-0 bg-green-500 bg-opacity-75 flex flex-col items-center justify-center">
                    <div className="h-8 w-8 text-white mb-2 flex items-center justify-center">
                      ✓
                    </div>
                    <span className="text-white text-xs">Nahráno!</span>
                  </div>
                )}

                {/* Error Overlay */}
                {pendingImage.error && (
                  <div className="absolute inset-0 bg-red-500 bg-opacity-75 flex flex-col items-center justify-center">
                    <AlertCircle className="h-6 w-6 text-white mb-2" />
                    <span className="text-white text-xs text-center px-2">Chyba</span>
                  </div>
                )}
              </div>
              
              {!pendingImage.uploaded && (
                <button
                  type="button"
                  onClick={() => removePendingImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              
              {/* Compression Info */}
              {pendingImage.uploaded && pendingImage.compressionRatio && (
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs p-1 text-center">
                  -{pendingImage.compressionRatio}%
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {images.length === 0 && pendingImages.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <ImageIcon className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-2 text-sm">Zatím nejsou přidané žádné fotky pokoje</p>
        </div>
      )}
    </div>
  )
}
