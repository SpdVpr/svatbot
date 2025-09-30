'use client'

import { useRouter } from 'next/navigation'
import WeddingChecklist from '@/components/wedding/WeddingChecklist'
import { ListChecks, Settings } from 'lucide-react'

export default function WeddingChecklistModule() {
  const router = useRouter()

  return (
    <div className="wedding-card h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center space-x-2 mb-4">
        <ListChecks className="w-5 h-5 text-primary-600" />
        <h3 className="text-lg font-semibold text-gray-900">Svatební checklist</h3>
      </div>

      {/* Compact checklist */}
      <div className="flex-1 overflow-y-auto mb-4">
        <WeddingChecklist compact={true} />
      </div>

      {/* Action button */}
      <button
        onClick={() => router.push('/checklist')}
        className="btn-outline w-full flex items-center justify-center space-x-2"
      >
        <Settings className="w-4 h-4" />
        <span>Spravovat checklist</span>
      </button>
    </div>
  )
}

