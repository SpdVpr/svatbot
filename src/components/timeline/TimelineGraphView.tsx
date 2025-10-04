'use client'

import { WeddingDayTimelineItem } from '@/hooks/useWeddingDayTimeline'

interface TimelineGraphViewProps {
  timeline: WeddingDayTimelineItem[]
}

const categoryColors = {
  preparation: {
    bg: 'bg-blue-500',
    light: 'bg-blue-100',
    text: 'text-blue-700',
    border: 'border-blue-300'
  },
  ceremony: {
    bg: 'bg-pink-500',
    light: 'bg-pink-100',
    text: 'text-pink-700',
    border: 'border-pink-300'
  },
  photography: {
    bg: 'bg-purple-500',
    light: 'bg-purple-100',
    text: 'text-purple-700',
    border: 'border-purple-300'
  },
  reception: {
    bg: 'bg-green-500',
    light: 'bg-green-100',
    text: 'text-green-700',
    border: 'border-green-300'
  },
  party: {
    bg: 'bg-orange-500',
    light: 'bg-orange-100',
    text: 'text-orange-700',
    border: 'border-orange-300'
  }
}

const categoryLabels = {
  preparation: 'Příprava',
  ceremony: 'Obřad',
  photography: 'Fotografie',
  reception: 'Hostina',
  party: 'Zábava'
}

// Convert time string to minutes from midnight
const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

// Convert duration string to minutes
const durationToMinutes = (duration: string): number => {
  const hourMatch = duration.match(/(\d+)\s*hod/)
  const minMatch = duration.match(/(\d+)\s*min/)
  
  let totalMinutes = 0
  if (hourMatch) totalMinutes += parseInt(hourMatch[1]) * 60
  if (minMatch) totalMinutes += parseInt(minMatch[1])
  
  return totalMinutes || 30 // Default to 30 minutes if parsing fails
}

export default function TimelineGraphView({ timeline }: TimelineGraphViewProps) {
  if (timeline.length === 0) return null

  // Find time range
  const times = timeline.map(item => timeToMinutes(item.time))
  const startTime = Math.min(...times)
  const endTimes = timeline.map(item => timeToMinutes(item.time) + durationToMinutes(item.duration))
  const endTime = Math.max(...endTimes)
  const totalMinutes = endTime - startTime

  // Format time for display
  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
  }

  // Generate hour markers
  const hourMarkers: number[] = []
  const startHour = Math.floor(startTime / 60)
  const endHour = Math.ceil(endTime / 60)
  for (let hour = startHour; hour <= endHour; hour++) {
    hourMarkers.push(hour * 60)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Grafická timeline</h2>
      
      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-6 pb-4 border-b border-gray-200">
        {Object.entries(categoryLabels).map(([key, label]) => {
          const colors = categoryColors[key as keyof typeof categoryColors]
          return (
            <div key={key} className="flex items-center space-x-2">
              <div className={`w-4 h-4 rounded ${colors.bg}`} />
              <span className="text-sm text-gray-700">{label}</span>
            </div>
          )
        })}
      </div>

      {/* Timeline Graph */}
      <div className="relative">
        {/* Hour markers */}
        <div className="flex mb-2">
          {hourMarkers.map((minutes, index) => {
            const position = ((minutes - startTime) / totalMinutes) * 100
            return (
              <div
                key={minutes}
                className="absolute text-xs text-gray-500 font-medium"
                style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
              >
                {formatTime(minutes)}
              </div>
            )
          })}
        </div>

        {/* Timeline bars */}
        <div className="relative mt-8 space-y-2">
          {timeline.map((item, index) => {
            const itemStart = timeToMinutes(item.time)
            const itemDuration = durationToMinutes(item.duration)
            const leftPosition = ((itemStart - startTime) / totalMinutes) * 100
            const width = (itemDuration / totalMinutes) * 100
            const colors = categoryColors[item.category]

            return (
              <div key={item.id} className="relative h-12">
                {/* Time bar */}
                <div
                  className={`absolute h-full rounded-lg ${colors.bg} ${colors.light} border-2 ${colors.border} transition-all hover:shadow-md cursor-pointer group`}
                  style={{
                    left: `${leftPosition}%`,
                    width: `${width}%`
                  }}
                >
                  {/* Content */}
                  <div className="h-full flex items-center px-3 overflow-hidden">
                    <div className="flex-1 min-w-0">
                      <div className={`text-xs font-semibold ${colors.text} truncate`}>
                        {item.time} - {item.activity}
                      </div>
                      <div className="text-xs text-gray-600 truncate">
                        {item.duration}
                      </div>
                    </div>
                  </div>

                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-10">
                    <div className="bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl min-w-[250px]">
                      <div className="font-semibold mb-1">{item.activity}</div>
                      <div className="text-gray-300 mb-1">
                        {item.time} • {item.duration}
                      </div>
                      {item.location && (
                        <div className="text-gray-300 mb-1">📍 {item.location}</div>
                      )}
                      {item.participants && item.participants.length > 0 && (
                        <div className="text-gray-300 mb-1">
                          👥 {item.participants.join(', ')}
                        </div>
                      )}
                      {item.notes && (
                        <div className="text-gray-400 text-xs mt-2 italic">
                          {item.notes}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Hour grid lines */}
        <div className="absolute inset-0 pointer-events-none">
          {hourMarkers.map((minutes) => {
            const position = ((minutes - startTime) / totalMinutes) * 100
            return (
              <div
                key={minutes}
                className="absolute top-0 bottom-0 w-px bg-gray-200"
                style={{ left: `${position}%` }}
              />
            )
          })}
        </div>
      </div>

      {/* Time range info */}
      <div className="mt-6 pt-4 border-t border-gray-200 text-center text-sm text-gray-600">
        Celková délka: {formatTime(startTime)} - {formatTime(endTime)} ({Math.round(totalMinutes / 60)} hodin)
      </div>
    </div>
  )
}

