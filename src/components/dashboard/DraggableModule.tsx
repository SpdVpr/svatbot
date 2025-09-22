'use client'

import { ReactNode } from 'react'
import { Draggable } from 'react-beautiful-dnd'
import { GripVertical, Lock, Unlock, Eye, EyeOff } from 'lucide-react'
import { DashboardModule } from '@/types/dashboard'

interface DraggableModuleProps {
  module: DashboardModule
  index: number
  isEditMode: boolean
  children: ReactNode
  onToggleLock: (moduleId: string) => void
  onToggleVisibility: (moduleId: string) => void
}

export default function DraggableModule({
  module,
  index,
  isEditMode,
  children,
  onToggleLock,
  onToggleVisibility
}: DraggableModuleProps) {
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

  return (
    <Draggable
      draggableId={module.id}
      index={index}
      isDragDisabled={module.isLocked || !isEditMode}
    >
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`
            ${getSizeClasses(module.size)}
            ${snapshot.isDragging ? 'opacity-75 rotate-2 scale-105' : ''}
            ${isEditMode ? 'ring-2 ring-primary-200 ring-opacity-50' : ''}
            ${module.isLocked ? 'ring-2 ring-gray-300' : ''}
            transition-all duration-200 relative group
          `}
        >
          {/* Edit Mode Controls */}
          {isEditMode && (
            <div className="absolute top-2 right-2 z-10 flex space-x-1">
              <button
                onClick={() => onToggleVisibility(module.id)}
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
                onClick={() => onToggleLock(module.id)}
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
              {...provided.dragHandleProps}
              className="absolute top-2 left-2 z-10 p-1 bg-white rounded shadow-md cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
              title="Přetáhnout modul"
            >
              <GripVertical className="w-4 h-4 text-gray-600" />
            </div>
          )}

          {/* Module Content */}
          <div className={`
            h-full
            ${!module.isVisible ? 'opacity-50' : ''}
            ${isEditMode ? 'pointer-events-none' : ''}
          `}>
            {children}
          </div>

          {/* Locked Overlay */}
          {module.isLocked && isEditMode && (
            <div className="absolute inset-0 bg-gray-100 bg-opacity-50 flex items-center justify-center rounded-xl">
              <div className="bg-white p-2 rounded-lg shadow-md">
                <Lock className="w-6 h-6 text-gray-500" />
              </div>
            </div>
          )}
        </div>
      )}
    </Draggable>
  )
}
