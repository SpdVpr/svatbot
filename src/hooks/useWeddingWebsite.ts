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
const cleanForFirestore = (obj: any, depth = 0): any => {
  // Prevent infinite recursion
  if (depth > 10) {
    console.warn('Max depth reached in cleanForFirestore, returning null')
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
      console.warn('Invalid date found, converting to null:', obj)
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
    return undefined
  }

  // File objects - skip them
  if (obj instanceof File || obj instanceof Blob) {
    return undefined
  }

  // DOM elements - skip them
  if (typeof HTMLElement !== 'undefined' && obj instanceof HTMLElement) {
    return undefined
  }

  // React refs - skip them
  if (obj && typeof obj === 'object' && 'current' in obj && Object.keys(obj).length === 1) {
    return undefined
  }

  // Arrays
  if (Array.isArray(obj)) {
    const cleaned = obj.map(item => cleanForFirestore(item, depth + 1)).filter(item => item !== undefined)
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

        const cleanedValue = cleanForFirestore(value, depth + 1)
        if (cleanedValue !== undefined) {
          cleaned[key] = cleanedValue
        }
      }
      return cleaned
    } else {
      // For class instances, try JSON serialization as last resort
      try {
        const serialized = JSON.parse(JSON.stringify(obj))
        return cleanForFirestore(serialized, depth + 1)
      } catch (error) {
        console.warn('Could not serialize object for Firestore:', obj, error)
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
      // Vyčistíme data pro Firestore (převedeme Date na Timestamp)
      const cleanedData = cleanForFirestore(websiteData)

      // Debug logging
      console.log('Original data:', websiteData)
      console.log('Cleaned data:', cleanedData)

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
      })

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

