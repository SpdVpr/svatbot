'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import WeddingChecklist from '@/components/wedding/WeddingChecklist'
import { ListChecks, ArrowRight } from 'lucide-react'

export default function WeddingChecklistModule() {
  const router = useRouter()

  return (
    <div className="wedding-card h-full flex flex-col">
      {/* Header */}
      <Link href="/checklist" className="block mb-4">
        <h3 className="text-base sm:text-lg font-semibold flex items-center justify-start sm:justify-center space-x-2 hover:text-primary-600 transition-colors">
          <ListChecks className="w-4 h-4 sm:w-5 sm:h-5 text-violet-600 flex-shrink-0" />
          <span className="truncate">Svatební checklist</span>
        </h3>
      </Link>

      {/* Compact checklist */}
      <div className="flex-1 overflow-y-auto mb-4">
        <WeddingChecklist compact={true} />
      </div>

      {/* Action button */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <Link
          href="/checklist"
          className="btn-primary w-full flex items-center justify-center space-x-2"
        >
          <ListChecks className="w-4 h-4" />
          <span>Spravovat checklist</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}

