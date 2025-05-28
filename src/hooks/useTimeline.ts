'use client'

import { useState, useEffect } from 'react'
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp
} from 'firebase/firestore'
import { db } from '@/config/firebase'
import { useAuth } from './useAuth'
import { useWedding } from './useWedding'
import {
  Milestone,
  MilestoneFormData,
  TimelineFilters,
  TimelineStats,
  Appointment,
  AppointmentFormData,
  TimelineTemplate,
  TIMELINE_TEMPLATES
} from '@/types/timeline'

interface UseTimelineReturn {
  milestones: Milestone[]
  appointments: Appointment[]
  loading: boolean
  error: string | null
  stats: TimelineStats
  createMilestone: (data: MilestoneFormData) => Promise<Milestone>
  updateMilestone: (milestoneId: string, updates: Partial<Milestone>) => Promise<void>
  deleteMilestone: (milestoneId: string) => Promise<void>
  completeMilestone: (milestoneId: string) => Promise<void>
  createAppointment: (data: AppointmentFormData) => Promise<Appointment>
  updateAppointment: (appointmentId: string, updates: Partial<Appointment>) => Promise<void>
  deleteAppointment: (appointmentId: string) => Promise<void>
  applyTimelineTemplate: (template: TimelineTemplate, weddingDate: Date) => Promise<void>
  getFilteredMilestones: (filters: TimelineFilters) => Milestone[]
  getUpcomingDeadlines: (days: number) => Milestone[]
  getDaysUntilWedding: () => number
  clearError: () => void
}

export function useTimeline(): UseTimelineReturn {
  const { user } = useAuth()
  const { wedding } = useWedding()
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Convert Firestore data to Milestone
  const convertFirestoneMilestone = (id: string, data: any): Milestone => {
    return {
      id,
      weddingId: data.weddingId,
      title: data.title,
      description: data.description,
      type: data.type,
      targetDate: data.targetDate?.toDate() || new Date(),
      completedDate: data.completedDate?.toDate(),
      period: data.period,
      status: data.status || 'upcoming',
      progress: data.progress || 0,
      dependsOn: data.dependsOn || [],
      blockedBy: data.blockedBy || [],
      taskIds: data.taskIds || [],
      budgetItemIds: data.budgetItemIds || [],
      guestIds: data.guestIds || [],
      vendorIds: data.vendorIds || [],
      priority: data.priority || 'medium',
      isRequired: data.isRequired || false,
      reminderDays: data.reminderDays || [],
      notificationsSent: (data.notificationsSent || []).map((ts: any) => ts.toDate()),
      notes: data.notes,
      attachments: data.attachments || [],
      tags: data.tags || [],
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      createdBy: data.createdBy
    }
  }

  // Convert Milestone to Firestore data
  const convertToFirestoreData = (milestone: Omit<Milestone, 'id'>): any => {
    return {
      weddingId: milestone.weddingId,
      title: milestone.title,
      description: milestone.description || null,
      type: milestone.type,
      targetDate: Timestamp.fromDate(milestone.targetDate),
      completedDate: milestone.completedDate ? Timestamp.fromDate(milestone.completedDate) : null,
      period: milestone.period,
      status: milestone.status,
      progress: milestone.progress,
      dependsOn: milestone.dependsOn,
      blockedBy: milestone.blockedBy,
      taskIds: milestone.taskIds,
      budgetItemIds: milestone.budgetItemIds,
      guestIds: milestone.guestIds,
      vendorIds: milestone.vendorIds,
      priority: milestone.priority,
      isRequired: milestone.isRequired,
      reminderDays: milestone.reminderDays,
      notificationsSent: milestone.notificationsSent.map(date => Timestamp.fromDate(date)),
      notes: milestone.notes || null,
      attachments: milestone.attachments,
      tags: milestone.tags,
      createdAt: Timestamp.fromDate(milestone.createdAt),
      updatedAt: Timestamp.fromDate(milestone.updatedAt),
      createdBy: milestone.createdBy
    }
  }

  // Create new milestone
  const createMilestone = async (data: MilestoneFormData, skipLoading = false): Promise<Milestone> => {
    if (!wedding || !user) {
      throw new Error('Žádná svatba nebo uživatel není vybrán')
    }

    try {
      setError(null)
      if (!skipLoading) {
        setLoading(true)
      }

      // Calculate period based on target date and wedding date
      const period = calculatePeriod(data.targetDate, wedding.weddingDate ? new Date(wedding.weddingDate) : new Date())

      const milestoneData: Omit<Milestone, 'id'> = {
        weddingId: wedding.id,
        title: data.title,
        description: data.description,
        type: data.type,
        targetDate: data.targetDate,
        period,
        status: 'upcoming',
        progress: 0,
        dependsOn: data.dependsOn,
        blockedBy: [],
        taskIds: [],
        budgetItemIds: [],
        guestIds: [],
        vendorIds: [],
        priority: data.priority,
        isRequired: data.isRequired,
        reminderDays: data.reminderDays,
        notificationsSent: [],
        notes: data.notes,
        attachments: [],
        tags: data.tags,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: user.id
      }

      try {
        // Try to save to Firestore
        const docRef = await addDoc(collection(db, 'milestones'), convertToFirestoreData(milestoneData))
        const newMilestone: Milestone = { id: docRef.id, ...milestoneData }

        console.log('✅ Milestone created in Firestore:', newMilestone)

        // Also save to localStorage as backup
        try {
          const savedMilestones = localStorage.getItem(`milestones_${wedding.id}`) || '[]'
          const existingMilestones = JSON.parse(savedMilestones)
          existingMilestones.push(newMilestone)
          localStorage.setItem(`milestones_${wedding.id}`, JSON.stringify(existingMilestones))
          console.log('📦 Backup: Milestone also saved to localStorage')
        } catch (localStorageError) {
          console.warn('⚠️ Failed to save backup to localStorage:', localStorageError)
        }

        // Update local state immediately
        setMilestones(prev => {
          const updated = [...prev, newMilestone]
          console.log('📅 Updated local milestones state:', updated.length, updated)
          return updated
        })

        return newMilestone
      } catch (firestoreError) {
        console.warn('⚠️ Firestore not available, using localStorage fallback')
        // Create milestone with local ID
        const localId = `milestone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const newMilestone: Milestone = { id: localId, ...milestoneData }

        // Save to localStorage
        const savedMilestones = localStorage.getItem(`milestones_${wedding.id}`) || '[]'
        const existingMilestones = JSON.parse(savedMilestones)
        existingMilestones.push(newMilestone)
        localStorage.setItem(`milestones_${wedding.id}`, JSON.stringify(existingMilestones))

        // Update local state
        setMilestones(prev => [...prev, newMilestone])

        return newMilestone
      }
    } catch (error: any) {
      console.error('Error creating milestone:', error)
      setError('Chyba při vytváření milníku')
      throw error
    } finally {
      if (!skipLoading) {
        setLoading(false)
      }
    }
  }

  // Update milestone
  const updateMilestone = async (milestoneId: string, updates: Partial<Milestone>): Promise<void> => {
    try {
      setError(null)

      const updatedData = {
        ...updates,
        updatedAt: new Date()
      }

      try {
        // Try to update in Firestore
        const milestoneRef = doc(db, 'milestones', milestoneId)
        await updateDoc(milestoneRef, convertToFirestoreData(updatedData as any))
      } catch (firestoreError) {
        console.warn('⚠️ Firestore not available, updating localStorage fallback')
        if (wedding) {
          const savedMilestones = localStorage.getItem(`milestones_${wedding.id}`) || '[]'
          const existingMilestones = JSON.parse(savedMilestones)
          const milestoneIndex = existingMilestones.findIndex((m: Milestone) => m.id === milestoneId)
          if (milestoneIndex !== -1) {
            existingMilestones[milestoneIndex] = { ...existingMilestones[milestoneIndex], ...updatedData }
            localStorage.setItem(`milestones_${wedding.id}`, JSON.stringify(existingMilestones))
          }
        }
      }

      // Update local state
      setMilestones(prev => prev.map(milestone =>
        milestone.id === milestoneId ? { ...milestone, ...updatedData } : milestone
      ))
    } catch (error: any) {
      console.error('Error updating milestone:', error)
      setError('Chyba při aktualizaci milníku')
      throw error
    }
  }

  // Delete milestone
  const deleteMilestone = async (milestoneId: string): Promise<void> => {
    try {
      setError(null)

      try {
        // Try to delete from Firestore
        await deleteDoc(doc(db, 'milestones', milestoneId))
      } catch (firestoreError) {
        console.warn('⚠️ Firestore not available, deleting from localStorage fallback')
        if (wedding) {
          const savedMilestones = localStorage.getItem(`milestones_${wedding.id}`) || '[]'
          const existingMilestones = JSON.parse(savedMilestones)
          const filteredMilestones = existingMilestones.filter((m: Milestone) => m.id !== milestoneId)
          localStorage.setItem(`milestones_${wedding.id}`, JSON.stringify(filteredMilestones))
        }
      }

      // Update local state
      setMilestones(prev => prev.filter(milestone => milestone.id !== milestoneId))
    } catch (error: any) {
      console.error('Error deleting milestone:', error)
      setError('Chyba při mazání milníku')
      throw error
    }
  }

  // Complete milestone
  const completeMilestone = async (milestoneId: string): Promise<void> => {
    await updateMilestone(milestoneId, {
      status: 'completed',
      progress: 100,
      completedDate: new Date()
    })
  }

  // Create appointment (placeholder)
  const createAppointment = async (data: AppointmentFormData): Promise<Appointment> => {
    // TODO: Implement appointment creation
    throw new Error('Appointment creation not implemented yet')
  }

  // Update appointment (placeholder)
  const updateAppointment = async (appointmentId: string, updates: Partial<Appointment>): Promise<void> => {
    // TODO: Implement appointment update
    throw new Error('Appointment update not implemented yet')
  }

  // Delete appointment (placeholder)
  const deleteAppointment = async (appointmentId: string): Promise<void> => {
    // TODO: Implement appointment deletion
    throw new Error('Appointment deletion not implemented yet')
  }

  // Apply timeline template
  const applyTimelineTemplate = async (template: TimelineTemplate, weddingDate: Date): Promise<void> => {
    if (!wedding || !user) {
      throw new Error('Žádná svatba nebo uživatel není vybrán')
    }

    try {
      setError(null)
      setLoading(true)

      console.log('🎯 Applying timeline template:', template.name, 'for wedding date:', weddingDate)

      // Create milestones directly without calling createMilestone to avoid loading conflicts
      const milestonesToCreate: Milestone[] = []

      template.milestones.forEach(templateMilestone => {
        // Calculate target date based on wedding date
        let targetDate = new Date(weddingDate.getTime()) // Use getTime() for safe copy

        if (templateMilestone.monthsBefore) {
          targetDate.setMonth(targetDate.getMonth() - templateMilestone.monthsBefore)
        }
        if (templateMilestone.weeksBefore) {
          targetDate.setDate(targetDate.getDate() - (templateMilestone.weeksBefore * 7))
        }
        if (templateMilestone.daysBefore) {
          targetDate.setDate(targetDate.getDate() - templateMilestone.daysBefore)
        }

        // Calculate period
        const period = calculatePeriod(targetDate, weddingDate)

        // Create milestone object
        const milestoneId = `milestone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const milestone: Milestone = {
          id: milestoneId,
          weddingId: wedding.id,
          title: templateMilestone.title,
          description: templateMilestone.description,
          type: templateMilestone.type,
          targetDate,
          period,
          status: 'upcoming',
          progress: 0,
          dependsOn: [],
          blockedBy: [],
          taskIds: [],
          budgetItemIds: [],
          guestIds: [],
          vendorIds: [],
          priority: templateMilestone.priority,
          isRequired: templateMilestone.isRequired,
          reminderDays: templateMilestone.reminderDays,
          notificationsSent: [],
          notes: `Vytvořeno ze šablony: ${template.name}`,
          attachments: [],
          tags: ['šablona', template.name.toLowerCase().replace(' ', '-')],
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: user.id
        }

        milestonesToCreate.push(milestone)
      })

      console.log('📅 Created milestones to save:', milestonesToCreate.length)

      // Try to save all milestones
      try {
        // Try to save to Firestore
        for (const milestone of milestonesToCreate) {
          try {
            // Remove id from milestone for Firestore
            const { id, ...milestoneWithoutId } = milestone
            await addDoc(collection(db, 'milestones'), convertToFirestoreData(milestoneWithoutId))
            console.log('✅ Milestone saved to Firestore:', milestone.title)
          } catch (firestoreError) {
            console.warn('⚠️ Failed to save milestone to Firestore:', milestone.title, firestoreError)
            throw firestoreError // Re-throw to trigger localStorage fallback
          }
        }
        console.log('✅ All milestones saved to Firestore')
      } catch (firestoreError) {
        console.warn('⚠️ Firestore not available, using localStorage fallback')
        // Save to localStorage
        const savedMilestones = localStorage.getItem(`milestones_${wedding.id}`) || '[]'
        const existingMilestones = JSON.parse(savedMilestones)
        existingMilestones.push(...milestonesToCreate)
        localStorage.setItem(`milestones_${wedding.id}`, JSON.stringify(existingMilestones))
        console.log('📦 All milestones saved to localStorage')
      }

      // ALWAYS save to localStorage as backup, even if Firestore succeeds
      try {
        const savedMilestones = localStorage.getItem(`milestones_${wedding.id}`) || '[]'
        const existingMilestones = JSON.parse(savedMilestones)
        existingMilestones.push(...milestonesToCreate)
        localStorage.setItem(`milestones_${wedding.id}`, JSON.stringify(existingMilestones))
        console.log('📦 Backup: All milestones also saved to localStorage')
      } catch (localStorageError) {
        console.warn('⚠️ Failed to save backup to localStorage:', localStorageError)
      }

      // Update local state
      setMilestones(prev => {
        const updated = [...prev, ...milestonesToCreate]
        console.log('📅 Updated local milestones state:', updated.length)
        return updated
      })

      console.log(`✅ Applied timeline template "${template.name}" with ${milestonesToCreate.length} milestones`)
    } catch (error: any) {
      console.error('Error applying timeline template:', error)
      setError('Chyba při aplikaci šablony timeline')
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Filter milestones
  const getFilteredMilestones = (filters: TimelineFilters): Milestone[] => {
    return milestones.filter(milestone => {
      if (filters.search && !milestone.title.toLowerCase().includes(filters.search.toLowerCase())) return false
      if (filters.type && !filters.type.includes(milestone.type)) return false
      if (filters.status && !filters.status.includes(milestone.status)) return false
      if (filters.priority && !filters.priority.includes(milestone.priority)) return false
      if (filters.showCompleted === false && milestone.status === 'completed') return false
      if (filters.showOverdue === false && milestone.status === 'overdue') return false
      return true
    })
  }

  // Get upcoming deadlines
  const getUpcomingDeadlines = (days: number): Milestone[] => {
    const now = new Date()
    const futureDate = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000))

    return milestones.filter(milestone =>
      milestone.status !== 'completed' &&
      milestone.targetDate >= now &&
      milestone.targetDate <= futureDate
    ).sort((a, b) => a.targetDate.getTime() - b.targetDate.getTime())
  }

  // Get days until wedding
  const getDaysUntilWedding = (): number => {
    if (!wedding || !wedding.weddingDate) return 0
    const now = new Date()
    const weddingDate = new Date(wedding.weddingDate)

    // Check if wedding date is valid
    if (isNaN(weddingDate.getTime())) return 0

    const diffTime = weddingDate.getTime() - now.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  // Calculate period based on dates
  const calculatePeriod = (targetDate: Date, weddingDate: Date): any => {
    // Validate dates
    if (!targetDate || !weddingDate || isNaN(targetDate.getTime()) || isNaN(weddingDate.getTime())) {
      return 'custom'
    }

    const diffTime = weddingDate.getTime() - targetDate.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays <= 0) return 'after-wedding'
    if (diffDays <= 7) return '1-week'
    if (diffDays <= 14) return '2-weeks'
    if (diffDays <= 30) return '1-month'
    if (diffDays <= 90) return '3-months'
    if (diffDays <= 180) return '6-months'
    if (diffDays <= 270) return '9-months'
    return '12-months'
  }

  // Calculate timeline statistics
  const stats: TimelineStats = {
    totalMilestones: milestones.length,
    completedMilestones: milestones.filter(m => m.status === 'completed').length,
    upcomingMilestones: milestones.filter(m => m.status === 'upcoming').length,
    overdueMilestones: milestones.filter(m => m.status === 'overdue').length,
    overallProgress: milestones.length > 0 ? Math.round((milestones.filter(m => m.status === 'completed').length / milestones.length) * 100) : 0,
    onTrackPercentage: milestones.length > 0 ? Math.round((milestones.filter(m => m.status !== 'overdue').length / milestones.length) * 100) : 100,
    byPeriod: {} as any, // Will be calculated separately
    criticalMilestones: milestones.filter(m => m.priority === 'critical' && m.status !== 'completed').map(m => m.id),
    nextDeadline: getUpcomingDeadlines(30)[0] ? {
      milestoneId: getUpcomingDeadlines(30)[0].id,
      title: getUpcomingDeadlines(30)[0].title,
      date: getUpcomingDeadlines(30)[0].targetDate,
      daysRemaining: Math.ceil((getUpcomingDeadlines(30)[0].targetDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    } : undefined,
    totalAppointments: appointments.length,
    upcomingAppointments: appointments.filter(a => a.startDate > new Date()).length,
    confirmedAppointments: appointments.filter(a => a.status === 'confirmed').length,
    overdueItems: milestones.filter(m => m.status === 'overdue').length,
    upcomingDeadlines: getUpcomingDeadlines(7).length,
    unconfirmedAppointments: appointments.filter(a => a.status === 'scheduled').length
  }

  // Load milestones when wedding changes
  useEffect(() => {
    if (!wedding) {
      setMilestones([])
      return
    }

    const loadMilestones = async () => {
      try {
        setLoading(true)
        setError(null)

        try {
          // Try to load from Firestore (without orderBy to avoid index requirement)
          const milestonesQuery = query(
            collection(db, 'milestones'),
            where('weddingId', '==', wedding.id)
          )

          const unsubscribe = onSnapshot(milestonesQuery, (snapshot) => {
            const loadedMilestones = snapshot.docs.map(doc =>
              convertFirestoneMilestone(doc.id, doc.data())
            ).sort((a, b) => a.targetDate.getTime() - b.targetDate.getTime()) // Client-side sorting
            console.log('📅 Loaded milestones from Firestore:', loadedMilestones.length, loadedMilestones)
            setMilestones(loadedMilestones)
          }, (error) => {
            console.warn('Firestore snapshot error, using localStorage fallback:', error)
            // Load from localStorage fallback
            const savedMilestones = localStorage.getItem(`milestones_${wedding.id}`)
            if (savedMilestones) {
              const parsedMilestones = JSON.parse(savedMilestones).map((milestone: any) => ({
                ...milestone,
                targetDate: new Date(milestone.targetDate),
                completedDate: milestone.completedDate ? new Date(milestone.completedDate) : undefined,
                notificationsSent: (milestone.notificationsSent || []).map((date: string) => new Date(date)),
                createdAt: new Date(milestone.createdAt),
                updatedAt: new Date(milestone.updatedAt)
              })).sort((a: Milestone, b: Milestone) => a.targetDate.getTime() - b.targetDate.getTime()) // Client-side sorting
              console.log('📦 Loaded milestones from localStorage:', parsedMilestones.length, parsedMilestones)
              setMilestones(parsedMilestones)
            } else {
              console.log('📦 No milestones in localStorage for wedding:', wedding.id)
              setMilestones([])
            }
          })

          return unsubscribe
        } catch (firestoreError) {
          console.warn('⚠️ Firestore not available, loading from localStorage')
          const savedMilestones = localStorage.getItem(`milestones_${wedding.id}`)
          if (savedMilestones) {
            const parsedMilestones = JSON.parse(savedMilestones).map((milestone: any) => ({
              ...milestone,
              targetDate: new Date(milestone.targetDate),
              completedDate: milestone.completedDate ? new Date(milestone.completedDate) : undefined,
              notificationsSent: (milestone.notificationsSent || []).map((date: string) => new Date(date)),
              createdAt: new Date(milestone.createdAt),
              updatedAt: new Date(milestone.updatedAt)
            })).sort((a: Milestone, b: Milestone) => a.targetDate.getTime() - b.targetDate.getTime()) // Client-side sorting
            console.log('📦 Loaded milestones from localStorage (catch):', parsedMilestones.length, parsedMilestones)
            setMilestones(parsedMilestones)
          } else {
            console.log('📦 No milestones in localStorage (catch) for wedding:', wedding.id)
            setMilestones([])
          }
        }
      } catch (error: any) {
        console.error('Error loading milestones:', error)
        setError('Chyba při načítání timeline')
      } finally {
        setLoading(false)
      }
    }

    loadMilestones()
  }, [wedding?.id])

  // Clear error
  const clearError = () => setError(null)

  return {
    milestones,
    appointments,
    loading,
    error,
    stats,
    createMilestone,
    updateMilestone,
    deleteMilestone,
    completeMilestone,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    applyTimelineTemplate,
    getFilteredMilestones,
    getUpcomingDeadlines,
    getDaysUntilWedding,
    clearError
  }
}
