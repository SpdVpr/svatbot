'use client'

import { useState, useEffect } from 'react'
import { db } from '@/lib/firebase'
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  onSnapshot
} from 'firebase/firestore'
import type { WeddingWebsite, WebsiteFormData } from '@/types/wedding-website'
import { useAuth } from '@/contexts/AuthContext'
import { useWedding } from '@/contexts/WeddingContext'

export function useWeddingWebsite(customUrl?: string) {
  const { user } = useAuth()
  const { wedding } = useWedding()
  
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

        const websitesRef = collection(db, 'weddingWebsites')
        const q = query(
          websitesRef,
          where('customUrl', '==', customUrl),
          where('isPublished', '==', true)
        )
        
        const snapshot = await getDocs(q)
        
        if (snapshot.empty) {
          setWebsite(null)
          setError('Svatební web nenalezen')
          return
        }

        const doc = snapshot.docs[0]
        const data = doc.data()
        
        setWebsite({
          id: doc.id,
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

    const websitesRef = collection(db, 'weddingWebsites')
    const q = query(websitesRef, where('weddingId', '==', wedding.id))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          setWebsite(null)
          setLoading(false)
          return
        }

        const doc = snapshot.docs[0]
        const data = doc.data()
        
        setWebsite({
          id: doc.id,
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
        setLoading(false)
      },
      (err) => {
        console.error('Error loading wedding website:', err)
        setError('Chyba při načítání svatebního webu')
        setLoading(false)
      }
    )

    return () => unsubscribe()
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

      const docRef = await addDoc(collection(db, 'weddingWebsites'), websiteData)

      const newWebsite: WeddingWebsite = {
        id: docRef.id,
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
      
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now(),
      })
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
      const websitesRef = collection(db, 'weddingWebsites')
      const q = query(websitesRef, where('customUrl', '==', customUrl))
      const snapshot = await getDocs(q)
      
      return snapshot.empty
    } catch (err: any) {
      console.error('Error checking URL availability:', err)
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

