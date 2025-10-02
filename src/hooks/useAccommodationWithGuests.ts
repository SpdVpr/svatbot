'use client'

import { useMemo } from 'react'
import { useAccommodation } from './useAccommodation'
import { useRobustGuests } from './useRobustGuests'
import type { Accommodation, Room } from '@/types'

export interface RoomOccupancy {
  roomId: string
  roomName: string
  accommodationId: string
  accommodationName: string
  isOccupied: boolean
  occupiedBy?: {
    guestId: string
    guestName: string
    guestEmail?: string
  }
  capacity: number
  pricePerNight: number
}

export interface AccommodationWithOccupancy extends Accommodation {
  occupiedRooms: number
  availableRooms: number
  occupancyRate: number
  roomOccupancies: RoomOccupancy[]
}

export interface AccommodationStatsWithGuests {
  totalAccommodations: number
  totalRooms: number
  availableRooms: number
  occupiedRooms: number
  occupancyRate: number
  guestAssignments: number
}

export function useAccommodationWithGuests() {
  const { accommodations, loading: accommodationLoading, ...accommodationMethods } = useAccommodation()
  const { guests, loading: guestsLoading } = useRobustGuests()

  // Calculate room occupancies based on guest assignments
  const accommodationsWithOccupancy = useMemo((): AccommodationWithOccupancy[] => {
    return accommodations.map(accommodation => {
      const roomOccupancies: RoomOccupancy[] = accommodation.rooms.map(room => {
        // Find guest assigned to this room
        const assignedGuest = guests.find(guest => 
          guest.accommodationId === accommodation.id && guest.roomId === room.id
        )

        return {
          roomId: room.id,
          roomName: room.name,
          accommodationId: accommodation.id,
          accommodationName: accommodation.name,
          isOccupied: !!assignedGuest,
          occupiedBy: assignedGuest ? {
            guestId: assignedGuest.id,
            guestName: `${assignedGuest.firstName} ${assignedGuest.lastName}`,
            guestEmail: assignedGuest.email
          } : undefined,
          capacity: room.capacity,
          pricePerNight: room.pricePerNight
        }
      })

      const occupiedRooms = roomOccupancies.filter(r => r.isOccupied).length
      const totalRooms = roomOccupancies.length
      const availableRooms = totalRooms - occupiedRooms
      const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0

      return {
        ...accommodation,
        occupiedRooms,
        availableRooms,
        occupancyRate,
        roomOccupancies
      }
    })
  }, [accommodations, guests])

  // Calculate overall stats
  const stats = useMemo((): AccommodationStatsWithGuests => {
    const totalAccommodations = accommodationsWithOccupancy.length
    const totalRooms = accommodationsWithOccupancy.reduce((sum, acc) => sum + acc.rooms.length, 0)
    const occupiedRooms = accommodationsWithOccupancy.reduce((sum, acc) => sum + acc.occupiedRooms, 0)
    const availableRooms = totalRooms - occupiedRooms
    const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0
    const guestAssignments = guests.filter(guest => guest.accommodationId && guest.roomId).length

    return {
      totalAccommodations,
      totalRooms,
      availableRooms,
      occupiedRooms,
      occupancyRate,
      guestAssignments
    }
  }, [accommodationsWithOccupancy, guests])

  // Helper function to get room occupancy by room ID
  const getRoomOccupancy = (roomId: string): RoomOccupancy | undefined => {
    for (const accommodation of accommodationsWithOccupancy) {
      const roomOccupancy = accommodation.roomOccupancies.find(r => r.roomId === roomId)
      if (roomOccupancy) return roomOccupancy
    }
    return undefined
  }

  // Helper function to get accommodation with occupancy by ID
  const getAccommodationWithOccupancy = (accommodationId: string): AccommodationWithOccupancy | undefined => {
    return accommodationsWithOccupancy.find(acc => acc.id === accommodationId)
  }

  // Helper function to get all occupied rooms
  const getOccupiedRooms = (): RoomOccupancy[] => {
    return accommodationsWithOccupancy.flatMap(acc => 
      acc.roomOccupancies.filter(r => r.isOccupied)
    )
  }

  // Helper function to get available rooms
  const getAvailableRooms = (): RoomOccupancy[] => {
    return accommodationsWithOccupancy.flatMap(acc => 
      acc.roomOccupancies.filter(r => !r.isOccupied)
    )
  }

  return {
    // Data
    accommodations: accommodationsWithOccupancy,
    originalAccommodations: accommodations,
    guests,
    stats,
    
    // Loading states
    loading: accommodationLoading || guestsLoading,
    accommodationLoading,
    guestsLoading,
    
    // Helper functions
    getRoomOccupancy,
    getAccommodationWithOccupancy,
    getOccupiedRooms,
    getAvailableRooms,
    
    // Original accommodation methods
    ...accommodationMethods
  }
}
