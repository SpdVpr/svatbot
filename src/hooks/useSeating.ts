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
  createTable: (data: TableFormData) => Promise<Table>
  updateTable: (tableId: string, updates: Partial<Table>) => Promise<void>
  deleteTable: (tableId: string) => Promise<void>
  moveTable: (tableId: string, position: { x: number; y: number }) => Promise<void>

  // Seat assignment
  assignGuestToSeat: (guestId: string, seatId: string) => Promise<void>
  unassignGuestFromSeat: (seatId: string) => Promise<void>
  swapGuestSeats: (seatId1: string, seatId2: string) => Promise<void>

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

  // Debug currentPlan changes
  useEffect(() => {
    console.log('🪑 useSeating currentPlan changed:', currentPlan?.name || 'null')
  }, [currentPlan])

  // Load seating plans when wedding changes
  useEffect(() => {
    if (!wedding) return

    setLoading(true)
    console.log('🪑 Loading seating plans for wedding:', wedding.id)

    // Load from localStorage
    const savedPlans = localStorage.getItem(`seatingPlans_${wedding.id}`) || '[]'
    try {
      const existingPlans = JSON.parse(savedPlans)
      console.log('🪑 Loaded from localStorage:', existingPlans)
      setSeatingPlans(existingPlans)

      // Load tables and seats for the wedding
      loadTablesAndSeats(wedding.id)

      setLoading(false)
    } catch (parseError) {
      console.error('Error parsing localStorage seating plans:', parseError)
      setSeatingPlans([])
      setLoading(false)
    }

    // Skip Firestore sync for now due to connection issues
    console.log('🪑 Skipping Firestore sync, using localStorage only')
  }, [wedding])

  // Load tables and seats from localStorage
  const loadTablesAndSeats = (weddingId: string) => {
    try {
      // Load tables
      const savedTables = localStorage.getItem(`tables_${weddingId}`) || '[]'
      const existingTables = JSON.parse(savedTables)
      console.log('🪑 Loaded tables from localStorage:', existingTables)
      setTables(existingTables)

      // Load seats
      const savedSeats = localStorage.getItem(`seats_${weddingId}`) || '[]'
      const existingSeats = JSON.parse(savedSeats)
      console.log('🪑 Loaded seats from localStorage:', existingSeats)
      setSeats(existingSeats)
    } catch (error) {
      console.error('Error loading tables and seats:', error)
      setTables([])
      setSeats([])
    }
  }

  // Convert Firestore data
  const convertFirestoreSeatingPlan = (id: string, data: any): SeatingPlan => ({
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
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
    createdBy: data.createdBy
  })

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

    console.log('🪑 Creating seating plan:', data)

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

      console.log('✅ Seating plan created locally:', newPlan)

      // Skip Firestore sync for now due to connection issues
      console.log('🪑 Skipping Firestore sync, plan saved locally only')
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

    console.log('🪑 Creating table:', data.name, 'for plan:', planId || 'current')
    console.log('🪑 Active plan found:', activePlan?.name || 'none')
    console.log('🪑 Wedding:', wedding?.id || 'none')
    console.log('🪑 User:', user?.id || 'none')

    if (!wedding || !user || !activePlan) {
      throw new Error('Žádná svatba, uživatel nebo plán není vybrán')
    }

    try {
      setError(null)

      const tableData = {
        weddingId: wedding.id,
        seatingPlanId: activePlan.id,
        name: data.name,
        shape: data.shape,
        size: data.size,
        capacity: data.capacity,
        position: data.position,
        rotation: data.rotation,
        color: data.color,
        isHighlighted: false,
        notes: data.notes,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }

      try {
        // Try to save to Firestore
        const docRef = await addDoc(collection(db, 'tables'), tableData)
        const newTable = convertFirestoreTable(docRef.id, tableData)
        setTables(prev => [...prev, newTable])

        // Create seats for the table
        await createSeatsForTable(newTable)

        return newTable
      } catch (firestoreError) {
        console.warn('⚠️ Firestore not available, using localStorage fallback')
        // Create table with local ID
        const localId = `table_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const newTable: Table = { id: localId, ...tableData, createdAt: new Date(), updatedAt: new Date() }

        // Save to localStorage
        const savedTables = localStorage.getItem(`tables_${wedding.id}`) || '[]'
        const existingTables = JSON.parse(savedTables)
        existingTables.push(newTable)
        localStorage.setItem(`tables_${wedding.id}`, JSON.stringify(existingTables))

        setTables(prev => [...prev, newTable])

        // Create seats for the table
        await createSeatsForTable(newTable)

        console.log('✅ Table created successfully:', newTable.name, newTable.id)
        return newTable
      }
    } catch (error: any) {
      console.error('Error creating table:', error)
      setError('Chyba při vytváření stolu')
      throw error
    }
  }

  // Create seats for table
  const createSeatsForTable = async (table: Table) => {
    if (!wedding) return

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

    // Save seats to localStorage
    const savedSeats = localStorage.getItem(`seats_${wedding.id}`) || '[]'
    const existingSeats = JSON.parse(savedSeats)
    const updatedSeats = [...existingSeats, ...newSeats]
    localStorage.setItem(`seats_${wedding.id}`, JSON.stringify(updatedSeats))

    setSeats(prev => [...prev, ...newSeats])
    console.log('🪑 Created seats for table:', table.name, newSeats.length)
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
      console.log('🪑 Setting current plan:', plan.name)
      setCurrentPlanState(plan)
    } else {
      console.warn('🪑 Plan not found:', planId)
    }
  }

  // Placeholder implementations for other functions
  const updateSeatingPlan = async (planId: string, updates: Partial<SeatingPlan>) => {
    if (!wedding) return

    try {
      console.log('🪑 Updating seating plan:', planId, updates)

      // Update plan in state
      setSeatingPlans(prev => prev.map(plan =>
        plan.id === planId
          ? { ...plan, ...updates, updatedAt: new Date() }
          : plan
      ))

      // Update current plan if it's the one being updated
      setCurrentPlanState(prev =>
        prev?.id === planId
          ? { ...prev, ...updates, updatedAt: new Date() }
          : prev
      )

      // Update in localStorage
      const savedPlans = localStorage.getItem(`seatingPlans_${wedding.id}`) || '[]'
      const existingPlans = JSON.parse(savedPlans)
      const updatedPlans = existingPlans.map((plan: SeatingPlan) =>
        plan.id === planId
          ? { ...plan, ...updates, updatedAt: new Date() }
          : plan
      )
      localStorage.setItem(`seatingPlans_${wedding.id}`, JSON.stringify(updatedPlans))

      console.log('✅ Seating plan updated successfully')
    } catch (error) {
      console.error('Error updating seating plan:', error)
      throw error
    }
  }

  const deleteSeatingPlan = async (planId: string) => {
    // TODO: Implement
  }

  const updateTable = async (tableId: string, updates: Partial<Table>) => {
    if (!wedding) return

    try {
      console.log('🪑 Updating table:', tableId, updates)

      // Update table in state
      setTables(prev => prev.map(table =>
        table.id === tableId
          ? { ...table, ...updates, updatedAt: new Date() }
          : table
      ))

      // Update in localStorage
      const savedTables = localStorage.getItem(`tables_${wedding.id}`) || '[]'
      const existingTables = JSON.parse(savedTables)
      const updatedTables = existingTables.map((table: Table) =>
        table.id === tableId
          ? { ...table, ...updates, updatedAt: new Date() }
          : table
      )
      localStorage.setItem(`tables_${wedding.id}`, JSON.stringify(updatedTables))

      // If capacity changed, update seats
      if (updates.capacity !== undefined) {
        const table = tables.find(t => t.id === tableId)
        if (table && table.capacity !== updates.capacity) {
          await updateSeatsForTable(tableId, updates.capacity)
        }
      }

      console.log('✅ Table updated successfully')
    } catch (error) {
      console.error('Error updating table:', error)
      throw error
    }
  }

  // Update seats when table capacity changes
  const updateSeatsForTable = async (tableId: string, newCapacity: number) => {
    if (!wedding) return

    try {
      // Remove existing seats for this table
      const updatedSeats = seats.filter(seat => seat.tableId !== tableId)

      // Create new seats
      const newSeats: Seat[] = []
      for (let i = 1; i <= newCapacity; i++) {
        const seat: Seat = {
          id: `seat_${tableId}_${i}`,
          tableId: tableId,
          position: i,
          isReserved: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
        newSeats.push(seat)
      }

      // Update state
      setSeats([...updatedSeats, ...newSeats])

      // Update localStorage
      const allSeats = [...updatedSeats, ...newSeats]
      localStorage.setItem(`seats_${wedding.id}`, JSON.stringify(allSeats))

      console.log('🪑 Updated seats for table:', tableId, newSeats.length)
    } catch (error) {
      console.error('Error updating seats for table:', error)
    }
  }

  const deleteTable = async (tableId: string) => {
    // TODO: Implement
  }

  const moveTable = async (tableId: string, position: { x: number; y: number }) => {
    if (!wedding) return

    try {
      console.log('🪑 Moving table:', tableId, 'to position:', position)

      // Update table position in state
      setTables(prev => prev.map(table =>
        table.id === tableId
          ? { ...table, position, updatedAt: new Date() }
          : table
      ))

      // Update in localStorage
      const savedTables = localStorage.getItem(`tables_${wedding.id}`) || '[]'
      const existingTables = JSON.parse(savedTables)
      const updatedTables = existingTables.map((table: Table) =>
        table.id === tableId
          ? { ...table, position, updatedAt: new Date() }
          : table
      )
      localStorage.setItem(`tables_${wedding.id}`, JSON.stringify(updatedTables))

      console.log('✅ Table moved successfully')
    } catch (error) {
      console.error('Error moving table:', error)
    }
  }

  const assignGuestToSeat = async (guestId: string, seatId: string) => {
    if (!wedding) return

    try {
      console.log('🪑 Assigning guest:', guestId, 'to seat:', seatId)

      // Update seat in state
      setSeats(prev => prev.map(seat =>
        seat.id === seatId
          ? { ...seat, guestId, updatedAt: new Date() }
          : seat
      ))

      // Update in localStorage
      const savedSeats = localStorage.getItem(`seats_${wedding.id}`) || '[]'
      const existingSeats = JSON.parse(savedSeats)
      const updatedSeats = existingSeats.map((seat: Seat) =>
        seat.id === seatId
          ? { ...seat, guestId, updatedAt: new Date() }
          : seat
      )
      localStorage.setItem(`seats_${wedding.id}`, JSON.stringify(updatedSeats))

      console.log('✅ Guest assigned successfully')
    } catch (error) {
      console.error('Error assigning guest to seat:', error)
      throw error
    }
  }

  const unassignGuestFromSeat = async (seatId: string) => {
    if (!wedding) return

    try {
      console.log('🪑 Unassigning guest from seat:', seatId)

      // Update seat in state
      setSeats(prev => prev.map(seat =>
        seat.id === seatId
          ? { ...seat, guestId: undefined, updatedAt: new Date() }
          : seat
      ))

      // Update in localStorage
      const savedSeats = localStorage.getItem(`seats_${wedding.id}`) || '[]'
      const existingSeats = JSON.parse(savedSeats)
      const updatedSeats = existingSeats.map((seat: Seat) =>
        seat.id === seatId
          ? { ...seat, guestId: undefined, updatedAt: new Date() }
          : seat
      )
      localStorage.setItem(`seats_${wedding.id}`, JSON.stringify(updatedSeats))

      console.log('✅ Guest unassigned successfully')
    } catch (error) {
      console.error('Error unassigning guest from seat:', error)
      throw error
    }
  }

  const swapGuestSeats = async (seatId1: string, seatId2: string) => {
    // TODO: Implement
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
    addConstraint,
    removeConstraint,
    autoAssignGuests,
    getUnassignedGuests,
    getTableOccupancy,
    validateConstraints,
    clearError
  }
}
