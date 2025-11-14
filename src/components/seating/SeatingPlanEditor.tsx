'use client'

import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { useSeating } from '@/hooks/useSeating'
import { useGuest } from '@/hooks/useGuest'
import {
  Plus,
  Move,
  RotateCw,
  Users,
  Settings,
  Download,
  ZoomIn,
  ZoomOut,
  Grid,
  Eye,
  EyeOff,
  MousePointer2,
  Edit3,
  Trash2,
  X,
  Printer
} from 'lucide-react'
import { Table, Seat, ChairRow, ChairSeat, SeatingViewOptions, SeatingPlan, TableShape, TableSize, ChairRowOrientation, CustomArea } from '@/types/seating'
import { GUEST_CATEGORY_LABELS, GUEST_CATEGORY_COLORS } from '@/utils/guestCategories'

interface SeatingPlanEditorProps {
  className?: string
  currentPlan: SeatingPlan
}

type PersonToSeat = {
  id: string
  displayName: string
  type: 'guest' | 'plusOne' | 'child'
  parentGuestId?: string
  category: string
  childAge?: number
}

export default function SeatingPlanEditor({ className = '', currentPlan }: SeatingPlanEditorProps) {
  const {
    tables,
    seats,
    chairRows,
    chairSeats,
    stats,
    createTable,
    updateTable,
    deleteTable,
    updateSeatingPlan,
    moveTable,
    createChairRow,
    updateChairRow,
    deleteChairRow,
    moveChairRow,
    assignGuestToSeat,
    unassignGuestFromSeat,
    assignGuestToChairSeat,
    unassignGuestFromChairSeat,
    deleteSeat,
    getUnassignedGuests
  } = useSeating()
  const { guests } = useGuest()

  const canvasRef = useRef<HTMLDivElement>(null)
  const canvasContainerRef = useRef<HTMLDivElement | null>(null)
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [draggedTablePosition, setDraggedTablePosition] = useState<{ x: number; y: number } | null>(null)
  const [showTableForm, setShowTableForm] = useState(false)
  const [editingTable, setEditingTable] = useState<Table | null>(null)
  const [editingDanceFloor, setEditingDanceFloor] = useState(false)
  const [danceFloorData, setDanceFloorData] = useState({
    x: currentPlan.venueLayout.danceFloor?.x || 500,
    y: currentPlan.venueLayout.danceFloor?.y || 300,
    width: currentPlan.venueLayout.danceFloor?.width || 200,
    height: currentPlan.venueLayout.danceFloor?.height || 200,
    rotation: currentPlan.venueLayout.danceFloor?.rotation || 0
  })
  const [showGuestAssignment, setShowGuestAssignment] = useState(false)
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null)
  const [selectedSeatType, setSelectedSeatType] = useState<'table' | 'chair'>('table')
  const [isDraggingDanceFloor, setIsDraggingDanceFloor] = useState(false)
  const [danceFloorDragOffset, setDanceFloorDragOffset] = useState({ x: 0, y: 0 })
  const [draggedDanceFloorPosition, setDraggedDanceFloorPosition] = useState<{ x: number; y: number } | null>(null)
  const [showVenueSettings, setShowVenueSettings] = useState(false)
  const [venueData, setVenueData] = useState({
    width: currentPlan.venueLayout.width,
    height: currentPlan.venueLayout.height
  })
  const [isRotating, setIsRotating] = useState(false)
  const [rotatingTable, setRotatingTable] = useState<string | null>(null)
  const [rotationStartAngle, setRotationStartAngle] = useState(0)
  const [tempRotation, setTempRotation] = useState<{ [key: string]: number }>({})
  const [isRotatingChairRow, setIsRotatingChairRow] = useState(false)
  const [rotatingChairRow, setRotatingChairRow] = useState<string | null>(null)
  const [chairRowRotationStartAngle, setChairRowRotationStartAngle] = useState(0)
  const [tempChairRowRotation, setTempChairRowRotation] = useState<{ [key: string]: number }>({})
  const [isRotatingDanceFloor, setIsRotatingDanceFloor] = useState(false)
  const [danceFloorRotationStartAngle, setDanceFloorRotationStartAngle] = useState(0)
  const [tempDanceFloorRotation, setTempDanceFloorRotation] = useState<number | null>(null)

  // Mobile long press detection
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null)
  const [isLongPress, setIsLongPress] = useState(false)

  // Seat click detection (to distinguish from drag)
  const [seatMouseDownTime, setSeatMouseDownTime] = useState<number>(0)
  const [seatMouseDownPos, setSeatMouseDownPos] = useState<{ x: number; y: number } | null>(null)
  const [tableFormData, setTableFormData] = useState<{
    name: string
    shape: TableShape
    size: TableSize
    capacity: number
    color: string
    headSeats: number
    seatSides: 'all' | 'one' | 'two-opposite'
    oneSidePosition: 'top' | 'bottom' | 'left' | 'right'
  }>({
    name: '',
    shape: 'round',
    size: 'medium',
    capacity: 8,
    color: '#F8BBD9',
    headSeats: 0,
    seatSides: 'all',
    oneSidePosition: 'bottom'
  })
  const [viewOptions, setViewOptions] = useState<SeatingViewOptions>({
    showGuestNames: true,
    showTableNumbers: true,
    showConstraints: false,
    showStats: true,
    highlightUnassigned: true,
    highlightViolations: false,
    zoom: 0.6
  })
  const [guestSearchQuery, setGuestSearchQuery] = useState('')

  // Chair row form state
  const [showChairRowForm, setShowChairRowForm] = useState(false)
  const [editingChairRow, setEditingChairRow] = useState<ChairRow | null>(null)
  const [chairRowFormData, setChairRowFormData] = useState<{
    name: string
    chairCount: number
    orientation: ChairRowOrientation
    rows: number
    columns: number
    hasAisle: boolean
    aisleWidth: number
    color: string
    spacing: number
  }>({
    name: '',
    chairCount: 6,
    orientation: 'horizontal',
    rows: 1,
    columns: 6,
    hasAisle: false,
    aisleWidth: 80,
    color: '#8B5CF6',
    spacing: 40
  })
  const [selectedChairRow, setSelectedChairRow] = useState<string | null>(null)
  const [isDraggingChairRow, setIsDraggingChairRow] = useState(false)
  const [chairRowDragOffset, setChairRowDragOffset] = useState({ x: 0, y: 0 })
  const [draggedChairRowPosition, setDraggedChairRowPosition] = useState<{ x: number; y: number } | null>(null)

  // Custom area form state (replaces dance floor)
  const [showCustomAreaForm, setShowCustomAreaForm] = useState(false)
  const [editingCustomArea, setEditingCustomArea] = useState<CustomArea | null>(null)
  const [customAreaFormData, setCustomAreaFormData] = useState({
    name: '',
    width: 200,
    height: 200,
    color: '#FCD34D'
  })
  const [isDraggingCustomArea, setIsDraggingCustomArea] = useState(false)
  const [draggingCustomAreaId, setDraggingCustomAreaId] = useState<string | null>(null)
  const [customAreaDragOffset, setCustomAreaDragOffset] = useState({ x: 0, y: 0 })
  const [draggedCustomAreaPosition, setDraggedCustomAreaPosition] = useState<{ x: number; y: number } | null>(null)
  const [isRotatingCustomArea, setIsRotatingCustomArea] = useState(false)
  const [rotatingCustomAreaId, setRotatingCustomAreaId] = useState<string | null>(null)
  const [customAreaRotationStartAngle, setCustomAreaRotationStartAngle] = useState(0)
  const [tempCustomAreaRotation, setTempCustomAreaRotation] = useState<{ [key: string]: number }>({})

  // Legacy dance floor form state (for backward compatibility)
  const [showDanceFloorForm, setShowDanceFloorForm] = useState(false)
  const [danceFloorFormData, setDanceFloorFormData] = useState({
    width: 200,
    height: 200,
    color: '#FCD34D'
  })

  const unassignedGuests = getUnassignedGuests()

  // Generate random position within visible canvas area (left half only)
  const getRandomPosition = (objectWidth: number = 120, objectHeight: number = 120) => {
    const canvasWidth = currentPlan.venueLayout.width
    const canvasHeight = currentPlan.venueLayout.height

    // Add some margin from edges (50px)
    const margin = 50
    // Limit to left half of canvas
    const maxX = Math.max(margin, (canvasWidth / 2) - objectWidth - margin)
    const maxY = Math.max(margin, canvasHeight - objectHeight - margin)

    // Try to find a position with minimal overlap (max 10 attempts)
    let bestPosition = { x: 0, y: 0 }
    let minOverlap = Infinity

    for (let attempt = 0; attempt < 10; attempt++) {
      const x = margin + Math.random() * (maxX - margin)
      const y = margin + Math.random() * (maxY - margin)

      // Check overlap with existing objects
      let overlapCount = 0

      // Check tables
      tables.forEach(table => {
        const tableSize = table.size === 'small' ? 100 : table.size === 'medium' ? 140 : table.size === 'large' ? 180 : 220
        if (Math.abs(x - table.position.x) < (objectWidth + tableSize) / 2 + 30 &&
            Math.abs(y - table.position.y) < (objectHeight + tableSize) / 2 + 30) {
          overlapCount++
        }
      })

      // Check chair rows
      chairRows?.forEach(row => {
        if (Math.abs(x - row.position.x) < (objectWidth + 100) / 2 + 30 &&
            Math.abs(y - row.position.y) < (objectHeight + 50) / 2 + 30) {
          overlapCount++
        }
      })

      // Check dance floor
      if (currentPlan.venueLayout.danceFloor) {
        const df = currentPlan.venueLayout.danceFloor
        if (Math.abs(x - df.x) < (objectWidth + df.width) / 2 + 30 &&
            Math.abs(y - df.y) < (objectHeight + df.height) / 2 + 30) {
          overlapCount++
        }
      }

      // Check custom areas
      currentPlan.venueLayout.customAreas?.forEach(area => {
        if (Math.abs(x - area.x) < (objectWidth + area.width) / 2 + 30 &&
            Math.abs(y - area.y) < (objectHeight + area.height) / 2 + 30) {
          overlapCount++
        }
      })

      // Update best position if this has less overlap
      if (overlapCount < minOverlap) {
        minOverlap = overlapCount
        bestPosition = { x: Math.round(x), y: Math.round(y) }
      }

      // If we found a position with no overlap, use it immediately
      if (overlapCount === 0) break
    }

    return bestPosition
  }

  // Generate consistent avatar for a person based on their ID
  const getAvatarForPerson = (personId: string) => {
    // Use personId to generate a consistent random number
    let hash = 0
    for (let i = 0; i < personId.length; i++) {
      hash = personId.charCodeAt(i) + ((hash << 5) - hash)
    }
    const avatarIndex = Math.abs(hash) % 6 // 6 different avatar styles

    return avatarIndex
  }

  // Render avatar SVG based on avatar index
  const renderAvatar = (avatarIndex: number, size: number = 24) => {
    const avatarStyles = [
      // Style 0: Simple face with smile
      (s: number) => (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" fill="#FED7AA" stroke="#F97316" strokeWidth="1.5"/>
          <circle cx="9" cy="10" r="1.5" fill="#92400E"/>
          <circle cx="15" cy="10" r="1.5" fill="#92400E"/>
          <path d="M8 14 Q12 16 16 14" stroke="#92400E" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        </svg>
      ),
      // Style 1: Face with glasses
      (s: number) => (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" fill="#DBEAFE" stroke="#3B82F6" strokeWidth="1.5"/>
          <circle cx="9" cy="10" r="1.5" fill="#1E3A8A"/>
          <circle cx="15" cy="10" r="1.5" fill="#1E3A8A"/>
          <rect x="7" y="8.5" width="4" height="3" rx="1.5" stroke="#1E3A8A" strokeWidth="1" fill="none"/>
          <rect x="13" y="8.5" width="4" height="3" rx="1.5" stroke="#1E3A8A" strokeWidth="1" fill="none"/>
          <line x1="11" y1="10" x2="13" y2="10" stroke="#1E3A8A" strokeWidth="1"/>
          <path d="M8 14 Q12 16 16 14" stroke="#1E3A8A" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        </svg>
      ),
      // Style 2: Face with beard
      (s: number) => (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" fill="#FEE2E2" stroke="#EF4444" strokeWidth="1.5"/>
          <circle cx="9" cy="10" r="1.5" fill="#7F1D1D"/>
          <circle cx="15" cy="10" r="1.5" fill="#7F1D1D"/>
          <path d="M8 14 Q12 16 16 14" stroke="#7F1D1D" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
          <path d="M8 15 Q8 17 10 18 Q12 19 14 18 Q16 17 16 15" fill="#92400E" opacity="0.6"/>
        </svg>
      ),
      // Style 3: Face with hair
      (s: number) => (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" fill="#FCE7F3" stroke="#EC4899" strokeWidth="1.5"/>
          <path d="M6 10 Q6 6 12 6 Q18 6 18 10" fill="#92400E" stroke="#92400E" strokeWidth="1"/>
          <circle cx="9" cy="11" r="1.5" fill="#831843"/>
          <circle cx="15" cy="11" r="1.5" fill="#831843"/>
          <path d="M8 15 Q12 17 16 15" stroke="#831843" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        </svg>
      ),
      // Style 4: Simple round face
      (s: number) => (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" fill="#E0E7FF" stroke="#6366F1" strokeWidth="1.5"/>
          <circle cx="9" cy="10" r="1.5" fill="#312E81"/>
          <circle cx="15" cy="10" r="1.5" fill="#312E81"/>
          <path d="M9 14 Q12 16 15 14" stroke="#312E81" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        </svg>
      ),
      // Style 5: Face with cap
      (s: number) => (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" fill="#D1FAE5" stroke="#10B981" strokeWidth="1.5"/>
          <path d="M6 9 L18 9 L18 7 Q18 5 12 5 Q6 5 6 7 Z" fill="#065F46" stroke="#065F46" strokeWidth="1"/>
          <circle cx="9" cy="11" r="1.5" fill="#064E3B"/>
          <circle cx="15" cy="11" r="1.5" fill="#064E3B"/>
          <path d="M8 15 Q12 17 16 15" stroke="#064E3B" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        </svg>
      )
    ]

    return avatarStyles[avatarIndex](size)
  }

  // Calculate total unassigned people (guests + plus ones + children)
  // We need to calculate this inline to avoid calling getGroupedUnassignedGuests before it's defined
  const totalUnassignedPeople = useMemo(() => {
    // Create list of all people (guests + plus ones + children)
    const allPeople: string[] = []
    guests.forEach(guest => {
      allPeople.push(guest.id)
      if (guest.hasPlusOne && guest.plusOneName) {
        allPeople.push(`${guest.id}_plusone`)
      }
      if (guest.hasChildren && guest.children) {
        guest.children.forEach((_, index) => {
          allPeople.push(`${guest.id}_child_${index}`)
        })
      }
    })

    // Get all assigned IDs from both table seats and chair seats
    const assignedTableIds = seats.filter(s => s.guestId).map(s => s.guestId)
    const assignedChairIds = (chairSeats || []).filter(s => s.guestId).map(s => s.guestId)
    const assignedIds = new Set([...assignedTableIds, ...assignedChairIds])

    // Count unassigned people
    return allPeople.filter(personId => !assignedIds.has(personId)).length
  }, [guests, seats, chairSeats])

  // Handle table drag start
  const handleTableDragStart = useCallback((tableId: string, event: React.MouseEvent) => {
    event.preventDefault()
    setSelectedTable(tableId)
    setIsDragging(true)

    const table = tables.find(t => t.id === tableId)
    if (table && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect()

      // Account for zoom when calculating offset
      const zoom = viewOptions.zoom
      const mouseX = (event.clientX - rect.left) / zoom
      const mouseY = (event.clientY - rect.top) / zoom

      setDragOffset({
        x: mouseX - table.position.x,
        y: mouseY - table.position.y
      })
    }
  }, [tables, viewOptions.zoom])

  // Handle table drag
  const handleTableDrag = useCallback((event: React.MouseEvent) => {
    if (!isDragging || !selectedTable || !canvasRef.current) return

    event.preventDefault()
    const rect = canvasRef.current.getBoundingClientRect()

    // Account for zoom when calculating position
    const zoom = viewOptions.zoom
    const mouseX = (event.clientX - rect.left) / zoom
    const mouseY = (event.clientY - rect.top) / zoom

    const newPosition = {
      x: Math.max(0, Math.min(currentPlan.venueLayout.width - 120, mouseX - dragOffset.x)),
      y: Math.max(0, Math.min(currentPlan.venueLayout.height - 120, mouseY - dragOffset.y))
    }

    // Update position immediately for smooth dragging
    setDraggedTablePosition(newPosition)
  }, [isDragging, selectedTable, dragOffset, currentPlan.venueLayout, viewOptions.zoom])

  // Handle table drag end
  const handleTableDragEnd = useCallback(() => {
    if (isDragging && selectedTable && draggedTablePosition) {
      // Save final position
      moveTable(selectedTable, draggedTablePosition)
    }
    setIsDragging(false)
    setSelectedTable(null)
    setDragOffset({ x: 0, y: 0 })
    setDraggedTablePosition(null)
  }, [isDragging, selectedTable, draggedTablePosition, moveTable])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer)
      }
    }
  }, [longPressTimer])



  // Mobile long press handlers
  const handleTouchStart = (tableId: string, e: React.TouchEvent) => {
    // Ignore multi-touch gestures (these are used for pinch-zoom on canvas)
    if (e.touches.length > 1) {
      return
    }

    setIsLongPress(false)
    const timer = setTimeout(() => {
      setIsLongPress(true)
      const table = tables.find(t => t.id === tableId)
      if (table) {
        handleEditTable(table)
      }
    }, 500) // 500ms for long press
    setLongPressTimer(timer)
  }

  const handleTouchEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      setLongPressTimer(null)
    }
    // Reset long press flag after a short delay
    setTimeout(() => setIsLongPress(false), 100)
  }

  const handleTouchMove = () => {
    // Cancel long press if user moves finger
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      setLongPressTimer(null)
    }
  }

  // Multi-touch pinch zoom for mobile (canvas-level)
  const pinchStateRef = useRef<{
    initialDistance: number
    initialZoom: number
    centerClientX: number
    centerClientY: number
    scrollLeft: number
    scrollTop: number
  } | null>(null)

  const handleCanvasTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2) {
      const [t1, t2] = [e.touches[0], e.touches[1]]
      const distance = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY)
      const centerClientX = (t1.clientX + t2.clientX) / 2
      const centerClientY = (t1.clientY + t2.clientY) / 2
      const container = canvasContainerRef.current

      pinchStateRef.current = {
        initialDistance: distance,
        initialZoom: viewOptions.zoom,
        centerClientX,
        centerClientY,
        scrollLeft: container?.scrollLeft ?? 0,
        scrollTop: container?.scrollTop ?? 0
      }
    }
  }

  const handleCanvasTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2 && pinchStateRef.current) {
      e.preventDefault()

      const [t1, t2] = [e.touches[0], e.touches[1]]
      const newDistance = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY)
      const pinch = pinchStateRef.current

      if (pinch.initialDistance === 0) return

      const scaleFactor = newDistance / pinch.initialDistance
      const newZoomUnclamped = pinch.initialZoom * scaleFactor
      const newZoom = Math.min(2.0, Math.max(0.5, newZoomUnclamped))

      setViewOptions(prev => ({
        ...prev,
        zoom: newZoom
      }))

      const container = canvasContainerRef.current
      if (container) {
        const centerClientX = (t1.clientX + t2.clientX) / 2
        const centerClientY = (t1.clientY + t2.clientY) / 2

        const deltaX = centerClientX - pinch.centerClientX
        const deltaY = centerClientY - pinch.centerClientY

        container.scrollLeft = pinch.scrollLeft - deltaX
        container.scrollTop = pinch.scrollTop - deltaY
      }
    }
  }

  const handleCanvasTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length < 2) {
      pinchStateRef.current = null
    }
  }

  // Add new table
  const handleAddTable = async () => {
    try {
      if (!currentPlan) {
        alert('Nejdříve vyberte nebo vytvořte plán usazení')
        return
      }

      // Generate random position for new table
      const randomPosition = getRandomPosition(120, 120)

      await createTable({
        name: tableFormData.name || `Stůl ${tables.length + 1}`,
        shape: tableFormData.shape,
        size: tableFormData.size,
        capacity: tableFormData.capacity,
        position: randomPosition,
        rotation: 0,
        color: tableFormData.color,
        headSeats: tableFormData.headSeats,
        seatSides: tableFormData.seatSides,
        oneSidePosition: tableFormData.oneSidePosition
      }, currentPlan.id) // Explicitly pass planId

      setShowTableForm(false)
      setTableFormData({
        name: '',
        shape: 'round',
        size: 'medium',
        capacity: 8,
        color: '#F8BBD9',
        headSeats: 0,
        seatSides: 'all',
        oneSidePosition: 'bottom'
      })
    } catch (error) {
      console.error('Error adding table:', error)
      alert('Chyba při přidávání stolu: ' + (error as Error).message)
    }
  }

  // Edit table
  const handleEditTable = (table: Table) => {
    setEditingTable(table)
    setTableFormData({
      name: table.name,
      shape: table.shape,
      size: table.size,
      capacity: table.capacity,
      color: table.color || '#F8BBD9',
      headSeats: table.headSeats || 0,
      seatSides: table.seatSides || 'all',
      oneSidePosition: table.oneSidePosition || 'bottom'
    })
    setShowTableForm(true)
  }

  // Save table changes
  const handleSaveTable = async () => {
    if (!editingTable) return

    try {
      await updateTable(editingTable.id, {
        name: tableFormData.name,
        shape: tableFormData.shape,
        size: tableFormData.size,
        capacity: tableFormData.capacity,
        color: tableFormData.color,
        headSeats: tableFormData.headSeats,
        seatSides: tableFormData.seatSides,
        oneSidePosition: tableFormData.oneSidePosition
      })
      setShowTableForm(false)
      setEditingTable(null)
      setTableFormData({
        name: '',
        shape: 'round',
        size: 'medium',
        capacity: 8,
        color: '#F8BBD9',
        headSeats: 0,
        seatSides: 'all',
        oneSidePosition: 'bottom'
      })
    } catch (error) {
      console.error('Error updating table:', error)
      alert('Chyba při úpravě stolu: ' + (error as Error).message)
    }
  }

  // Table rotation handlers - improved smooth rotation
  const handleRotationStart = (tableId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setIsRotating(true)
    setRotatingTable(tableId)

    const table = tables.find(t => t.id === tableId)
    if (!table) return

    const tableElement = document.querySelector(`[data-table-id="${tableId}"]`)
    if (!tableElement) return

    const rect = tableElement.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    // Calculate initial angle from mouse position
    const startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI)
    const initialRotation = table.rotation

    setRotationStartAngle(startAngle)

    // Store final rotation in closure
    let finalRotation = initialRotation

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!tableId) return

      const tableElement = document.querySelector(`[data-table-id="${tableId}"]`)
      if (!tableElement) return

      const rect = tableElement.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      // Calculate current angle
      const currentAngle = Math.atan2(moveEvent.clientY - centerY, moveEvent.clientX - centerX) * (180 / Math.PI)

      // Calculate angle difference
      let angleDiff = currentAngle - startAngle

      // Normalize angle difference to -180 to 180 range
      while (angleDiff > 180) angleDiff -= 360
      while (angleDiff < -180) angleDiff += 360

      // Apply rotation
      let newRotation = initialRotation + angleDiff

      // Normalize to 0-360 range
      newRotation = ((newRotation % 360) + 360) % 360

      // Store in closure and temp state
      finalRotation = newRotation
      setTempRotation(prev => ({ ...prev, [tableId]: newRotation }))
    }

    const handleMouseUp = async () => {
      // Save final rotation to Firebase
      await updateTable(tableId, { rotation: finalRotation })

      setIsRotating(false)
      setRotatingTable(null)
      setRotationStartAngle(0)
      setTempRotation(prev => {
        const newTemp = { ...prev }
        delete newTemp[tableId]
        return newTemp
      })

      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  // Tyto funkce už nepotřebujeme - vše je v handleRotationStart
  const handleRotationMove = useCallback(() => {}, [])
  const handleRotationEnd = useCallback(() => {}, [])

  // Chair row rotation handlers - improved smooth rotation
  const handleChairRowRotationStart = (chairRowId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setIsRotatingChairRow(true)
    setRotatingChairRow(chairRowId)

    const chairRow = chairRows?.find(r => r.id === chairRowId)
    if (!chairRow) return

    const chairRowElement = document.querySelector(`[data-chairrow-id="${chairRowId}"]`)
    if (!chairRowElement) return

    const rect = chairRowElement.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    // Calculate initial angle from mouse position
    const startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI)
    const initialRotation = chairRow.rotation

    setChairRowRotationStartAngle(startAngle)

    // Store final rotation in closure
    let finalRotation = initialRotation

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!chairRowId) return

      const chairRowElement = document.querySelector(`[data-chairrow-id="${chairRowId}"]`)
      if (!chairRowElement) return

      const rect = chairRowElement.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      // Calculate current angle
      const currentAngle = Math.atan2(moveEvent.clientY - centerY, moveEvent.clientX - centerX) * (180 / Math.PI)

      // Calculate angle difference
      let angleDiff = currentAngle - startAngle

      // Normalize angle difference to -180 to 180 range
      while (angleDiff > 180) angleDiff -= 360
      while (angleDiff < -180) angleDiff += 360

      // Apply rotation
      let newRotation = initialRotation + angleDiff

      // Normalize to 0-360 range
      newRotation = ((newRotation % 360) + 360) % 360

      // Store in closure and temp state
      finalRotation = newRotation
      setTempChairRowRotation(prev => ({ ...prev, [chairRowId]: newRotation }))
    }

    const handleMouseUp = async () => {
      // Save final rotation to Firebase
      await updateChairRow(chairRowId, { rotation: finalRotation })

      setIsRotatingChairRow(false)
      setRotatingChairRow(null)
      setChairRowRotationStartAngle(0)
      setTempChairRowRotation(prev => {
        const newTemp = { ...prev }
        delete newTemp[chairRowId]
        return newTemp
      })

      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  // Dance floor rotation handler - improved smooth rotation
  const handleDanceFloorRotationStart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setIsRotatingDanceFloor(true)

    const danceFloorElement = document.querySelector('[data-dancefloor="true"]')
    if (!danceFloorElement) return

    const rect = danceFloorElement.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    // Calculate initial angle from mouse position
    const startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI)
    const initialRotation = danceFloorData.rotation || 0

    setDanceFloorRotationStartAngle(startAngle)

    // Store final rotation in closure
    let finalRotation = initialRotation

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const danceFloorElement = document.querySelector('[data-dancefloor="true"]')
      if (!danceFloorElement) return

      const rect = danceFloorElement.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      // Calculate current angle
      const currentAngle = Math.atan2(moveEvent.clientY - centerY, moveEvent.clientX - centerX) * (180 / Math.PI)

      // Calculate angle difference
      let angleDiff = currentAngle - startAngle

      // Normalize angle difference to -180 to 180 range
      while (angleDiff > 180) angleDiff -= 360
      while (angleDiff < -180) angleDiff += 360

      // Apply rotation
      let newRotation = initialRotation + angleDiff

      // Normalize to 0-360 range
      newRotation = ((newRotation % 360) + 360) % 360

      // Store in closure and temp state
      finalRotation = newRotation
      setTempDanceFloorRotation(newRotation)
    }

    const handleMouseUp = async () => {
      // Save final rotation to Firebase
      const updatedDanceFloor = {
        ...danceFloorData,
        rotation: finalRotation
      }

      await updateSeatingPlan(currentPlan.id, {
        venueLayout: {
          ...currentPlan.venueLayout,
          danceFloor: updatedDanceFloor
        }
      })

      setDanceFloorData(updatedDanceFloor)

      setIsRotatingDanceFloor(false)
      setDanceFloorRotationStartAngle(0)
      setTempDanceFloorRotation(null)

      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  // Rotate table by specific degrees
  const rotateTable = async (tableId: string, degrees: number) => {
    const table = tables.find(t => t.id === tableId)
    if (!table) return

    const newRotation = ((table.rotation + degrees) % 360 + 360) % 360
    await updateTable(tableId, { rotation: newRotation })
  }

  // Delete table
  const handleDeleteTable = async (tableId: string) => {
    if (confirm('Opravdu chcete smazat tento stůl?')) {
      try {
        await deleteTable(tableId)
      } catch (error) {
        console.error('Error deleting table:', error)
        alert('Chyba při mazání stolu: ' + (error as Error).message)
      }
    }
  }

  // Chair row handlers
  const handleAddChairRow = async () => {
    try {
      if (!currentPlan) {
        alert('Nejdříve vyberte nebo vytvořte plán usazení')
        return
      }

      // Calculate total chair count based on rows and columns
      const totalChairs = chairRowFormData.rows * chairRowFormData.columns

      // Generate random position for new chair row
      // Calculate estimated size based on grid layout
      const spacing = chairRowFormData.spacing || 40
      const aisleWidth = chairRowFormData.hasAisle ? (chairRowFormData.aisleWidth || 80) : 0
      const estimatedWidth = chairRowFormData.columns * spacing + aisleWidth
      const estimatedHeight = chairRowFormData.rows * spacing
      const randomPosition = getRandomPosition(estimatedWidth, estimatedHeight)

      await createChairRow({
        name: chairRowFormData.name || `Řada ${(chairRows?.length || 0) + 1}`,
        chairCount: totalChairs,
        orientation: chairRowFormData.orientation,
        rows: chairRowFormData.rows,
        columns: chairRowFormData.columns,
        hasAisle: chairRowFormData.hasAisle,
        aisleWidth: chairRowFormData.aisleWidth,
        position: randomPosition,
        rotation: 0,
        color: chairRowFormData.color,
        spacing: chairRowFormData.spacing
      }, currentPlan.id)

      setShowChairRowForm(false)
      setChairRowFormData({
        name: '',
        chairCount: 6,
        orientation: 'horizontal',
        rows: 1,
        columns: 6,
        hasAisle: false,
        aisleWidth: 80,
        color: '#8B5CF6',
        spacing: 40
      })
    } catch (error) {
      console.error('Error adding chair row:', error)
      alert('Chyba při přidávání řady židlí: ' + (error as Error).message)
    }
  }

  const handleEditChairRow = (chairRow: ChairRow) => {
    setEditingChairRow(chairRow)
    setChairRowFormData({
      name: chairRow.name,
      chairCount: chairRow.chairCount,
      orientation: chairRow.orientation,
      rows: chairRow.rows || 1,
      columns: chairRow.columns || chairRow.chairCount,
      hasAisle: chairRow.hasAisle || false,
      aisleWidth: chairRow.aisleWidth || 80,
      color: chairRow.color || '#8B5CF6',
      spacing: chairRow.spacing || 40
    })
    setShowChairRowForm(true)
  }

  const handleSaveChairRow = async () => {
    if (!editingChairRow) return

    try {
      const totalChairs = chairRowFormData.rows * chairRowFormData.columns

      await updateChairRow(editingChairRow.id, {
        name: chairRowFormData.name,
        chairCount: totalChairs,
        orientation: chairRowFormData.orientation,
        rows: chairRowFormData.rows,
        columns: chairRowFormData.columns,
        hasAisle: chairRowFormData.hasAisle,
        aisleWidth: chairRowFormData.aisleWidth,
        color: chairRowFormData.color,
        spacing: chairRowFormData.spacing
      })
      setShowChairRowForm(false)
      setEditingChairRow(null)
      setChairRowFormData({
        name: '',
        chairCount: 6,
        orientation: 'horizontal',
        rows: 1,
        columns: 6,
        hasAisle: false,
        aisleWidth: 80,
        color: '#8B5CF6',
        spacing: 40
      })
    } catch (error) {
      console.error('Error updating chair row:', error)
      alert('Chyba při úpravě řady židlí: ' + (error as Error).message)
    }
  }

  const handleDeleteChairRow = async (chairRowId: string) => {
    if (confirm('Opravdu chcete smazat tuto řadu židlí?')) {
      try {
        await deleteChairRow(chairRowId)
      } catch (error) {
        console.error('Error deleting chair row:', error)
        alert('Chyba při mazání řady židlí: ' + (error as Error).message)
      }
    }
  }

  // Chair row drag handlers
  const handleChairRowDragStart = useCallback((chairRowId: string, event: React.MouseEvent) => {
    event.preventDefault()
    setSelectedChairRow(chairRowId)
    setIsDraggingChairRow(true)

    const chairRow = chairRows?.find(r => r.id === chairRowId)
    if (chairRow && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect()
      const zoom = viewOptions.zoom

      const offsetX = (event.clientX - rect.left) / zoom - chairRow.position.x
      const offsetY = (event.clientY - rect.top) / zoom - chairRow.position.y

      setChairRowDragOffset({ x: offsetX, y: offsetY })
    }
  }, [chairRows, viewOptions.zoom])

  const handleChairRowDrag = useCallback((event: React.MouseEvent) => {
    if (!isDraggingChairRow || !selectedChairRow || !canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const zoom = viewOptions.zoom

    const x = Math.max(0, Math.min(
      currentPlan.venueLayout.width - 100,
      (event.clientX - rect.left) / zoom - chairRowDragOffset.x
    ))
    const y = Math.max(0, Math.min(
      currentPlan.venueLayout.height - 50,
      (event.clientY - rect.top) / zoom - chairRowDragOffset.y
    ))

    setDraggedChairRowPosition({ x, y })
  }, [isDraggingChairRow, selectedChairRow, chairRowDragOffset, viewOptions.zoom, currentPlan.venueLayout])

  const handleChairRowDragEnd = useCallback(async () => {
    if (isDraggingChairRow && selectedChairRow && draggedChairRowPosition) {
      try {
        await moveChairRow(selectedChairRow, draggedChairRowPosition)
      } catch (error) {
        console.error('Error moving chair row:', error)
      }
    }

    setIsDraggingChairRow(false)
    setSelectedChairRow(null)
    setDraggedChairRowPosition(null)
  }, [isDraggingChairRow, selectedChairRow, draggedChairRowPosition, moveChairRow])

  // Rotation event listeners - ODSTRANĚNO, nyní se používá přímá logika v handleRotationStart

  // Custom area handlers
  const handleAddCustomArea = async () => {
    try {
      // Generate random position for custom area
      const randomPosition = getRandomPosition(customAreaFormData.width, customAreaFormData.height)

      const newCustomArea: CustomArea = {
        id: `customarea_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: customAreaFormData.name || 'Nová plocha',
        x: randomPosition.x,
        y: randomPosition.y,
        width: customAreaFormData.width,
        height: customAreaFormData.height,
        rotation: 0,
        color: customAreaFormData.color
      }

      const existingAreas = currentPlan.venueLayout.customAreas || []
      await updateSeatingPlan(currentPlan.id, {
        venueLayout: {
          ...currentPlan.venueLayout,
          customAreas: [...existingAreas, newCustomArea]
        }
      })

      setShowCustomAreaForm(false)
      setCustomAreaFormData({
        name: '',
        width: 200,
        height: 200,
        color: '#FCD34D'
      })
    } catch (error) {
      console.error('Error adding custom area:', error)
      alert('Chyba při přidání plochy: ' + (error as Error).message)
    }
  }

  const handleEditCustomArea = (area: CustomArea) => {
    setEditingCustomArea(area)
    setCustomAreaFormData({
      name: area.name,
      width: area.width,
      height: area.height,
      color: area.color || '#FCD34D'
    })
    setShowCustomAreaForm(true)
  }

  const handleSaveCustomArea = async () => {
    if (!editingCustomArea) return

    try {
      const existingAreas = currentPlan.venueLayout.customAreas || []
      const updatedAreas = existingAreas.map(area =>
        area.id === editingCustomArea.id
          ? {
              ...area,
              name: customAreaFormData.name,
              width: customAreaFormData.width,
              height: customAreaFormData.height,
              color: customAreaFormData.color
            }
          : area
      )

      await updateSeatingPlan(currentPlan.id, {
        venueLayout: {
          ...currentPlan.venueLayout,
          customAreas: updatedAreas
        }
      })

      setEditingCustomArea(null)
      setShowCustomAreaForm(false)
      setCustomAreaFormData({
        name: '',
        width: 200,
        height: 200,
        color: '#FCD34D'
      })
    } catch (error) {
      console.error('Error updating custom area:', error)
      alert('Chyba při úpravě plochy: ' + (error as Error).message)
    }
  }

  const handleDeleteCustomArea = async (areaId: string) => {
    if (!confirm('Opravdu chcete smazat tuto plochu?')) {
      return
    }

    try {
      const existingAreas = currentPlan.venueLayout.customAreas || []
      const updatedAreas = existingAreas.filter(area => area.id !== areaId)

      await updateSeatingPlan(currentPlan.id, {
        venueLayout: {
          ...currentPlan.venueLayout,
          customAreas: updatedAreas
        }
      })
    } catch (error) {
      console.error('Error deleting custom area:', error)
      alert('Chyba při mazání plochy: ' + (error as Error).message)
    }
  }

  // Edit dance floor
  const handleEditDanceFloor = () => {
    setEditingDanceFloor(true)
  }

  // Add dance floor
  const handleAddDanceFloor = async () => {
    try {
      // Generate random position for dance floor
      const randomPosition = getRandomPosition(danceFloorFormData.width, danceFloorFormData.height)

      const newDanceFloor = {
        x: randomPosition.x,
        y: randomPosition.y,
        width: danceFloorFormData.width,
        height: danceFloorFormData.height,
        rotation: 0
      }

      await updateSeatingPlan(currentPlan.id, {
        venueLayout: {
          ...currentPlan.venueLayout,
          danceFloor: newDanceFloor
        }
      })

      setDanceFloorData(newDanceFloor)
      setShowDanceFloorForm(false)
      setDanceFloorFormData({
        width: 200,
        height: 200,
        color: '#FCD34D'
      })
    } catch (error) {
      console.error('Error adding dance floor:', error)
      alert('Chyba při přidání tanečního parketu: ' + (error as Error).message)
    }
  }

  // Save dance floor changes
  const handleSaveDanceFloor = async () => {
    try {
      await updateSeatingPlan(currentPlan.id, {
        venueLayout: {
          ...currentPlan.venueLayout,
          danceFloor: danceFloorData
        }
      })
      setEditingDanceFloor(false)
    } catch (error) {
      console.error('Error updating dance floor:', error)
      alert('Chyba při úpravě tanečního parketu: ' + (error as Error).message)
    }
  }

  // Delete dance floor
  const handleDeleteDanceFloor = async () => {
    if (!confirm('Opravdu chcete smazat taneční parket?')) {
      return
    }

    try {
      // Create new venueLayout without danceFloor
      const { danceFloor, ...venueLayoutWithoutDanceFloor } = currentPlan.venueLayout

      // Use shallow merge for venueLayout to ensure danceFloor is removed
      await updateSeatingPlan(currentPlan.id, {
        venueLayout: {
          width: venueLayoutWithoutDanceFloor.width,
          height: venueLayoutWithoutDanceFloor.height,
          // Explicitly set danceFloor to undefined to remove it
          danceFloor: undefined as any
        }
      })
      setEditingDanceFloor(false)
    } catch (error) {
      console.error('Error deleting dance floor:', error)
      alert('Chyba při mazání tanečního parketu: ' + (error as Error).message)
    }
  }

  // Handle venue settings
  const handleEditVenue = () => {
    setShowVenueSettings(true)
  }

  const handleSaveVenue = async () => {
    try {
      console.log('Saving venue layout:', venueData)
      console.log('Current plan before update:', currentPlan.venueLayout)

      await updateSeatingPlan(currentPlan.id, {
        venueLayout: {
          ...currentPlan.venueLayout,
          width: venueData.width,
          height: venueData.height
        }
      })

      console.log('Venue layout saved successfully')
      setShowVenueSettings(false)

      // Force a small delay to ensure state updates
      setTimeout(() => {
        console.log('Current plan after update:', currentPlan.venueLayout)
      }, 100)
    } catch (error) {
      console.error('Error updating venue layout:', error)
      alert('Chyba při úpravě plochy: ' + (error as Error).message)
    }
  }

  // Quick venue size presets
  const handleVenuePreset = (preset: 'small' | 'medium' | 'large' | 'xl') => {
    const presets = {
      small: { width: 1200, height: 800 },
      medium: { width: 1600, height: 1200 },
      large: { width: 2000, height: 1600 },
      xl: { width: 2400, height: 2000 }
    }
    setVenueData(presets[preset])
  }

  // Handle print
  const handlePrint = () => {
    // Create a print-friendly version of the seating plan
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      alert('Prosím povolte vyskakovací okna pro tisk')
      return
    }

    // Helper function to get guest name for a seat - uses the main getGuestName function
    const getGuestNameForSeat = (seat: Seat) => {
      const guestNameData = getGuestName(seat)
      if (guestNameData) {
        return guestNameData
      }
      return { firstName: '', lastName: '', fullName: '' }
    }

    // Generate SVG for the entire canvas
    const generateCanvasSVG = () => {
      let svgContent = ''

      // Add dance floor if exists
      if (currentPlan.venueLayout.danceFloor) {
        const df = currentPlan.venueLayout.danceFloor
        svgContent += `
          <rect
            x="${df.x}"
            y="${df.y}"
            width="${df.width}"
            height="${df.height}"
            fill="rgba(251, 191, 36, 0.1)"
            stroke="#f59e0b"
            stroke-width="2"
            stroke-dasharray="5,5"
            rx="8"
          />
          <text
            x="${df.x + df.width / 2}"
            y="${df.y + df.height / 2}"
            text-anchor="middle"
            dominant-baseline="middle"
            font-size="16"
            font-weight="bold"
            fill="#f59e0b"
            opacity="0.5"
          >
            Taneční parket
          </text>
        `
      }

      // Add all tables
      tables.forEach(table => {
        const tableSeats = seats.filter(s => s.tableId === table.id)

        // Table shape
        if (table.shape === 'round' || table.shape === 'oval') {
          const radius = table.size === 'small' ? 40 : table.size === 'medium' ? 50 : table.size === 'large' ? 60 : 70
          svgContent += `
            <circle
              cx="${table.position.x}"
              cy="${table.position.y}"
              r="${radius}"
              fill="white"
              stroke="#2563eb"
              stroke-width="2"
            />
          `
        } else {
          const width = table.size === 'small' ? 100 : table.size === 'medium' ? 140 : table.size === 'large' ? 180 : 220
          const height = table.shape === 'square' ? width : (table.size === 'small' ? 60 : table.size === 'medium' ? 80 : table.size === 'large' ? 100 : 120)

          svgContent += `
            <rect
              x="${table.position.x - width/2}"
              y="${table.position.y - height/2}"
              width="${width}"
              height="${height}"
              fill="white"
              stroke="#2563eb"
              stroke-width="2"
              rx="8"
              transform="rotate(${table.rotation} ${table.position.x} ${table.position.y})"
            />
          `
        }

        // Table number
        svgContent += `
          <text
            x="${table.position.x}"
            y="${table.position.y}"
            text-anchor="middle"
            dominant-baseline="middle"
            font-size="20"
            font-weight="bold"
            fill="#2563eb"
          >
            ${table.name || '?'}
          </text>
        `

        // Seats and guest names
        tableSeats.forEach((seat, seatIndex) => {
          let seatX = table.position.x
          let seatY = table.position.y

          if (table.shape === 'round' || table.shape === 'oval') {
            const radius = table.size === 'small' ? 40 : table.size === 'medium' ? 50 : table.size === 'large' ? 60 : 70
            const baseRadius = radius
            const extraRadius = Math.max(0, (tableSeats.length - 6) * 5)
            const seatRadius = baseRadius + extraRadius + 15

            const seatAngle = (360 / tableSeats.length) * seatIndex
            const totalAngle = seatAngle + table.rotation
            const rad = ((totalAngle - 90) * Math.PI) / 180

            seatX = table.position.x + Math.cos(rad) * seatRadius
            seatY = table.position.y + Math.sin(rad) * seatRadius
          } else {
            const width = table.size === 'small' ? 100 : table.size === 'medium' ? 140 : table.size === 'large' ? 180 : 220
            const height = table.shape === 'square' ? width : (table.size === 'small' ? 60 : table.size === 'medium' ? 80 : table.size === 'large' ? 100 : 120)

            const seatSides = table.seatSides || 'all'
            const oneSidePosition = table.oneSidePosition || 'bottom'
            let localX = 0
            let localY = 0

            if (seatSides === 'one') {
              // All seats on one side - position depends on oneSidePosition
              if (oneSidePosition === 'bottom') {
                const spacing = width / (tableSeats.length + 1)
                localX = spacing * (seatIndex + 1) - width / 2
                localY = height / 2 + 25
              } else if (oneSidePosition === 'top') {
                const spacing = width / (tableSeats.length + 1)
                localX = spacing * (seatIndex + 1) - width / 2
                localY = -height / 2 - 25
              } else if (oneSidePosition === 'left') {
                const spacing = height / (tableSeats.length + 1)
                localX = -width / 2 - 25
                localY = spacing * (seatIndex + 1) - height / 2
              } else { // right
                const spacing = height / (tableSeats.length + 1)
                localX = width / 2 + 25
                localY = spacing * (seatIndex + 1) - height / 2
              }
            } else if (seatSides === 'two-opposite') {
              // Seats on two opposite sides (top and bottom)
              const seatsPerSide = Math.ceil(tableSeats.length / 2)
              if (seatIndex < seatsPerSide) {
                // Top side
                const spacing = width / (seatsPerSide + 1)
                localX = spacing * (seatIndex + 1) - width / 2
                localY = -height / 2 - 25
              } else {
                // Bottom side
                const bottomIndex = seatIndex - seatsPerSide
                const seatsOnBottom = tableSeats.length - seatsPerSide
                const spacing = width / (seatsOnBottom + 1)
                localX = spacing * (bottomIndex + 1) - width / 2
                localY = height / 2 + 25
              }
            } else {
              // All sides (default)
              const headSeats = table.headSeats || 0
              const seatsPerHead = headSeats
              const totalHeadSeats = seatsPerHead * 2
              const longSideSeats = tableSeats.length - totalHeadSeats
              const seatsOnTop = Math.ceil(longSideSeats / 2)
              const seatsOnBottom = longSideSeats - seatsOnTop

              if (seatIndex < seatsOnTop) {
                const spacing = width / (seatsOnTop + 1)
                localX = spacing * (seatIndex + 1) - width / 2
                localY = -height / 2 - 25
              } else if (seatIndex < seatsOnTop + seatsPerHead) {
                const headIndex = seatIndex - seatsOnTop
                const spacing = height / (seatsPerHead + 1)
                localX = width / 2 + 25
                localY = spacing * (headIndex + 1) - height / 2
              } else if (seatIndex < seatsOnTop + seatsPerHead + seatsOnBottom) {
                const bottomIndex = seatIndex - seatsOnTop - seatsPerHead
                const spacing = width / (seatsOnBottom + 1)
                localX = width / 2 - spacing * (bottomIndex + 1)
                localY = height / 2 + 25
              } else {
                const headIndex = seatIndex - seatsOnTop - seatsPerHead - seatsOnBottom
                const spacing = height / (seatsPerHead + 1)
                localX = -width / 2 - 25
                localY = height / 2 - spacing * (headIndex + 1)
              }
            }

            const rotRad = (table.rotation * Math.PI) / 180
            const rotatedX = localX * Math.cos(rotRad) - localY * Math.sin(rotRad)
            const rotatedY = localX * Math.sin(rotRad) + localY * Math.cos(rotRad)

            seatX = table.position.x + rotatedX
            seatY = table.position.y + rotatedY
          }

          // Draw seat circle
          svgContent += `
            <circle
              cx="${seatX}"
              cy="${seatY}"
              r="6"
              fill="${seat.guestId || seat.isPlusOne ? '#2563eb' : '#e5e7eb'}"
              stroke="#1e40af"
              stroke-width="1"
            />
          `

          // Draw seat number
          svgContent += `
            <text
              x="${seatX}"
              y="${seatY - 15}"
              text-anchor="middle"
              font-size="8"
              font-weight="bold"
              fill="#2563eb"
            >
              ${seat.position || '?'}
            </text>
          `

          // Draw guest name if assigned - position based on seat location
          if (seat.guestId) {
            const guestName = getGuestNameForSeat(seat)
            if (guestName.fullName) {
              // Calculate name position based on seat sides configuration
              let nameX = seatX
              let nameY = seatY
              const nameOffset = 30

              if (table.shape === 'round' || table.shape === 'oval') {
                // For round tables, names go outward from center
                const angle = (360 / tableSeats.length) * seatIndex
                const totalAngle = angle + table.rotation
                const rad = ((totalAngle - 90) * Math.PI) / 180
                nameX = seatX + Math.cos(rad) * nameOffset
                nameY = seatY + Math.sin(rad) * nameOffset
              } else {
                // For rectangular tables, position based on which side the seat is on
                const seatSides = table.seatSides || 'all'
                const oneSidePosition = table.oneSidePosition || 'bottom'

                if (seatSides === 'one') {
                  if (oneSidePosition === 'bottom') {
                    nameY = seatY + nameOffset
                  } else if (oneSidePosition === 'top') {
                    nameY = seatY - nameOffset
                  } else if (oneSidePosition === 'left') {
                    nameX = seatX - nameOffset
                  } else { // right
                    nameX = seatX + nameOffset
                  }
                } else {
                  // For 'all' or 'two-opposite', determine which side this seat is on
                  // by comparing its position relative to table center
                  const dx = seatX - table.position.x
                  const dy = seatY - table.position.y

                  if (Math.abs(dx) > Math.abs(dy)) {
                    // Seat is on left or right side
                    nameX = seatX + (dx > 0 ? nameOffset : -nameOffset)
                  } else {
                    // Seat is on top or bottom side
                    nameY = seatY + (dy > 0 ? nameOffset : -nameOffset)
                  }
                }
              }

              // First name (always show if exists)
              if (guestName.firstName) {
                svgContent += `
                  <text
                    x="${nameX}"
                    y="${nameY}"
                    text-anchor="middle"
                    font-size="8"
                    font-weight="600"
                    fill="#1f2937"
                  >
                    ${guestName.firstName}
                  </text>
                `
              }

              // Last name (only show if exists)
              if (guestName.lastName) {
                svgContent += `
                  <text
                    x="${nameX}"
                    y="${nameY + 10}"
                    text-anchor="middle"
                    font-size="8"
                    fill="#1f2937"
                  >
                    ${guestName.lastName}
                  </text>
                `
              }
            }
          }
        })
      })

      // Add chair rows
      ;(chairRows || []).forEach(chairRow => {
        const rowChairSeats = (chairSeats || []).filter(s => s.chairRowId === chairRow.id)

        const columns = chairRow.columns || chairRow.chairCount
        const rows = chairRow.rows || 1
        const spacing = chairRow.spacing || 40
        const hasAisle = chairRow.hasAisle || false
        const aisleWidth = chairRow.aisleWidth || 80

        // Draw each chair
        Array.from({ length: chairRow.chairCount }).forEach((_, index) => {
          const chairSeat = rowChairSeats.find(s => s.position === index + 1)

          // Calculate row and column position in grid
          const row = Math.floor(index / columns)
          const col = index % columns

          // Calculate position with aisle consideration
          const halfColumns = Math.floor(columns / 2)
          let chairX = col * spacing

          // Add aisle offset if chair is in right half and aisle is enabled
          if (hasAisle && col >= halfColumns) {
            chairX += aisleWidth
          }

          const chairY = row * spacing

          // Apply rotation
          const rotRad = (chairRow.rotation * Math.PI) / 180
          const rotatedX = chairX * Math.cos(rotRad) - chairY * Math.sin(rotRad)
          const rotatedY = chairX * Math.sin(rotRad) + chairY * Math.cos(rotRad)

          const finalX = chairRow.position.x + rotatedX
          const finalY = chairRow.position.y + rotatedY

          // Draw chair circle
          svgContent += `
            <circle
              cx="${finalX}"
              cy="${finalY}"
              r="6"
              fill="${chairSeat?.guestId ? '#10b981' : '#e5e7eb'}"
              stroke="#059669"
              stroke-width="1"
            />
          `

          // Draw chair number - always above the chair with more spacing
          svgContent += `
            <text
              x="${finalX}"
              y="${finalY - 20}"
              text-anchor="middle"
              font-size="8"
              font-weight="bold"
              fill="#059669"
            >
              ${chairSeat?.position || index + 1}
            </text>
          `

          // Draw guest name if assigned - always below the chair with more spacing
          if (chairSeat?.guestId) {
            const guestName = getGuestNameByPersonId(chairSeat.guestId)
            if (guestName?.fullName) {
              // Position name below the chair with sufficient spacing
              const nameX = finalX
              const nameY = finalY + 25

              // First name
              if (guestName.firstName) {
                svgContent += `
                  <text
                    x="${nameX}"
                    y="${nameY}"
                    text-anchor="middle"
                    font-size="8"
                    font-weight="600"
                    fill="#1f2937"
                  >
                    ${guestName.firstName}
                  </text>
                `
              }

              // Last name
              if (guestName.lastName) {
                svgContent += `
                  <text
                    x="${nameX}"
                    y="${nameY + 10}"
                    text-anchor="middle"
                    font-size="8"
                    fill="#1f2937"
                  >
                    ${guestName.lastName}
                  </text>
                `
              }
            }
          }
        })

        // Draw chair row label - positioned to the left to avoid overlapping with chair numbers
        const labelX = chairRow.position.x - 60 // Move label 60px to the left
        const labelY = chairRow.position.y + (rows * spacing) / 2 // Center vertically

        svgContent += `
          <text
            x="${labelX}"
            y="${labelY}"
            text-anchor="end"
            font-size="12"
            font-weight="bold"
            fill="#059669"
          >
            ${chairRow.name}
          </text>
        `
      })

      return svgContent
    }

    // Calculate scale to fit on page
    const venueWidth = currentPlan.venueLayout.width
    const venueHeight = currentPlan.venueLayout.height

    // A4 landscape: ~297mm x 210mm = ~1122px x 794px at 96dpi
    // Leave margins for header and footer
    const maxPrintWidth = 1000
    const maxPrintHeight = 650

    const scaleX = maxPrintWidth / venueWidth
    const scaleY = maxPrintHeight / venueHeight
    const scale = Math.min(scaleX, scaleY, 1) // Don't scale up, only down

    const scaledWidth = venueWidth * scale
    const scaledHeight = venueHeight * scale

    // Calculate statistics - include both table seats and chair seats
    const totalAssignedGuests = seats.filter(s => s.guestId).length + (chairSeats?.filter(s => s.guestId).length || 0)
    const totalSeats = seats.length + (chairSeats?.length || 0)
    const occupancyRate = totalSeats > 0 ? Math.round((totalAssignedGuests / totalSeats) * 100) : 0

    // Generate guest list by table and chair rows
    const generateGuestList = () => {
      // Tables list
      const tablesList = tables.map(table => {
        const tableSeats = seats.filter(s => s.tableId === table.id && s.guestId)
        if (tableSeats.length === 0) return null

        const guestNames = tableSeats.map(seat => {
          const guestName = getGuestNameForSeat(seat)
          return guestName.fullName ? `${seat.position || '?'}. ${guestName.fullName}` : null
        }).filter(Boolean)

        if (guestNames.length === 0) return null

        return `
          <div style="margin-bottom: 20px; page-break-inside: avoid;">
            <h3 style="color: #2563eb; margin: 0 0 10px 0; font-size: 14px;">
              ${table.name || 'Stůl'} (${guestNames.length} ${guestNames.length === 1 ? 'host' : guestNames.length < 5 ? 'hosté' : 'hostů'})
            </h3>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 5px; font-size: 12px;">
              ${guestNames.map(name => `
                <div style="padding: 4px 8px; background: #f3f4f6; border-left: 3px solid #2563eb; border-radius: 3px;">
                  ${name}
                </div>
              `).join('')}
            </div>
          </div>
        `
      }).filter(Boolean).join('')

      // Chair rows list
      const chairRowsList = (chairRows || []).map(chairRow => {
        const rowChairSeats = (chairSeats || []).filter(s => s.chairRowId === chairRow.id && s.guestId)
        if (rowChairSeats.length === 0) return null

        const guestNames = rowChairSeats.map(chairSeat => {
          const guestName = getGuestNameByPersonId(chairSeat.guestId)
          return guestName?.fullName ? `${chairSeat.position || '?'}. ${guestName.fullName}` : null
        }).filter(Boolean)

        if (guestNames.length === 0) return null

        return `
          <div style="margin-bottom: 20px; page-break-inside: avoid;">
            <h3 style="color: #10b981; margin: 0 0 10px 0; font-size: 14px;">
              ${chairRow.name || 'Řada židlí'} (${guestNames.length} ${guestNames.length === 1 ? 'host' : guestNames.length < 5 ? 'hosté' : 'hostů'})
            </h3>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 5px; font-size: 12px;">
              ${guestNames.map(name => `
                <div style="padding: 4px 8px; background: #f0fdf4; border-left: 3px solid #10b981; border-radius: 3px;">
                  ${name}
                </div>
              `).join('')}
            </div>
          </div>
        `
      }).filter(Boolean).join('')

      return tablesList + chairRowsList
    }

    // Generate HTML for print
    const printHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Zasedací pořádek - ${currentPlan.name}</title>
          <style>
            @media print {
              @page {
                size: A4 portrait;
                margin: 1.5cm;
              }
              body {
                margin: 0;
                padding: 0;
              }
              .page-break {
                page-break-after: always;
              }
            }

            body {
              font-family: Arial, sans-serif;
              color: #333;
              margin: 0;
              padding: 0;
            }

            .page {
              padding: 20px;
            }

            h1 {
              color: #2563eb;
              font-size: 24px;
              margin: 0 0 10px 0;
              text-align: center;
              border-bottom: 3px solid #2563eb;
              padding-bottom: 10px;
            }

            h2 {
              color: #2563eb;
              font-size: 18px;
              margin: 20px 0 15px 0;
            }

            .summary {
              background: #f3f4f6;
              padding: 12px 20px;
              border-radius: 8px;
              margin-bottom: 25px;
              text-align: center;
              font-size: 13px;
            }

            .summary-item {
              display: inline-block;
              margin: 0 20px;
            }

            .summary-label {
              font-weight: bold;
              color: #6b7280;
            }

            .summary-value {
              color: #2563eb;
              font-weight: bold;
              font-size: 1.1em;
            }

            .guest-list-container {
              column-count: 2;
              column-gap: 30px;
            }

            .canvas-container {
              border: 2px solid #2563eb;
              background: #f9fafb;
              display: inline-block;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              margin: 20px auto;
            }

            .canvas-page {
              display: flex;
              flex-direction: column;
              align-items: center;
            }

            .footer {
              margin-top: 20px;
              text-align: center;
              color: #6b7280;
              font-size: 11px;
              border-top: 1px solid #e5e7eb;
              padding-top: 10px;
            }
          </style>
        </head>
        <body>
          <!-- Page 1: Guest List -->
          <div class="page page-break">
            <h1>Zasedací pořádek - ${currentPlan.name}</h1>

            <div class="summary">
              <div class="summary-item">
                <span class="summary-label">Počet stolů:</span>
                <span class="summary-value">${tables.length}</span>
              </div>
              ${(chairRows || []).length > 0 ? `
              <div class="summary-item">
                <span class="summary-label">Počet řad židlí:</span>
                <span class="summary-value">${(chairRows || []).length}</span>
              </div>
              ` : ''}
              <div class="summary-item">
                <span class="summary-label">Celkem hostů:</span>
                <span class="summary-value">${totalAssignedGuests}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Obsazenost:</span>
                <span class="summary-value">${occupancyRate}%</span>
              </div>
            </div>

            <h2>Seznam hostů podle stolů${(chairRows || []).length > 0 ? ' a řad židlí' : ''}</h2>
            <div class="guest-list-container">
              ${generateGuestList()}
            </div>

            <div class="footer">
              Vytištěno: ${new Date().toLocaleDateString('cs-CZ', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>

          <!-- Page 2: Visual Layout -->
          <div class="page canvas-page">
            <h1>Vizuální rozmístění</h1>

            <div class="canvas-container">
              <svg width="${scaledWidth}" height="${scaledHeight}" viewBox="0 0 ${venueWidth} ${venueHeight}">
                ${generateCanvasSVG()}
              </svg>
            </div>

            <div class="footer">
              Rozměry plochy: ${venueWidth} × ${venueHeight} px
            </div>
          </div>
        </body>
      </html>
    `

    printWindow.document.write(printHTML)
    printWindow.document.close()

    // Wait for content to load, then print
    printWindow.onload = () => {
      printWindow.print()
    }
  }

  // Handle seat click for guest assignment
  const handleSeatClick = (seatId: string, seatType: 'table' | 'chair' = 'table') => {
    setSelectedSeat(seatId)
    setSelectedSeatType(seatType)
    setShowGuestAssignment(true)
  }

  // Assign person (guest/plusOne/child) to seat
  const handleAssignGuest = async (personId: string) => {
    if (!selectedSeat) return

    try {
      // PersonId can be: "guest_id", "guest_id_plusone", or "guest_id_child_0"
      // We store the full personId in the seat's guestId field
      if (selectedSeatType === 'chair') {
        await assignGuestToChairSeat(personId, selectedSeat)
      } else {
        await assignGuestToSeat(personId, selectedSeat)
      }
      setShowGuestAssignment(false)
      setSelectedSeat(null)
      setSelectedSeatType('table')
    } catch (error) {
      console.error('Error assigning person:', error)
      alert('Chyba při přiřazování osoby: ' + (error as Error).message)
    }
  }

  // Unassign guest from seat
  const handleUnassignGuest = async (seatId: string) => {
    try {
      // Check if it's a chair seat or table seat
      const isChairSeat = (chairSeats || []).some(s => s.id === seatId)

      if (isChairSeat) {
        await unassignGuestFromChairSeat(seatId)
      } else {
        await unassignGuestFromSeat(seatId)
      }
    } catch (error) {
      console.error('Error unassigning guest:', error)
      alert('Chyba při odebírání hosta: ' + (error as Error).message)
    }
  }

  // Delete seat
  const handleDeleteSeat = async (seatId: string) => {
    if (confirm('Opravdu chcete smazat tuto židli? Tato akce je nevratná.')) {
      try {
        await deleteSeat(seatId)
      } catch (error) {
        console.error('Error deleting seat:', error)
        alert('Chyba při mazání židle: ' + (error as Error).message)
      }
    }
  }

  // Handle drag and drop for guest assignment
  const handleGuestDrop = async (event: React.DragEvent, seatId: string) => {
    event.preventDefault()
    const guestId = event.dataTransfer.getData('text/plain')
    if (guestId) {
      // Detect if it's a chair seat or table seat
      const isChairSeat = (chairSeats || []).some(s => s.id === seatId)

      setSelectedSeat(seatId)
      setSelectedSeatType(isChairSeat ? 'chair' : 'table')

      // Wait for assignment to complete before clearing state
      await handleAssignGuest(guestId)
    }
  }

  const handleGuestDragStart = (event: React.DragEvent, guestId: string) => {
    event.dataTransfer.setData('text/plain', guestId)
  }

  // Custom area drag functions
  const handleCustomAreaDragStart = useCallback((event: React.MouseEvent, areaId: string) => {
    const area = currentPlan.venueLayout.customAreas?.find(a => a.id === areaId)
    if (!area || !canvasRef.current) return

    event.preventDefault()
    event.stopPropagation()
    setIsDraggingCustomArea(true)
    setDraggingCustomAreaId(areaId)

    const rect = canvasRef.current.getBoundingClientRect()
    const zoom = viewOptions.zoom
    const mouseX = (event.clientX - rect.left) / zoom
    const mouseY = (event.clientY - rect.top) / zoom

    setCustomAreaDragOffset({
      x: mouseX - area.x,
      y: mouseY - area.y
    })
  }, [currentPlan.venueLayout.customAreas, viewOptions.zoom])

  const handleCustomAreaDrag = useCallback((event: React.MouseEvent) => {
    if (!isDraggingCustomArea || !draggingCustomAreaId || !canvasRef.current) return

    const area = currentPlan.venueLayout.customAreas?.find(a => a.id === draggingCustomAreaId)
    if (!area) return

    event.preventDefault()
    const rect = canvasRef.current.getBoundingClientRect()
    const zoom = viewOptions.zoom
    const mouseX = (event.clientX - rect.left) / zoom
    const mouseY = (event.clientY - rect.top) / zoom

    const newPosition = {
      x: Math.max(0, Math.min(currentPlan.venueLayout.width - area.width,
          mouseX - customAreaDragOffset.x)),
      y: Math.max(0, Math.min(currentPlan.venueLayout.height - area.height,
          mouseY - customAreaDragOffset.y))
    }

    setDraggedCustomAreaPosition(newPosition)
  }, [isDraggingCustomArea, draggingCustomAreaId, currentPlan.venueLayout, customAreaDragOffset, viewOptions.zoom])

  const handleCustomAreaDragEnd = useCallback(async () => {
    if (isDraggingCustomArea && draggingCustomAreaId && draggedCustomAreaPosition) {
      const existingAreas = currentPlan.venueLayout.customAreas || []
      const updatedAreas = existingAreas.map(area =>
        area.id === draggingCustomAreaId
          ? { ...area, x: draggedCustomAreaPosition.x, y: draggedCustomAreaPosition.y }
          : area
      )

      try {
        await updateSeatingPlan(currentPlan.id, {
          venueLayout: {
            ...currentPlan.venueLayout,
            customAreas: updatedAreas
          }
        })
      } catch (error) {
        console.error('Error saving custom area position:', error)
      }
    }
    setIsDraggingCustomArea(false)
    setDraggingCustomAreaId(null)
    setCustomAreaDragOffset({ x: 0, y: 0 })
    setDraggedCustomAreaPosition(null)
  }, [isDraggingCustomArea, draggingCustomAreaId, draggedCustomAreaPosition, currentPlan, updateSeatingPlan])

  // Dance floor drag functions
  const handleDanceFloorDragStart = useCallback((event: React.MouseEvent) => {
    if (!currentPlan.venueLayout.danceFloor || !canvasRef.current) return

    event.preventDefault()
    event.stopPropagation()
    setIsDraggingDanceFloor(true)

    const rect = canvasRef.current.getBoundingClientRect()

    // Account for zoom when calculating offset
    const zoom = viewOptions.zoom
    const mouseX = (event.clientX - rect.left) / zoom
    const mouseY = (event.clientY - rect.top) / zoom

    setDanceFloorDragOffset({
      x: mouseX - danceFloorData.x,
      y: mouseY - danceFloorData.y
    })
  }, [currentPlan.venueLayout.danceFloor, danceFloorData, viewOptions.zoom])

  const handleDanceFloorDrag = useCallback((event: React.MouseEvent) => {
    if (!isDraggingDanceFloor || !currentPlan.venueLayout.danceFloor || !canvasRef.current) return

    event.preventDefault()
    const rect = canvasRef.current.getBoundingClientRect()

    // Account for zoom when calculating position
    const zoom = viewOptions.zoom
    const mouseX = (event.clientX - rect.left) / zoom
    const mouseY = (event.clientY - rect.top) / zoom

    const newPosition = {
      x: Math.max(0, Math.min(currentPlan.venueLayout.width - danceFloorData.width,
          mouseX - danceFloorDragOffset.x)),
      y: Math.max(0, Math.min(currentPlan.venueLayout.height - danceFloorData.height,
          mouseY - danceFloorDragOffset.y))
    }

    setDraggedDanceFloorPosition(newPosition)
  }, [isDraggingDanceFloor, currentPlan.venueLayout, danceFloorDragOffset, danceFloorData, viewOptions.zoom])

  const handleDanceFloorDragEnd = useCallback(async () => {
    if (isDraggingDanceFloor && draggedDanceFloorPosition) {
      // Update dance floor position
      const newDanceFloorData = {
        ...danceFloorData,
        x: draggedDanceFloorPosition.x,
        y: draggedDanceFloorPosition.y
      }
      setDanceFloorData(newDanceFloorData)

      // Save to seating plan
      try {
        await updateSeatingPlan(currentPlan.id, {
          venueLayout: {
            ...currentPlan.venueLayout,
            danceFloor: newDanceFloorData
          }
        })
      } catch (error) {
        console.error('Error saving dance floor position:', error)
      }
    }
    setIsDraggingDanceFloor(false)
    setDanceFloorDragOffset({ x: 0, y: 0 })
    setDraggedDanceFloorPosition(null)
  }, [isDraggingDanceFloor, draggedDanceFloorPosition, danceFloorData, updateSeatingPlan, currentPlan.id, currentPlan.venueLayout])

  // Get table seats
  const getTableSeats = (tableId: string) => {
    return seats.filter(seat => seat.tableId === tableId)
  }

  // Calculate label dimensions (approximate) - for two-line labels
  const getLabelDimensions = (firstName: string, lastName: string, rotation: number) => {
    // Approximate character width and height
    const charWidth = 7 // pixels per character
    const lineHeight = 16 // pixels per line
    const padding = 16 // 2 * (px-2 py-1)

    // Width is based on the longer of the two names
    const maxNameLength = Math.max(firstName.length, lastName.length)
    const textWidth = maxNameLength * charWidth + padding

    // Height is for two lines
    const textHeight = lineHeight * 2 + padding

    // If rotated 90 or 270 degrees, swap width and height
    if (Math.abs(rotation % 180 - 90) < 45) {
      return { width: textHeight, height: textWidth }
    }

    return { width: textWidth, height: textHeight }
  }

  // Check if two rectangles overlap
  const checkCollision = (
    x1: number, y1: number, w1: number, h1: number,
    x2: number, y2: number, w2: number, h2: number
  ) => {
    return !(
      x1 + w1 / 2 < x2 - w2 / 2 ||
      x1 - w1 / 2 > x2 + w2 / 2 ||
      y1 + h1 / 2 < y2 - h2 / 2 ||
      y1 - h1 / 2 > y2 + h2 / 2
    )
  }

  // Adjust label positions to prevent collisions
  const adjustLabelPositions = (
    labels: Array<{
      x: number
      y: number
      width: number
      height: number
      angle: number
      index: number
    }>
  ) => {
    const adjusted = labels.map(label => ({ ...label }))
    const maxIterations = 50
    const pushDistance = 5 // pixels to push apart on collision

    for (let iteration = 0; iteration < maxIterations; iteration++) {
      let hasCollision = false

      for (let i = 0; i < adjusted.length; i++) {
        for (let j = i + 1; j < adjusted.length; j++) {
          const label1 = adjusted[i]
          const label2 = adjusted[j]

          if (checkCollision(
            label1.x, label1.y, label1.width, label1.height,
            label2.x, label2.y, label2.width, label2.height
          )) {
            hasCollision = true

            // Calculate direction to push labels apart
            const dx = label2.x - label1.x
            const dy = label2.y - label1.y
            const distance = Math.sqrt(dx * dx + dy * dy) || 1

            // Normalize and push apart
            const pushX = (dx / distance) * pushDistance
            const pushY = (dy / distance) * pushDistance

            // Push both labels away from each other
            label1.x -= pushX / 2
            label1.y -= pushY / 2
            label2.x += pushX / 2
            label2.y += pushY / 2
          }
        }
      }

      // If no collisions detected, we're done
      if (!hasCollision) break
    }

    return adjusted
  }

  // Get person name by guestId - handles guests, plus ones, and children
  const getGuestNameByPersonId = (personId: string | undefined) => {
    if (!personId) return null

    // Check if it's a plus one (format: "guestId_plusone")
    if (personId.includes('_plusone')) {
      const mainGuestId = personId.replace('_plusone', '')
      const mainGuest = guests.find(g => g.id === mainGuestId)
      if (mainGuest && mainGuest.plusOneName) {
        const parts = mainGuest.plusOneName.split(' ')
        return {
          firstName: parts[0] || '',
          lastName: parts.slice(1).join(' ') || '',
          fullName: mainGuest.plusOneName
        }
      }
    }

    // Check if it's a child (format: "guestId_child_0")
    if (personId.includes('_child_')) {
      const parts = personId.split('_child_')
      const mainGuestId = parts[0]
      const childIndex = parseInt(parts[1])
      const mainGuest = guests.find(g => g.id === mainGuestId)
      if (mainGuest && mainGuest.children && mainGuest.children[childIndex]) {
        const child = mainGuest.children[childIndex]
        const nameParts = child.name.split(' ')
        return {
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          fullName: child.name
        }
      }
    }

    // Otherwise it's a main guest
    const guest = guests.find(g => g.id === personId)
    if (!guest) return null

    const firstName = guest.firstName || ''
    const lastName = guest.lastName || ''
    const fullName = `${firstName} ${lastName}`.trim()

    return {
      firstName,
      lastName,
      fullName
    }
  }

  // Get person name for seat - handles guests, plus ones, and children
  const getGuestName = (seat: Seat) => {
    return getGuestNameByPersonId(seat.guestId)
  }

  // Get person name for chair seat - handles guests, plus ones, and children
  const getGuestNameForChairSeat = (chairSeat: ChairSeat) => {
    return getGuestNameByPersonId(chairSeat.guestId)
  }

  // Check if guest has assigned seat
  const isGuestAssigned = (guestId: string) => {
    return seats.some(seat => seat.guestId === guestId) ||
           (chairSeats || []).some(seat => seat.guestId === guestId)
  }

  // Get assigned seat info for guest
  const getGuestSeatInfo = (guestId: string) => {
    // Check table seats first
    const seat = seats.find(s => s.guestId === guestId)
    if (seat) {
      const table = tables.find(t => t.id === seat.tableId)
      return table ? { tableName: table.name, seatPosition: seat.position } : null
    }

    // Check chair seats
    const chairSeat = (chairSeats || []).find(s => s.guestId === guestId)
    if (chairSeat) {
      const chairRow = (chairRows || []).find(r => r.id === chairSeat.chairRowId)
      return chairRow ? { tableName: chairRow.name, seatPosition: chairSeat.position } : null
    }

    return null
  }

  // Create extended list of people to seat (guests + plus ones + children)
  const getAllPeopleToSeat = (): PersonToSeat[] => {
    const people: PersonToSeat[] = []

    guests.forEach(guest => {
      // Add main guest
      people.push({
        id: guest.id,
        displayName: `${guest.firstName} ${guest.lastName}`,
        type: 'guest',
        category: guest.category || 'other'
      })

      // Add plus one if exists
      if (guest.hasPlusOne && guest.plusOneName) {
        people.push({
          id: `${guest.id}_plusone`,
          displayName: guest.plusOneName,
          type: 'plusOne',
          parentGuestId: guest.id,
          category: guest.category || 'other'
        })
      }

      // Add children if exist
      if (guest.hasChildren && guest.children) {
        guest.children.forEach((child, index) => {
          people.push({
            id: `${guest.id}_child_${index}`,
            displayName: child.name,
            type: 'child',
            parentGuestId: guest.id,
            category: guest.category || 'other',
            childAge: child.age
          })
        })
      }
    })

    return people
  }

  // Group unassigned people by category
  const getGroupedUnassignedGuests = () => {
    const allPeople = getAllPeopleToSeat()
    // Include both table seats and chair seats in assigned IDs
    const assignedTableIds = seats.filter(s => s.guestId).map(s => s.guestId)
    const assignedChairIds = (chairSeats || []).filter(s => s.guestId).map(s => s.guestId)
    const assignedIds = new Set([...assignedTableIds, ...assignedChairIds])
    const unassignedPeople = allPeople.filter(person => !assignedIds.has(person.id))

    const grouped: Record<string, PersonToSeat[]> = {}

    unassignedPeople.forEach(person => {
      const category = person.category || 'other'
      if (!grouped[category]) {
        grouped[category] = []
      }
      grouped[category].push(person)
    })

    // Sort categories by priority
    const categoryOrder = [
      'family-bride',
      'family-groom',
      'friends-bride',
      'friends-groom',
      'colleagues-bride',
      'colleagues-groom',
      'other'
    ]

    const sortedGrouped: Record<string, PersonToSeat[]> = {}
    categoryOrder.forEach(category => {
      if (grouped[category] && grouped[category].length > 0) {
        sortedGrouped[category] = grouped[category].sort((a, b) =>
          a.displayName.localeCompare(b.displayName)
        )
      }
    })

    return sortedGrouped
  }

  // Group all people by category (for assignment dialog)
  const getGroupedAllGuests = () => {
    const allPeople = getAllPeopleToSeat()

    // Filter by search query
    const filteredPeople = guestSearchQuery.trim()
      ? allPeople.filter(person =>
          person.displayName.toLowerCase().includes(guestSearchQuery.toLowerCase())
        )
      : allPeople

    const grouped: Record<string, PersonToSeat[]> = {}

    filteredPeople.forEach(person => {
      const category = person.category || 'other'
      if (!grouped[category]) {
        grouped[category] = []
      }
      grouped[category].push(person)
    })

    // Sort categories by priority
    const categoryOrder = [
      'family-bride',
      'family-groom',
      'friends-bride',
      'friends-groom',
      'colleagues-bride',
      'colleagues-groom',
      'other'
    ]

    const sortedGrouped: Record<string, PersonToSeat[]> = {}
    categoryOrder.forEach(category => {
      if (grouped[category] && grouped[category].length > 0) {
        sortedGrouped[category] = grouped[category].sort((a, b) =>
          a.displayName.localeCompare(b.displayName)
        )
      }
    })

    return sortedGrouped
  }

  // Sync dance floor data with current plan - only when plan ID changes
  useEffect(() => {
    if (currentPlan.venueLayout.danceFloor) {
      setDanceFloorData(prev => {
        const newData = {
          x: currentPlan.venueLayout.danceFloor!.x,
          y: currentPlan.venueLayout.danceFloor!.y,
          width: currentPlan.venueLayout.danceFloor!.width,
          height: currentPlan.venueLayout.danceFloor!.height,
          rotation: currentPlan.venueLayout.danceFloor!.rotation || 0
        }
        // Only update if values actually changed
        if (prev.x === newData.x && prev.y === newData.y &&
            prev.width === newData.width && prev.height === newData.height &&
            prev.rotation === newData.rotation) {
          return prev
        }
        return newData
      })
    }
  }, [currentPlan.id, currentPlan.venueLayout.danceFloor])

  // Sync venue data with current plan - only when values actually change
  useEffect(() => {
    setVenueData(prev => {
      // Only update if values actually changed
      if (prev.width === currentPlan.venueLayout.width &&
          prev.height === currentPlan.venueLayout.height) {
        return prev
      }
      return {
        width: currentPlan.venueLayout.width,
        height: currentPlan.venueLayout.height
      }
    })
  }, [currentPlan.id, currentPlan.venueLayout.width, currentPlan.venueLayout.height])

  return (
    <div className={`space-y-4 sm:space-y-6 ${className}`}>
      {/* Toolbar - Responsive */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          {/* Title and Add Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 min-w-0">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
              {currentPlan.name}
            </h2>

            <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => {
                  setEditingTable(null)
                  setTableFormData({
                    name: '',
                    shape: 'round',
                    size: 'medium',
                    capacity: 8,
                    color: '#F8BBD9',
                    headSeats: 0,
                    seatSides: 'all',
                    oneSidePosition: 'bottom'
                  })
                  setShowTableForm(true)
                }}
                className="btn-outline flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 whitespace-nowrap"
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Přidat stůl</span>
                <span className="sm:hidden">Stůl</span>
              </button>

              <button
                onClick={() => {
                  setEditingChairRow(null)
                  setChairRowFormData({
                    name: '',
                    chairCount: 6,
                    orientation: 'horizontal',
                    rows: 1,
                    columns: 6,
                    hasAisle: false,
                    aisleWidth: 80,
                    color: '#8B5CF6',
                    spacing: 40
                  })
                  setShowChairRowForm(true)
                }}
                className="btn-outline flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 whitespace-nowrap"
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Přidat židle</span>
                <span className="sm:hidden">Židle</span>
              </button>

              <button
                onClick={() => {
                  setEditingCustomArea(null)
                  setCustomAreaFormData({
                    name: '',
                    width: 200,
                    height: 200,
                    color: '#FCD34D'
                  })
                  setShowCustomAreaForm(true)
                }}
                className="btn-outline flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 whitespace-nowrap"
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Přidat plochu</span>
                <span className="sm:hidden">Plocha</span>
              </button>

              <button
                onClick={handleEditVenue}
                className="btn-outline flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 whitespace-nowrap"
                title="Nastavit velikost plochy"
              >
                <Grid className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Plocha</span>
              </button>
            </div>
          </div>

          {/* View Controls */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Zoom controls */}
            <div className="flex items-center bg-gray-100 rounded-lg p-0.5 sm:p-1">
              <button
                onClick={() => setViewOptions(prev => ({ ...prev, zoom: Math.max(0.5, prev.zoom - 0.1) }))}
                className="p-1.5 sm:p-2 rounded-md hover:bg-white transition-colors"
              >
                <ZoomOut className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
              <span className="px-2 sm:px-3 text-xs sm:text-sm font-medium">
                {Math.round(viewOptions.zoom * 100)}%
              </span>
              <button
                onClick={() => setViewOptions(prev => ({ ...prev, zoom: Math.min(2.0, prev.zoom + 0.1) }))}
                className="p-1.5 sm:p-2 rounded-md hover:bg-white transition-colors"
              >
                <ZoomIn className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            </div>

            {/* View options */}
            <button
              onClick={() => setViewOptions(prev => ({ ...prev, showGuestNames: !prev.showGuestNames }))}
              className={`p-1.5 sm:p-2 rounded-md transition-colors ${
                viewOptions.showGuestNames ? 'bg-primary-100 text-primary-600' : 'hover:bg-gray-100'
              }`}
              title="Zobrazit jména hostů"
            >
              {viewOptions.showGuestNames ? <Eye className="w-3 h-3 sm:w-4 sm:h-4" /> : <EyeOff className="w-3 h-3 sm:w-4 sm:h-4" />}
            </button>

            <button
              onClick={handlePrint}
              className="btn-primary flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2"
              title="Vytisknout zasedací pořádek"
            >
              <Printer className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Tisk</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Canvas - Mobile optimized */}
        <div className="lg:col-span-3">
          <div
            ref={canvasContainerRef}
            className="bg-white rounded-xl border border-gray-200 overflow-auto max-h-[60vh] sm:max-h-[70vh] lg:max-h-none"
          >
            <div
              ref={canvasRef}
              className="relative bg-gray-50 cursor-crosshair border-2 sm:border-4 border-dashed border-blue-300 touch-pan-x touch-pan-y"
              style={{
                transform: `scale(${viewOptions.zoom})`,
                transformOrigin: 'top left',
                width: currentPlan.venueLayout.width,
                height: currentPlan.venueLayout.height,
                minWidth: currentPlan.venueLayout.width,
                minHeight: currentPlan.venueLayout.height,
                boxShadow: 'inset 0 0 0 1px rgba(59, 130, 246, 0.3)'
              }}
              onTouchStart={handleCanvasTouchStart}
              onTouchMove={handleCanvasTouchMove}
              onTouchEnd={handleCanvasTouchEnd}
              onMouseMove={(e) => {
                handleTableDrag(e)
                handleCustomAreaDrag(e)
                handleDanceFloorDrag(e)
                handleChairRowDrag(e)
              }}
              onMouseUp={() => {
                handleTableDragEnd()
                handleCustomAreaDragEnd()
                handleDanceFloorDragEnd()
                handleChairRowDragEnd()
              }}
              onMouseLeave={() => {
                handleTableDragEnd()
                handleCustomAreaDragEnd()
                handleDanceFloorDragEnd()
              }}

            >
              {/* Canvas size indicator - Responsive */}
              <div className="absolute top-1 sm:top-2 left-1 sm:left-2 bg-blue-500 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded shadow-md pointer-events-none z-50">
                {currentPlan.venueLayout.width} × {currentPlan.venueLayout.height}
              </div>

              {/* Custom areas */}
              {currentPlan.venueLayout.customAreas?.map(area => {
                const isDragged = isDraggingCustomArea && draggingCustomAreaId === area.id && draggedCustomAreaPosition
                const position = isDragged ? draggedCustomAreaPosition : { x: area.x, y: area.y }
                const rotation = tempCustomAreaRotation[area.id] !== undefined ? tempCustomAreaRotation[area.id] : (area.rotation || 0)

                return (
                  <div
                    key={area.id}
                    data-customarea={area.id}
                    className={`group absolute border-2 rounded-lg flex items-center justify-center cursor-move ${
                      !isDragged ? 'transition-colors' : ''
                    } ${isDraggingCustomArea && draggingCustomAreaId === area.id ? 'z-20 scale-105' : 'z-10'}`}
                    style={{
                      left: position.x,
                      top: position.y,
                      width: area.width,
                      height: area.height,
                      backgroundColor: area.color || '#FCD34D',
                      borderColor: area.color ? `${area.color}CC` : '#F59E0B',
                      transform: `rotate(${rotation}deg)`,
                      transformOrigin: 'center'
                    }}
                    onMouseDown={(e) => handleCustomAreaDragStart(e, area.id)}
                    onDoubleClick={(e) => {
                      e.stopPropagation()
                      handleEditCustomArea(area)
                    }}
                    title="Táhněte pro přesun, dvojklik pro úpravu"
                  >
                    {/* Delete button - visible on hover */}
                    <div className="absolute -top-2 -left-2 opacity-0 group-hover:opacity-100 transition-opacity z-30">
                      <button
                        className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteCustomArea(area.id)
                        }}
                        title="Smazat plochu"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Info on hover - above area */}
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
                      <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                        Dvojklik pro úpravu
                      </div>
                    </div>

                    <span className="text-sm font-medium" style={{ color: area.color ? '#000' : '#92400E' }}>
                      {area.name}
                    </span>
                  </div>
                )
              })}

              {/* Venue features */}
              {currentPlan.venueLayout.danceFloor && (() => {
                const isDraggedDanceFloor = isDraggingDanceFloor && draggedDanceFloorPosition
                const position = isDraggedDanceFloor ? draggedDanceFloorPosition : {
                  x: danceFloorData.x,
                  y: danceFloorData.y
                }
                const rotation = tempDanceFloorRotation !== null ? tempDanceFloorRotation : (danceFloorData.rotation || 0)

                return (
                  <div
                    data-dancefloor="true"
                    className={`group absolute bg-yellow-200 border-2 border-yellow-400 rounded-lg flex items-center justify-center cursor-move hover:bg-yellow-300 ${
                      !isDraggedDanceFloor ? 'transition-colors' : ''
                    } ${isDraggingDanceFloor ? 'z-20 scale-105' : 'z-10'}`}
                    style={{
                      left: position.x,
                      top: position.y,
                      width: danceFloorData.width,
                      height: danceFloorData.height,
                      transform: `rotate(${rotation}deg)`,
                      transformOrigin: 'center'
                    }}
                    onMouseDown={handleDanceFloorDragStart}
                    onDoubleClick={(e) => {
                      e.stopPropagation()
                      handleEditDanceFloor()
                    }}
                    title="Táhněte pro přesun, dvojklik pro úpravu velikosti"
                  >
                    {/* Rotation handle - visible on hover */}
                    <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity z-30">
                      <button
                        className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
                        onMouseDown={(e) => handleDanceFloorRotationStart(e)}
                        onClick={(e) => e.stopPropagation()}
                        title="Táhněte pro rotaci"
                      >
                        <RotateCw className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Info on hover - above dance floor */}
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
                      <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                        Dvojklik pro úpravu
                      </div>
                    </div>

                    <span className="text-sm font-medium text-yellow-800">Taneční parket</span>
                  </div>
                )
              })()}

              {/* Tables */}
              {tables.map(table => {
                const tableSeats = getTableSeats(table.id)
                const isSelected = selectedTable === table.id
                const isDraggedTable = isSelected && isDragging && draggedTablePosition
                const position = isDraggedTable ? draggedTablePosition : table.position
                const rotation = tempRotation[table.id] !== undefined ? tempRotation[table.id] : table.rotation

                return (
                  <div
                    key={table.id}
                    data-table-id={table.id}
                    className={`absolute group ${
                      isSelected ? 'z-10 scale-105' : 'z-0'
                    } ${!isDraggedTable ? 'transition-all duration-200' : ''}`}
                    style={{
                      left: position.x,
                      top: position.y,
                    }}
                  >
                    {/* Table container with rotation */}
                    <div
                      className="relative cursor-move"
                      style={{
                        transform: `rotate(${rotation}deg)`
                      }}
                      onMouseDown={(e) => handleTableDragStart(table.id, e)}
                      onDoubleClick={() => handleEditTable(table)}
                      onTouchStart={(e) => handleTouchStart(table.id, e)}
                      onTouchEnd={handleTouchEnd}
                      onTouchMove={handleTouchMove}
                      title={
                        typeof window !== 'undefined' && 'ontouchstart' in window
                          ? `${table.name} - Dlouhé stisknutí pro úpravu, táhněte pro přesun`
                          : `${table.name} - Dvojklik pro úpravu, táhněte pro přesun`
                      }
                    >
                    {/* Table shape */}
                    <div
                      className={`relative border-2 transition-colors ${
                        isSelected
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-300 bg-white hover:border-primary-300'
                      }`}
                      style={{
                        width: table.size === 'small' ? 80 : table.size === 'medium' ? 120 : table.size === 'large' ? 160 : 200,
                        height: table.shape === 'round' || table.shape === 'square'
                          ? (table.size === 'small' ? 80 : table.size === 'medium' ? 120 : table.size === 'large' ? 160 : 200)
                          : table.shape === 'oval'
                            ? (table.size === 'small' ? 60 : table.size === 'medium' ? 90 : table.size === 'large' ? 120 : 150)
                            : (table.size === 'small' ? 60 : table.size === 'medium' ? 80 : table.size === 'large' ? 100 : 120), // rectangular
                        borderRadius: table.shape === 'round' ? '50%' : table.shape === 'oval' ? '50%' : '8px',
                        backgroundColor: table.color || '#ffffff'
                      }}
                    >
                      {/* Table number */}
                      {viewOptions.showTableNumbers && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-sm font-semibold text-gray-700">
                            {table.name}
                          </span>
                        </div>
                      )}

                      {/* Seats around table - positioned based on table shape */}
                      {tableSeats.map((seat) => {
                        let seatX = 0
                        let seatY = 0

                        // Use seat.position instead of index to maintain consistent positioning
                        const seatIndex = (seat.position || 1) - 1

                        if (table.shape === 'round' || table.shape === 'oval') {
                          // Circular positioning for round/oval tables
                          const angle = (360 / table.capacity) * seatIndex
                          const radius = table.size === 'small' ? 50 : table.size === 'medium' ? 70 : table.size === 'large' ? 90 : 110
                          seatX = Math.cos((angle - 90) * Math.PI / 180) * radius
                          seatY = Math.sin((angle - 90) * Math.PI / 180) * radius
                        } else {
                          // Rectangular/square positioning with optional head seats and seat sides
                          const tableWidth = table.size === 'small' ? 100 : table.size === 'medium' ? 140 : table.size === 'large' ? 180 : 220
                          const tableHeight = table.shape === 'square'
                            ? tableWidth
                            : (table.size === 'small' ? 60 : table.size === 'medium' ? 80 : table.size === 'large' ? 100 : 120)

                          const seatOffset = 10 // Distance from table edge
                          const totalSeats = table.capacity // Use table capacity for consistent positioning
                          const seatSides = table.seatSides || 'all'
                          const oneSidePosition = table.oneSidePosition || 'bottom'

                          if (seatSides === 'one') {
                            // All seats on one side - position depends on oneSidePosition
                            if (oneSidePosition === 'bottom') {
                              const spacing = tableWidth / (totalSeats + 1)
                              seatX = spacing * (seatIndex + 1) - tableWidth / 2
                              seatY = tableHeight / 2 + seatOffset
                            } else if (oneSidePosition === 'top') {
                              const spacing = tableWidth / (totalSeats + 1)
                              seatX = spacing * (seatIndex + 1) - tableWidth / 2
                              seatY = -tableHeight / 2 - seatOffset
                            } else if (oneSidePosition === 'left') {
                              const spacing = tableHeight / (totalSeats + 1)
                              seatX = -tableWidth / 2 - seatOffset
                              seatY = spacing * (seatIndex + 1) - tableHeight / 2
                            } else { // right
                              const spacing = tableHeight / (totalSeats + 1)
                              seatX = tableWidth / 2 + seatOffset
                              seatY = spacing * (seatIndex + 1) - tableHeight / 2
                            }
                          } else if (seatSides === 'two-opposite') {
                            // Seats on two opposite sides (top and bottom)
                            const seatsPerSide = Math.ceil(totalSeats / 2)
                            if (seatIndex < seatsPerSide) {
                              // Top side
                              const spacing = tableWidth / (seatsPerSide + 1)
                              seatX = spacing * (seatIndex + 1) - tableWidth / 2
                              seatY = -tableHeight / 2 - seatOffset
                            } else {
                              // Bottom side
                              const bottomIndex = seatIndex - seatsPerSide
                              const seatsOnBottom = totalSeats - seatsPerSide
                              const spacing = tableWidth / (seatsOnBottom + 1)
                              seatX = spacing * (bottomIndex + 1) - tableWidth / 2
                              seatY = tableHeight / 2 + seatOffset
                            }
                          } else {
                            // All sides (default)
                            const headSeats = table.headSeats || 0
                            const seatsPerHead = headSeats // seats per short side
                            const totalHeadSeats = seatsPerHead * 2 // both short sides
                            const longSideSeats = totalSeats - totalHeadSeats

                            // Distribute: half on top long side, half on bottom long side, plus head seats on short sides
                            const seatsOnTop = Math.ceil(longSideSeats / 2)
                            const seatsOnBottom = longSideSeats - seatsOnTop

                            if (seatIndex < seatsOnTop) {
                              // Top long side
                              const spacing = tableWidth / (seatsOnTop + 1)
                              seatX = spacing * (seatIndex + 1) - tableWidth / 2
                              seatY = -tableHeight / 2 - seatOffset
                            } else if (seatIndex < seatsOnTop + seatsPerHead) {
                              // Right short side (head)
                              const headIndex = seatIndex - seatsOnTop
                              const spacing = tableHeight / (seatsPerHead + 1)
                              seatX = tableWidth / 2 + seatOffset
                              seatY = spacing * (headIndex + 1) - tableHeight / 2
                            } else if (seatIndex < seatsOnTop + seatsPerHead + seatsOnBottom) {
                              // Bottom long side
                              const bottomIndex = seatIndex - seatsOnTop - seatsPerHead
                              const spacing = tableWidth / (seatsOnBottom + 1)
                              seatX = tableWidth / 2 - spacing * (bottomIndex + 1)
                              seatY = tableHeight / 2 + seatOffset
                            } else {
                              // Left short side (head)
                              const headIndex = seatIndex - seatsOnTop - seatsPerHead - seatsOnBottom
                              const spacing = tableHeight / (seatsPerHead + 1)
                              seatX = -tableWidth / 2 - seatOffset
                              seatY = tableHeight / 2 - spacing * (headIndex + 1)
                            }
                          }
                        }

                        const guestNameData = getGuestName(seat)
                        const guestNameTooltip = guestNameData?.fullName || null

                        return (
                          <div
                            key={seat.id}
                            className={`absolute w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-medium transition-colors cursor-pointer overflow-hidden ${
                              seat.guestId
                                ? 'bg-white border-green-400 hover:border-green-500'
                                : seat.isReserved
                                ? 'bg-yellow-100 border-yellow-400 text-yellow-800 hover:bg-yellow-200'
                                : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-primary-100 hover:border-primary-400'
                            }`}
                            style={{
                              left: `calc(50% + ${seatX}px - 12px)`,
                              top: `calc(50% + ${seatY}px - 12px)`
                            }}
                            title={guestNameTooltip || `Místo ${seat.position} - levé tlačítko: přiřadit hosta, pravé tlačítko: smazat židli`}
                            onMouseDown={(e) => {
                              if (e.button === 0) { // Left click only
                                e.stopPropagation() // Prevent table drag from starting
                                setSeatMouseDownTime(Date.now())
                                setSeatMouseDownPos({ x: e.clientX, y: e.clientY })
                              }
                            }}
                            onMouseUp={(e) => {
                              if (e.button === 0) { // Left click only
                                e.stopPropagation() // Prevent table drag from starting
                                const timeDiff = Date.now() - seatMouseDownTime
                                const posChanged = seatMouseDownPos && (
                                  Math.abs(e.clientX - seatMouseDownPos.x) > 5 ||
                                  Math.abs(e.clientY - seatMouseDownPos.y) > 5
                                )

                                // Only trigger click if it was quick and mouse didn't move much (not a drag)
                                if (timeDiff < 300 && !posChanged) {
                                  if (seat.guestId) {
                                    handleUnassignGuest(seat.id)
                                  } else {
                                    handleSeatClick(seat.id)
                                  }
                                }

                                setSeatMouseDownTime(0)
                                setSeatMouseDownPos(null)
                              }
                            }}
                            onContextMenu={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              handleDeleteSeat(seat.id)
                            }}
                            onDrop={(e) => handleGuestDrop(e, seat.id)}
                            onDragOver={(e) => e.preventDefault()}
                          >
                            {seat.guestId ? renderAvatar(getAvatarForPerson(seat.guestId), 24) : seat.position}
                          </div>
                        )
                      })}
                    </div>

                    {/* Rotation handles - visible on hover */}
                    <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
                        onMouseDown={(e) => handleRotationStart(table.id, e)}
                        onClick={(e) => e.stopPropagation()}
                        title="Táhněte pro rotaci"
                      >
                        <RotateCw className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Table info on hover - centered in table */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
                      <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                        Dvojklik pro úpravu
                      </div>
                    </div>
                    </div>

                    {/* Guest names positioned around table - adapted to table shape */}
                    {viewOptions.showGuestNames && (() => {
                      // First pass: calculate initial positions for all labels
                      const labelData = tableSeats
                        .filter(s => s.guestId)
                        .map((seat) => {
                          const guestName = getGuestName(seat)
                          if (!guestName) return null

                          // Use seat.position instead of array index to maintain consistent positioning
                          const seatIndex = (seat.position || 1) - 1
                          if (seatIndex < 0) return null

                          let nameX = 0
                          let nameY = 0
                          let textRotation = 0

                          if (table.shape === 'round' || table.shape === 'oval') {
                            // Circular positioning for round/oval tables
                            const seatAngle = (360 / table.capacity) * seatIndex
                            const totalAngle = seatAngle + table.rotation
                            const baseRadius = table.size === 'small' ? 90 : table.size === 'medium' ? 110 : table.size === 'large' ? 130 : 150
                            const extraRadius = Math.max(0, (table.capacity - 6) * 5)
                            const nameRadius = baseRadius + extraRadius
                            nameX = Math.cos((totalAngle - 90) * Math.PI / 180) * nameRadius
                            nameY = Math.sin((totalAngle - 90) * Math.PI / 180) * nameRadius

                            // Keep text horizontal (no rotation)
                            textRotation = 0
                          } else {
                            // Rectangular/square positioning with seat sides support
                            const tableWidth = table.size === 'small' ? 100 : table.size === 'medium' ? 140 : table.size === 'large' ? 180 : 220
                            const tableHeight = table.shape === 'square'
                              ? tableWidth
                              : (table.size === 'small' ? 60 : table.size === 'medium' ? 80 : table.size === 'large' ? 100 : 120)

                            const baseOffset = 45
                            const extraOffset = Math.max(0, (table.capacity - 6) * 3)
                            const nameOffset = baseOffset + extraOffset
                            const totalSeats = table.capacity
                            const seatSides = table.seatSides || 'all'
                            const oneSidePosition = table.oneSidePosition || 'bottom'

                            // Calculate position in non-rotated space
                            let localX = 0
                            let localY = 0

                            if (seatSides === 'one') {
                              // All seats on one side - position depends on oneSidePosition
                              if (oneSidePosition === 'bottom') {
                                const spacing = tableWidth / (totalSeats + 1)
                                localX = spacing * (seatIndex + 1) - tableWidth / 2
                                localY = tableHeight / 2 + nameOffset
                              } else if (oneSidePosition === 'top') {
                                const spacing = tableWidth / (totalSeats + 1)
                                localX = spacing * (seatIndex + 1) - tableWidth / 2
                                localY = -tableHeight / 2 - nameOffset
                              } else if (oneSidePosition === 'left') {
                                const spacing = tableHeight / (totalSeats + 1)
                                localX = -tableWidth / 2 - nameOffset
                                localY = spacing * (seatIndex + 1) - tableHeight / 2
                              } else { // right
                                const spacing = tableHeight / (totalSeats + 1)
                                localX = tableWidth / 2 + nameOffset
                                localY = spacing * (seatIndex + 1) - tableHeight / 2
                              }
                            } else if (seatSides === 'two-opposite') {
                              // Seats on two opposite sides (top and bottom)
                              const seatsPerSide = Math.ceil(totalSeats / 2)
                              if (seatIndex < seatsPerSide) {
                                // Top side
                                const spacing = tableWidth / (seatsPerSide + 1)
                                localX = spacing * (seatIndex + 1) - tableWidth / 2
                                localY = -tableHeight / 2 - nameOffset
                              } else {
                                // Bottom side
                                const bottomIndex = seatIndex - seatsPerSide
                                const seatsOnBottom = totalSeats - seatsPerSide
                                const spacing = tableWidth / (seatsOnBottom + 1)
                                localX = spacing * (bottomIndex + 1) - tableWidth / 2
                                localY = tableHeight / 2 + nameOffset
                              }
                            } else {
                              // All sides (default)
                              const headSeats = table.headSeats || 0
                              const seatsPerHead = headSeats
                              const totalHeadSeats = seatsPerHead * 2
                              const longSideSeats = totalSeats - totalHeadSeats

                              const seatsOnTop = Math.ceil(longSideSeats / 2)
                              const seatsOnBottom = longSideSeats - seatsOnTop

                              if (seatIndex < seatsOnTop) {
                                const spacing = tableWidth / (seatsOnTop + 1)
                                localX = spacing * (seatIndex + 1) - tableWidth / 2
                                localY = -tableHeight / 2 - nameOffset
                              } else if (seatIndex < seatsOnTop + seatsPerHead) {
                                const headIndex = seatIndex - seatsOnTop
                                const spacing = tableHeight / (seatsPerHead + 1)
                                localX = tableWidth / 2 + nameOffset
                                localY = spacing * (headIndex + 1) - tableHeight / 2
                              } else if (seatIndex < seatsOnTop + seatsPerHead + seatsOnBottom) {
                                const bottomIndex = seatIndex - seatsOnTop - seatsPerHead
                                const spacing = tableWidth / (seatsOnBottom + 1)
                                localX = tableWidth / 2 - spacing * (bottomIndex + 1)
                                localY = tableHeight / 2 + nameOffset
                              } else {
                                const headIndex = seatIndex - seatsOnTop - seatsPerHead - seatsOnBottom
                                const spacing = tableHeight / (seatsPerHead + 1)
                                localX = -tableWidth / 2 - nameOffset
                                localY = tableHeight / 2 - spacing * (headIndex + 1)
                              }
                            }

                            // Apply table rotation to position
                            const rotRad = (table.rotation * Math.PI) / 180
                            nameX = localX * Math.cos(rotRad) - localY * Math.sin(rotRad)
                            nameY = localX * Math.sin(rotRad) + localY * Math.cos(rotRad)

                            // Keep text horizontal (no rotation)
                            textRotation = 0
                          }

                          const dimensions = getLabelDimensions(guestName.firstName, guestName.lastName, textRotation)

                          return {
                            seat,
                            firstName: guestName.firstName,
                            lastName: guestName.lastName,
                            fullName: guestName.fullName,
                            x: nameX,
                            y: nameY,
                            rotation: textRotation,
                            width: dimensions.width,
                            height: dimensions.height,
                            seatIndex
                          }
                        })
                        .filter(Boolean) as Array<{
                          seat: Seat
                          firstName: string
                          lastName: string
                          fullName: string
                          x: number
                          y: number
                          rotation: number
                          width: number
                          height: number
                          seatIndex: number
                        }>

                      // Second pass: adjust positions to prevent collisions
                      const adjustedLabels = adjustLabelPositions(
                        labelData.map((label, index) => ({
                          x: label.x,
                          y: label.y,
                          width: label.width,
                          height: label.height,
                          angle: label.rotation,
                          index
                        }))
                      )

                      // Third pass: render with adjusted positions
                      return labelData.map((label, index) => {
                        const adjusted = adjustedLabels[index]

                        return (
                          <div
                            key={`name-${label.seat.id}`}
                            className={`absolute text-[10px] px-2 py-1 rounded border shadow-md pointer-events-none text-center leading-tight ${
                              label.seat.isPlusOne
                                ? 'bg-blue-50 border-blue-300 text-blue-800'
                                : 'bg-white border-gray-300 text-gray-700'
                            }`}
                            style={{
                              left: `calc(50% + ${adjusted.x}px)`,
                              top: `calc(50% + ${adjusted.y}px)`,
                              transform: `translate(-50%, -50%) rotate(${label.rotation}deg)`,
                              zIndex: 10 + label.seatIndex
                            }}
                          >
                            <div className="font-medium">{label.firstName}</div>
                            <div>{label.lastName}</div>
                          </div>
                        )
                      })
                    })()}
                  </div>
                )
              })}

              {/* Chair Rows */}
              {(chairRows || []).map(chairRow => {
                const isSelected = selectedChairRow === chairRow.id
                const isDraggedChairRow = isSelected && isDraggingChairRow && draggedChairRowPosition
                const position = isDraggedChairRow ? draggedChairRowPosition : chairRow.position
                const rotation = tempChairRowRotation[chairRow.id] !== undefined ? tempChairRowRotation[chairRow.id] : chairRow.rotation

                const chairWidth = 30
                const chairHeight = 30
                const spacing = chairRow.spacing || 40
                const rows = chairRow.rows || 1
                const columns = chairRow.columns || chairRow.chairCount
                const hasAisle = chairRow.hasAisle || false
                const aisleWidth = chairRow.aisleWidth || 80

                // Calculate total dimensions including aisle
                const totalWidth = columns * spacing + (hasAisle ? aisleWidth : 0)
                const totalHeight = rows * spacing

                const rowChairSeats = (chairSeats || []).filter(s => s.chairRowId === chairRow.id)

                return (
                  <div
                    key={chairRow.id}
                    data-chairrow-id={chairRow.id}
                    className={`group absolute cursor-move transition-shadow ${
                      isSelected ? 'ring-2 ring-primary-500 shadow-lg' : ''
                    }`}
                    style={{
                      left: position.x,
                      top: position.y,
                      width: totalWidth,
                      height: totalHeight,
                      transform: `rotate(${rotation}deg)`,
                      transformOrigin: 'center'
                    }}
                    onMouseDown={(e) => handleChairRowDragStart(chairRow.id, e)}
                    onDoubleClick={() => handleEditChairRow(chairRow)}
                  >
                    {/* Rotation handle - visible on hover */}
                    <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity z-30">
                      <button
                        className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
                        onMouseDown={(e) => handleChairRowRotationStart(chairRow.id, e)}
                        onClick={(e) => e.stopPropagation()}
                        title="Táhněte pro rotaci"
                      >
                        <RotateCw className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Info on hover - above chair row */}
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
                      <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                        Dvojklik pro úpravu
                      </div>
                    </div>

                    {/* Background fill with color */}
                    <div
                      className="absolute inset-0 rounded-lg opacity-20"
                      style={{
                        backgroundColor: chairRow.color || '#8B5CF6',
                        pointerEvents: 'none'
                      }}
                    />

                    {/* Individual chairs in grid */}
                    {Array.from({ length: chairRow.chairCount }).map((_, index) => {
                      const chairSeat = rowChairSeats.find(s => s.position === index + 1)

                      // Calculate row and column position in grid
                      const row = Math.floor(index / columns)
                      const col = index % columns

                      // Calculate position with aisle consideration
                      const halfColumns = Math.floor(columns / 2)
                      let chairX = col * spacing

                      // Add aisle offset if chair is in right half and aisle is enabled
                      if (hasAisle && col >= halfColumns) {
                        chairX += aisleWidth
                      }

                      const chairY = row * spacing

                      const guestNameData = chairSeat ? getGuestNameForChairSeat(chairSeat) : null
                      const guestNameTooltip = guestNameData?.fullName || null

                      return (
                        <div
                          key={index}
                          className={`absolute w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-medium transition-colors cursor-pointer overflow-hidden ${
                            chairSeat?.guestId
                              ? 'bg-white border-green-400 hover:border-green-500'
                              : chairSeat?.isReserved
                              ? 'bg-yellow-100 border-yellow-400 text-yellow-800 hover:bg-yellow-200'
                              : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-primary-100 hover:border-primary-400'
                          }`}
                          style={{
                            left: chairX,
                            top: chairY
                          }}
                          title={guestNameTooltip || `Místo ${index + 1} - levé tlačítko: přiřadit hosta`}
                          onMouseDown={(e) => {
                            if (e.button === 0) { // Left click only
                              e.stopPropagation() // Prevent chair row drag from starting
                              setSeatMouseDownTime(Date.now())
                              setSeatMouseDownPos({ x: e.clientX, y: e.clientY })
                            }
                          }}
                          onMouseUp={(e) => {
                            if (e.button === 0 && chairSeat) { // Left click only
                              e.stopPropagation() // Prevent chair row drag from starting
                              const timeDiff = Date.now() - seatMouseDownTime
                              const posChanged = seatMouseDownPos && (
                                Math.abs(e.clientX - seatMouseDownPos.x) > 5 ||
                                Math.abs(e.clientY - seatMouseDownPos.y) > 5
                              )

                              // Only trigger click if it was quick and mouse didn't move much (not a drag)
                              if (timeDiff < 300 && !posChanged) {
                                if (chairSeat.guestId) {
                                  handleUnassignGuest(chairSeat.id)
                                } else {
                                  handleSeatClick(chairSeat.id, 'chair')
                                }
                              }

                              setSeatMouseDownTime(0)
                              setSeatMouseDownPos(null)
                            }
                          }}
                          onDrop={(e) => handleGuestDrop(e, chairSeat?.id || '')}
                          onDragOver={(e) => e.preventDefault()}
                        >
                          {chairSeat?.guestId ? renderAvatar(getAvatarForPerson(chairSeat.guestId), 24) : (index + 1)}
                        </div>
                      )
                    })}

                    {/* Guest names positioned around chairs - same style as tables */}
                    {viewOptions.showGuestNames && rowChairSeats
                      .filter(s => s.guestId)
                      .map((chairSeat) => {
                        const guestName = getGuestNameForChairSeat(chairSeat)
                        if (!guestName) return null

                        const seatIndex = chairSeat.position - 1

                        // Calculate row and column position in grid
                        const row = Math.floor(seatIndex / columns)
                        const col = seatIndex % columns

                        // Calculate position with aisle consideration
                        const halfColumns = Math.floor(columns / 2)
                        let chairX = col * spacing

                        // Add aisle offset if chair is in right half and aisle is enabled
                        if (hasAisle && col >= halfColumns) {
                          chairX += aisleWidth
                        }

                        const chairY = row * spacing

                        // Chair dimensions (w-6 h-6 = 24px)
                        const chairSize = 24
                        const chairCenterOffset = chairSize / 2 // 12px to get to center of chair

                        // Alternate names above and below based on row position
                        const isEvenRow = row % 2 === 0
                        const nameOffset = 35 // Same distance for both above and below

                        let nameX = chairX + chairCenterOffset // Start from center of chair
                        let nameY = chairY + chairCenterOffset // Start from center of chair
                        let textRotation = 0

                        // For grid layout: alternate above and below based on row
                        const effectiveRotation = (chairRow.rotation || 0) % 360
                        const isUpsideDown = effectiveRotation > 90 && effectiveRotation < 270

                        if (isUpsideDown) {
                          // Flip the alternation when row is upside down
                          nameY = nameY + (isEvenRow ? nameOffset : -nameOffset)
                          textRotation = 180 // Flip text to keep it readable
                        } else {
                          nameY = nameY + (isEvenRow ? -nameOffset : nameOffset)
                          textRotation = 0
                        }

                        // Check if this is a plus one based on guestId format
                        const isPlusOne = chairSeat.guestId?.includes('_plusone') || false

                        return (
                          <div
                            key={chairSeat.id}
                            className={`absolute text-[10px] px-2 py-1 rounded border shadow-md pointer-events-none text-center leading-tight ${
                              isPlusOne
                                ? 'bg-blue-50 border-blue-300 text-blue-800'
                                : 'bg-white border-gray-300 text-gray-700'
                            }`}
                            style={{
                              left: nameX,
                              top: nameY,
                              transform: `translate(-50%, -50%) rotate(${textRotation}deg)`,
                              zIndex: 10 + seatIndex
                            }}
                          >
                            <div className="font-medium">{guestName.firstName}</div>
                            <div>{guestName.lastName}</div>
                          </div>
                        )
                      })}

                    {/* Chair row label - positioned based on orientation */}
                    <div
                      className="absolute bg-white px-2 py-1 rounded shadow-sm border border-gray-200 pointer-events-none"
                      style={{
                        left: chairRow.orientation === 'horizontal' ? '-10px' : '50%',
                        top: chairRow.orientation === 'horizontal' ? '50%' : '-40px',
                        transform: chairRow.orientation === 'horizontal'
                          ? 'translate(-100%, -50%)'
                          : 'translate(-50%, 0)',
                        zIndex: 5
                      }}
                    >
                      <span className="text-xs font-medium text-gray-700 whitespace-nowrap">
                        {chairRow.name}
                      </span>
                    </div>

                    {/* Edit/Delete buttons */}
                    {isSelected && (
                      <div className="absolute -right-2 -top-2 flex space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEditChairRow(chairRow)
                          }}
                          className="p-1 bg-blue-500 text-white rounded-full hover:bg-blue-600 shadow-lg"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteChairRow(chairRow.id)
                          }}
                          className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}

            </div>
          </div>
        </div>

        {/* Sidebar - Mobile optimized */}
        <div className="space-y-4 sm:space-y-6">
          {/* Stats */}
          {viewOptions.showStats && (
            <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Statistiky</h3>

              <div className="space-y-2 sm:space-y-3">
                <div className="flex justify-between">
                  <span className="text-xs sm:text-sm text-gray-600">Stoly</span>
                  <span className="text-xs sm:text-sm font-medium">{stats.totalTables}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs sm:text-sm text-gray-600">Místa celkem</span>
                  <span className="text-xs sm:text-sm font-medium">{stats.totalSeats}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs sm:text-sm text-gray-600">Obsazeno</span>
                  <span className="text-xs sm:text-sm font-medium text-green-600">{stats.assignedSeats}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs sm:text-sm text-gray-600">Volné</span>
                  <span className="text-xs sm:text-sm font-medium text-gray-600">{stats.availableSeats}</span>
                </div>

                <div className="pt-2 border-t border-gray-200">
                  <div className="flex justify-between mb-2">
                    <span className="text-xs sm:text-sm text-gray-600">Obsazenost</span>
                    <span className="text-xs sm:text-sm font-medium">{stats.occupancyRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${stats.occupancyRate}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Unassigned guests grouped by category */}
          <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
              Nepřiřazení hosté ({totalUnassignedPeople})
            </h3>

            <div className="space-y-3 sm:space-y-4 max-h-64 sm:max-h-96 overflow-y-auto">
              {Object.entries(getGroupedUnassignedGuests()).map(([category, people]) => {
                // Count total people in this category
                const categoryPeopleCount = people.length

                return (
                <div key={category} className="space-y-2">
                  {/* Category header */}
                  <div className="flex items-center space-x-2">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${GUEST_CATEGORY_COLORS[category as keyof typeof GUEST_CATEGORY_COLORS] || 'bg-gray-100 text-gray-700'}`}>
                      {GUEST_CATEGORY_LABELS[category as keyof typeof GUEST_CATEGORY_LABELS] || category}
                    </div>
                    <span className="text-xs text-gray-500">({categoryPeopleCount})</span>
                  </div>

                  {/* People in category */}
                  <div className="space-y-1 ml-2">
                    {people.map(person => {
                      const bgColor = person.type === 'guest' ? 'bg-gray-50' : person.type === 'plusOne' ? 'bg-blue-50' : 'bg-purple-50'
                      const textColor = person.type === 'guest' ? 'text-gray-900' : person.type === 'plusOne' ? 'text-blue-700' : 'text-purple-700'
                      const badgeColor = person.type === 'plusOne' ? 'text-blue-600 bg-blue-100' : 'text-purple-600 bg-purple-100'
                      const borderClass = person.type !== 'guest' ? 'ml-4 border-l-2 ' + (person.type === 'plusOne' ? 'border-blue-300' : 'border-purple-300') : ''

                      return (
                        <div
                          key={person.id}
                          className={`flex items-center justify-between p-2 rounded-lg cursor-move hover:bg-primary-50 transition-colors ${bgColor} ${borderClass}`}
                          draggable
                          onDragStart={(e) => handleGuestDragStart(e, person.id)}
                        >
                          <div className="flex items-center space-x-2">
                            <span className={`text-sm font-medium ${textColor}`}>
                              {person.displayName}
                            </span>
                            {person.type === 'plusOne' && (
                              <span className={`text-xs px-2 py-0.5 rounded ${badgeColor}`}>
                                doprovod
                              </span>
                            )}
                            {person.type === 'child' && (
                              <span className={`text-xs px-2 py-0.5 rounded ${badgeColor}`}>
                                dítě ({person.childAge} let)
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
                )
              })}

              {unassignedGuests.length === 0 && (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">
                    Všichni hosté jsou přiřazeni
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Table form modal */}
      {showTableForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[150]">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {editingTable ? 'Upravit stůl' : 'Přidat nový stůl'}
            </h3>

            {/* Tip for editing tables */}
            {!editingTable && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <div className="w-5 h-5 text-blue-600 mt-0.5">
                    💡
                  </div>
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Tip pro úpravu stolů:</p>
                    <p className="hidden sm:block">
                      Po přidání můžete rozměry a vlastnosti stolu upravit <strong>dvojklikem</strong> na stůl v plánu.
                    </p>
                    <p className="sm:hidden">
                      Po přidání můžete rozměry a vlastnosti stolu upravit <strong>dlouhým stisknutím</strong> na stůl v plánu.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {/* Table name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Název stolu *
                </label>
                <input
                  type="text"
                  value={tableFormData.name}
                  onChange={(e) => setTableFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={`Stůl ${tables.length + 1}`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Table shape */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tvar stolu
                </label>
                <select
                  value={tableFormData.shape}
                  onChange={(e) => setTableFormData(prev => ({ ...prev, shape: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="round">Kulatý</option>
                  <option value="rectangular">Obdélníkový</option>
                  <option value="square">Čtvercový</option>
                  <option value="oval">Oválný</option>
                </select>
              </div>

              {/* Table size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Velikost stolu
                </label>
                <select
                  value={tableFormData.size}
                  onChange={(e) => setTableFormData(prev => ({ ...prev, size: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="small">Malý (80px)</option>
                  <option value="medium">Střední (120px)</option>
                  <option value="large">Velký (160px)</option>
                  <option value="xl">Extra velký (200px)</option>
                </select>
              </div>

              {/* Table capacity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Počet míst (0 = stůl bez židlí)
                </label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={tableFormData.capacity === 0 ? 0 : (tableFormData.capacity || '')}
                  onChange={(e) => {
                    const value = e.target.value
                    if (value === '') {
                      setTableFormData(prev => ({ ...prev, capacity: '' as any }))
                    } else {
                      const numValue = parseInt(value)
                      if (!isNaN(numValue) && numValue >= 0) {
                        setTableFormData(prev => ({ ...prev, capacity: numValue }))
                      }
                    }
                  }}
                  onBlur={(e) => {
                    // On blur, validate and clamp to min/max
                    const value = e.target.value
                    if (value === '') {
                      setTableFormData(prev => ({ ...prev, capacity: 0 }))
                    } else {
                      const numValue = parseInt(value)
                      if (!isNaN(numValue)) {
                        setTableFormData(prev => ({
                          ...prev,
                          capacity: Math.max(0, Math.min(20, numValue))
                        }))
                      }
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Seat sides - only for rectangular/square tables */}
              {(tableFormData.shape === 'rectangular' || tableFormData.shape === 'square') && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rozmístění míst
                    </label>
                    <select
                      value={tableFormData.seatSides}
                      onChange={(e) => setTableFormData(prev => ({ ...prev, seatSides: e.target.value as 'all' | 'one' | 'two-opposite' }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="all">Všechny strany</option>
                      <option value="one">Pouze jedna strana</option>
                      <option value="two-opposite">Dvě protilehlé strany</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Na kterých stranách stolu budou místa k sezení
                    </p>
                  </div>

                  {tableFormData.seatSides === 'one' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Strana stolu
                      </label>
                      <select
                        value={tableFormData.oneSidePosition}
                        onChange={(e) => setTableFormData(prev => ({ ...prev, oneSidePosition: e.target.value as 'top' | 'bottom' | 'left' | 'right' }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="bottom">Spodní strana</option>
                        <option value="top">Horní strana</option>
                        <option value="left">Levá strana</option>
                        <option value="right">Pravá strana</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Na které straně stolu budou místa
                      </p>
                    </div>
                  )}

                  {tableFormData.seatSides === 'all' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Místa v čele stolu
                      </label>
                      <select
                        value={tableFormData.headSeats}
                        onChange={(e) => setTableFormData(prev => ({ ...prev, headSeats: parseInt(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="0">Žádná místa v čele</option>
                        <option value="1">1 místo na každé straně (2 celkem)</option>
                        <option value="2">2 místa na každé straně (4 celkem)</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Počet míst na kratších stranách stolu
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* Table color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Barva stolu
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={tableFormData.color}
                    onChange={(e) => setTableFormData(prev => ({ ...prev, color: e.target.value }))}
                    className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={tableFormData.color}
                    onChange={(e) => setTableFormData(prev => ({ ...prev, color: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="#F8BBD9"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-6">
              {editingTable && (
                <button
                  type="button"
                  onClick={() => {
                    if (editingTable) {
                      handleDeleteTable(editingTable.id)
                      setShowTableForm(false)
                      setEditingTable(null)
                    }
                  }}
                  className="w-full btn-outline text-red-600 border-red-300 hover:bg-red-50 flex items-center justify-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Smazat stůl</span>
                </button>
              )}
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowTableForm(false)
                    setEditingTable(null)
                    setTableFormData({
                      name: '',
                      shape: 'round',
                      size: 'medium',
                      capacity: 8,
                      color: '#F8BBD9',
                      headSeats: 0,
                      seatSides: 'all',
                      oneSidePosition: 'bottom'
                    })
                  }}
                  className="flex-1 btn-outline"
                >
                  Zrušit
                </button>
                <button
                  type="button"
                  onClick={editingTable ? handleSaveTable : handleAddTable}
                  className="flex-1 btn-primary"
                >
                  {editingTable ? 'Uložit změny' : 'Přidat stůl'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chair row form modal */}
      {showChairRowForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[150]">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {editingChairRow ? 'Upravit řadu židlí' : 'Přidat řadu židlí'}
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Vytvořte řadu samostatných židlí pro ceremonie nebo jiné účely
            </p>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Název řady
                </label>
                <input
                  type="text"
                  value={chairRowFormData.name}
                  onChange={(e) => setChairRowFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="např. Ceremonie - levá strana"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Grid layout */}
              <div className="grid grid-cols-2 gap-4">
                {/* Rows */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Počet řad (výška)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={chairRowFormData.rows}
                    onChange={(e) => setChairRowFormData(prev => ({ ...prev, rows: parseInt(e.target.value) || 1 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                {/* Columns */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Počet sloupců (šířka)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={chairRowFormData.columns}
                    onChange={(e) => setChairRowFormData(prev => ({ ...prev, columns: parseInt(e.target.value) || 1 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Total chairs display */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">Celkem židlí:</span> {chairRowFormData.rows * chairRowFormData.columns}
                </p>
              </div>

              {/* Aisle option */}
              <div>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={chairRowFormData.hasAisle}
                    onChange={(e) => setChairRowFormData(prev => ({ ...prev, hasAisle: e.target.checked }))}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Přidat uličku uprostřed</span>
                </label>
              </div>

              {/* Aisle width */}
              {chairRowFormData.hasAisle && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Šířka uličky (px)
                  </label>
                  <input
                    type="number"
                    min="40"
                    max="200"
                    value={chairRowFormData.aisleWidth}
                    onChange={(e) => setChairRowFormData(prev => ({ ...prev, aisleWidth: parseInt(e.target.value) || 80 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              )}

              {/* Spacing */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rozestup židlí (px)
                </label>
                <input
                  type="number"
                  min="30"
                  max="100"
                  value={chairRowFormData.spacing}
                  onChange={(e) => setChairRowFormData(prev => ({ ...prev, spacing: parseInt(e.target.value) || 40 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Barva pozadí (vyplní prostor mezi židlemi)
                </label>
                <div className="flex space-x-2">
                  {['#8B5CF6', '#EC4899', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'].map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setChairRowFormData(prev => ({ ...prev, color }))}
                      className={`w-10 h-10 rounded-lg border-2 transition-all ${
                        chairRowFormData.color === color ? 'border-gray-900 scale-110' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Actions */}
              {editingChairRow && (
                <button
                  type="button"
                  onClick={() => {
                    if (editingChairRow) {
                      handleDeleteChairRow(editingChairRow.id)
                      setShowChairRowForm(false)
                      setEditingChairRow(null)
                    }
                  }}
                  className="w-full btn-outline text-red-600 border-red-300 hover:bg-red-50 flex items-center justify-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Smazat řadu židlí</span>
                </button>
              )}
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowChairRowForm(false)
                    setEditingChairRow(null)
                    setChairRowFormData({
                      name: '',
                      chairCount: 6,
                      orientation: 'horizontal',
                      rows: 1,
                      columns: 6,
                      hasAisle: false,
                      aisleWidth: 80,
                      color: '#8B5CF6',
                      spacing: 40
                    })
                  }}
                  className="flex-1 btn-outline"
                >
                  Zrušit
                </button>
                <button
                  type="button"
                  onClick={editingChairRow ? handleSaveChairRow : handleAddChairRow}
                  className="flex-1 btn-primary"
                >
                  {editingChairRow ? 'Uložit změny' : 'Přidat řadu'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom area form modal */}
      {showCustomAreaForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[150]">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {editingCustomArea ? 'Upravit plochu' : 'Přidat plochu'}
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              {editingCustomArea ? 'Upravte vlastní plochu' : 'Vytvořte vlastní plochu (taneční parket, bar, pódium, atd.)'}
            </p>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Název plochy *
                </label>
                <input
                  type="text"
                  placeholder="např. Taneční parket, Bar, Pódium..."
                  value={customAreaFormData.name}
                  onChange={(e) => setCustomAreaFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Width */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Šířka (px)
                </label>
                <input
                  type="number"
                  min="100"
                  max="800"
                  value={customAreaFormData.width}
                  onChange={(e) => setCustomAreaFormData(prev => ({ ...prev, width: parseInt(e.target.value) || 200 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Height */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Výška (px)
                </label>
                <input
                  type="number"
                  min="100"
                  max="800"
                  value={customAreaFormData.height}
                  onChange={(e) => setCustomAreaFormData(prev => ({ ...prev, height: parseInt(e.target.value) || 200 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Barva
                </label>
                <div className="flex space-x-2">
                  {['#FCD34D', '#8B5CF6', '#EC4899', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#6B7280'].map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setCustomAreaFormData(prev => ({ ...prev, color }))}
                      className={`w-10 h-10 rounded-lg border-2 transition-all ${
                        customAreaFormData.color === color ? 'border-gray-900 scale-110' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCustomAreaForm(false)
                    setEditingCustomArea(null)
                    setCustomAreaFormData({
                      name: '',
                      width: 200,
                      height: 200,
                      color: '#FCD34D'
                    })
                  }}
                  className="flex-1 btn-outline"
                >
                  Zrušit
                </button>
                <button
                  type="button"
                  onClick={editingCustomArea ? handleSaveCustomArea : handleAddCustomArea}
                  disabled={!customAreaFormData.name.trim()}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingCustomArea ? 'Uložit změny' : 'Přidat plochu'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dance floor form modal */}
      {showDanceFloorForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[150]">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Přidat taneční parket
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Vytvořte taneční parket pro vaši svatbu
            </p>

            <div className="space-y-4">
              {/* Width */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Šířka (px)
                </label>
                <input
                  type="number"
                  min="100"
                  max="800"
                  value={danceFloorFormData.width}
                  onChange={(e) => setDanceFloorFormData(prev => ({ ...prev, width: parseInt(e.target.value) || 200 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Height */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Výška (px)
                </label>
                <input
                  type="number"
                  min="100"
                  max="800"
                  value={danceFloorFormData.height}
                  onChange={(e) => setDanceFloorFormData(prev => ({ ...prev, height: parseInt(e.target.value) || 200 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowDanceFloorForm(false)
                    setDanceFloorFormData({
                      width: 200,
                      height: 200,
                      color: '#FCD34D'
                    })
                  }}
                  className="flex-1 btn-outline"
                >
                  Zrušit
                </button>
                <button
                  type="button"
                  onClick={handleAddDanceFloor}
                  className="flex-1 btn-primary"
                >
                  Přidat parket
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dance floor edit modal */}
      {editingDanceFloor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[150]">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Upravit taneční parket
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Upravte velikost tanečního parketu
            </p>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Šířka
                  </label>
                  <input
                    type="number"
                    value={danceFloorData.width}
                    onChange={(e) => setDanceFloorData(prev => ({ ...prev, width: parseInt(e.target.value) || 100 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Výška
                  </label>
                  <input
                    type="number"
                    value={danceFloorData.height}
                    onChange={(e) => setDanceFloorData(prev => ({ ...prev, height: parseInt(e.target.value) || 100 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-6">
              {/* Delete button */}
              <button
                type="button"
                onClick={handleDeleteDanceFloor}
                className="w-full btn-outline text-red-600 border-red-300 hover:bg-red-50 flex items-center justify-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Smazat taneční parket</span>
              </button>

              {/* Action buttons */}
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setEditingDanceFloor(false)}
                  className="flex-1 btn-outline"
                >
                  Zrušit
                </button>
                <button
                  type="button"
                  onClick={handleSaveDanceFloor}
                  className="flex-1 btn-primary"
                >
                  Uložit změny
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Guest assignment modal */}
      {showGuestAssignment && selectedSeat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[150]">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Přiřadit hosta k místu
            </h3>

            {/* Search input */}
            <div className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Vyhledat hosta..."
                  value={guestSearchQuery}
                  onChange={(e) => setGuestSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                {guestSearchQuery && (
                  <button
                    onClick={() => setGuestSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-4 overflow-y-auto flex-1">
              {Object.entries(getGroupedAllGuests()).map(([category, categoryPeople]) => {
                // Count total people in this category
                const categoryPeopleCount = categoryPeople.length

                return (
                <div key={category} className="space-y-2">
                  {/* Category header */}
                  <div className="flex items-center space-x-2">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${GUEST_CATEGORY_COLORS[category as keyof typeof GUEST_CATEGORY_COLORS] || 'bg-gray-100 text-gray-700'}`}>
                      {GUEST_CATEGORY_LABELS[category as keyof typeof GUEST_CATEGORY_LABELS] || category}
                    </div>
                    <span className="text-xs text-gray-500">({categoryPeopleCount})</span>
                  </div>

                  {/* People in category */}
                  <div className="space-y-1 ml-2">
                    {categoryPeople.map(person => {
                      const isAssigned = isGuestAssigned(person.id)
                      const seatInfo = getGuestSeatInfo(person.id)

                      const bgColor = isAssigned ? 'bg-green-50 border border-green-200 hover:bg-green-100' :
                                      person.type === 'guest' ? 'bg-gray-50 hover:bg-primary-50' :
                                      person.type === 'plusOne' ? 'bg-blue-50 hover:bg-primary-50' :
                                      'bg-purple-50 hover:bg-primary-50'
                      const textColor = isAssigned ? 'text-green-800' :
                                       person.type === 'guest' ? 'text-gray-900' :
                                       person.type === 'plusOne' ? 'text-blue-700' :
                                       'text-purple-700'
                      const badgeColor = person.type === 'plusOne' ? 'text-blue-600 bg-blue-100' : 'text-purple-600 bg-purple-100'
                      const borderClass = person.type !== 'guest' ? 'ml-4 border-l-2 ' + (person.type === 'plusOne' ? 'border-blue-300' : 'border-purple-300') : ''

                      return (
                        <div
                          key={person.id}
                          className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${bgColor} ${borderClass}`}
                          onClick={() => handleAssignGuest(person.id)}
                        >
                          <div className="flex items-center space-x-2 flex-1">
                            <span className={`text-sm font-medium ${textColor}`}>
                              {person.displayName}
                            </span>
                            {person.type === 'plusOne' && (
                              <span className={`text-xs px-2 py-0.5 rounded ${isAssigned ? 'text-green-600 bg-green-100' : badgeColor}`}>
                                doprovod
                              </span>
                            )}
                            {person.type === 'child' && (
                              <span className={`text-xs px-2 py-0.5 rounded ${isAssigned ? 'text-green-600 bg-green-100' : badgeColor}`}>
                                dítě ({person.childAge} let)
                              </span>
                            )}
                            {isAssigned && seatInfo && (
                              <span className="text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded">
                                {seatInfo.tableName} - místo {seatInfo.seatPosition}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-400">
                            {isAssigned ? 'Přesunout' : 'Přiřadit'}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
                )
              })}

              {guests.length === 0 && !guestSearchQuery && (
                <p className="text-sm text-gray-500 text-center py-4">
                  Žádní hosté k dispozici
                </p>
              )}

              {guests.length > 0 && guestSearchQuery && Object.keys(getGroupedAllGuests()).length === 0 && (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">
                    Žádní hosté nenalezeni pro "{guestSearchQuery}"
                  </p>
                  <button
                    onClick={() => setGuestSearchQuery('')}
                    className="mt-3 text-sm text-primary-600 hover:text-primary-700"
                  >
                    Vymazat vyhledávání
                  </button>
                </div>
              )}
            </div>

            <div className="flex space-x-3 pt-6 border-t border-gray-200 mt-4">
              <button
                type="button"
                onClick={() => {
                  setShowGuestAssignment(false)
                  setSelectedSeat(null)
                  setGuestSearchQuery('')
                }}
                className="flex-1 btn-outline"
              >
                Zrušit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Venue settings modal */}
      {showVenueSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[150]">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Nastavení plochy
            </h3>

            <div className="space-y-6">
              {/* Quick presets */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Rychlé předvolby
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleVenuePreset('small')}
                    className="p-3 border border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-left"
                  >
                    <div className="font-medium text-sm">Malá svatba</div>
                    <div className="text-xs text-gray-500">1200 × 800 px</div>
                    <div className="text-xs text-gray-500">Do 50 hostů</div>
                  </button>
                  <button
                    onClick={() => handleVenuePreset('medium')}
                    className="p-3 border border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-left"
                  >
                    <div className="font-medium text-sm">Střední svatba</div>
                    <div className="text-xs text-gray-500">1600 × 1200 px</div>
                    <div className="text-xs text-gray-500">50-100 hostů</div>
                  </button>
                  <button
                    onClick={() => handleVenuePreset('large')}
                    className="p-3 border border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-left"
                  >
                    <div className="font-medium text-sm">Velká svatba</div>
                    <div className="text-xs text-gray-500">2000 × 1600 px</div>
                    <div className="text-xs text-gray-500">100-200 hostů</div>
                  </button>
                  <button
                    onClick={() => handleVenuePreset('xl')}
                    className="p-3 border border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-left"
                  >
                    <div className="font-medium text-sm">Extra velká</div>
                    <div className="text-xs text-gray-500">2400 × 2000 px</div>
                    <div className="text-xs text-gray-500">200+ hostů</div>
                  </button>
                </div>
              </div>

              {/* Custom dimensions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Vlastní rozměry
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Šířka (px)
                    </label>
                    <input
                      type="number"
                      min="800"
                      max="5000"
                      step="100"
                      value={venueData.width}
                      onChange={(e) => setVenueData(prev => ({ ...prev, width: parseInt(e.target.value) || 1200 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Výška (px)
                    </label>
                    <input
                      type="number"
                      min="600"
                      max="4000"
                      step="100"
                      value={venueData.height}
                      onChange={(e) => setVenueData(prev => ({ ...prev, height: parseInt(e.target.value) || 800 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Náhled poměru stran
                </label>
                <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                  <div
                    className="bg-white border border-gray-400 mx-auto"
                    style={{
                      width: Math.min(200, venueData.width / 10),
                      height: Math.min(150, venueData.height / 10),
                      aspectRatio: `${venueData.width} / ${venueData.height}`
                    }}
                  />
                  <p className="text-xs text-gray-500 text-center mt-2">
                    {venueData.width} × {venueData.height} px
                  </p>
                </div>
              </div>

              {/* Warning for large sizes */}
              {(venueData.width > 2000 || venueData.height > 1500) && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-start">
                    <div className="text-yellow-600 mr-2">⚠️</div>
                    <div>
                      <p className="text-sm font-medium text-yellow-800">Velká plocha</p>
                      <p className="text-xs text-yellow-700">
                        Velké plochy mohou zpomalit výkon aplikace. Doporučujeme používat zoom pro lepší navigaci.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex space-x-3 pt-6">
              <button
                type="button"
                onClick={() => {
                  setShowVenueSettings(false)
                  setVenueData({
                    width: currentPlan.venueLayout.width,
                    height: currentPlan.venueLayout.height
                  })
                }}
                className="flex-1 btn-outline"
              >
                Zrušit
              </button>
              <button
                type="button"
                onClick={handleSaveVenue}
                className="flex-1 btn-primary"
              >
                Uložit změny
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
