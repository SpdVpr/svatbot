'use client'

import FixedGridDragDrop from './FixedGridDragDrop'

interface DragDropWrapperProps {
  onWeddingSettingsClick: () => void
}

export default function DragDropWrapper({ onWeddingSettingsClick }: DragDropWrapperProps) {
  return <FixedGridDragDrop onWeddingSettingsClick={onWeddingSettingsClick} />
}
