'use client'

import { useState, useCallback } from 'react'
import { appleCalendarService, WeddingICalEvent, ICalEvent } from '@/lib/appleCalendar'
import { trackEvent, ANALYTICS_EVENTS } from '@/lib/analytics'

export interface UseAppleCalendarReturn {
  isSupported: boolean
  isLoading: boolean
  error: string | null
  downloadEvent: (event: WeddingICalEvent, filename?: string) => void
  downloadCalendar: (events: WeddingICalEvent[], calendarName?: string, filename?: string) => void
  getCalendarAppName: () => string
  isAppleDevice: () => boolean
}

export function useAppleCalendar(): UseAppleCalendarReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check if iCal download is supported (always true in browsers)
  const isSupported = typeof window !== 'undefined'

  // Download single event as .ics file
  const downloadEvent = useCallback((event: WeddingICalEvent, filename?: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const icalEvent = appleCalendarService.convertWeddingEventToICal(event)
      appleCalendarService.downloadEvent(icalEvent, filename)
      
      trackEvent(ANALYTICS_EVENTS.CALENDAR_SYNC, { 
        action: 'ical_event_downloaded',
        eventType: event.type,
        eventId: event.id
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Chyba při stahování události'
      setError(errorMessage)
      console.error('Download event error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Download multiple events as calendar file
  const downloadCalendar = useCallback((
    events: WeddingICalEvent[], 
    calendarName?: string, 
    filename?: string
  ) => {
    setIsLoading(true)
    setError(null)

    try {
      const icalEvents = events.map(event => appleCalendarService.convertWeddingEventToICal(event))
      appleCalendarService.downloadCalendar(icalEvents, calendarName, filename)
      
      trackEvent(ANALYTICS_EVENTS.CALENDAR_SYNC, { 
        action: 'ical_calendar_downloaded',
        eventsCount: events.length,
        calendarName
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Chyba při stahování kalendáře'
      setError(errorMessage)
      console.error('Download calendar error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Get appropriate calendar app name for the device
  const getCalendarAppName = useCallback(() => {
    return appleCalendarService.getCalendarAppName()
  }, [])

  // Check if device is Apple device
  const isAppleDevice = useCallback(() => {
    return appleCalendarService.isAppleDevice()
  }, [])

  return {
    isSupported,
    isLoading,
    error,
    downloadEvent,
    downloadCalendar,
    getCalendarAppName,
    isAppleDevice
  }
}

// Helper function to create iCal events from milestones
export function createICalEventsFromMilestones(milestones: any[]): WeddingICalEvent[] {
  return milestones
    .filter(milestone => milestone.targetDate)
    .map(milestone => ({
      id: `milestone-${milestone.id}`,
      type: 'milestone' as const,
      title: milestone.title,
      description: milestone.description || `Svatební milník: ${milestone.title}`,
      date: new Date(milestone.targetDate),
      endDate: new Date(new Date(milestone.targetDate).getTime() + 60*60*1000), // 1 hour duration
      location: '',
      attendees: []
    }))
}

// Helper function to create iCal events from tasks
export function createICalEventsFromTasks(tasks: any[]): WeddingICalEvent[] {
  return tasks
    .filter(task => task.dueDate)
    .map(task => ({
      id: `task-${task.id}`,
      type: 'task' as const,
      title: task.title,
      description: task.description || `Svatební úkol: ${task.title}`,
      date: new Date(task.dueDate),
      endDate: new Date(new Date(task.dueDate).getTime() + 60*60*1000), // 1 hour duration
      location: '',
      attendees: []
    }))
}

// Helper function to create wedding iCal event
export function createWeddingICalEvent(
  wedding: any,
  venue?: string,
  attendees?: string[]
): WeddingICalEvent {
  return {
    id: `wedding-${wedding.id}`,
    type: 'wedding',
    title: `Svatba ${wedding.brideName} & ${wedding.groomName}`,
    description: `Svatební obřad a oslava`,
    date: new Date(wedding.weddingDate),
    endDate: new Date(new Date(wedding.weddingDate).getTime() + 8 * 60 * 60 * 1000), // 8 hours
    location: venue,
    attendees: attendees || []
  }
}
