'use client'

import { Calendar, Heart } from 'lucide-react'
import { useWedding } from '@/hooks/useWedding'
import { useTask } from '@/hooks/useTask'
import { useGuest } from '@/hooks/useGuest'
import { useBudget } from '@/hooks/useBudget'
import { dateUtils } from '@/utils'

interface WeddingCountdownModuleProps {
  onWeddingSettingsClick: () => void
}

export default function WeddingCountdownModule({ onWeddingSettingsClick }: WeddingCountdownModuleProps) {
  const { wedding } = useWedding()
  const { stats } = useTask()
  const { stats: guestStats } = useGuest()
  const { stats: budgetStats } = useBudget()

  const daysUntilWedding = wedding?.weddingDate ? dateUtils.daysUntilWedding(wedding.weddingDate) : null

  // If no wedding data, show setup prompt
  if (!wedding) {
    return (
      <div className="wedding-card text-center">
        <div className="space-y-6">
          <div>
            <div className="text-4xl mb-4">📅</div>
            <p className="text-lg font-semibold text-text-primary mb-4">
              Nastavte datum svatby
            </p>
            <button
              onClick={onWeddingSettingsClick}
              className="btn-primary flex items-center space-x-2 mx-auto"
            >
              <Calendar className="w-4 h-4" />
              <span>Nastavit datum</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="wedding-card text-center relative overflow-hidden">
      {/* Floating hearts background */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <Heart className="absolute top-4 left-4 w-8 h-8 text-primary-500 float" fill="currentColor" />
        <Heart className="absolute top-8 right-8 w-6 h-6 text-secondary-500 float-rotate" fill="currentColor" style={{ animationDelay: '0.5s' }} />
        <Heart className="absolute bottom-6 left-12 w-5 h-5 text-accent-500 float" fill="currentColor" style={{ animationDelay: '1s' }} />
      </div>

      <div className="space-y-6 relative z-10">
        {daysUntilWedding !== null ? (
          <div>
            <div className="text-4xl sm:text-6xl font-bold text-primary-600 mb-2 scale-in">
              {daysUntilWedding > 0 ? daysUntilWedding : 0}
            </div>
            <p className="text-lg sm:text-xl font-semibold text-text-primary slide-in-bottom">
              {daysUntilWedding > 0
                ? `dní do svatby`
                : daysUntilWedding === 0
                  ? 'Svatba je dnes! 🎉'
                  : 'Svatba proběhla'
              }
            </p>
            {daysUntilWedding > 0 && wedding?.weddingDate && (
              <p className="text-sm text-text-muted mt-2">
                Od {dateUtils.format(new Date(), 'dd.MM.yyyy')} do {dateUtils.format(wedding.weddingDate, 'dd.MM.yyyy')}
              </p>
            )}
          </div>
        ) : (
          <div>
            <div className="text-4xl mb-4">📅</div>
            <p className="text-lg font-semibold text-text-primary mb-4">
              Nastavte datum svatby
            </p>
            <button
              onClick={onWeddingSettingsClick}
              className="btn-primary flex items-center space-x-2 mx-auto"
            >
              <Calendar className="w-4 h-4" />
              <span>Nastavit datum</span>
            </button>
          </div>
        )}

        <div className="max-w-md mx-auto">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-text-muted">Celkový pokrok</span>
            <span className="text-sm font-semibold">{wedding?.progress?.overall || 0}%</span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${wedding?.progress?.overall || 0}%` }}
            />
          </div>
        </div>

        <p className="text-sm text-text-secondary">
          {wedding.progress.overall < 30
            ? "Skvělý začátek! Pokračujte v základním plánování."
            : wedding.progress.overall < 70
              ? "Výborně! Máte za sebou většinu příprav."
              : "Fantastické! Blížíte se k cíli."
          }
        </p>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-xs sm:text-sm text-text-muted">Úkolů</div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-primary-600">{guestStats.total}</div>
            <div className="text-xs sm:text-sm text-text-muted">Hostů</div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-green-600">{Math.round(budgetStats.totalBudget / 1000)}k</div>
            <div className="text-xs sm:text-sm text-text-muted">Rozpočet</div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-purple-600">{stats.total}</div>
            <div className="text-xs sm:text-sm text-text-muted">Úkolů</div>
          </div>
        </div>
      </div>
    </div>
  )
}
