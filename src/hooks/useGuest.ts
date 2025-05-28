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
  getDocs,
  Timestamp
} from 'firebase/firestore'
import { db } from '@/config/firebase'
import { useAuth } from './useAuth'
import { useWedding } from './useWedding'
import {
  Guest,
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
  clearError: () => void
}

export function useGuest(): UseGuestReturn {
  const { user } = useAuth()
  const { wedding } = useWedding()
  const [guests, setGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
      dietaryRestrictions: data.dietaryRestrictions || [],
      dietaryNotes: data.dietaryNotes,
      accessibilityNeeds: data.accessibilityNeeds,
      accommodationNeeds: data.accommodationNeeds,
      preferredContactMethod: data.preferredContactMethod || 'email',
      language: data.language || 'cs',
      notes: data.notes,
      tags: data.tags || [],
      invitationSent: data.invitationSent || false,
      invitationSentDate: data.invitationSentDate?.toDate(),
      reminderSent: data.reminderSent || false,
      reminderSentDate: data.reminderSentDate?.toDate(),
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
      tags: guest.tags,
      invitationSent: guest.invitationSent,
      invitationSentDate: guest.invitationSentDate ? Timestamp.fromDate(guest.invitationSentDate) : null,
      reminderSent: guest.reminderSent,
      reminderSentDate: guest.reminderSentDate ? Timestamp.fromDate(guest.reminderSentDate) : null,
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
        dietaryRestrictions: data.dietaryRestrictions,
        dietaryNotes: data.dietaryNotes,
        accessibilityNeeds: data.accessibilityNeeds,
        accommodationNeeds: data.accommodationNeeds,
        preferredContactMethod: data.preferredContactMethod,
        language: data.language,
        notes: data.notes,
        tags: data.tags,
        invitationSent: false,
        reminderSent: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: user.id
      }

      try {
        // Try to save to Firestore
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

      try {
        // Try to update in Firestore
        const guestRef = doc(db, 'guests', guestId)
        await updateDoc(guestRef, convertToFirestoreData(updatedData as any))
      } catch (firestoreError) {
        console.warn('⚠️ Firestore not available, updating localStorage fallback')
        if (wedding) {
          const savedGuests = localStorage.getItem(`guests_${wedding.id}`) || '[]'
          const existingGuests = JSON.parse(savedGuests)
          const guestIndex = existingGuests.findIndex((g: Guest) => g.id === guestId)
          if (guestIndex !== -1) {
            existingGuests[guestIndex] = { ...existingGuests[guestIndex], ...updatedData }
            localStorage.setItem(`guests_${wedding.id}`, JSON.stringify(existingGuests))
          }
        }
      }

      // Update local state
      setGuests(prev => prev.map(guest =>
        guest.id === guestId ? { ...guest, ...updatedData } : guest
      ))
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
          dietaryRestrictions: [],
          preferredContactMethod: 'email',
          language: 'cs',
          notes: guestData.notes,
          tags: []
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
      if (filters.invitationSent !== undefined && guest.invitationSent !== filters.invitationSent) return false
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
  const stats: GuestStats = {
    total: guests.length,
    invited: guests.filter(g => g.invitationSent).length,
    attending: guests.filter(g => g.rsvpStatus === 'attending').length,
    declined: guests.filter(g => g.rsvpStatus === 'declined').length,
    pending: guests.filter(g => g.rsvpStatus === 'pending').length,
    maybe: guests.filter(g => g.rsvpStatus === 'maybe').length,
    totalWithPlusOnes: guests.filter(g => g.hasPlusOne).length,
    plusOnesAttending: guests.filter(g => g.hasPlusOne && g.plusOneRsvpStatus === 'attending').length,
    plusOnes: guests.filter(g => g.hasPlusOne).length,
    byCategory: {} as any, // Will be calculated separately
    ceremonyOnly: guests.filter(g => g.invitationType === 'ceremony-only').length,
    receptionOnly: guests.filter(g => g.invitationType === 'reception-only').length,
    ceremonyAndReception: guests.filter(g => g.invitationType === 'ceremony-reception').length,
    dietaryRestrictions: {} as any, // Will be calculated separately
    accessibilityNeeds: guests.filter(g => g.accessibilityNeeds).length,
    accommodationNeeds: guests.filter(g => g.accommodationNeeds).length
  }

  // Load guests when wedding changes
  useEffect(() => {
    if (!wedding) {
      setGuests([])
      return
    }

    const loadGuests = async () => {
      try {
        setLoading(true)
        setError(null)

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
      }
    }

    loadGuests()
  }, [wedding?.id])

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
    clearError
  }
}
