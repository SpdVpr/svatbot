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
    hasAccommodation: true,
    accommodationType: 'double',
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
    hasAccommodation: false,
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
    hasAccommodation: true,
    accommodationType: 'suite',
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
    hasAccommodation: false,
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
  console.log('🚀 useRobustGuests hook called!')
  
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
  
  // Update ref when guests change (but don't cause re-renders)
  guestsRef.current = guests

  // Determine if this is a demo user (stable calculation)
  const isDemoUser = user?.id === 'demo-user-id' || user?.email === 'demo@svatbot.cz' || wedding?.id === 'demo-wedding'

  console.log('🔍 RobustGuests state:', {
    user: user?.email,
    wedding: wedding?.id,
    isDemoUser,
    loading,
    guestsCount: guests.length,
    initRef: initializationRef.current
  })

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

    if (isDemoUserInEffect) {
      // Demo user - try original demo key first, then robust key
      const originalDemoKey = 'simple-demo-guests'
      const robustDemoKey = 'robust-demo-guests'

      let saved = localStorage.getItem(originalDemoKey)
      let keyUsed = originalDemoKey

      if (!saved) {
        saved = localStorage.getItem(robustDemoKey)
        keyUsed = robustDemoKey
      }

      if (saved) {
        try {
          const parsedGuests = JSON.parse(saved)
          console.log('📦 Loaded demo guests from localStorage:', parsedGuests.length, 'using key:', keyUsed)
          setGuests(parsedGuests)

          // Migrate to robust key if using original
          if (keyUsed === originalDemoKey) {
            localStorage.setItem(robustDemoKey, saved)
            console.log('📦 Migrated demo data to robust key')
          }
        } catch {
          console.log('🎭 Invalid demo data, using defaults')
          const defaultGuests = getDemoGuests()
          setGuests(defaultGuests)
          localStorage.setItem(robustDemoKey, JSON.stringify(defaultGuests))
        }
      } else {
        console.log('🎭 Creating initial demo guests')
        const defaultGuests = getDemoGuests()
        setGuests(defaultGuests)
        localStorage.setItem(robustDemoKey, JSON.stringify(defaultGuests))
      }
      setLoading(false)
    } else {
      // Real user - load from Firestore with real-time listener
      console.log('🔥 Setting up Firebase listener for real user')

      // Import Firebase modules dynamically
      import('@/config/firebase').then(({ db }) => {
        import('firebase/firestore').then(({ collection, query, where, onSnapshot }) => {
          const guestsQuery = query(
            collection(db, 'guests'),
            where('weddingId', '==', currentWeddingId)
          )

          const unsubscribe = onSnapshot(guestsQuery, (snapshot) => {
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
                hasPlusOne: data.hasPlusOne,
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
                hasAccommodation: data.hasAccommodation || false,
                accommodationType: data.accommodationType,
                accommodationPayment: data.accommodationPayment,
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
            console.warn('🔥 Firestore snapshot error, using localStorage fallback:', error)
            // Fallback to localStorage
            const originalKey = `guests_${currentWeddingId}`
            const robustKey = `robust-guests_${currentWeddingId}`

            let saved = localStorage.getItem(originalKey) || localStorage.getItem(robustKey)

            if (saved) {
              try {
                const parsedGuests = JSON.parse(saved)
                console.log('📦 Loaded guests from localStorage fallback:', parsedGuests.length)
                setGuests(parsedGuests)
                guestsRef.current = parsedGuests
              } catch {
                console.log('📦 Invalid localStorage fallback data')
                setGuests([])
                guestsRef.current = []
              }
            } else {
              console.log('📦 No fallback data available')
              setGuests([])
              guestsRef.current = []
            }
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
    }

    // Return cleanup function
    return () => {
      if (cleanup) {
        cleanup()
      }
    }
  }, [wedding?.id]) // Only depend on wedding ID - isDemoUser is calculated inside

  // Update guest function
  const updateGuest = useCallback(async (guestId: string, updates: Partial<Guest>): Promise<void> => {
    console.log('✏️ Updating guest:', guestId, updates)
    
    // Get current guests from ref to avoid stale closure
    const currentGuests = guestsRef.current
    const currentGuest = currentGuests.find(g => g.id === guestId)
    
    if (!currentGuest) {
      console.error('❌ Guest not found:', guestId)
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
    
    console.log('🔄 Setting updated guests:', updatedGuests.length)
    setGuests(updatedGuests)

    // Save to localStorage immediately (use compatible keys)
    const storageKey = isDemoUser ? 'simple-demo-guests' : `guests_${wedding?.id}`
    localStorage.setItem(storageKey, JSON.stringify(updatedGuests))
    console.log('✅ Guest saved to localStorage with key:', storageKey)

    // For real users, try Firestore sync in background (don't block UI)
    if (!isDemoUser) {
      // Import Firestore dynamically to avoid blocking
      import('@/config/firebase').then(({ db }) => {
        import('firebase/firestore').then(({ doc, updateDoc }) => {
          const guestRef = doc(db, 'guests', guestId)
          updateDoc(guestRef, cleanedUpdates).then(() => {
            console.log('✅ Guest synced to Firestore')
          }).catch((error) => {
            console.warn('⚠️ Firestore sync failed:', error.message)
          })
        })
      }).catch((error) => {
        console.warn('⚠️ Failed to load Firestore modules:', error)
      })
    }
  }, [isDemoUser, wedding?.id])

  // Create guest function
  const createGuest = useCallback(async (data: GuestFormData): Promise<Guest> => {
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
      hasAccommodation: data.hasAccommodation || false,
      accommodationType: data.accommodationType,
      accommodationPayment: data.accommodationPayment,
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
          }).catch((error) => {
            console.warn('⚠️ Firestore sync failed for new guest:', error.message)
          })
        })
      }).catch((error) => {
        console.warn('⚠️ Failed to load Firestore modules:', error)
      })
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
