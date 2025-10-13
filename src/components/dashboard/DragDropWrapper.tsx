'use client'

import FixedGridDragDrop from './FixedGridDragDrop'
import FreeDragDrop from './FreeDragDrop'
import { useDashboard } from '@/hooks/useDashboard'

interface DragDropWrapperProps {
  onWeddingSettingsClick: () => void
}

export default function DragDropWrapper({ onWeddingSettingsClick }: DragDropWrapperProps) {
  const { layout, setLayoutMode } = useDashboard()
  const layoutMode = layout.layoutMode || 'grid'

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
