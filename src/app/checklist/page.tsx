'use client'

import { useAuth } from '@/hooks/useAuth'
import { useWedding } from '@/hooks/useWedding'
import WeddingChecklist from '@/components/wedding/WeddingChecklist'
import ModuleHeader from '@/components/common/ModuleHeader'
import {
  ListChecks,
  Sparkles,
  CheckCircle2
} from 'lucide-react'
import Link from 'next/link'

export default function ChecklistPage() {
  const { user } = useAuth()
  const { wedding } = useWedding()

  // Don't show auth check - let AppTemplate handle transitions smoothly
  if (!user || !wedding) {
    return null
  }

  if (!wedding) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Žádná svatba
          </h1>
          <p className="text-gray-600 mb-4">
            Nejdříve si vytvořte svatbu v onboarding procesu.
          </p>
          <Link href="/" className="btn-primary">
            Zpět na dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <ModuleHeader
        icon={ListChecks}
        title="Svatební checklist"
        subtitle={`Předpřipravené úkoly pro svatbu ${wedding.brideName} & ${wedding.groomName}`}
        iconGradient="from-violet-500 to-purple-500"
        actions={
          <Link
            href="/tasks"
            className="btn-outline flex items-center space-x-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Zobrazit úkoly</span>
          </Link>
        }
      />

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Checklist */}
        <WeddingChecklist />

        {/* Bottom CTA */}
        <div className="mt-8 text-center">
          <Link
            href="/tasks"
            className="inline-flex items-center space-x-2 btn-primary"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>Zobrazit všechny úkoly</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

