'use client'

import { useState, useRef, useEffect } from 'react'
import { Edit3, Lock, Unlock, RotateCcw, GripVertical, Eye, EyeOff } from 'lucide-react'
import { useDashboard } from '@/hooks/useDashboard'
import { DashboardModule } from '@/types/dashboard'

// Import module components
import WeddingCountdownModule from './modules/WeddingCountdownModule'
import QuickActionsModule from './modules/QuickActionsModule'
import UpcomingTasksModule from './modules/UpcomingTasksModule'
import MainFeaturesModule from './modules/MainFeaturesModule'
import MarketplaceModule from './modules/MarketplaceModule'
import ComingSoonModule from './modules/ComingSoonModule'
import TaskManagementModule from './modules/TaskManagementModule'
import GuestManagementModule from './modules/GuestManagementModule'
import BudgetTrackingModule from './modules/BudgetTrackingModule'
import TimelinePlanningModule from './modules/TimelinePlanningModule'
import VendorManagementModule from './modules/VendorManagementModule'
import SeatingPlanModule from './modules/SeatingPlanModule'
import WeddingChecklistModule from './modules/WeddingChecklistModule'
import WeddingDayTimelineModule from './modules/WeddingDayTimelineModule'
import MoodboardModule from './modules/MoodboardModule'
import MusicPlaylistModule from './modules/MusicPlaylistModule'
import FoodDrinksModule from './modules/FoodDrinksModule'
import WeddingWebsiteModule from './modules/WeddingWebsiteModule'
import AccommodationManagementModule from './modules/AccommodationManagementModule'

interface GridDragDropProps {
  onWeddingSettingsClick: () => void
}

interface GridPosition {
  row: number
  col: number
  width: number
  height: number
}

const GRID_COLS = 6 // 6 sloupců pro lepší flexibilitu
const GRID_ROWS = 20 // Dostatek řádků pro scrollování
const CELL_HEIGHT = 120 // Výška jedné buňky v px

export default function GridDragDrop({ onWeddingSettingsClick }: GridDragDropProps) {
  const {
    layout,
    loading,
    updateModuleOrder,
    toggleEditMode,
    toggleLock,
    toggleModuleVisibility,
    toggleModuleLock,
    resetLayout,
    getVisibleModules
  } = useDashboard()

  const [draggedModule, setDraggedModule] = useState<string | null>(null)
  const [dragOverPosition, setDragOverPosition] = useState<GridPosition | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [modulePositions, setModulePositions] = useState<Map<string, GridPosition>>(new Map())
  const [previewPositions, setPreviewPositions] = useState<Map<string, GridPosition>>(new Map())
  const gridRef = useRef<HTMLDivElement>(null)
  const dragTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Převod velikosti modulu na grid rozměry
  const getModuleSize = (size: string): { width: number; height: number } => {
    switch (size) {
      case 'small':
        return { width: 1, height: 1 }
      case 'medium':
        return { width: 2, height: 1 }
      case 'large':
        return { width: 3, height: 1 }
      case 'full':
        return { width: 6, height: 1 }
      default:
        return { width: 2, height: 1 }
    }
  }

  // Inicializace pozic modulů
  useEffect(() => {
    if (loading) return

    const positions = new Map<string, GridPosition>()
    const visibleModules = getVisibleModules()

    let currentRow = 0
    let currentCol = 0

    visibleModules.forEach((module) => {
      const size = getModuleSize(module.size)

      // Pokud se modul nevejde do řádku, přejdi na další
      if (currentCol + size.width > GRID_COLS) {
        currentRow++
        currentCol = 0
      }

      positions.set(module.id, {
        row: currentRow,
        col: currentCol,
        width: size.width,
        height: size.height
      })

      currentCol += size.width
    })

    setModulePositions(positions)
  }, [layout.modules, loading, getVisibleModules])

  // Zkontroluj jestli je pozice volná
  const isPositionFree = (
    position: GridPosition,
    excludeModule: string,
    positions: Map<string, GridPosition>
  ): boolean => {
    for (const [moduleId, pos] of positions.entries()) {
      if (moduleId === excludeModule) continue

      const overlaps = !(
        position.row + position.height <= pos.row ||
        position.row >= pos.row + pos.height ||
        position.col + position.width <= pos.col ||
        position.col >= pos.col + pos.width
      )

      if (overlaps) return false
    }
    return true
  }

  // Najdi nejbližší volné místo v gridu
  const findFreePosition = (
    width: number,
    height: number,
    preferredRow: number,
    preferredCol: number,
    excludeModule: string,
    positions: Map<string, GridPosition>
  ): GridPosition | null => {
    // Nejprve zkus preferovanou pozici
    const preferred: GridPosition = {
      row: Math.max(0, Math.min(preferredRow, GRID_ROWS - height)),
      col: Math.max(0, Math.min(preferredCol, GRID_COLS - width)),
      width,
      height
    }

    if (isPositionFree(preferred, excludeModule, positions)) {
      return preferred
    }

    // Hledej nejbližší volné místo spirálovitě od preferované pozice
    const maxDistance = Math.max(GRID_ROWS, GRID_COLS)

    for (let distance = 1; distance <= maxDistance; distance++) {
      // Zkus pozice v rostoucí vzdálenosti od preferované pozice
      for (let rowOffset = -distance; rowOffset <= distance; rowOffset++) {
        for (let colOffset = -distance; colOffset <= distance; colOffset++) {
          // Přeskoč pozice které nejsou na okraji aktuální vzdálenosti
          if (Math.abs(rowOffset) !== distance && Math.abs(colOffset) !== distance) {
            continue
          }

          const row = preferredRow + rowOffset
          const col = preferredCol + colOffset

          // Zkontroluj hranice
          if (row < 0 || row + height > GRID_ROWS || col < 0 || col + width > GRID_COLS) {
            continue
          }

          const testPosition: GridPosition = { row, col, width, height }

          if (isPositionFree(testPosition, excludeModule, positions)) {
            return testPosition
          }
        }
      }
    }

    // Pokud nenajdeme místo, zkus najít jakékoliv volné místo
    for (let row = 0; row <= GRID_ROWS - height; row++) {
      for (let col = 0; col <= GRID_COLS - width; col++) {
        const testPosition: GridPosition = { row, col, width, height }

        if (isPositionFree(testPosition, excludeModule, positions)) {
          return testPosition
        }
      }
    }

    return null
  }

  // Posun moduly které jsou v cestě - vylepšená verze
  const pushModulesAway = (newPosition: GridPosition, excludeModule: string) => {
    const newPositions = new Map(modulePositions)
    const conflictingModules: Array<{ id: string; pos: GridPosition }> = []

    // Najdi moduly které kolidují s novou pozicí
    modulePositions.forEach((pos, moduleId) => {
      if (moduleId !== excludeModule) {
        const overlaps = !(
          newPosition.row + newPosition.height <= pos.row ||
          newPosition.row >= pos.row + pos.height ||
          newPosition.col + newPosition.width <= pos.col ||
          newPosition.col >= pos.col + pos.width
        )

        if (overlaps) {
          conflictingModules.push({ id: moduleId, pos })
        }
      }
    })

    // Seřaď konfliktní moduly podle vzdálenosti od nové pozice
    // (nejbližší moduly se přesunou první)
    conflictingModules.sort((a, b) => {
      const distA = Math.abs(a.pos.row - newPosition.row) + Math.abs(a.pos.col - newPosition.col)
      const distB = Math.abs(b.pos.row - newPosition.row) + Math.abs(b.pos.col - newPosition.col)
      return distA - distB
    })

    // Přesuň konfliktní moduly jeden po druhém
    conflictingModules.forEach(({ id: moduleId, pos: modulePos }) => {
      // Zkus najít volné místo co nejblíže původní pozici
      const freePos = findFreePosition(
        modulePos.width,
        modulePos.height,
        modulePos.row,
        modulePos.col,
        moduleId,
        newPositions
      )

      if (freePos) {
        newPositions.set(moduleId, freePos)
      }
    })

    return newPositions
  }

  const handleDragStart = (e: React.DragEvent, moduleId: string) => {
    if (!layout.isEditMode) return

    setDraggedModule(moduleId)
    setIsDragging(true)
    setDragOverPosition(null)

    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', moduleId)

    // Povolit scrollování během drag
    if (gridRef.current) {
      gridRef.current.style.overflowY = 'auto'
    }
  }

  const handleDragEnd = (e: React.DragEvent) => {
    dragTimeoutRef.current = setTimeout(() => {
      setDraggedModule(null)
      setDragOverPosition(null)
      setPreviewPositions(new Map())
      setIsDragging(false)

      // Obnovit scrollování
      if (gridRef.current) {
        gridRef.current.style.overflowY = 'auto'
      }
    }, 50)
  }

  const handleGridDragOver = (e: React.DragEvent) => {
    e.preventDefault()

    if (!draggedModule || !isDragging || !gridRef.current) return

    const rect = gridRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top + gridRef.current.scrollTop

    const col = Math.floor(x / (rect.width / GRID_COLS))
    const row = Math.floor(y / CELL_HEIGHT)

    if (col >= 0 && col < GRID_COLS && row >= 0 && row < GRID_ROWS) {
      const draggedPos = modulePositions.get(draggedModule)
      if (draggedPos) {
        const newPosition: GridPosition = {
          row: Math.max(0, Math.min(row, GRID_ROWS - draggedPos.height)),
          col: Math.max(0, Math.min(col, GRID_COLS - draggedPos.width)),
          width: draggedPos.width,
          height: draggedPos.height
        }

        // Zkontroluj jestli se pozice změnila
        if (
          !dragOverPosition ||
          dragOverPosition.row !== newPosition.row ||
          dragOverPosition.col !== newPosition.col
        ) {
          setDragOverPosition(newPosition)

          // Vypočítej preview pozice pro ostatní moduly
          const newPositions = pushModulesAway(newPosition, draggedModule)
          newPositions.set(draggedModule, newPosition)
          setPreviewPositions(newPositions)
        }
      }
    }
  }

  const handleGridDrop = (e: React.DragEvent) => {
    e.preventDefault()

    if (!draggedModule || !dragOverPosition) return

    // Použij preview pozice pokud existují, jinak vypočítej nové
    const newPositions = previewPositions.size > 0
      ? new Map(previewPositions)
      : (() => {
          const positions = pushModulesAway(dragOverPosition, draggedModule)
          positions.set(draggedModule, dragOverPosition)
          return positions
        })()

    setModulePositions(newPositions)

    // Aktualizuj pořadí modulů podle pozic
    const sortedModules = Array.from(newPositions.entries())
      .sort(([, a], [, b]) => a.row - b.row || a.col - b.col)
      .map(([moduleId]) => getVisibleModules().find(m => m.id === moduleId))
      .filter(Boolean) as DashboardModule[]

    updateModuleOrder(sortedModules)

    setDraggedModule(null)
    setDragOverPosition(null)
    setPreviewPositions(new Map())
    setIsDragging(false)
  }

  const renderModule = (module: DashboardModule) => {
    switch (module.type) {
      case 'wedding-countdown':
        return <WeddingCountdownModule onWeddingSettingsClick={onWeddingSettingsClick} />
      case 'quick-actions':
        return <QuickActionsModule />
      case 'upcoming-tasks':
        return <UpcomingTasksModule />
      case 'main-features':
        return <MainFeaturesModule />
      case 'marketplace':
        return <MarketplaceModule />
      case 'coming-soon':
        return <ComingSoonModule />
      case 'task-management':
        return <TaskManagementModule />
      case 'guest-management':
        return <GuestManagementModule />
      case 'budget-tracking':
        return <BudgetTrackingModule />
      case 'timeline-planning':
        return <TimelinePlanningModule />
      case 'vendor-management':
        return <VendorManagementModule />
      case 'seating-plan':
        return <SeatingPlanModule />
      case 'wedding-checklist':
        return <WeddingChecklistModule />
      case 'wedding-day-timeline':
        return <WeddingDayTimelineModule />
      case 'moodboard':
        return <MoodboardModule />
      case 'music-playlist':
        return <MusicPlaylistModule />
      case 'food-drinks':
        return <FoodDrinksModule />
      case 'wedding-website':
        return <WeddingWebsiteModule />
      case 'accommodation-management':
        return <AccommodationManagementModule />
      default:
        return (
          <div className="wedding-card">
            <h3 className="text-lg font-semibold mb-4">Neznámý modul</h3>
            <p className="text-gray-600">Typ modulu: {module.type}</p>
          </div>
        )
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="loading-spinner w-8 h-8" />
      </div>
    )
  }

  const visibleModules = getVisibleModules()
  const allModules = layout.modules

  return (
    <div className="space-y-6">
      {/* Dashboard Controls */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-200">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-gray-900">Dashboard</h2>
          {layout.isEditMode && (
            <div className="flex items-center space-x-2 text-sm text-primary-600">
              <Edit3 className="w-4 h-4" />
              <span>Režim úprav - Grid layout</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={toggleEditMode}
            className={`btn-outline flex items-center space-x-2 ${
              layout.isEditMode ? 'bg-primary-50 border-primary-300 text-primary-700' : ''
            }`}
          >
            <Edit3 className="w-4 h-4" />
            <span className="hidden sm:inline">
              {layout.isEditMode ? 'Dokončit úpravy' : 'Upravit layout'}
            </span>
          </button>

          {layout.isEditMode && (
            <>
              <button
                onClick={toggleLock}
                className={`btn-outline flex items-center space-x-2 ${
                  layout.isLocked ? 'bg-red-50 border-red-300 text-red-700' : ''
                }`}
                title={layout.isLocked ? 'Odemknout všechny moduly' : 'Zamknout všechny moduly'}
              >
                {layout.isLocked ? (
                  <Unlock className="w-4 h-4" />
                ) : (
                  <Lock className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">
                  {layout.isLocked ? 'Odemknout' : 'Zamknout'}
                </span>
              </button>

              <button
                onClick={resetLayout}
                className="btn-outline flex items-center space-x-2 text-gray-600 hover:text-red-600"
                title="Obnovit výchozí layout"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Grid Container */}
      <div
        ref={gridRef}
        className={`
          relative bg-white rounded-xl border border-gray-200 p-4
          ${layout.isEditMode ? 'min-h-[800px] max-h-[800px] overflow-y-auto' : 'min-h-[600px]'}
        `}
        onDragOver={handleGridDragOver}
        onDrop={handleGridDrop}
        style={{
          backgroundImage: layout.isEditMode
            ? `linear-gradient(to right, #e5e7eb 1px, transparent 1px),
               linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)`
            : 'none',
          backgroundSize: layout.isEditMode
            ? `${100 / GRID_COLS}% ${CELL_HEIGHT}px`
            : 'auto',
          position: 'relative',
          width: '100%'
        }}
      >
        {/* Grid Overlay for Edit Mode */}
        {layout.isEditMode && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Drag Over Preview */}
            {dragOverPosition && (
              <div
                className="absolute bg-blue-200 border-2 border-blue-400 rounded-lg opacity-50 z-10"
                style={{
                  left: `calc(${(dragOverPosition.col / GRID_COLS) * 100}% + 8px)`,
                  top: `${dragOverPosition.row * CELL_HEIGHT + 8}px`,
                  width: `calc(${(dragOverPosition.width / GRID_COLS) * 100}% - 16px)`,
                  height: `${dragOverPosition.height * CELL_HEIGHT - 16}px`
                }}
              />
            )}
          </div>
        )}

        {/* Modules */}
        {visibleModules.map((module) => {
          // Použij preview pozici během přetahování, jinak normální pozici
          const position = (isDragging && previewPositions.size > 0)
            ? previewPositions.get(module.id) || modulePositions.get(module.id)
            : modulePositions.get(module.id)

          if (!position) return null

          const isBeingDragged = draggedModule === module.id
          const isMovingDueToDrag = isDragging && !isBeingDragged && previewPositions.has(module.id)

          return (
            <div
              key={module.id}
              className={`
                absolute transition-all duration-300 ease-out
                ${layout.isEditMode ? 'ring-2 ring-primary-200 ring-opacity-50' : ''}
                ${module.isLocked ? 'ring-2 ring-gray-300' : ''}
                ${layout.isEditMode && !module.isLocked ? 'cursor-grab active:cursor-grabbing' : ''}
                ${isBeingDragged ? 'opacity-60 scale-105 z-50 rotate-1' : ''}
                ${isMovingDueToDrag ? 'ring-2 ring-orange-300 ring-opacity-70' : ''}
                group
              `}
              style={{
                left: `calc(${(position.col / GRID_COLS) * 100}% + 8px)`,
                top: `${position.row * CELL_HEIGHT + 8}px`,
                width: `calc(${(position.width / GRID_COLS) * 100}% - 16px)`,
                height: `${position.height * CELL_HEIGHT - 16}px`,
                transition: isBeingDragged ? 'none' : 'all 0.3s ease-out'
              }}
              draggable={layout.isEditMode && !module.isLocked}
              onDragStart={(e) => handleDragStart(e, module.id)}
              onDragEnd={handleDragEnd}
            >
              {/* Edit Mode Controls */}
              {layout.isEditMode && (
                <div className="absolute top-2 right-2 z-20 flex space-x-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleModuleVisibility(module.id)
                    }}
                    className="p-1 bg-white rounded shadow-md hover:bg-gray-50 transition-colors"
                    title={module.isVisible ? 'Skrýt modul' : 'Zobrazit modul'}
                  >
                    {module.isVisible ? (
                      <Eye className="w-4 h-4 text-gray-600" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleModuleLock(module.id)
                    }}
                    className="p-1 bg-white rounded shadow-md hover:bg-gray-50 transition-colors"
                    title={module.isLocked ? 'Odemknout modul' : 'Zamknout modul'}
                  >
                    {module.isLocked ? (
                      <Lock className="w-4 h-4 text-red-500" />
                    ) : (
                      <Unlock className="w-4 h-4 text-gray-600" />
                    )}
                  </button>
                </div>
              )}

              {/* Drag Handle */}
              {layout.isEditMode && !module.isLocked && (
                <div
                  className="absolute top-2 left-2 z-20 p-1 bg-white rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                  title="Přetáhnout modul"
                >
                  <GripVertical className="w-4 h-4 text-gray-600" />
                </div>
              )}

              {/* Module Content */}
              <div className={`
                h-full w-full overflow-hidden
                ${!module.isVisible ? 'opacity-50' : ''}
                ${layout.isEditMode ? 'pointer-events-none' : ''}
              `}>
                <div className="h-full w-full">
                  {renderModule(module)}
                </div>
              </div>

              {/* Locked Overlay */}
              {module.isLocked && layout.isEditMode && (
                <div className="absolute inset-2 bg-gray-100 bg-opacity-50 flex items-center justify-center rounded-xl">
                  <div className="bg-white p-2 rounded-lg shadow-md">
                    <Lock className="w-6 h-6 text-gray-500" />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Hidden Modules Panel */}
      {layout.isEditMode && allModules.some(m => !m.isVisible) && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <h3 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
            <EyeOff className="w-4 h-4" />
            <span>Skryté moduly</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {allModules
              .filter(m => !m.isVisible)
              .map((module) => (
                <button
                  key={module.id}
                  onClick={() => toggleModuleVisibility(module.id)}
                  className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
                  title="Klikněte pro zobrazení modulu"
                >
                  <Eye className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">{module.title}</span>
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Edit Mode Help */}
      {layout.isEditMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h3 className="font-medium text-blue-900 mb-2">Nápověda pro grid layout</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Přetáhněte modul</strong> kamkoliv na grid plochu - umístí se přesně tam, kde ho pustíte</li>
            <li>• <strong>Modrý náhled</strong> ukazuje kam modul spadne</li>
            <li>• <strong>Oranžový rámeček</strong> označuje moduly, které se automaticky přesunou</li>
            <li>• Moduly se přesunou na <strong>nejbližší volné místo</strong> pokud jim stojíte v cestě</li>
            <li>• Použijte <strong>scroll myši</strong> pro pohyb po celé ploše během přetahování</li>
            <li>• Grid má {GRID_COLS} sloupců a {GRID_ROWS} řádků</li>
            <li>• Použijte ikonu <strong>oka (👁️)</strong> pro skrytí/zobrazení modulů</li>
            <li>• Použijte ikonu <strong>zámku (🔒)</strong> pro zamknutí/odemknutí modulů</li>
          </ul>
        </div>
      )}
    </div>
  )
}
