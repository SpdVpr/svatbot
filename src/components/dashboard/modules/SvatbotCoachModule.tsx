'use client'

import SvatbotWidget from '@/components/ai/SvatbotWidget'

interface SvatbotCoachModuleProps {
  onOpenAI?: () => void
}

export default function SvatbotCoachModule({ onOpenAI }: SvatbotCoachModuleProps) {
  return (
    <div className="h-full">
      <SvatbotWidget showMoodTracker={true} compact={false} />
    </div>
  )
}

