'use client'

import { useState, useCallback } from 'react'
import { microsoftCalendarService, WeddingGraphEvent } from '@/lib/microsoftCalendar'
import { trackEvent, ANALYTICS_EVENTS } from '@/lib/analytics'

export interface UseMicrosoftCalendarReturn {
  isConnected: boolean
  isLoading: boolean
  error: string | null
  connect: () => Promise<boolean>
  disconnect: () => void
  syncEvent: (event: WeddingGraphEvent) => Promise<string | null>
  updateEvent: (eventId: string, updates: Partial<WeddingGraphEvent>) => Promise<boolean>
  deleteEvent: (eventId: string) => Promise<boolean>
  syncAllEvents: (events: WeddingGraphEvent[]) => Promise<void>
}

export function useMicrosoftCalendar(): UseMicrosoftCalendarReturn {
  const [isConnected, setIsConnected] = useState(microsoftCalendarService.isAuthenticated())
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Connect to Microsoft Calendar
  const connect = useCallback(async (): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      const success = await microsoftCalendarService.initAuth()
      setIsConnected(success)
      
      if (success) {
        trackEvent(ANALYTICS_EVENTS.CALENDAR_SYNC, { action: 'microsoft_connected' })
      } else {
        setError('Nepodařilo se připojit k Microsoft Calendar')
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

  // Disconnect from Microsoft Calendar
  const disconnect = useCallback(() => {
    microsoftCalendarService.disconnect()
    setIsConnected(false)
    setError(null)
    trackEvent(ANALYTICS_EVENTS.CALENDAR_SYNC, { action: 'microsoft_disconnected' })
  }, [])

  // Sync single event to Microsoft Calendar
  const syncEvent = useCallback(async (event: WeddingGraphEvent): Promise<string | null> => {
    if (!isConnected) {
      setError('Nejste připojeni k Microsoft Calendar')
      return null
    }

    setIsLoading(true)
    setError(null)

    try {
      const graphEvent = microsoftCalendarService.convertWeddingEventToGraph(event)
      const eventId = await microsoftCalendarService.createEvent(graphEvent)
      
      if (eventId) {
        trackEvent(ANALYTICS_EVENTS.CALENDAR_SYNC, { 
          action: 'microsoft_event_created',
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

  // Update event in Microsoft Calendar
  const updateEvent = useCallback(async (
    eventId: string, 
    updates: Partial<WeddingGraphEvent>
  ): Promise<boolean> => {
    if (!isConnected) {
      setError('Nejste připojeni k Microsoft Calendar')
      return false
    }

    setIsLoading(true)
    setError(null)

    try {
      // Convert updates to Microsoft Graph format
      const graphUpdates: any = {}
      
      if (updates.title) graphUpdates.subject = updates.title
      if (updates.description) {
        graphUpdates.body = {
          contentType: 'Text',
          content: updates.description
        }
      }
      if (updates.location) {
        graphUpdates.location = {
          displayName: updates.location
        }
      }
      
      if (updates.date) {
        const startDate = new Date(updates.date)
        const endDate = updates.endDate ? new Date(updates.endDate) : new Date(startDate.getTime() + 60 * 60 * 1000)
        
        graphUpdates.start = {
          dateTime: startDate.toISOString(),
          timeZone: 'Europe/Prague'
        }
        graphUpdates.end = {
          dateTime: endDate.toISOString(),
          timeZone: 'Europe/Prague'
        }
      }

      if (updates.attendees) {
        graphUpdates.attendees = updates.attendees.map(email => ({
          emailAddress: { address: email },
          type: 'required'
        }))
      }

      const success = await microsoftCalendarService.updateEvent(eventId, graphUpdates)
      
      if (success) {
        trackEvent(ANALYTICS_EVENTS.CALENDAR_SYNC, { 
          action: 'microsoft_event_updated',
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

  // Delete event from Microsoft Calendar
  const deleteEvent = useCallback(async (eventId: string): Promise<boolean> => {
    if (!isConnected) {
      setError('Nejste připojeni k Microsoft Calendar')
      return false
    }

    setIsLoading(true)
    setError(null)

    try {
      const success = await microsoftCalendarService.deleteEvent(eventId)
      
      if (success) {
        trackEvent(ANALYTICS_EVENTS.CALENDAR_SYNC, { 
          action: 'microsoft_event_deleted',
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

  // Sync all wedding events to Microsoft Calendar
  const syncAllEvents = useCallback(async (events: WeddingGraphEvent[]): Promise<void> => {
    if (!isConnected) {
      setError('Nejste připojeni k Microsoft Calendar')
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
        action: 'microsoft_bulk_sync',
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

// Helper function to create Microsoft Graph events from milestones
export function createGraphEventsFromMilestones(milestones: any[]): WeddingGraphEvent[] {
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

// Helper function to create Microsoft Graph events from tasks
export function createGraphEventsFromTasks(tasks: any[]): WeddingGraphEvent[] {
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

// Helper function to create wedding Microsoft Graph event
export function createWeddingGraphEvent(
  wedding: any,
  venue?: string,
  attendees?: string[]
): WeddingGraphEvent {
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
