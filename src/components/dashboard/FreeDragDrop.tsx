'use client'

import { useState, useRef, useEffect } from 'react'
import { useDashboard } from '@/hooks/useDashboard'
import { useOnboarding } from '@/hooks/useOnboarding'
import { DashboardModule } from '@/types/dashboard'
import { Edit3, Lock, Unlock, Eye, EyeOff, RotateCcw, GripVertical, Grid3x3, Maximize2, Maximize, BookOpen, Sparkles } from 'lucide-react'
import OnboardingWizard from '../onboarding/OnboardingWizard'

// Module components
import WeddingCountdownModule from './modules/WeddingCountdownModule'
import QuickActionsModule from './modules/QuickActionsModule'
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
import SvatbotCoachModule from './modules/SvatbotCoachModule'
import OnboardingWidget from '../onboarding/OnboardingWidget'

interface FreeDragDropProps {
  onWeddingSettingsClick?: () => void
}

// Module size configurations (width x height in pixels)
// Calculation: 3 modules × 360px = 1080px + 4 gaps × 40px = 1240px
const MODULE_SIZES = {
  small: { width: 360, height: 400 },
  medium: { width: 360, height: 450 },
  large: { width: 760, height: 450 },  // 2 modules wide: 360 + 40 + 360
  full: { width: 1160, height: 500 }   // 3 modules wide: 360 + 40 + 360 + 40 + 360
}

// Grid configuration for snapping
const GRID_SIZE = 40 // Grid cell size in pixels
const SNAP_THRESHOLD = 20 // Distance in pixels to snap to grid

// Canvas width configurations
type CanvasWidth = 'normal' | 'wide' | 'ultra-wide'
const CANVAS_WIDTHS = {
  'normal': { width: 1240, label: 'Normální (3 moduly)', description: '1240px - 3 moduly vedle sebe' },
  'wide': { width: 1640, label: 'Široký (4 moduly)', description: '1640px - 4 moduly vedle sebe' },
  'ultra-wide': { width: 2040, label: 'Ultra široký (5 modulů)', description: '2040px - 5 modulů vedle sebe' }
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

  const { getProgress, getNextStep } = useOnboarding()

  const layoutMode = layout.layoutMode || 'grid'

  const containerRef = useRef<HTMLDivElement>(null)
  const [canvasWidth, setCanvasWidth] = useState<CanvasWidth>('normal')
  const [canvasSize, setCanvasSize] = useState({ width: CANVAS_WIDTHS['normal'].width, height: 4000 })
  const [snapGuides, setSnapGuides] = useState<{ x: number[], y: number[] }>({ x: [], y: [] })
  const [showCanvasMenu, setShowCanvasMenu] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [showOnboardingWizard, setShowOnboardingWizard] = useState(false)

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Update canvas size when width changes
  useEffect(() => {
    setCanvasSize(prev => ({ ...prev, width: CANVAS_WIDTHS[canvasWidth].width }))
  }, [canvasWidth])

  // Close canvas menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (showCanvasMenu && !target.closest('[data-canvas-menu]')) {
        setShowCanvasMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showCanvasMenu])

  // Render module content
  const renderModule = (module: DashboardModule) => {
    switch (module.type) {
      case 'wedding-countdown':
        return <WeddingCountdownModule onWeddingSettingsClick={onWeddingSettingsClick || (() => {})} />
      case 'quick-actions':
        return <QuickActionsModule />
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
      case 'svatbot-coach':
        return <SvatbotCoachModule />
      default:
        return <div className="p-4">Modul není k dispozici</div>
    }
  }

  const visibleModules = getVisibleModules()
  const allModules = layout.modules

  // Don't show loading state - let content fade in smoothly with AppTemplate

  // Mobile: Use simple vertical stack layout
  if (isMobile) {
    return (
      <div className="mx-auto px-4 max-w-full">
        <div className="space-y-4">
          {/* Mobile Controls - Simplified */}
          <div className="bg-white p-3 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Dashboard</h2>
              <button
                onClick={toggleEditMode}
                className={`btn-outline flex items-center space-x-2 text-sm ${
                  layout.isEditMode ? 'bg-primary-50 border-primary-400 shadow-2xl text-primary-700' : ''
                }`}
              >
                <Edit3 className="w-4 h-4" />
                <span>{layout.isEditMode ? 'Hotovo' : 'Upravit'}</span>
              </button>
            </div>
            {layout.isEditMode && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800">
                  💡 Klikněte na ikonu oka pro skrytí/zobrazení modulů
                </p>
              </div>
            )}
          </div>

          {/* Mobile Modules - Vertical Stack */}
          <div className="space-y-4">
            {(layout.isEditMode ? allModules : visibleModules).map((module) => (
              <div
                key={module.id}
                className={`bg-white rounded-xl border-2 transition-all ${
                  !module.isVisible ? 'opacity-50 border-gray-200' : 'border-gray-200'
                }`}
              >
                {/* Mobile Module Header (Edit Mode) */}
                {layout.isEditMode && (
                  <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
                    <span className="text-sm font-medium text-gray-700">{module.title}</span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleModuleVisibility(module.id)}
                        className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors"
                        title={module.isVisible ? 'Skrýt modul' : 'Zobrazit modul'}
                      >
                        {module.isVisible ? (
                          <Eye className="w-4 h-4 text-gray-600" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
                {/* Module Content */}
                {module.isVisible && (
                  <div className="p-4">
                    {renderModule(module)}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Empty state */}
          {visibleModules.length === 0 && !layout.isEditMode && (
            <div className="text-center py-12 text-gray-400">
              <div className="text-6xl mb-4">📊</div>
              <p className="text-lg font-medium">Váš dashboard je prázdný</p>
              <p className="text-sm">Klikněte na "Upravit" a zobrazte moduly</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Desktop: Use drag & drop layout
  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-[2000px]">
      <div className="space-y-6">
        {/* Dashboard Controls */}
        <div
          className="bg-gray-50/95 backdrop-blur-xl p-5 rounded-3xl border border-gray-100/60 mx-auto shadow-lg"
          style={{
            maxWidth: '1240px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
          }}
        >
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

            {/* Center - Layout Mode Switcher (only in edit mode) OR Onboarding Guide */}
            {layout.isEditMode ? (
              <div className="flex items-center space-x-2 bg-gray-100/80 backdrop-blur-xl rounded-2xl p-1.5 border border-gray-200/50">
                <button
                  onClick={() => setLayoutMode('grid')}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all duration-300 ${
                    layoutMode === 'grid'
                      ? 'bg-white text-primary-600 shadow-lg scale-105'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }`}
                  style={layoutMode === 'grid' ? {
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
                  } : {}}
                  title="Grid layout"
                >
                  <Grid3x3 className="w-4 h-4" />
                  <span className="hidden lg:inline text-sm font-medium">Grid</span>
                </button>
                <button
                  onClick={() => setLayoutMode('free')}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all duration-300 ${
                    layoutMode === 'free'
                      ? 'bg-white text-primary-600 shadow-lg scale-105'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }`}
                  style={layoutMode === 'free' ? {
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
                  } : {}}
                  title="Volný layout"
                >
                  <Maximize2 className="w-4 h-4" />
                  <span className="hidden lg:inline text-sm font-medium">Volný</span>
                </button>
              </div>
            ) : (
              <div
                className="flex items-center space-x-3 px-5 py-3 bg-gradient-to-r from-primary-50 to-pink-50 rounded-2xl border border-primary-200/50 backdrop-blur-xl shadow-lg"
                style={{
                  boxShadow: '0 4px 12px rgba(251, 113, 133, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
                }}
              >
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-primary-600" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Průvodce nastavením
                    </p>
                    <p className="text-xs text-gray-600">
                      {getProgress()}% dokončeno • {getNextStep()?.title || 'Vše hotovo!'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowOnboardingWizard(true)}
                  className="btn-primary flex items-center space-x-1 text-sm px-4 py-2"
                >
                  <BookOpen className="w-4 h-4" />
                  <span className="hidden sm:inline">Otevřít</span>
                </button>
              </div>
            )}

            {/* Right Side - Canvas Width & Edit Mode Button */}
            <div className="flex items-center space-x-2">
              {/* Canvas Width Selector */}
              <div className="relative" data-canvas-menu>
                <button
                  onClick={() => setShowCanvasMenu(!showCanvasMenu)}
                  className="btn-outline flex items-center space-x-2"
                  title="Změnit šířku plochy"
                >
                  <Maximize className="w-4 h-4" />
                  <span className="hidden lg:inline text-sm">
                    {CANVAS_WIDTHS[canvasWidth].label.split(' ')[0]}
                  </span>
                </button>

                {showCanvasMenu && (
                  <div
                    className="absolute right-0 top-full mt-2 w-72 bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg border border-white/60 z-50"
                    style={{
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
                    }}
                  >
                    <div className="p-4">
                      <p className="text-sm font-semibold text-gray-700 mb-3">Šířka plochy</p>
                      <div className="space-y-2">
                        {(Object.keys(CANVAS_WIDTHS) as CanvasWidth[]).map((width) => (
                          <button
                            key={width}
                            onClick={() => {
                              setCanvasWidth(width)
                              setShowCanvasMenu(false)
                            }}
                            className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 ${
                              canvasWidth === width
                                ? 'bg-primary-50 text-primary-700 font-medium shadow-sm scale-105'
                                : 'hover:bg-gray-50 text-gray-700 hover:scale-102'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm">{CANVAS_WIDTHS[width].label}</span>
                              {canvasWidth === width && (
                                <span className="text-primary-600 text-lg">✓</span>
                              )}
                            </div>
                            <span className="text-xs text-gray-500">{CANVAS_WIDTHS[width].description}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={toggleEditMode}
                className={`btn-outline flex items-center space-x-2 ${
                  layout.isEditMode ? 'bg-primary-50 border-primary-400 shadow-2xl text-primary-700' : ''
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
            <div
              className="mt-4 p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/50 rounded-2xl backdrop-blur-xl shadow-lg"
              style={{
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
              }}
            >
              <div className="flex items-start space-x-3">
                <span className="text-2xl">💡</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-blue-900 mb-3">
                    {layoutMode === 'grid' ? 'Grid layout s přichytáváním:' : 'Volný layout:'}
                  </p>
                  <ul className="text-sm text-blue-800 space-y-2">
                    <li className="flex items-start">
                      <span className="mr-2 text-blue-600">•</span>
                      <span>
                        <strong>Přesunout modul:</strong> Klikněte a táhněte modul
                        {layoutMode === 'grid' && ' - automaticky se přichytí k mřížce'}
                      </span>
                    </li>
                    {layoutMode === 'grid' && (
                      <li className="flex items-start">
                        <span className="mr-2 text-blue-600">•</span>
                        <span><strong>Vodící čáry:</strong> Modré čáry se zobrazí při přetahování pro snadné zarovnání</span>
                      </li>
                    )}
                    <li className="flex items-start">
                      <span className="mr-2 text-blue-600">•</span>
                      <span><strong>Změnit velikost:</strong> Táhněte za pravý dolní roh modulu</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 text-blue-600">•</span>
                      <span><strong>Skrýt/Zobrazit:</strong> Klikněte na ikonu oka</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 text-blue-600">•</span>
                      <span><strong>Zamknout:</strong> Klikněte na ikonu zámku</span>
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
          className="relative rounded-3xl overflow-hidden touch-none mx-auto bg-gray-50"
          style={{
            width: `${canvasSize.width}px`,
            maxWidth: '100%',
            height: `${canvasSize.height}px`,
            minHeight: '1200px',
            backgroundImage: layout.isEditMode && layoutMode === 'grid'
              ? `linear-gradient(to right, rgba(147,51,234,0.06) 1px, transparent 1px),
                 linear-gradient(to bottom, rgba(147,51,234,0.06) 1px, transparent 1px)`
              : layout.isEditMode
              ? `radial-gradient(circle at 1px 1px, rgba(147,51,234,0.08) 1px, transparent 0)`
              : 'none',
            backgroundSize: layout.isEditMode && layoutMode === 'grid'
              ? `${GRID_SIZE}px ${GRID_SIZE}px, ${GRID_SIZE}px ${GRID_SIZE}px`
              : layout.isEditMode ? '40px 40px' : 'auto',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06), inset 0 1px 2px rgba(0, 0, 0, 0.03)',
            border: '1px solid rgba(0, 0, 0, 0.05)'
          }}
        >
          {/* Snap Guide Lines (only in grid mode) */}
          {layout.isEditMode && layoutMode === 'grid' && snapGuides.x.map((x, i) => (
            <div
              key={`guide-x-${i}`}
              className="absolute top-0 bottom-0 w-0.5 bg-blue-400 pointer-events-none z-50"
              style={{ left: `${x}px` }}
            />
          ))}
          {layout.isEditMode && layoutMode === 'grid' && snapGuides.y.map((y, i) => (
            <div
              key={`guide-y-${i}`}
              className="absolute left-0 right-0 h-0.5 bg-blue-400 pointer-events-none z-50"
              style={{ top: `${y}px` }}
            />
          ))}

          {/* Canvas info overlay */}
          {layout.isEditMode && (
            <div className="absolute top-4 left-4 text-gray-400 text-sm font-medium pointer-events-none z-0">
              {layoutMode === 'grid' ? 'Grid Dashboard' : 'Volný Dashboard'} • {visibleModules.length} {visibleModules.length === 1 ? 'modul' : visibleModules.length < 5 ? 'moduly' : 'modulů'}
            </div>
          )}

          {/* Modules */}
          {(layout.isEditMode ? allModules : visibleModules).map((module) => (
            <DraggableModule
              key={module.id}
              module={module}
              isEditMode={layout.isEditMode}
              enableGridSnap={layoutMode === 'grid'}
              gridSize={GRID_SIZE}
              snapThreshold={SNAP_THRESHOLD}
              onPositionChange={updateModulePosition}
              onSizeChange={updateModuleSize}
              onToggleVisibility={toggleModuleVisibility}
              onToggleLock={toggleModuleLock}
              onSnapGuidesChange={setSnapGuides}
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
          <div className="bg-gray-50/95 backdrop-blur-xl p-6 rounded-3xl border border-gray-100/60 shadow-lg"
            style={{
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
            }}
          >
            <h3 className="text-sm font-semibold text-gray-700 mb-4">
              Skryté moduly (klikněte pro zobrazení)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {allModules
                .filter(m => !m.isVisible)
                .map((module) => (
                  <button
                    key={module.id}
                    onClick={() => toggleModuleVisibility(module.id)}
                    className="flex items-center space-x-2 px-4 py-3 bg-white/90 backdrop-blur-xl border border-white/60 rounded-2xl hover:scale-105 hover:shadow-lg transition-all duration-300"
                    style={{
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
                    }}
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

      {/* Onboarding Wizard */}
      {showOnboardingWizard && (
        <OnboardingWizard
          onClose={() => setShowOnboardingWizard(false)}
          autoShow={false}
        />
      )}
    </div>
  )
}

// Draggable Module Component (similar to MoodboardImageCard)
interface DraggableModuleProps {
  module: DashboardModule
  isEditMode: boolean
  enableGridSnap?: boolean
  gridSize?: number
  snapThreshold?: number
  onPositionChange: (moduleId: string, position: { x: number; y: number }) => void
  onSizeChange: (moduleId: string, size: { width: number; height: number }) => void
  onToggleVisibility: (moduleId: string) => void
  onToggleLock: (moduleId: string) => void
  onSnapGuidesChange?: (guides: { x: number[], y: number[] }) => void
  renderContent: () => React.ReactNode
}

function DraggableModule({
  module,
  isEditMode,
  enableGridSnap = false,
  gridSize = 40,
  snapThreshold = 20,
  onPositionChange,
  onSizeChange,
  onToggleVisibility,
  onToggleLock,
  onSnapGuidesChange,
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

  // Snap position to grid
  const snapToGrid = (value: number): number => {
    if (!enableGridSnap) return value
    return Math.round(value / gridSize) * gridSize
  }

  // Check if value is close to grid line
  const isNearGridLine = (value: number): boolean => {
    if (!enableGridSnap) return false
    const remainder = value % gridSize
    return remainder < snapThreshold || remainder > gridSize - snapThreshold
  }

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
      let newX = Math.max(0, Math.min(
        container.width - size.width,
        e.clientX - container.left - dragOffset.x
      ))
      let newY = Math.max(0, Math.min(
        container.height - size.height,
        e.clientY - container.top - dragOffset.y
      ))

      // Apply grid snapping if enabled
      if (enableGridSnap) {
        const snappedX = snapToGrid(newX)
        const snappedY = snapToGrid(newY)

        // Show snap guides if near grid line
        const guides: { x: number[], y: number[] } = { x: [], y: [] }
        if (isNearGridLine(newX)) {
          newX = snappedX
          guides.x.push(snappedX, snappedX + size.width)
        }
        if (isNearGridLine(newY)) {
          newY = snappedY
          guides.y.push(snappedY, snappedY + size.height)
        }
        if (onSnapGuidesChange) {
          onSnapGuidesChange(guides)
        }
      }

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

    let newWidth = Math.max(250, resizeStart.width + deltaX)
    let newHeight = Math.max(200, resizeStart.height + deltaY)

    // Apply grid snapping if enabled
    if (enableGridSnap) {
      if (isNearGridLine(newWidth)) {
        newWidth = snapToGrid(newWidth)
      }
      if (isNearGridLine(newHeight)) {
        newHeight = snapToGrid(newHeight)
      }
    }

    setSize({ width: newWidth, height: newHeight })
  }

  const handleResizeEnd = () => {
    if (isResizing) {
      // Final snap to grid
      const finalSize = enableGridSnap ? {
        width: snapToGrid(size.width),
        height: snapToGrid(size.height)
      } : size
      setSize(finalSize)
      onSizeChange(module.id, finalSize)
    }
    setIsResizing(false)
  }

  const handleMouseUp = () => {
    if (isDragging && hasDragged) {
      // Final snap to grid
      const finalPosition = enableGridSnap ? {
        x: snapToGrid(position.x),
        y: snapToGrid(position.y)
      } : position
      setPosition(finalPosition)
      onPositionChange(module.id, finalPosition)
    }
    setIsDragging(false)
    setHasDragged(false)
    if (onSnapGuidesChange) {
      onSnapGuidesChange({ x: [], y: [] })
    }
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
      className={`absolute group select-none rounded-3xl ${
        isDragging || isResizing
          ? 'z-50 scale-105 cursor-grabbing'
          : isEditMode && !module.isLocked
          ? 'z-10 hover:z-20 cursor-grab hover:scale-[1.03] transition-all duration-500 ease-out'
          : 'z-10 hover:scale-[1.03] transition-all duration-500 ease-out'
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
      <div
        className={`relative w-full h-full rounded-3xl overflow-hidden backdrop-blur-xl transition-all duration-500 ease-out ${
          isDragging
            ? 'border-primary-400'
            : module.isLocked
            ? 'border-gray-200'
            : isEditMode
            ? 'border-primary-100'
            : 'border-white/60'
        }`}
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.95) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.6)',
          boxShadow: isDragging || isResizing
            ? '0 2px 4px rgba(0, 0, 0, 0.03), 0 8px 16px rgba(0, 0, 0, 0.06), 0 20px 40px rgba(0, 0, 0, 0.08), 0 40px 80px rgba(248, 187, 217, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.9)'
            : isHovered
            ? '0 2px 4px rgba(0, 0, 0, 0.03), 0 8px 16px rgba(0, 0, 0, 0.06), 0 20px 40px rgba(0, 0, 0, 0.08), 0 40px 80px rgba(248, 187, 217, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.9)'
            : '0 1px 2px rgba(0, 0, 0, 0.02), 0 4px 8px rgba(0, 0, 0, 0.04), 0 12px 24px rgba(0, 0, 0, 0.06), 0 24px 48px rgba(248, 187, 217, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
        }}
      >
        {/* Shimmer effect on hover - iOS style */}
        {isHovered && !isDragging && !isResizing && (
          <div
            className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
              animation: 'shimmer 0.6s ease-in-out'
            }}
          />
        )}

        {/* Edit Mode Controls */}
        {isEditMode && (
          <div className="absolute top-3 right-3 z-10 flex space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onToggleVisibility(module.id)
              }}
              className="p-2 bg-white/90 backdrop-blur-xl rounded-xl shadow-lg hover:bg-white hover:scale-110 transition-all duration-300 border border-white/60"
              style={{
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
              }}
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
              className="p-2 bg-white/90 backdrop-blur-xl rounded-xl shadow-lg hover:bg-white hover:scale-110 transition-all duration-300 border border-white/60"
              style={{
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
              }}
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
            className="absolute top-3 left-3 z-10 p-2 bg-white/90 backdrop-blur-xl rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none border border-white/60"
            style={{
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
            }}
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
          <div className="absolute inset-0 bg-gray-100 bg-opacity-50 flex items-center justify-center rounded-3xl backdrop-blur-sm">
            <div className="bg-white/90 backdrop-blur-xl p-3 rounded-2xl shadow-lg border border-white/60"
              style={{
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
              }}
            >
              <Lock className="w-6 h-6 text-gray-500" />
            </div>
          </div>
        )}

        {/* Resize Handle */}
        {isEditMode && !module.isLocked && (
          <div
            onMouseDown={handleResizeStart}
            className="absolute bottom-2 right-2 w-8 h-8 cursor-nwse-resize opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 flex items-center justify-center bg-white/90 backdrop-blur-xl rounded-xl shadow-lg hover:bg-white hover:scale-110 border border-white/60"
            style={{
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
            }}
            title="Změnit velikost modulu - klikněte a táhněte pro zvětšení nebo zmenšení"
          >
            <Maximize className="w-4 h-4 text-gray-600" />
          </div>
        )}
      </div>
    </div>
  )
}

