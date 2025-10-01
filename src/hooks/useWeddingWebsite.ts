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

  // Načtení svatebního webu podle custom URL (pro veřejný přístup)
  useEffect(() => {
    if (!customUrl) {
      setLoading(false)
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

      // Debug document ID
      console.log('📄 Document ID:', data.customUrl)
      console.log('📄 Document ID length:', data.customUrl.length)
      console.log('📄 Document ID valid chars:', /^[a-zA-Z0-9_-]+$/.test(data.customUrl))

      // Vyčistíme data pro Firestore (převedeme Date na Timestamp)
      console.log('🧹 Starting cleanForFirestore for website data...')
      const cleanedData = cleanForFirestore(websiteData, 0, 'websiteData')

      // Debug logging
      console.log('Original data:', websiteData)
      console.log('Cleaned data:', cleanedData)
      console.log('🧹 cleanForFirestore completed')

      // Check document size
      const dataSize = JSON.stringify(cleanedData).length
      console.log('📊 Document size (bytes):', dataSize)
      console.log('📊 Document size (MB):', (dataSize / 1024 / 1024).toFixed(2))

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

