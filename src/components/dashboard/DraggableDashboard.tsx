'use client'

import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd'
import { Edit3, Lock, Unlock, RotateCcw, Settings } from 'lucide-react'
import { useDashboard } from '@/hooks/useDashboard'
import { DashboardModule } from '@/types/dashboard'
import DraggableModule from './DraggableModule'

// Import module components
import WeddingCountdownModule from './modules/WeddingCountdownModule'
import QuickActionsModule from './modules/QuickActionsModule'
import UpcomingTasksModule from './modules/UpcomingTasksModule'
import MainFeaturesModule from './modules/MainFeaturesModule'
import MarketplaceModule from './modules/MarketplaceModule'
import PhaseProgressModule from './modules/PhaseProgressModule'
import QuickStatsModule from './modules/QuickStatsModule'
import ComingSoonModule from './modules/ComingSoonModule'

interface DraggableDashboardProps {
  onWeddingSettingsClick: () => void
}

export default function DraggableDashboard({ onWeddingSettingsClick }: DraggableDashboardProps) {
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

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const modules = Array.from(getVisibleModules())
    const [reorderedModule] = modules.splice(result.source.index, 1)
    modules.splice(result.destination.index, 0, reorderedModule)

    updateModuleOrder(modules)
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
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="dashboard" direction="vertical">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`
                grid grid-cols-1 lg:grid-cols-3 gap-6
                ${snapshot.isDraggingOver ? 'bg-primary-50 rounded-xl p-4' : ''}
                transition-all duration-200
              `}
            >
              {visibleModules.map((module, index) => (
                <DraggableModule
                  key={module.id}
                  module={module}
                  index={index}
                  isEditMode={layout.isEditMode}
                  onToggleLock={toggleModuleLock}
                  onToggleVisibility={toggleModuleVisibility}
                >
                  {renderModule(module)}
                </DraggableModule>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Edit Mode Help */}
      {layout.isEditMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h3 className="font-medium text-blue-900 mb-2">Nápověda pro úpravy</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Přetáhněte moduly za úchytku pro změnu pořadí</li>
            <li>• Použijte ikonu oka pro skrytí/zobrazení modulů</li>
            <li>• Použijte ikonu zámku pro zamknutí/odemknutí modulů</li>
            <li>• Zamknuté moduly nelze přesouvat</li>
            <li>• Klikněte na "Dokončit úpravy" pro uložení změn</li>
          </ul>
        </div>
      )}
    </div>
  )
}
