'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'
import { useWedding } from './useWedding'
import { db } from '@/lib/firebase'
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy } from 'firebase/firestore'

export interface WeddingDayTimelineItem {
  id: string
  weddingId: string
  time: string
  activity: string
  duration: string
  location?: string
  participants?: string[]
  notes?: string
  category: 'preparation' | 'ceremony' | 'photography' | 'reception' | 'party'
  order: number
  isCompleted: boolean
  source: 'manual' | 'ai' // Zdroj harmonogramu - manuální nebo AI
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

interface UseWeddingDayTimelineReturn {
  timeline: WeddingDayTimelineItem[]
  manualTimeline: WeddingDayTimelineItem[]
  aiTimeline: WeddingDayTimelineItem[]
  loading: boolean
  error: string | null
  createTimelineItem: (data: Omit<WeddingDayTimelineItem, 'id' | 'weddingId' | 'createdAt' | 'updatedAt' | 'createdBy'>) => Promise<WeddingDayTimelineItem>
  createBulkTimelineItems: (items: Omit<WeddingDayTimelineItem, 'id' | 'weddingId' | 'createdAt' | 'updatedAt' | 'createdBy'>[]) => Promise<void>
  updateTimelineItem: (itemId: string, updates: Partial<WeddingDayTimelineItem>) => Promise<void>
  deleteTimelineItem: (itemId: string) => Promise<void>
  deleteAllAITimeline: () => Promise<void>
  toggleComplete: (itemId: string) => Promise<void>
  reorderTimeline: (newOrder: WeddingDayTimelineItem[]) => Promise<void>
  stats: {
    total: number
    byCategory: Record<string, number>
    completed: number
    completionRate: number
  }
}

// Convert Firestore timestamp to Date
const convertFirestoreTimestamp = (timestamp: any): Date => {
  if (!timestamp) return new Date()
  if (timestamp.toDate) return timestamp.toDate()
  if (timestamp.seconds) return new Date(timestamp.seconds * 1000)
  return new Date(timestamp)
}

export function useWeddingDayTimeline(): UseWeddingDayTimelineReturn {
  const { user } = useAuth()
  const { wedding } = useWedding()
  const [timeline, setTimeline] = useState<WeddingDayTimelineItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load timeline items from Firestore
  useEffect(() => {
    if (!wedding) {
      setTimeline([])
      setLoading(false)
      return
    }

    try {
      const timelineQuery = query(
        collection(db, 'weddingDayTimeline'),
        where('weddingId', '==', wedding.id),
        orderBy('order', 'asc')
      )

      const unsubscribe = onSnapshot(
        timelineQuery,
        (snapshot) => {
          const items = snapshot.docs.map(doc => {
            const data = doc.data()
            return {
              id: doc.id,
              weddingId: data.weddingId,
              time: data.time,
              activity: data.activity,
              duration: data.duration,
              location: data.location,
              participants: data.participants || [],
              notes: data.notes,
              category: data.category,
              order: data.order,
              isCompleted: data.isCompleted || false,
              source: data.source || 'manual', // Default to manual for backward compatibility
              createdAt: convertFirestoreTimestamp(data.createdAt),
              updatedAt: convertFirestoreTimestamp(data.updatedAt),
              createdBy: data.createdBy
            } as WeddingDayTimelineItem
          })
          setTimeline(items)
          setLoading(false)
        },
        (err) => {
          console.error('Error loading wedding day timeline:', err)
          setError('Chyba při načítání harmonogramu')
          setLoading(false)
        }
      )

      return () => unsubscribe()
    } catch (err: any) {
      console.error('Error setting up wedding day timeline listener:', err)
      setError(err.message)
      setLoading(false)
    }
  }, [wedding?.id])

  // Create timeline item
  const createTimelineItem = useCallback(async (
    data: Omit<WeddingDayTimelineItem, 'id' | 'weddingId' | 'createdAt' | 'updatedAt' | 'createdBy'>
  ): Promise<WeddingDayTimelineItem> => {
    if (!wedding || !user) {
      throw new Error('Musíte být přihlášeni')
    }

    try {
      const newItem = {
        weddingId: wedding.id,
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: user.id
      }

      const docRef = await addDoc(collection(db, 'weddingDayTimeline'), newItem)
      console.log('✅ Created wedding day timeline item:', docRef.id)

      return {
        id: docRef.id,
        ...data,
        weddingId: wedding.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: user.id
      }
    } catch (err: any) {
      console.error('Error creating wedding day timeline item:', err)
      throw new Error('Chyba při vytváření položky')
    }
  }, [wedding, user])

  // Create bulk timeline items (for AI generation)
  const createBulkTimelineItems = useCallback(async (
    items: Omit<WeddingDayTimelineItem, 'id' | 'weddingId' | 'createdAt' | 'updatedAt' | 'createdBy'>[]
  ): Promise<void> => {
    if (!wedding || !user) {
      throw new Error('Musíte být přihlášeni')
    }

    try {
      const promises = items.map(data => {
        const newItem = {
          weddingId: wedding.id,
          ...data,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          createdBy: user.id
        }
        return addDoc(collection(db, 'weddingDayTimeline'), newItem)
      })

      await Promise.all(promises)
      console.log('✅ Created bulk wedding day timeline items:', items.length)
    } catch (err: any) {
      console.error('Error creating bulk wedding day timeline items:', err)
      throw new Error('Chyba při vytváření položek')
    }
  }, [wedding, user])

  // Update timeline item
  const updateTimelineItem = useCallback(async (
    itemId: string,
    updates: Partial<WeddingDayTimelineItem>
  ): Promise<void> => {
    if (!wedding) {
      throw new Error('Musíte být přihlášeni')
    }

    try {
      const itemRef = doc(db, 'weddingDayTimeline', itemId)
      await updateDoc(itemRef, {
        ...updates,
        updatedAt: serverTimestamp()
      })
      console.log('✅ Updated wedding day timeline item:', itemId)
    } catch (err: any) {
      console.error('Error updating wedding day timeline item:', err)
      throw new Error('Chyba při aktualizaci položky')
    }
  }, [wedding])

  // Delete timeline item
  const deleteTimelineItem = useCallback(async (itemId: string): Promise<void> => {
    if (!wedding) {
      throw new Error('Musíte být přihlášeni')
    }

    try {
      await deleteDoc(doc(db, 'weddingDayTimeline', itemId))
      console.log('✅ Deleted wedding day timeline item:', itemId)
    } catch (err: any) {
      console.error('Error deleting wedding day timeline item:', err)
      throw new Error('Chyba při mazání položky')
    }
  }, [wedding])

  // Delete all AI timeline items
  const deleteAllAITimeline = useCallback(async (): Promise<void> => {
    if (!wedding) {
      throw new Error('Musíte být přihlášeni')
    }

    try {
      const aiItems = timeline.filter(item => item.source === 'ai')
      const deletePromises = aiItems.map(item =>
        deleteDoc(doc(db, 'weddingDayTimeline', item.id))
      )
      await Promise.all(deletePromises)
      console.log('✅ Deleted all AI wedding day timeline items:', aiItems.length)
    } catch (err: any) {
      console.error('Error deleting AI wedding day timeline items:', err)
      throw new Error('Chyba při mazání AI harmonogramu')
    }
  }, [wedding, timeline])

  // Toggle complete status
  const toggleComplete = useCallback(async (itemId: string): Promise<void> => {
    const item = timeline.find(i => i.id === itemId)
    if (!item) return

    await updateTimelineItem(itemId, { isCompleted: !item.isCompleted })
  }, [timeline, updateTimelineItem])

  // Reorder timeline
  const reorderTimeline = useCallback(async (newOrder: WeddingDayTimelineItem[]): Promise<void> => {
    if (!wedding) {
      throw new Error('Musíte být přihlášeni')
    }

    try {
      const updates = newOrder.map((item, index) => 
        updateDoc(doc(db, 'weddingDayTimeline', item.id), {
          order: index,
          updatedAt: serverTimestamp()
        })
      )
      await Promise.all(updates)
      console.log('✅ Reordered wedding day timeline')
    } catch (err: any) {
      console.error('Error reordering wedding day timeline:', err)
      throw new Error('Chyba při změně pořadí')
    }
  }, [wedding])

  // Split timeline by source
  const manualTimeline = timeline.filter(item => item.source === 'manual')
  const aiTimeline = timeline.filter(item => item.source === 'ai')

  // Calculate stats
  const stats = {
    total: timeline.length,
    byCategory: timeline.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1
      return acc
    }, {} as Record<string, number>),
    completed: timeline.filter(item => item.isCompleted).length,
    completionRate: timeline.length > 0
      ? Math.round((timeline.filter(item => item.isCompleted).length / timeline.length) * 100)
      : 0
  }

  return {
    timeline,
    manualTimeline,
    aiTimeline,
    loading,
    error,
    createTimelineItem,
    createBulkTimelineItems,
    updateTimelineItem,
    deleteTimelineItem,
    deleteAllAITimeline,
    toggleComplete,
    reorderTimeline,
    stats
  }
}

