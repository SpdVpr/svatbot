'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from './useAuth'
import { useWedding } from './useWedding'
import { useVendor } from './useVendor'
import { useWeddingDayTimeline } from './useWeddingDayTimeline'
import {
  CalendarEvent,
  CalendarEventFormData,
  CalendarStats,
  CalendarFilters,
  AggregatedEvent,
  EventSource,
  EventType,
  EventPriority,
  EventStatus
} from '@/types/calendar'

export function useCalendar() {
  const { user } = useAuth()
  const { wedding } = useWedding()
  const { vendors } = useVendor()
  const { timeline: weddingDayEvents } = useWeddingDayTimeline()

  const [customEvents, setCustomEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Real-time listener for custom calendar events
  useEffect(() => {
    if (!user || !wedding?.id) {
      setCustomEvents([])
      setLoading(false)
      return
    }

    const q = query(
      collection(db, 'calendarEvents'),
      where('weddingId', '==', wedding.id)
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const events: CalendarEvent[] = []
        snapshot.forEach((doc) => {
          const data = doc.data()
          events.push({
            id: doc.id,
            ...data,
            startDate: data.startDate?.toDate() || new Date(),
            endDate: data.endDate?.toDate(),
            completedAt: data.completedAt?.toDate(),
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            reminders: data.reminders || []
          } as CalendarEvent)
        })
        setCustomEvents(events)
        setLoading(false)
      },
      (err) => {
        console.error('Error fetching calendar events:', err)
        setError(err.message)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [user, wedding?.id])

  // Aggregate events from all sources
  const allEvents = useMemo((): AggregatedEvent[] => {
    const aggregated: AggregatedEvent[] = []

    // Add custom events
    customEvents.forEach(event => {
      aggregated.push({
        event,
        canEdit: true,
        canDelete: true
      })
    })

    // Note: Tasks are no longer automatically added to calendar
    // Users must manually add tasks to calendar using the "Add to Calendar" button in TaskList

    // TODO: Add events from vendors (appointments)
    // Vendor appointments should be stored in a separate collection or in vendor.appointments array
    // For now, skip vendor appointments until the data structure is clarified

    // Add wedding day events
    if (wedding?.weddingDate && weddingDayEvents) {
      weddingDayEvents.forEach(wdEvent => {
        const weddingDate = new Date(wedding.weddingDate!)
        const [hours, minutes] = (wdEvent.time || '00:00').split(':')
        const eventDate = new Date(weddingDate)
        eventDate.setHours(parseInt(hours), parseInt(minutes))

        const event: CalendarEvent = {
          id: `wedding-day-${wdEvent.id}`,
          weddingId: wedding.id,
          userId: user?.id || '',
          title: wdEvent.activity,
          description: wdEvent.notes,
          type: 'wedding-day' as EventType,
          source: 'wedding-day' as EventSource,
          sourceId: wdEvent.id,
          startDate: eventDate,
          startTime: wdEvent.time,
          isAllDay: false,
          status: wdEvent.isCompleted ? 'completed' : 'upcoming',
          priority: 'critical',
          isCompleted: wdEvent.isCompleted,
          location: wdEvent.location,
          reminders: [],
          recurrence: 'none',
          isOnline: false,
          createdAt: wdEvent.createdAt,
          updatedAt: wdEvent.updatedAt,
          createdBy: wdEvent.createdBy
        }

        aggregated.push({
          event,
          sourceData: { weddingDayEventId: wdEvent.id },
          canEdit: false, // Edit in wedding day module
          canDelete: false
        })
      })
    }

    // Sort by date
    return aggregated.sort((a, b) =>
      a.event.startDate.getTime() - b.event.startDate.getTime()
    )
  }, [customEvents, vendors, weddingDayEvents, wedding, user])

  // Calculate statistics
  const stats = useMemo((): CalendarStats => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    const monthFromNow = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate())

    const byType: Record<EventType, number> = {
      task: 0,
      appointment: 0,
      deadline: 0,
      'wedding-day': 0,
      'vendor-meeting': 0,
      'venue-visit': 0,
      tasting: 0,
      fitting: 0,
      rehearsal: 0,
      custom: 0,
      other: 0
    }

    const byPriority: Record<EventPriority, number> = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0
    }

    const bySource: Record<EventSource, number> = {
      tasks: 0,
      vendors: 0,
      budget: 0,
      'wedding-day': 0,
      custom: 0,
      imported: 0
    }

    let upcomingEvents = 0
    let todayEvents = 0
    let thisWeekEvents = 0
    let thisMonthEvents = 0
    let completedEvents = 0
    let overdueEvents = 0

    allEvents.forEach(({ event }) => {
      const eventDate = new Date(event.startDate)
      const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate())

      // Count by type
      byType[event.type]++

      // Count by priority
      byPriority[event.priority]++

      // Count by source
      bySource[event.source]++

      // Count by time
      if (event.isCompleted) {
        completedEvents++
      } else if (eventDate < now && !event.isCompleted) {
        overdueEvents++
      } else {
        upcomingEvents++
      }

      if (eventDay.getTime() === today.getTime()) {
        todayEvents++
      }

      if (eventDate >= today && eventDate < weekFromNow) {
        thisWeekEvents++
      }

      if (eventDate >= today && eventDate < monthFromNow) {
        thisMonthEvents++
      }
    })

    return {
      totalEvents: allEvents.length,
      upcomingEvents,
      todayEvents,
      thisWeekEvents,
      thisMonthEvents,
      completedEvents,
      overdueEvents,
      byType,
      byPriority,
      bySource
    }
  }, [allEvents])

  // Create custom event
  const createEvent = async (data: CalendarEventFormData): Promise<CalendarEvent> => {
    if (!user || !wedding?.id) {
      throw new Error('User or wedding not found')
    }

    const newEvent = {
      weddingId: wedding.id,
      userId: user.id,
      title: data.title,
      description: data.description || '',
      type: data.type,
      source: 'custom' as EventSource,
      startDate: Timestamp.fromDate(data.startDate),
      endDate: data.endDate ? Timestamp.fromDate(data.endDate) : null,
      startTime: data.startTime || null,
      endTime: data.endTime || null,
      isAllDay: data.isAllDay,
      location: data.location || null,
      locationUrl: data.locationUrl || null,
      isOnline: data.isOnline,
      meetingUrl: data.meetingUrl || null,
      status: 'upcoming' as EventStatus,
      priority: data.priority,
      isCompleted: false,
      attendees: data.attendees || [],
      vendorIds: data.vendorIds || [],
      organizerId: user.id,
      reminders: data.reminders.map((r, index) => ({
        id: `reminder-${index}`,
        eventId: '', // Will be set after creation
        type: r.type,
        minutesBefore: r.minutesBefore,
        isSent: false
      })),
      notes: data.notes || null,
      tags: data.tags || [],
      color: data.color || null,
      recurrence: data.recurrence,
      recurrenceEndDate: data.recurrenceEndDate ? Timestamp.fromDate(data.recurrenceEndDate) : null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      createdBy: user.id
    }

    const docRef = await addDoc(collection(db, 'calendarEvents'), newEvent)
    
    return {
      id: docRef.id,
      ...newEvent,
      startDate: data.startDate,
      endDate: data.endDate,
      recurrenceEndDate: data.recurrenceEndDate,
      createdAt: new Date(),
      updatedAt: new Date()
    } as CalendarEvent
  }

  // Update custom event
  const updateEvent = async (eventId: string, updates: Partial<CalendarEventFormData>): Promise<void> => {
    if (!user || !wedding?.id) {
      throw new Error('User or wedding not found')
    }

    const updateData: any = {
      updatedAt: Timestamp.now()
    }

    if (updates.title) updateData.title = updates.title
    if (updates.description !== undefined) updateData.description = updates.description
    if (updates.type) updateData.type = updates.type
    if (updates.startDate) updateData.startDate = Timestamp.fromDate(updates.startDate)
    if (updates.endDate) updateData.endDate = Timestamp.fromDate(updates.endDate)
    if (updates.startTime !== undefined) updateData.startTime = updates.startTime
    if (updates.endTime !== undefined) updateData.endTime = updates.endTime
    if (updates.isAllDay !== undefined) updateData.isAllDay = updates.isAllDay
    if (updates.location !== undefined) updateData.location = updates.location
    if (updates.priority) updateData.priority = updates.priority
    if (updates.notes !== undefined) updateData.notes = updates.notes

    await updateDoc(doc(db, 'calendarEvents', eventId), updateData)
  }

  // Delete custom event
  const deleteEvent = async (eventId: string): Promise<void> => {
    if (!user || !wedding?.id) {
      throw new Error('User or wedding not found')
    }

    await deleteDoc(doc(db, 'calendarEvents', eventId))
  }

  // Mark event as completed
  const completeEvent = async (eventId: string): Promise<void> => {
    if (!user || !wedding?.id) {
      throw new Error('User or wedding not found')
    }

    await updateDoc(doc(db, 'calendarEvents', eventId), {
      isCompleted: true,
      status: 'completed',
      completedAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    })
  }

  // Filter events
  const filterEvents = useCallback((filters: CalendarFilters): AggregatedEvent[] => {
    return allEvents.filter(({ event }) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        if (!event.title.toLowerCase().includes(searchLower) &&
            !event.description?.toLowerCase().includes(searchLower)) {
          return false
        }
      }

      // Type filter
      if (filters.types && filters.types.length > 0) {
        if (!filters.types.includes(event.type)) return false
      }

      // Source filter
      if (filters.sources && filters.sources.length > 0) {
        if (!filters.sources.includes(event.source)) return false
      }

      // Priority filter
      if (filters.priorities && filters.priorities.length > 0) {
        if (!filters.priorities.includes(event.priority)) return false
      }

      // Status filter
      if (filters.statuses && filters.statuses.length > 0) {
        if (!filters.statuses.includes(event.status)) return false
      }

      // Date range filter
      if (filters.startDate && event.startDate < filters.startDate) return false
      if (filters.endDate && event.startDate > filters.endDate) return false

      return true
    })
  }, [allEvents])

  // Get events for specific date
  const getEventsForDate = useCallback((date: Date): AggregatedEvent[] => {
    const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())

    return allEvents.filter(({ event }) => {
      const eventDate = new Date(
        event.startDate.getFullYear(),
        event.startDate.getMonth(),
        event.startDate.getDate()
      )
      return eventDate.getTime() === targetDate.getTime()
    })
  }, [allEvents])

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    events: allEvents,
    customEvents,
    stats,
    loading,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
    completeEvent,
    filterEvents,
    getEventsForDate,
    clearError
  }
}

