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
import { useGuest } from './useGuest'
import {
  RSVPInvitation,
  RSVPResponse,
  RSVPTemplate,
  RSVPSettings,
  RSVPStats,
  RSVPCustomQuestion,
  PublicRSVPForm
} from '@/types/guest'

interface UseRSVPReturn {
  invitations: RSVPInvitation[]
  responses: RSVPResponse[]
  templates: RSVPTemplate[]
  settings: RSVPSettings | null
  loading: boolean
  error: string | null
  stats: RSVPStats

  // Invitation management
  createInvitation: (guestId: string, templateId?: string) => Promise<RSVPInvitation>
  sendInvitation: (invitationId: string) => Promise<void>
  sendBulkInvitations: (guestIds: string[], templateId?: string) => Promise<void>
  sendReminder: (invitationId: string) => Promise<void>

  // Response management
  submitRSVP: (invitationCode: string, formData: PublicRSVPForm) => Promise<void>
  updateResponse: (responseId: string, updates: Partial<RSVPResponse>) => Promise<void>

  // Template management
  createTemplate: (template: Omit<RSVPTemplate, 'id' | 'createdAt' | 'updatedAt'>) => Promise<RSVPTemplate>
  updateTemplate: (templateId: string, updates: Partial<RSVPTemplate>) => Promise<void>
  deleteTemplate: (templateId: string) => Promise<void>

  // Settings management
  updateSettings: (updates: Partial<RSVPSettings>) => Promise<void>

  // Utilities
  generateInvitationCode: () => string
  getInvitationByCode: (code: string) => RSVPInvitation | null
  getResponseByInvitation: (invitationId: string) => RSVPResponse | null
  validateRSVPDeadline: () => boolean
  clearError: () => void
}

export function useRSVP(): UseRSVPReturn {
  const { user } = useAuth()
  const { wedding } = useWedding()
  const { guests } = useGuest()
  const [invitations, setInvitations] = useState<RSVPInvitation[]>([])
  const [responses, setResponses] = useState<RSVPResponse[]>([])
  const [templates, setTemplates] = useState<RSVPTemplate[]>([])
  const [settings, setSettings] = useState<RSVPSettings | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Convert Firestore data
  const convertFirestoreInvitation = (id: string, data: any): RSVPInvitation => ({
    id,
    weddingId: data.weddingId,
    guestId: data.guestId,
    invitationCode: data.invitationCode,
    emailSent: data.emailSent,
    emailSentAt: data.emailSentAt?.toDate(),
    emailTemplate: data.emailTemplate,
    customMessage: data.customMessage,
    expiresAt: data.expiresAt?.toDate(),
    isActive: data.isActive,
    maxResponses: data.maxResponses,
    viewedAt: data.viewedAt?.toDate(),
    respondedAt: data.respondedAt?.toDate(),
    remindersSent: data.remindersSent,
    lastReminderAt: data.lastReminderAt?.toDate(),
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
    createdBy: data.createdBy
  })

  const convertFirestoreResponse = (id: string, data: any): RSVPResponse => ({
    id,
    guestId: data.guestId,
    weddingId: data.weddingId,
    attending: data.attending,
    plusOneAttending: data.plusOneAttending,
    guestCount: data.guestCount,
    mealChoice: data.mealChoice,
    plusOneMealChoice: data.plusOneMealChoice,
    dietaryRestrictions: data.dietaryRestrictions || [],
    dietaryNotes: data.dietaryNotes,
    songRequests: data.songRequests,
    specialRequests: data.specialRequests,
    accommodationNeeded: data.accommodationNeeded || false,
    transportationNeeded: data.transportationNeeded || false,
    responseDate: data.respondedAt?.toDate() || new Date(),
    responseMethod: data.responseMethod || 'online',
    ipAddress: data.ipAddress,
    userAgent: data.userAgent
  })

  // Load data when wedding changes
  useEffect(() => {
    if (!wedding) return

    setLoading(true)

    try {
      // Load invitations
      const invitationsQuery = query(
        collection(db, 'rsvpInvitations'),
        where('weddingId', '==', wedding.id),
        orderBy('createdAt', 'desc')
      )

      const unsubscribeInvitations = onSnapshot(invitationsQuery, (snapshot) => {
        const invitationData = snapshot.docs.map(doc =>
          convertFirestoreInvitation(doc.id, doc.data())
        )
        setInvitations(invitationData)
      }, (error) => {
        console.warn('⚠️ Firestore not available for invitations, using localStorage fallback')
        // Load from localStorage
        const savedInvitations = localStorage.getItem(`rsvpInvitations_${wedding.id}`) || '[]'
        setInvitations(JSON.parse(savedInvitations))
      })

      // Load responses
      const responsesQuery = query(
        collection(db, 'rsvpResponses'),
        orderBy('respondedAt', 'desc')
      )

      const unsubscribeResponses = onSnapshot(responsesQuery, (snapshot) => {
        const responseData = snapshot.docs.map(doc =>
          convertFirestoreResponse(doc.id, doc.data())
        ).filter(response => {
          // Filter responses for this wedding's guests
          return response.guestId
        })
        setResponses(responseData)
      }, (error) => {
        console.warn('⚠️ Firestore not available for responses, using localStorage fallback')
        // Load from localStorage
        const savedResponses = localStorage.getItem(`rsvpResponses_${wedding.id}`) || '[]'
        setResponses(JSON.parse(savedResponses))
      })

      // Load templates
      const templatesQuery = query(
        collection(db, 'rsvpTemplates'),
        orderBy('createdAt', 'desc')
      )

      const unsubscribeTemplates = onSnapshot(templatesQuery, (snapshot) => {
        const templateData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date()
        })) as RSVPTemplate[]
        setTemplates(templateData)
      }, (error) => {
        console.warn('⚠️ Firestore not available for templates, using default templates')
        setTemplates(getDefaultTemplates())
      })

      // Load settings
      const settingsQuery = query(
        collection(db, 'rsvpSettings'),
        where('weddingId', '==', wedding.id)
      )

      const unsubscribeSettings = onSnapshot(settingsQuery, (snapshot) => {
        if (!snapshot.empty) {
          const settingsDoc = snapshot.docs[0]
          const settingsData = {
            id: settingsDoc.id,
            ...settingsDoc.data(),
            rsvpDeadline: settingsDoc.data().rsvpDeadline?.toDate() || new Date(),
            createdAt: settingsDoc.data().createdAt?.toDate() || new Date(),
            updatedAt: settingsDoc.data().updatedAt?.toDate() || new Date()
          } as RSVPSettings
          setSettings(settingsData)
        } else {
          setSettings(getDefaultSettings(wedding.id))
        }
      }, (error) => {
        console.warn('⚠️ Firestore not available for settings, using default settings')
        setSettings(getDefaultSettings(wedding.id))
      })

      setLoading(false)

      return () => {
        unsubscribeInvitations()
        unsubscribeResponses()
        unsubscribeTemplates()
        unsubscribeSettings()
      }
    } catch (error) {
      console.error('Error loading RSVP data:', error)
      setError('Chyba při načítání RSVP dat')
      setLoading(false)
    }
  }, [wedding])

  // Generate unique invitation code
  const generateInvitationCode = (): string => {
    return Math.random().toString(36).substr(2, 9).toUpperCase()
  }

  // Get default templates
  const getDefaultTemplates = (): RSVPTemplate[] => [
    {
      id: 'default-invitation',
      name: 'Základní pozvánka',
      subject: 'Pozvánka na svatbu {{brideName}} & {{groomName}}',
      htmlContent: `
        <h2>Milý/á {{guestName}},</h2>
        <p>S radostí vás zveme na naši svatbu!</p>
        <p><strong>Datum:</strong> {{weddingDate}}</p>
        <p><strong>Místo:</strong> {{venueName}}</p>
        <p>{{customMessage}}</p>
        <p>Prosíme o potvrzení účasti do {{rsvpDeadline}}.</p>
        <a href="{{rsvpLink}}" style="background: #F8BBD9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Potvrdit účast</a>
        <p>Těšíme se na vás!</p>
        <p>{{brideName}} & {{groomName}}</p>
      `,
      textContent: `
        Milý/á {{guestName}},

        S radostí vás zveme na naši svatbu!

        Datum: {{weddingDate}}
        Místo: {{venueName}}

        {{customMessage}}

        Prosíme o potvrzení účasti do {{rsvpDeadline}}.
        Potvrdit můžete na: {{rsvpLink}}

        Těšíme se na vás!
        {{brideName}} & {{groomName}}
      `,
      isDefault: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]

  // Get default settings
  const getDefaultSettings = (weddingId: string): RSVPSettings => ({
    id: 'default-settings',
    weddingId,
    isEnabled: true,
    rsvpDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    allowPlusOnes: true,
    requireDietaryInfo: true,
    requireAccommodationInfo: false,
    senderName: 'Svatební pár',
    senderEmail: 'svatba@example.com',
    replyToEmail: 'svatba@example.com',
    sendReminders: true,
    reminderDays: [14, 7, 3],
    maxReminders: 3,
    welcomeMessage: 'Vítejte na naší svatební stránce!',
    thankYouMessage: 'Děkujeme za potvrzení účasti!',
    customQuestions: [],
    primaryColor: '#F8BBD9',
    createdAt: new Date(),
    updatedAt: new Date()
  })

  // Calculate statistics
  const stats: RSVPStats = {
    totalInvitations: invitations.length,
    sentInvitations: invitations.filter(inv => inv.emailSent).length,
    viewedInvitations: invitations.filter(inv => inv.viewedAt).length,
    respondedInvitations: responses.length,
    attending: responses.filter(r => r.attending).length,
    notAttending: responses.filter(r => !r.attending).length,
    pending: invitations.length - responses.length,
    plusOnesInvited: invitations.filter(inv => inv.maxResponses > 1).length,
    plusOnesAttending: responses.filter(r => r.plusOneAttending).length,
    responseRate: invitations.length > 0 ? Math.round((responses.length / invitations.length) * 100) : 0,
    attendanceRate: responses.length > 0 ? Math.round((responses.filter(r => r.attending).length / responses.length) * 100) : 0,
    responsesPerDay: {}, // TODO: Calculate
    averageResponseTime: 0, // TODO: Calculate
    dietaryRestrictions: responses.filter(r => r.dietaryRestrictions && r.dietaryRestrictions.length > 0).length,
    accessibilityNeeds: 0, // Not available in current RSVPResponse type
    accommodationNeeded: responses.filter(r => r.accommodationNeeded).length,
    transportNeeded: responses.filter(r => r.transportationNeeded).length
  }

  // Placeholder implementations
  const createInvitation = async (guestId: string, templateId?: string): Promise<RSVPInvitation> => {
    // TODO: Implement
    throw new Error('Not implemented')
  }

  const sendInvitation = async (invitationId: string): Promise<void> => {
    // TODO: Implement email sending
    console.log('Sending invitation:', invitationId)
  }

  const sendBulkInvitations = async (guestIds: string[], templateId?: string): Promise<void> => {
    // TODO: Implement bulk sending
    console.log('Sending bulk invitations to:', guestIds)
  }

  const sendReminder = async (invitationId: string): Promise<void> => {
    // TODO: Implement reminder sending
    console.log('Sending reminder for:', invitationId)
  }

  const submitRSVP = async (invitationCode: string, formData: PublicRSVPForm): Promise<void> => {
    // TODO: Implement public RSVP submission
    console.log('Submitting RSVP:', invitationCode, formData)
  }

  const updateResponse = async (responseId: string, updates: Partial<RSVPResponse>): Promise<void> => {
    // TODO: Implement response updates
    console.log('Updating response:', responseId, updates)
  }

  const createTemplate = async (template: Omit<RSVPTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<RSVPTemplate> => {
    // TODO: Implement template creation
    throw new Error('Not implemented')
  }

  const updateTemplate = async (templateId: string, updates: Partial<RSVPTemplate>): Promise<void> => {
    // TODO: Implement template updates
    console.log('Updating template:', templateId, updates)
  }

  const deleteTemplate = async (templateId: string): Promise<void> => {
    // TODO: Implement template deletion
    console.log('Deleting template:', templateId)
  }

  const updateSettings = async (updates: Partial<RSVPSettings>): Promise<void> => {
    // TODO: Implement settings updates
    console.log('Updating RSVP settings:', updates)
  }

  const getInvitationByCode = (code: string): RSVPInvitation | null => {
    return invitations.find(inv => inv.invitationCode === code) || null
  }

  const getResponseByInvitation = (invitationId: string): RSVPResponse | null => {
    // Find invitation first, then find response by guestId
    const invitation = invitations.find(inv => inv.id === invitationId)
    if (!invitation) return null
    return responses.find(resp => resp.guestId === invitation.guestId) || null
  }

  const validateRSVPDeadline = (): boolean => {
    if (!settings) return true
    return new Date() <= settings.rsvpDeadline
  }

  const clearError = () => setError(null)

  return {
    invitations,
    responses,
    templates,
    settings,
    loading,
    error,
    stats,
    createInvitation,
    sendInvitation,
    sendBulkInvitations,
    sendReminder,
    submitRSVP,
    updateResponse,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    updateSettings,
    generateInvitationCode,
    getInvitationByCode,
    getResponseByInvitation,
    validateRSVPDeadline,
    clearError
  }
}
