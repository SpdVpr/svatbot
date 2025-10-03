'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Guest, GuestFormData } from '@/types/guest'
import { useAuth } from '@/hooks/useAuth'
import { useWedding } from '@/hooks/useWedding'

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
    accommodationInterest: 'interested',
    accommodationType: 'dvoulůžkový pokoj',
    accommodationPayment: 'paid_by_guest',
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
    accommodationInterest: 'not_interested',
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
    accommodationInterest: 'interested',
    accommodationType: 'apartmán s výhledem',
    accommodationPayment: 'paid_by_couple',
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
    accommodationInterest: 'not_interested',
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

// Clean undefined values from object for Firestore
const cleanForFirestore = (obj: any): any => {
  const cleaned: any = {}
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      // Handle arrays (like children)
      if (Array.isArray(value)) {
        cleaned[key] = value.map(item =>
          typeof item === 'object' && item !== null ? cleanForFirestore(item) : item
        )
      }
      // Handle nested objects
      else if (typeof value === 'object' && value !== null && !(value instanceof Date)) {
        cleaned[key] = cleanForFirestore(value)
      }
      // Handle primitive values
      else {
        cleaned[key] = value
      }
    }
  }
  return cleaned
}

export function useRobustGuests() {
  const { user } = useAuth()
  const { wedding } = useWedding()
  const [guests, setGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Use refs to prevent infinite re-renders
  const initializationRef = useRef<{
    weddingId: string | null
    initialized: boolean
  }>({ weddingId: null, initialized: false })
  
  const guestsRef = useRef<Guest[]>([])
  const isSavingRef = useRef(false)

  // Update ref when guests change (but don't cause re-renders)
  guestsRef.current = guests

  // Determine if this is a demo user (stable calculation)
  const isDemoUser = user?.email === 'demo@svatbot.cz' || wedding?.id === 'demo-wedding'

  // Initialize data - ONLY ONCE per wedding
  useEffect(() => {
    const currentWeddingId = wedding?.id || null
    // Calculate isDemoUser inside useEffect to avoid dependency issues
    const isDemoUserInEffect = user?.id === 'demo-user-id' || user?.email === 'demo@svatbot.cz' || wedding?.id === 'demo-wedding'

    console.log('🔄 RobustGuests useEffect triggered:', {
      currentWeddingId,
      refWeddingId: initializationRef.current.weddingId,
      initialized: initializationRef.current.initialized,
      isDemoUser: isDemoUserInEffect,
      loading
    })

    // Skip if no wedding
    if (!currentWeddingId) {
      console.log('❌ No wedding, resetting state')
      setGuests([])
      setLoading(false)
      initializationRef.current = { weddingId: null, initialized: false }
      return
    }

    // Skip if already initialized for this wedding
    if (initializationRef.current.weddingId === currentWeddingId && initializationRef.current.initialized) {
      console.log('✅ Already initialized for this wedding, skipping')
      return
    }

    console.log('🔄 Initializing guests for:', isDemoUserInEffect ? 'DEMO' : 'REAL', 'user')

    // Mark as initialized for this wedding IMMEDIATELY to prevent re-runs
    initializationRef.current = { weddingId: currentWeddingId, initialized: true }
    setLoading(true)

    // Store cleanup function for Firebase listener
    let cleanup: (() => void) | null = null

    // All users (including demo) load from Firestore with real-time listener
    console.log('🔥 Setting up Firebase listener for wedding:', currentWeddingId)

    // Import Firebase modules dynamically
    import('@/config/firebase').then(({ db }) => {
        import('firebase/firestore').then(({ collection, query, where, onSnapshot }) => {
          const guestsQuery = query(
            collection(db, 'guests'),
            where('weddingId', '==', currentWeddingId)
          )

          const unsubscribe = onSnapshot(guestsQuery, (snapshot) => {
            // Skip updates during saving to prevent overwriting local changes
            if (isSavingRef.current) {
              console.log('🔥 Skipping Firestore update during save operation')
              return
            }

            const loadedGuests = snapshot.docs.map(doc => {
              const data = doc.data()
              return {
                id: doc.id,
                weddingId: data.weddingId,
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                phone: data.phone,
                address: data.address,
                category: data.category,
                invitationType: data.invitationType,
                rsvpStatus: data.rsvpStatus,
                rsvpDate: data.rsvpDate ? data.rsvpDate.toDate() : undefined,
                hasPlusOne: data.hasPlusOne || false,
                plusOneName: data.plusOneName,
                plusOneRsvpStatus: data.plusOneRsvpStatus,
                hasChildren: data.hasChildren || false,
                children: data.children || [],
                dietaryRestrictions: data.dietaryRestrictions || [],
                dietaryNotes: data.dietaryNotes,
                accessibilityNeeds: data.accessibilityNeeds,
                accommodationNeeds: data.accommodationNeeds,
                preferredContactMethod: data.preferredContactMethod,
                language: data.language,
                notes: data.notes,
                accommodationInterest: data.accommodationInterest || 'not_interested',
                accommodationType: data.accommodationType,
                accommodationPayment: data.accommodationPayment,
                accommodationId: data.accommodationId,
                roomId: data.roomId,
                invitationSent: data.invitationSent,
                invitationMethod: data.invitationMethod,
                invitationSentDate: data.invitationSentDate ? data.invitationSentDate.toDate() : undefined,
                reminderSent: data.reminderSent,
                reminderSentDate: data.reminderSentDate ? data.reminderSentDate.toDate() : undefined,
                sortOrder: data.sortOrder,
                createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
                updatedAt: data.updatedAt ? data.updatedAt.toDate() : new Date(),
                createdBy: data.createdBy
              }
            })

            // Sort by sortOrder
            loadedGuests.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
            console.log('🔥 Loaded guests from Firestore:', loadedGuests.length)
            setGuests(loadedGuests)
            guestsRef.current = loadedGuests
            setLoading(false)
          }, (error) => {
            console.error('❌ Firestore snapshot error:', error)
            setGuests([])
            guestsRef.current = []
            setLoading(false)
          })

          // Store cleanup function
          cleanup = () => unsubscribe()
        }).catch((error) => {
          console.error('❌ Failed to load Firestore modules:', error)
          setGuests([])
          setLoading(false)
        })
      }).catch((error) => {
        console.error('❌ Failed to load Firebase config:', error)
        setGuests([])
        setLoading(false)
      })

    // Return cleanup function
    return () => {
      if (cleanup) {
        cleanup()
      }
    }
  }, [wedding?.id]) // Only depend on wedding ID - isDemoUser is calculated inside

  // Update guest function
  const updateGuest = useCallback(async (guestId: string, updates: Partial<Guest>): Promise<void> => {
    console.log('✏️ useRobustGuests: Updating guest:', guestId)

    isSavingRef.current = true
    
    // Get current guests from ref to avoid stale closure
    const currentGuests = guestsRef.current
    const currentGuest = currentGuests.find(g => g.id === guestId)
    
    if (!currentGuest) {
      console.error('❌ useRobustGuests: Guest not found:', guestId)
      return
    }


    
    // Clean updates for Firestore (remove undefined values)
    const cleanedUpdates = cleanForFirestore(updates)

    // Create updated guest
    const updatedGuest = { ...currentGuest, ...cleanedUpdates, updatedAt: new Date() }
    
    // Update local state immediately
    const updatedGuests = currentGuests.map(guest =>
      guest.id === guestId ? updatedGuest : guest
    )
    
    console.log('🔄 useRobustGuests: Guest updated locally')
    setGuests(updatedGuests)
    guestsRef.current = updatedGuests

    // Save to localStorage immediately (use compatible keys)
    const storageKey = isDemoUser ? 'simple-demo-guests' : `guests_${wedding?.id}`
    localStorage.setItem(storageKey, JSON.stringify(updatedGuests))
    console.log('✅ useRobustGuests: Guest saved to localStorage')

    // For real users, try Firestore sync in background (don't block UI)
    if (!isDemoUser) {
      // Import Firestore dynamically to avoid blocking
      import('@/config/firebase').then(({ db }) => {
        import('firebase/firestore').then(({ doc, updateDoc }) => {
          const guestRef = doc(db, 'guests', guestId)
          updateDoc(guestRef, cleanedUpdates).then(() => {
            console.log('✅ Guest synced to Firestore')
            // Wait a bit before allowing Firestore updates to prevent race conditions
            setTimeout(() => {
              isSavingRef.current = false
            }, 1000)
          }).catch((error) => {
            console.warn('⚠️ Firestore sync failed:', error.message)
            isSavingRef.current = false
          })
        })
      }).catch((error) => {
        console.warn('⚠️ Failed to load Firestore modules:', error)
        isSavingRef.current = false
      })
    } else {
      // Demo user - no Firestore sync needed
      isSavingRef.current = false
    }
  }, [isDemoUser, wedding?.id])

  // Create guest function
  const createGuest = useCallback(async (data: GuestFormData): Promise<Guest> => {
    isSavingRef.current = true

    // Generate unique ID
    const guestId = isDemoUser
      ? `demo-guest-${Date.now()}`
      : `guest-${user?.id || 'unknown'}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    const newGuest: Guest = {
      id: guestId,
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
      dietaryRestrictions: data.dietaryRestrictions || [],
      dietaryNotes: data.dietaryNotes,
      accessibilityNeeds: data.accessibilityNeeds,
      accommodationNeeds: data.accommodationNeeds,
      preferredContactMethod: data.preferredContactMethod,
      language: data.language,
      notes: data.notes,
      accommodationInterest: data.accommodationInterest || 'not_interested',
      accommodationType: data.accommodationType,
      accommodationPayment: data.accommodationPayment,
      accommodationId: data.accommodationId,
      roomId: data.roomId,
      invitationSent: data.invitationSent || false,
      invitationMethod: data.invitationMethod,
      reminderSent: false,
      sortOrder: guestsRef.current.length,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: user?.id || ''
    }

    // Update local state immediately
    const updatedGuests = [...guestsRef.current, newGuest]
    setGuests(updatedGuests)
    guestsRef.current = updatedGuests

    // Save to localStorage (use compatible keys)
    const storageKey = isDemoUser ? 'simple-demo-guests' : `guests_${wedding?.id}`
    localStorage.setItem(storageKey, JSON.stringify(updatedGuests))
    console.log('✅ Guest created and saved to localStorage with key:', storageKey)

    // For real users, save to Firestore
    if (!isDemoUser && user && wedding?.id) {
      // Import Firestore dynamically to avoid blocking
      import('@/config/firebase').then(({ db }) => {
        import('firebase/firestore').then(({ doc, setDoc }) => {
          const guestRef = doc(db, 'guests', newGuest.id)
          const cleanedGuest = cleanForFirestore(newGuest)
          setDoc(guestRef, cleanedGuest).then(() => {
            console.log('✅ New guest synced to Firestore')
            setTimeout(() => {
              isSavingRef.current = false
            }, 1000)
          }).catch((error) => {
            console.warn('⚠️ Firestore sync failed for new guest:', error.message)
            isSavingRef.current = false
          })
        })
      }).catch((error) => {
        console.warn('⚠️ Failed to load Firestore modules:', error)
        isSavingRef.current = false
      })
    } else {
      // Demo user - no Firestore sync needed
      isSavingRef.current = false
    }

    return newGuest
  }, [isDemoUser, wedding?.id, user?.id])

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

  // Calculate attending people (including +1 and children)
  const attendingPeople = guests.reduce((total, guest) => {
    let count = 0
    if (guest.rsvpStatus === 'attending') {
      count += 1 // Main guest
      if (guest.hasPlusOne) count += 1 // +1 automatically attends
      if (guest.hasChildren && guest.children) count += guest.children.length // Children attend
    }
    return total + count
  }, 0)

  // Calculate declined people (including +1 and children)
  const declinedPeople = guests.reduce((total, guest) => {
    let count = 0
    if (guest.rsvpStatus === 'declined') {
      count += 1 // Main guest
      if (guest.hasPlusOne) count += 1 // +1 automatically declines
      if (guest.hasChildren && guest.children) count += guest.children.length // Children decline
    }
    return total + count
  }, 0)

  // Calculate maybe people (including +1 and children)
  const maybePeople = guests.reduce((total, guest) => {
    let count = 0
    if (guest.rsvpStatus === 'maybe') {
      count += 1 // Main guest
      if (guest.hasPlusOne) count += 1 // +1 automatically maybe
      if (guest.hasChildren && guest.children) count += guest.children.length // Children maybe
    }
    return total + count
  }, 0)

  // Calculate pending people (including +1 and children)
  const pendingPeople = guests.reduce((total, guest) => {
    let count = 0
    if (guest.rsvpStatus === 'pending') {
      count += 1 // Main guest
      if (guest.hasPlusOne) count += 1 // +1 automatically pending
      if (guest.hasChildren && guest.children) count += guest.children.length // Children pending
    }
    return total + count
  }, 0)

  const stats = {
    total: totalAttendees,
    attending: attendingPeople, // Now includes +1 and children
    declined: declinedPeople, // Now includes +1 and children
    pending: pendingPeople, // Now includes +1 and children
    maybe: maybePeople, // Now includes +1 and children
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

  // Update RSVP status
  const updateRSVP = useCallback(async (guestId: string, rsvpStatus: Guest['rsvpStatus']): Promise<void> => {
    await updateGuest(guestId, {
      rsvpStatus,
      rsvpDate: new Date()
    })
  }, [updateGuest])

  // Delete guest
  const deleteGuest = useCallback(async (guestId: string): Promise<void> => {
    console.log('🗑️ useRobustGuests: Deleting guest:', guestId)
    isSavingRef.current = true

    const currentGuest = guestsRef.current.find(g => g.id === guestId)
    if (!currentGuest) {
      console.error('❌ useRobustGuests: Guest not found for deletion:', guestId)
      return
    }

    // Remove from local state
    const updatedGuests = guestsRef.current.filter(g => g.id !== guestId)
    console.log('🔄 useRobustGuests: Removing guest, new count:', updatedGuests.length)
    setGuests(updatedGuests)
    guestsRef.current = updatedGuests

    // Save to localStorage immediately
    const storageKey = isDemoUser ? 'simple-demo-guests' : `guests_${wedding?.id}`
    localStorage.setItem(storageKey, JSON.stringify(updatedGuests))
    console.log('✅ useRobustGuests: Guest deleted from localStorage')

    // Sync to Firestore if not demo user
    if (!isDemoUser && user && wedding) {
      try {
        const { deleteDoc, doc } = await import('firebase/firestore')
        const { db } = await import('@/config/firebase')
        await deleteDoc(doc(db, 'guests', guestId))
        console.log('✅ useRobustGuests: Guest deleted from Firestore')
        setTimeout(() => {
          isSavingRef.current = false
        }, 1000)
      } catch (error) {
        console.error('❌ useRobustGuests: Error deleting from Firestore:', error)
        isSavingRef.current = false
      }
    } else {
      // Demo user or no Firestore sync needed
      isSavingRef.current = false
    }
  }, [user, wedding, isDemoUser])

  return {
    guests,
    loading,
    error,
    stats,
    createGuest,
    updateGuest,
    deleteGuest,
    updateRSVP,
    bulkOperation: async () => {},
    importGuests: async () => {},
    exportGuests: async () => {},
    getFilteredGuests: () => guests,
    getGuestsByCategory: (category: string) => guests.filter(g => g.category === category),
    sendInvitations: async () => {},
    sendReminders: async () => {},
    reorderGuests: async (reorderedGuests: Guest[]) => {
      console.log('🔄 Reordering guests:', reorderedGuests.length)
      setGuests(reorderedGuests)
      guestsRef.current = reorderedGuests

      // Save to storage
      if (isDemoUser) {
        const storageKey = 'simple-demo-guests'
        localStorage.setItem(storageKey, JSON.stringify(reorderedGuests))
        console.log('✅ Demo guests reordered and saved to localStorage')
      } else if (user && wedding?.id) {
        try {
          const { doc, setDoc } = await import('firebase/firestore')
          const { db } = await import('@/config/firebase')

          const weddingRef = doc(db, 'weddings', wedding.id)
          const cleanedGuests = reorderedGuests.map(cleanForFirestore)

          await setDoc(weddingRef, { guests: cleanedGuests }, { merge: true })
          console.log('✅ Firebase guests reordered and saved')
        } catch (error) {
          console.error('❌ Error saving reordered guests to Firebase:', error)
          throw error
        }
      }
    },
    clearError: () => setError(null)
  }
}
