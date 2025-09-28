'use client'

import { useState, useCallback } from 'react'
import { Guest, GuestFormData } from '@/types/guest'

const DEMO_GUESTS_KEY = 'demo-guests'

// Initial demo guests data
const getInitialDemoGuests = (): Guest[] => [
  {
    id: 'demo-guest-1',
    weddingId: 'demo-wedding',
    firstName: 'Jan',
    lastName: 'Novák',
    email: 'jan.novak@email.cz',
    phone: '+420 123 456 789',
    category: 'family-bride',
    invitationType: 'ceremony-reception',
    rsvpStatus: 'attending',
    rsvpDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    hasPlusOne: true,
    plusOneName: 'Marie Nováková',
    plusOneRsvpStatus: 'attending',
    hasChildren: true,
    children: [
      { name: 'Tomáš Novák', age: 8 },
      { name: 'Anna Nováková', age: 5 }
    ],
    dietaryRestrictions: [],
    preferredContactMethod: 'email',
    language: 'cs',
    invitationSent: true,
    invitationMethod: 'sent',
    invitationSentDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    reminderSent: false,
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    createdBy: 'demo-user-id'
  },
  {
    id: 'demo-guest-2',
    weddingId: 'demo-wedding',
    firstName: 'Pavel',
    lastName: 'Svoboda',
    email: 'pavel.svoboda@email.cz',
    phone: '+420 987 654 321',
    category: 'friends-groom',
    invitationType: 'ceremony-reception',
    rsvpStatus: 'attending',
    rsvpDate: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
    hasPlusOne: false,
    hasChildren: false,
    children: [],
    dietaryRestrictions: ['vegetarian'],
    preferredContactMethod: 'phone',
    language: 'cs',
    invitationSent: true,
    invitationMethod: 'delivered_personally',
    invitationSentDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
    reminderSent: false,
    createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    createdBy: 'demo-user-id'
  },
  {
    id: 'demo-guest-3',
    weddingId: 'demo-wedding',
    firstName: 'Anna',
    lastName: 'Krásná',
    email: 'anna.krasna@email.cz',
    category: 'friends-bride',
    invitationType: 'ceremony-reception',
    rsvpStatus: 'maybe',
    hasPlusOne: true,
    plusOneName: 'Tomáš Krásný',
    hasChildren: true,
    children: [
      { name: 'Lukáš Krásný', age: 12 }
    ],
    dietaryRestrictions: [],
    preferredContactMethod: 'email',
    language: 'cs',
    invitationSent: true,
    invitationMethod: 'sent',
    invitationSentDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    reminderSent: false,
    createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    createdBy: 'demo-user-id'
  },
  {
    id: 'demo-guest-4',
    weddingId: 'demo-wedding',
    firstName: 'Tomáš',
    lastName: 'Veselý',
    email: 'tomas.vesely@email.cz',
    phone: '+420 555 123 456',
    category: 'colleagues-bride',
    invitationType: 'reception-only',
    rsvpStatus: 'declined',
    rsvpDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    hasPlusOne: false,
    hasChildren: false,
    children: [],
    dietaryRestrictions: [],
    preferredContactMethod: 'phone',
    language: 'cs',
    invitationSent: true,
    invitationMethod: 'sent',
    invitationSentDate: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
    reminderSent: true,
    reminderSentDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 42 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    createdBy: 'demo-user-id'
  }
]

export function useDemoGuests(isActive: boolean = true) {
  // Initialize from localStorage or use default data
  const [guests, setGuests] = useState<Guest[]>(() => {
    if (!isActive || typeof window === 'undefined') return []

    const saved = localStorage.getItem(DEMO_GUESTS_KEY)
    if (saved) {
      try {
        console.log('🎭 Loading demo guests from localStorage')
        return JSON.parse(saved)
      } catch {
        return getInitialDemoGuests()
      }
    }

    console.log('🎭 Creating initial demo guests')
    const initial = getInitialDemoGuests()
    localStorage.setItem(DEMO_GUESTS_KEY, JSON.stringify(initial))
    return initial
  })

  // Update guest
  const updateGuest = useCallback(async (guestId: string, updates: Partial<Guest>): Promise<void> => {
    if (!isActive) return

    console.log('🎭 Demo updateGuest called:', guestId, updates)

    const updatedGuests = guests.map(guest =>
      guest.id === guestId
        ? { ...guest, ...updates, updatedAt: new Date() }
        : guest
    )

    setGuests(updatedGuests)
    localStorage.setItem(DEMO_GUESTS_KEY, JSON.stringify(updatedGuests))

    console.log('✅ Demo guest updated immediately')
  }, [guests, isActive])

  // Create guest
  const createGuest = useCallback(async (data: GuestFormData): Promise<Guest> => {
    const newGuest: Guest = {
      id: `demo-guest-${Date.now()}`,
      weddingId: 'demo-wedding',
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      address: data.address,
      category: data.category,
      invitationType: data.invitationType,
      rsvpStatus: 'pending',
      hasPlusOne: data.hasPlusOne,
      plusOneName: data.plusOneName,
      hasChildren: data.hasChildren || false,
      children: data.children || [],
      dietaryRestrictions: data.dietaryRestrictions,
      dietaryNotes: data.dietaryNotes,
      accessibilityNeeds: data.accessibilityNeeds,
      accommodationNeeds: data.accommodationNeeds,
      preferredContactMethod: data.preferredContactMethod,
      language: data.language,
      notes: data.notes,
      invitationSent: data.invitationSent || false,
      invitationMethod: data.invitationMethod,
      reminderSent: false,
      sortOrder: guests.length,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'demo-user-id'
    }

    const updatedGuests = [...guests, newGuest]
    setGuests(updatedGuests)
    localStorage.setItem(DEMO_GUESTS_KEY, JSON.stringify(updatedGuests))

    return newGuest
  }, [guests])

  // Delete guest
  const deleteGuest = useCallback(async (guestId: string): Promise<void> => {
    const updatedGuests = guests.filter(guest => guest.id !== guestId)
    setGuests(updatedGuests)
    localStorage.setItem(DEMO_GUESTS_KEY, JSON.stringify(updatedGuests))
  }, [guests])

  // Calculate stats
  const totalAttendees = guests.reduce((total, guest) => {
    let count = 1 // The guest themselves
    if (guest.hasPlusOne) count += 1 // Add plus one regardless of RSVP status for total count
    if (guest.hasChildren && guest.children) {
      count += guest.children.length // Add children regardless of RSVP status for total count
    }
    return total + count
  }, 0)

  const totalChildren = guests.reduce((total, guest) => {
    return total + (guest.children?.length || 0)
  }, 0)

  const stats = {
    total: totalAttendees,
    attending: guests.filter(g => g.rsvpStatus === 'attending').length,
    declined: guests.filter(g => g.rsvpStatus === 'declined').length,
    pending: guests.filter(g => g.rsvpStatus === 'pending').length,
    maybe: guests.filter(g => g.rsvpStatus === 'maybe').length,
    totalWithPlusOnes: guests.filter(g => g.hasPlusOne).length,
    plusOnesAttending: guests.filter(g => g.hasPlusOne && g.plusOneRsvpStatus === 'attending').length,
    plusOnes: guests.filter(g => g.hasPlusOne).length,
    totalWithChildren: guests.filter(g => g.hasChildren && g.children && g.children.length > 0).length,
    totalChildren: totalChildren,
    byCategory: guests.reduce((acc, guest) => {
      acc[guest.category] = (acc[guest.category] || 0) + 1
      return acc
    }, {} as Record<string, number>),
    ceremonyOnly: guests.filter(g => g.invitationType === 'ceremony-only').length,
    receptionOnly: guests.filter(g => g.invitationType === 'reception-only').length,
    ceremonyAndReception: guests.filter(g => g.invitationType === 'ceremony-reception').length,
    dietaryRestrictions: {} as any,
    accessibilityNeeds: guests.filter(g => g.accessibilityNeeds).length,
    accommodationNeeds: guests.filter(g => g.accommodationNeeds).length,
    invited: guests.filter(g => g.invitationSent).length
  }

  return {
    guests,
    loading: false,
    error: null,
    stats,
    createGuest,
    updateGuest,
    deleteGuest,
    // Dummy functions for compatibility
    updateRSVP: async () => {},
    bulkOperation: async () => {},
    importGuests: async () => {},
    exportGuests: async () => {},
    getFilteredGuests: () => guests,
    getGuestsByCategory: (category: string) => guests.filter(g => g.category === category),
    sendInvitations: async () => {},
    sendReminders: async () => {},
    reorderGuests: async () => {},
    clearError: () => {}
  }
}
