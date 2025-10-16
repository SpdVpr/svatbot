'use client'

import { useAuth } from '@/hooks/useAuth'
import { useWedding } from '@/hooks/useWedding'
import WeddingChecklist from '@/components/wedding/WeddingChecklist'
import {
  ArrowLeft,
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
      <div className="bg-white border-b border-gray-200">
        {/* Breadcrumb - Hidden on mobile */}
        <div className="hidden sm:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2 py-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-gray-700 transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Svatební checklist</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Mobile header */}
          <div className="sm:hidden space-y-4 py-4">
            {/* Top row - Back button and title */}
            <div className="flex items-center space-x-3">
              <Link
                href="/"
                className="flex items-center justify-center w-8 h-8 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Svatební checklist</h1>
              </div>
            </div>
          </div>

          {/* Desktop header */}
          <div className="hidden sm:flex items-center justify-between h-16">
            {/* Back button and Title */}
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Zpět na dashboard</span>
              </Link>
              <div className="border-l border-gray-300 pl-4">
                <div className="flex items-center space-x-2">
                  <ListChecks className="w-6 h-6 text-primary-600" />
                  <h1 className="text-2xl font-bold text-gray-900">Svatební checklist</h1>
                </div>
                <p className="text-sm text-gray-600">
                  Předpřipravené úkoly pro svatbu {wedding.brideName} & {wedding.groomName}
                </p>
              </div>
            </div>

            {/* Quick link to tasks */}
            <Link
              href="/tasks"
              className="btn-outline flex items-center space-x-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Zobrazit úkoly</span>
            </Link>
          </div>
        </div>
      </div>

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

