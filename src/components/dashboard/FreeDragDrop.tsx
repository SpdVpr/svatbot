'use client'

import { useState, useRef, useEffect } from 'react'
import { useDashboard } from '@/hooks/useDashboard'
import { DashboardModule } from '@/types/dashboard'
import { Edit3, Lock, Unlock, Eye, EyeOff, RotateCcw, GripVertical, Grid3x3, Maximize2 } from 'lucide-react'

// Module components
import WeddingCountdownModule from './modules/WeddingCountdownModule'
import QuickActionsModule from './modules/QuickActionsModule'
import UpcomingTasksModule from './modules/UpcomingTasksModule'
import MarketplaceModule from './modules/MarketplaceModule'
import TaskManagementModule from './modules/TaskManagementModule'
import GuestManagementModule from './modules/GuestManagementModule'
import BudgetTrackingModule from './modules/BudgetTrackingModule'
import TimelinePlanningModule from './modules/TimelinePlanningModule'
import VendorManagementModule from './modules/VendorManagementModule'
import SeatingPlanModule from './modules/SeatingPlanModule'
import WeddingDayTimelineModule from './modules/WeddingDayTimelineModule'
import MoodboardModule from './modules/MoodboardModule'
import WeddingChecklistModule from './modules/WeddingChecklistModule'
import MusicPlaylistModule from './modules/MusicPlaylistModule'
import FoodDrinksModule from './modules/FoodDrinksModule'
import WeddingWebsiteModule from './modules/WeddingWebsiteModule'
import AccommodationManagementModule from './modules/AccommodationManagementModule'
import ShoppingListModule from './modules/ShoppingListModule'

interface FreeDragDropProps {
  onWeddingSettingsClick?: () => void
}

// Module size configurations (width x height in pixels)
const MODULE_SIZES = {
  small: { width: 300, height: 250 },
  medium: { width: 330, height: 280 },
  large: { width: 680, height: 280 },
  full: { width: 1400, height: 280 }
}

export default function FreeDragDrop({ onWeddingSettingsClick }: FreeDragDropProps) {
  const {
    layout,
    loading,
    setLayoutMode,
    toggleEditMode,
    toggleModuleVisibility,
    toggleModuleLock,
    resetLayout,
    getVisibleModules,
    updateModulePosition
  } = useDashboard()

  const layoutMode = layout.layoutMode || 'grid'

  const containerRef = useRef<HTMLDivElement>(null)
  const [canvasSize, setCanvasSize] = useState({ width: 2000, height: 2400 })

  // Render module content
  const renderModule = (module: DashboardModule) => {
    switch (module.type) {
      case 'wedding-countdown':
        return <WeddingCountdownModule onWeddingSettingsClick={onWeddingSettingsClick || (() => {})} />
      case 'quick-actions':
        return <QuickActionsModule />
      case 'upcoming-tasks':
        return <UpcomingTasksModule />
      case 'marketplace':
        return <MarketplaceModule />
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
      case 'wedding-day-timeline':
        return <WeddingDayTimelineModule />
      case 'moodboard':
        return <MoodboardModule />
      case 'wedding-checklist':
        return <WeddingChecklistModule />
      case 'music-playlist':
        return <MusicPlaylistModule />
      case 'food-drinks':
        return <FoodDrinksModule />
      case 'wedding-website':
        return <WeddingWebsiteModule />
      case 'accommodation-management':
        return <AccommodationManagementModule />
      case 'shopping-list':
        return <ShoppingListModule />
      default:
        return <div className="p-4">Modul není k dispozici</div>
    }
  }

  const visibleModules = getVisibleModules()
  const allModules = layout.modules

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-muted">Načítání dashboardu...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-[2000px]">
      <div className="space-y-6">
        {/* Dashboard Controls */}
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Dashboard</h2>

            <div className="flex items-center space-x-2">
              {/* Layout Mode Switcher */}
              <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setLayoutMode('grid')}
                  className={`flex items-center space-x-1 px-2 py-1.5 rounded-md transition-colors ${
                    layoutMode === 'grid'
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="Grid layout"
                >
                  <Grid3x3 className="w-4 h-4" />
                  <span className="hidden lg:inline text-sm">Grid</span>
                </button>
                <button
                  onClick={() => setLayoutMode('free')}
                  className={`flex items-center space-x-1 px-2 py-1.5 rounded-md transition-colors ${
                    layoutMode === 'free'
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="Volný layout"
                >
                  <Maximize2 className="w-4 h-4" />
                  <span className="hidden lg:inline text-sm">Volný</span>
                </button>
              </div>

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
                <button
                  onClick={resetLayout}
                  className="btn-outline flex items-center space-x-2 text-red-600 border-red-300 hover:bg-red-50"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span className="hidden sm:inline">Reset</span>
                </button>
              )}
            </div>
          </div>

          {layout.isEditMode && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 <strong>Tip:</strong> Přetáhněte moduly kamkoliv chcete. Můžete je umístit i přes sebe. Klikněte na ikonu oka pro skrytí/zobrazení modulu.
              </p>
            </div>
          )}
        </div>

        {/* Free Canvas with Absolute Positioning */}
        <div
          ref={containerRef}
          className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 overflow-hidden touch-none"
          style={{
            width: '100%',
            height: `${canvasSize.height}px`,
            minHeight: '1200px',
            backgroundImage: layout.isEditMode
              ? `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.08) 1px, transparent 0)`
              : 'none',
            backgroundSize: layout.isEditMode ? '40px 40px' : 'auto'
          }}
        >
          {/* Canvas info overlay */}
          {layout.isEditMode && (
            <div className="absolute top-4 left-4 text-gray-400 text-sm font-medium pointer-events-none z-0">
              Dashboard • {visibleModules.length} {visibleModules.length === 1 ? 'modul' : visibleModules.length < 5 ? 'moduly' : 'modulů'}
            </div>
          )}

          {/* Modules */}
          {(layout.isEditMode ? allModules : visibleModules).map((module) => (
            <DraggableModule
              key={module.id}
              module={module}
              isEditMode={layout.isEditMode}
              onPositionChange={updateModulePosition}
              onToggleVisibility={toggleModuleVisibility}
              onToggleLock={toggleModuleLock}
              renderContent={() => renderModule(module)}
            />
          ))}

          {/* Empty state */}
          {visibleModules.length === 0 && !layout.isEditMode && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center text-gray-400">
                <div className="text-6xl mb-4">📊</div>
                <p className="text-lg font-medium">Váš dashboard je prázdný</p>
                <p className="text-sm">Klikněte na "Upravit layout" a zobrazte moduly</p>
              </div>
            </div>
          )}
        </div>

        {/* Hidden Modules Panel */}
        {layout.isEditMode && allModules.some(m => !m.isVisible) && (
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Skryté moduly (klikněte pro zobrazení)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {allModules
                .filter(m => !m.isVisible)
                .map((module) => (
                  <button
                    key={module.id}
                    onClick={() => toggleModuleVisibility(module.id)}
                    className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
                    title="Klikněte pro zobrazení modulu"
                  >
                    <EyeOff className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700 truncate">{module.title}</span>
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Draggable Module Component (similar to MoodboardImageCard)
interface DraggableModuleProps {
  module: DashboardModule
  isEditMode: boolean
  onPositionChange: (moduleId: string, position: { x: number; y: number }) => void
  onToggleVisibility: (moduleId: string) => void
  onToggleLock: (moduleId: string) => void
  renderContent: () => React.ReactNode
}

function DraggableModule({
  module,
  isEditMode,
  onPositionChange,
  onToggleVisibility,
  onToggleLock,
  renderContent
}: DraggableModuleProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState(module.position || { x: 100, y: 100 })
  const [isHovered, setIsHovered] = useState(false)
  const dragRef = useRef<HTMLDivElement>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [hasDragged, setHasDragged] = useState(false)
  const [dragStartTime, setDragStartTime] = useState(0)
  const lastMoveTime = useRef(0)

  const moduleSize = MODULE_SIZES[module.size]
  const isHidden = !module.isVisible

  // Update position when module.position changes (from Firebase)
  useEffect(() => {
    if (module.position && !isDragging) {
      setPosition(module.position)
    }
  }, [module.position, isDragging])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isEditMode || module.isLocked) return

    e.preventDefault()
    e.stopPropagation()

    setHasDragged(false)
    setDragStartTime(Date.now())
    setIsDragging(true)

    const rect = dragRef.current?.getBoundingClientRect()
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      })
    }
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return

    const now = Date.now()
    if (now - lastMoveTime.current < 16) return
    lastMoveTime.current = now

    if (!hasDragged && now - dragStartTime > 100) {
      setHasDragged(true)
    }

    const container = dragRef.current?.parentElement?.getBoundingClientRect()
    if (container) {
      const newX = Math.max(0, Math.min(
        container.width - moduleSize.width,
        e.clientX - container.left - dragOffset.x
      ))
      const newY = Math.max(0, Math.min(
        container.height - moduleSize.height,
        e.clientY - container.top - dragOffset.y
      ))

      setPosition({ x: newX, y: newY })
    }
  }

  const handleMouseUp = () => {
    if (isDragging && hasDragged) {
      console.log('💾 Saving module position:', module.id, position)
      onPositionChange(module.id, position)
    }
    setIsDragging(false)
    setHasDragged(false)
  }

  useEffect(() => {
    if (isDragging) {
      console.log('🖱️ Adding mouse listeners for:', module.id)
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        console.log('🗑️ Removing mouse listeners for:', module.id)
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, dragOffset, moduleSize, hasDragged, dragStartTime, position, module.id, onPositionChange])

  return (
    <div
      ref={dragRef}
      className={`absolute group select-none ${
        isDragging
          ? 'z-50 scale-105 shadow-2xl cursor-grabbing'
          : isEditMode && !module.isLocked
          ? 'z-10 hover:z-20 cursor-grab hover:shadow-lg transition-shadow duration-200'
          : 'z-10'
      } ${isHidden && isEditMode ? 'opacity-40' : ''}`}
      style={{
        left: position.x,
        top: position.y,
        width: moduleSize.width,
        height: moduleSize.height,
        willChange: isDragging ? 'transform' : 'auto',
        transition: isDragging ? 'none' : 'transform 0.2s ease, box-shadow 0.2s ease'
      }}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => !isDragging && setIsHovered(true)}
      onMouseLeave={() => !isDragging && setIsHovered(false)}
    >
      <div className={`relative w-full h-full rounded-lg overflow-hidden shadow-lg bg-white border-2 transition-all ${
        isDragging
          ? 'border-primary-300'
          : module.isLocked
          ? 'border-gray-300'
          : isEditMode
          ? 'border-primary-200 border-opacity-50'
          : 'border-transparent'
      }`}>
        {/* Edit Mode Controls */}
        {isEditMode && (
          <div className="absolute top-2 right-2 z-10 flex space-x-1">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onToggleVisibility(module.id)
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
                onToggleLock(module.id)
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
        {isEditMode && !module.isLocked && (
          <div
            className="absolute top-2 left-2 z-10 p-1 bg-white rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
            title="Přetáhnout modul"
          >
            <GripVertical className="w-4 h-4 text-gray-600" />
          </div>
        )}

        {/* Module Content */}
        {isHidden && isEditMode ? (
          <div className="h-full flex items-center justify-center p-8 bg-gray-50">
            <div className="text-center">
              <EyeOff className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-500">{module.title}</p>
              <p className="text-xs text-gray-400 mt-1">Skrytý modul</p>
            </div>
          </div>
        ) : (
          <div className={`h-full overflow-auto ${isEditMode ? 'pointer-events-none' : ''}`}>
            {renderContent()}
          </div>
        )}

        {/* Locked Overlay */}
        {module.isLocked && isEditMode && (
          <div className="absolute inset-0 bg-gray-100 bg-opacity-50 flex items-center justify-center rounded-lg">
            <div className="bg-white p-2 rounded-lg shadow-md">
              <Lock className="w-6 h-6 text-gray-500" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

