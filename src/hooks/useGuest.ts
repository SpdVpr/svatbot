'use client'

import { useState, useEffect, useCallback } from 'react'
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
  getDocs,
  Timestamp
} from 'firebase/firestore'
import { db } from '@/config/firebase'
import { useAuth } from './useAuth'
import { useWedding } from './useWedding'
import {
  Guest,
  GuestCategory,
  GuestFormData,
  GuestFilters,
  GuestStats,
  RSVPResponse,
  BulkGuestOperation,
  GuestImportData
} from '@/types/guest'

interface UseGuestReturn {
  guests: Guest[]
  loading: boolean
  error: string | null
  stats: GuestStats
  createGuest: (data: GuestFormData) => Promise<Guest>
  updateGuest: (guestId: string, updates: Partial<Guest>) => Promise<void>
  deleteGuest: (guestId: string) => Promise<void>
  updateRSVP: (guestId: string, rsvpStatus: Guest['rsvpStatus']) => Promise<void>
  bulkOperation: (operation: BulkGuestOperation) => Promise<void>
  importGuests: (data: GuestImportData[]) => Promise<void>
  exportGuests: (format: 'csv' | 'excel') => Promise<void>
  getFilteredGuests: (filters: GuestFilters) => Guest[]
  getGuestsByCategory: (category: string) => Guest[]
  sendInvitations: (guestIds: string[]) => Promise<void>
  sendReminders: (guestIds: string[]) => Promise<void>
  reorderGuests: (reorderedGuests: Guest[]) => Promise<void>
  clearError: () => void
}

export function useGuest(isActive: boolean = true): UseGuestReturn {
  const { user } = useAuth()
  const { wedding } = useWedding()
  const [guests, setGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dataLoaded, setDataLoaded] = useState(false)
  const [isDemoMode, setIsDemoMode] = useState(false)

  // Convert Firestore data to Guest
  const convertFirestoreGuest = (id: string, data: any): Guest => {
    return {
      id,
      weddingId: data.weddingId,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      address: data.address,
      category: data.category,
      invitationType: data.invitationType,
      rsvpStatus: data.rsvpStatus,
      rsvpDate: data.rsvpDate?.toDate(),
      hasPlusOne: data.hasPlusOne || false,
      plusOneName: data.plusOneName,
      plusOneRsvpStatus: data.plusOneRsvpStatus,
      hasChildren: data.hasChildren || false,
      children: data.children || [],
      dietaryRestrictions: data.dietaryRestrictions || [],
      dietaryNotes: data.dietaryNotes,
      accessibilityNeeds: data.accessibilityNeeds,
      accommodationNeeds: data.accommodationNeeds,
      preferredContactMethod: data.preferredContactMethod || 'email',
      language: data.language || 'cs',
      notes: data.notes,
      accommodationInterest: data.accommodationInterest,
      accommodationType: data.accommodationType,
      accommodationPayment: data.accommodationPayment,
      invitationSent: data.invitationSent || false,
      invitationMethod: data.invitationMethod,
      invitationSentDate: data.invitationSentDate?.toDate(),
      reminderSent: data.reminderSent || false,
      reminderSentDate: data.reminderSentDate?.toDate(),
      sortOrder: data.sortOrder || 0,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      createdBy: data.createdBy
    }
  }

  // Convert Guest to Firestore data
  const convertToFirestoreData = (guest: Omit<Guest, 'id'>): any => {
    return {
      weddingId: guest.weddingId,
      firstName: guest.firstName,
      lastName: guest.lastName,
      email: guest.email || null,
      phone: guest.phone || null,
      address: guest.address || null,
      category: guest.category,
      invitationType: guest.invitationType,
      rsvpStatus: guest.rsvpStatus,
      rsvpDate: guest.rsvpDate ? Timestamp.fromDate(guest.rsvpDate) : null,
      hasPlusOne: guest.hasPlusOne,
      plusOneName: guest.plusOneName || null,
      plusOneRsvpStatus: guest.plusOneRsvpStatus || null,
      dietaryRestrictions: guest.dietaryRestrictions,
      dietaryNotes: guest.dietaryNotes || null,
      accessibilityNeeds: guest.accessibilityNeeds || null,
      accommodationNeeds: guest.accommodationNeeds || null,
      preferredContactMethod: guest.preferredContactMethod,
      language: guest.language,
      notes: guest.notes || null,
      accommodationInterest: guest.accommodationInterest,
      accommodationType: guest.accommodationType,
      accommodationPayment: guest.accommodationPayment,
      invitationSent: guest.invitationSent,
      invitationMethod: guest.invitationMethod,
      invitationSentDate: guest.invitationSentDate ? Timestamp.fromDate(guest.invitationSentDate) : null,
      reminderSent: guest.reminderSent,
      reminderSentDate: guest.reminderSentDate ? Timestamp.fromDate(guest.reminderSentDate) : null,
      sortOrder: guest.sortOrder || 0,
      createdAt: Timestamp.fromDate(guest.createdAt),
      updatedAt: Timestamp.fromDate(guest.updatedAt),
      createdBy: guest.createdBy
    }
  }

  // Create new guest
  const createGuest = async (data: GuestFormData): Promise<Guest> => {
    if (!wedding || !user) {
      throw new Error('Žádná svatba nebo uživatel není vybrán')
    }

    try {
      setError(null)
      setLoading(true)

      const guestData: Omit<Guest, 'id'> = {
        weddingId: wedding.id,
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
        accommodationInterest: data.accommodationInterest || 'not_interested',
        accommodationType: data.accommodationType,
        accommodationPayment: data.accommodationPayment,
        invitationSent: data.invitationSent || false,
        invitationMethod: data.invitationMethod,
        reminderSent: false,
        sortOrder: guests.length, // Add to end
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: user.id
      }

      // Check if this is demo mode
      if (isDemoMode) {
        // Demo user - use only localStorage
        console.log('🎭 Demo user - creating guest in localStorage only')
        const localId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const newGuest: Guest = { id: localId, ...guestData }

        // Save to localStorage
        const savedGuests = localStorage.getItem(`guests_${wedding.id}`) || '[]'
        const existingGuests = JSON.parse(savedGuests)
        existingGuests.push(newGuest)
        localStorage.setItem(`guests_${wedding.id}`, JSON.stringify(existingGuests))

        // Update local state
        setGuests(prev => [...prev, newGuest])
        console.log('✅ Demo guest created in localStorage')

        return newGuest
      }

      // Regular user - try Firestore first, fallback to localStorage
      try {
        const docRef = await addDoc(collection(db, 'guests'), convertToFirestoreData(guestData))
        const newGuest: Guest = { id: docRef.id, ...guestData }

        console.log('✅ Guest created in Firestore:', newGuest)

        // Update local state immediately
        setGuests(prev => {
          const updated = [...prev, newGuest]
          console.log('👥 Updated local guests state:', updated.length, updated)
          return updated
        })

        return newGuest
      } catch (firestoreError) {
        console.warn('⚠️ Firestore not available, using localStorage fallback')
        // Create guest with local ID
        const localId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const newGuest: Guest = { id: localId, ...guestData }

        // Save to localStorage
        const savedGuests = localStorage.getItem(`guests_${wedding.id}`) || '[]'
        const existingGuests = JSON.parse(savedGuests)
        existingGuests.push(newGuest)
        localStorage.setItem(`guests_${wedding.id}`, JSON.stringify(existingGuests))

        // Update local state
        setGuests(prev => [...prev, newGuest])

        return newGuest
      }
    } catch (error: any) {
      console.error('Error creating guest:', error)
      setError('Chyba při vytváření hosta')
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Update guest
  const updateGuest = async (guestId: string, updates: Partial<Guest>): Promise<void> => {
    try {
      setError(null)

      const updatedData = {
        ...updates,
        updatedAt: new Date()
      }

      // Check if this is demo mode
      if (isDemoMode) {
        // Demo user - update both local state and localStorage synchronously
        console.log('🎭 Demo mode - updating ONLY local state (no localStorage reload)')

        // Update local state ONLY - localStorage will be updated but won't trigger reload
        const updatedGuests = guests.map(guest =>
          guest.id === guestId ? { ...guest, ...updatedData } : guest
        )
        setGuests(updatedGuests)

        // Update localStorage silently (for persistence but no reload)
        if (wedding) {
          localStorage.setItem(`guests_${wedding.id}`, JSON.stringify(updatedGuests))
          console.log('✅ Demo guest updated - localStorage updated silently')
        }
        return
      }

      // Regular user - update local state first, then try Firestore
      setGuests(prev => prev.map(guest =>
        guest.id === guestId ? { ...guest, ...updatedData } : guest
      ))

      try {
        const guestRef = doc(db, 'guests', guestId)
        await updateDoc(guestRef, convertToFirestoreData({
          ...updates,
          updatedAt: new Date()
        } as any))
        console.log('✅ Guest updated in Firestore')
      } catch (firestoreError) {
        console.warn('⚠️ Firestore not available, updating localStorage fallback')
        if (wedding) {
          const savedGuests = localStorage.getItem(`guests_${wedding.id}`) || '[]'
          const existingGuests = JSON.parse(savedGuests)
          const guestIndex = existingGuests.findIndex((g: Guest) => g.id === guestId)
          if (guestIndex !== -1) {
            existingGuests[guestIndex] = { ...existingGuests[guestIndex], ...updatedData }
            localStorage.setItem(`guests_${wedding.id}`, JSON.stringify(existingGuests))
            console.log('✅ Guest updated in localStorage fallback')
          } else {
            console.error('❌ Guest not found in localStorage:', guestId)
          }
        }
      }
    } catch (error: any) {
      console.error('Error updating guest:', error)
      setError('Chyba při aktualizaci hosta')
      throw error
    }
  }

  // Delete guest
  const deleteGuest = async (guestId: string): Promise<void> => {
    try {
      setError(null)

      try {
        // Try to delete from Firestore
        await deleteDoc(doc(db, 'guests', guestId))
      } catch (firestoreError) {
        console.warn('⚠️ Firestore not available, deleting from localStorage fallback')
        if (wedding) {
          const savedGuests = localStorage.getItem(`guests_${wedding.id}`) || '[]'
          const existingGuests = JSON.parse(savedGuests)
          const filteredGuests = existingGuests.filter((g: Guest) => g.id !== guestId)
          localStorage.setItem(`guests_${wedding.id}`, JSON.stringify(filteredGuests))
        }
      }

      // Update local state
      setGuests(prev => prev.filter(guest => guest.id !== guestId))
    } catch (error: any) {
      console.error('Error deleting guest:', error)
      setError('Chyba při mazání hosta')
      throw error
    }
  }

  // Update RSVP status
  const updateRSVP = async (guestId: string, rsvpStatus: Guest['rsvpStatus']): Promise<void> => {
    await updateGuest(guestId, {
      rsvpStatus,
      rsvpDate: new Date()
    })
  }

  // Bulk operations
  const bulkOperation = async (operation: BulkGuestOperation): Promise<void> => {
    try {
      setError(null)
      setLoading(true)

      for (const guestId of operation.guestIds) {
        switch (operation.operation) {
          case 'delete':
            await deleteGuest(guestId)
            break
          case 'update-category':
          case 'update-rsvp':
            if (operation.data) {
              await updateGuest(guestId, operation.data)
            }
            break
          case 'send-invitation':
            await updateGuest(guestId, {
              invitationSent: true,
              invitationSentDate: new Date()
            })
            break
          case 'send-reminder':
            await updateGuest(guestId, {
              reminderSent: true,
              reminderSentDate: new Date()
            })
            break
        }
      }
    } catch (error: any) {
      console.error('Error in bulk operation:', error)
      setError('Chyba při hromadné operaci')
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Import guests
  const importGuests = async (data: GuestImportData[]): Promise<void> => {
    try {
      setLoading(true)

      for (const guestData of data) {
        const formData: GuestFormData = {
          firstName: guestData.firstName,
          lastName: guestData.lastName,
          email: guestData.email,
          phone: guestData.phone,
          category: (guestData.category as any) || 'other',
          invitationType: 'ceremony-reception',
          hasPlusOne: false,
          hasChildren: false,
          children: [],
          dietaryRestrictions: [],
          preferredContactMethod: 'email',
          language: 'cs',
          notes: guestData.notes,
          accommodationInterest: 'not_interested',
          invitationSent: false,
          invitationMethod: 'sent'
        }

        await createGuest(formData)
      }
    } catch (error: any) {
      console.error('Error importing guests:', error)
      setError('Chyba při importu hostů')
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Export guests (placeholder)
  const exportGuests = async (format: 'csv' | 'excel'): Promise<void> => {
    // TODO: Implement export functionality
    console.log('Export guests in format:', format)
  }

  // Filter guests
  const getFilteredGuests = (filters: GuestFilters): Guest[] => {
    return guests.filter(guest => {
      if (filters.search && !`${guest.firstName} ${guest.lastName}`.toLowerCase().includes(filters.search.toLowerCase())) return false
      if (filters.category && !filters.category.includes(guest.category)) return false
      if (filters.rsvpStatus && !filters.rsvpStatus.includes(guest.rsvpStatus)) return false
      if (filters.invitationType && !filters.invitationType.includes(guest.invitationType)) return false
      if (filters.hasPlusOne !== undefined && guest.hasPlusOne !== filters.hasPlusOne) return false
      if (filters.hasChildren !== undefined && guest.hasChildren !== filters.hasChildren) return false
      if (filters.hasDietaryRestrictions !== undefined && (guest.dietaryRestrictions.length > 0) !== filters.hasDietaryRestrictions) return false
      if (filters.dietaryRestrictions && filters.dietaryRestrictions.length > 0 && !filters.dietaryRestrictions.some(dr => guest.dietaryRestrictions.includes(dr))) return false
      if (filters.accommodationInterest && !filters.accommodationInterest.includes(guest.accommodationInterest || 'not_interested')) return false
      if (filters.accommodationPayment && guest.accommodationInterest === 'interested' && !filters.accommodationPayment.includes(guest.accommodationPayment || 'paid_by_guest')) return false
      if (filters.invitationSent !== undefined && guest.invitationSent !== filters.invitationSent) return false
      if (filters.invitationMethod && guest.invitationSent && !filters.invitationMethod.includes(guest.invitationMethod || 'sent')) return false
      return true
    })
  }

  // Get guests by category
  const getGuestsByCategory = (category: string): Guest[] => {
    return guests.filter(guest => guest.category === category)
  }

  // Send invitations (placeholder)
  const sendInvitations = async (guestIds: string[]): Promise<void> => {
    await bulkOperation({
      guestIds,
      operation: 'send-invitation'
    })
  }

  // Send reminders (placeholder)
  const sendReminders = async (guestIds: string[]): Promise<void> => {
    await bulkOperation({
      guestIds,
      operation: 'send-reminder'
    })
  }

  // Calculate guest statistics
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

  const stats: GuestStats = {
    total: totalAttendees, // Now includes plus ones and children
    invited: guests.filter(g => g.invitationSent).length,
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
      if (!acc[guest.category]) {
        acc[guest.category] = {
          total: 0,
          attending: 0,
          declined: 0,
          pending: 0
        }
      }
      acc[guest.category].total += 1
      if (guest.rsvpStatus === 'attending') acc[guest.category].attending += 1
      else if (guest.rsvpStatus === 'declined') acc[guest.category].declined += 1
      else acc[guest.category].pending += 1
      return acc
    }, {} as Record<GuestCategory, { total: number; attending: number; declined: number; pending: number }>),
    ceremonyOnly: guests.filter(g => g.invitationType === 'ceremony-only').length,
    receptionOnly: guests.filter(g => g.invitationType === 'reception-only').length,
    ceremonyAndReception: guests.filter(g => g.invitationType === 'ceremony-reception').length,
    dietaryRestrictions: {} as any, // Will be calculated separately
    accessibilityNeeds: guests.filter(g => g.accessibilityNeeds).length,
    accommodationNeeds: guests.filter(g => g.accommodationNeeds).length
  }

  // Load guests when wedding changes - ONLY ONCE
  useEffect(() => {
    if (!isActive) {
      console.log('🚫 useGuest hook is INACTIVE - skipping all operations')
      return
    }

    if (!wedding) {
      setGuests([])
      setDataLoaded(false)
      setIsDemoMode(false)
      return
    }

    // Don't reload if data is already loaded for this wedding (prevents overwriting edits)
    if (dataLoaded) {
      console.log('🔄 Data already loaded, skipping reload to preserve edits')
      return
    }

    // NEVER reload for demo mode after first load
    if (isDemoMode) {
      console.log('🎭 Demo mode active - BLOCKING all further reloads')
      return
    }

    const loadGuests = async () => {
      try {
        setLoading(true)
        setError(null)

        // Check if this is a demo user (check wedding ID first to avoid user dependency)
        const isDemoUser = wedding.id === 'demo-wedding' || user?.id === 'demo-user-id' || user?.email === 'demo@svatbot.cz'

        if (isDemoUser) {
          setIsDemoMode(true)

          // Check if demo guests already exist in localStorage (edited data)
          const savedDemoGuests = localStorage.getItem(`guests_${wedding.id}`)
          if (savedDemoGuests) {
            console.log('🎭 Loading existing demo guests from localStorage - FINAL TIME')
            const existingGuests = JSON.parse(savedDemoGuests)
            setGuests(existingGuests)
            return
          }

          // Load fresh demo guests only if none exist
          console.log('🎭 Creating fresh demo guests')
          const demoGuests: Guest[] = [
            {
              id: 'demo-guest-1',
              weddingId: wedding.id,
              firstName: 'Marie',
              lastName: 'Nováková',
              email: 'marie.novakova@email.cz',
              phone: '+420 777 123 456',
              category: 'family-bride',
              invitationType: 'ceremony-reception',
              rsvpStatus: 'attending',
              rsvpDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
              hasPlusOne: false,
              hasChildren: false,
              children: [],
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
              createdBy: user?.id || 'demo-user-id'
            },
            {
              id: 'demo-guest-2',
              weddingId: wedding.id,
              firstName: 'Pavel',
              lastName: 'Svoboda',
              email: 'pavel.svoboda@email.cz',
              phone: '+420 777 234 567',
              category: 'friends-groom',
              invitationType: 'ceremony-reception',
              rsvpStatus: 'attending',
              rsvpDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
              hasPlusOne: true,
              plusOneName: 'Tereza Svobodová',
              plusOneRsvpStatus: 'attending',
              hasChildren: true,
              children: [
                { name: 'Jakub Svoboda', age: 6 }
              ],
              dietaryRestrictions: ['vegetarian'],
              preferredContactMethod: 'email',
              language: 'cs',
              accommodationInterest: 'not_interested',
              invitationSent: true,
              invitationMethod: 'delivered_personally',
              invitationSentDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
              reminderSent: false,
              createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
              updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
              createdBy: user?.id || 'demo-user-id'
            },
            {
              id: 'demo-guest-3',
              weddingId: wedding.id,
              firstName: 'Anna',
              lastName: 'Procházková',
              email: 'anna.prochazka@email.cz',
              category: 'family-bride',
              invitationType: 'ceremony-reception',
              rsvpStatus: 'pending',
              hasPlusOne: false,
              hasChildren: false,
              children: [],
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
              createdBy: user?.id || 'demo-user-id'
            },
            {
              id: 'demo-guest-4',
              weddingId: wedding.id,
              firstName: 'Tomáš',
              lastName: 'Dvořák',
              email: 'tomas.dvorak@email.cz',
              phone: '+420 777 345 678',
              category: 'colleagues-groom',
              invitationType: 'ceremony-reception',
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
              createdBy: user?.id || 'demo-user-id'
            }
          ]

          console.log('🎭 Loaded demo guests:', demoGuests.length, demoGuests)

          // Save demo guests to localStorage for editing
          localStorage.setItem(`guests_${wedding.id}`, JSON.stringify(demoGuests))

          setGuests(demoGuests)
          return
        }

        try {
          // Try to load from Firestore
          const guestsQuery = query(
            collection(db, 'guests'),
            where('weddingId', '==', wedding.id)
          )

          const unsubscribe = onSnapshot(guestsQuery, (snapshot) => {
            const loadedGuests = snapshot.docs.map(doc =>
              convertFirestoreGuest(doc.id, doc.data())
            )
            // Sort by sortOrder on client side
            loadedGuests.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
            console.log('👥 Loaded guests from Firestore:', loadedGuests.length, loadedGuests)
            setGuests(loadedGuests)
          }, (error) => {
            console.warn('Firestore snapshot error, using localStorage fallback:', error)
            // Load from localStorage fallback
            const savedGuests = localStorage.getItem(`guests_${wedding.id}`)
            if (savedGuests) {
              const parsedGuests = JSON.parse(savedGuests).map((guest: any) => ({
                ...guest,
                rsvpDate: guest.rsvpDate ? new Date(guest.rsvpDate) : undefined,
                invitationSentDate: guest.invitationSentDate ? new Date(guest.invitationSentDate) : undefined,
                reminderSentDate: guest.reminderSentDate ? new Date(guest.reminderSentDate) : undefined,
                createdAt: new Date(guest.createdAt),
                updatedAt: new Date(guest.updatedAt)
              }))
              console.log('📦 Loaded guests from localStorage:', parsedGuests.length, parsedGuests)
              setGuests(parsedGuests)
            } else {
              console.log('📦 No guests in localStorage for wedding:', wedding.id)
              setGuests([])
            }
          })

          return unsubscribe
        } catch (firestoreError) {
          console.warn('⚠️ Firestore not available, loading from localStorage')
          const savedGuests = localStorage.getItem(`guests_${wedding.id}`)
          if (savedGuests) {
            const parsedGuests = JSON.parse(savedGuests).map((guest: any) => ({
              ...guest,
              rsvpDate: guest.rsvpDate ? new Date(guest.rsvpDate) : undefined,
              invitationSentDate: guest.invitationSentDate ? new Date(guest.invitationSentDate) : undefined,
              reminderSentDate: guest.reminderSentDate ? new Date(guest.reminderSentDate) : undefined,
              createdAt: new Date(guest.createdAt),
              updatedAt: new Date(guest.updatedAt)
            }))
            console.log('📦 Loaded guests from localStorage (catch):', parsedGuests.length, parsedGuests)
            setGuests(parsedGuests)
          } else {
            console.log('📦 No guests in localStorage (catch) for wedding:', wedding.id)
            setGuests([])
          }
        }
      } catch (error: any) {
        console.error('Error loading guests:', error)
        setError('Chyba při načítání hostů')
      } finally {
        setLoading(false)
        setDataLoaded(true)
      }
    }

    loadGuests()
  }, [wedding?.id]) // ONLY wedding ID - no user dependencies to prevent re-renders

  // Reset dataLoaded when wedding changes (but preserve demo mode)
  useEffect(() => {
    if (!isDemoMode) {
      setDataLoaded(false)
    }
  }, [wedding?.id, isDemoMode])

  // Reorder guests
  const reorderGuests = useCallback(async (reorderedGuests: Guest[]) => {
    try {
      setLoading(true)
      setError(null)

      // Update local state immediately for better UX
      setGuests(reorderedGuests)

      // Update order in Firestore
      if (user?.id && wedding?.id) {
        try {
          // Update each guest with new sortOrder
          const updatePromises = reorderedGuests.map((guest, index) => {
            const guestRef = doc(db, 'guests', guest.id)
            return updateDoc(guestRef, { sortOrder: index })
          })

          await Promise.all(updatePromises)
          console.log('✅ Guest order updated in Firestore')
        } catch (firestoreError) {
          console.warn('⚠️ Firestore not available, using localStorage fallback')
          if (wedding) {
            localStorage.setItem(`guests_${wedding.id}`, JSON.stringify(reorderedGuests))
          }
        }
      } else {
        // Fallback to localStorage
        if (wedding) {
          localStorage.setItem(`guests_${wedding.id}`, JSON.stringify(reorderedGuests))
        }
      }

      console.log('✅ Guests reordered successfully')
    } catch (error: any) {
      console.error('Error reordering guests:', error)
      setError('Chyba při změně pořadí hostů')
      throw error
    } finally {
      setLoading(false)
    }
  }, [wedding, user])

  // Clear error
  const clearError = () => setError(null)

  return {
    guests,
    loading,
    error,
    stats,
    createGuest,
    updateGuest,
    deleteGuest,
    updateRSVP,
    bulkOperation,
    importGuests,
    exportGuests,
    getFilteredGuests,
    getGuestsByCategory,
    sendInvitations,
    sendReminders,
    reorderGuests,
    clearError
  }
}
