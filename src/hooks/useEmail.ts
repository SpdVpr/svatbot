'use client'

import { useState, useCallback } from 'react'
import { emailService, WeddingEmailContext } from '@/lib/emailService'
import { trackEvent, ANALYTICS_EVENTS } from '@/lib/analytics'
import { useAuth } from './useAuth'
import { useWedding } from './useWedding'

export interface UseEmailReturn {
  isLoading: boolean
  error: string | null
  sendRSVPConfirmation: (guestEmail: string, guestName: string, rsvpStatus: 'attending' | 'not-attending' | 'maybe') => Promise<boolean>
  sendTaskReminder: (userEmail: string, taskTitle: string, dueDate: string) => Promise<boolean>
  sendVendorMeetingReminder: (userEmail: string, vendorName: string, meetingDate: string, meetingLocation: string) => Promise<boolean>
  sendWeddingCountdown: (userEmail: string, daysUntilWedding: number) => Promise<boolean>
  sendBudgetAlert: (userEmail: string, budgetStatus: 'over-budget' | 'near-limit', currentAmount: number, budgetLimit: number) => Promise<boolean>
  sendGuestInvitation: (guestEmail: string, guestName: string, personalMessage?: string) => Promise<boolean>
  sendVendorInquiry: (vendorEmail: string, vendorName: string, clientName: string, clientEmail: string, clientPhone: string, message: string) => Promise<boolean>
  sendWeeklyProgressReport: (progressData: any) => Promise<boolean>
  sendCustomEmail: (to: string | string[], subject: string, content: string) => Promise<boolean>
}

export function useEmail(): UseEmailReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const { wedding } = useWedding()

  // Create wedding email context
  const createWeddingContext = useCallback((): WeddingEmailContext => {
    return {
      brideName: wedding?.brideName || 'Nevěsta',
      groomName: wedding?.groomName || 'Ženich',
      weddingDate: wedding?.weddingDate ? new Date(wedding.weddingDate).toLocaleDateString('cs-CZ') : 'TBD',
      venue: typeof wedding?.venue === 'string' ? wedding.venue : wedding?.venue?.name || 'TBD',
      weddingUrl: `${window.location.origin}`,
      rsvpUrl: `${window.location.origin}/rsvp`,
      contactEmail: user?.email || 'info@svatbot.cz'
    }
  }, [wedding, user])

  // Send RSVP confirmation email
  const sendRSVPConfirmation = useCallback(async (
    guestEmail: string,
    guestName: string,
    rsvpStatus: 'attending' | 'not-attending' | 'maybe'
  ): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      const context = createWeddingContext()
      const success = await emailService.sendRSVPConfirmation(guestEmail, guestName, context, rsvpStatus)

      if (success) {
        trackEvent(ANALYTICS_EVENTS.EMAIL_SENT, {
          type: 'rsvp_confirmation',
          recipient: guestEmail,
          status: rsvpStatus
        })
      } else {
        setError('Nepodařilo se odeslat potvrzení RSVP')
      }

      return success
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Chyba při odesílání emailu'
      setError(errorMessage)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [createWeddingContext])

  // Send task reminder email
  const sendTaskReminder = useCallback(async (
    userEmail: string,
    taskTitle: string,
    dueDate: string
  ): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      const context = createWeddingContext()
      const success = await emailService.sendTaskReminder(userEmail, taskTitle, dueDate, context)

      if (success) {
        trackEvent(ANALYTICS_EVENTS.EMAIL_SENT, {
          type: 'task_reminder',
          recipient: userEmail,
          taskTitle
        })
      } else {
        setError('Nepodařilo se odeslat připomínku úkolu')
      }

      return success
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Chyba při odesílání emailu'
      setError(errorMessage)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [createWeddingContext])

  // Send vendor meeting reminder
  const sendVendorMeetingReminder = useCallback(async (
    userEmail: string,
    vendorName: string,
    meetingDate: string,
    meetingLocation: string
  ): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      const context = createWeddingContext()
      const success = await emailService.sendVendorMeetingReminder(
        userEmail,
        vendorName,
        meetingDate,
        meetingLocation,
        context
      )

      if (success) {
        trackEvent(ANALYTICS_EVENTS.EMAIL_SENT, {
          type: 'vendor_meeting_reminder',
          recipient: userEmail,
          vendorName
        })
      } else {
        setError('Nepodařilo se odeslat připomínku schůzky')
      }

      return success
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Chyba při odesílání emailu'
      setError(errorMessage)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [createWeddingContext])

  // Send wedding countdown email
  const sendWeddingCountdown = useCallback(async (
    userEmail: string,
    daysUntilWedding: number
  ): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      const context = createWeddingContext()
      const success = await emailService.sendWeddingCountdown(userEmail, daysUntilWedding, context)

      if (success) {
        trackEvent(ANALYTICS_EVENTS.EMAIL_SENT, {
          type: 'wedding_countdown',
          recipient: userEmail,
          daysUntilWedding
        })
      } else {
        setError('Nepodařilo se odeslat odpočet do svatby')
      }

      return success
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Chyba při odesílání emailu'
      setError(errorMessage)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [createWeddingContext])

  // Send budget alert email
  const sendBudgetAlert = useCallback(async (
    userEmail: string,
    budgetStatus: 'over-budget' | 'near-limit',
    currentAmount: number,
    budgetLimit: number
  ): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      const context = createWeddingContext()
      const success = await emailService.sendBudgetAlert(
        userEmail,
        budgetStatus,
        currentAmount,
        budgetLimit,
        context
      )

      if (success) {
        trackEvent(ANALYTICS_EVENTS.EMAIL_SENT, {
          type: 'budget_alert',
          recipient: userEmail,
          budgetStatus,
          currentAmount,
          budgetLimit
        })
      } else {
        setError('Nepodařilo se odeslat upozornění na rozpočet')
      }

      return success
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Chyba při odesílání emailu'
      setError(errorMessage)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [createWeddingContext])

  // Send guest invitation email
  const sendGuestInvitation = useCallback(async (
    guestEmail: string,
    guestName: string,
    personalMessage?: string
  ): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      const context = createWeddingContext()
      const success = await emailService.sendGuestInvitation(
        guestEmail,
        guestName,
        context,
        personalMessage
      )

      if (success) {
        trackEvent(ANALYTICS_EVENTS.EMAIL_SENT, {
          type: 'guest_invitation',
          recipient: guestEmail,
          guestName
        })
      } else {
        setError('Nepodařilo se odeslat pozvánku')
      }

      return success
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Chyba při odesílání emailu'
      setError(errorMessage)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [createWeddingContext])

  // Send vendor inquiry email
  const sendVendorInquiry = useCallback(async (
    vendorEmail: string,
    vendorName: string,
    clientName: string,
    clientEmail: string,
    clientPhone: string,
    message: string
  ): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      const context = createWeddingContext()
      const success = await emailService.sendVendorInquiry(
        vendorEmail,
        vendorName,
        clientName,
        clientEmail,
        clientPhone,
        message,
        context
      )

      if (success) {
        trackEvent(ANALYTICS_EVENTS.EMAIL_SENT, {
          type: 'vendor_inquiry',
          recipient: vendorEmail,
          vendorName,
          clientName
        })
      } else {
        setError('Nepodařilo se odeslat poptávku dodavateli')
      }

      return success
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Chyba při odesílání emailu'
      setError(errorMessage)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [createWeddingContext])

  // Send weekly progress report
  const sendWeeklyProgressReport = useCallback(async (progressData: any): Promise<boolean> => {
    if (!user?.email) return false

    setIsLoading(true)
    setError(null)

    try {
      const context = createWeddingContext()
      const success = await emailService.sendWeeklyProgressReport(user.email, progressData, context)

      if (success) {
        trackEvent(ANALYTICS_EVENTS.EMAIL_SENT, {
          type: 'weekly_progress',
          recipient: user.email
        })
      } else {
        setError('Nepodařilo se odeslat týdenní report')
      }

      return success
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Chyba při odesílání emailu'
      setError(errorMessage)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [user, createWeddingContext])

  // Send custom email
  const sendCustomEmail = useCallback(async (
    to: string | string[],
    subject: string,
    content: string
  ): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      const success = await emailService.sendEmail({
        to,
        subject,
        html: content,
        text: content.replace(/<[^>]*>/g, '') // Strip HTML for text version
      })

      if (success) {
        trackEvent(ANALYTICS_EVENTS.EMAIL_SENT, {
          type: 'custom',
          recipients: Array.isArray(to) ? to.length : 1
        })
      } else {
        setError('Nepodařilo se odeslat email')
      }

      return success
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Chyba při odesílání emailu'
      setError(errorMessage)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    isLoading,
    error,
    sendRSVPConfirmation,
    sendTaskReminder,
    sendVendorMeetingReminder,
    sendWeddingCountdown,
    sendBudgetAlert,
    sendGuestInvitation,
    sendVendorInquiry,
    sendWeeklyProgressReport,
    sendCustomEmail
  }
}
