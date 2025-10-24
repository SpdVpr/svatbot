// Seating Plan Types for SvatBot.cz

export type TableShape = 'round' | 'rectangular' | 'square' | 'oval'
export type TableSize = 'small' | 'medium' | 'large' | 'xl'
export type ChairRowOrientation = 'horizontal' | 'vertical'

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
  oneSidePosition?: 'top' | 'bottom' | 'left' | 'right' // When seatSides is 'one', which side to use

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

// Standalone chair row (not attached to a table)
export interface ChairRow {
  id: string
  weddingId: string
  name: string // "Řada 1", "Ceremonie - levá strana", etc.
  chairCount: number // Number of chairs in the row
  orientation: ChairRowOrientation // horizontal or vertical
  position: TablePosition
  rotation: number // Rotation in degrees (0-360)

  // Grid layout properties (for multiple rows/columns)
  rows?: number // Number of rows in grid (default: 1)
  columns?: number // Number of columns in grid (default: chairCount)
  hasAisle?: boolean // Whether to have an aisle in the middle
  aisleWidth?: number // Width of aisle in pixels (default: 80)

  // Visual properties
  color?: string
  spacing?: number // Space between chairs in pixels (default: 40)
  isHighlighted?: boolean

  // Metadata
  notes?: string
  createdAt: Date
  updatedAt: Date
}

// Seat for standalone chair row
export interface ChairSeat {
  id: string
  chairRowId: string
  position: number // Position in row (1-N)
  guestId?: string // Assigned guest
  isReserved: boolean

  // Special seats
  isHostSeat?: boolean
  isVipSeat?: boolean

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
  chairRows?: ChairRow[] // Standalone chair rows
  chairSeats?: ChairSeat[] // Seats for standalone chair rows

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

// Custom area (dance floor, bar, stage, etc.)
export interface CustomArea {
  id: string
  name: string // "Taneční parket", "Bar", "Pódium", etc.
  x: number
  y: number
  width: number
  height: number
  rotation?: number
  color?: string // Custom color for the area
}

export interface VenueLayout {
  width: number // Canvas width in pixels
  height: number // Canvas height in pixels
  backgroundImage?: string

  // Venue features
  customAreas?: CustomArea[] // Custom areas like dance floor, bar, stage, etc.

  // Legacy support - will be migrated to customAreas
  danceFloor?: {
    x: number
    y: number
    width: number
    height: number
    rotation?: number
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
  oneSidePosition?: 'top' | 'bottom' | 'left' | 'right'
  notes?: string
}

export interface ChairRowFormData {
  name: string
  chairCount: number
  orientation: ChairRowOrientation
  position: TablePosition
  rotation: number
  rows?: number
  columns?: number
  hasAisle?: boolean
  aisleWidth?: number
  color?: string
  spacing?: number
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
  type: 'guest' | 'table' | 'chairRow'
  id: string
  data: any
}

export interface DropTarget {
  type: 'seat' | 'table' | 'canvas' | 'chairSeat'
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
