'use client'

import { useDashboard } from '@/hooks/useDashboard'
import FreeDragDrop from './FreeDragDrop'

interface DragDropWrapperProps {
  onWeddingSettingsClick: () => void
  onOnboardingWizardChange?: (isOpen: boolean) => void
}

export default function DragDropWrapper({ onWeddingSettingsClick, onOnboardingWizardChange }: DragDropWrapperProps) {
  const { hasLoadedFromFirebase } = useDashboard()

  // Use FreeDragDrop for both grid and free modes
  // Grid mode will have snapping enabled, free mode will not
  return (
    <div
      style={{
        opacity: !hasLoadedFromFirebase ? 0 : 1,
        transition: 'opacity 0.15s ease-in-out'
      }}
    >
      <FreeDragDrop
        onWeddingSettingsClick={onWeddingSettingsClick}
        onOnboardingWizardChange={onOnboardingWizardChange}
      />
    </div>
  )
}
