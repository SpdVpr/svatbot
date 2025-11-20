'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { doc, getDoc, setDoc, updateDoc, collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { useAuth } from './useAuth'
import { useWedding } from './useWedding'
import { useDemoLock } from './useDemoLock'

export interface Song {
  id: string
  title: string
  artist: string
  spotifyUrl?: string
  spotifyTrackId?: string
  albumCover?: string
  previewUrl?: string
  duration?: number
  notes?: string
}

export interface MusicCategory {
  id: string
  name: string
  description: string
  icon: string
  songs: Song[]
  required?: boolean
  hidden?: boolean
}

export interface MusicVendor {
  id: string
  name: string
  contact: string
  email: string
  type?: string // např. "DJ", "Smyčcový kvartet", "Živá kapela"
  vendorId?: string // Reference to vendor from /vendors module
}

export interface MusicData {
  vendors: MusicVendor[]
  categories: MusicCategory[]
  updatedAt: Date
}

const DEFAULT_CATEGORIES: MusicCategory[] = [
  {
    id: 'groom-entrance',
    name: 'Nástup ženicha',
    description: 'Hudba při příchodu ženicha k oltáři',
    icon: '🤵',
    songs: []
  },
  {
    id: 'bridesmaids-entrance',
    name: 'Nástup svědků/družiček',
    description: 'Hudba při příchodu svědků a družiček',
    icon: '🤍',
    songs: []
  },
  {
    id: 'bride-entrance',
    name: 'Nástup nevěsty',
    description: 'Nejdůležitější okamžik - příchod nevěsty',
    icon: '👰‍♀️',
    songs: []
  },
  {
    id: 'ring-exchange',
    name: 'Nasazování prstýnků',
    description: 'Hudba při výměně prstenů',
    icon: '💍',
    songs: []
  },
  {
    id: 'signing',
    name: 'Podpis oddacího listu',
    description: 'Hudba během podpisu dokumentů',
    icon: '✍️',
    songs: []
  },
  {
    id: 'congratulations',
    name: 'Gratulace',
    description: 'Hudba při gratulacích hostů',
    icon: '🎉',
    songs: []
  },
  {
    id: 'guard-of-honor',
    name: 'Špalír',
    description: 'Hudba při odchodu novomanželů špalírem',
    icon: '🎊',
    songs: []
  },
  {
    id: 'first-dance',
    name: 'První tanec',
    description: 'Váš první tanec jako manželé',
    icon: '💃',
    songs: []
  },
  {
    id: 'parent-dance',
    name: 'Tanec s rodiči',
    description: 'Tanec nevěsty s otcem a ženicha s matkou',
    icon: '👨‍👩‍👧',
    songs: []
  },
  {
    id: 'sparkler-dance',
    name: 'Prskavkový tanec',
    description: 'Tanec s prskavkami',
    icon: '✨',
    songs: []
  },
  {
    id: 'bouquet-toss',
    name: 'Házení kyticí/vyplétání kytice',
    description: 'Hudba při házení kyticí nebo vyplétání kytice',
    icon: '💐',
    songs: []
  },
  {
    id: 'cake-cutting',
    name: 'Krájení dortu',
    description: 'Hudba při krájení svatebního dortu',
    icon: '🎂',
    songs: []
  },
  {
    id: 'party-must-have',
    name: 'Party písně',
    description: 'Písně, které rozproudí zábavu',
    icon: '🎵',
    songs: []
  },
  {
    id: 'party-favorites',
    name: 'Oblíbené písně',
    description: 'Vaše oblíbené písně na večírek',
    icon: '🎶',
    songs: []
  },
  {
    id: 'slow-songs',
    name: 'Pomalé písně',
    description: 'Romantické písně pro pomalé tance',
    icon: '💕',
    songs: []
  },
  {
    id: 'do-not-play',
    name: 'Nehrát!',
    description: 'Písně, které určitě nechcete slyšet',
    icon: '🚫',
    songs: []
  }
]

export function useMusic() {
  const { user } = useAuth()
  const { wedding } = useWedding()
  const { withDemoCheck } = useDemoLock()
  const [vendors, setVendors] = useState<MusicVendor[]>([])
  const [categories, setCategories] = useState<MusicCategory[]>(DEFAULT_CATEGORIES)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [musicId, setMusicId] = useState<string | null>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastLocalChangeRef = useRef<number>(0) // Timestamp of last local change
  const lastSavedTimestampRef = useRef<number>(0) // Timestamp of last successful save
  const isProcessingFirebaseUpdateRef = useRef<boolean>(false) // Flag to prevent auto-save during Firebase update

  // Migrate old categories to new format
  const migrateCategories = (oldCategories: MusicCategory[]): MusicCategory[] => {
    return oldCategories.map(category => {
      // Remove required property from all categories
      const { required, ...categoryWithoutRequired } = category

      // Update bridesmaids-entrance
      if (category.id === 'bridesmaids-entrance') {
        return {
          ...categoryWithoutRequired,
          name: 'Nástup svědků/družiček',
          description: 'Hudba při příchodu svědků a družiček',
          icon: '🤍'
        }
      }
      // Update bride-entrance
      if (category.id === 'bride-entrance') {
        return {
          ...categoryWithoutRequired,
          name: 'Nástup nevěsty',
          icon: '👰‍♀️'
        }
      }
      // Update congratulations
      if (category.id === 'congratulations') {
        return {
          ...categoryWithoutRequired,
          name: 'Gratulace'
        }
      }
      // Update guard-of-honor (Šplalíř -> Špalír)
      if (category.id === 'guard-of-honor') {
        return {
          ...categoryWithoutRequired,
          name: 'Špalír'
        }
      }
      // Update party-must-have
      if (category.id === 'party-must-have') {
        return {
          ...categoryWithoutRequired,
          name: 'Party písně'
        }
      }
      return categoryWithoutRequired
    })
  }

  // Add ring-exchange category if missing
  const ensureRingExchangeCategory = (categories: MusicCategory[]): MusicCategory[] => {
    const hasRingExchange = categories.some(cat => cat.id === 'ring-exchange')
    if (!hasRingExchange) {
      // Find bride-entrance index to insert after it
      const brideEntranceIndex = categories.findIndex(cat => cat.id === 'bride-entrance')
      const newCategory: MusicCategory = {
        id: 'ring-exchange',
        name: 'Nasazování prstýnků',
        description: 'Hudba při výměně prstenů',
        icon: '💍',
        songs: []
      }

      if (brideEntranceIndex >= 0) {
        // Insert after bride-entrance
        const newCategories = [...categories]
        newCategories.splice(brideEntranceIndex + 1, 0, newCategory)
        return newCategories
      } else {
        // Add at the end if bride-entrance not found
        return [...categories, newCategory]
      }
    }
    return categories
  }

  // Add sparkler-dance category if missing
  const ensureSparklerDanceCategory = (categories: MusicCategory[]): MusicCategory[] => {
    const hasSparklerDance = categories.some(cat => cat.id === 'sparkler-dance')
    if (!hasSparklerDance) {
      // Find parent-dance index to insert after it
      const parentDanceIndex = categories.findIndex(cat => cat.id === 'parent-dance')
      const newCategory: MusicCategory = {
        id: 'sparkler-dance',
        name: 'Prskavkový tanec',
        description: 'Tanec s prskavkami',
        icon: '✨',
        songs: []
      }

      if (parentDanceIndex >= 0) {
        // Insert after parent-dance
        const newCategories = [...categories]
        newCategories.splice(parentDanceIndex + 1, 0, newCategory)
        return newCategories
      } else {
        // Add at the end if parent-dance not found
        return [...categories, newCategory]
      }
    }
    return categories
  }

  // Add bouquet-toss category if missing
  const ensureBouquetTossCategory = (categories: MusicCategory[]): MusicCategory[] => {
    const hasBouquetToss = categories.some(cat => cat.id === 'bouquet-toss')
    if (!hasBouquetToss) {
      // Find sparkler-dance index to insert after it
      const sparklerDanceIndex = categories.findIndex(cat => cat.id === 'sparkler-dance')
      const newCategory: MusicCategory = {
        id: 'bouquet-toss',
        name: 'Házení kyticí/vyplétání kytice',
        description: 'Hudba při házení kyticí nebo vyplétání kytice',
        icon: '💐',
        songs: []
      }

      if (sparklerDanceIndex >= 0) {
        // Insert after sparkler-dance
        const newCategories = [...categories]
        newCategories.splice(sparklerDanceIndex + 1, 0, newCategory)
        return newCategories
      } else {
        // Add at the end if sparkler-dance not found
        return [...categories, newCategory]
      }
    }
    return categories
  }

  // Load music data from Firestore with real-time updates
  useEffect(() => {
    if (!wedding?.id) {
      setLoading(false)
      return
    }

    const musicQuery = query(
      collection(db, 'music'),
      where('weddingId', '==', wedding.id)
    )

    const unsubscribe = onSnapshot(musicQuery, (snapshot) => {
      // Skip updates while saving to prevent overwriting local changes
      if (saving) {
        console.log('⏭️ Skipping Firebase update - currently saving')
        return
      }

      // Skip updates for 5 seconds after local change to prevent race conditions
      const timeSinceLastChange = Date.now() - lastLocalChangeRef.current
      if (timeSinceLastChange < 5000 && lastLocalChangeRef.current > 0) {
        console.log(`⏭️ Skipping Firebase update - ${timeSinceLastChange}ms since last change (waiting 5000ms)`)
        return
      }

      if (!snapshot.empty) {
        const musicDoc = snapshot.docs[0]
        const data = musicDoc.data()

        // Check if this update is older than our last save - if so, ignore it
        let firebaseTimestamp = 0
        if (data.updatedAt) {
          // Handle both Firestore Timestamp and Date objects
          if (typeof data.updatedAt.toMillis === 'function') {
            firebaseTimestamp = data.updatedAt.toMillis()
          } else if (typeof data.updatedAt.getTime === 'function') {
            firebaseTimestamp = data.updatedAt.getTime()
          } else if (data.updatedAt.seconds) {
            firebaseTimestamp = data.updatedAt.seconds * 1000
          }
        }

        console.log(`📥 Firebase snapshot - Firebase timestamp: ${firebaseTimestamp}, Last saved: ${lastSavedTimestampRef.current}`)

        if (firebaseTimestamp > 0 && lastSavedTimestampRef.current > 0 && firebaseTimestamp < lastSavedTimestampRef.current) {
          console.log(`⏭️ Skipping Firebase update - older than last save`)
          return
        }

        console.log(`✅ Processing Firebase snapshot update`)

        // Set flag to prevent auto-save from triggering
        isProcessingFirebaseUpdateRef.current = true

        setMusicId(musicDoc.id)

        // Backward compatibility: convert old vendor format to vendors array
        if (data.vendor && !data.vendors) {
          setVendors([{
            id: 'vendor-1',
            name: data.vendor.name || '',
            contact: data.vendor.contact || '',
            email: data.vendor.email || '',
            type: 'DJ'
          }])
        } else {
          setVendors(data.vendors || [])
        }

        // Migrate old categories and ensure ring-exchange, sparkler-dance, and bouquet-toss exist
        let loadedCategories = data.categories || DEFAULT_CATEGORIES
        loadedCategories = migrateCategories(loadedCategories)
        loadedCategories = ensureRingExchangeCategory(loadedCategories)
        loadedCategories = ensureSparklerDanceCategory(loadedCategories)
        loadedCategories = ensureBouquetTossCategory(loadedCategories)
        setCategories(loadedCategories)

        // Reset flag after state updates
        setTimeout(() => {
          isProcessingFirebaseUpdateRef.current = false
        }, 100)
      } else {
        setMusicId(null)
        setVendors([])
        setCategories(DEFAULT_CATEGORIES)
      }
      setLoading(false)
    }, (error) => {
      console.error('Error loading music data:', error)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [wedding?.id, saving])

  // Clean data - convert undefined to null (Firebase doesn't support undefined)
  const cleanData = (obj: any): any => {
    if (obj === undefined) return null
    if (obj === null) return null
    if (Array.isArray(obj)) return obj.map(cleanData)
    if (typeof obj === 'object') {
      const cleaned: any = {}
      for (const key in obj) {
        cleaned[key] = cleanData(obj[key])
      }
      return cleaned
    }
    return obj
  }

  // Save music data to Firestore
  const saveMusicData = useCallback(async () => {
    if (!wedding?.id || !user?.id) return

    setSaving(true)
    try {
      // Clean data to remove undefined values
      const cleanedData = {
        weddingId: wedding.id,
        userId: user.id,
        vendors: cleanData(vendors),
        categories: cleanData(categories),
        updatedAt: new Date()
      }

      if (musicId) {
        // Update existing document
        const musicRef = doc(db, 'music', musicId)
        await setDoc(musicRef, cleanedData, { merge: true })
      } else {
        // Create new document
        const musicRef = doc(collection(db, 'music'))
        await setDoc(musicRef, cleanedData)
        setMusicId(musicRef.id)
      }
    } catch (error) {
      console.error('Error saving music data:', error)
      throw error
    } finally {
      setSaving(false)
    }
  }, [wedding?.id, user?.id, vendors, categories, musicId])

  // Auto-save when data changes (debounced)
  useEffect(() => {
    if (!wedding?.id || !user?.id || loading) {
      return
    }

    // Skip auto-save if we're processing a Firebase update
    if (isProcessingFirebaseUpdateRef.current) {
      console.log('⏭️ Skipping auto-save - processing Firebase update')
      return
    }

    // Clear previous timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(async () => {
      console.log('💾 Auto-save triggered')
      setSaving(true)
      try {
        // Clean data to remove undefined values
        const cleanData = (obj: any): any => {
          if (obj === undefined) return null
          if (obj === null) return null
          if (Array.isArray(obj)) return obj.map(cleanData)
          if (typeof obj === 'object') {
            const cleaned: any = {}
            for (const key in obj) {
              cleaned[key] = cleanData(obj[key])
            }
            return cleaned
          }
          return obj
        }

        const saveTimestamp = Date.now()
        const cleanedData = {
          weddingId: wedding.id,
          userId: user.id,
          vendors: cleanData(vendors),
          categories: cleanData(categories),
          updatedAt: new Date()
        }

        if (musicId) {
          // Update existing document
          const musicRef = doc(db, 'music', musicId)
          await setDoc(musicRef, cleanedData, { merge: true })
        } else {
          // Create new document
          const musicRef = doc(collection(db, 'music'))
          await setDoc(musicRef, cleanedData)
          setMusicId(musicRef.id)
        }

        // Store the timestamp of this successful save
        lastSavedTimestampRef.current = saveTimestamp
        console.log(`✅ Auto-save completed successfully (timestamp: ${saveTimestamp})`)

        // Reset local change timestamp after successful save
        // Wait 6 seconds to ensure Firebase snapshot doesn't overwrite our changes
        setTimeout(() => {
          console.log('🔄 Resetting lastLocalChangeRef to 0')
          lastLocalChangeRef.current = 0
        }, 6000)
      } catch (error) {
        console.error('❌ Error saving music data:', error)
      } finally {
        setSaving(false)
      }
    }, 2000) // Auto-save after 2 seconds of inactivity

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [vendors, categories, wedding, user, loading, musicId])

  const addVendor = (vendor: Omit<MusicVendor, 'id'>) => {
    lastLocalChangeRef.current = Date.now()
    const newVendor: MusicVendor = {
      ...vendor,
      id: `vendor-${Date.now()}`
    }
    setVendors(prev => [...prev, newVendor])
  }

  const updateVendor = (vendorId: string, updates: Partial<MusicVendor>) => {
    lastLocalChangeRef.current = Date.now()
    setVendors(prev => prev.map(v => v.id === vendorId ? { ...v, ...updates } : v))
  }

  const removeVendor = (vendorId: string) => {
    lastLocalChangeRef.current = Date.now()
    setVendors(prev => prev.filter(v => v.id !== vendorId))
  }

  const addSong = (categoryId: string, song: Song) => {
    withDemoCheck(async () => {
      const timestamp = Date.now()
      lastLocalChangeRef.current = timestamp
      console.log(`🎵 addSong called - setting lastLocalChangeRef to ${timestamp}`)
      setCategories(prev => prev.map(cat => {
        if (cat.id === categoryId) {
          return {
            ...cat,
            songs: [...cat.songs, song]
          }
        }
        return cat
      }))
    })
  }

  const removeSong = (categoryId: string, songId: string) => {
    withDemoCheck(async () => {
      lastLocalChangeRef.current = Date.now()
      setCategories(prev => prev.map(cat => {
        if (cat.id === categoryId) {
          return {
            ...cat,
            songs: cat.songs.filter(s => s.id !== songId)
          }
        }
        return cat
      }))
    })
  }

  const updateSong = (categoryId: string, songId: string, updates: Partial<Song>) => {
    lastLocalChangeRef.current = Date.now()
    setCategories(prev => prev.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          songs: cat.songs.map(s => s.id === songId ? { ...s, ...updates } : s)
        }
      }
      return cat
    }))
  }

  const toggleCategoryVisibility = (categoryId: string) => {
    lastLocalChangeRef.current = Date.now()
    setCategories(prev => prev.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          hidden: !cat.hidden
        }
      }
      return cat
    }))
  }

  const createShareLink = async (expiresInDays: number = 30): Promise<string> => {
    if (!wedding?.id) {
      throw new Error('Svatba nebyla nalezena. Zkuste to prosím znovu.')
    }

    // Get current user from Firebase Auth directly
    const { auth } = await import('@/config/firebase')
    const currentUser = auth.currentUser

    if (!currentUser) {
      throw new Error('Nejste přihlášeni. Zkuste se prosím odhlásit a znovu přihlásit.')
    }

    try {
      // Generate unique share ID
      const shareId = `playlist_${wedding.id}_${Date.now()}`

      // Calculate expiration date
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + expiresInDays)

      // Create shared playlist document
      const shareDocRef = doc(db, 'sharedPlaylists', shareId)
      await setDoc(shareDocRef, {
        weddingId: wedding.id,
        brideName: wedding.brideName || null,
        groomName: wedding.groomName || null,
        weddingDate: wedding.weddingDate || null,
        categories: categories.filter(cat => cat.songs.length > 0), // Only categories with songs
        vendors: vendors,
        createdAt: new Date(),
        expiresAt: expiresAt,
        createdBy: currentUser.uid
      })

      // Generate share URL
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://svatbot.cz'
      const shareUrl = `${baseUrl}/share/playlist/${shareId}`

      console.log('✅ Share link created:', shareUrl)
      return shareUrl
    } catch (err) {
      console.error('Error creating share link:', err)
      throw new Error('Chyba při vytváření sdíleného odkazu')
    }
  }

  const totalSongs = categories.reduce((sum, cat) => sum + cat.songs.length, 0)
  const requiredCategories = categories.filter(c => c.required)
  const completedRequired = requiredCategories.filter(c => c.songs.length > 0).length

  return {
    vendors,
    categories,
    loading,
    saving,
    addVendor,
    updateVendor,
    removeVendor,
    addSong,
    removeSong,
    updateSong,
    toggleCategoryVisibility,
    saveMusicData,
    createShareLink,
    totalSongs,
    requiredCategories,
    completedRequired
  }
}

