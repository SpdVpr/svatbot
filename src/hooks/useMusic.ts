'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { doc, getDoc, setDoc, updateDoc, collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { useAuth } from './useAuth'
import { useWedding } from './useWedding'

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
}

export interface MusicData {
  vendor: {
    name: string
    contact: string
    email: string
  }
  categories: MusicCategory[]
  updatedAt: Date
}

const DEFAULT_CATEGORIES: MusicCategory[] = [
  {
    id: 'groom-entrance',
    name: 'Nástup ženicha',
    description: 'Hudba při příchodu ženicha k oltáři',
    icon: '🤵',
    songs: [],
    required: true
  },
  {
    id: 'bridesmaids-entrance',
    name: 'Nástup družiček',
    description: 'Hudba při příchodu družiček',
    icon: '👰‍♀️',
    songs: [],
    required: true
  },
  {
    id: 'bride-entrance',
    name: 'Nástup nevěsty',
    description: 'Nejdůležitější okamžik - příchod nevěsty',
    icon: '💍',
    songs: [],
    required: true
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
    name: 'Písně pro gratulace',
    description: 'Hudba při gratulacích hostů',
    icon: '🎉',
    songs: []
  },
  {
    id: 'guard-of-honor',
    name: 'Šplalíř',
    description: 'Hudba při odchodu novomanželů špalírem',
    icon: '🎊',
    songs: []
  },
  {
    id: 'first-dance',
    name: 'První tanec',
    description: 'Váš první tanec jako manželé',
    icon: '💃',
    songs: [],
    required: true
  },
  {
    id: 'parent-dance',
    name: 'Tanec s rodiči',
    description: 'Tanec nevěsty s otcem a ženicha s matkou',
    icon: '👨‍👩‍👧',
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
    name: 'Párty - nesmí chybět',
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
  const [vendor, setVendor] = useState({
    name: '',
    contact: '',
    email: ''
  })
  const [categories, setCategories] = useState<MusicCategory[]>(DEFAULT_CATEGORIES)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [musicId, setMusicId] = useState<string | null>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Debug: Log when wedding changes
  useEffect(() => {
    console.log('🎵 Wedding changed in useMusic:', {
      hasWedding: !!wedding?.id,
      weddingId: wedding?.id
    })
  }, [wedding?.id])

  // Load music data from Firestore with real-time updates
  useEffect(() => {
    console.log('🎵 useMusic load effect:', {
      hasWedding: !!wedding?.id,
      weddingId: wedding?.id,
      hasUser: !!user?.id
    })

    if (!wedding?.id) {
      console.log('🎵 No wedding yet, skipping music load')
      setLoading(false)
      return
    }

    console.log('🎵 Loading music data for wedding:', wedding.id)

    const musicQuery = query(
      collection(db, 'music'),
      where('weddingId', '==', wedding.id)
    )

    const unsubscribe = onSnapshot(musicQuery, (snapshot) => {
      if (!snapshot.empty) {
        const musicDoc = snapshot.docs[0]
        const data = musicDoc.data()
        setMusicId(musicDoc.id)
        setVendor(data.vendor || { name: '', contact: '', email: '' })
        setCategories(data.categories || DEFAULT_CATEGORIES)
        console.log('🎵 Loaded music data from Firestore:', data)
      } else {
        console.log('🎵 No music data found, using defaults')
        setMusicId(null)
        setVendor({ name: '', contact: '', email: '' })
        setCategories(DEFAULT_CATEGORIES)
      }
      setLoading(false)
    }, (error) => {
      console.error('❌ Error loading music data:', error)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [wedding?.id])

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
        vendor: cleanData(vendor),
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

      console.log('✅ Music data saved to Firestore')
    } catch (error) {
      console.error('Error saving music data:', error)
      throw error
    } finally {
      setSaving(false)
    }
  }, [wedding?.id, user?.id, vendor, categories, musicId])

  // Auto-save when data changes (debounced)
  useEffect(() => {
    console.log('🎵 Auto-save effect triggered:', {
      hasWedding: !!wedding?.id,
      weddingId: wedding?.id,
      hasUser: !!user?.id,
      userId: user?.id,
      loading,
      categoriesLength: categories.length,
      vendorName: vendor.name,
      musicId
    })

    if (!wedding?.id || !user?.id || loading) {
      console.log('🎵 Auto-save skipped - conditions not met:', {
        hasWedding: !!wedding?.id,
        hasUser: !!user?.id,
        loading
      })
      return
    }

    // Clear previous timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    console.log('🎵 Setting up auto-save timeout...')
    saveTimeoutRef.current = setTimeout(async () => {
      console.log('🎵 Auto-saving music data...', {
        weddingId: wedding.id,
        userId: user.id,
        musicId
      })

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

        const cleanedData = {
          weddingId: wedding.id,
          userId: user.id,
          vendor: cleanData(vendor),
          categories: cleanData(categories),
          updatedAt: new Date()
        }

        console.log('🎵 Saving to Firestore:', { musicId, weddingId: wedding.id })

        if (musicId) {
          // Update existing document
          const musicRef = doc(db, 'music', musicId)
          await setDoc(musicRef, cleanedData, { merge: true })
          console.log('✅ Updated existing music document:', musicId)
        } else {
          // Create new document
          const musicRef = doc(collection(db, 'music'))
          await setDoc(musicRef, cleanedData)
          setMusicId(musicRef.id)
          console.log('✅ Created new music document:', musicRef.id)
        }

        console.log('✅ Music data saved to Firestore')
      } catch (error) {
        console.error('❌ Error saving music data:', error)
      } finally {
        setSaving(false)
      }
    }, 2000) // Auto-save after 2 seconds of inactivity

    return () => {
      if (saveTimeoutRef.current) {
        console.log('🎵 Clearing auto-save timeout')
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [vendor, categories, wedding, user, loading, musicId])

  const updateVendor = (newVendor: typeof vendor) => {
    setVendor(newVendor)
  }

  const addSong = (categoryId: string, song: Song) => {
    setCategories(prev => prev.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          songs: [...cat.songs, song]
        }
      }
      return cat
    }))
  }

  const removeSong = (categoryId: string, songId: string) => {
    setCategories(prev => prev.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          songs: cat.songs.filter(s => s.id !== songId)
        }
      }
      return cat
    }))
  }

  const updateSong = (categoryId: string, songId: string, updates: Partial<Song>) => {
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

  const totalSongs = categories.reduce((sum, cat) => sum + cat.songs.length, 0)
  const requiredCategories = categories.filter(c => c.required)
  const completedRequired = requiredCategories.filter(c => c.songs.length > 0).length

  return {
    vendor,
    categories,
    loading,
    saving,
    updateVendor,
    addSong,
    removeSong,
    updateSong,
    saveMusicData,
    totalSongs,
    requiredCategories,
    completedRequired
  }
}

