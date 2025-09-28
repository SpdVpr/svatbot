'use client'

import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Calendar, Clock, MapPin } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths } from 'date-fns'
import { cs } from 'date-fns/locale'

interface TimelineEvent {
  id: string
  title: string
  startTime: string
  endTime: string
  type: string
  location?: string
  description?: string
  date?: Date
}

interface Milestone {
  id: string
  title: string
  description?: string
  type: string
  targetDate?: Date
  priority: 'low' | 'medium' | 'high' | 'critical'
  isRequired: boolean
  reminderDays?: number[]
  notes?: string
  tags?: string[]
  dependsOn?: string[]
}

interface TimelineCalendarProps {
  events: TimelineEvent[]
  milestones?: Milestone[]
  weddingDate?: string
  onEventClick?: (event: TimelineEvent) => void
}

const eventTypeColors = {
  preparation: 'bg-pink-100 text-pink-800 border-pink-200',
  ceremony: 'bg-purple-100 text-purple-800 border-purple-200',
  reception: 'bg-blue-100 text-blue-800 border-blue-200',
  party: 'bg-green-100 text-green-800 border-green-200',
  other: 'bg-gray-100 text-gray-800 border-gray-200'
}

export default function TimelineCalendar({ events, milestones, weddingDate, onEventClick }: TimelineCalendarProps) {
  const [currentDate, setCurrentDate] = useState(() => {
    if (weddingDate) {
      return new Date(weddingDate)
    }
    return new Date()
  })

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Group events by their actual dates
  const eventsByDate = useMemo(() => {
    const grouped: { [key: string]: TimelineEvent[] } = {}

    if (milestones && milestones.length > 0) {
      milestones.forEach(milestone => {
        if (milestone.targetDate) {
          const eventDate = new Date(milestone.targetDate)
          const dateKey = format(eventDate, 'yyyy-MM-dd')

          if (!grouped[dateKey]) {
            grouped[dateKey] = []
          }

          // Create event from milestone
          const event: TimelineEvent = {
            id: milestone.id,
            title: milestone.title,
            startTime: eventDate.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' }),
            endTime: new Date(eventDate.getTime() + 60*60*1000).toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' }),
            type: milestone.type,
            location: '',
            description: milestone.description,
            date: eventDate
          }

          grouped[dateKey].push(event)
        }
      })
    }

    return grouped
  }, [milestones])

  const getEventsForDay = (day: Date) => {
    const dateKey = format(day, 'yyyy-MM-dd')
    return eventsByDate[dateKey] || []
  }

  const isWeddingDay = (day: Date) => {
    return weddingDate && isSameDay(day, new Date(weddingDate))
  }

  const goToPreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1))
  }

  const goToWeddingMonth = () => {
    if (weddingDate) {
      setCurrentDate(new Date(weddingDate))
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Calendar className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Kalendář událostí</h3>
            <p className="text-sm text-gray-600">
              {format(currentDate, 'MMMM yyyy', { locale: cs })}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {weddingDate && !isSameMonth(currentDate, new Date(weddingDate)) && (
            <button
              onClick={goToWeddingMonth}
              className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
            >
              Svatební den
            </button>
          )}
          
          <button
            onClick={goToPreviousMonth}
            className="p-2 bg-gray-600 text-white hover:bg-gray-500 rounded-lg"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={goToNextMonth}
            className="p-2 bg-gray-600 text-white hover:bg-gray-500 rounded-lg"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {/* Day headers */}
        {['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'].map((day) => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-600">
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {calendarDays.map((day) => {
          const dayEvents = getEventsForDay(day)
          const isWedding = isWeddingDay(day)
          const isCurrentMonth = isSameMonth(day, currentDate)

          return (
            <div
              key={day.toISOString()}
              className={`min-h-[80px] p-1 border border-gray-100 ${
                isCurrentMonth ? 'bg-white' : 'bg-gray-50'
              } ${isWedding ? 'ring-2 ring-purple-500 bg-purple-50' : ''}`}
            >
              <div className={`text-sm font-medium mb-1 ${
                isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
              } ${isWedding ? 'text-purple-900' : ''}`}>
                {format(day, 'd')}
              </div>

              {dayEvents.length > 0 && (
                <div className="space-y-1">
                  {dayEvents.slice(0, 2).map((event) => (
                    <button
                      key={event.id}
                      onClick={() => onEventClick?.(event)}
                      className={`w-full text-left p-1 rounded text-xs border ${
                        eventTypeColors[event.type as keyof typeof eventTypeColors] || eventTypeColors.other
                      } hover:opacity-80 transition-opacity`}
                    >
                      <div className="font-medium truncate">{event.title}</div>
                      <div className="flex items-center space-x-1 text-xs opacity-75">
                        <Clock className="w-3 h-3" />
                        <span>{event.startTime}</span>
                      </div>
                    </button>
                  ))}
                  
                  {dayEvents.length > 2 && (
                    <div className="text-xs text-gray-600 text-center">
                      +{dayEvents.length - 2} dalších
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-pink-100 border border-pink-200 rounded"></div>
          <span className="text-sm text-gray-600">Příprava</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-purple-100 border border-purple-200 rounded"></div>
          <span className="text-sm text-gray-600">Obřad</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-100 border border-blue-200 rounded"></div>
          <span className="text-sm text-gray-600">Hostina</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-100 border border-green-200 rounded"></div>
          <span className="text-sm text-gray-600">Zábava</span>
        </div>
      </div>

      {weddingDate && (
        <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">
              Svatební den: {format(new Date(weddingDate), 'd. MMMM yyyy', { locale: cs })}
            </span>
          </div>
          {events && events.length > 0 && (
            <p className="text-sm text-purple-700 mt-1">
              Naplánováno {events.length} událostí
            </p>
          )}
        </div>
      )}
    </div>
  )
}
