'use client'

import { useState } from 'react'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '@/config/firebase'
import { useAuthStore } from '@/stores/authStore'
import { useWeddingStore } from '@/stores/weddingStore'
import { compressImage } from '@/utils/imageCompression'

interface UploadResult {
  url: string
  filename: string
  size: number
}

interface CompressionOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  maxSizeKB?: number
}

export function useWeddingImageUpload() {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuthStore()
  const { currentWedding: wedding } = useWeddingStore()

  const uploadImage = async (
    file: File,
    folder: string = 'wedding-websites',
    customCompression?: CompressionOptions
  ): Promise<UploadResult> => {
    if (!user) throw new Error('Authentication required')
    if (!wedding) throw new Error('Wedding context required')

    try {
      setUploading(true)
      setError(null)
      setProgress(0)

      // Compress image before upload
      // Use custom compression options or defaults
      const compressionOptions = {
        maxWidth: customCompression?.maxWidth ?? 1920,
        maxHeight: customCompression?.maxHeight ?? 1920,
        quality: customCompression?.quality ?? 0.8,
        maxSizeKB: customCompression?.maxSizeKB ?? 1000
      }

      console.log(`🖼️ Komprese obrázku: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`)
      
      const compressedResult = await compressImage(file, compressionOptions)
      
      console.log(`✅ Komprese dokončena: ${(compressedResult.originalSize / 1024 / 1024).toFixed(2)}MB → ${(compressedResult.compressedSize / 1024 / 1024).toFixed(2)}MB (${compressedResult.compressionRatio}% úspora)`)

      setProgress(50)

      // Create unique filename using wedding ID (matches storage rules)
      const timestamp = Date.now()
      const weddingId = wedding.id
      const filename = `${folder}/${weddingId}/${timestamp}_${file.name.replace(/\s+/g, '_')}`

      console.log('📁 Storage path:', filename)
      console.log('👤 User ID:', user.id)
      console.log('💒 Wedding ID:', weddingId)

      // Upload to Firebase Storage
      const storageRef = ref(storage, filename)
      const snapshot = await uploadBytes(storageRef, compressedResult.file)
      
      setProgress(80)

      // Get download URL
      const url = await getDownloadURL(snapshot.ref)

      setProgress(100)

      return {
        url,
        filename,
        size: compressedResult.compressedSize
      }
    } catch (err: any) {
      console.error('Error uploading image:', err)
      setError(err.message)
      throw err
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  const uploadMultiple = async (
    files: File[],
    folder: string = 'wedding-websites'
  ): Promise<UploadResult[]> => {
    if (!user) throw new Error('Authentication required')
    if (!wedding) throw new Error('Wedding context required')

    const results: UploadResult[] = []
    let completed = 0

    try {
      setUploading(true)
      setError(null)

      for (const file of files) {
        const result = await uploadImage(file, folder)
        results.push(result)

        completed++
        const progressPercent = (completed / files.length) * 100
        setProgress(progressPercent)
      }

      return results
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  return {
    uploadImage,
    uploadMultiple,
    uploading,
    progress,
    error
  }
}
