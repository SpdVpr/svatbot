'use client'

import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns'
import { cs } from 'date-fns/locale'
import { AggregatedEvent } from '@/types/calendar'

interface CalendarViewProps {
  events: AggregatedEvent[]
  onDateClick?: (date: Date) => void
  onEventClick?: (event: AggregatedEvent) => void
  selectedDate?: Date
}

const eventTypeColors: Record<string, string> = {
  task: 'bg-blue-100 text-blue-800 border-blue-200',
  appointment: 'bg-purple-100 text-purple-800 border-purple-200',
  deadline: 'bg-red-100 text-red-800 border-red-200',
  'wedding-day': 'bg-pink-100 text-pink-800 border-pink-200',
  'vendor-meeting': 'bg-green-100 text-green-800 border-green-200',
  'venue-visit': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  tasting: 'bg-orange-100 text-orange-800 border-orange-200',
  fitting: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  rehearsal: 'bg-violet-100 text-violet-800 border-violet-200',
  custom: 'bg-gray-100 text-gray-800 border-gray-200',
  other: 'bg-gray-100 text-gray-800 border-gray-200'
}

export default function CalendarView({ events, onDateClick, onEventClick, selectedDate }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(selectedDate || new Date())

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }) // Monday
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  // Group events by date
  const eventsByDate = useMemo(() => {
    const grouped: { [key: string]: AggregatedEvent[] } = {}

    events.forEach(aggEvent => {
      const dateKey = format(aggEvent.event.startDate, 'yyyy-MM-dd')
      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      grouped[dateKey].push(aggEvent)
    })

    return grouped
  }, [events])

  const getEventsForDay = (day: Date) => {
    const dateKey = format(day, 'yyyy-MM-dd')
    return eventsByDate[dateKey] || []
  }

  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1))
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  const isToday = (day: Date) => {
    return isSameDay(day, new Date())
  }

  const isSelected = (day: Date) => {
    return selectedDate && isSameDay(day, selectedDate)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {format(currentDate, 'LLLL yyyy', { locale: cs })}
          </h2>
          <button
            onClick={handleToday}
            className="px-3 py-1 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
          >
            Dnes
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            aria-label="Předchozí měsíc"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            aria-label="Následující měsíc"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'].map((day) => (
            <div
              key={day}
              className="text-center text-sm font-medium text-gray-500 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day) => {
            const dayEvents = getEventsForDay(day)
            const isCurrentMonth = isSameMonth(day, currentDate)
            const isTodayDate = isToday(day)
            const isSelectedDate = isSelected(day)

            return (
              <div
                key={day.toISOString()}
                onClick={() => onDateClick?.(day)}
                className={`
                  min-h-[100px] p-2 border rounded-lg cursor-pointer transition-all
                  ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
                  ${isTodayDate ? 'border-primary-500 border-2' : 'border-gray-200'}
                  ${isSelectedDate ? 'ring-2 ring-primary-300' : ''}
                  hover:shadow-md hover:border-primary-300
                `}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`
                      text-sm font-medium
                      ${!isCurrentMonth ? 'text-gray-400' : 'text-gray-900'}
                      ${isTodayDate ? 'text-primary-600 font-bold' : ''}
                    `}
                  >
                    {format(day, 'd')}
                  </span>
                  {dayEvents.length > 0 && (
                    <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                      {dayEvents.length}
                    </span>
                  )}
                </div>

                {/* Events for this day */}
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map((aggEvent) => {
                    const colorClass = eventTypeColors[aggEvent.event.type] || eventTypeColors.other
                    
                    return (
                      <div
                        key={aggEvent.event.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          onEventClick?.(aggEvent)
                        }}
                        className={`
                          text-xs px-2 py-1 rounded border truncate
                          ${colorClass}
                          hover:shadow-sm transition-shadow
                        `}
                        title={aggEvent.event.title}
                      >
                        {aggEvent.event.startTime && (
                          <span className="font-medium mr-1">
                            {aggEvent.event.startTime}
                          </span>
                        )}
                        {aggEvent.event.title}
                      </div>
                    )
                  })}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-gray-500 px-2">
                      +{dayEvents.length - 3} další
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
        <div className="flex flex-wrap gap-3 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded border-2 border-primary-500"></div>
            <span className="text-gray-600">Dnes</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded bg-blue-100 border border-blue-200"></div>
            <span className="text-gray-600">Úkol</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded bg-green-100 border border-green-200"></div>
            <span className="text-gray-600">Schůzka</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded bg-pink-100 border border-pink-200"></div>
            <span className="text-gray-600">Svatební den</span>
          </div>
        </div>
      </div>
    </div>
  )
}

