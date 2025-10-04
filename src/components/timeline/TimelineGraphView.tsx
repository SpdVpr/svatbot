'use client'

import { WeddingDayTimelineItem } from '@/hooks/useWeddingDayTimeline'
import { Clock } from 'lucide-react'

interface TimelineGraphViewProps {
  timeline: WeddingDayTimelineItem[]
}

const categoryColors = {
  preparation: {
    gradient: 'from-blue-400 to-blue-600',
    bg: 'bg-blue-50',
    text: 'text-blue-900',
    border: 'border-blue-200',
    icon: '💄',
    label: 'Příprava'
  },
  ceremony: {
    gradient: 'from-pink-400 to-pink-600',
    bg: 'bg-pink-50',
    text: 'text-pink-900',
    border: 'border-pink-200',
    icon: '💍',
    label: 'Obřad'
  },
  photography: {
    gradient: 'from-purple-400 to-purple-600',
    bg: 'bg-purple-50',
    text: 'text-purple-900',
    border: 'border-purple-200',
    icon: '📸',
    label: 'Fotografie'
  },
  reception: {
    gradient: 'from-green-400 to-green-600',
    bg: 'bg-green-50',
    text: 'text-green-900',
    border: 'border-green-200',
    icon: '🍽️',
    label: 'Hostina'
  },
  party: {
    gradient: 'from-orange-400 to-orange-600',
    bg: 'bg-orange-50',
    text: 'text-orange-900',
    border: 'border-orange-200',
    icon: '🎉',
    label: 'Zábava'
  }
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

  // Generate hour markers - only show hours where there's activity or nearby
  const hourMarkers: number[] = []
  const startHour = Math.floor(startTime / 60)
  const endHour = Math.ceil(endTime / 60)

  // Find first and last activity times
  const firstActivityTime = Math.min(...times)
  const lastActivityTime = Math.max(...endTimes)
  const firstActivityHour = Math.floor(firstActivityTime / 60)
  const lastActivityHour = Math.ceil(lastActivityTime / 60)

  // Only show hours from first activity to last activity
  for (let hour = firstActivityHour; hour <= lastActivityHour; hour++) {
    hourMarkers.push(hour * 60)
  }

  // Adjust start and end time to match activity range (with small padding)
  const adjustedStartTime = firstActivityHour * 60
  const adjustedEndTime = lastActivityHour * 60
  const adjustedTotalMinutes = adjustedEndTime - adjustedStartTime

  // Group timeline items by category
  const categories = ['preparation', 'ceremony', 'photography', 'reception', 'party'] as const
  const groupedTimeline = categories.map(category => ({
    category,
    items: timeline.filter(item => item.category === category)
  })).filter(group => group.items.length > 0)

  // Calculate pixel width for better scrolling
  const pixelsPerHour = 180
  const totalHours = adjustedTotalMinutes / 60
  const timelineWidth = Math.max(totalHours * pixelsPerHour, 1000)

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Clock className="w-6 h-6 text-white" />
            <h2 className="text-xl font-bold text-white">Časová osa svatebního dne</h2>
          </div>
          <div className="text-white text-sm font-medium bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
            {formatTime(adjustedStartTime)} - {formatTime(adjustedEndTime)} • {Math.round(adjustedTotalMinutes / 60)}h
          </div>
        </div>
      </div>

      {/* Timeline Container with horizontal scroll */}
      <div className="overflow-x-auto overflow-y-visible">
        <div className="pl-40 pr-6 py-6" style={{ minWidth: `${timelineWidth + 160}px` }}>

          {/* Time axis */}
          <div className="relative mb-8">
            <div className="relative h-12 bg-gradient-to-r from-gray-100 to-gray-50 rounded-lg border border-gray-200 shadow-inner">
              {hourMarkers.map((minutes) => {
                const position = ((minutes - adjustedStartTime) / adjustedTotalMinutes) * 100
                return (
                  <div
                    key={minutes}
                    className="absolute top-0 h-full flex flex-col items-center"
                    style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
                  >
                    {/* Time marker line */}
                    <div className="w-0.5 h-3 bg-gray-400 rounded-full" />
                    {/* Time label */}
                    <div className="mt-1 text-xs font-semibold text-gray-700 bg-white px-2 py-1 rounded shadow-sm">
                      {formatTime(minutes)}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Swim lanes by category */}
          <div className="space-y-3">
            {groupedTimeline.map(({ category, items }) => {
              const colors = categoryColors[category]

              return (
                <div key={category} className="relative">
                  {/* Category lane */}
                  <div className={`relative rounded-xl border-2 ${colors.border} ${colors.bg} overflow-visible`}>
                    {/* Category label - positioned inside the left side */}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-36 z-10">
                      <div className={`flex items-center space-x-2 bg-gradient-to-r ${colors.gradient} text-white px-4 py-2 rounded-lg shadow-lg whitespace-nowrap`}>
                        <span className="text-lg">{colors.icon}</span>
                        <span className="font-semibold text-sm">{colors.label}</span>
                      </div>
                    </div>

                    {/* Timeline items in this category */}
                    <div className="relative h-20 px-4">
                      {items.map((item, itemIndex) => {
                        const itemStart = timeToMinutes(item.time)
                        const itemDuration = durationToMinutes(item.duration)
                        const itemEnd = itemStart + itemDuration

                        // Sort items by time to check adjacency correctly
                        const sortedItems = [...items].sort((a, b) =>
                          timeToMinutes(a.time) - timeToMinutes(b.time)
                        )
                        const currentIndex = sortedItems.findIndex(i => i.id === item.id)
                        const nextItem = sortedItems[currentIndex + 1]

                        // Check if next item starts immediately after this one (within 1 minute tolerance)
                        const nextItemStart = nextItem ? timeToMinutes(nextItem.time) : null
                        const directlyFollowed = nextItemStart !== null && Math.abs(nextItemStart - itemEnd) <= 1

                        const leftPosition = ((itemStart - adjustedStartTime) / adjustedTotalMinutes) * 100
                        const width = (itemDuration / adjustedTotalMinutes) * 100

                        return (
                          <div
                            key={item.id}
                            className="absolute top-1/2 -translate-y-1/2 h-14 group"
                            style={{
                              left: `${leftPosition}%`,
                              width: `${width}%`,
                              minWidth: '80px',
                              // Add small padding-right only if NOT directly followed by another activity
                              paddingRight: directlyFollowed ? '0px' : '3px'
                            }}
                          >
                            {/* Activity card */}
                            <div
                              className={`h-full bg-gradient-to-br ${colors.gradient} rounded-lg shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer transform hover:-translate-y-1 border-2 border-white`}
                            >
                              <div className="h-full flex flex-col justify-center px-3 py-2 overflow-hidden">
                                <div className="text-xs font-bold text-white truncate">
                                  {item.activity}
                                </div>
                                <div className="text-xs text-white/90 font-medium">
                                  {item.time}
                                </div>
                                <div className="text-xs text-white/80">
                                  {item.duration}
                                </div>
                              </div>

                              {/* Enhanced tooltip */}
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 hidden group-hover:block z-50">
                                <div className="bg-gray-900 text-white rounded-xl p-4 shadow-2xl min-w-[280px] max-w-[320px]">
                                  {/* Arrow */}
                                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
                                    <div className="border-8 border-transparent border-t-gray-900" />
                                  </div>

                                  <div className="space-y-2">
                                    <div className="flex items-start space-x-2">
                                      <span className="text-lg">{colors.icon}</span>
                                      <div className="flex-1">
                                        <div className="font-bold text-base mb-1">{item.activity}</div>
                                        <div className="text-gray-300 text-sm flex items-center space-x-2">
                                          <Clock className="w-3 h-3" />
                                          <span>{item.time} • {item.duration}</span>
                                        </div>
                                      </div>
                                    </div>

                                    {item.location && (
                                      <div className="flex items-start space-x-2 text-sm text-gray-300 pt-2 border-t border-gray-700">
                                        <span>📍</span>
                                        <span>{item.location}</span>
                                      </div>
                                    )}

                                    {item.participants && item.participants.length > 0 && (
                                      <div className="flex items-start space-x-2 text-sm text-gray-300">
                                        <span>👥</span>
                                        <span>{item.participants.join(', ')}</span>
                                      </div>
                                    )}

                                    {item.notes && (
                                      <div className="text-gray-400 text-xs pt-2 border-t border-gray-700 italic">
                                        {item.notes}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Legend at bottom */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex flex-wrap gap-4 justify-center">
              {Object.entries(categoryColors).map(([key, colors]) => (
                <div key={key} className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
                  <span className="text-lg">{colors.icon}</span>
                  <span className="text-sm font-medium text-gray-700">{colors.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

