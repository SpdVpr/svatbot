'use client'

import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from '@/lib/firebase'
import { compressImage, formatFileSize } from '@/utils/imageCompression'
import { useAuth } from '@/hooks/useAuth'
import { useWedding } from '@/hooks/useWedding'

interface ShoppingImageUploadProps {
  imageUrl: string
  onImageChange: (url: string) => void
  disabled?: boolean
}

interface PendingImage {
  file: File
  preview: string
  isUploading: boolean
}

export default function ShoppingImageUpload({ imageUrl, onImageChange, disabled }: ShoppingImageUploadProps) {
  const { user } = useAuth()
  const { wedding } = useWedding()
  const [pendingImage, setPendingImage] = useState<PendingImage | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files)
    }
  }

  const handleFiles = (files: FileList) => {
    const file = files[0]
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Prosím vyberte obrázek (JPG, PNG, WebP)')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Obrázek je příliš velký. Maximální velikost je 10MB.')
      return
    }

    // Create preview
    const preview = URL.createObjectURL(file)
    const newPendingImage: PendingImage = {
      file,
      preview,
      isUploading: false
    }

    setPendingImage(newPendingImage)
    uploadImage(newPendingImage)
  }

  const uploadImage = async (pending: PendingImage) => {
    if (!user || !wedding) return

    try {
      setPendingImage(prev => prev ? { ...prev, isUploading: true } : null)

      console.log(`📸 Komprese obrázku produktu: ${pending.file.name} (${formatFileSize(pending.file.size)})`)

      // Compress image before upload
      const compressionOptions = {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.85,
        maxSizeKB: 600
      }

      const compressedResult = await compressImage(pending.file, compressionOptions)

      console.log(`✅ Komprese dokončena: ${formatFileSize(compressedResult.originalSize)} → ${formatFileSize(compressedResult.compressedSize)} (${compressedResult.compressionRatio}% úspora)`)

      // Create unique filename
      const timestamp = Date.now()
      const filename = `weddings/${wedding.id}/shopping/${timestamp}_${pending.file.name.replace(/\s+/g, '_')}`

      // Upload to Firebase Storage
      const storageRef = ref(storage, filename)
      const snapshot = await uploadBytes(storageRef, compressedResult.file)
      const downloadURL = await getDownloadURL(snapshot.ref)

      console.log('✅ Obrázek produktu nahrán:', downloadURL)

      // Update image URL
      onImageChange(downloadURL)
      setPendingImage(null)
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Chyba při nahrávání obrázku. Zkuste to prosím znovu.')
      setPendingImage(null)
    }
  }

  const removeImage = async () => {
    if (!imageUrl) return

    try {
      // If it's a Firebase Storage URL, delete it
      if (imageUrl.includes('firebasestorage.googleapis.com')) {
        const storageRef = ref(storage, imageUrl)
        await deleteObject(storageRef)
        console.log('✅ Obrázek produktu smazán ze Storage')
      }

      onImageChange('')
    } catch (error) {
      console.error('Error removing image:', error)
      // Still remove from form even if deletion fails
      onImageChange('')
    }
  }

  const removePendingImage = () => {
    if (pendingImage?.preview) {
      URL.revokeObjectURL(pendingImage.preview)
    }
    setPendingImage(null)
  }

  return (
    <div className="space-y-4">
      {/* Current Image */}
      {imageUrl && !pendingImage && (
        <div className="relative group">
          <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-gray-200">
            <Image
              src={imageUrl}
              alt="Obrázek produktu"
              fill
              className="object-contain"
              unoptimized
            />
          </div>
          {!disabled && (
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Pending Image */}
      {pendingImage && (
        <div className="relative">
          <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-purple-200">
            <Image
              src={pendingImage.preview}
              alt="Náhled"
              fill
              className="object-contain"
              unoptimized
            />
            {pendingImage.isUploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="text-center text-white">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                  <p className="text-sm">Nahrávám...</p>
                </div>
              </div>
            )}
          </div>
          {!pendingImage.isUploading && (
            <button
              type="button"
              onClick={removePendingImage}
              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Upload Area */}
      {!imageUrl && !pendingImage && !disabled && (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
            dragActive
              ? 'border-purple-400 bg-purple-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-base font-medium text-gray-900 mb-1">
            Přetáhněte obrázek sem nebo klikněte pro výběr
          </h3>
          <p className="text-sm text-gray-600 mb-2">
            Podporované formáty: JPG, PNG, WebP
          </p>
          <p className="text-xs text-gray-500">
            Max 10MB • Automatická komprese
          </p>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleChange}
            disabled={disabled}
          />
        </div>
      )}

      {/* Help Text */}
      {!imageUrl && !pendingImage && (
        <p className="text-xs text-gray-500 text-center">
          💡 Tip: Pokud se obrázek nenačetl automaticky z URL, můžete ho nahrát ručně
        </p>
      )}
    </div>
  )
}

