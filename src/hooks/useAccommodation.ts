'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  collection,
  doc,
  getDocs,
  getDoc,
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
import type { 
  Accommodation, 
  Room, 
  RoomReservation, 
  ReservationStatus 
} from '@/types'

interface AccommodationStats {
  totalAccommodations: number
  totalRooms: number
  availableRooms: number
  reservedRooms: number
  totalReservations: number
  occupancyRate: number
}

export interface AccommodationFormData {
  name: string
  description?: string
  address: {
    street: string
    city: string
    postalCode: string
    country: string
  }
  contactInfo: {
    email: string
    phone: string
    website?: string
  }
  website?: string
  images?: string[]
  amenities: string[]
  policies?: {
    checkIn: string
    checkOut: string
    cancellationPolicy?: string
    petPolicy?: string
    smokingPolicy?: string
    childrenPolicy?: string
    additionalFees?: string[]
  }
}

export interface RoomFormData {
  name: string
  description?: string
  type: Room['type']
  capacity: number
  maxOccupancy: number
  pricePerNight: number
  totalPrice?: number
  amenities: string[]
  bedConfiguration: Room['bedConfiguration']
  images?: string[]
}

interface UseAccommodationReturn {
  accommodations: Accommodation[]
  loading: boolean
  error: string | null
  stats: AccommodationStats
  createAccommodation: (data: AccommodationFormData) => Promise<Accommodation>
  updateAccommodation: (id: string, updates: Partial<AccommodationFormData>) => Promise<void>
  deleteAccommodation: (id: string) => Promise<void>
  addRoom: (accommodationId: string, roomData: RoomFormData) => Promise<Room>
  updateRoom: (accommodationId: string, roomId: string, updates: Partial<RoomFormData>) => Promise<void>
  deleteRoom: (accommodationId: string, roomId: string) => Promise<void>
  createReservation: (roomId: string, reservationData: Omit<RoomReservation, 'id' | 'roomId' | 'createdAt' | 'updatedAt'>) => Promise<RoomReservation>
  updateReservation: (reservationId: string, updates: Partial<RoomReservation>) => Promise<void>
  cancelReservation: (reservationId: string) => Promise<void>
  getAccommodationById: (id: string) => Accommodation | undefined
  getRoomById: (accommodationId: string, roomId: string) => Room | undefined
  getAvailableRooms: (accommodationId?: string) => Room[]
  uploadRoomImages: (accommodationId: string, roomId: string, files: File[]) => Promise<string[]>
  uploadAccommodationImages: (accommodationId: string, files: File[]) => Promise<string[]>
}

export function useAccommodation(): UseAccommodationReturn {
  const { user } = useAuth()
  const { wedding } = useWedding()
  const [accommodations, setAccommodations] = useState<Accommodation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Calculate stats
  const stats: AccommodationStats = {
    totalAccommodations: accommodations.length,
    totalRooms: accommodations.reduce((sum, acc) => sum + acc.rooms.length, 0),
    availableRooms: accommodations.reduce((sum, acc) => 
      sum + acc.rooms.filter(room => room.isAvailable).length, 0
    ),
    reservedRooms: accommodations.reduce((sum, acc) => 
      sum + acc.rooms.filter(room => room.reservations.some(r => r.status === 'confirmed')).length, 0
    ),
    totalReservations: accommodations.reduce((sum, acc) => 
      sum + acc.rooms.reduce((roomSum, room) => roomSum + room.reservations.length, 0), 0
    ),
    occupancyRate: 0 // Will be calculated based on actual reservations
  }

  // Calculate occupancy rate
  if (stats.totalRooms > 0) {
    stats.occupancyRate = Math.round((stats.reservedRooms / stats.totalRooms) * 100)
  }

  // Load accommodations
  useEffect(() => {
    if (!user || !wedding?.id) {
      setLoading(false)
      return
    }

    const accommodationsRef = collection(db, 'accommodations')
    const q = query(
      accommodationsRef,
      where('weddingId', '==', wedding.id)
    )

    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        const accommodationData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        })) as Accommodation[]

        console.log('🔥 useAccommodation - Firestore snapshot received:', {
          count: accommodationData.length,
          ids: accommodationData.map(a => a.id),
          weddingId: wedding.id
        })

        // Sort by createdAt descending in JavaScript
        const sortedData = accommodationData.sort((a, b) =>
          b.createdAt.getTime() - a.createdAt.getTime()
        )

        setAccommodations(sortedData)
        setLoading(false)
        setError(null)
      },
      (err) => {
        console.error('Error loading accommodations:', err)
        setError('Chyba při načítání ubytování')
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [user, wedding])

  // Create accommodation
  const createAccommodation = useCallback(async (data: AccommodationFormData): Promise<Accommodation> => {
    if (!user || !wedding?.id) throw new Error('User or wedding not found')

    try {
      setLoading(true)
      const accommodationsRef = collection(db, 'accommodations')

      const accommodationData = {
        weddingId: wedding.id,
        ...data,
        images: data.images || [],
        rooms: [],
        isActive: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }

      const docRef = await addDoc(accommodationsRef, accommodationData)
      
      const newAccommodation: Accommodation = {
        id: docRef.id,
        ...accommodationData,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      return newAccommodation
    } catch (err: any) {
      console.error('Error creating accommodation:', err)
      setError('Chyba při vytváření ubytování')
      throw err
    } finally {
      setLoading(false)
    }
  }, [user, wedding])

  // Update accommodation
  const updateAccommodation = useCallback(async (id: string, updates: Partial<AccommodationFormData>) => {
    if (!user || !wedding?.id) throw new Error('User or wedding not found')

    try {
      setLoading(true)
      const accommodationRef = doc(db, 'accommodations', id)
      
      await updateDoc(accommodationRef, {
        ...updates,
        updatedAt: Timestamp.now()
      })
    } catch (err: any) {
      console.error('Error updating accommodation:', err)
      setError('Chyba při aktualizaci ubytování')
      throw err
    } finally {
      setLoading(false)
    }
  }, [user, wedding])

  // Delete accommodation
  const deleteAccommodation = useCallback(async (id: string) => {
    if (!user || !wedding?.id) throw new Error('User or wedding not found')

    try {
      setLoading(true)
      const accommodationRef = doc(db, 'accommodations', id)
      await deleteDoc(accommodationRef)
    } catch (err: any) {
      console.error('Error deleting accommodation:', err)
      setError('Chyba při mazání ubytování')
      throw err
    } finally {
      setLoading(false)
    }
  }, [user, wedding])

  // Add room to accommodation
  const addRoom = useCallback(async (accommodationId: string, roomData: RoomFormData): Promise<Room> => {
    if (!user || !wedding?.id) throw new Error('User or wedding not found')

    try {
      setLoading(true)

      // Get fresh data from Firestore to avoid stale closure data
      const accommodationRef = doc(db, 'accommodations', accommodationId)
      const accommodationDoc = await getDoc(accommodationRef)

      if (!accommodationDoc.exists()) {
        throw new Error('Accommodation not found')
      }

      const accommodationData = accommodationDoc.data()
      const currentRooms = accommodationData?.rooms || []

      const newRoom: Room = {
        id: `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        accommodationId,
        ...roomData,
        images: roomData.images || [],
        isAvailable: true,
        reservations: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const updatedRooms = [...currentRooms, newRoom]

      await updateDoc(accommodationRef, {
        rooms: updatedRooms,
        updatedAt: Timestamp.now()
      })

      console.log(`✅ Firestore updated successfully for accommodation ${accommodationId}`)
      return newRoom
    } catch (err: any) {
      console.error('Error adding room:', err)
      setError('Chyba při přidávání pokoje')
      throw err
    } finally {
      setLoading(false)
    }
  }, [user, wedding, accommodations])

  // Helper functions
  const getAccommodationById = useCallback((id: string) => {
    return accommodations.find(acc => acc.id === id)
  }, [accommodations])

  const getRoomById = useCallback((accommodationId: string, roomId: string) => {
    const accommodation = getAccommodationById(accommodationId)
    return accommodation?.rooms.find(room => room.id === roomId)
  }, [getAccommodationById])

  const getAvailableRooms = useCallback((accommodationId?: string) => {
    const targetAccommodations = accommodationId 
      ? accommodations.filter(acc => acc.id === accommodationId)
      : accommodations

    return targetAccommodations.reduce((rooms: Room[], acc) => {
      const availableRooms = acc.rooms.filter(room => room.isAvailable)
      return [...rooms, ...availableRooms]
    }, [])
  }, [accommodations])

  // Update room in accommodation
  const updateRoom = useCallback(async (accommodationId: string, roomId: string, updates: Partial<RoomFormData>) => {
    if (!user || !wedding?.id) throw new Error('User or wedding not found')

    try {
      setLoading(true)
      const accommodation = accommodations.find(acc => acc.id === accommodationId)
      if (!accommodation) throw new Error('Accommodation not found')

      const roomIndex = accommodation.rooms.findIndex(room => room.id === roomId)
      if (roomIndex === -1) throw new Error('Room not found')

      // Update the room with new data
      const updatedRoom = {
        ...accommodation.rooms[roomIndex],
        ...updates,
        images: updates.images || accommodation.rooms[roomIndex].images,
        updatedAt: new Date()
      }

      const updatedRooms = [...accommodation.rooms]
      updatedRooms[roomIndex] = updatedRoom

      const accommodationRef = doc(db, 'accommodations', accommodationId)
      await updateDoc(accommodationRef, {
        rooms: updatedRooms,
        updatedAt: Timestamp.now()
      })

    } catch (err: any) {
      console.error('Error updating room:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [user, wedding, accommodations])

  const deleteRoom = useCallback(async (accommodationId: string, roomId: string) => {
    if (!user || !wedding?.id) throw new Error('User or wedding not found')

    try {
      setLoading(true)

      // Get fresh data from Firestore to avoid stale closure data
      const accommodationRef = doc(db, 'accommodations', accommodationId)
      const accommodationDoc = await getDoc(accommodationRef)

      if (!accommodationDoc.exists()) {
        throw new Error('Accommodation not found')
      }

      const accommodationData = accommodationDoc.data()
      const currentRooms = accommodationData?.rooms || []
      const updatedRooms = currentRooms.filter((room: any) => room.id !== roomId)

      console.log(`🗑️ Deleting room ${roomId} from accommodation ${accommodationId}`)
      console.log(`📊 Rooms before: ${currentRooms.length}, after: ${updatedRooms.length}`)

      await updateDoc(accommodationRef, {
        rooms: updatedRooms,
        updatedAt: Timestamp.now()
      })

      console.log(`✅ Room ${roomId} deleted successfully`)
    } catch (err: any) {
      console.error('Error deleting room:', err)
      setError('Chyba při mazání pokoje')
      throw err
    } finally {
      setLoading(false)
    }
  }, [user, wedding])

  const createReservation = useCallback(async (roomId: string, reservationData: Omit<RoomReservation, 'id' | 'roomId' | 'createdAt' | 'updatedAt'>) => {
    // TODO: Implement reservation creation
    throw new Error('Not implemented yet')
  }, [])

  const updateReservation = useCallback(async (reservationId: string, updates: Partial<RoomReservation>) => {
    // TODO: Implement reservation update
    throw new Error('Not implemented yet')
  }, [])

  const cancelReservation = useCallback(async (reservationId: string) => {
    // TODO: Implement reservation cancellation
    throw new Error('Not implemented yet')
  }, [])

  const uploadRoomImages = useCallback(async (accommodationId: string, roomId: string, files: File[]) => {
    // TODO: Implement image upload
    throw new Error('Not implemented yet')
  }, [])

  const uploadAccommodationImages = useCallback(async (accommodationId: string, files: File[]) => {
    // TODO: Implement image upload
    throw new Error('Not implemented yet')
  }, [])

  return {
    accommodations,
    loading,
    error,
    stats,
    createAccommodation,
    updateAccommodation,
    deleteAccommodation,
    addRoom,
    updateRoom,
    deleteRoom,
    createReservation,
    updateReservation,
    cancelReservation,
    getAccommodationById,
    getRoomById,
    getAvailableRooms,
    uploadRoomImages,
    uploadAccommodationImages
  }
}
