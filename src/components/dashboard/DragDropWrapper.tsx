'use client'

import { useState } from 'react'
import FixedGridDragDrop from './FixedGridDragDrop'
import FreeDragDrop from './FreeDragDrop'

interface DragDropWrapperProps {
  onWeddingSettingsClick: () => void
}

export default function DragDropWrapper({ onWeddingSettingsClick }: DragDropWrapperProps) {
  const [layoutMode, setLayoutMode] = useState<'grid' | 'free'>('grid')

  return (
    <>
      {layoutMode === 'grid' ? (
        <FixedGridDragDrop
          onWeddingSettingsClick={onWeddingSettingsClick}
          layoutMode={layoutMode}
          onLayoutModeChange={setLayoutMode}
        />
      ) : (
        <FreeDragDrop
          onWeddingSettingsClick={onWeddingSettingsClick}
          layoutMode={layoutMode}
          onLayoutModeChange={setLayoutMode}
        />
      )}
    </>
  )
}
