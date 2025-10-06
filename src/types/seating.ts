// Seating Plan Types for SvatBot.cz

export type TableShape = 'round' | 'rectangular' | 'square' | 'oval'
export type TableSize = 'small' | 'medium' | 'large' | 'xl'

export interface TablePosition {
  x: number // X coordinate in pixels
  y: number // Y coordinate in pixels
}

export interface Table {
  id: string
  weddingId: string
  name: string // "Stůl 1", "Hlavní stůl", etc.
  shape: TableShape
  size: TableSize
  capacity: number // Maximum number of seats
  position: TablePosition
  rotation: number // Rotation in degrees (0-360)

  // Seating configuration for rectangular/square tables
  headSeats?: number // Number of seats at the head (short sides) - 0, 1, or 2 per side
  seatSides?: 'all' | 'one' | 'two-opposite' // Which sides have seats: all sides, one side only, or two opposite sides

  // Visual properties
  color?: string
  isHighlighted?: boolean

  // Metadata
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface Seat {
  id: string
  tableId: string
  position: number // Position around table (1-N)
  guestId?: string // Assigned guest
  isReserved: boolean

  // Plus one information
  isPlusOne?: boolean // Is this seat for a plus one?
  plusOneOf?: string // Guest ID of the main guest (if this is a plus one)

  // Special seats
  isHostSeat?: boolean // For bride/groom
  isVipSeat?: boolean // For special guests

  // Metadata
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface SeatingPlan {
  id: string
  weddingId: string
  name: string
  description?: string
  
  // Plan properties
  venueLayout: VenueLayout
  tables: Table[]
  seats: Seat[]
  
  // Status
  isActive: boolean
  isPublished: boolean
  
  // Statistics
  totalSeats: number
  assignedSeats: number
  availableSeats: number
  
  // Metadata
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

export interface VenueLayout {
  width: number // Canvas width in pixels
  height: number // Canvas height in pixels
  backgroundImage?: string
  
  // Venue features
  danceFloor?: {
    x: number
    y: number
    width: number
    height: number
  }
  
  stage?: {
    x: number
    y: number
    width: number
    height: number
  }
  
  bar?: {
    x: number
    y: number
    width: number
    height: number
  }
  
  entrance?: {
    x: number
    y: number
    width: number
    height: number
  }
}

export interface SeatingAssignment {
  guestId: string
  tableId: string
  seatId: string
  assignedAt: Date
  assignedBy: string
  
  // Assignment preferences
  requestedBy?: string // Guest who requested this seating
  reason?: string // Why this assignment was made
  priority: 'low' | 'medium' | 'high' | 'required'
}

export interface SeatingConstraint {
  id: string
  type: 'must_sit_together' | 'cannot_sit_together' | 'must_sit_near' | 'vip_table'
  guestIds: string[]
  description: string
  priority: 'low' | 'medium' | 'high' | 'required'
  isActive: boolean
}

export interface SeatingStats {
  totalTables: number
  totalSeats: number
  assignedSeats: number
  availableSeats: number
  occupancyRate: number // Percentage
  
  // By table type
  byTableSize: Record<TableSize, {
    count: number
    seats: number
    assigned: number
  }>
  
  // Constraints
  satisfiedConstraints: number
  violatedConstraints: number
  
  // Guest categories
  byGuestCategory: Record<string, {
    total: number
    assigned: number
    unassigned: number
  }>
}

// Form data types
export interface TableFormData {
  name: string
  shape: TableShape
  size: TableSize
  capacity: number
  position: TablePosition
  rotation: number
  color?: string
  headSeats?: number
  seatSides?: 'all' | 'one' | 'two-opposite'
  notes?: string
}

export interface SeatingPlanFormData {
  name: string
  description?: string
  venueLayout: VenueLayout
}

// View options
export interface SeatingViewOptions {
  showGuestNames: boolean
  showTableNumbers: boolean
  showConstraints: boolean
  showStats: boolean
  highlightUnassigned: boolean
  highlightViolations: boolean
  zoom: number // 0.5 - 2.0
}

// Drag and drop
export interface DragItem {
  type: 'guest' | 'table'
  id: string
  data: any
}

export interface DropTarget {
  type: 'seat' | 'table' | 'canvas'
  id: string
  accepts: string[]
}

// Auto-assignment
export interface AutoAssignmentOptions {
  respectConstraints: boolean
  balanceTableSizes: boolean
  groupByCategory: boolean
  randomize: boolean
  prioritizeVips: boolean
}

export interface AutoAssignmentResult {
  success: boolean
  assignedGuests: number
  unassignedGuests: number
  violatedConstraints: SeatingConstraint[]
  suggestions: string[]
}

// Export formats
export interface SeatingExportOptions {
  format: 'pdf' | 'excel' | 'image'
  includeGuestList: boolean
  includeConstraints: boolean
  includeStats: boolean
  paperSize?: 'A4' | 'A3' | 'Letter'
}
