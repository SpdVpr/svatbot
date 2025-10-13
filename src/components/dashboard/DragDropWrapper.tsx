'use client'

import FreeDragDrop from './FreeDragDrop'

interface DragDropWrapperProps {
  onWeddingSettingsClick: () => void
}

export default function DragDropWrapper({ onWeddingSettingsClick }: DragDropWrapperProps) {
  return <FreeDragDrop onWeddingSettingsClick={onWeddingSettingsClick} />
}
