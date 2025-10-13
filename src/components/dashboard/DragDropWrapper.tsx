'use client'

import { useDashboard } from '@/hooks/useDashboard'
import { Grid3x3, Maximize2 } from 'lucide-react'
import FixedGridDragDrop from './FixedGridDragDrop'
import FreeDragDrop from './FreeDragDrop'

interface DragDropWrapperProps {
  onWeddingSettingsClick: () => void
}

export default function DragDropWrapper({ onWeddingSettingsClick }: DragDropWrapperProps) {
  const { layout, hasLoadedFromFirebase } = useDashboard()

  const currentMode = layout.layoutMode || 'grid'

  // Render both layouts but show only the active one to avoid re-mounting
  // Use opacity instead of display to prevent layout shift, but keep pointer-events
  // Hide both until we've loaded from Firebase to prevent flashing
  return (
    <>
      <div
        style={{
          opacity: !hasLoadedFromFirebase ? 0 : (currentMode === 'grid' ? 1 : 0),
          pointerEvents: currentMode === 'grid' ? 'auto' : 'none',
          position: currentMode === 'grid' ? 'relative' : 'absolute',
          width: '100%',
          transition: 'opacity 0.15s ease-in-out'
        }}
      >
        <FixedGridDragDrop onWeddingSettingsClick={onWeddingSettingsClick} />
      </div>
      <div
        style={{
          opacity: !hasLoadedFromFirebase ? 0 : (currentMode === 'free' ? 1 : 0),
          pointerEvents: currentMode === 'free' ? 'auto' : 'none',
          position: currentMode === 'free' ? 'relative' : 'absolute',
          width: '100%',
          transition: 'opacity 0.15s ease-in-out'
        }}
      >
        <FreeDragDrop onWeddingSettingsClick={onWeddingSettingsClick} />
      </div>
    </>
  )
}
