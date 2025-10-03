'use client'

import { useState, useEffect } from 'react'
import { db } from '@/config/firebase'
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  onSnapshot
} from 'firebase/firestore'
import type { WeddingWebsite, WebsiteFormData } from '@/types/wedding-website'
import { useAuthStore } from '@/stores/authStore'
import { useWeddingStore } from '@/stores/weddingStore'

// Helper funkce pro převod Date objektů na Timestamp pro Firestore
const cleanForFirestore = (obj: any, depth = 0, path = ''): any => {
  // Prevent infinite recursion
  if (depth > 15) {
    console.warn(`Max depth reached in cleanForFirestore at path: ${path}`)
    return null
  }

  if (obj === null || obj === undefined) {
    return obj
  }

  // Primitive types
  if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean') {
    // Check for base64 data URLs that are too large
    if (typeof obj === 'string' && obj.startsWith('data:image/') && obj.length > 100000) {
      console.warn(`Large base64 image found at path ${path}, size: ${obj.length} bytes - removing to prevent document size limit`)
      return undefined // Remove large base64 images
    }
    return obj
  }

  // Date objects
  if (obj instanceof Date) {
    // Check if date is valid
    if (isNaN(obj.getTime())) {
      console.warn(`Invalid date found at path ${path}, converting to null:`, obj)
      return null
    }
    return Timestamp.fromDate(obj)
  }

  // Timestamp objects (already clean)
  if (obj instanceof Timestamp) {
    return obj
  }

  // Functions - skip them
  if (typeof obj === 'function') {
    console.log(`Skipping function at path: ${path}`)
    return undefined
  }

  // File objects - skip them
  if (obj instanceof File || obj instanceof Blob) {
    console.log(`Skipping File/Blob at path: ${path}`)
    return undefined
  }

  // DOM elements - skip them
  if (typeof HTMLElement !== 'undefined' && obj instanceof HTMLElement) {
    console.log(`Skipping HTMLElement at path: ${path}`)
    return undefined
  }

  // React refs - skip them
  if (obj && typeof obj === 'object' && 'current' in obj && Object.keys(obj).length === 1) {
    console.log(`Skipping React ref at path: ${path}`)
    return undefined
  }

  // Special objects that might cause issues
  if (obj && typeof obj === 'object') {
    const constructor = obj.constructor
    const constructorName = constructor ? constructor.name : 'Unknown'

    // Skip known problematic objects
    if (constructorName === 'FileList' || constructorName === 'DataTransfer' ||
        constructorName === 'Event' || constructorName === 'SyntheticEvent' ||
        constructorName === 'MouseEvent' || constructorName === 'KeyboardEvent') {
      console.log(`Skipping ${constructorName} at path: ${path}`)
      return undefined
    }
  }

  // Arrays
  if (Array.isArray(obj)) {
    const cleaned = obj.map((item, index) =>
      cleanForFirestore(item, depth + 1, `${path}[${index}]`)
    ).filter(item => item !== undefined)
    return cleaned
  }

  // Plain objects only
  if (typeof obj === 'object' && obj !== null) {
    // Check if it's a plain object (not a class instance)
    const isPlainObject = obj.constructor === Object || obj.constructor === undefined

    if (isPlainObject) {
      const cleaned: any = {}
      for (const [key, value] of Object.entries(obj)) {
        // Skip keys that start with underscore (private properties)
        if (key.startsWith('_')) {
          continue
        }

        const newPath = path ? `${path}.${key}` : key
        const cleanedValue = cleanForFirestore(value, depth + 1, newPath)
        if (cleanedValue !== undefined) {
          cleaned[key] = cleanedValue
        }
      }
      return cleaned
    } else {
      // For class instances, try JSON serialization as last resort
      try {
        const serialized = JSON.parse(JSON.stringify(obj))
        return cleanForFirestore(serialized, depth + 1, path)
      } catch (error) {
        console.warn(`Could not serialize object at path ${path}:`, obj, error)
        return null
      }
    }
  }

  return obj
}

export function useWeddingWebsite(customUrl?: string) {
  const { user } = useAuthStore()
  const { currentWedding: wedding } = useWeddingStore()

  const [website, setWebsite] = useState<WeddingWebsite | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Načtení svatebního webu podle wedding ID (pro editaci)
  useEffect(() => {
    if (!user || !wedding || customUrl) {
      // Pokud je customUrl, použije se jiný useEffect níže
      if (!customUrl) {
        setLoading(false)
      }
      return
    }

    const loadWebsiteByWeddingId = async () => {
      try {
        setLoading(true)
        setError(null)

        // Hledáme web podle weddingId
        const websitesRef = collection(db, 'weddingWebsites')
        const q = query(websitesRef, where('weddingId', '==', wedding.id))
        const querySnapshot = await getDocs(q)

        if (querySnapshot.empty) {
          setWebsite(null)
          setLoading(false)
          return
        }

        // Vezme první nalezený web (měl by být pouze jeden)
        const doc = querySnapshot.docs[0]
        const data = doc.data()

        const loadedWebsite = {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          publishedAt: data.publishedAt?.toDate() || undefined,
        } as WeddingWebsite

        setWebsite(loadedWebsite)

      } catch (err: any) {
        console.error('Error loading website by wedding ID:', err)
        setError('Chyba při načítání svatebního webu')
      } finally {
        setLoading(false)
      }
    }

    loadWebsiteByWeddingId()
  }, [user, wedding, customUrl])

  // Načtení svatebního webu podle custom URL (pro veřejný přístup)
  useEffect(() => {
    if (!customUrl) {
      return
    }

    const loadWebsite = async () => {
      try {
        setLoading(true)
        setError(null)

        // Načteme dokument přímo podle customUrl (které je document ID)
        const websiteRef = doc(db, 'weddingWebsites', customUrl)
        const websiteSnap = await getDoc(websiteRef)

        if (!websiteSnap.exists()) {
          setWebsite(null)
          setError('Svatební web nenalezen')
          return
        }

        const data = websiteSnap.data()

        // Kontrola, zda je web publikován (pro veřejný přístup)
        if (!data.isPublished) {
          setWebsite(null)
          setError('Svatební web není publikován')
          return
        }

        setWebsite({
          id: websiteSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          publishedAt: data.publishedAt?.toDate(),
          content: {
            ...data.content,
            hero: {
              ...data.content.hero,
              weddingDate: data.content.hero.weddingDate?.toDate() || new Date(),
            },
          },
        } as WeddingWebsite)
      } catch (err: any) {
        console.error('Error loading wedding website:', err)
        setError('Chyba při načítání svatebního webu')
      } finally {
        setLoading(false)
      }
    }

    loadWebsite()
  }, [customUrl])

  // Načtení svatebního webu pro aktuální svatbu (pro admin)
  useEffect(() => {
    if (!user || !wedding?.id || customUrl) {
      return
    }

    // Pro admin rozhraní budeme muset implementovat jiný způsob
    // Zatím nastavíme website na null, protože nemáme customUrl
    setWebsite(null)
    setLoading(false)
  }, [user, wedding?.id, customUrl])

  // Vytvoření nového svatebního webu
  const createWebsite = async (data: WebsiteFormData): Promise<WeddingWebsite> => {
    if (!user || !wedding) {
      throw new Error('Uživatel není přihlášen')
    }

    try {
      const now = Timestamp.now()
      
      const websiteData = {
        weddingId: wedding.id,
        userId: user.id,
        customUrl: data.customUrl,
        subdomain: `${data.customUrl}.svatbot.cz`,
        template: data.template,
        isPublished: false,
        isDraft: true,
        content: data.content,
        style: data.style || {
          primaryColor: '#D4AF37',
          secondaryColor: '#F7E7CE',
          accentColor: '#8B7355',
          fontFamily: 'Inter',
          fontHeading: 'Playfair Display',
          backgroundColor: '#FFFFFF',
        },
        settings: data.settings || {
          isPasswordProtected: false,
        },
        analytics: {
          views: 0,
          uniqueVisitors: 0,
        },
        createdAt: now,
        updatedAt: now,
      }

      // Použijeme customUrl jako document ID
      const docRef = doc(db, 'weddingWebsites', data.customUrl)

      // Vyčistíme data pro Firestore (převedeme Date na Timestamp)
      const cleanedData = cleanForFirestore(websiteData, 0, 'websiteData')

      // Debug logging
      console.log('Original data:', websiteData)
      console.log('Cleaned data:', cleanedData)
      console.log('🧹 cleanForFirestore completed')

      // Check document size
      const dataSize = JSON.stringify(cleanedData).length
      console.log('📊 Document size (bytes):', dataSize)
      console.log('📊 Document size (MB):', (dataSize / 1024 / 1024).toFixed(2))

      // Firestore limit is 1MB
      if (dataSize > 1048576) {
        console.error('🚨 Document too large for Firestore! Size:', (dataSize / 1024 / 1024).toFixed(2), 'MB (limit: 1MB)')

        // Try to identify large fields
        const checkFieldSizes = (obj: any, path = ''): void => {
          if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
            for (const [key, value] of Object.entries(obj)) {
              const fieldPath = path ? `${path}.${key}` : key
              const fieldSize = JSON.stringify(value).length
              if (fieldSize > 50000) { // 50KB threshold
                console.log(`📊 Large field: ${fieldPath} = ${(fieldSize / 1024).toFixed(1)}KB`)
              }
              if (value && typeof value === 'object') {
                checkFieldSizes(value, fieldPath)
              }
            }
          }
        }

        checkFieldSizes(cleanedData)
        throw new Error('Dokument je příliš velký pro uložení (limit 1MB). Zkuste odstranit některé obrázky.')
      }

      // Check for invalid field names
      const checkFieldNames = (obj: any, path = ''): string[] => {
        const invalidFields: string[] = []
        if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
          for (const [key, value] of Object.entries(obj)) {
            // Firestore field name rules: no dots, no __
            if (key.includes('.') || key.startsWith('__')) {
              invalidFields.push(`${path}.${key}`)
            }
            if (value && typeof value === 'object') {
              invalidFields.push(...checkFieldNames(value, `${path}.${key}`))
            }
          }
        }
        return invalidFields
      }

      const invalidFields = checkFieldNames(cleanedData)
      if (invalidFields.length > 0) {
        console.error('❌ Invalid field names found:', invalidFields)
      }

      await setDoc(docRef, cleanedData)

      const newWebsite: WeddingWebsite = {
        id: data.customUrl,
        ...websiteData,
        createdAt: now.toDate(),
        updatedAt: now.toDate(),
      } as WeddingWebsite

      console.log('✅ Website created successfully:', {
        id: newWebsite.id,
        isPublished: newWebsite.isPublished,
        isDraft: newWebsite.isDraft
      })

      setWebsite(newWebsite)
      return newWebsite
    } catch (err: any) {
      console.error('Error creating wedding website:', err)
      throw new Error('Chyba při vytváření svatebního webu')
    }
  }

  // Aktualizace svatebního webu
  const updateWebsite = async (updates: Partial<WeddingWebsite>): Promise<void> => {
    if (!website) {
      throw new Error('Svatební web neexistuje')
    }

    try {
      const docRef = doc(db, 'weddingWebsites', website.id)
      
      // Vyčistíme updates pro Firestore
      const cleanedUpdates = cleanForFirestore({
        ...updates,
        updatedAt: Timestamp.now(),
      }, 0, 'updates')

      await updateDoc(docRef, cleanedUpdates)
    } catch (err: any) {
      console.error('Error updating wedding website:', err)
      throw new Error('Chyba při aktualizaci svatebního webu')
    }
  }

  // Publikování webu
  const publishWebsite = async (): Promise<void> => {
    if (!website) {
      throw new Error('Svatební web neexistuje')
    }

    try {
      // 1. Nejdříve přidáme subdoménu do Vercel projektu
      if (website.customUrl) {
        console.log('🚀 Starting domain registration for:', website.customUrl)
        try {
          console.log('📡 Calling Vercel API endpoint: /api/vercel/add-domain')
          const domainResponse = await fetch('/api/vercel/add-domain', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              subdomain: website.customUrl,
            }),
          })
          console.log('📡 Vercel API response status:', domainResponse.status)

          const domainData = await domainResponse.json()
          console.log('📡 Vercel API response data:', domainData)

          if (!domainResponse.ok) {
            console.error('❌ Failed to add domain to Vercel:', domainData)
            // Pokračujeme i když se nepodaří přidat doménu - web bude dostupný na hlavní doméně
            console.warn('⚠️ Domain addition failed, but continuing with publication')
          } else {
            console.log('✅ Domain successfully added to Vercel:', domainData)
          }
        } catch (domainError) {
          console.error('Error adding domain to Vercel:', domainError)
          // Pokračujeme i když se nepodaří přidat doménu
          console.warn('Domain addition failed, but continuing with publication')
        }
      }

      // 2. Publikujeme web v databázi
      const docRef = doc(db, 'weddingWebsites', website.id)

      await updateDoc(docRef, {
        isPublished: true,
        isDraft: false,
        publishedAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      })
    } catch (err: any) {
      console.error('Error publishing wedding website:', err)
      throw new Error('Chyba při publikování svatebního webu')
    }
  }

  // Zrušení publikování
  const unpublishWebsite = async (): Promise<void> => {
    if (!website) {
      throw new Error('Svatební web neexistuje')
    }

    try {
      // 1. Nejdříve odebereme subdoménu z Vercel projektu
      if (website.customUrl) {
        try {
          const domainResponse = await fetch('/api/vercel/remove-domain', {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              subdomain: website.customUrl,
            }),
          })

          const domainData = await domainResponse.json()

          if (!domainResponse.ok) {
            console.error('Failed to remove domain from Vercel:', domainData)
            // Pokračujeme i když se nepodaří odebrat doménu
            console.warn('Domain removal failed, but continuing with unpublication')
          } else {
            console.log('Domain successfully removed from Vercel:', domainData)
          }
        } catch (domainError) {
          console.error('Error removing domain from Vercel:', domainError)
          // Pokračujeme i když se nepodaří odebrat doménu
          console.warn('Domain removal failed, but continuing with unpublication')
        }
      }

      // 2. Zrušíme publikování v databázi
      const docRef = doc(db, 'weddingWebsites', website.id)

      await updateDoc(docRef, {
        isPublished: false,
        isDraft: true,
        updatedAt: Timestamp.now(),
      })
    } catch (err: any) {
      console.error('Error unpublishing wedding website:', err)
      throw new Error('Chyba při zrušení publikování svatebního webu')
    }
  }

  // Smazání webu
  const deleteWebsite = async (): Promise<void> => {
    if (!website) {
      throw new Error('Svatební web neexistuje')
    }

    try {
      const docRef = doc(db, 'weddingWebsites', website.id)
      await deleteDoc(docRef)
      setWebsite(null)
    } catch (err: any) {
      console.error('Error deleting wedding website:', err)
      throw new Error('Chyba při mazání svatebního webu')
    }
  }

  // Kontrola dostupnosti custom URL
  const checkUrlAvailability = async (customUrl: string): Promise<boolean> => {
    try {
      // Pokusíme se načíst dokument s ID = customUrl
      // Pokud neexistuje, URL je dostupná
      const websiteRef = doc(db, 'weddingWebsites', customUrl)
      const websiteSnap = await getDoc(websiteRef)

      // URL je dostupná, pokud dokument neexistuje
      return !websiteSnap.exists()
    } catch (err: any) {
      console.error('Error checking URL availability:', err)
      // V případě chyby předpokládáme, že URL není dostupná (bezpečnější)
      return false
    }
  }

  return {
    website,
    loading,
    error,
    createWebsite,
    updateWebsite,
    publishWebsite,
    unpublishWebsite,
    deleteWebsite,
    checkUrlAvailability,
  }
}

