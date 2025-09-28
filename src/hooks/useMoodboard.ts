'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useWedding } from '@/hooks/useWedding'
import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore'
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage'
import { db, storage } from '@/lib/firebase'

export interface MoodboardImage {
  id: string
  url: string
  thumbnailUrl?: string
  title?: string
  description?: string
  source: 'pinterest' | 'upload'
  sourceUrl?: string
  isFavorite: boolean
  tags: string[]
  createdAt: Date
  userId: string
  weddingId: string
  storageRef?: string // Pro Firebase Storage reference
}

export function useMoodboard() {
  const { user } = useAuth()
  const { wedding } = useWedding()
  const [images, setImages] = useState<MoodboardImage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load images from Firestore
  useEffect(() => {
    if (!user || !wedding?.id) return

    const loadImages = async () => {
      try {
        setIsLoading(true)
        const imagesRef = collection(db, 'moodboards')
        const q = query(
          imagesRef,
          where('weddingId', '==', wedding.id),
          orderBy('createdAt', 'desc')
        )
        
        const snapshot = await getDocs(q)
        const loadedImages: MoodboardImage[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date()
        })) as MoodboardImage[]

        setImages(loadedImages)
      } catch (err) {
        console.error('Error loading moodboard images:', err)
        setError('Nepodařilo se načíst obrázky')
      } finally {
        setIsLoading(false)
      }
    }

    loadImages()
  }, [user, wedding?.id])

  // Add image from Pinterest
  const addPinterestImage = async (imageData: {
    url: string
    thumbnailUrl?: string
    title?: string
    description?: string
    sourceUrl?: string
    tags?: string[]
  }) => {
    if (!user || !wedding?.id) return

    try {
      setIsLoading(true)
      
      const newImage: Omit<MoodboardImage, 'id'> = {
        url: imageData.url,
        thumbnailUrl: imageData.thumbnailUrl,
        title: imageData.title,
        description: imageData.description,
        source: 'pinterest',
        sourceUrl: imageData.sourceUrl,
        isFavorite: false,
        tags: imageData.tags || [],
        createdAt: new Date(),
        userId: user.id,
        weddingId: wedding.id
      }

      const docRef = await addDoc(collection(db, 'moodboards'), {
        ...newImage,
        createdAt: serverTimestamp()
      })

      const addedImage: MoodboardImage = {
        ...newImage,
        id: docRef.id
      }

      setImages(prev => [addedImage, ...prev])
      return addedImage
    } catch (err) {
      console.error('Error adding Pinterest image:', err)
      setError('Nepodařilo se přidat obrázek z Pinterestu')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // Upload image file
  const uploadImage = async (file: File, metadata?: {
    title?: string
    description?: string
    tags?: string[]
  }) => {
    if (!user || !wedding?.id) return

    try {
      setIsLoading(true)
      
      // Create unique filename
      const timestamp = Date.now()
      const filename = `${timestamp}_${file.name}`
      const storageRef = ref(storage, `moodboards/${wedding.id}/${filename}`)
      
      // Upload file to Firebase Storage
      const snapshot = await uploadBytes(storageRef, file)
      const downloadURL = await getDownloadURL(snapshot.ref)
      
      const newImage: Omit<MoodboardImage, 'id'> = {
        url: downloadURL,
        title: metadata?.title || file.name,
        description: metadata?.description,
        source: 'upload',
        isFavorite: false,
        tags: metadata?.tags || [],
        createdAt: new Date(),
        userId: user.id,
        weddingId: wedding.id,
        storageRef: storageRef.fullPath
      }

      const docRef = await addDoc(collection(db, 'moodboards'), {
        ...newImage,
        createdAt: serverTimestamp()
      })

      const addedImage: MoodboardImage = {
        ...newImage,
        id: docRef.id
      }

      setImages(prev => [addedImage, ...prev])
      return addedImage
    } catch (err) {
      console.error('Error uploading image:', err)
      setError('Nepodařilo se nahrát obrázek')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // Remove image
  const removeImage = async (imageId: string) => {
    try {
      setIsLoading(true)
      
      const image = images.find(img => img.id === imageId)
      if (!image) return

      // Delete from Firestore
      await deleteDoc(doc(db, 'moodboards', imageId))
      
      // Delete from Storage if it's an uploaded image
      if (image.source === 'upload' && image.storageRef) {
        try {
          const storageRef = ref(storage, image.storageRef)
          await deleteObject(storageRef)
        } catch (storageErr) {
          console.warn('Could not delete file from storage:', storageErr)
        }
      }

      setImages(prev => prev.filter(img => img.id !== imageId))
    } catch (err) {
      console.error('Error removing image:', err)
      setError('Nepodařilo se smazat obrázek')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // Toggle favorite status
  const toggleFavorite = async (imageId: string) => {
    try {
      const image = images.find(img => img.id === imageId)
      if (!image) return

      const newFavoriteStatus = !image.isFavorite
      
      await updateDoc(doc(db, 'moodboards', imageId), {
        isFavorite: newFavoriteStatus
      })

      setImages(prev => prev.map(img => 
        img.id === imageId 
          ? { ...img, isFavorite: newFavoriteStatus }
          : img
      ))
    } catch (err) {
      console.error('Error toggling favorite:', err)
      setError('Nepodařilo se aktualizovat oblíbené')
      throw err
    }
  }

  // Generic add image function
  const addImage = async (imageData: any) => {
    if (imageData instanceof File) {
      return uploadImage(imageData)
    } else {
      return addPinterestImage(imageData)
    }
  }

  return {
    images,
    isLoading,
    error,
    addImage,
    addPinterestImage,
    uploadImage,
    removeImage,
    toggleFavorite
  }
}
