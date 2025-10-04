'use client'

import Link from 'next/link'
import { Calendar, Clock, CheckCircle, ArrowRight } from 'lucide-react'
import { useWeddingDayTimeline } from '@/hooks/useWeddingDayTimeline'

const categoryColors = {
  preparation: 'bg-blue-100 text-blue-600',
  ceremony: 'bg-pink-100 text-pink-600',
  photography: 'bg-purple-100 text-purple-600',
  reception: 'bg-green-100 text-green-600',
  party: 'bg-orange-100 text-orange-600'
}

const categoryLabels = {
  preparation: 'Příprava',
  ceremony: 'Obřad',
  photography: 'Fotografie',
  reception: 'Hostina',
  party: 'Zábava'
}

export default function WeddingDayTimelineModule() {
  const { timeline, stats, loading } = useWeddingDayTimeline()

  if (loading) {
    return (
      <div className="wedding-card">
        <h3 className="text-lg font-semibold flex items-center justify-center space-x-2 mb-4">
          <Calendar className="w-5 h-5 text-purple-600" />
          <span>Harmonogram svatebního dne</span>
        </h3>
        <div className="text-center text-gray-500">Načítání...</div>
      </div>
    )
  }

  return (
    <div className="wedding-card">
      <Link href="/svatebni-den" className="block mb-4">
        <h3 className="text-lg font-semibold flex items-center justify-center space-x-2 hover:text-primary-600 transition-colors">
          <Calendar className="w-5 h-5 text-purple-600" />
          <span>Harmonogram svatebního dne</span>
        </h3>
      </Link>

      <div className="space-y-4">
        {/* Timeline Overview */}
        {timeline.length > 0 ? (
          <>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-center mb-3">
                <div className="text-2xl font-bold text-purple-600">
                  {stats.total}
                </div>
                <div className="text-sm text-purple-700">Naplánovaných aktivit</div>
              </div>

              <div className="text-xs text-purple-700 text-center">
                Kompletní harmonogram svatebního dne
              </div>
            </div>

            {/* Category Stats */}
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(categoryLabels).map(([key, label]) => {
                const count = stats.byCategory[key] || 0
                if (count === 0) return null
                return (
                  <div 
                    key={key}
                    className={`p-2 rounded-lg text-center ${categoryColors[key as keyof typeof categoryColors]}`}
                  >
                    <div className="text-lg font-bold">{count}</div>
                    <div className="text-xs">{label}</div>
                  </div>
                )
              })}
            </div>

            {/* Progress */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Pokrok</span>
                <span className="text-sm font-bold text-gray-900">{stats.completionRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${stats.completionRate}%` }}
                />
              </div>
              <div className="text-xs text-gray-600 mt-2 text-center">
                {stats.completed} z {stats.total} dokončeno
              </div>
            </div>

            {/* Next Items */}
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <div className="text-sm font-medium text-gray-700 mb-2">Nadcházející aktivity</div>
              <div className="space-y-2">
                {timeline.filter(item => !item.isCompleted).slice(0, 3).map(item => (
                  <div key={item.id} className="flex items-start space-x-2">
                    <Clock className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-gray-900 truncate">
                        {item.time} - {item.activity}
                      </div>
                      <div className="text-xs text-gray-500">{item.duration}</div>
                    </div>
                  </div>
                ))}
                {timeline.filter(item => !item.isCompleted).length === 0 && (
                  <div className="text-xs text-gray-500 text-center py-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mx-auto mb-1" />
                    Vše dokončeno!
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="bg-gray-50 p-6 rounded-lg text-center">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-600 mb-2">
              Zatím nemáte naplánovaný harmonogram svatebního dne
            </p>
            <p className="text-xs text-gray-500">
              Vytvořte si detailní časový plán pro váš velký den
            </p>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <Link
          href="/svatebni-den"
          className="btn-primary w-full flex items-center justify-center space-x-2"
        >
          <Calendar className="w-4 h-4" />
          <span>Spravovat harmonogram</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}

