'use client'

import { TrendingUp } from 'lucide-react'
import { useWeddingStore } from '@/stores/weddingStore'

export default function PhaseProgressModule() {
  const { currentWedding } = useWeddingStore()

  // Create mock wedding if none exists
  const wedding = currentWedding || {
    progress: {
      foundation: 100,
      venue: 85,
      guests: 80,
      budget: 65,
      design: 45,
      organization: 30,
      final: 0
    }
  }

  const phases = [
    { key: 'foundation', label: 'Základy', progress: wedding.progress.foundation, color: 'bg-green-500' },
    { key: 'venue', label: 'Místo konání', progress: wedding.progress.venue, color: 'bg-blue-500' },
    { key: 'guests', label: 'Hosté', progress: wedding.progress.guests, color: 'bg-primary-500' },
    { key: 'budget', label: 'Rozpočet', progress: wedding.progress.budget, color: 'bg-green-500' },
    { key: 'design', label: 'Design', progress: wedding.progress.design, color: 'bg-purple-500' },
    { key: 'organization', label: 'Organizace', progress: wedding.progress.organization, color: 'bg-orange-500' },
    { key: 'final', label: 'Finální', progress: wedding.progress.final, color: 'bg-red-500' }
  ]

  const overallProgress = Math.round(
    phases.reduce((sum, phase) => sum + phase.progress, 0) / phases.length
  )

  return (
    <div className="wedding-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-primary-600" />
          <span>Pokrok podle fází</span>
        </h3>
        <div className="text-2xl font-bold text-primary-600">{overallProgress}%</div>
      </div>

      <div className="space-y-4">
        {phases.map((phase) => (
          <div key={phase.key}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                {phase.label}
              </span>
              <span className="text-sm font-bold text-gray-900">
                {phase.progress}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${phase.color}`}
                style={{ width: `${phase.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-1">Celkový pokrok</div>
          <div className="text-2xl font-bold text-primary-600">{overallProgress}%</div>
          <div className="text-xs text-gray-500 mt-1">
            {overallProgress < 30
              ? "Skvělý začátek! Pokračujte v základním plánování."
              : overallProgress < 70
                ? "Výborně! Máte za sebou většinu příprav."
                : "Fantastické! Blížíte se k cíli."
            }
          </div>
        </div>
      </div>
    </div>
  )
}
