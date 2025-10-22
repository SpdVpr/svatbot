'use client'

import { useEffect, useRef } from 'react'
import { useAuth } from './useAuth'
import { useCalendar } from './useCalendar'
import { useLiveToastNotifications, useWeddingNotifications, WeddingNotificationType } from './useWeddingNotifications'
import { format } from 'date-fns'
import { cs } from 'date-fns/locale'

/**
 * Hook for automatic calendar event reminders
 * Shows toast notifications AND creates persistent notifications 24 hours and 1 hour before events
 */
export function useCalendarReminders() {
  const { user } = useAuth()
  const { events } = useCalendar()
  const { showToast } = useLiveToastNotifications()
  const { createNotification } = useWeddingNotifications()
  const sentRemindersRef = useRef<Set<string>>(new Set())
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!user?.id || !events || events.length === 0) {
      return
    }

    // Check for upcoming events every minute
    const checkUpcomingEvents = () => {
      const now = new Date()
      const nowTime = now.getTime()

      events.forEach((aggEvent) => {
        const event = aggEvent.event
        
        // Skip completed events
        if (event.isCompleted) return

        // Get event date and time
        const eventDate = new Date(event.startDate)
        
        // If event has specific time, use it
        if (event.startTime && !event.isAllDay) {
          const [hours, minutes] = event.startTime.split(':').map(Number)
          eventDate.setHours(hours, minutes, 0, 0)
        } else {
          // For all-day events, set to 9:00 AM
          eventDate.setHours(9, 0, 0, 0)
        }

        const eventTime = eventDate.getTime()
        const timeDiff = eventTime - nowTime

        // Check if event is in the future
        if (timeDiff <= 0) return

        // 24 hours = 86400000 ms
        // 1 hour = 3600000 ms
        const twentyFourHours = 24 * 60 * 60 * 1000
        const oneHour = 60 * 60 * 1000

        // Check for 24-hour reminder (within 24h ± 2 minutes window)
        const reminderKey24h = `${event.id}-24h`
        if (
          timeDiff <= twentyFourHours &&
          timeDiff > (twentyFourHours - 2 * 60 * 1000) &&
          !sentRemindersRef.current.has(reminderKey24h)
        ) {
          // Show toast notification
          showToast(
            'info',
            '📅 Připomínka události',
            `Zítra: ${event.title}${event.startTime ? ` v ${event.startTime}` : ''}`,
            {
              priority: 'medium',
              actionUrl: '/calendar',
              duration: 8000
            }
          )

          // Create persistent notification
          createNotification(
            WeddingNotificationType.CALENDAR_REMINDER,
            '📅 Připomínka události - zítra',
            `${event.title}${event.startTime ? ` v ${event.startTime}` : ''}${event.location ? ` (${event.location})` : ''}`,
            {
              priority: 'medium',
              category: 'timeline',
              actionUrl: '/calendar',
              data: { eventId: event.id, reminderType: '24h' }
            }
          )

          sentRemindersRef.current.add(reminderKey24h)
          console.log(`✅ 24h reminder sent for: ${event.title}`)
        }

        // Check for 1-hour reminder (within 1h ± 2 minutes window)
        const reminderKey1h = `${event.id}-1h`
        if (
          timeDiff <= oneHour &&
          timeDiff > (oneHour - 2 * 60 * 1000) &&
          !sentRemindersRef.current.has(reminderKey1h)
        ) {
          // Show toast notification
          showToast(
            'warning',
            '⏰ Událost za hodinu!',
            `${event.title}${event.startTime ? ` v ${event.startTime}` : ''}${event.location ? ` - ${event.location}` : ''}`,
            {
              priority: 'high',
              actionUrl: '/calendar',
              duration: 10000
            }
          )

          // Create persistent notification
          createNotification(
            WeddingNotificationType.CALENDAR_REMINDER,
            '⏰ Událost za hodinu!',
            `${event.title}${event.startTime ? ` v ${event.startTime}` : ''}${event.location ? ` (${event.location})` : ''}`,
            {
              priority: 'high',
              category: 'timeline',
              actionUrl: '/calendar',
              data: { eventId: event.id, reminderType: '1h' }
            }
          )

          sentRemindersRef.current.add(reminderKey1h)
          console.log(`✅ 1h reminder sent for: ${event.title}`)
        }
      })
    }

    // Initial check
    checkUpcomingEvents()

    // Check every minute
    checkIntervalRef.current = setInterval(checkUpcomingEvents, 60 * 1000)

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current)
      }
    }
  }, [user, events, showToast])

  // Clean up old reminders from memory (older than 7 days)
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const now = new Date()
      const sevenDaysAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000

      // Clear reminders for events that are more than 7 days old
      const remindersToKeep = new Set<string>()
      
      events?.forEach((aggEvent) => {
        const eventDate = new Date(aggEvent.event.startDate)
        if (eventDate.getTime() > sevenDaysAgo) {
          remindersToKeep.add(`${aggEvent.event.id}-24h`)
          remindersToKeep.add(`${aggEvent.event.id}-1h`)
        }
      })

      sentRemindersRef.current = remindersToKeep
    }, 24 * 60 * 60 * 1000) // Run once per day

    return () => clearInterval(cleanupInterval)
  }, [events])

  return {
    // Expose method to manually clear reminders if needed
    clearReminders: () => {
      sentRemindersRef.current.clear()
    },
    // Test function to trigger notifications immediately (for debugging)
    testNotifications: () => {
      if (!events || events.length === 0) {
        console.log('❌ No events to test')
        return
      }

      const testEvent = events[0].event
      console.log('🧪 Testing notifications for:', testEvent.title)

      // Test 24h notification
      showToast(
        'info',
        '📅 TEST: Připomínka události',
        `Zítra: ${testEvent.title}${testEvent.startTime ? ` v ${testEvent.startTime}` : ''}`,
        {
          priority: 'medium',
          actionUrl: '/calendar',
          duration: 8000
        }
      )

      createNotification(
        WeddingNotificationType.CALENDAR_REMINDER,
        '📅 TEST: Připomínka události - zítra',
        `${testEvent.title}${testEvent.startTime ? ` v ${testEvent.startTime}` : ''}${testEvent.location ? ` (${testEvent.location})` : ''}`,
        {
          priority: 'medium',
          category: 'timeline',
          actionUrl: '/calendar',
          data: { eventId: testEvent.id, reminderType: '24h', test: true }
        }
      )

      // Test 1h notification after 2 seconds
      setTimeout(() => {
        showToast(
          'warning',
          '⏰ TEST: Událost za hodinu!',
          `${testEvent.title}${testEvent.startTime ? ` v ${testEvent.startTime}` : ''}${testEvent.location ? ` - ${testEvent.location}` : ''}`,
          {
            priority: 'high',
            actionUrl: '/calendar',
            duration: 10000
          }
        )

        createNotification(
          WeddingNotificationType.CALENDAR_REMINDER,
          '⏰ TEST: Událost za hodinu!',
          `${testEvent.title}${testEvent.startTime ? ` v ${testEvent.startTime}` : ''}${testEvent.location ? ` (${testEvent.location})` : ''}`,
          {
            priority: 'high',
            category: 'timeline',
            actionUrl: '/calendar',
            data: { eventId: testEvent.id, reminderType: '1h', test: true }
          }
        )

        console.log('✅ Test notifications sent!')
      }, 2000)
    }
  }
}

