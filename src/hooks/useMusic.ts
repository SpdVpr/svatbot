'use client'

import { useState, useEffect } from 'react'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { useAuth } from './useAuth'

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
  const [vendor, setVendor] = useState({
    name: '',
    contact: '',
    email: ''
  })
  const [categories, setCategories] = useState<MusicCategory[]>(DEFAULT_CATEGORIES)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Load music data from Firebase
  useEffect(() => {
    if (!user?.id) {
      setLoading(false)
      return
    }

    const loadMusicData = async () => {
      try {
        const musicRef = doc(db, 'users', user.id, 'wedding', 'music')
        const musicSnap = await getDoc(musicRef)

        if (musicSnap.exists()) {
          const data = musicSnap.data() as MusicData
          setVendor(data.vendor || { name: '', contact: '', email: '' })
          setCategories(data.categories || DEFAULT_CATEGORIES)
        }
      } catch (error) {
        console.error('Error loading music data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadMusicData()
  }, [user?.id])

  // Clean data - remove undefined values (Firebase doesn't support them)
  const cleanData = (obj: any): any => {
    if (obj === null || obj === undefined) return null
    if (Array.isArray(obj)) return obj.map(cleanData)
    if (typeof obj === 'object') {
      const cleaned: any = {}
      for (const key in obj) {
        const value = obj[key]
        if (value !== undefined) {
          cleaned[key] = cleanData(value)
        }
      }
      return cleaned
    }
    return obj
  }

  // Save music data to Firebase
  const saveMusicData = async () => {
    if (!user?.id) return

    setSaving(true)
    try {
      const musicRef = doc(db, 'users', user.id, 'wedding', 'music')

      // Clean data to remove undefined values
      const cleanedData = {
        vendor: cleanData(vendor),
        categories: cleanData(categories),
        updatedAt: new Date()
      }

      await setDoc(musicRef, cleanedData, { merge: true })
      console.log('✅ Music data saved to Firebase')
    } catch (error) {
      console.error('Error saving music data:', error)
      throw error
    } finally {
      setSaving(false)
    }
  }

  // Auto-save when data changes (debounced)
  useEffect(() => {
    if (!user?.id || loading) return

    const timeoutId = setTimeout(() => {
      saveMusicData()
    }, 2000) // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(timeoutId)
  }, [vendor, categories, user?.id, loading])

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

