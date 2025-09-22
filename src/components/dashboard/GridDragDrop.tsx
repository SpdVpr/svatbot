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
import PhaseProgressModule from './modules/PhaseProgressModule'
import QuickStatsModule from './modules/QuickStatsModule'
import ComingSoonModule from './modules/ComingSoonModule'
import TaskManagementModule from './modules/TaskManagementModule'
import GuestManagementModule from './modules/GuestManagementModule'
import BudgetTrackingModule from './modules/BudgetTrackingModule'
import TimelinePlanningModule from './modules/TimelinePlanningModule'
import VendorManagementModule from './modules/VendorManagementModule'
import SeatingPlanModule from './modules/SeatingPlanModule'

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

  // Najdi volné místo v gridu
  const findFreePosition = (width: number, height: number, excludeModule?: string): GridPosition | null => {
    const occupiedCells = new Set<string>()

    // Označit obsazené buňky
    modulePositions.forEach((pos, moduleId) => {
      if (moduleId !== excludeModule) {
        for (let r = pos.row; r < pos.row + pos.height; r++) {
          for (let c = pos.col; c < pos.col + pos.width; c++) {
            occupiedCells.add(`${r}-${c}`)
          }
        }
      }
    })

    // Najít první volné místo
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col <= GRID_COLS - width; col++) {
        let canPlace = true

        for (let r = row; r < row + height && canPlace; r++) {
          for (let c = col; c < col + width && canPlace; c++) {
            if (occupiedCells.has(`${r}-${c}`)) {
              canPlace = false
            }
          }
        }

        if (canPlace) {
          return { row, col, width, height }
        }
      }
    }

    return null
  }

  // Posun moduly které jsou v cestě
  const pushModulesAway = (newPosition: GridPosition, excludeModule: string) => {
    const newPositions = new Map(modulePositions)
    const conflictingModules: string[] = []

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
          conflictingModules.push(moduleId)
        }
      }
    })

    // Přesuň konfliktní moduly
    conflictingModules.forEach(moduleId => {
      const modulePos = modulePositions.get(moduleId)
      if (modulePos) {
        const freePos = findFreePosition(modulePos.width, modulePos.height, moduleId)
        if (freePos) {
          newPositions.set(moduleId, freePos)
        }
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

        setDragOverPosition(newPosition)
      }
    }
  }

  const handleGridDrop = (e: React.DragEvent) => {
    e.preventDefault()

    if (!draggedModule || !dragOverPosition) return

    const newPositions = pushModulesAway(dragOverPosition, draggedModule)
    newPositions.set(draggedModule, dragOverPosition)

    setModulePositions(newPositions)

    // Aktualizuj pořadí modulů podle pozic
    const sortedModules = Array.from(newPositions.entries())
      .sort(([, a], [, b]) => a.row - b.row || a.col - b.col)
      .map(([moduleId]) => getVisibleModules().find(m => m.id === moduleId))
      .filter(Boolean) as DashboardModule[]

    updateModuleOrder(sortedModules)

    setDraggedModule(null)
    setDragOverPosition(null)
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
      case 'phase-progress':
        return <PhaseProgressModule />
      case 'quick-stats':
        return <QuickStatsModule />
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
          const position = modulePositions.get(module.id)
          if (!position) return null

          return (
            <div
              key={module.id}
              className={`
                absolute transition-all duration-300 ease-out
                ${layout.isEditMode ? 'ring-2 ring-primary-200 ring-opacity-50' : ''}
                ${module.isLocked ? 'ring-2 ring-gray-300' : ''}
                ${layout.isEditMode && !module.isLocked ? 'cursor-grab active:cursor-grabbing' : ''}
                ${draggedModule === module.id ? 'opacity-60 scale-105 z-50 rotate-1' : ''}
                group
              `}
              style={{
                left: `calc(${(position.col / GRID_COLS) * 100}% + 8px)`,
                top: `${position.row * CELL_HEIGHT + 8}px`,
                width: `calc(${(position.width / GRID_COLS) * 100}% - 16px)`,
                height: `${position.height * CELL_HEIGHT - 16}px`
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
            <li>• Přetáhněte moduly kamkoliv na grid plochu</li>
            <li>• Modrý náhled ukazuje kam modul spadne</li>
            <li>• Moduly se automaticky posunou pokud jim stojíte v cestě</li>
            <li>• Použijte scroll myši pro pohyb po celé ploše</li>
            <li>• Grid má {GRID_COLS} sloupců a {GRID_ROWS} řádků</li>
            <li>• Použijte ikonu oka (👁️) pro skrytí/zobrazení modulů</li>
            <li>• Použijte ikonu zámku (🔒) pro zamknutí/odemknutí modulů</li>
          </ul>
        </div>
      )}
    </div>
  )
}
