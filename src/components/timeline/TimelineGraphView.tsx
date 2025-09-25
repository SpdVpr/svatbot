'use client'

import { useState } from 'react'
import { AITimelineItem } from '@/hooks/useAITimeline'
import { Edit3, Trash2, MapPin, Users, Clock, GripVertical } from 'lucide-react'

interface TimelineGraphViewProps {
  timeline: AITimelineItem[]
  onEdit: (itemId: string) => void
  onDelete: (itemId: string) => void
  onReorder?: (newTimeline: AITimelineItem[]) => void
}

const categoryColors = {
  preparation: 'border-blue-500 bg-blue-50 text-blue-700',
  ceremony: 'border-pink-500 bg-pink-50 text-pink-700',
  reception: 'border-green-500 bg-green-50 text-green-700',
  party: 'border-purple-500 bg-purple-50 text-purple-700',
  other: 'border-gray-500 bg-gray-50 text-gray-700'
}

const categoryDotColors = {
  preparation: 'bg-blue-500',
  ceremony: 'bg-pink-500',
  reception: 'bg-green-500',
  party: 'bg-purple-500',
  other: 'bg-gray-500'
}

const categoryIcons = {
  preparation: '💄',
  ceremony: '💒',
  reception: '🍽️',
  party: '🎉',
  other: '📋'
}

export default function TimelineGraphView({ timeline, onEdit, onDelete, onReorder }: TimelineGraphViewProps) {
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [dragOverItem, setDragOverItem] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

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

  // Get timeline bounds
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

  // Format time for display
  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
  }

  // Generate time markers (every hour)
  const generateTimeMarkers = () => {
    const markers = []
    const startHour = Math.floor(bounds.start / 60)
    const endHour = Math.ceil(bounds.end / 60)

    for (let hour = startHour; hour <= endHour; hour++) {
      const minutes = hour * 60
      if (minutes >= bounds.start && minutes <= bounds.end) {
        markers.push({
          time: formatTime(minutes),
          minutes: minutes
        })
      }
    }

    return markers
  }

  const timeMarkers = generateTimeMarkers()

  // Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    setDraggedItem(itemId)
    setIsDragging(true)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', itemId)

    // Add visual feedback
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5'
    }
  }

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedItem(null)
    setDragOverItem(null)
    setIsDragging(false)

    // Reset visual feedback
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1'
    }
  }

  const handleDragOver = (e: React.DragEvent, itemId?: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'

    if (itemId && itemId !== draggedItem) {
      setDragOverItem(itemId)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear if we're leaving the entire component
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverItem(null)
    }
  }

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    setDragOverItem(null)

    if (!draggedItem || draggedItem === targetId || !onReorder) {
      setDraggedItem(null)
      setIsDragging(false)
      return
    }

    const draggedIndex = timeline.findIndex(item => item.id === draggedItem)
    const targetIndex = timeline.findIndex(item => item.id === targetId)

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedItem(null)
      setIsDragging(false)
      return
    }

    const newTimeline = [...timeline]
    const [draggedItemData] = newTimeline.splice(draggedIndex, 1)
    newTimeline.splice(targetIndex, 0, draggedItemData)

    onReorder(newTimeline)
    setDraggedItem(null)
    setIsDragging(false)
  }

  if (timeline.length === 0) {
    return (
      <div className="wedding-card text-center py-12">
        <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Žádná timeline</h3>
        <p className="text-gray-600">
          Přidejte aktivity nebo vygenerujte AI timeline
        </p>
      </div>
    )
  }

  return (
    <div className="wedding-card">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Grafická Timeline</h3>
        <p className="text-sm text-gray-600">
          Vizuální přehled vašeho svatebního dne
        </p>
      </div>

      {/* Vertical Timeline Container */}
      <div className="relative">
        <div className="flex">
          {/* Left Events */}
          <div className="flex-1 relative pr-8" style={{ minHeight: '600px' }}>
            {timeline.filter((_, index) => index % 2 === 0).map((item, index) => {
              const itemTime = timeToMinutes(item.time)
              const itemDuration = durationToMinutes(item.duration)
              const startPosition = ((itemTime - bounds.start) / totalMinutes) * 100
              const durationHeight = (itemDuration / totalMinutes) * 100

              return (
                <div
                  key={item.id}
                  draggable={!!onReorder}
                  onDragStart={(e) => handleDragStart(e, item.id)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => handleDragOver(e, item.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, item.id)}
                  className={`absolute right-0 group transition-all duration-200 ${
                    onReorder ? 'cursor-move' : ''
                  } ${
                    draggedItem === item.id ? 'opacity-30 scale-95 z-50' : ''
                  } ${
                    dragOverItem === item.id ? 'transform scale-105 shadow-lg' : ''
                  } ${
                    isDragging && draggedItem !== item.id ? 'opacity-70' : ''
                  }`}
                  style={{
                    top: `${startPosition}%`,
                    width: 'calc(100% - 20px)',
                    minHeight: '80px'
                  }}
                >
                  {/* Connection Line to Timeline */}
                  <div className="absolute -right-10 top-6 w-10 h-px bg-gray-400 shadow-sm"></div>

                  {/* Event Card */}
                  <div className={`bg-white border-r-4 rounded-lg p-4 shadow-sm hover:shadow-md transition-all text-right ${categoryColors[item.category]}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-end space-x-2 mb-2">
                          <h4 className="font-semibold text-gray-900">{item.activity}</h4>
                          <span className="text-lg">{categoryIcons[item.category]}</span>
                        </div>

                        <div className="flex items-center justify-end space-x-4 text-sm text-gray-600 mb-2">
                          <div className="text-gray-500">
                            {item.duration}
                          </div>
                          <div className="flex items-center space-x-1">
                            <span className="font-medium">{item.time}</span>
                            <Clock className="w-3 h-3" />
                          </div>
                        </div>

                        {item.location && (
                          <div className="flex items-center justify-end space-x-1 text-sm text-gray-600 mb-1">
                            <span>{item.location}</span>
                            <MapPin className="w-3 h-3" />
                          </div>
                        )}

                        {item.participants && item.participants.length > 0 && (
                          <div className="flex items-center justify-end space-x-1 text-sm text-gray-600 mb-1">
                            <span>{item.participants.join(', ')}</span>
                            <Users className="w-3 h-3" />
                          </div>
                        )}

                        {item.notes && (
                          <p className="text-sm text-gray-500 italic mt-2">{item.notes}</p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-1 mr-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        {onReorder && (
                          <div className="flex-shrink-0">
                            <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                          </div>
                        )}
                        <button
                          onClick={() => onEdit(item.id)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                          title="Upravit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(item.id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                          title="Smazat"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Center Timeline Axis */}
          <div className="flex-shrink-0 w-20 relative">
            {timeMarkers.map((marker, index) => {
              const position = ((marker.minutes - bounds.start) / totalMinutes) * 100

              // Check if this time marker conflicts with any activity
              const hasActivity = timeline.some(item => {
                const itemStart = timeToMinutes(item.time)
                const itemEnd = itemStart + durationToMinutes(item.duration)
                return marker.minutes >= itemStart && marker.minutes <= itemEnd
              })

              return (
                <div
                  key={index}
                  className="absolute left-0 right-0 flex items-center justify-center z-10"
                  style={{ top: `${position}%` }}
                >
                  <div className="w-4 h-px bg-gray-400"></div>
                  <div className={`px-3 py-1 text-xs font-semibold border rounded-full shadow-md ${
                    hasActivity
                      ? 'bg-white text-gray-800 border-gray-300'
                      : 'bg-gray-100 text-gray-600 border-gray-200'
                  }`}>
                    {marker.time}
                  </div>
                  <div className="w-4 h-px bg-gray-400"></div>
                </div>
              )
            })}

            {/* Vertical Line with Activity Segments */}
            <div className="absolute left-1/2 top-0 bottom-0 w-2 transform -translate-x-1/2 bg-gray-200 rounded-full overflow-hidden">
              {/* Activity Segments on Timeline */}
              {timeline.map((item) => {
                const itemTime = timeToMinutes(item.time)
                const itemDuration = durationToMinutes(item.duration)
                const startPosition = ((itemTime - bounds.start) / totalMinutes) * 100
                const segmentHeight = (itemDuration / totalMinutes) * 100
                const endTime = itemTime + itemDuration
                const endTimeFormatted = formatTime(endTime)

                return (
                  <div
                    key={`segment-${item.id}`}
                    className={`absolute w-full ${categoryDotColors[item.category]} group relative hover:shadow-lg transition-all`}
                    style={{
                      top: `${startPosition}%`,
                      height: `${Math.max(segmentHeight, 1)}%` // Minimum 1% height
                    }}
                    title={`${item.activity} (${item.time} - ${endTimeFormatted})`}
                  >
                    {/* Gradient overlay for depth */}
                    <div className="w-full h-full bg-gradient-to-r from-white/20 via-transparent to-white/20"></div>

                    {/* Activity info on hover */}
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg whitespace-nowrap z-10">
                      <div className="font-semibold">{item.activity}</div>
                      <div className="text-gray-300">{item.time} - {endTimeFormatted}</div>
                      <div className="text-gray-400">{item.duration}</div>
                    </div>

                    {/* Start time marker */}
                    <div className="absolute -left-8 top-0 text-xs text-gray-600 font-medium bg-white px-1 rounded shadow-sm">
                      {item.time}
                    </div>

                    {/* End time marker */}
                    <div className="absolute -left-8 bottom-0 text-xs text-gray-600 font-medium bg-white px-1 rounded shadow-sm">
                      {endTimeFormatted}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right Events */}
          <div className="flex-1 relative pl-8" style={{ minHeight: '600px' }}>
            {timeline.filter((_, index) => index % 2 === 1).map((item, index) => {
              const itemTime = timeToMinutes(item.time)
              const itemDuration = durationToMinutes(item.duration)
              const startPosition = ((itemTime - bounds.start) / totalMinutes) * 100
              const durationHeight = (itemDuration / totalMinutes) * 100

              return (
                <div
                  key={item.id}
                  draggable={!!onReorder}
                  onDragStart={(e) => handleDragStart(e, item.id)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => handleDragOver(e, item.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, item.id)}
                  className={`absolute left-0 group transition-all duration-200 ${
                    onReorder ? 'cursor-move' : ''
                  } ${
                    draggedItem === item.id ? 'opacity-30 scale-95 z-50' : ''
                  } ${
                    dragOverItem === item.id ? 'transform scale-105 shadow-lg' : ''
                  } ${
                    isDragging && draggedItem !== item.id ? 'opacity-70' : ''
                  }`}
                  style={{
                    top: `${startPosition}%`,
                    width: 'calc(100% - 20px)',
                    minHeight: '80px'
                  }}
                >
                  {/* Connection Line to Timeline */}
                  <div className="absolute -left-10 top-6 w-10 h-px bg-gray-400 shadow-sm"></div>

                  {/* Event Card */}
                  <div className={`bg-white border-l-4 rounded-lg p-4 shadow-sm hover:shadow-md transition-all ${categoryColors[item.category]}`}>
                    <div className="flex items-start justify-between">
                      {/* Drag Handle */}
                      {onReorder && (
                        <div className="flex-shrink-0 mr-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                        </div>
                      )}

                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-lg">{categoryIcons[item.category]}</span>
                          <h4 className="font-semibold text-gray-900">{item.activity}</h4>
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span className="font-medium">{item.time}</span>
                          </div>
                          <div className="text-gray-500">
                            {item.duration}
                          </div>
                        </div>

                        {item.location && (
                          <div className="flex items-center space-x-1 text-sm text-gray-600 mb-1">
                            <MapPin className="w-3 h-3" />
                            <span>{item.location}</span>
                          </div>
                        )}

                        {item.participants && item.participants.length > 0 && (
                          <div className="flex items-center space-x-1 text-sm text-gray-600 mb-1">
                            <Users className="w-3 h-3" />
                            <span>{item.participants.join(', ')}</span>
                          </div>
                        )}

                        {item.notes && (
                          <p className="text-sm text-gray-500 italic mt-2">{item.notes}</p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-1 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onEdit(item.id)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                          title="Upravit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(item.id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                          title="Smazat"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Timeline Summary */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-gray-900">{timeline.length}</div>
              <div className="text-sm text-gray-600">Aktivit</div>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">
                {formatTime(bounds.start)} - {formatTime(bounds.end)}
              </div>
              <div className="text-sm text-gray-600">Časový rozsah</div>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">
                {Math.round(totalMinutes / 60)}h
              </div>
              <div className="text-sm text-gray-600">Celková doba</div>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">
                {new Set(timeline.map(item => item.category)).size}
              </div>
              <div className="text-sm text-gray-600">Kategorií</div>
            </div>
          </div>

          {/* Category Legend */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-3 justify-center">
              {Object.entries(categoryIcons).map(([category, icon]) => {
                const count = timeline.filter(item => item.category === category).length
                if (count === 0) return null

                return (
                  <div key={category} className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${categoryDotColors[category as keyof typeof categoryDotColors]}`}></div>
                    <span className="text-sm text-gray-600">
                      {icon} {category} ({count})
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
