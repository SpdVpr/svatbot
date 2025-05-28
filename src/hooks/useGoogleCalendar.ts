'use client'

import { useState, useCallback } from 'react'
import { googleCalendarService, WeddingCalendarEvent } from '@/lib/googleCalendar'
import { trackEvent, ANALYTICS_EVENTS } from '@/lib/analytics'

export interface UseGoogleCalendarReturn {
  isConnected: boolean
  isLoading: boolean
  error: string | null
  connect: () => Promise<boolean>
  disconnect: () => void
  syncEvent: (event: WeddingCalendarEvent) => Promise<string | null>
  updateEvent: (eventId: string, updates: Partial<WeddingCalendarEvent>) => Promise<boolean>
  deleteEvent: (eventId: string) => Promise<boolean>
  syncAllEvents: (events: WeddingCalendarEvent[]) => Promise<void>
}

export function useGoogleCalendar(): UseGoogleCalendarReturn {
  const [isConnected, setIsConnected] = useState(googleCalendarService.isAuthenticated())
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Connect to Google Calendar
  const connect = useCallback(async (): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      const success = await googleCalendarService.initAuth()
      setIsConnected(success)
      
      if (success) {
        trackEvent(ANALYTICS_EVENTS.CALENDAR_SYNC, { action: 'connected' })
      } else {
        setError('Nepodařilo se připojit ke Google Calendar')
      }

      return success
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Neočekávaná chyba'
      setError(errorMessage)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Disconnect from Google Calendar
  const disconnect = useCallback(() => {
    googleCalendarService.disconnect()
    setIsConnected(false)
    setError(null)
    trackEvent(ANALYTICS_EVENTS.CALENDAR_SYNC, { action: 'disconnected' })
  }, [])

  // Sync single event to Google Calendar
  const syncEvent = useCallback(async (event: WeddingCalendarEvent): Promise<string | null> => {
    if (!isConnected) {
      setError('Nejste připojeni ke Google Calendar')
      return null
    }

    setIsLoading(true)
    setError(null)

    try {
      const calendarEvent = googleCalendarService.convertWeddingEventToCalendar(event)
      const eventId = await googleCalendarService.createEvent(calendarEvent)
      
      if (eventId) {
        trackEvent(ANALYTICS_EVENTS.CALENDAR_SYNC, { 
          action: 'event_created',
          eventType: event.type,
          eventId 
        })
      } else {
        setError('Nepodařilo se vytvořit událost v kalendáři')
      }

      return eventId
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Chyba při vytváření události'
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [isConnected])

  // Update event in Google Calendar
  const updateEvent = useCallback(async (
    eventId: string, 
    updates: Partial<WeddingCalendarEvent>
  ): Promise<boolean> => {
    if (!isConnected) {
      setError('Nejste připojeni ke Google Calendar')
      return false
    }

    setIsLoading(true)
    setError(null)

    try {
      // Convert updates to Google Calendar format
      const calendarUpdates: any = {}
      
      if (updates.title) calendarUpdates.summary = updates.title
      if (updates.description) calendarUpdates.description = updates.description
      if (updates.location) calendarUpdates.location = updates.location
      
      if (updates.date) {
        const startDate = new Date(updates.date)
        const endDate = updates.endDate ? new Date(updates.endDate) : new Date(startDate.getTime() + 60 * 60 * 1000)
        
        calendarUpdates.start = {
          dateTime: startDate.toISOString(),
          timeZone: 'Europe/Prague'
        }
        calendarUpdates.end = {
          dateTime: endDate.toISOString(),
          timeZone: 'Europe/Prague'
        }
      }

      if (updates.attendees) {
        calendarUpdates.attendees = updates.attendees.map(email => ({ email }))
      }

      const success = await googleCalendarService.updateEvent(eventId, calendarUpdates)
      
      if (success) {
        trackEvent(ANALYTICS_EVENTS.CALENDAR_SYNC, { 
          action: 'event_updated',
          eventId 
        })
      } else {
        setError('Nepodařilo se aktualizovat událost v kalendáři')
      }

      return success
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Chyba při aktualizaci události'
      setError(errorMessage)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [isConnected])

  // Delete event from Google Calendar
  const deleteEvent = useCallback(async (eventId: string): Promise<boolean> => {
    if (!isConnected) {
      setError('Nejste připojeni ke Google Calendar')
      return false
    }

    setIsLoading(true)
    setError(null)

    try {
      const success = await googleCalendarService.deleteEvent(eventId)
      
      if (success) {
        trackEvent(ANALYTICS_EVENTS.CALENDAR_SYNC, { 
          action: 'event_deleted',
          eventId 
        })
      } else {
        setError('Nepodařilo se smazat událost z kalendáře')
      }

      return success
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Chyba při mazání události'
      setError(errorMessage)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [isConnected])

  // Sync all wedding events to Google Calendar
  const syncAllEvents = useCallback(async (events: WeddingCalendarEvent[]): Promise<void> => {
    if (!isConnected) {
      setError('Nejste připojeni ke Google Calendar')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const results = await Promise.allSettled(
        events.map(event => syncEvent(event))
      )

      const successful = results.filter(result => result.status === 'fulfilled' && result.value).length
      const failed = results.length - successful

      trackEvent(ANALYTICS_EVENTS.CALENDAR_SYNC, { 
        action: 'bulk_sync',
        total: events.length,
        successful,
        failed
      })

      if (failed > 0) {
        setError(`Synchronizováno ${successful}/${events.length} událostí`)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Chyba při hromadné synchronizaci'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [isConnected, syncEvent])

  return {
    isConnected,
    isLoading,
    error,
    connect,
    disconnect,
    syncEvent,
    updateEvent,
    deleteEvent,
    syncAllEvents
  }
}

// Helper function to create wedding calendar events from tasks
export function createCalendarEventsFromTasks(tasks: any[], weddingDate?: string): WeddingCalendarEvent[] {
  return tasks
    .filter(task => task.dueDate)
    .map(task => ({
      id: `task-${task.id}`,
      type: 'task' as const,
      title: task.title,
      description: task.description || `Úkol: ${task.title}`,
      date: new Date(task.dueDate),
      taskId: task.id,
      attendees: []
    }))
}

// Helper function to create wedding calendar event
export function createWeddingCalendarEvent(
  wedding: any,
  venue?: string,
  attendees?: string[]
): WeddingCalendarEvent {
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

// Helper function to create vendor meeting events
export function createVendorMeetingEvents(vendors: any[]): WeddingCalendarEvent[] {
  return vendors
    .filter(vendor => vendor.meetingDate)
    .map(vendor => ({
      id: `vendor-meeting-${vendor.id}`,
      type: 'meeting' as const,
      title: `Schůzka s ${vendor.name}`,
      description: `Schůzka s dodavatelem: ${vendor.name}\nKategorie: ${vendor.category}`,
      date: new Date(vendor.meetingDate),
      endDate: new Date(new Date(vendor.meetingDate).getTime() + 60 * 60 * 1000), // 1 hour
      location: vendor.address?.street ? `${vendor.address.street}, ${vendor.address.city}` : undefined,
      vendorId: vendor.id,
      attendees: vendor.contactEmail ? [vendor.contactEmail] : []
    }))
}
