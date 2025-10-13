'use client'

import { useDashboard } from '@/hooks/useDashboard'
import FixedGridDragDrop from './FixedGridDragDrop'
import FreeDragDrop from './FreeDragDrop'

interface DragDropWrapperProps {
  onWeddingSettingsClick: () => void
}

export default function DragDropWrapper({ onWeddingSettingsClick }: DragDropWrapperProps) {
  const { layout } = useDashboard()
  const layoutMode = layout.layoutMode || 'grid'

  if (layoutMode === 'free') {
    return <FreeDragDrop onWeddingSettingsClick={onWeddingSettingsClick} />
  }

  return <FixedGridDragDrop onWeddingSettingsClick={onWeddingSettingsClick} />
}
