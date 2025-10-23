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
  Timestamp,
  deleteField
} from 'firebase/firestore'
import { db } from '@/config/firebase'
import { useAuth } from './useAuth'
import { useWedding } from './useWedding'
import { useGuest } from './useGuest'
import {
  SeatingPlan,
  Table,
  Seat,
  ChairRow,
  ChairSeat,
  SeatingAssignment,
  SeatingConstraint,
  SeatingStats,
  TableFormData,
  ChairRowFormData,
  SeatingPlanFormData,
  AutoAssignmentOptions,
  AutoAssignmentResult
} from '@/types/seating'

interface UseSeatingReturn {
  seatingPlans: SeatingPlan[]
  currentPlan: SeatingPlan | null
  tables: Table[]
  seats: Seat[]
  chairRows: ChairRow[]
  chairSeats: ChairSeat[]
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

  // Chair row management
  createChairRow: (data: ChairRowFormData, planId?: string) => Promise<ChairRow>
  updateChairRow: (chairRowId: string, updates: Partial<ChairRow>) => Promise<void>
  deleteChairRow: (chairRowId: string) => Promise<void>
  moveChairRow: (chairRowId: string, position: { x: number; y: number }) => Promise<void>

  // Seat assignment
  assignGuestToSeat: (guestId: string, seatId: string) => Promise<void>
  unassignGuestFromSeat: (seatId: string) => Promise<void>
  assignGuestToChairSeat: (guestId: string, chairSeatId: string) => Promise<void>
  unassignGuestFromChairSeat: (chairSeatId: string) => Promise<void>
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
  const [currentPlan, _setCurrentPlanState] = useState<SeatingPlan | null>(null)
  const [tables, setTables] = useState<Table[]>([])
  const [seats, setSeats] = useState<Seat[]>([])
  const [chairRows, setChairRows] = useState<ChairRow[]>([])
  const [chairSeats, setChairSeats] = useState<ChairSeat[]>([])
  const [assignments, setAssignments] = useState<SeatingAssignment[]>([])
  const [constraints, setConstraints] = useState<SeatingConstraint[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Use ref to persist current plan ID across re-renders and Firebase listener calls
  const currentPlanIdRef = useRef<string | null>(null)

  // Wrapper for setCurrentPlanState that also updates ref and localStorage
  const setCurrentPlanState = (planOrUpdater: SeatingPlan | null | ((prev: SeatingPlan | null) => SeatingPlan | null)) => {
    // Handle callback function
    if (typeof planOrUpdater === 'function') {
      _setCurrentPlanState((prev: SeatingPlan | null) => {
        const plan = planOrUpdater(prev)

        // Update ref immediately to prevent race conditions
        currentPlanIdRef.current = plan?.id || null

        // Save to localStorage
        if (wedding && plan) {
          localStorage.setItem(`currentSeatingPlanId_${wedding.id}`, plan.id)
        } else if (wedding) {
          localStorage.removeItem(`currentSeatingPlanId_${wedding.id}`)
        }

        return plan
      })
    } else {
      // Handle direct value
      const plan = planOrUpdater

      // Update ref immediately to prevent race conditions
      currentPlanIdRef.current = plan?.id || null

      // Save to localStorage
      if (wedding && plan) {
        localStorage.setItem(`currentSeatingPlanId_${wedding.id}`, plan.id)
      } else if (wedding) {
        localStorage.removeItem(`currentSeatingPlanId_${wedding.id}`)
      }

      _setCurrentPlanState(plan)
    }
  }

  // Update tables, seats, chairRows, and chairSeats when currentPlan changes
  // Use callback form to ensure state updates are not batched incorrectly
  useEffect(() => {
    if (currentPlan) {
      const newTables = currentPlan.tables || []
      const newSeats = currentPlan.seats || []
      const newChairRows = currentPlan.chairRows || []
      const newChairSeats = currentPlan.chairSeats || []

      // Use callback form to ensure correct state updates even when batched
      setTables(newTables)
      setSeats(newSeats)
      setChairRows(newChairRows)
      setChairSeats(newChairSeats)
    } else {
      setTables([])
      setSeats([])
      setChairRows([])
      setChairSeats([])
    }
  }, [currentPlan])

  // DON'T automatically update currentPlan from seatingPlans
  // This causes race conditions and unpredictable behavior
  // Instead, let the user explicitly select a plan or let the initial auto-select handle it

  // Load seating plans when wedding changes
  useEffect(() => {
    if (!wedding) {
      return
    }

    setLoading(true)

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

          // Check if a plan is already selected (using ref to avoid closure issues)
          const selectedPlanId = currentPlanIdRef.current ||
                                 (wedding ? localStorage.getItem(`currentSeatingPlanId_${wedding.id}`) : null)

          if (selectedPlanId) {
            // If a plan is already selected, update it with fresh data from Firebase
            const updatedCurrentPlan = plansData.find(p => p.id === selectedPlanId)
            if (updatedCurrentPlan) {
              setCurrentPlanState(updatedCurrentPlan)
            } else {
              setCurrentPlanState(null)
            }
          } else if (plansData.length > 0) {
            // Automatically set first plan as current ONLY if no plan is currently selected
            const firstPlan = plansData[0]
            setCurrentPlanState(firstPlan)
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

            if (existingPlans.length > 0 && !currentPlan) {
              setCurrentPlanState(existingPlans[0])
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

        if (existingPlans.length > 0 && !currentPlan) {
          setCurrentPlanState(existingPlans[0])
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

    // Convert tables with proper date handling
    const tables = (data.tables || []).map((table: any) => ({
      ...table,
      createdAt: table.createdAt?.toDate ? table.createdAt.toDate() :
                 table.createdAt ? new Date(table.createdAt) : new Date(),
      updatedAt: table.updatedAt?.toDate ? table.updatedAt.toDate() :
                 table.updatedAt ? new Date(table.updatedAt) : new Date()
    }))

    // Convert seats with proper date handling
    const seats = (data.seats || []).map((seat: any) => ({
      ...seat,
      createdAt: seat.createdAt?.toDate ? seat.createdAt.toDate() :
                 seat.createdAt ? new Date(seat.createdAt) : new Date(),
      updatedAt: seat.updatedAt?.toDate ? seat.updatedAt.toDate() :
                 seat.updatedAt ? new Date(seat.updatedAt) : new Date()
    }))

    // Convert chair rows with proper date handling
    const chairRows = (data.chairRows || []).map((row: any) => ({
      ...row,
      createdAt: row.createdAt?.toDate ? row.createdAt.toDate() :
                 row.createdAt ? new Date(row.createdAt) : new Date(),
      updatedAt: row.updatedAt?.toDate ? row.updatedAt.toDate() :
                 row.updatedAt ? new Date(row.updatedAt) : new Date()
    }))

    // Convert chair seats with proper date handling
    const chairSeats = (data.chairSeats || []).map((seat: any) => ({
      ...seat,
      createdAt: seat.createdAt?.toDate ? seat.createdAt.toDate() :
                 seat.createdAt ? new Date(seat.createdAt) : new Date(),
      updatedAt: seat.updatedAt?.toDate ? seat.updatedAt.toDate() :
                 seat.updatedAt ? new Date(seat.updatedAt) : new Date()
    }))

    return {
      id,
      weddingId: data.weddingId,
      name: data.name,
      description: data.description,
      venueLayout: data.venueLayout,
      tables,
      seats,
      chairRows,
      chairSeats,
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

      // Set as current plan BEFORE saving to Firebase
      // This prevents the Firebase listener from auto-selecting a different plan
      setCurrentPlanState(newPlan)

      // Save to Firebase (the listener will update seatingPlans array)
      try {
        const planRef = doc(db, 'seatingPlans', localId)
        const firestoreData = {
          ...planData,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        }
        await setDoc(planRef, firestoreData)
      } catch (firebaseError) {
        console.error('❌ Firebase sync failed for seating plan:', firebaseError)
        throw firebaseError
      }

      // Save to localStorage as backup
      const savedPlans = localStorage.getItem(`seatingPlans_${wedding.id}`) || '[]'
      const existingPlans = JSON.parse(savedPlans)
      existingPlans.push(newPlan)
      localStorage.setItem(`seatingPlans_${wedding.id}`, JSON.stringify(existingPlans))

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

  // Calculate statistics - include both table seats and chair seats
  const totalTableSeats = seats.length
  const totalChairSeats = chairSeats?.length || 0
  const totalAllSeats = totalTableSeats + totalChairSeats

  const assignedTableSeats = seats.filter(s => s.guestId).length
  const assignedChairSeats = chairSeats?.filter(s => s.guestId).length || 0
  const totalAssignedSeats = assignedTableSeats + assignedChairSeats

  const availableTableSeats = seats.filter(s => !s.guestId && !s.isReserved).length
  const availableChairSeats = chairSeats?.filter(s => !s.guestId && !s.isReserved).length || 0
  const totalAvailableSeats = availableTableSeats + availableChairSeats

  const stats: SeatingStats = {
    totalTables: tables.length,
    totalSeats: totalAllSeats, // Include both table and chair seats
    assignedSeats: totalAssignedSeats, // Include both table and chair seats
    availableSeats: totalAvailableSeats, // Include both table and chair seats
    occupancyRate: totalAllSeats > 0 ? Math.round((totalAssignedSeats / totalAllSeats) * 100) : 0,
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
      setCurrentPlanState((prev: SeatingPlan | null) => {
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
        // Special handling: undefined values should use deleteField() to remove from Firestore
        // BUT: deleteField() cannot be used inside arrays
        const cleanForFirestore = (obj: any, isInArray: boolean = false): any => {
          if (obj === undefined) {
            // Cannot use deleteField() inside arrays
            if (isInArray) {
              return null
            }
            // Return deleteField() marker for undefined values at top level
            return deleteField()
          }

          if (obj === null) {
            return null
          }

          if (Array.isArray(obj)) {
            // Clean items in array, but don't use deleteField() inside
            return obj.map(item => cleanForFirestore(item, true)).filter(item => item !== null)
          }

          if (obj instanceof Date) {
            return Timestamp.fromDate(obj)
          }

          if (typeof obj === 'object') {
            const cleaned: any = {}
            for (const [key, value] of Object.entries(obj)) {
              const cleanedValue = cleanForFirestore(value, isInArray)
              // Include deleteField() markers, null, booleans, and numbers
              if (cleanedValue !== undefined) {
                cleaned[key] = cleanedValue
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
    if (!wedding) {
      throw new Error('Žádná svatba není vybrána')
    }

    try {
      setError(null)

      // Remove from Firebase
      try {
        const planRef = doc(db, 'seatingPlans', planId)
        await deleteDoc(planRef)
      } catch (firebaseError) {
        console.error('❌ Firebase delete failed:', firebaseError)
        // Continue with local deletion
      }

      // Remove from state
      setSeatingPlans(prev => prev.filter(plan => plan.id !== planId))

      // If deleted plan was current, select another plan or clear
      if (currentPlan?.id === planId) {
        const remainingPlans = seatingPlans.filter(plan => plan.id !== planId)
        if (remainingPlans.length > 0) {
          setCurrentPlanState(remainingPlans[0])
        } else {
          setCurrentPlanState(null)
        }
      }

      // Remove from localStorage
      const savedPlans = localStorage.getItem(`seatingPlans_${wedding.id}`) || '[]'
      const existingPlans = JSON.parse(savedPlans)
      const filteredPlans = existingPlans.filter((plan: SeatingPlan) => plan.id !== planId)
      localStorage.setItem(`seatingPlans_${wedding.id}`, JSON.stringify(filteredPlans))

      // Clear current plan ID from localStorage if it was deleted
      const currentPlanId = localStorage.getItem(`currentSeatingPlanId_${wedding.id}`)
      if (currentPlanId === planId) {
        localStorage.removeItem(`currentSeatingPlanId_${wedding.id}`)
      }
    } catch (error) {
      console.error('Error deleting seating plan:', error)
      throw error
    }
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

  // Chair row management functions
  const createChairRow = async (data: ChairRowFormData, planId?: string): Promise<ChairRow> => {
    const activePlan = planId ? seatingPlans.find(p => p.id === planId) : currentPlan

    if (!wedding || !user || !activePlan) {
      throw new Error('Žádná svatba, uživatel nebo plán není vybrán')
    }

    try {
      setError(null)

      // Create chair row with local ID
      const localId = `chairrow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      const newChairRow: ChairRow = {
        id: localId,
        weddingId: wedding.id,
        name: data.name,
        chairCount: data.chairCount,
        orientation: data.orientation,
        position: data.position,
        rotation: data.rotation,
        color: data.color,
        spacing: data.spacing || 40,
        isHighlighted: false,
        notes: data.notes,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // Create seats for the chair row
      const newChairSeats: ChairSeat[] = []
      for (let i = 1; i <= data.chairCount; i++) {
        newChairSeats.push({
          id: `chairseat_${localId}_${i}`,
          chairRowId: localId,
          position: i,
          isReserved: false,
          createdAt: new Date(),
          updatedAt: new Date()
        })
      }

      // Update the seating plan
      const updatedChairRows = [...(activePlan.chairRows || []), newChairRow]
      const updatedChairSeats = [...(activePlan.chairSeats || []), ...newChairSeats]

      await updateSeatingPlan(activePlan.id, {
        chairRows: updatedChairRows,
        chairSeats: updatedChairSeats,
        totalSeats: (activePlan.totalSeats || 0) + data.chairCount
      })

      return newChairRow
    } catch (error: any) {
      console.error('❌ Error creating chair row:', error)
      setError('Chyba při vytváření řady židlí: ' + error.message)
      throw error
    }
  }

  const updateChairRow = async (chairRowId: string, updates: Partial<ChairRow>) => {
    if (!wedding || !currentPlan) return

    try {
      // Update chair row in the seating plan
      const updatedChairRows = (currentPlan.chairRows || []).map(row =>
        row.id === chairRowId
          ? { ...row, ...updates, updatedAt: new Date() }
          : row
      )

      // If chair count changed, update seats
      let updatedChairSeats = currentPlan.chairSeats || []
      if (updates.chairCount !== undefined) {
        const chairRow = currentPlan.chairRows?.find(r => r.id === chairRowId)
        if (chairRow && chairRow.chairCount !== updates.chairCount) {
          // Remove old seats
          updatedChairSeats = updatedChairSeats.filter(s => s.chairRowId !== chairRowId)

          // Create new seats
          const newSeats: ChairSeat[] = []
          for (let i = 1; i <= updates.chairCount; i++) {
            newSeats.push({
              id: `chairseat_${chairRowId}_${i}`,
              chairRowId: chairRowId,
              position: i,
              isReserved: false,
              createdAt: new Date(),
              updatedAt: new Date()
            })
          }
          updatedChairSeats = [...updatedChairSeats, ...newSeats]
        }
      }

      await updateSeatingPlan(currentPlan.id, {
        chairRows: updatedChairRows,
        chairSeats: updatedChairSeats
      })
    } catch (error) {
      console.error('Error updating chair row:', error)
      throw error
    }
  }

  const deleteChairRow = async (chairRowId: string) => {
    if (!wedding || !currentPlan) return

    try {
      // Remove chair row from current plan
      const updatedChairRows = (currentPlan.chairRows || []).filter(row => row.id !== chairRowId)

      // Remove seats associated with this chair row
      const updatedChairSeats = (currentPlan.chairSeats || []).filter(seat => seat.chairRowId !== chairRowId)

      // Calculate total seats
      const tableTotalSeats = currentPlan.tables.reduce((sum, t) => sum + t.capacity, 0)
      const chairRowTotalSeats = updatedChairRows.reduce((sum, r) => sum + r.chairCount, 0)

      await updateSeatingPlan(currentPlan.id, {
        chairRows: updatedChairRows,
        chairSeats: updatedChairSeats,
        totalSeats: tableTotalSeats + chairRowTotalSeats
      })
    } catch (error) {
      console.error('Error deleting chair row:', error)
      throw error
    }
  }

  const moveChairRow = async (chairRowId: string, position: { x: number; y: number }) => {
    if (!wedding || !currentPlan) return

    try {
      // Update chair row position in the seating plan
      const updatedChairRows = (currentPlan.chairRows || []).map(row =>
        row.id === chairRowId
          ? { ...row, position, updatedAt: new Date() }
          : row
      )

      await updateSeatingPlan(currentPlan.id, {
        chairRows: updatedChairRows
      })
    } catch (error) {
      console.error('Error moving chair row:', error)
    }
  }

  const assignGuestToChairSeat = async (personId: string, chairSeatId: string) => {
    if (!wedding || !currentPlan) return

    try {
      // Update the chair seat with the person ID
      const updatedChairSeats = (currentPlan.chairSeats || []).map(seat =>
        seat.id === chairSeatId
          ? { ...seat, guestId: personId, updatedAt: new Date() }
          : seat
      )

      const assignedTableSeats = currentPlan.seats.filter(s => s.guestId).length
      const assignedChairSeats = updatedChairSeats.filter(s => s.guestId).length

      await updateSeatingPlan(currentPlan.id, {
        chairSeats: updatedChairSeats,
        assignedSeats: assignedTableSeats + assignedChairSeats
      })
    } catch (error) {
      console.error('Error assigning person to chair seat:', error)
      throw error
    }
  }

  const unassignGuestFromChairSeat = async (chairSeatId: string) => {
    if (!wedding || !currentPlan) return

    try {
      // Update chair seat in the seating plan
      const updatedChairSeats = (currentPlan.chairSeats || []).map(seat =>
        seat.id === chairSeatId
          ? { ...seat, guestId: undefined, updatedAt: new Date() }
          : seat
      )

      const assignedTableSeats = currentPlan.seats.filter(s => s.guestId).length
      const assignedChairSeats = updatedChairSeats.filter(s => s.guestId).length

      await updateSeatingPlan(currentPlan.id, {
        chairSeats: updatedChairSeats,
        assignedSeats: assignedTableSeats + assignedChairSeats
      })
    } catch (error) {
      console.error('Error unassigning person from chair seat:', error)
      throw error
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
    chairRows,
    chairSeats,
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
    createChairRow,
    updateChairRow,
    deleteChairRow,
    moveChairRow,
    assignGuestToSeat,
    unassignGuestFromSeat,
    assignGuestToChairSeat,
    unassignGuestFromChairSeat,
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
