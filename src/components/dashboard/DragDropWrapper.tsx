'use client'

import { useState } from 'react'
import FixedGridDragDrop from './FixedGridDragDrop'
import FreeDragDrop from './FreeDragDrop'
import { Grid3x3, Maximize2 } from 'lucide-react'

interface DragDropWrapperProps {
  onWeddingSettingsClick: () => void
}

export default function DragDropWrapper({ onWeddingSettingsClick }: DragDropWrapperProps) {
  const [layoutMode, setLayoutMode] = useState<'grid' | 'free'>('grid')

  return (
    <div className="space-y-4">
      {/* Layout Mode Switcher */}
      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-[2000px]">
        <div className="bg-white p-3 rounded-xl border border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Režim layoutu</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {layoutMode === 'grid' ? 'Grid layout s automatickým zarovnáním' : 'Volné pozicování modulů'}
            </p>
          </div>
          <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setLayoutMode('grid')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                layoutMode === 'grid'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Grid3x3 className="w-4 h-4" />
              <span className="text-sm font-medium">Grid</span>
            </button>
            <button
              onClick={() => setLayoutMode('free')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                layoutMode === 'free'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Maximize2 className="w-4 h-4" />
              <span className="text-sm font-medium">Volný</span>
            </button>
          </div>
        </div>
      </div>

      {/* Render selected layout */}
      {layoutMode === 'grid' ? (
        <FixedGridDragDrop onWeddingSettingsClick={onWeddingSettingsClick} />
      ) : (
        <FreeDragDrop onWeddingSettingsClick={onWeddingSettingsClick} />
      )}
    </div>
  )
}
