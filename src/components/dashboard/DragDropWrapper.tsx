'use client'

import FixedGridDragDrop from './FixedGridDragDrop'

interface DragDropWrapperProps {
  onWeddingSettingsClick: () => void
}

export default function DragDropWrapper({ onWeddingSettingsClick }: DragDropWrapperProps) {
  // FixedGridDragDrop will handle switching to FreeDragDrop internally
  return <FixedGridDragDrop onWeddingSettingsClick={onWeddingSettingsClick} />
}
