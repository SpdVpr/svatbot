'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
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
import { Table, Seat, SeatingViewOptions, SeatingPlan, TableShape, TableSize } from '@/types/seating'
import { GUEST_CATEGORY_LABELS, GUEST_CATEGORY_COLORS } from '@/utils/guestCategories'

interface SeatingPlanEditorProps {
  className?: string
  currentPlan: SeatingPlan
}

export default function SeatingPlanEditor({ className = '', currentPlan }: SeatingPlanEditorProps) {
  const {
    tables,
    seats,
    stats,
    createTable,
    updateTable,
    deleteTable,
    updateSeatingPlan,
    moveTable,
    assignGuestToSeat,
    unassignGuestFromSeat,
    getUnassignedGuests
  } = useSeating()
  const { guests } = useGuest()

  const canvasRef = useRef<HTMLDivElement>(null)
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
    height: currentPlan.venueLayout.danceFloor?.height || 200
  })
  const [showGuestAssignment, setShowGuestAssignment] = useState(false)
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null)
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

  // Mobile long press detection
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null)
  const [isLongPress, setIsLongPress] = useState(false)
  const [tableFormData, setTableFormData] = useState<{
    name: string
    shape: TableShape
    size: TableSize
    capacity: number
    color: string
    headSeats: number
    seatSides: 'all' | 'one' | 'two-opposite'
  }>({
    name: '',
    shape: 'round',
    size: 'medium',
    capacity: 8,
    color: '#F8BBD9',
    headSeats: 0,
    seatSides: 'all'
  })
  const [viewOptions, setViewOptions] = useState<SeatingViewOptions>({
    showGuestNames: true,
    showTableNumbers: true,
    showConstraints: false,
    showStats: true,
    highlightUnassigned: true,
    highlightViolations: false,
    zoom: 1.0
  })

  const unassignedGuests = getUnassignedGuests()

  // Calculate total unassigned people (guests + plus ones)
  const totalUnassignedPeople = unassignedGuests.reduce((total, guest) => {
    let count = 1 // The guest themselves
    if (guest.hasPlusOne && guest.plusOneName) {
      count += 1 // Plus one
    }
    return total + count
  }, 0)

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
  const handleTouchStart = (tableId: string) => {
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

  // Add new table
  const handleAddTable = async () => {
    try {
      if (!currentPlan) {
        alert('Nejdříve vyberte nebo vytvořte plán usazení')
        return
      }

      await createTable({
        name: tableFormData.name || `Stůl ${tables.length + 1}`,
        shape: tableFormData.shape,
        size: tableFormData.size,
        capacity: tableFormData.capacity,
        position: { x: 200, y: 200 },
        rotation: 0,
        color: tableFormData.color,
        headSeats: tableFormData.headSeats,
        seatSides: tableFormData.seatSides
      }, currentPlan.id) // Explicitly pass planId

      setShowTableForm(false)
      setTableFormData({
        name: '',
        shape: 'round',
        size: 'medium',
        capacity: 8,
        color: '#F8BBD9',
        headSeats: 0,
        seatSides: 'all'
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
      seatSides: table.seatSides || 'all'
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
        seatSides: tableFormData.seatSides
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
        seatSides: 'all'
      })
    } catch (error) {
      console.error('Error updating table:', error)
      alert('Chyba při úpravě stolu: ' + (error as Error).message)
    }
  }

  // Table rotation handlers - NOVÁ LOGIKA jako drag & drop
  const handleRotationStart = (tableId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setIsRotating(true)
    setRotatingTable(tableId)

    const table = tables.find(t => t.id === tableId)
    if (table) {
      setRotationStartAngle(table.rotation)
    }

    // Přidat event listenery přímo zde
    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!tableId) return

      const tableElement = document.querySelector(`[data-table-id="${tableId}"]`)
      if (!tableElement) return

      const rect = tableElement.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      const angle = Math.atan2(moveEvent.clientY - centerY, moveEvent.clientX - centerX) * (180 / Math.PI) + 90
      const normalizedAngle = ((angle % 360) + 360) % 360

      // Update table rotation
      updateTable(tableId, { rotation: normalizedAngle })
    }

    const handleMouseUp = () => {
      setIsRotating(false)
      setRotatingTable(null)
      setRotationStartAngle(0)

      // Odstranit event listenery
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    // Přidat event listenery
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  // Tyto funkce už nepotřebujeme - vše je v handleRotationStart
  const handleRotationMove = useCallback(() => {}, [])
  const handleRotationEnd = useCallback(() => {}, [])

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

  // Rotation event listeners - ODSTRANĚNO, nyní se používá přímá logika v handleRotationStart

  // Edit dance floor
  const handleEditDanceFloor = () => {
    setEditingDanceFloor(true)
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

    // Helper function to get guest name for a seat
    const getGuestNameForSeat = (seat: Seat) => {
      if (seat.isPlusOne && seat.plusOneOf) {
        const mainSeat = seats.find(s => s.id === seat.plusOneOf)
        const mainGuest = guests.find(g => g.id === mainSeat?.guestId)
        const name = mainGuest?.plusOneName || 'Doprovod'
        const parts = name.split(' ')
        return { firstName: parts[0] || '', lastName: parts.slice(1).join(' ') || '', fullName: name }
      } else {
        const guest = guests.find(g => g.id === seat.guestId)
        if (guest) {
          const firstName = guest.firstName || ''
          const lastName = guest.lastName || ''
          const fullName = `${firstName} ${lastName}`.trim()
          return { firstName, lastName, fullName }
        }
        return { firstName: '', lastName: '', fullName: '' }
      }
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
            let localX = 0
            let localY = 0

            if (seatSides === 'one') {
              // All seats on one side (bottom)
              const spacing = width / (tableSeats.length + 1)
              localX = spacing * (seatIndex + 1) - width / 2
              localY = height / 2 + 25
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
              y="${seatY - 12}"
              text-anchor="middle"
              font-size="10"
              font-weight="bold"
              fill="#2563eb"
            >
              ${seat.position || '?'}
            </text>
          `

          // Draw guest name if assigned
          if (seat.guestId || seat.isPlusOne) {
            const guestName = getGuestNameForSeat(seat)
            if (guestName.fullName) {
              const nameY = seatY + 20

              // First name (always show if exists)
              if (guestName.firstName) {
                svgContent += `
                  <text
                    x="${seatX}"
                    y="${nameY}"
                    text-anchor="middle"
                    font-size="10"
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
                    x="${seatX}"
                    y="${nameY + 12}"
                    text-anchor="middle"
                    font-size="10"
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

    // Calculate statistics
    const totalAssignedGuests = seats.filter(s => s.guestId || s.isPlusOne).length
    const totalSeats = seats.length
    const occupancyRate = totalSeats > 0 ? Math.round((totalAssignedGuests / totalSeats) * 100) : 0

    // Generate guest list by table
    const generateGuestList = () => {
      const tablesList = tables.map(table => {
        const tableSeats = seats.filter(s => s.tableId === table.id && (s.guestId || s.isPlusOne))
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

      return tablesList
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
              <div class="summary-item">
                <span class="summary-label">Celkem hostů:</span>
                <span class="summary-value">${totalAssignedGuests}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Obsazenost:</span>
                <span class="summary-value">${occupancyRate}%</span>
              </div>
            </div>

            <h2>Seznam hostů podle stolů</h2>
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
  const handleSeatClick = (seatId: string) => {
    setSelectedSeat(seatId)
    setShowGuestAssignment(true)
  }

  // Assign person (guest/plusOne/child) to seat
  const handleAssignGuest = async (personId: string) => {
    if (!selectedSeat) return

    try {
      // PersonId can be: "guest_id", "guest_id_plusone", or "guest_id_child_0"
      // We store the full personId in the seat's guestId field
      await assignGuestToSeat(personId, selectedSeat)
      setShowGuestAssignment(false)
      setSelectedSeat(null)
    } catch (error) {
      console.error('Error assigning person:', error)
      alert('Chyba při přiřazování osoby: ' + (error as Error).message)
    }
  }

  // Unassign guest from seat
  const handleUnassignGuest = async (seatId: string) => {
    try {
      await unassignGuestFromSeat(seatId)
    } catch (error) {
      console.error('Error unassigning guest:', error)
      alert('Chyba při odebírání hosta: ' + (error as Error).message)
    }
  }

  // Handle drag and drop for guest assignment
  const handleGuestDrop = (event: React.DragEvent, seatId: string) => {
    event.preventDefault()
    const guestId = event.dataTransfer.getData('text/plain')
    if (guestId) {
      handleAssignGuest(guestId)
      setSelectedSeat(seatId)
    }
  }

  const handleGuestDragStart = (event: React.DragEvent, guestId: string) => {
    event.dataTransfer.setData('text/plain', guestId)
  }

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

  // Get person name for seat - handles guests, plus ones, and children
  const getGuestName = (seat: Seat) => {
    if (!seat.guestId) return null

    const personId = seat.guestId

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

  // Check if guest has assigned seat
  const isGuestAssigned = (guestId: string) => {
    return seats.some(seat => seat.guestId === guestId)
  }

  // Get assigned seat info for guest
  const getGuestSeatInfo = (guestId: string) => {
    const seat = seats.find(s => s.guestId === guestId)
    if (!seat) return null
    const table = tables.find(t => t.id === seat.tableId)
    return table ? { tableName: table.name, seatPosition: seat.position } : null
  }

  // Create extended list of people to seat (guests + plus ones + children)
  type PersonToSeat = {
    id: string
    displayName: string
    type: 'guest' | 'plusOne' | 'child'
    parentGuestId?: string
    category: string
    childAge?: number
  }

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
    const assignedIds = new Set(seats.filter(s => s.guestId).map(s => s.guestId))
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
    const grouped: Record<string, PersonToSeat[]> = {}

    allPeople.forEach(person => {
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
          height: currentPlan.venueLayout.danceFloor!.height
        }
        // Only update if values actually changed
        if (prev.x === newData.x && prev.y === newData.y &&
            prev.width === newData.width && prev.height === newData.height) {
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
    <div className={`space-y-6 ${className}`}>
      {/* Toolbar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {currentPlan.name}
            </h2>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleAddTable}
                className="btn-outline flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Přidat stůl</span>
              </button>

              <button
                onClick={handleEditVenue}
                className="btn-outline flex items-center space-x-2"
                title="Nastavit velikost plochy"
              >
                <Grid className="w-4 h-4" />
                <span>Plocha</span>
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Zoom controls */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewOptions(prev => ({ ...prev, zoom: Math.max(0.5, prev.zoom - 0.1) }))}
                className="p-2 rounded-md hover:bg-white transition-colors"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="px-3 text-sm font-medium">
                {Math.round(viewOptions.zoom * 100)}%
              </span>
              <button
                onClick={() => setViewOptions(prev => ({ ...prev, zoom: Math.min(2.0, prev.zoom + 0.1) }))}
                className="p-2 rounded-md hover:bg-white transition-colors"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            {/* View options */}
            <button
              onClick={() => setViewOptions(prev => ({ ...prev, showGuestNames: !prev.showGuestNames }))}
              className={`p-2 rounded-md transition-colors ${
                viewOptions.showGuestNames ? 'bg-primary-100 text-primary-600' : 'hover:bg-gray-100'
              }`}
            >
              {viewOptions.showGuestNames ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>

            <button
              onClick={handlePrint}
              className="btn-primary flex items-center space-x-2"
              title="Vytisknout zasedací pořádek"
            >
              <Printer className="w-4 h-4" />
              <span>Tisk</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Canvas */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl border border-gray-200 overflow-auto">
            <div
              ref={canvasRef}
              className="relative bg-gray-50 cursor-crosshair border-4 border-dashed border-blue-300"
              style={{
                transform: `scale(${viewOptions.zoom})`,
                transformOrigin: 'top left',
                width: currentPlan.venueLayout.width,
                height: currentPlan.venueLayout.height,
                minWidth: currentPlan.venueLayout.width,
                minHeight: currentPlan.venueLayout.height,
                boxShadow: 'inset 0 0 0 1px rgba(59, 130, 246, 0.3)'
              }}
              onMouseMove={(e) => {
                handleTableDrag(e)
                handleDanceFloorDrag(e)
              }}
              onMouseUp={() => {
                handleTableDragEnd()
                handleDanceFloorDragEnd()
              }}
              onMouseLeave={() => {
                handleTableDragEnd()
                handleDanceFloorDragEnd()
              }}

            >
              {/* Canvas size indicator */}
              <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded shadow-md pointer-events-none z-50">
                {currentPlan.venueLayout.width} × {currentPlan.venueLayout.height} px
              </div>
              {/* Venue features */}
              {currentPlan.venueLayout.danceFloor && (() => {
                const isDraggedDanceFloor = isDraggingDanceFloor && draggedDanceFloorPosition
                const position = isDraggedDanceFloor ? draggedDanceFloorPosition : {
                  x: danceFloorData.x,
                  y: danceFloorData.y
                }

                return (
                  <div
                    className={`absolute bg-yellow-200 border-2 border-yellow-400 rounded-lg flex items-center justify-center cursor-move hover:bg-yellow-300 ${
                      !isDraggedDanceFloor ? 'transition-colors' : ''
                    } ${isDraggingDanceFloor ? 'z-20 scale-105' : 'z-10'}`}
                    style={{
                      left: position.x,
                      top: position.y,
                      width: danceFloorData.width,
                      height: danceFloorData.height
                    }}
                    onMouseDown={handleDanceFloorDragStart}
                    onDoubleClick={(e) => {
                      e.stopPropagation()
                      handleEditDanceFloor()
                    }}
                    title="Táhněte pro přesun, dvojklik pro úpravu velikosti"
                  >
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
                        transform: `rotate(${table.rotation}deg)`
                      }}
                      onMouseDown={(e) => handleTableDragStart(table.id, e)}
                      onDoubleClick={() => handleEditTable(table)}
                      onTouchStart={() => handleTouchStart(table.id)}
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
                      {tableSeats.map((seat, index) => {
                        let seatX = 0
                        let seatY = 0

                        if (table.shape === 'round' || table.shape === 'oval') {
                          // Circular positioning for round/oval tables
                          const angle = (360 / tableSeats.length) * index
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
                          const totalSeats = tableSeats.length
                          const seatSides = table.seatSides || 'all'

                          if (seatSides === 'one') {
                            // All seats on one side (bottom)
                            const spacing = tableWidth / (totalSeats + 1)
                            seatX = spacing * (index + 1) - tableWidth / 2
                            seatY = tableHeight / 2 + seatOffset
                          } else if (seatSides === 'two-opposite') {
                            // Seats on two opposite sides (top and bottom)
                            const seatsPerSide = Math.ceil(totalSeats / 2)
                            if (index < seatsPerSide) {
                              // Top side
                              const spacing = tableWidth / (seatsPerSide + 1)
                              seatX = spacing * (index + 1) - tableWidth / 2
                              seatY = -tableHeight / 2 - seatOffset
                            } else {
                              // Bottom side
                              const bottomIndex = index - seatsPerSide
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

                            if (index < seatsOnTop) {
                              // Top long side
                              const spacing = tableWidth / (seatsOnTop + 1)
                              seatX = spacing * (index + 1) - tableWidth / 2
                              seatY = -tableHeight / 2 - seatOffset
                            } else if (index < seatsOnTop + seatsPerHead) {
                              // Right short side (head)
                              const headIndex = index - seatsOnTop
                              const spacing = tableHeight / (seatsPerHead + 1)
                              seatX = tableWidth / 2 + seatOffset
                              seatY = spacing * (headIndex + 1) - tableHeight / 2
                            } else if (index < seatsOnTop + seatsPerHead + seatsOnBottom) {
                              // Bottom long side
                              const bottomIndex = index - seatsOnTop - seatsPerHead
                              const spacing = tableWidth / (seatsOnBottom + 1)
                              seatX = tableWidth / 2 - spacing * (bottomIndex + 1)
                              seatY = tableHeight / 2 + seatOffset
                            } else {
                              // Left short side (head)
                              const headIndex = index - seatsOnTop - seatsPerHead - seatsOnBottom
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
                            className={`absolute w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-medium transition-colors cursor-pointer ${
                              seat.guestId
                                ? 'bg-green-100 border-green-400 text-green-800 hover:bg-green-200'
                                : seat.isReserved
                                ? 'bg-yellow-100 border-yellow-400 text-yellow-800 hover:bg-yellow-200'
                                : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-primary-100 hover:border-primary-400'
                            }`}
                            style={{
                              left: `calc(50% + ${seatX}px - 12px)`,
                              top: `calc(50% + ${seatY}px - 12px)`
                            }}
                            title={guestNameTooltip || `Místo ${seat.position} - klikněte pro přiřazení hosta`}
                            onClick={(e) => {
                              e.stopPropagation()
                              if (seat.guestId) {
                                handleUnassignGuest(seat.id)
                              } else {
                                handleSeatClick(seat.id)
                              }
                            }}
                            onDrop={(e) => handleGuestDrop(e, seat.id)}
                            onDragOver={(e) => e.preventDefault()}
                          >
                            {seat.position}
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

                          const seatIndex = tableSeats.findIndex(s => s.id === seat.id)
                          if (seatIndex === -1) return null

                          let nameX = 0
                          let nameY = 0
                          let textRotation = 0

                          if (table.shape === 'round' || table.shape === 'oval') {
                            // Circular positioning for round/oval tables
                            const seatAngle = (360 / tableSeats.length) * seatIndex
                            const totalAngle = seatAngle + table.rotation
                            const baseRadius = table.size === 'small' ? 90 : table.size === 'medium' ? 110 : table.size === 'large' ? 130 : 150
                            const extraRadius = Math.max(0, (tableSeats.length - 6) * 5)
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
                            const extraOffset = Math.max(0, (tableSeats.length - 6) * 3)
                            const nameOffset = baseOffset + extraOffset
                            const totalSeats = tableSeats.length
                            const seatSides = table.seatSides || 'all'

                            // Calculate position in non-rotated space
                            let localX = 0
                            let localY = 0

                            if (seatSides === 'one') {
                              // All seats on one side (bottom)
                              const spacing = tableWidth / (totalSeats + 1)
                              localX = spacing * (seatIndex + 1) - tableWidth / 2
                              localY = tableHeight / 2 + nameOffset
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

            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats */}
          {viewOptions.showStats && (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiky</h3>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Stoly</span>
                  <span className="text-sm font-medium">{stats.totalTables}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Místa celkem</span>
                  <span className="text-sm font-medium">{stats.totalSeats}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Obsazeno</span>
                  <span className="text-sm font-medium text-green-600">{stats.assignedSeats}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Volné</span>
                  <span className="text-sm font-medium text-gray-600">{stats.availableSeats}</span>
                </div>

                <div className="pt-2 border-t border-gray-200">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Obsazenost</span>
                    <span className="text-sm font-medium">{stats.occupancyRate}%</span>
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
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Nepřiřazení hosté ({totalUnassignedPeople})
            </h3>

            <div className="space-y-4 max-h-96 overflow-y-auto">
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
                      const bgColor = person.type === 'guest' ? 'bg-gray-50' : person.type === 'plusOne' ? 'bg-blue-50' : 'bg-green-50'
                      const textColor = person.type === 'guest' ? 'text-gray-900' : person.type === 'plusOne' ? 'text-blue-700' : 'text-green-700'
                      const badgeColor = person.type === 'plusOne' ? 'text-blue-600 bg-blue-100' : 'text-green-600 bg-green-100'
                      const borderClass = person.type !== 'guest' ? 'ml-4 border-l-2 ' + (person.type === 'plusOne' ? 'border-blue-300' : 'border-green-300') : ''

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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
                  Počet míst
                </label>
                <input
                  type="number"
                  min="2"
                  max="20"
                  value={tableFormData.capacity || ''}
                  onChange={(e) => {
                    const value = e.target.value
                    if (value === '') {
                      setTableFormData(prev => ({ ...prev, capacity: '' as any }))
                    } else {
                      const numValue = parseInt(value)
                      if (!isNaN(numValue)) {
                        setTableFormData(prev => ({
                          ...prev,
                          capacity: Math.max(2, Math.min(20, numValue))
                        }))
                      }
                    }
                  }}
                  onBlur={(e) => {
                    // On blur, if empty, set to minimum value
                    if (e.target.value === '') {
                      setTableFormData(prev => ({ ...prev, capacity: 2 }))
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
                      seatSides: 'all'
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

      {/* Dance floor edit modal */}
      {editingDanceFloor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Upravit taneční parket
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pozice X
                  </label>
                  <input
                    type="number"
                    value={danceFloorData.x}
                    onChange={(e) => setDanceFloorData(prev => ({ ...prev, x: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pozice Y
                  </label>
                  <input
                    type="number"
                    value={danceFloorData.y}
                    onChange={(e) => setDanceFloorData(prev => ({ ...prev, y: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
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

            <div className="flex space-x-3 pt-6">
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
      )}

      {/* Guest assignment modal */}
      {showGuestAssignment && selectedSeat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Přiřadit hosta k místu
            </h3>

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
                                      'bg-green-50 hover:bg-primary-50'
                      const textColor = isAssigned ? 'text-green-800' :
                                       person.type === 'guest' ? 'text-gray-900' :
                                       person.type === 'plusOne' ? 'text-blue-700' :
                                       'text-green-700'
                      const badgeColor = person.type === 'plusOne' ? 'text-blue-600 bg-blue-100' : 'text-green-600 bg-green-100'
                      const borderClass = person.type !== 'guest' ? 'ml-4 border-l-2 ' + (person.type === 'plusOne' ? 'border-blue-300' : 'border-green-300') : ''

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

              {guests.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  Žádní hosté k dispozici
                </p>
              )}
            </div>

            <div className="flex space-x-3 pt-6 border-t border-gray-200 mt-4">
              <button
                type="button"
                onClick={() => {
                  setShowGuestAssignment(false)
                  setSelectedSeat(null)
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
