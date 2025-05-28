import { useState } from 'react'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { httpsCallable } from 'firebase/functions'
import { storage } from '../lib/firebase'
import { useMarketplaceAuth } from './useAuth'

interface UploadResult {
  url: string
  filename: string
  size: number
}

export function useImageUpload() {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const { user } = useMarketplaceAuth()

  // Upload to Firebase Storage directly
  const uploadToStorage = async (
    file: File,
    folder: string = 'svatbot'
  ): Promise<UploadResult> => {
    if (!user) throw new Error('Authentication required')

    const filename = `${folder}/${user.uid}/${Date.now()}_${file.name}`
    const storageRef = ref(storage, filename)

    try {
      setUploading(true)
      setError(null)

      // Upload file
      const snapshot = await uploadBytes(storageRef, file)

      // Get download URL
      const url = await getDownloadURL(snapshot.ref)

      return {
        url,
        filename,
        size: file.size
      }
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setUploading(false)
    }
  }

  // Upload via Cloud Function (with processing) - disabled for now
  const uploadViaFunction = async (files: File[]): Promise<UploadResult[]> => {
    throw new Error('Cloud Function upload not available in this build')
  }

  // Upload multiple files with progress
  const uploadMultiple = async (
    files: File[],
    folder: string = 'svatbot',
    onProgress?: (progress: number) => void
  ): Promise<UploadResult[]> => {
    if (!user) throw new Error('Authentication required')

    const results: UploadResult[] = []
    let completed = 0

    try {
      setUploading(true)
      setError(null)

      for (const file of files) {
        const result = await uploadToStorage(file, folder)
        results.push(result)

        completed++
        const progressPercent = (completed / files.length) * 100
        setProgress(progressPercent)
        onProgress?.(progressPercent)
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

  // Delete image
  const deleteImage = async (filename: string): Promise<void> => {
    try {
      const imageRef = ref(storage, filename)
      await deleteObject(imageRef)
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  // Optimized upload for vendor images
  const uploadVendorImages = async (
    files: File[],
    vendorId: string,
    type: 'gallery' | 'portfolio' = 'gallery'
  ): Promise<UploadResult[]> => {
    const folder = type === 'portfolio' ? 'portfolio' : 'svatbot'
    return uploadMultiple(files, folder)
  }

  return {
    uploadToStorage,
    uploadViaFunction,
    uploadMultiple,
    uploadVendorImages,
    deleteImage,
    uploading,
    progress,
    error
  }
}

// Hook for drag & drop upload
export function useDragAndDrop(onFilesSelected: (files: File[]) => void) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files).filter(file =>
      file.type.startsWith('image/')
    )

    if (files.length > 0) {
      onFilesSelected(files)
    }
  }

  return {
    isDragging,
    dragProps: {
      onDragEnter: handleDragEnter,
      onDragLeave: handleDragLeave,
      onDragOver: handleDragOver,
      onDrop: handleDrop
    }
  }
}
