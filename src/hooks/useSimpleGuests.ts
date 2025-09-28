'use client'

import { useState, useEffect, useCallback } from 'react'
import { Guest, GuestFormData } from '@/types/guest'
import { useAuth } from '@/hooks/useAuth'
import { useWedding } from '@/hooks/useWedding'
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot 
} from 'firebase/firestore'
import { db } from '@/config/firebase'

// Demo guests data
const getDemoGuests = (): Guest[] => [
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

export function useSimpleGuests() {
  console.log('🚀 useSimpleGuests hook called!')

  const { user } = useAuth()
  const { wedding } = useWedding()
  const [guests, setGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(true) // Start with loading true
  const [error, setError] = useState<string | null>(null)

  // Determine if this is a demo user
  const isDemoUser = user?.id === 'demo-user-id' || user?.email === 'demo@svatbot.cz' || wedding?.id === 'demo-wedding'

  // Debug current state
  console.log('🔍 SimpleGuests state:', {
    user: user?.email,
    wedding: wedding?.id,
    isDemoUser,
    loading,
    guestsCount: guests.length
  })

  // Initialize data
  useEffect(() => {
    console.log('🔄 SimpleGuests useEffect triggered:', {
      wedding: wedding?.id,
      isDemoUser,
      loading
    })

    if (!wedding) {
      console.log('❌ No wedding, skipping initialization')
      setLoading(false)
      return
    }

    if (!loading) {
      console.log('✅ Already loaded, skipping')
      return
    }

    console.log('🔄 Initializing guests for:', isDemoUser ? 'DEMO' : 'REAL', 'user')

    if (isDemoUser) {
      // Demo user - load from localStorage or use defaults
      const storageKey = 'simple-demo-guests'
      const saved = localStorage.getItem(storageKey)
      
      if (saved) {
        try {
          const parsedGuests = JSON.parse(saved)
          console.log('📦 Loaded demo guests from localStorage:', parsedGuests.length)
          setGuests(parsedGuests)
        } catch {
          console.log('🎭 Using default demo guests')
          const defaultGuests = getDemoGuests()
          setGuests(defaultGuests)
          localStorage.setItem(storageKey, JSON.stringify(defaultGuests))
        }
      } else {
        console.log('🎭 Creating initial demo guests')
        const defaultGuests = getDemoGuests()
        setGuests(defaultGuests)
        localStorage.setItem(storageKey, JSON.stringify(defaultGuests))
      }
      setLoading(false)
    } else {
      // Real user - try localStorage first, then Firestore
      console.log('🔥 Real user - checking localStorage first')

      const storageKey = `guests_${wedding.id}`
      const saved = localStorage.getItem(storageKey)

      if (saved) {
        try {
          const parsedGuests = JSON.parse(saved)
          console.log('📦 Found guests in localStorage:', parsedGuests.length)
          setGuests(parsedGuests)
          setLoading(false)
          return
        } catch (error) {
          console.log('📦 Invalid localStorage data, trying Firestore')
        }
      } else {
        console.log('📦 No localStorage data, trying Firestore')
      }

      // Try Firestore
      try {
        console.log('🔥 Setting up Firestore listener for wedding:', wedding.id)

        const guestsQuery = query(
          collection(db, 'guests'),
          where('weddingId', '==', wedding.id)
        )

        const unsubscribe = onSnapshot(guestsQuery, (snapshot) => {
          const firestoreGuests = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Guest[]

          console.log('🔥 Loaded guests from Firestore:', firestoreGuests.length)
          setGuests(firestoreGuests)
          setLoading(false)

          // Save to localStorage for next time
          localStorage.setItem(storageKey, JSON.stringify(firestoreGuests))
        }, (error) => {
          console.warn('⚠️ Firestore failed:', error.message)

          // Final fallback - empty list
          console.log('📦 Using empty guest list')
          setGuests([])
          setLoading(false)
        })

        return () => {
          console.log('🧹 Cleaning up Firestore listener')
          unsubscribe()
        }
      } catch (error) {
        console.error('❌ Failed to setup Firestore listener:', error)

        // Final fallback
        console.log('📦 Final fallback - empty guest list')
        setGuests([])
        setLoading(false)
      }
    }
  }, [wedding?.id, isDemoUser, loading])

  // Update guest
  const updateGuest = useCallback(async (guestId: string, updates: Partial<Guest>): Promise<void> => {
    console.log('✏️ Updating guest:', guestId, updates)

    // Find current guest
    const currentGuest = guests.find(g => g.id === guestId)
    if (!currentGuest) {
      console.error('❌ Guest not found:', guestId)
      return
    }

    // Create updated guest
    const updatedGuest = { ...currentGuest, ...updates, updatedAt: new Date() }

    // Update local state immediately
    const updatedGuests = guests.map(guest =>
      guest.id === guestId ? updatedGuest : guest
    )

    console.log('🔄 Setting updated guests:', updatedGuests.length)
    setGuests(updatedGuests)

    // Save to storage (without awaiting to avoid blocking UI)
    if (isDemoUser) {
      localStorage.setItem('simple-demo-guests', JSON.stringify(updatedGuests))
      console.log('✅ Demo guest updated in localStorage')
    } else {
      // Save to localStorage immediately for instant persistence
      const storageKey = `guests_${wedding?.id}`
      localStorage.setItem(storageKey, JSON.stringify(updatedGuests))
      console.log('✅ Guest saved to localStorage')

      // Try Firestore in background (don't await)
      try {
        const guestRef = doc(db, 'guests', guestId)
        updateDoc(guestRef, { ...updates, updatedAt: new Date() }).then(() => {
          console.log('✅ Guest synced to Firestore')
        }).catch((error) => {
          console.warn('⚠️ Firestore sync failed:', error.message)
        })
      } catch (error) {
        console.warn('⚠️ Firestore update setup failed:', error)
      }
    }
  }, [guests, isDemoUser, wedding?.id])

  // Create guest
  const createGuest = useCallback(async (data: GuestFormData): Promise<Guest> => {
    const newGuest: Guest = {
      id: isDemoUser ? `demo-guest-${Date.now()}` : `temp-${Date.now()}`,
      weddingId: wedding?.id || '',
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
      createdBy: user?.id || ''
    }

    // Update local state immediately
    const updatedGuests = [...guests, newGuest]
    setGuests(updatedGuests)

    if (isDemoUser) {
      // Demo user - save to localStorage
      localStorage.setItem('simple-demo-guests', JSON.stringify(updatedGuests))
      console.log('✅ Demo guest created in localStorage')
    } else {
      // Real user - try Firestore
      try {
        const docRef = await addDoc(collection(db, 'guests'), newGuest)
        // Update with real ID
        const finalGuest = { ...newGuest, id: docRef.id }
        const finalGuests = updatedGuests.map(g => g.id === newGuest.id ? finalGuest : g)
        setGuests(finalGuests)
        console.log('✅ Guest created in Firestore')
      } catch (error) {
        console.warn('⚠️ Firestore create failed, keeping in localStorage')
        const storageKey = `guests_${wedding?.id}`
        localStorage.setItem(storageKey, JSON.stringify(updatedGuests))
      }
    }

    return newGuest
  }, [guests, isDemoUser, wedding?.id, user?.id])

  // Calculate stats
  const stats = {
    total: guests.length,
    attending: guests.filter(g => g.rsvpStatus === 'attending').length,
    declined: guests.filter(g => g.rsvpStatus === 'declined').length,
    pending: guests.filter(g => g.rsvpStatus === 'pending').length,
    maybe: guests.filter(g => g.rsvpStatus === 'maybe').length,
    totalWithPlusOnes: guests.filter(g => g.hasPlusOne).length,
    plusOnesAttending: guests.filter(g => g.hasPlusOne && g.plusOneRsvpStatus === 'attending').length,
    plusOnes: guests.filter(g => g.hasPlusOne).length,
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
    loading,
    error,
    stats,
    createGuest,
    updateGuest,
    // Dummy functions for compatibility
    deleteGuest: async () => {},
    updateRSVP: async () => {},
    bulkOperation: async () => {},
    importGuests: async () => {},
    exportGuests: async () => {},
    getFilteredGuests: () => guests,
    getGuestsByCategory: (category: string) => guests.filter(g => g.category === category),
    sendInvitations: async () => {},
    sendReminders: async () => {},
    reorderGuests: async () => {},
    clearError: () => setError(null)
  }
}
