'use client'

import { useState, useRef, useEffect } from 'react'
import { Edit3, Lock, Unlock, RotateCcw, GripVertical, Eye, EyeOff, Monitor, Maximize2, ArrowLeftRight, Grid3x3 } from 'lucide-react'
import { useDashboard } from '@/hooks/useDashboard'
import { DashboardModule } from '@/types/dashboard'
import { useCanvas, CANVAS_CONFIGS, CanvasWidth } from '@/contexts/CanvasContext'

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
import WeddingDayTimelineModule from './modules/WeddingDayTimelineModule'
import MoodboardModule from './modules/MoodboardModule'
import WeddingChecklistModule from './modules/WeddingChecklistModule'
import MusicPlaylistModule from './modules/MusicPlaylistModule'
import FoodDrinksModule from './modules/FoodDrinksModule'
import WeddingWebsiteModule from './modules/WeddingWebsiteModule'
import AccommodationManagementModule from './modules/AccommodationManagementModule'
import ShoppingListModule from './modules/ShoppingListModule'

interface FixedGridDragDropProps {
  onWeddingSettingsClick: () => void
  layoutMode: 'grid' | 'free'
  onLayoutModeChange: (mode: 'grid' | 'free') => void
}

type GridSize = 'compact' | 'normal' | 'wide' | 'ultra-wide'

const GRID_CONFIGS = {
  'compact': { cols: 2, maxCols: 'lg:grid-cols-2', label: 'Kompaktní (2 sloupce)' },
  'normal': { cols: 3, maxCols: 'lg:grid-cols-3', label: 'Normální (3 sloupce)' },
  'wide': { cols: 4, maxCols: 'lg:grid-cols-4', label: 'Široký (4 sloupce)' },
  'ultra-wide': { cols: 5, maxCols: 'lg:grid-cols-5', label: 'Ultra široký (5 sloupců)' }
}

export default function FixedGridDragDrop({ onWeddingSettingsClick, layoutMode, onLayoutModeChange }: FixedGridDragDropProps) {
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

  const { canvasWidth, setCanvasWidth, getCanvasMaxWidth } = useCanvas()

  const [draggedModule, setDraggedModule] = useState<string | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [gridSize, setGridSize] = useState<GridSize>('normal')
  const [showGridSizeMenu, setShowGridSizeMenu] = useState(false)
  const [showCanvasMenu, setShowCanvasMenu] = useState(false)
  const dragTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleDragStart = (e: React.DragEvent, moduleId: string, index: number) => {
    if (!layout.isEditMode) return

    setDraggedModule(moduleId)
    setIsDragging(true)
    setDragOverIndex(null)

    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', moduleId)

    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current)
    }
  }

  const handleDragEnd = (e: React.DragEvent) => {
    dragTimeoutRef.current = setTimeout(() => {
      setDraggedModule(null)
      setDragOverIndex(null)
      setIsDragging(false)
    }, 50)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.stopPropagation()

    if (!draggedModule || !isDragging) return

    e.dataTransfer.dropEffect = 'move'

    if (dragOverIndex !== index) {
      setDragOverIndex(index)
    }
  }

  const handleDragEnter = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.stopPropagation()

    if (!draggedModule || !isDragging) return

    setDragOverIndex(index)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX
    const y = e.clientY

    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setTimeout(() => {
        if (isDragging) {
          setDragOverIndex(null)
        }
      }, 10)
    }
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    e.stopPropagation()

    if (!draggedModule || !isDragging) return

    const modules = getVisibleModules()
    const draggedIndex = modules.findIndex(m => m.id === draggedModule)

    if (draggedIndex === -1 || draggedIndex === dropIndex) {
      setDraggedModule(null)
      setDragOverIndex(null)
      setIsDragging(false)
      return
    }

    const newModules = [...modules]
    const [removed] = newModules.splice(draggedIndex, 1)
    newModules.splice(dropIndex, 0, removed)

    updateModuleOrder(newModules)

    setDraggedModule(null)
    setDragOverIndex(null)
    setIsDragging(false)

    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current)
    }
  }

  useEffect(() => {
    return () => {
      if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current)
      }
    }
  }, [])

  // Zavřít menu při kliknutí mimo něj
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element

      if (showGridSizeMenu && !target.closest('[data-grid-size-menu]')) {
        setShowGridSizeMenu(false)
      }

      if (showCanvasMenu && !target.closest('[data-canvas-menu]')) {
        setShowCanvasMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showGridSizeMenu, showCanvasMenu])

  const getSizeClasses = (size: string) => {
    const config = GRID_CONFIGS[gridSize]
    const maxCols = config.cols

    switch (size) {
      case 'small':
        return 'col-span-1'
      case 'medium':
        return 'col-span-1'
      case 'large':
        return `col-span-1 lg:col-span-${Math.min(2, maxCols)}`
      case 'full':
        return `col-span-1 lg:col-span-${maxCols}`
      default:
        return 'col-span-1'
    }
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
    <div className={`mx-auto px-4 sm:px-6 lg:px-8 ${getCanvasMaxWidth()}`}>
      <div className="space-y-6">
      {/* Dashboard Controls */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-gray-200">
        {/* Mobile Layout */}
        <div className="sm:hidden space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Dashboard</h2>
            <button
              onClick={toggleEditMode}
              className={`btn-outline flex items-center space-x-1 text-sm px-2 py-1 ${
                layout.isEditMode ? 'bg-primary-50 border-primary-300 text-primary-700' : ''
              }`}
            >
              <Edit3 className="w-3 h-3" />
              <span>{layout.isEditMode ? 'Hotovo' : 'Upravit'}</span>
            </button>
          </div>

          {layout.isEditMode && (
            <div className="flex items-center space-x-2 text-xs text-primary-600">
              <Edit3 className="w-3 h-3" />
              <span>Režim úprav aktivní</span>
            </div>
          )}

          {/* Mobile Controls Row */}
          <div className="flex items-center justify-between space-x-2">
            {/* Canvas Width - Mobile */}
            <div className="relative flex-1" data-canvas-menu>
              <button
                onClick={() => setShowCanvasMenu(!showCanvasMenu)}
                className="btn-outline w-full flex items-center justify-center space-x-1 text-xs px-2 py-1"
                title="Šířka plochy"
              >
                <ArrowLeftRight className="w-3 h-3" />
                <span className="truncate">{CANVAS_CONFIGS[canvasWidth].shortLabel || 'Šířka'}</span>
              </button>
              {showCanvasMenu && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  {Object.entries(CANVAS_CONFIGS).map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => {
                        setCanvasWidth(key as CanvasWidth)
                        setShowCanvasMenu(false)
                      }}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                        canvasWidth === key ? 'bg-primary-50 text-primary-700' : ''
                      }`}
                    >
                      {config.shortLabel || config.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Grid Size - Mobile */}
            <div className="relative flex-1" data-grid-size-menu>
              <button
                onClick={() => setShowGridSizeMenu(!showGridSizeMenu)}
                className="btn-outline w-full flex items-center justify-center space-x-1 text-xs px-2 py-1"
                title="Počet sloupců"
              >
                <Monitor className="w-3 h-3" />
                <span>{GRID_CONFIGS[gridSize].cols} sl.</span>
              </button>
              {showGridSizeMenu && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  {Object.entries(GRID_CONFIGS).map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => {
                        setGridSize(key as GridSize)
                        setShowGridSizeMenu(false)
                      }}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                        gridSize === key ? 'bg-primary-50 text-primary-700' : ''
                      }`}
                    >
                      {config.cols} sloupců
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Edit Mode Controls - Mobile */}
            {layout.isEditMode && (
              <>
                <button
                  onClick={toggleLock}
                  className={`btn-outline flex items-center justify-center px-2 py-1 text-xs ${
                    layout.isLocked ? 'bg-red-50 border-red-300 text-red-700' : ''
                  }`}
                  title={layout.isLocked ? 'Odemknout' : 'Zamknout'}
                >
                  {layout.isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                </button>

                <button
                  onClick={resetLayout}
                  className="btn-outline flex items-center justify-center px-2 py-1 text-xs text-gray-600 hover:text-red-600"
                  title="Reset"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden sm:flex items-center justify-between">
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
          {/* Canvas Width Selector */}
          <div className="relative" data-canvas-menu>
            <button
              onClick={() => setShowCanvasMenu(!showCanvasMenu)}
              className="btn-outline flex items-center space-x-2"
              title="Změnit šířku plochy dashboardu"
            >
              <ArrowLeftRight className="w-4 h-4" />
              <span className="hidden sm:inline">{CANVAS_CONFIGS[canvasWidth].label}</span>
              <span className="sm:hidden">Šířka</span>
            </button>

            {showCanvasMenu && (
              <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[280px]">
                <div className="p-2">
                  <div className="text-xs font-medium text-gray-500 mb-2 px-2">Šířka plochy dashboardu</div>
                  {Object.entries(CANVAS_CONFIGS).map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => {
                        setCanvasWidth(key as CanvasWidth)
                        setShowCanvasMenu(false)
                      }}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        canvasWidth === key
                          ? 'bg-primary-50 text-primary-700 font-medium'
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div className="flex flex-col">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{config.label}</span>
                          {canvasWidth === key && <ArrowLeftRight className="w-3 h-3" />}
                        </div>
                        <span className="text-xs text-gray-500 mt-1">{config.description}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Grid Size Selector */}
          <div className="relative" data-grid-size-menu>
            <button
              onClick={() => setShowGridSizeMenu(!showGridSizeMenu)}
              className="btn-outline flex items-center space-x-2"
              title="Změnit počet sloupců gridu"
            >
              <Monitor className="w-4 h-4" />
              <span className="hidden sm:inline">{GRID_CONFIGS[gridSize].label}</span>
              <span className="sm:hidden">{GRID_CONFIGS[gridSize].cols} sloupců</span>
            </button>

            {showGridSizeMenu && (
              <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[200px]">
                <div className="p-2">
                  <div className="text-xs font-medium text-gray-500 mb-2 px-2">Počet sloupců gridu</div>
                  {Object.entries(GRID_CONFIGS).map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => {
                        setGridSize(key as GridSize)
                        setShowGridSizeMenu(false)
                      }}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        gridSize === key
                          ? 'bg-primary-50 text-primary-700 font-medium'
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{config.label}</span>
                        {gridSize === key && <Maximize2 className="w-3 h-3" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Layout Mode Switcher */}
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => onLayoutModeChange('grid')}
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
              onClick={() => onLayoutModeChange('free')}
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
      </div>

      {/* Grid Layout with Background */}
      <div
        className={`
          bg-white rounded-xl border border-gray-200 p-4 min-h-[calc(100vh-240px)] overflow-y-auto
          ${layout.isEditMode ? 'bg-grid-pattern' : ''}
        `}
        style={{
          backgroundImage: layout.isEditMode
            ? `linear-gradient(to right, #e5e7eb 1px, transparent 1px),
               linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)`
            : 'none',
          backgroundSize: layout.isEditMode
            ? '100px 100px'
            : 'auto'
        }}
      >
        <div className={`grid grid-cols-1 ${GRID_CONFIGS[gridSize].maxCols} gap-6`}>
          {(layout.isEditMode ? layout.modules : visibleModules).map((module, index) => {
            const isHidden = !module.isVisible

            return (
              <div
                key={module.id}
                className={`
                  ${getSizeClasses(module.size)}
                  ${layout.isEditMode ? 'ring-2 ring-primary-200 ring-opacity-50' : ''}
                  ${module.isLocked ? 'ring-2 ring-gray-300' : ''}
                  ${dragOverIndex === index ? 'ring-4 ring-blue-300 bg-blue-50' : ''}
                  ${layout.isEditMode && !module.isLocked ? 'cursor-grab active:cursor-grabbing' : ''}
                  ${draggedModule === module.id ? 'opacity-60 scale-105 z-50 rotate-1' : ''}
                  ${isDragging && draggedModule !== module.id ? 'transition-all duration-200 ease-out' : ''}
                  ${isHidden && layout.isEditMode ? 'opacity-40 border-2 border-dashed border-gray-300 bg-gray-50' : ''}
                  relative group
                `}
                draggable={layout.isEditMode && !module.isLocked}
                onDragStart={(e) => handleDragStart(e, module.id, index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnter={(e) => handleDragEnter(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
              >
              {/* Edit Mode Controls */}
              {layout.isEditMode && (
                <div className="absolute top-2 right-2 z-10 flex space-x-1">
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
                  className="absolute top-2 left-2 z-10 p-1 bg-white rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                  title="Přetáhnout modul"
                >
                  <GripVertical className="w-4 h-4 text-gray-600" />
                </div>
              )}

              {/* Module Content */}
              {isHidden && layout.isEditMode ? (
                <div className="h-full flex items-center justify-center p-8">
                  <div className="text-center">
                    <EyeOff className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-500">{module.type}</p>
                    <p className="text-xs text-gray-400 mt-1">Skrytý modul</p>
                  </div>
                </div>
              ) : (
                <div className={`
                  h-full
                  ${layout.isEditMode ? 'pointer-events-none' : ''}
                `}>
                  {renderModule(module)}
                </div>
              )}

              {/* Locked Overlay */}
              {module.isLocked && layout.isEditMode && (
                <div className="absolute inset-0 bg-gray-100 bg-opacity-50 flex items-center justify-center rounded-xl">
                  <div className="bg-white p-2 rounded-lg shadow-md">
                    <Lock className="w-6 h-6 text-gray-500" />
                  </div>
                </div>
              )}
            </div>
            )
          })}
        </div>
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


      </div>
    </div>
  )
}
