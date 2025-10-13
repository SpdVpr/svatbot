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
import ShoppingListModule from './modules/ShoppingListModule'

interface SimpleDragDropProps {
  onWeddingSettingsClick: () => void
}

export default function SimpleDragDrop({ onWeddingSettingsClick }: SimpleDragDropProps) {
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
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const draggedElementRef = useRef<HTMLDivElement | null>(null)
  const dragTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleDragStart = (e: React.DragEvent, moduleId: string, index: number) => {
    if (!layout.isEditMode) return

    setDraggedModule(moduleId)
    setIsDragging(true)
    setDragOverIndex(null)

    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', moduleId)

    // Clear any existing timeout
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current)
    }
  }

  const handleDragEnd = (e: React.DragEvent) => {
    // Delay reset to prevent flickering
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

    // Only update if index actually changed
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

    // Only clear if we're actually leaving the drop zone
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX
    const y = e.clientY

    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      // Small delay to prevent flickering when moving between elements
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

    // Reorder modules
    const newModules = [...modules]
    const [removed] = newModules.splice(draggedIndex, 1)
    newModules.splice(dropIndex, 0, removed)

    updateModuleOrder(newModules)

    // Clear states
    setDraggedModule(null)
    setDragOverIndex(null)
    setIsDragging(false)

    // Clear timeout
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current)
    }
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current)
      }
    }
  }, [])

  const getSizeClasses = (size: string) => {
    switch (size) {
      case 'small':
        return 'col-span-1'
      case 'medium':
        return 'col-span-1'
      case 'large':
        return 'col-span-1 lg:col-span-2'
      case 'full':
        return 'col-span-1 lg:col-span-3'
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
  const allModules = layout.modules // Všechny moduly včetně skrytých

  return (
    <div className="space-y-6">
      {/* Dashboard Controls */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-200">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-gray-900">Dashboard</h2>
          {layout.isEditMode && (
            <div className="flex items-center space-x-2 text-sm text-primary-600">
              <Edit3 className="w-4 h-4" />
              <span>Režim úprav</span>
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

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {visibleModules.map((module, index) => (
          <div
            key={module.id}
            className={`
              ${getSizeClasses(module.size)}
              ${layout.isEditMode ? 'ring-2 ring-primary-200 ring-opacity-50' : ''}
              ${module.isLocked ? 'ring-2 ring-gray-300' : ''}
              ${dragOverIndex === index ? 'ring-4 ring-blue-300 bg-blue-50' : ''}
              ${layout.isEditMode && !module.isLocked ? 'cursor-grab active:cursor-grabbing' : ''}
              ${draggedModule === module.id ? 'opacity-60 scale-105 z-50 rotate-2' : ''}
              ${isDragging && draggedModule !== module.id ? 'transition-all duration-200 ease-out' : ''}
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

            {/* Drag Handle - pouze pro vizuální indikaci */}
            {layout.isEditMode && !module.isLocked && (
              <div
                className="absolute top-2 left-2 z-10 p-1 bg-white rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                title="Přetáhnout modul"
              >
                <GripVertical className="w-4 h-4 text-gray-600" />
              </div>
            )}

            {/* Module Content */}
            <div className={`
              h-full
              ${!module.isVisible ? 'opacity-50' : ''}
              ${layout.isEditMode ? 'pointer-events-none' : ''}
            `}>
              {renderModule(module)}
            </div>

            {/* Locked Overlay */}
            {module.isLocked && layout.isEditMode && (
              <div className="absolute inset-0 bg-gray-100 bg-opacity-50 flex items-center justify-center rounded-xl">
                <div className="bg-white p-2 rounded-lg shadow-md">
                  <Lock className="w-6 h-6 text-gray-500" />
                </div>
              </div>
            )}
          </div>
        ))}
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
          <h3 className="font-medium text-blue-900 mb-2">Nápověda pro úpravy</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Přetáhněte celý modul pro změnu pořadí</li>
            <li>• Modrý okraj označuje místo, kam modul spadne</li>
            <li>• Použijte ikonu oka (👁️) pro skrytí/zobrazení modulů</li>
            <li>• Skryté moduly najdete v sekci "Skryté moduly" níže</li>
            <li>• Použijte ikonu zámku (🔒) pro zamknutí/odemknutí modulů</li>
            <li>• Zamknuté moduly nelze přesouvat</li>
            <li>• Klikněte na "Dokončit úpravy" pro uložení změn</li>
          </ul>
        </div>
      )}
    </div>
  )
}
