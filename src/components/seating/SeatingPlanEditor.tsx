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
  Save,
  Download,
  ZoomIn,
  ZoomOut,
  Grid,
  Eye,
  EyeOff
} from 'lucide-react'
import { Table, Seat, SeatingViewOptions, SeatingPlan, TableShape, TableSize } from '@/types/seating'

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
  const [tableFormData, setTableFormData] = useState<{
    name: string
    shape: TableShape
    size: TableSize
    capacity: number
    color: string
  }>({
    name: '',
    shape: 'round',
    size: 'medium',
    capacity: 8,
    color: '#F8BBD9'
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

  // Handle table drag start
  const handleTableDragStart = useCallback((tableId: string, event: React.MouseEvent) => {
    event.preventDefault()
    setSelectedTable(tableId)
    setIsDragging(true)

    const table = tables.find(t => t.id === tableId)
    if (table && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect()
      setDragOffset({
        x: event.clientX - rect.left - table.position.x,
        y: event.clientY - rect.top - table.position.y
      })
    }
  }, [tables])

  // Handle table drag
  const handleTableDrag = useCallback((event: React.MouseEvent) => {
    if (!isDragging || !selectedTable || !canvasRef.current) return

    event.preventDefault()
    const rect = canvasRef.current.getBoundingClientRect()
    const newPosition = {
      x: Math.max(0, Math.min(currentPlan.venueLayout.width - 120, event.clientX - rect.left - dragOffset.x)),
      y: Math.max(0, Math.min(currentPlan.venueLayout.height - 120, event.clientY - rect.top - dragOffset.y))
    }

    // Update position immediately for smooth dragging
    setDraggedTablePosition(newPosition)
  }, [isDragging, selectedTable, dragOffset, currentPlan.venueLayout])

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

  // Add new table
  const handleAddTable = async () => {
    try {
      console.log('🪑 Adding table to plan:', currentPlan.id)
      await createTable({
        name: tableFormData.name || `Stůl ${tables.length + 1}`,
        shape: tableFormData.shape,
        size: tableFormData.size,
        capacity: tableFormData.capacity,
        position: { x: 200, y: 200 },
        rotation: 0,
        color: tableFormData.color
      })
      setShowTableForm(false)
      setTableFormData({
        name: '',
        shape: 'round',
        size: 'medium',
        capacity: 8,
        color: '#F8BBD9'
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
      color: table.color || '#F8BBD9'
    })
    setShowTableForm(true)
  }

  // Save table changes
  const handleSaveTable = async () => {
    if (!editingTable) return

    try {
      console.log('🪑 Updating table:', editingTable.id, tableFormData)
      await updateTable(editingTable.id, {
        name: tableFormData.name,
        shape: tableFormData.shape,
        size: tableFormData.size,
        capacity: tableFormData.capacity,
        color: tableFormData.color
      })
      setShowTableForm(false)
      setEditingTable(null)
      setTableFormData({
        name: '',
        shape: 'round',
        size: 'medium',
        capacity: 8,
        color: '#F8BBD9'
      })
    } catch (error) {
      console.error('Error updating table:', error)
      alert('Chyba při úpravě stolu: ' + (error as Error).message)
    }
  }

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
      console.log('🪑 Dance floor updated successfully')
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
      await updateSeatingPlan(currentPlan.id, {
        venueLayout: {
          ...currentPlan.venueLayout,
          width: venueData.width,
          height: venueData.height
        }
      })
      console.log('🪑 Venue layout updated successfully')
      setShowVenueSettings(false)
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

  // Handle seat click for guest assignment
  const handleSeatClick = (seatId: string) => {
    setSelectedSeat(seatId)
    setShowGuestAssignment(true)
  }

  // Assign guest to seat
  const handleAssignGuest = async (guestId: string) => {
    if (!selectedSeat) return

    try {
      await assignGuestToSeat(guestId, selectedSeat)
      setShowGuestAssignment(false)
      setSelectedSeat(null)
    } catch (error) {
      console.error('Error assigning guest:', error)
      alert('Chyba při přiřazování hosta: ' + (error as Error).message)
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
    setDanceFloorDragOffset({
      x: event.clientX - rect.left - danceFloorData.x,
      y: event.clientY - rect.top - danceFloorData.y
    })
  }, [currentPlan.venueLayout.danceFloor, danceFloorData])

  const handleDanceFloorDrag = useCallback((event: React.MouseEvent) => {
    if (!isDraggingDanceFloor || !currentPlan.venueLayout.danceFloor || !canvasRef.current) return

    event.preventDefault()
    const rect = canvasRef.current.getBoundingClientRect()
    const newPosition = {
      x: Math.max(0, Math.min(currentPlan.venueLayout.width - danceFloorData.width,
          event.clientX - rect.left - danceFloorDragOffset.x)),
      y: Math.max(0, Math.min(currentPlan.venueLayout.height - danceFloorData.height,
          event.clientY - rect.top - danceFloorDragOffset.y))
    }

    setDraggedDanceFloorPosition(newPosition)
  }, [isDraggingDanceFloor, currentPlan.venueLayout, danceFloorDragOffset, danceFloorData])

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
        console.log('🪑 Dance floor moved and saved:', draggedDanceFloorPosition)
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

  // Get guest name for seat
  const getGuestName = (seat: Seat) => {
    if (!seat.guestId) return null
    const guest = guests.find(g => g.id === seat.guestId)
    return guest ? `${guest.firstName} ${guest.lastName}` : null
  }

  console.log('🪑 SeatingPlanEditor: Rendering with plan:', currentPlan.name)
  console.log('🪑 Tables count:', tables.length)
  console.log('🪑 Seats count:', seats.length)

  // Sync dance floor data with current plan
  useEffect(() => {
    if (currentPlan.venueLayout.danceFloor) {
      setDanceFloorData({
        x: currentPlan.venueLayout.danceFloor.x,
        y: currentPlan.venueLayout.danceFloor.y,
        width: currentPlan.venueLayout.danceFloor.width,
        height: currentPlan.venueLayout.danceFloor.height
      })
    }
  }, [currentPlan.id]) // Only sync when plan changes, not on every render

  // Sync venue data with current plan
  useEffect(() => {
    setVenueData({
      width: currentPlan.venueLayout.width,
      height: currentPlan.venueLayout.height
    })
  }, [currentPlan.id])

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

              <button className="btn-outline flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Auto-rozmístění</span>
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

            <button className="btn-outline flex items-center space-x-2">
              <Save className="w-4 h-4" />
              <span>Uložit</span>
            </button>

            <button className="btn-outline flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Canvas */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div
              ref={canvasRef}
              className="relative bg-gray-50 min-h-[600px] cursor-crosshair"
              style={{
                transform: `scale(${viewOptions.zoom})`,
                transformOrigin: 'top left',
                width: currentPlan.venueLayout.width,
                height: currentPlan.venueLayout.height
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
                    className={`absolute cursor-move ${
                      isSelected ? 'z-10 scale-105' : 'z-0'
                    } ${!isDraggedTable ? 'transition-all duration-200' : ''}`}
                    style={{
                      left: position.x,
                      top: position.y,
                      transform: `rotate(${table.rotation}deg)`
                    }}
                    onMouseDown={(e) => handleTableDragStart(table.id, e)}
                    onDoubleClick={() => handleEditTable(table)}
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
                        height: table.shape === 'round' ? (table.size === 'small' ? 80 : table.size === 'medium' ? 120 : table.size === 'large' ? 160 : 200) : 80,
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

                      {/* Seats around table */}
                      {tableSeats.map((seat, index) => {
                        const angle = (360 / tableSeats.length) * index
                        const radius = table.size === 'small' ? 50 : table.size === 'medium' ? 70 : table.size === 'large' ? 90 : 110
                        const seatX = Math.cos((angle - 90) * Math.PI / 180) * radius
                        const seatY = Math.sin((angle - 90) * Math.PI / 180) * radius
                        const guestName = getGuestName(seat)

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
                            title={guestName || `Místo ${seat.position} - klikněte pro přiřazení hosta`}
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

                    {/* Guest names */}
                    {viewOptions.showGuestNames && (
                      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-center">
                        {tableSeats.filter(s => s.guestId).map(seat => {
                          const guestName = getGuestName(seat)
                          return guestName ? (
                            <div key={seat.id} className="text-gray-600 truncate max-w-20">
                              {guestName}
                            </div>
                          ) : null
                        })}
                      </div>
                    )}
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

          {/* Unassigned guests */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Nepřiřazení hosté ({unassignedGuests.length})
            </h3>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {unassignedGuests.map(guest => (
                <div
                  key={guest.id}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg cursor-move hover:bg-primary-50 transition-colors"
                  draggable
                  onDragStart={(e) => handleGuestDragStart(e, guest.id)}
                >
                  <span className="text-sm font-medium">
                    {guest.firstName} {guest.lastName}
                  </span>
                  <span className="text-xs text-gray-500">
                    {guest.category}
                  </span>
                </div>
              ))}

              {unassignedGuests.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  Všichni hosté jsou přiřazeni
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Table form modal */}
      {showTableForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingTable ? 'Upravit stůl' : 'Přidat nový stůl'}
            </h3>

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
                  value={tableFormData.capacity}
                  onChange={(e) => setTableFormData(prev => ({ ...prev, capacity: parseInt(e.target.value) || 8 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

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

            <div className="flex space-x-3 pt-6">
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
                    color: '#F8BBD9'
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
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Přiřadit hosta k místu
            </h3>

            <div className="space-y-4 max-h-60 overflow-y-auto">
              {unassignedGuests.map(guest => (
                <div
                  key={guest.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-primary-50 cursor-pointer transition-colors"
                  onClick={() => handleAssignGuest(guest.id)}
                >
                  <div>
                    <span className="text-sm font-medium">
                      {guest.firstName} {guest.lastName}
                    </span>
                    <p className="text-xs text-gray-500">{guest.category}</p>
                  </div>
                  <span className="text-xs text-gray-400">Klikněte pro přiřazení</span>
                </div>
              ))}

              {unassignedGuests.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  Všichni hosté jsou již přiřazeni
                </p>
              )}
            </div>

            <div className="flex space-x-3 pt-6">
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
