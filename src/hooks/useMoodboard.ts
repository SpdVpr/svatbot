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
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore'
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage'
import { db, storage } from '@/lib/firebase'
import { compressImage, createThumbnail, isValidImageFile, formatFileSize } from '@/utils/imageCompression'

export interface MoodboardImage {
  id: string
  url: string
  thumbnailUrl: string
  title: string
  description: string
  source: 'upload' | 'ai-generated'
  sourceUrl: string
  isFavorite: boolean
  tags: string[]
  category: WeddingCategory
  position?: { x: number; y: number } // Pro drag & drop pozicování
  size?: { width: number; height: number } // Pro zachování velikosti
  createdAt: Date
  userId: string
  weddingId: string
  storageRef: string // Pro Firebase Storage reference
  aiMetadata?: {
    prompt: string
    sourceImages: string[] // IDs původních fotek
    style: string
    colors: string[]
    mood: string
    generatedAt: Date
    analysis?: any
    description?: any
  }
}

export type WeddingCategory =
  | 'venue' // místo
  | 'decoration' // dekorace
  | 'flowers' // květiny
  | 'dress' // šaty
  | 'cake' // dort
  | 'photography' // fotografie
  | 'colors' // barvy
  | 'invitations' // pozvánky
  | 'rings' // prsteny
  | 'hairstyle' // účes
  | 'makeup' // makeup
  | 'other' // ostatní

export const WEDDING_CATEGORIES = {
  venue: { label: 'Místo konání', icon: '🏰', color: 'bg-green-100 text-green-700' },
  decoration: { label: 'Dekorace', icon: '✨', color: 'bg-purple-100 text-purple-700' },
  flowers: { label: 'Květiny', icon: '🌸', color: 'bg-pink-100 text-pink-700' },
  dress: { label: 'Šaty', icon: '👗', color: 'bg-blue-100 text-blue-700' },
  cake: { label: 'Dort', icon: '🎂', color: 'bg-yellow-100 text-yellow-700' },
  photography: { label: 'Fotografie', icon: '📸', color: 'bg-gray-100 text-gray-700' },
  colors: { label: 'Barvy', icon: '🎨', color: 'bg-red-100 text-red-700' },
  invitations: { label: 'Pozvánky', icon: '💌', color: 'bg-indigo-100 text-indigo-700' },
  rings: { label: 'Prsteny', icon: '💍', color: 'bg-amber-100 text-amber-700' },
  hairstyle: { label: 'Účes', icon: '💇‍♀️', color: 'bg-teal-100 text-teal-700' },
  makeup: { label: 'Makeup', icon: '💄', color: 'bg-rose-100 text-rose-700' },
  other: { label: 'Ostatní', icon: '📌', color: 'bg-gray-100 text-gray-700' }
}

export function useMoodboard() {
  const { user } = useAuth()
  const { wedding } = useWedding()
  const [images, setImages] = useState<MoodboardImage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cleanupDone, setCleanupDone] = useState(false)

  // Load images from Firestore with real-time updates
  useEffect(() => {
    if (!user || !wedding?.id) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    const imagesRef = collection(db, 'moodboards')
    const q = query(
      imagesRef,
      where('weddingId', '==', wedding.id),
      orderBy('createdAt', 'desc')
    )

    // Use onSnapshot for real-time updates
    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        console.log('🔄 Moodboard: Loading images from Firebase...', {
          totalDocs: snapshot.docs.length,
          weddingId: wedding.id
        })

        const loadedImages: MoodboardImage[] = snapshot.docs
          .filter(doc => {
            const data = doc.data()
            // Filter out Pinterest images
            const isPinterestImage = (
              data.source === 'pinterest' ||
              (data.url && (
                data.url.includes('pinterest.com') ||
                data.url.includes('pinimg.com') ||
                data.sourceUrl?.includes('pinterest.com')
              ))
            )
            return !isPinterestImage
          })
          .map(doc => {
            const data = doc.data()

            // Debug log for category
            if (data.source === 'upload' && data.category !== 'other') {
              console.log('📋 Loading image with category:', {
                id: doc.id,
                title: data.title,
                category: data.category,
                rawCategory: data.category
              })
            }

            return {
              id: doc.id,
              url: data.url || '',
              thumbnailUrl: data.thumbnailUrl || '',
              title: data.title || 'Bez názvu',
              description: data.description || '',
              source: data.source || 'upload',
              sourceUrl: data.sourceUrl || '',
              isFavorite: data.isFavorite || false,
              tags: data.tags || [],
              category: data.category || 'other',
              position: data.position || undefined,
              size: data.size || undefined,
              createdAt: data.createdAt?.toDate() || new Date(),
              userId: data.userId || '',
              weddingId: data.weddingId || '',
              storageRef: data.storageRef || '',
              aiMetadata: data.aiMetadata || undefined
            }
          }) as MoodboardImage[]

        console.log('✅ Moodboard: Loaded images:', {
          total: loadedImages.length,
          uploaded: loadedImages.filter(img => img.source === 'upload').length,
          aiGenerated: loadedImages.filter(img => img.source === 'ai-generated').length,
          categories: loadedImages.reduce((acc, img) => {
            acc[img.category] = (acc[img.category] || 0) + 1
            return acc
          }, {} as Record<string, number>)
        })

        setImages(loadedImages)
        setIsLoading(false)
      },
      (err) => {
        console.error('Error loading moodboard images:', err)
        setError('Nepodařilo se načíst obrázky')
        setIsLoading(false)
      }
    )

    return () => unsubscribe()
  }, [user, wedding?.id])

  // Cleanup Pinterest data on mount
  useEffect(() => {
    if (!user || !wedding?.id || cleanupDone) return

    const cleanupPinterestImages = async () => {
      try {
        const q = query(
          collection(db, 'moodboards'),
          where('userId', '==', user.id),
          where('weddingId', '==', wedding.id)
        )

        const snapshot = await getDocs(q)
        let deletedCount = 0

        for (const docSnapshot of snapshot.docs) {
          const data = docSnapshot.data()

          // Check if this is a Pinterest image or has Pinterest URL
          const isPinterestImage = (
            data.source === 'pinterest' ||
            (data.url && (
              data.url.includes('pinterest.com') ||
              data.url.includes('pinimg.com') ||
              data.sourceUrl?.includes('pinterest.com')
            ))
          )

          if (isPinterestImage) {
            console.log(`🗑️ Deleting Pinterest image: ${docSnapshot.id}`)
            await deleteDoc(doc(db, 'moodboards', docSnapshot.id))
            deletedCount++
          }
        }

        if (deletedCount > 0) {
          console.log(`✅ Cleaned up ${deletedCount} Pinterest images`)
        }

        setCleanupDone(true)
      } catch (error) {
        console.error('❌ Error cleaning up Pinterest images:', error)
        setCleanupDone(true) // Don't retry on error
      }
    }

    cleanupPinterestImages()
  }, [user, wedding?.id, cleanupDone])

  // Upload image file with compression
  const uploadImage = async (file: File, metadata?: {
    title?: string
    description?: string
    tags?: string[]
    category?: WeddingCategory
  }) => {
    if (!user || !wedding?.id) return

    console.log('🔍 uploadImage called with metadata:', {
      fileName: file.name,
      metadata: metadata,
      category: metadata?.category,
      hasMetadata: !!metadata
    })

    // Validate file type
    if (!isValidImageFile(file)) {
      throw new Error('Nepodporovaný formát obrázku. Podporované formáty: JPEG, PNG, WebP')
    }

    try {
      setIsLoading(true)

      console.log(`📸 Komprese obrázku: ${file.name} (${formatFileSize(file.size)})`)

      // Compress main image
      const compressedResult = await compressImage(file, {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.8,
        maxSizeKB: 500
      })

      // Create thumbnail
      const thumbnailFile = await createThumbnail(file, 300)

      console.log(`✅ Komprese dokončena: ${formatFileSize(compressedResult.originalSize)} → ${formatFileSize(compressedResult.compressedSize)} (${compressedResult.compressionRatio}% úspora)`)

      // Create unique filename
      const timestamp = Date.now()
      const filename = `${timestamp}_${file.name}`
      const thumbnailFilename = `thumb_${timestamp}_${file.name}`

      // Upload compressed main image
      const storageRef = ref(storage, `moodboards/${wedding.id}/${filename}`)
      const snapshot = await uploadBytes(storageRef, compressedResult.file)
      const downloadURL = await getDownloadURL(snapshot.ref)

      // Upload thumbnail
      const thumbnailRef = ref(storage, `moodboards/${wedding.id}/thumbnails/${thumbnailFilename}`)
      const thumbnailSnapshot = await uploadBytes(thumbnailRef, thumbnailFile)
      const thumbnailURL = await getDownloadURL(thumbnailSnapshot.ref)
      
      const newImage: Omit<MoodboardImage, 'id'> = {
        url: downloadURL,
        thumbnailUrl: thumbnailURL,
        title: metadata?.title || file.name,
        description: metadata?.description || '',
        source: 'upload',
        sourceUrl: '',
        isFavorite: false,
        tags: metadata?.tags || [],
        category: metadata?.category || 'other',
        createdAt: new Date(),
        userId: user.id,
        weddingId: wedding.id,
        storageRef: storageRef.fullPath
      }

      console.log('💾 Saving to Firestore with category:', {
        category: newImage.category,
        metadataCategory: metadata?.category,
        title: newImage.title
      })

      const docRef = await addDoc(collection(db, 'moodboards'), {
        ...newImage,
        createdAt: serverTimestamp()
      })

      console.log('✅ Saved to Firestore with ID:', docRef.id)

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
  const addImage = async (imageData: any, metadata?: {
    title?: string
    description?: string
    tags?: string[]
    category?: WeddingCategory
  }) => {
    if (imageData instanceof File) {
      return uploadImage(imageData, metadata)
    } else {
      throw new Error('Pouze upload souborů je podporován')
    }
  }

  // Update image position with debounce
  const updateImagePosition = async (imageId: string, position: { x: number; y: number }, size?: { width: number; height: number }) => {
    if (!user || !wedding?.id) return

    try {
      // Update local state immediately for smooth UX
      setImages(prev => prev.map(img =>
        img.id === imageId
          ? { ...img, position, ...(size && { size }) }
          : img
      ))

      // Debounce Firebase update to reduce writes
      const imageRef = doc(db, 'moodboards', imageId)
      const updateData: any = { position }
      if (size) {
        updateData.size = size
      }

      await updateDoc(imageRef, updateData)
    } catch (err) {
      console.error('❌ Error updating image position:', err)
    }
  }

  // Update image category
  const updateImageCategory = async (imageId: string, category: WeddingCategory) => {
    if (!user || !wedding?.id) return

    try {
      const imageRef = doc(db, 'moodboards', imageId)
      await updateDoc(imageRef, { category })

      // Update local state
      setImages(prev => prev.map(img =>
        img.id === imageId
          ? { ...img, category }
          : img
      ))
    } catch (err) {
      console.error('❌ Error updating image category:', err)
    }
  }

  // Generate AI Moodboard
  const generateAIMoodboard = async (
    selectedImageIds: string[],
    options?: {
      aspectRatio?: string
      style?: string
      seed?: number
    }
  ) => {
    if (!user || !wedding?.id) {
      throw new Error('Musíte být přihlášeni')
    }

    if (selectedImageIds.length < 2) {
      throw new Error('Vyberte alespoň 2 obrázky')
    }

    if (selectedImageIds.length > 10) {
      throw new Error('Maximální počet obrázků je 10')
    }

    setIsLoading(true)
    setError(null)

    try {
      // Get selected images
      const selectedImages = images.filter(img => selectedImageIds.includes(img.id))
      const imageUrls = selectedImages.map(img => img.url)

      // Build wedding context
      const weddingContext = {
        weddingDate: wedding.weddingDate,
        location: wedding.region,
        style: wedding.style,
        guestCount: wedding.estimatedGuestCount
      }

      console.log('🔍 Step 1: Analyzing images...')

      // Step 1: Analyze images with GPT-4o-mini Vision
      const analyzeResponse = await fetch('/api/ai/moodboard/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrls, weddingContext })
      })

      if (!analyzeResponse.ok) {
        const errorData = await analyzeResponse.json()
        throw new Error(errorData.error || 'Nepodařilo se analyzovat obrázky')
      }

      const { analysis } = await analyzeResponse.json()
      console.log('✅ Analysis complete:', analysis)

      console.log('🎨 Step 2: Generating moodboard...')

      // Step 2: Generate moodboard with Ideogram
      const generateResponse = await fetch('/api/ai/moodboard/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: analysis.prompt,
          options
        })
      })

      if (!generateResponse.ok) {
        const errorData = await generateResponse.json()
        throw new Error(errorData.error || 'Nepodařilo se vygenerovat moodboard')
      }

      const { imageUrl: generatedImageUrl } = await generateResponse.json()
      console.log('✅ Moodboard generated:', generatedImageUrl)

      console.log('✍️ Step 3: Generating description...')

      // Step 3: Generate description with GPT-4o-mini
      const describeResponse = await fetch('/api/ai/moodboard/describe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysis,
          generatedImageUrl,
          weddingContext
        })
      })

      if (!describeResponse.ok) {
        const errorData = await describeResponse.json()
        throw new Error(errorData.error || 'Nepodařilo se vygenerovat popis')
      }

      const { description } = await describeResponse.json()
      console.log('✅ Description generated')

      // Step 4: Save to Firebase Storage and Firestore
      console.log('💾 Step 4: Saving to Firebase...')

      // Download generated image via proxy to bypass CORS
      const proxyResponse = await fetch('/api/ai/moodboard/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: generatedImageUrl })
      })

      if (!proxyResponse.ok) {
        throw new Error('Nepodařilo se stáhnout vygenerovaný obrázek')
      }

      const imageBlob = await proxyResponse.blob()
      console.log('✅ Image downloaded via proxy')

      // Create file from blob
      const timestamp = Date.now()
      const filename = `ai_moodboard_${timestamp}.png`
      const thumbnailFilename = `thumb_ai_moodboard_${timestamp}.png`

      // Upload to Firebase Storage
      const storageRef = ref(storage, `moodboards/${wedding.id}/ai-generated/${filename}`)
      const snapshot = await uploadBytes(storageRef, imageBlob)
      const downloadURL = await getDownloadURL(snapshot.ref)

      // Create thumbnail (reuse the same image for now, or compress it)
      const thumbnailRef = ref(storage, `moodboards/${wedding.id}/ai-generated/thumbnails/${thumbnailFilename}`)
      const thumbnailSnapshot = await uploadBytes(thumbnailRef, imageBlob)
      const thumbnailURL = await getDownloadURL(thumbnailSnapshot.ref)

      // Save to Firestore
      const newImage: Omit<MoodboardImage, 'id'> = {
        url: downloadURL,
        thumbnailUrl: thumbnailURL,
        title: `AI Moodboard - ${analysis.style}`,
        description: description.summary || description.styleDescription,
        source: 'ai-generated',
        sourceUrl: generatedImageUrl,
        isFavorite: false,
        tags: analysis.colors || [],
        category: 'other',
        createdAt: new Date(),
        userId: user.id,
        weddingId: wedding.id,
        storageRef: storageRef.fullPath,
        aiMetadata: {
          prompt: analysis.prompt,
          sourceImages: selectedImageIds,
          style: analysis.style,
          colors: analysis.colors || [],
          mood: analysis.mood || '',
          generatedAt: new Date(),
          analysis,
          description
        }
      }

      const docRef = await addDoc(collection(db, 'moodboards'), {
        ...newImage,
        createdAt: serverTimestamp(),
        'aiMetadata.generatedAt': serverTimestamp()
      })

      console.log('✅ AI Moodboard saved successfully!')

      setIsLoading(false)

      return {
        id: docRef.id,
        ...newImage,
        analysis,
        description
      }

    } catch (err) {
      console.error('❌ Error generating AI moodboard:', err)
      setError(err instanceof Error ? err.message : 'Nepodařilo se vygenerovat AI moodboard')
      setIsLoading(false)
      throw err
    }
  }

  return {
    images,
    isLoading,
    error,
    addImage,
    uploadImage,
    removeImage,
    toggleFavorite,
    updateImagePosition,
    updateImageCategory,
    generateAIMoodboard
  }
}
