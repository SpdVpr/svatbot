'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'
import { useWedding } from './useWedding'

export interface AITimelineItem {
  id: string
  weddingId: string
  time: string
  activity: string
  duration: string
  location?: string
  participants?: string[]
  notes?: string
  category: 'preparation' | 'ceremony' | 'reception' | 'party' | 'other'
  order: number
  isCompleted: boolean
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

export interface AITimelineSettings {
  startTime: string
  ceremonyTime: string
  receptionTime: string
  endTime: string
  includePreparation: boolean
  includeAfterParty: boolean
  bufferTime: number // minutes
  autoAdjust: boolean
}

interface UseAITimelineReturn {
  timeline: AITimelineItem[]
  settings: AITimelineSettings
  loading: boolean
  error: string | null
  createTimelineItem: (data: Omit<AITimelineItem, 'id' | 'weddingId' | 'createdAt' | 'updatedAt' | 'createdBy'>) => Promise<AITimelineItem>
  updateTimelineItem: (itemId: string, updates: Partial<AITimelineItem>) => Promise<void>
  deleteTimelineItem: (itemId: string) => Promise<void>
  reorderTimeline: (newOrder: AITimelineItem[]) => Promise<void>
  updateSettings: (newSettings: Partial<AITimelineSettings>) => Promise<void>
  generateFromAI: (aiTimeline: any[]) => Promise<void>
  exportTimeline: () => string
  clearError: () => void
}

const DEFAULT_SETTINGS: AITimelineSettings = {
  startTime: '09:00',
  ceremonyTime: '15:00',
  receptionTime: '18:00',
  endTime: '02:00',
  includePreparation: true,
  includeAfterParty: true,
  bufferTime: 15,
  autoAdjust: true
}

export function useAITimeline(): UseAITimelineReturn {
  const { user } = useAuth()
  const { wedding } = useWedding()
  const [timeline, setTimeline] = useState<AITimelineItem[]>([])
  const [settings, setSettings] = useState<AITimelineSettings>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load timeline items when wedding changes
  useEffect(() => {
    if (!wedding) {
      setTimeline([])
      return
    }

    const loadTimeline = async () => {
      setLoading(true)
      setError(null)

      try {
        const isDemoUser = user?.id === 'demo-user-id' || user?.email === 'demo@svatbot.cz'

        if (isDemoUser) {
          // Load demo timeline items
          const demoTimeline: AITimelineItem[] = [
            {
              id: 'demo-ai-timeline-1',
              weddingId: wedding.id,
              time: '09:00',
              activity: 'Příprava nevěsty - líčení a účes',
              duration: '3 hodiny',
              location: 'Hotel',
              participants: ['Nevěsta', 'Kadeřnice', 'Vizážistka'],
              category: 'preparation',
              order: 0,
              isCompleted: false,
              notes: 'Začít včas, rezervovat dostatek času',
              createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
              updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
              createdBy: user?.id || 'demo-user-id'
            },
            {
              id: 'demo-ai-timeline-2',
              weddingId: wedding.id,
              time: '15:00',
              activity: 'Svatební obřad',
              duration: '45 minut',
              location: 'Kostel sv. Víta',
              participants: ['Nevěsta', 'Ženich', 'Hosté', 'Kněz'],
              category: 'ceremony',
              order: 1,
              isCompleted: false,
              notes: 'Hlavní část svatby, přijít včas',
              createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
              updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
              createdBy: user?.id || 'demo-user-id'
            },
            {
              id: 'demo-ai-timeline-3',
              weddingId: wedding.id,
              time: '18:00',
              activity: 'Svatební hostina',
              duration: '3 hodiny',
              location: 'Svatební sál',
              participants: ['Všichni hosté'],
              category: 'reception',
              order: 2,
              isCompleted: false,
              notes: '3-chodové menu, přípitek',
              createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
              updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
              createdBy: user?.id || 'demo-user-id'
            },
            {
              id: 'demo-ai-timeline-4',
              weddingId: wedding.id,
              time: '22:00',
              activity: 'První tanec a zábava',
              duration: '4 hodiny',
              location: 'Taneční parket',
              participants: ['Všichni hosté', 'DJ'],
              category: 'party',
              order: 3,
              isCompleted: false,
              createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
              updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
              createdBy: user?.id || 'demo-user-id'
            }
          ]

          console.log('📅 Loaded demo AI timeline items:', demoTimeline.length)
          setTimeline(demoTimeline)
          return
        }

        // For real users, load from localStorage
        const savedTimeline = localStorage.getItem(`aiTimeline_${wedding.id}`)
        const savedSettings = localStorage.getItem(`aiTimelineSettings_${wedding.id}`)
        
        if (savedTimeline) {
          const parsedTimeline = JSON.parse(savedTimeline).map((item: any) => ({
            ...item,
            createdAt: new Date(item.createdAt),
            updatedAt: new Date(item.updatedAt)
          }))
          setTimeline(parsedTimeline)
        }

        if (savedSettings) {
          const parsedSettings = JSON.parse(savedSettings)
          setSettings({ ...DEFAULT_SETTINGS, ...parsedSettings })
        }

      } catch (error: any) {
        console.error('Error loading AI timeline:', error)
        setError('Chyba při načítání AI timeline')
      } finally {
        setLoading(false)
      }
    }

    loadTimeline()
  }, [wedding?.id, user?.id])

  // Create timeline item
  const createTimelineItem = useCallback(async (data: Omit<AITimelineItem, 'id' | 'weddingId' | 'createdAt' | 'updatedAt' | 'createdBy'>): Promise<AITimelineItem> => {
    if (!wedding || !user) {
      throw new Error('Chybí svatba nebo uživatel')
    }

    const itemData: AITimelineItem = {
      ...data,
      id: `ai-timeline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      weddingId: wedding.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: user.id
    }

    // Save to localStorage
    const savedTimeline = localStorage.getItem(`aiTimeline_${wedding.id}`) || '[]'
    const existingTimeline = JSON.parse(savedTimeline)
    existingTimeline.push(itemData)
    localStorage.setItem(`aiTimeline_${wedding.id}`, JSON.stringify(existingTimeline))

    // Update local state
    setTimeline(prev => [...prev, itemData].sort((a, b) => a.order - b.order))

    return itemData
  }, [wedding, user])

  // Update timeline item
  const updateTimelineItem = useCallback(async (itemId: string, updates: Partial<AITimelineItem>): Promise<void> => {
    if (!wedding) return

    const updatedItem = { ...updates, updatedAt: new Date() }

    // Update localStorage
    const savedTimeline = localStorage.getItem(`aiTimeline_${wedding.id}`) || '[]'
    const existingTimeline = JSON.parse(savedTimeline)
    const updatedTimeline = existingTimeline.map((item: AITimelineItem) =>
      item.id === itemId ? { ...item, ...updatedItem } : item
    )
    localStorage.setItem(`aiTimeline_${wedding.id}`, JSON.stringify(updatedTimeline))

    // Update local state
    setTimeline(prev => prev.map(item =>
      item.id === itemId ? { ...item, ...updatedItem } : item
    ).sort((a, b) => a.order - b.order))
  }, [wedding])

  // Delete timeline item
  const deleteTimelineItem = useCallback(async (itemId: string): Promise<void> => {
    if (!wedding) return

    // Update localStorage
    const savedTimeline = localStorage.getItem(`aiTimeline_${wedding.id}`) || '[]'
    const existingTimeline = JSON.parse(savedTimeline)
    const filteredTimeline = existingTimeline.filter((item: AITimelineItem) => item.id !== itemId)
    localStorage.setItem(`aiTimeline_${wedding.id}`, JSON.stringify(filteredTimeline))

    // Update local state
    setTimeline(prev => prev.filter(item => item.id !== itemId))
  }, [wedding])

  // Reorder timeline
  const reorderTimeline = useCallback(async (newOrder: AITimelineItem[]): Promise<void> => {
    if (!wedding) return

    const reorderedTimeline = newOrder.map((item, index) => ({
      ...item,
      order: index,
      updatedAt: new Date()
    }))

    // Update localStorage
    localStorage.setItem(`aiTimeline_${wedding.id}`, JSON.stringify(reorderedTimeline))

    // Update local state
    setTimeline(reorderedTimeline)
  }, [wedding])

  // Update settings
  const updateSettings = useCallback(async (newSettings: Partial<AITimelineSettings>): Promise<void> => {
    if (!wedding) return

    const updatedSettings = { ...settings, ...newSettings }
    
    // Update localStorage
    localStorage.setItem(`aiTimelineSettings_${wedding.id}`, JSON.stringify(updatedSettings))

    // Update local state
    setSettings(updatedSettings)
  }, [wedding, settings])

  // Generate from AI
  const generateFromAI = useCallback(async (aiTimeline: any[]): Promise<void> => {
    if (!wedding || !user) return

    const timelineItems: AITimelineItem[] = aiTimeline.map((item, index) => ({
      id: `ai-timeline-${Date.now()}-${index}`,
      weddingId: wedding.id,
      time: item.time,
      activity: item.activity,
      duration: item.duration,
      notes: item.notes,
      location: item.location,
      participants: item.participants,
      category: categorizeActivity(item.activity),
      order: index,
      isCompleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: user.id
    }))

    // Save to localStorage
    localStorage.setItem(`aiTimeline_${wedding.id}`, JSON.stringify(timelineItems))

    // Update local state
    setTimeline(timelineItems)
  }, [wedding, user])

  // Categorize activity
  const categorizeActivity = (activity: string): AITimelineItem['category'] => {
    const lower = activity.toLowerCase()
    if (lower.includes('příprava') || lower.includes('líčení') || lower.includes('oblékání')) return 'preparation'
    if (lower.includes('obřad') || lower.includes('ceremonie') || lower.includes('slib')) return 'ceremony'
    if (lower.includes('hostina') || lower.includes('večeře') || lower.includes('jídlo')) return 'reception'
    if (lower.includes('tanec') || lower.includes('zábava') || lower.includes('hudba')) return 'party'
    return 'other'
  }

  // Export timeline
  const exportTimeline = useCallback((): string => {
    return timeline.map(item => 
      `${item.time} - ${item.activity} (${item.duration})`
    ).join('\n')
  }, [timeline])

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    timeline,
    settings,
    loading,
    error,
    createTimelineItem,
    updateTimelineItem,
    deleteTimelineItem,
    reorderTimeline,
    updateSettings,
    generateFromAI,
    exportTimeline,
    clearError
  }
}
