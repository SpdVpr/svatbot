'use client'

import { useState, useEffect, useRef } from 'react'
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
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
  SeatingPlan,
  Table,
  Seat,
  SeatingAssignment,
  SeatingConstraint,
  SeatingStats,
  TableFormData,
  SeatingPlanFormData,
  AutoAssignmentOptions,
  AutoAssignmentResult
} from '@/types/seating'

interface UseSeatingReturn {
  seatingPlans: SeatingPlan[]
  currentPlan: SeatingPlan | null
  tables: Table[]
  seats: Seat[]
  assignments: SeatingAssignment[]
  constraints: SeatingConstraint[]
  loading: boolean
  error: string | null
  stats: SeatingStats

  // Plan management
  createSeatingPlan: (data: SeatingPlanFormData) => Promise<SeatingPlan>
  updateSeatingPlan: (planId: string, updates: Partial<SeatingPlan>) => Promise<void>
  deleteSeatingPlan: (planId: string) => Promise<void>
  setCurrentPlan: (planId: string) => void

  // Table management
  createTable: (data: TableFormData, planId?: string) => Promise<Table>
  updateTable: (tableId: string, updates: Partial<Table>) => Promise<void>
  deleteTable: (tableId: string) => Promise<void>
  moveTable: (tableId: string, position: { x: number; y: number }) => Promise<void>

  // Seat assignment
  assignGuestToSeat: (guestId: string, seatId: string) => Promise<void>
  unassignGuestFromSeat: (seatId: string) => Promise<void>
  swapGuestSeats: (seatId1: string, seatId2: string) => Promise<void>
  deleteSeat: (seatId: string) => Promise<void>

  // Constraints
  addConstraint: (constraint: Omit<SeatingConstraint, 'id'>) => Promise<void>
  removeConstraint: (constraintId: string) => Promise<void>

  // Auto-assignment
  autoAssignGuests: (options: AutoAssignmentOptions) => Promise<AutoAssignmentResult>

  // Utilities
  getUnassignedGuests: () => any[]
  getTableOccupancy: (tableId: string) => number
  validateConstraints: () => SeatingConstraint[]
  clearError: () => void
}

export function useSeating(): UseSeatingReturn {
  const { user } = useAuth()
  const { wedding } = useWedding()
  const { guests } = useGuest()
  const [seatingPlans, setSeatingPlans] = useState<SeatingPlan[]>([])
  const [currentPlan, setCurrentPlanState] = useState<SeatingPlan | null>(null)
  const [tables, setTables] = useState<Table[]>([])
  const [seats, setSeats] = useState<Seat[]>([])
  const [assignments, setAssignments] = useState<SeatingAssignment[]>([])
  const [constraints, setConstraints] = useState<SeatingConstraint[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Track if we've already set the initial current plan
  const hasSetInitialPlan = useRef(false)

  // Update tables and seats when currentPlan changes
  useEffect(() => {
    if (currentPlan) {
      setTables(currentPlan.tables || [])
      setSeats(currentPlan.seats || [])
    } else {
      setTables([])
      setSeats([])
    }
  }, [currentPlan])

  // Update currentPlan when seatingPlans change (to reflect updates)
  useEffect(() => {
    if (currentPlan && seatingPlans.length > 0) {
      const updatedPlan = seatingPlans.find(p => p.id === currentPlan.id)
      if (updatedPlan) {
        // Only update if the updatedAt timestamp is newer
        const currentUpdatedAt = currentPlan.updatedAt instanceof Date
          ? currentPlan.updatedAt.getTime()
          : new Date(currentPlan.updatedAt).getTime()
        const newUpdatedAt = updatedPlan.updatedAt instanceof Date
          ? updatedPlan.updatedAt.getTime()
          : new Date(updatedPlan.updatedAt).getTime()

        if (newUpdatedAt > currentUpdatedAt) {
          setCurrentPlanState(updatedPlan)
        }
      }
    }
  }, [seatingPlans, currentPlan?.id])

  // Load seating plans when wedding changes
  useEffect(() => {
    if (!wedding) {
      hasSetInitialPlan.current = false
      return
    }

    setLoading(true)
    hasSetInitialPlan.current = false

    // Set up Firestore real-time listener
    try {
      const plansQuery = query(
        collection(db, 'seatingPlans'),
        where('weddingId', '==', wedding.id),
        orderBy('createdAt', 'desc')
      )

      const unsubscribe = onSnapshot(
        plansQuery,
        (snapshot) => {
          const plansData = snapshot.docs.map(doc => {
            const data = doc.data()
            return convertFirestoreSeatingPlan(doc.id, data)
          })

          setSeatingPlans(plansData)

          // Automatically set first plan as current if none is set (only once)
          if (plansData.length > 0 && !hasSetInitialPlan.current) {
            setCurrentPlanState(plansData[0])
            hasSetInitialPlan.current = true
          }

          // Save to localStorage as backup
          localStorage.setItem(`seatingPlans_${wedding.id}`, JSON.stringify(plansData))

          setLoading(false)
        },
        (error) => {
          console.error('Firestore listener error, using localStorage fallback:', error)

          // Fallback to localStorage
          const savedPlans = localStorage.getItem(`seatingPlans_${wedding.id}`) || '[]'
          try {
            const existingPlans = JSON.parse(savedPlans)
            setSeatingPlans(existingPlans)

            if (existingPlans.length > 0 && !hasSetInitialPlan.current) {
              setCurrentPlanState(existingPlans[0])
              hasSetInitialPlan.current = true
            }
          } catch (parseError) {
            console.error('Error parsing localStorage seating plans:', parseError)
            setSeatingPlans([])
          }

          setLoading(false)
        }
      )

      return () => unsubscribe()
    } catch (error) {
      console.error('Error setting up Firestore listener:', error)

      // Fallback to localStorage
      const savedPlans = localStorage.getItem(`seatingPlans_${wedding.id}`) || '[]'
      try {
        const existingPlans = JSON.parse(savedPlans)
        setSeatingPlans(existingPlans)

        if (existingPlans.length > 0 && !hasSetInitialPlan.current) {
          setCurrentPlanState(existingPlans[0])
          hasSetInitialPlan.current = true
        }
      } catch (parseError) {
        console.error('Error parsing localStorage seating plans:', parseError)
        setSeatingPlans([])
      }

      setLoading(false)
    }
  }, [wedding?.id])

  // Convert Firestore data
  const convertFirestoreSeatingPlan = (id: string, data: any): SeatingPlan => {
    // Handle both Firestore Timestamp and Date objects
    const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() :
                      data.createdAt ? new Date(data.createdAt) : new Date()
    const updatedAt = data.updatedAt?.toDate ? data.updatedAt.toDate() :
                      data.updatedAt ? new Date(data.updatedAt) : new Date()

    return {
      id,
      weddingId: data.weddingId,
      name: data.name,
      description: data.description,
      venueLayout: data.venueLayout,
      tables: data.tables || [],
      seats: data.seats || [],
      isActive: data.isActive,
      isPublished: data.isPublished,
      totalSeats: data.totalSeats,
      assignedSeats: data.assignedSeats,
      availableSeats: data.availableSeats,
      createdAt,
      updatedAt,
      createdBy: data.createdBy
    }
  }

  const convertFirestoreTable = (id: string, data: any): Table => ({
    id,
    weddingId: data.weddingId,
    name: data.name,
    shape: data.shape,
    size: data.size,
    capacity: data.capacity,
    position: data.position,
    rotation: data.rotation,
    color: data.color,
    headSeats: data.headSeats || 0,
    isHighlighted: data.isHighlighted,
    notes: data.notes,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date()
  })

  // Create seating plan
  const createSeatingPlan = async (data: SeatingPlanFormData): Promise<SeatingPlan> => {
    if (!wedding || !user) {
      throw new Error('Žádná svatba nebo uživatel není vybrán')
    }

    try {
      setError(null)
      setLoading(true)

      // Create plan with local ID first (for immediate response)
      const localId = `seating_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const planData = {
        weddingId: wedding.id,
        name: data.name,
        description: data.description,
        venueLayout: data.venueLayout,
        tables: [],
        seats: [],
        isActive: true,
        isPublished: false,
        totalSeats: 0,
        assignedSeats: 0,
        availableSeats: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: user.id
      }

      const newPlan: SeatingPlan = { id: localId, ...planData }

      // Save to localStorage immediately
      const savedPlans = localStorage.getItem(`seatingPlans_${wedding.id}`) || '[]'
      const existingPlans = JSON.parse(savedPlans)
      existingPlans.push(newPlan)
      localStorage.setItem(`seatingPlans_${wedding.id}`, JSON.stringify(existingPlans))

      // Update state immediately
      setSeatingPlans(prev => [...prev, newPlan])

      // Set as current plan immediately
      setCurrentPlanState(newPlan)

      // Save to Firebase in background
      try {
        const planRef = doc(db, 'seatingPlans', localId)
        const firestoreData = {
          ...planData,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        }
        await setDoc(planRef, firestoreData)
      } catch (firebaseError) {
        console.error('Firebase sync failed for seating plan:', firebaseError)
        // Continue with local-only plan
      }

      return newPlan
    } catch (error: any) {
      console.error('❌ Error creating seating plan:', error)
      setError('Chyba při vytváření plánu rozmístění: ' + error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Create table
  const createTable = async (data: TableFormData, planId?: string): Promise<Table> => {
    const activePlan = planId ? seatingPlans.find(p => p.id === planId) : currentPlan

    if (!wedding || !user || !activePlan) {
      throw new Error('Žádná svatba, uživatel nebo plán není vybrán')
    }

    try {
      setError(null)

      // Create table with local ID
      const localId = `table_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      const newTable: Table = {
        id: localId,
        weddingId: wedding.id,
        name: data.name,
        shape: data.shape,
        size: data.size,
        capacity: data.capacity,
        position: data.position,
        rotation: data.rotation,
        color: data.color,
        headSeats: data.headSeats || 0,
        seatSides: data.seatSides || 'all',
        oneSidePosition: data.oneSidePosition || 'bottom',
        isHighlighted: false,
        notes: data.notes,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // Add table to the seating plan
      const updatedTables = [...activePlan.tables, newTable]

      // Update the seating plan with the new table
      await updateSeatingPlan(activePlan.id, {
        tables: updatedTables,
        totalSeats: updatedTables.reduce((sum, t) => sum + t.capacity, 0)
      })

      // Create seats for the table
      await createSeatsForTable(newTable)

      return newTable
    } catch (error: any) {
      console.error('Error creating table:', error)
      setError('Chyba při vytváření stolu')
      throw error
    }
  }

  // Create seats for table
  const createSeatsForTable = async (table: Table) => {
    if (!wedding || !currentPlan) return

    const newSeats: Seat[] = []

    for (let i = 1; i <= table.capacity; i++) {
      const seat: Seat = {
        id: `seat_${table.id}_${i}`,
        tableId: table.id,
        position: i,
        isReserved: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      newSeats.push(seat)
    }

    // Update the seating plan with the new seats
    const updatedSeats = [...currentPlan.seats, ...newSeats]
    await updateSeatingPlan(currentPlan.id, {
      seats: updatedSeats
    })
  }

  // Calculate statistics
  const stats: SeatingStats = {
    totalTables: tables.length,
    totalSeats: seats.length,
    assignedSeats: seats.filter(s => s.guestId).length,
    availableSeats: seats.filter(s => !s.guestId && !s.isReserved).length,
    occupancyRate: seats.length > 0 ? Math.round((seats.filter(s => s.guestId).length / seats.length) * 100) : 0,
    byTableSize: {} as any, // Will be calculated separately
    satisfiedConstraints: constraints.filter(c => c.isActive).length,
    violatedConstraints: 0, // TODO: Calculate violations
    byGuestCategory: {} as any // Will be calculated separately
  }

  // Get unassigned guests
  const getUnassignedGuests = () => {
    const assignedGuestIds = new Set(seats.filter(s => s.guestId).map(s => s.guestId))
    return guests.filter(guest => !assignedGuestIds.has(guest.id))
  }

  // Set current plan
  const setCurrentPlan = (planId: string) => {
    const plan = seatingPlans.find(p => p.id === planId)
    if (plan) {
      setCurrentPlanState(plan)
    } else {
      console.warn('Plan not found:', planId)
    }
  }

  // Placeholder implementations for other functions
  const updateSeatingPlan = async (planId: string, updates: Partial<SeatingPlan>) => {
    if (!wedding) return

    try {
      // Deep merge function for nested objects
      const deepMerge = (target: any, source: any): any => {
        const output = { ...target }
        for (const key in source) {
          if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key]) && !(source[key] instanceof Date)) {
            output[key] = deepMerge(target[key] || {}, source[key])
          } else {
            output[key] = source[key]
          }
        }
        return output
      }

      // Update plan in state first (for immediate UI feedback)
      setSeatingPlans(prev => prev.map(plan =>
        plan.id === planId
          ? deepMerge(plan, { ...updates, updatedAt: new Date() })
          : plan
      ))

      // Update current plan if it's the one being updated
      setCurrentPlanState(prev => {
        if (prev?.id === planId) {
          const updated = deepMerge(prev, { ...updates, updatedAt: new Date() })
          return updated
        }
        return prev
      })

      // Update in localStorage as backup
      const savedPlans = localStorage.getItem(`seatingPlans_${wedding.id}`) || '[]'
      const existingPlans = JSON.parse(savedPlans)
      const updatedPlans = existingPlans.map((plan: SeatingPlan) =>
        plan.id === planId
          ? { ...plan, ...updates, updatedAt: new Date() }
          : plan
      )
      localStorage.setItem(`seatingPlans_${wedding.id}`, JSON.stringify(updatedPlans))

      // Update in Firebase - use setDoc with merge to create if doesn't exist
      try {
        const planRef = doc(db, 'seatingPlans', planId)

        // Prepare data for Firestore (remove id field and undefined values)
        const { id, createdAt, updatedAt, ...restUpdates } = updates as any

        // Deep clean undefined values from the data
        const cleanForFirestore = (obj: any): any => {
          if (obj === undefined || obj === null) {
            return null
          }

          if (Array.isArray(obj)) {
            return obj.map(item => cleanForFirestore(item)).filter(item => item !== null)
          }

          if (obj instanceof Date) {
            return Timestamp.fromDate(obj)
          }

          if (typeof obj === 'object') {
            const cleaned: any = {}
            for (const [key, value] of Object.entries(obj)) {
              if (value !== undefined) {
                const cleanedValue = cleanForFirestore(value)
                if (cleanedValue !== null || typeof cleanedValue === 'boolean' || typeof cleanedValue === 'number') {
                  cleaned[key] = cleanedValue
                }
              }
            }
            return cleaned
          }

          return obj
        }

        const firestoreData = {
          ...cleanForFirestore(restUpdates),
          updatedAt: Timestamp.now()
        }

        await setDoc(planRef, firestoreData, { merge: true })
      } catch (firebaseError) {
        console.error('Firebase sync failed for seating plan update:', firebaseError)
        console.error('Updates that failed:', updates)
        // Continue with local-only update
      }
    } catch (error) {
      console.error('Error updating seating plan:', error)
      throw error
    }
  }

  const deleteSeatingPlan = async (planId: string) => {
    // TODO: Implement
  }

  const updateTable = async (tableId: string, updates: Partial<Table>) => {
    if (!wedding || !currentPlan) return

    try {
      // Update table in the seating plan
      const updatedTables = currentPlan.tables.map(table =>
        table.id === tableId
          ? { ...table, ...updates, updatedAt: new Date() }
          : table
      )

      // If capacity changed, update seats
      let updatedSeats = currentPlan.seats
      if (updates.capacity !== undefined) {
        const table = currentPlan.tables.find(t => t.id === tableId)
        if (table && table.capacity !== updates.capacity) {
          updatedSeats = await updateSeatsForTable(tableId, updates.capacity)
        }
      }

      await updateSeatingPlan(currentPlan.id, {
        tables: updatedTables,
        seats: updatedSeats,
        totalSeats: updatedTables.reduce((sum, t) => sum + t.capacity, 0)
      })
    } catch (error) {
      console.error('Error updating table:', error)
      throw error
    }
  }

  // Update seats when table capacity changes
  const updateSeatsForTable = async (tableId: string, newCapacity: number): Promise<Seat[]> => {
    if (!wedding || !currentPlan) return []

    try {
      // Remove existing seats for this table and preserve guest assignments
      const existingSeats = currentPlan.seats.filter(seat => seat.tableId === tableId)
      const otherSeats = currentPlan.seats.filter(seat => seat.tableId !== tableId)

      // Create new seats, preserving guest assignments where possible
      const newSeats: Seat[] = []
      for (let i = 1; i <= newCapacity; i++) {
        const existingSeat = existingSeats.find(s => s.position === i)
        const seat: Seat = {
          id: `seat_${tableId}_${i}`,
          tableId: tableId,
          position: i,
          guestId: existingSeat?.guestId, // Preserve guest assignment if exists
          isReserved: existingSeat?.isReserved || false,
          createdAt: existingSeat?.createdAt || new Date(),
          updatedAt: new Date()
        }
        newSeats.push(seat)
      }

      // Combine with other seats
      const allSeats = [...otherSeats, ...newSeats]

      // Update state
      setSeats(allSeats)

      // Update localStorage
      localStorage.setItem(`seats_${wedding.id}`, JSON.stringify(allSeats))

      return allSeats
    } catch (error) {
      console.error('Error updating seats for table:', error)
      return currentPlan.seats
    }
  }

  const deleteTable = async (tableId: string) => {
    if (!wedding || !currentPlan) return

    try {
      // Remove table from current plan
      const updatedTables = currentPlan.tables.filter(table => table.id !== tableId)

      // Remove seats associated with this table
      const updatedSeats = currentPlan.seats.filter(seat => seat.tableId !== tableId)

      // Update the seating plan with only the changed fields
      await updateSeatingPlan(currentPlan.id, {
        tables: updatedTables,
        seats: updatedSeats,
        totalSeats: updatedTables.reduce((sum, t) => sum + t.capacity, 0)
      })
    } catch (error) {
      console.error('Error deleting table:', error)
      throw error
    }
  }

  const moveTable = async (tableId: string, position: { x: number; y: number }) => {
    if (!wedding || !currentPlan) return

    try {
      // Update table position in the seating plan
      const updatedTables = currentPlan.tables.map(table =>
        table.id === tableId
          ? { ...table, position, updatedAt: new Date() }
          : table
      )

      await updateSeatingPlan(currentPlan.id, {
        tables: updatedTables
      })
    } catch (error) {
      console.error('Error moving table:', error)
    }
  }

  const assignGuestToSeat = async (personId: string, seatId: string) => {
    if (!wedding || !currentPlan) return

    try {
      // PersonId can be: "guest_id", "guest_id_plusone", or "guest_id_child_0"
      // We accept any ID and store it directly in the seat

      // Find the seat being assigned
      const targetSeat = currentPlan.seats.find(s => s.id === seatId)
      if (!targetSeat) return

      // Update the seat with the person ID
      const updatedSeats = currentPlan.seats.map(seat =>
        seat.id === seatId
          ? { ...seat, guestId: personId, isPlusOne: false, plusOneOf: undefined, updatedAt: new Date() }
          : seat
      )

      await updateSeatingPlan(currentPlan.id, {
        seats: updatedSeats,
        assignedSeats: updatedSeats.filter(s => s.guestId).length
      })
    } catch (error) {
      console.error('Error assigning person to seat:', error)
      throw error
    }
  }

  const unassignGuestFromSeat = async (seatId: string) => {
    if (!wedding || !currentPlan) return

    try {
      // Find the seat being unassigned
      const targetSeat = currentPlan.seats.find(s => s.id === seatId)
      if (!targetSeat || !targetSeat.guestId) return

      // Update seat in the seating plan
      let updatedSeats = currentPlan.seats.map(seat =>
        seat.id === seatId
          ? { ...seat, guestId: undefined, isPlusOne: false, plusOneOf: undefined, updatedAt: new Date() }
          : seat
      )

      // If this was a main guest seat, also unassign their plus one
      if (!targetSeat.isPlusOne) {
        updatedSeats = updatedSeats.map(seat =>
          seat.plusOneOf === targetSeat.guestId
            ? { ...seat, guestId: undefined, isPlusOne: false, plusOneOf: undefined, updatedAt: new Date() }
            : seat
        )
      }

      await updateSeatingPlan(currentPlan.id, {
        seats: updatedSeats,
        assignedSeats: updatedSeats.filter(s => s.guestId).length
      })
    } catch (error) {
      console.error('Error unassigning guest from seat:', error)
      throw error
    }
  }

  const swapGuestSeats = async (seatId1: string, seatId2: string) => {
    // TODO: Implement
  }

  const deleteSeat = async (seatId: string) => {
    if (!wedding || !currentPlan) return

    try {
      // Simply remove the seat - nothing else changes
      const updatedSeats = currentPlan.seats.filter(s => s.id !== seatId)

      // Update the seating plan - keep tables unchanged
      await updateSeatingPlan(currentPlan.id, {
        seats: updatedSeats,
        totalSeats: updatedSeats.length,
        assignedSeats: updatedSeats.filter(s => s.guestId).length
      })
    } catch (error) {
      console.error('Error deleting seat:', error)
      throw error
    }
  }

  const addConstraint = async (constraint: Omit<SeatingConstraint, 'id'>) => {
    // TODO: Implement
  }

  const removeConstraint = async (constraintId: string) => {
    // TODO: Implement
  }

  const autoAssignGuests = async (options: AutoAssignmentOptions): Promise<AutoAssignmentResult> => {
    // TODO: Implement
    return {
      success: false,
      assignedGuests: 0,
      unassignedGuests: 0,
      violatedConstraints: [],
      suggestions: []
    }
  }

  const getTableOccupancy = (tableId: string): number => {
    const tableSeats = seats.filter(s => s.tableId === tableId)
    const occupiedSeats = tableSeats.filter(s => s.guestId)
    return tableSeats.length > 0 ? Math.round((occupiedSeats.length / tableSeats.length) * 100) : 0
  }

  const validateConstraints = (): SeatingConstraint[] => {
    // TODO: Implement constraint validation
    return []
  }

  const clearError = () => setError(null)

  return {
    seatingPlans,
    currentPlan,
    tables,
    seats,
    assignments,
    constraints,
    loading,
    error,
    stats,
    createSeatingPlan,
    updateSeatingPlan,
    deleteSeatingPlan,
    setCurrentPlan,
    createTable,
    updateTable,
    deleteTable,
    moveTable,
    assignGuestToSeat,
    unassignGuestFromSeat,
    swapGuestSeats,
    deleteSeat,
    addConstraint,
    removeConstraint,
    autoAssignGuests,
    getUnassignedGuests,
    getTableOccupancy,
    validateConstraints,
    clearError
  }
}
