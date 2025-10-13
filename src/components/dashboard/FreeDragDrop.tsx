'use client'

import { useState, useRef, useEffect } from 'react'
import { useDashboard } from '@/hooks/useDashboard'
import { DashboardModule } from '@/types/dashboard'
import { Edit3, Lock, Unlock, Eye, EyeOff, RotateCcw, GripVertical, Grid3x3, Maximize2, Maximize } from 'lucide-react'

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
  small: { width: 300, height: 400 },
  medium: { width: 330, height: 450 },
  large: { width: 680, height: 450 },
  full: { width: 1400, height: 500 }
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
    updateModulePosition,
    updateModuleSize
  } = useDashboard()

  const layoutMode = layout.layoutMode || 'grid'

  const containerRef = useRef<HTMLDivElement>(null)
  const [canvasSize, setCanvasSize] = useState({ width: 2000, height: 4000 })

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
            {/* Left Side - Empty or Edit Mode Controls */}
            <div className="flex items-center space-x-2">
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

            {/* Center - Layout Mode Switcher */}
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

            {/* Right Side - Edit Mode Button */}
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
            </div>
          </div>

          {layout.isEditMode && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <span className="text-lg">💡</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-blue-900 mb-2">Jak upravit layout:</p>
                  <ul className="text-sm text-blue-800 space-y-1.5">
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span><strong>Přesunout modul:</strong> Klikněte a táhněte modul na nové místo</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span><strong>Změnit velikost:</strong> Najeďte myší na modul a v pravém dolním rohu podržte a táhněte ikonku</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span><strong>Skrýt/Zobrazit:</strong> Klikněte na ikonu oka v pravém horním rohu modulu</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span><strong>Zamknout:</strong> Klikněte na ikonu zámku pro zamčení modulu na místě</span>
                    </li>
                  </ul>
                </div>
              </div>
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
              onSizeChange={updateModuleSize}
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
  onSizeChange: (moduleId: string, size: { width: number; height: number }) => void
  onToggleVisibility: (moduleId: string) => void
  onToggleLock: (moduleId: string) => void
  renderContent: () => React.ReactNode
}

function DraggableModule({
  module,
  isEditMode,
  onPositionChange,
  onSizeChange,
  onToggleVisibility,
  onToggleLock,
  renderContent
}: DraggableModuleProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [position, setPosition] = useState(module.position || { x: 100, y: 100 })
  const [size, setSize] = useState(module.customSize || MODULE_SIZES[module.size])
  const [isHovered, setIsHovered] = useState(false)
  const dragRef = useRef<HTMLDivElement>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const [hasDragged, setHasDragged] = useState(false)
  const [dragStartTime, setDragStartTime] = useState(0)
  const lastMoveTime = useRef(0)

  const isHidden = !module.isVisible

  // Update position when module.position changes (from Firebase)
  useEffect(() => {
    if (module.position && !isDragging) {
      setPosition(module.position)
    }
  }, [module.position, isDragging])

  // Update size when module.customSize changes (from Firebase)
  useEffect(() => {
    if (module.customSize && !isResizing) {
      setSize(module.customSize)
    } else if (!module.customSize && !isResizing) {
      setSize(MODULE_SIZES[module.size])
    }
  }, [module.customSize, module.size, isResizing])

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
        container.width - size.width,
        e.clientX - container.left - dragOffset.x
      ))
      const newY = Math.max(0, Math.min(
        container.height - size.height,
        e.clientY - container.top - dragOffset.y
      ))

      setPosition({ x: newX, y: newY })
    }
  }

  const handleResizeStart = (e: React.MouseEvent) => {
    if (!isEditMode || module.isLocked) return

    e.preventDefault()
    e.stopPropagation()

    setIsResizing(true)
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height
    })
  }

  const handleResizeMove = (e: MouseEvent) => {
    if (!isResizing) return

    const deltaX = e.clientX - resizeStart.x
    const deltaY = e.clientY - resizeStart.y

    const newWidth = Math.max(250, resizeStart.width + deltaX)
    const newHeight = Math.max(200, resizeStart.height + deltaY)

    setSize({ width: newWidth, height: newHeight })
  }

  const handleResizeEnd = () => {
    if (isResizing) {
      console.log('📏 Saving module size:', module.id, size)
      onSizeChange(module.id, size)
    }
    setIsResizing(false)
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
  }, [isDragging, dragOffset, size, hasDragged, dragStartTime, position, module.id, onPositionChange])

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMove)
      document.addEventListener('mouseup', handleResizeEnd)
      return () => {
        document.removeEventListener('mousemove', handleResizeMove)
        document.removeEventListener('mouseup', handleResizeEnd)
      }
    }
  }, [isResizing, resizeStart, size, module.id, onSizeChange])

  return (
    <div
      ref={dragRef}
      className={`absolute group select-none ${
        isDragging || isResizing
          ? 'z-50 scale-105 shadow-2xl cursor-grabbing'
          : isEditMode && !module.isLocked
          ? 'z-10 hover:z-20 cursor-grab hover:shadow-lg hover:scale-[1.02] transition-all duration-200'
          : 'z-10 hover:scale-[1.02] hover:shadow-lg transition-all duration-200'
      } ${isHidden && isEditMode ? 'opacity-40' : ''}`}
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        willChange: isDragging || isResizing ? 'transform' : 'auto',
        transition: isDragging || isResizing ? 'none' : undefined
      }}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => !isDragging && !isResizing && setIsHovered(true)}
      onMouseLeave={() => !isDragging && !isResizing && setIsHovered(false)}
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
          <div className={`h-full ${isEditMode ? 'overflow-hidden pointer-events-none' : 'overflow-hidden'}`}>
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

        {/* Resize Handle */}
        {isEditMode && !module.isLocked && (
          <div
            onMouseDown={handleResizeStart}
            className="absolute bottom-1 right-1 w-7 h-7 cursor-nwse-resize opacity-0 group-hover:opacity-100 transition-opacity z-20 flex items-center justify-center bg-white rounded shadow-md hover:bg-primary-50 hover:border hover:border-primary-300"
            title="Změnit velikost modulu - klikněte a táhněte pro zvětšení nebo zmenšení"
          >
            <Maximize className="w-4 h-4 text-gray-600" />
          </div>
        )}
      </div>
    </div>
  )
}

