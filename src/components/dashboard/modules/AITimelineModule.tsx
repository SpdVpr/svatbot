'use client'

import Link from 'next/link'
import { Calendar, ArrowRight, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { useAITimeline } from '@/hooks/useAITimeline'

interface AITimelineModuleProps {
  className?: string
}

export default function AITimelineModule({ className = '' }: AITimelineModuleProps) {
  const { timeline, loading, error } = useAITimeline()

  // Convert time to minutes for positioning
  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
  }

  // Parse duration to minutes
  const durationToMinutes = (duration: string): number => {
    const match = duration.match(/(\d+)\s*(hodina|hodiny|hodin|minut|minut)/i)
    if (!match) return 30 // default 30 minutes

    const value = parseInt(match[1])
    const unit = match[2].toLowerCase()

    if (unit.includes('hodin')) {
      return value * 60
    } else {
      return value
    }
  }

  // Get timeline bounds for mini timeline
  const getTimelineBounds = () => {
    if (timeline.length === 0) return { start: 480, end: 1440 } // 8:00 to 24:00

    const times = timeline.map(item => {
      const startTime = timeToMinutes(item.time)
      const duration = durationToMinutes(item.duration)
      return { start: startTime, end: startTime + duration }
    })

    const allTimes = times.flatMap(t => [t.start, t.end])
    const start = Math.min(...allTimes) - 30 // 30 min before first event
    const end = Math.max(...allTimes) + 30 // 30 min after last event

    return { start: Math.max(0, start), end: Math.min(1440, end) }
  }

  const bounds = getTimelineBounds()
  const totalMinutes = bounds.end - bounds.start

  const categoryDotColors = {
    preparation: 'bg-blue-500',
    ceremony: 'bg-pink-500',
    reception: 'bg-green-500',
    party: 'bg-purple-500',
    other: 'bg-gray-500'
  }

  // Get timeline stats (planning focused, not completion tracking)
  const getTimelineStats = () => {
    const total = timeline.length
    const categories = {
      preparation: timeline.filter(item => item.category === 'preparation').length,
      ceremony: timeline.filter(item => item.category === 'ceremony').length,
      reception: timeline.filter(item => item.category === 'reception').length,
      party: timeline.filter(item => item.category === 'party').length,
      other: timeline.filter(item => item.category === 'other').length
    }

    return { total, categories }
  }

  const stats = getTimelineStats()

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

            {/* Quick Stats */}
            <div className="flex items-center justify-between mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                <div className="text-xs text-gray-500">Aktivit</div>
              </div>
              <div className="text-center">
                <div className={`text-sm px-3 py-1 rounded-full ${
                  stats.total === 0
                    ? 'bg-gray-100 text-gray-600'
                    : stats.total < 5
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-green-100 text-green-700'
                }`}>
                  {stats.total === 0
                    ? 'Žádný plán'
                    : stats.total < 5
                      ? 'Základní plán'
                      : 'Detailní plán'
                  }
                </div>
              </div>
            </div>

            {/* Mini Timeline Visualization */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Časová osa:</h4>
              <div className="relative h-8 bg-gray-100 rounded-lg overflow-hidden">
                {/* Timeline segments */}
                {timeline.map((item) => {
                  const itemTime = timeToMinutes(item.time)
                  const itemDuration = durationToMinutes(item.duration)
                  const startPosition = ((itemTime - bounds.start) / totalMinutes) * 100
                  const segmentWidth = (itemDuration / totalMinutes) * 100

                  return (
                    <div
                      key={`mini-${item.id}`}
                      className={`absolute top-0 h-full ${categoryDotColors[item.category]} opacity-80 hover:opacity-100 transition-opacity group`}
                      style={{
                        left: `${Math.max(0, startPosition)}%`,
                        width: `${Math.min(segmentWidth, 100 - startPosition)}%`
                      }}
                      title={`${item.activity} (${item.time})`}
                    >
                      {/* Gradient overlay */}
                      <div className="w-full h-full bg-gradient-to-r from-white/20 via-transparent to-white/20"></div>
                    </div>
                  )
                })}

                {/* Time markers */}
                <div className="absolute inset-0 flex justify-between items-center px-2 pointer-events-none">
                  <div className="text-xs text-gray-500 font-medium">
                    {Math.floor(bounds.start / 60).toString().padStart(2, '0')}:
                    {(bounds.start % 60).toString().padStart(2, '0')}
                  </div>
                  <div className="text-xs text-gray-500 font-medium">
                    {Math.floor(bounds.end / 60).toString().padStart(2, '0')}:
                    {(bounds.end % 60).toString().padStart(2, '0')}
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline Items Preview */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Nejbližší aktivity:</h4>
              {timeline.slice(0, 3).map((item) => (
                <div key={item.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                  <div className={`w-3 h-3 rounded-full ${categoryDotColors[item.category]}`}></div>
                  <div className="text-sm font-medium text-gray-900">{item.time}</div>
                  <div className="flex-1 text-sm text-gray-600 truncate">{item.activity}</div>
                  <div className="text-xs text-gray-500">{item.duration}</div>
                </div>
              ))}
              {timeline.length > 3 && (
                <div className="text-xs text-gray-500 text-center">
                  ... a {timeline.length - 3} dalších aktivit
                </div>
              )}
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="text-center py-6">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h4 className="text-sm font-medium text-gray-900 mb-1">Žádný plán</h4>
            <p className="text-xs text-gray-500 mb-4">
              Začněte plánovat průběh svatebního dne
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
              <div>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
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
