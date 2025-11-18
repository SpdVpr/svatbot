'use client'

import { useState, useRef, useEffect, useCallback, lazy, Suspense } from 'react'
import { useDashboard } from '@/hooks/useDashboard'
import { useOnboarding } from '@/hooks/useOnboarding'
import { DashboardModule } from '@/types/dashboard'
import { Edit3, Lock, Unlock, Eye, EyeOff, RotateCcw, GripVertical, Grid3x3, Maximize2, Maximize, BookOpen, Sparkles, Palette } from 'lucide-react'
import OnboardingWizard from '../onboarding/OnboardingWizard'
import { getViewTransitionName } from '@/hooks/useViewTransition'
import { useAuth } from '@/hooks/useAuth'
import { useIsDemoUser } from '@/hooks/useDemoSettings'
import { useColorTheme } from '@/hooks/useColorTheme'
import { COLOR_PALETTES, ColorTheme } from '@/types/colorTheme'

// Lazy load module components for better performance
const WeddingCountdownModule = lazy(() => import('./modules/WeddingCountdownModule'))
const QuickActionsModule = lazy(() => import('./modules/QuickActionsModule'))
const MarketplaceModule = lazy(() => import('./modules/MarketplaceModule'))
const TaskManagementModule = lazy(() => import('./modules/TaskManagementModule'))
const GuestManagementModule = lazy(() => import('./modules/GuestManagementModule'))
const BudgetTrackingModule = lazy(() => import('./modules/BudgetTrackingModule'))
const TimelinePlanningModule = lazy(() => import('./modules/TimelinePlanningModule'))
const VendorManagementModule = lazy(() => import('./modules/VendorManagementModule'))
const SeatingPlanModule = lazy(() => import('./modules/SeatingPlanModule'))
const WeddingDayTimelineModule = lazy(() => import('./modules/WeddingDayTimelineModule'))
const MoodboardModule = lazy(() => import('./modules/MoodboardModule'))
const WeddingChecklistModule = lazy(() => import('./modules/WeddingChecklistModule'))
const MusicPlaylistModule = lazy(() => import('./modules/MusicPlaylistModule'))
const FoodDrinksModule = lazy(() => import('./modules/FoodDrinksModule'))
const WeddingWebsiteModule = lazy(() => import('./modules/WeddingWebsiteModule'))
const AccommodationManagementModule = lazy(() => import('./modules/AccommodationManagementModule'))
const ShoppingListModule = lazy(() => import('./modules/ShoppingListModule'))
const SvatbotCoachModule = lazy(() => import('./modules/SvatbotCoachModule'))
import OnboardingWidget from '../onboarding/OnboardingWidget'

// Module loading fallback
const ModuleSkeleton = () => (
  <div className="animate-pulse space-y-3">
    <div className="h-4 bg-white/10 rounded w-3/4" />
    <div className="h-4 bg-white/10 rounded w-1/2" />
    <div className="h-4 bg-white/10 rounded w-5/6" />
  </div>
)

interface FreeDragDropProps {
  onWeddingSettingsClick?: () => void
  onOnboardingWizardChange?: (isOpen: boolean) => void
}

// Module size configurations (width x height in pixels)
// Calculation: 3 modules × 360px = 1080px + 4 gaps × 40px = 1240px
const MODULE_SIZES = {
  small: { width: 360, height: 353 },
  medium: { width: 360, height: 353 },
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

export default function FreeDragDrop({ onWeddingSettingsClick, onOnboardingWizardChange }: FreeDragDropProps) {
  const { user } = useAuth()
  const { isDemoUser, isLocked: isDemoLocked } = useIsDemoUser(user?.id)

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
  const { colorTheme, changeTheme, canChangeTheme } = useColorTheme()

  const layoutMode = layout.layoutMode || 'grid'

  // Check if user can edit layout (normal users can, locked DEMO cannot)
  const canEditLayout = !isDemoUser || !isDemoLocked

  const containerRef = useRef<HTMLDivElement>(null)
  const [canvasWidth, setCanvasWidth] = useState<CanvasWidth>('normal')
  const [canvasSize, setCanvasSize] = useState({ width: CANVAS_WIDTHS['normal'].width, height: 4000 })
  const [snapGuides, setSnapGuides] = useState<{ x: number[], y: number[] }>({ x: [], y: [] })
  const [showCanvasMenu, setShowCanvasMenu] = useState(false)
  const [showColorMenu, setShowColorMenu] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [screenWidth, setScreenWidth] = useState(0)
  const [showOnboardingWizard, setShowOnboardingWizard] = useState(false)

  // Detect mobile and tablet devices
  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth
      setScreenWidth(width)
      setIsMobile(width < 768)
      // Tablet mode only for screens that need simplified grid layout (768-1250px)
      // Above 1250px, use full desktop mode with drag & drop
      setIsTablet(width >= 768 && width < 1250)
    }
    // Run immediately on mount
    checkDevice()
    window.addEventListener('resize', checkDevice)
    return () => window.removeEventListener('resize', checkDevice)
  }, [])

  // If screenWidth is still 0 (initial render), assume mobile to prevent flash of desktop layout
  const effectiveIsMobile = screenWidth === 0 ? true : isMobile
  const effectiveIsTablet = screenWidth === 0 ? false : isTablet

  // Calculate responsive canvas width based on screen size
  const getResponsiveCanvasWidth = useCallback(() => {
    if (screenWidth === 0) return CANVAS_WIDTHS['normal'].width

    // For tablet/medium screens (768-1250px), calculate max width that fits
    // IGNORE user's canvas width preference and auto-calculate
    if (effectiveIsTablet) {
      const padding = 80 // Total horizontal padding + scrollbar + safety margin
      const availableWidth = screenWidth - padding

      // Calculate how many modules can fit (with safety margins)
      // 1 module: 360px
      // 2 modules: 360 + 40 + 360 = 760px
      // 3 modules: 360 + 40 + 360 + 40 + 360 = 1160px

      // Be conservative - require extra space to avoid any clipping
      if (availableWidth >= 1160) {
        return 1160 // 3 modules fit comfortably
      } else if (availableWidth >= 840) {
        return 760 // 2 modules fit comfortably
      } else if (availableWidth >= 440) {
        return 360 // 1 module fits
      } else {
        return Math.max(320, availableWidth - 20) // Minimum width
      }
    }

    // For desktop (>= 1250px), use user's selected canvas width
    // Always use full 1240px (normal) width for desktop, we'll scale it down if needed
    let desiredWidth = CANVAS_WIDTHS[canvasWidth].width

    // For wider screens, respect user's choice but with limits
    if (screenWidth < 1700 && canvasWidth === 'wide') {
      return CANVAS_WIDTHS['normal'].width
    }
    if (screenWidth < 2100 && canvasWidth === 'ultra-wide') {
      return CANVAS_WIDTHS['normal'].width
    }

    return desiredWidth
  }, [screenWidth, effectiveIsTablet, canvasWidth])

  // Update canvas size when width changes or screen resizes
  useEffect(() => {
    const responsiveWidth = getResponsiveCanvasWidth()
    setCanvasSize(prev => ({ ...prev, width: responsiveWidth }))
  }, [canvasWidth, getResponsiveCanvasWidth])

  // Close canvas menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (showCanvasMenu && !target.closest('[data-canvas-menu]')) {
        setShowCanvasMenu(false)
      }
      if (showColorMenu && !target.closest('[data-color-menu]')) {
        setShowColorMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showCanvasMenu, showColorMenu])

  // Render module content with Suspense for lazy loading
  const renderModule = (module: DashboardModule) => {
    const content = (() => {
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
    })()

    return (
      <Suspense fallback={<ModuleSkeleton />}>
        {content}
      </Suspense>
    )
  }

  const visibleModules = getVisibleModules()
  const allModules = layout.modules

  // Don't show loading state - let content fade in smoothly with AppTemplate

  // Mobile: Use simple vertical stack layout (no edit mode on mobile)
  if (effectiveIsMobile) {
    return (
      <div className="mx-auto px-1 max-w-full">
        <div className="space-y-3">
          {/* Mobile Modules - Vertical Stack (only visible modules) */}
          <div className="space-y-4">
            {visibleModules.map((module) => (
              <div
                key={module.id}
                className="bg-white rounded-xl border-2 border-gray-200"
              >
                {/* Module Content - Reduced padding on mobile */}
                <div className="p-2">
                  {renderModule(module)}
                </div>
              </div>
            ))}
          </div>

          {/* Empty state */}
          {visibleModules.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <div className="text-6xl mb-4">📊</div>
              <p className="text-lg font-medium">Váš dashboard je prázdný</p>
              <p className="text-sm">Moduly můžete upravit na počítači</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Tablet (768-1250px): Use responsive grid layout (no edit mode on tablet)
  if (effectiveIsTablet) {
    // Calculate number of columns based on canvas width
    const numColumns = canvasSize.width >= 1160 ? 3 : canvasSize.width >= 760 ? 2 : 1

    return (
      <div className="mx-auto px-3 sm:px-4 max-w-full">
        <div className="space-y-4">
          {/* Tablet Modules - Responsive Grid */}
          <div
            className="grid gap-4"
            style={{
              gridTemplateColumns: `repeat(${numColumns}, 1fr)`
            }}
          >
            {visibleModules.map((module) => (
              <div
                key={module.id}
                className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Module Content */}
                <div className="p-4">
                  {renderModule(module)}
                </div>
              </div>
            ))}
          </div>

          {/* Empty state */}
          {visibleModules.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <div className="text-6xl mb-4">📊</div>
              <p className="text-lg font-medium">Váš dashboard je prázdný</p>
              <p className="text-sm">Moduly můžete upravit v nastavení</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Desktop (>= 1250px): Use full drag & drop layout with all features

  // Desktop: Use drag & drop layout
  return (
    <div className="mx-auto px-3 sm:px-4 lg:px-8 max-w-[2000px]">
      <div className="space-y-4 lg:space-y-6">
        {/* Dashboard Controls */}
        <div
          className="bg-gray-50/95 backdrop-blur-xl p-3 lg:p-5 rounded-2xl lg:rounded-3xl border border-gray-100/60 mx-auto shadow-lg relative z-[40]"
          style={{
            maxWidth: '1240px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
          }}
        >
          <div className="flex items-center justify-between gap-2">
            {/* Left Side - Empty or Edit Mode Controls */}
            <div className="flex items-center space-x-1 lg:space-x-2">
              {layout.isEditMode && (
                <button
                  onClick={resetLayout}
                  className="btn-outline flex items-center space-x-1 lg:space-x-2 text-red-600 border-red-300 hover:bg-red-50 px-2 lg:px-3 py-1.5 lg:py-2 text-sm"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span className="hidden md:inline">Reset</span>
                </button>
              )}
            </div>

            {/* Center - Layout Mode Switcher (only in edit mode) OR Onboarding Guide */}
            {layout.isEditMode ? (
              <div className="flex items-center space-x-1 lg:space-x-2 bg-gray-100/80 backdrop-blur-xl rounded-xl lg:rounded-2xl p-1 lg:p-1.5 border border-gray-200/50">
                <button
                  onClick={() => setLayoutMode('grid')}
                  className={`flex items-center space-x-1 lg:space-x-2 px-2 lg:px-4 py-1.5 lg:py-2.5 rounded-lg lg:rounded-xl transition-all duration-300 ${
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
                  <span className="hidden xl:inline text-sm font-medium">Grid</span>
                </button>
                <button
                  onClick={() => setLayoutMode('free')}
                  className={`flex items-center space-x-1 lg:space-x-2 px-2 lg:px-4 py-1.5 lg:py-2.5 rounded-lg lg:rounded-xl transition-all duration-300 ${
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
                  <span className="hidden xl:inline text-sm font-medium">Volný</span>
                </button>
              </div>
            ) : (
              <div
                className="flex items-center space-x-2 lg:space-x-3 px-3 lg:px-5 py-2 lg:py-3 bg-primary-50 rounded-xl lg:rounded-2xl border border-primary-200/50 backdrop-blur-xl shadow-lg"
                style={{
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
                }}
              >
                <div className="flex items-center space-x-1.5 lg:space-x-2 min-w-0">
                  <Sparkles className="w-4 h-4 lg:w-5 lg:h-5 text-primary-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs lg:text-sm font-semibold text-gray-900 truncate">
                      Průvodce
                    </p>
                    <p className="text-xs text-gray-600 truncate">
                      {getProgress()}% • {getNextStep()?.title || 'Hotovo!'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowOnboardingWizard(true)
                    onOnboardingWizardChange?.(true)
                  }}
                  className="btn-primary flex items-center space-x-1 text-xs lg:text-sm px-2 lg:px-4 py-1.5 lg:py-2 flex-shrink-0"
                >
                  <BookOpen className="w-4 h-4" />
                  <span className="hidden md:inline">Otevřít</span>
                </button>
              </div>
            )}

            {/* Right Side - Canvas Width & Edit Mode Button */}
            <div className="flex items-center space-x-1 lg:space-x-2">
              {/* Canvas Width Selector - hide on tablet */}
              {!effectiveIsTablet && (
                <div className="relative" data-canvas-menu>
                  <button
                    onClick={() => setShowCanvasMenu(!showCanvasMenu)}
                    className="btn-outline flex items-center space-x-1 lg:space-x-2 px-2 lg:px-3 py-1.5 lg:py-2 text-sm"
                    title="Změnit šířku plochy"
                  >
                    <Maximize className="w-4 h-4" />
                    <span className="hidden xl:inline text-sm">
                      {CANVAS_WIDTHS[canvasWidth].label.split(' ')[0]}
                    </span>
                  </button>

                {showCanvasMenu && (
                  <div
                    className="absolute right-0 top-full mt-2 w-72 bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg border border-white/60 z-[50]"
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
              )}

              {/* Color Theme Selector */}
              <div className="relative" data-color-menu>
                <button
                  onClick={() => setShowColorMenu(!showColorMenu)}
                  disabled={!canChangeTheme}
                  className="btn-outline flex items-center space-x-1 lg:space-x-2 px-2 lg:px-3 py-1.5 lg:py-2 text-sm"
                  title="Změnit barevnou paletu"
                >
                  <Palette className="w-4 h-4" />
                  <span className="hidden xl:inline text-sm">
                    Barvy
                  </span>
                </button>

                {showColorMenu && (
                  <div
                    className="absolute right-0 top-full mt-2 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg border border-white/60 z-[50]"
                    style={{
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
                    }}
                  >
                    <div className="p-4">
                      <p className="text-sm font-semibold text-gray-700 mb-3">Barevná paleta</p>
                      <div className="space-y-2">
                        {(Object.keys(COLOR_PALETTES) as ColorTheme[]).map((theme) => {
                          const palette = COLOR_PALETTES[theme]
                          return (
                            <button
                              key={theme}
                              onClick={() => {
                                changeTheme(theme)
                                setShowColorMenu(false)
                              }}
                              className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 border-2 ${
                                colorTheme === theme
                                  ? 'shadow-md scale-105'
                                  : 'border-transparent hover:border-gray-200 hover:scale-102'
                              }`}
                              style={{
                                backgroundColor: palette.colors.primaryLight,
                                color: palette.colors.primary700,
                                borderColor: colorTheme === theme ? palette.colors.primary400 : 'transparent'
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">{palette.name}</span>
                                {colorTheme === theme && (
                                  <span className="text-lg">✓</span>
                                )}
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={toggleEditMode}
                disabled={!canEditLayout}
                className={`btn-outline flex items-center space-x-1 lg:space-x-2 px-2 lg:px-3 py-1.5 lg:py-2 text-sm ${
                  layout.isEditMode ? 'bg-primary-50 border-primary-400 shadow-2xl text-primary-700' : ''
                } ${!canEditLayout ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={!canEditLayout ? 'DEMO účet je zamčený - úprava layoutu není možná' : ''}
              >
                <Edit3 className="w-4 h-4" />
                <span className="hidden md:inline">
                  {layout.isEditMode ? 'Dokončit' : 'Upravit'}
                </span>
              </button>
            </div>
          </div>

          {layout.isEditMode && (
            <div
              className="mt-4 p-4 bg-primary-50 border border-primary-200/50 rounded-2xl backdrop-blur-xl shadow-lg"
              style={{
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
              }}
            >
              <div className="flex items-start space-x-3">
                <span className="text-2xl">💡</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-primary-900 mb-2">
                    {layoutMode === 'grid' ? 'Grid layout s přichytáváním:' : 'Volný layout:'}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm text-primary-800">
                    <div className="flex items-start">
                      <span className="mr-2 text-primary-600">•</span>
                      <span>
                        <strong>Přesunout modul:</strong> Klikněte a táhněte modul
                        {layoutMode === 'grid' && ' - automaticky se přichytí k mřížce'}
                      </span>
                    </div>
                    <div className="flex items-start">
                      <span className="mr-2 text-primary-600">•</span>
                      <span><strong>Změnit velikost:</strong> Táhněte za pravý dolní roh modulu</span>
                    </div>
                    <div className="flex items-start">
                      <span className="mr-2 text-primary-600">•</span>
                      <span><strong>Skrýt/Zobrazit:</strong> Klikněte na ikonu oka</span>
                    </div>
                    <div className="flex items-start">
                      <span className="mr-2 text-primary-600">•</span>
                      <span><strong>Zamknout:</strong> Klikněte na ikonu zámku</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Free Canvas with Absolute Positioning */}
        {(() => {
          // Calculate scale for narrow desktop screens (only for desktop, not mobile/tablet)
          // screenWidth > 0 check ensures we don't apply scale during initial render
          const needsScale = !effectiveIsMobile && !effectiveIsTablet && screenWidth > 0 && screenWidth >= 1250 && screenWidth < 1400 && canvasSize.width > screenWidth - 100
          const scale = needsScale ? (screenWidth - 100) / canvasSize.width : 1

          return (
            <div
              className="mx-auto"
              style={{
                width: needsScale ? `${canvasSize.width * scale}px` : `${canvasSize.width}px`,
                maxWidth: '100%',
                height: needsScale ? `${canvasSize.height * scale}px` : `${canvasSize.height}px`,
                minHeight: needsScale ? `${1200 * scale}px` : '1200px'
              }}
            >
              <div
                ref={containerRef}
                className="relative rounded-3xl overflow-hidden touch-none bg-gray-50"
                style={{
                  width: `${canvasSize.width}px`,
                  height: `${canvasSize.height}px`,
                  minHeight: '1200px',
                  transform: needsScale ? `scale(${scale})` : 'none',
                  transformOrigin: 'top left',
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
            </div>
          )
        })()}

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
          onClose={() => {
            setShowOnboardingWizard(false)
            onOnboardingWizardChange?.(false)
          }}
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

  // Use refs to store latest values without triggering re-renders
  const positionRef = useRef(position)
  const sizeRef = useRef(size)
  const dragOffsetRef = useRef(dragOffset)
  const hasDraggedRef = useRef(hasDragged)
  const dragStartTimeRef = useRef(dragStartTime)
  const resizeStartRef = useRef(resizeStart)

  // Update refs when state changes
  useEffect(() => { positionRef.current = position }, [position])
  useEffect(() => { sizeRef.current = size }, [size])
  useEffect(() => { dragOffsetRef.current = dragOffset }, [dragOffset])
  useEffect(() => { hasDraggedRef.current = hasDragged }, [hasDragged])
  useEffect(() => { dragStartTimeRef.current = dragStartTime }, [dragStartTime])
  useEffect(() => { resizeStartRef.current = resizeStart }, [resizeStart])

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

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const now = Date.now()
    if (now - lastMoveTime.current < 16) return
    lastMoveTime.current = now

    if (!hasDraggedRef.current && now - dragStartTimeRef.current > 100) {
      setHasDragged(true)
    }

    const container = dragRef.current?.parentElement?.getBoundingClientRect()
    if (container) {
      const currentSize = sizeRef.current
      const currentDragOffset = dragOffsetRef.current

      let newX = Math.max(0, Math.min(
        container.width - currentSize.width,
        e.clientX - container.left - currentDragOffset.x
      ))
      let newY = Math.max(0, Math.min(
        container.height - currentSize.height,
        e.clientY - container.top - currentDragOffset.y
      ))

      // Apply grid snapping if enabled
      if (enableGridSnap) {
        const snappedX = snapToGrid(newX)
        const snappedY = snapToGrid(newY)

        // Show snap guides if near grid line
        const guides: { x: number[], y: number[] } = { x: [], y: [] }
        if (isNearGridLine(newX)) {
          newX = snappedX
          guides.x.push(snappedX, snappedX + currentSize.width)
        }
        if (isNearGridLine(newY)) {
          newY = snappedY
          guides.y.push(snappedY, snappedY + currentSize.height)
        }
        if (onSnapGuidesChange) {
          onSnapGuidesChange(guides)
        }
      }

      setPosition({ x: newX, y: newY })
    }
  }, [enableGridSnap, onSnapGuidesChange])

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

  const handleResizeMove = useCallback((e: MouseEvent) => {
    const currentResizeStart = resizeStartRef.current
    const deltaX = e.clientX - currentResizeStart.x
    const deltaY = e.clientY - currentResizeStart.y

    let newWidth = Math.max(250, currentResizeStart.width + deltaX)
    let newHeight = Math.max(200, currentResizeStart.height + deltaY)

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
  }, [enableGridSnap])

  const handleResizeEnd = useCallback(() => {
    const currentSize = sizeRef.current
    // Final snap to grid
    const finalSize = enableGridSnap ? {
      width: snapToGrid(currentSize.width),
      height: snapToGrid(currentSize.height)
    } : currentSize
    setSize(finalSize)
    onSizeChange(module.id, finalSize)
    setIsResizing(false)
  }, [enableGridSnap, module.id, onSizeChange])

  const handleMouseUp = useCallback(() => {
    if (hasDraggedRef.current) {
      const currentPosition = positionRef.current
      // Final snap to grid
      const finalPosition = enableGridSnap ? {
        x: snapToGrid(currentPosition.x),
        y: snapToGrid(currentPosition.y)
      } : currentPosition
      setPosition(finalPosition)
      onPositionChange(module.id, finalPosition)
    }
    setIsDragging(false)
    setHasDragged(false)
    if (onSnapGuidesChange) {
      onSnapGuidesChange({ x: [], y: [] })
    }
  }, [enableGridSnap, module.id, onPositionChange, onSnapGuidesChange])

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMove)
      document.addEventListener('mouseup', handleResizeEnd)
      return () => {
        document.removeEventListener('mousemove', handleResizeMove)
        document.removeEventListener('mouseup', handleResizeEnd)
      }
    }
  }, [isResizing, handleResizeMove, handleResizeEnd])

  // Disable hover scale for svatbot-coach module
  const shouldDisableHoverScale = module.type === 'svatbot-coach'

  return (
    <div
      ref={dragRef}
      className={`absolute group select-none rounded-3xl ${
        isDragging || isResizing
          ? 'z-50 scale-105 cursor-grabbing'
          : isEditMode && !module.isLocked
          ? `z-10 hover:z-20 cursor-grab ${shouldDisableHoverScale ? '' : 'hover:scale-[1.03]'} transition-all duration-500 ease-out`
          : `z-10 ${shouldDisableHoverScale ? '' : 'hover:scale-[1.03]'} transition-all duration-500 ease-out`
      } ${isHidden && isEditMode ? 'opacity-40' : ''}`}
      style={{
        ...getViewTransitionName(`dashboard-module-${module.id}`),
        left: position.x,
        top: position.y,
        width: size.width,
        maxHeight: size.height,
        willChange: isDragging || isResizing ? 'transform' : 'auto',
        transition: isDragging || isResizing ? 'none' : undefined
      }}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => !isDragging && !isResizing && setIsHovered(true)}
      onMouseLeave={() => !isDragging && !isResizing && setIsHovered(false)}
    >
      <div
        className="relative w-full rounded-2xl overflow-hidden transition-all duration-200 ease-out"
        style={{
          background: isDragging || isResizing
            ? 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
            : isHovered
            ? 'linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)'
            : 'linear-gradient(135deg, #ffffff 0%, #fcfcfd 100%)',
          border: isDragging
            ? '2px solid rgba(248, 187, 217, 0.6)'
            : isHovered
            ? '1.5px solid rgba(0, 0, 0, 0.12)'
            : '1px solid rgba(0, 0, 0, 0.1)',
          boxShadow: isDragging || isResizing
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 12px 24px -8px rgba(248, 187, 217, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1) inset'
            : isHovered
            ? '0 16px 32px -8px rgba(0, 0, 0, 0.15), 0 6px 16px -4px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.05) inset'
            : '0 10px 24px -6px rgba(0, 0, 0, 0.1), 0 4px 12px -2px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(255, 255, 255, 0.03) inset'
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
          <div className={isEditMode ? 'pointer-events-none' : ''}>
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

