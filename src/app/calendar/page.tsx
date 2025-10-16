'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useWedding } from '@/hooks/useWedding'
import { useCalendar } from '@/hooks/useCalendar'
import CalendarView from '@/components/calendar/CalendarView'
import EventDetailModal from '@/components/calendar/EventDetailModal'
import { generateICalendar, downloadICalFile, generateCSV, downloadCSVFile, openInGoogleCalendar } from '@/lib/calendarExport'
import { AggregatedEvent, CalendarEvent } from '@/types/calendar'
import {
  Calendar,
  Download,
  Plus,
  List,
  Grid,
  ArrowLeft,
  Home,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Filter,
  X
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { cs } from 'date-fns/locale'

export default function CalendarPage() {
  const { user } = useAuth()
  const { wedding } = useWedding()
  const { events, stats, loading, error } = useCalendar()
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [selectedEvent, setSelectedEvent] = useState<AggregatedEvent | null>(null)
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')
  const [showExportMenu, setShowExportMenu] = useState(false)

  if (!user) {
    return (
      <div className="min-h-screen wedding-gradient flex items-center justify-center">
        <div className="text-center">
          <Calendar className="w-16 h-16 text-primary-500 mx-auto mb-4" />
          <h2 className="heading-3 mb-2">Přihlaste se pro kalendář</h2>
          <p className="body-large text-text-muted mb-6">
            Kalendář je dostupný pouze pro přihlášené uživatele
          </p>
          <Link href="/" className="btn-primary">
            Přihlásit se
          </Link>
        </div>
      </div>
    )
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
  }

  const handleEventClick = (event: AggregatedEvent) => {
    setSelectedEvent(event)
  }

  const handleExportICalendar = () => {
    const icalContent = generateICalendar(events.map(e => e.event))
    downloadICalFile(icalContent, 'svatba-kalendar.ics')
    setShowExportMenu(false)
  }

  const handleExportCSV = () => {
    const csvContent = generateCSV(events.map(e => e.event))
    downloadCSVFile(csvContent, 'svatba-kalendar.csv')
    setShowExportMenu(false)
  }

  const handleExportGoogleCalendar = () => {
    if (selectedEvent) {
      openInGoogleCalendar(selectedEvent.event)
    }
    setShowExportMenu(false)
  }

  // Get events for selected date
  const selectedDateEvents = selectedDate
    ? events.filter(e => {
        const eventDate = new Date(e.event.startDate)
        return (
          eventDate.getDate() === selectedDate.getDate() &&
          eventDate.getMonth() === selectedDate.getMonth() &&
          eventDate.getFullYear() === selectedDate.getFullYear()
        )
      })
    : []

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Zpět na dashboard"
              >
                <Home className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="heading-2 flex items-center space-x-2">
                  <Calendar className="w-8 h-8 text-primary-500" />
                  <span>Kalendář</span>
                </h1>
                <p className="body-small text-text-muted mt-1">
                  Všechny události a úkoly na jednom místě
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* View Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`
                    px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                    ${viewMode === 'calendar' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}
                  `}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`
                    px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                    ${viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}
                  `}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Export Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button>

                {showExportMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                    <button
                      onClick={handleExportICalendar}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>iCalendar (.ics)</span>
                    </button>
                    <button
                      onClick={handleExportCSV}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>CSV</span>
                    </button>
                    <button
                      onClick={handleExportGoogleCalendar}
                      disabled={!selectedEvent}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Google Calendar</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Celkem událostí</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalEvents}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Dnes</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.todayEvents}</p>
              </div>
              <Clock className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tento týden</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.thisWeekEvents}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Po termínu</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{stats.overdueEvents}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </div>

        {/* Calendar View */}
        {viewMode === 'calendar' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <CalendarView
                events={events}
                onDateClick={handleDateClick}
                onEventClick={handleEventClick}
                selectedDate={selectedDate}
              />
            </div>

            {/* Sidebar - Selected Date Events */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-4">
                {selectedDate
                  ? format(selectedDate, 'd. MMMM yyyy', { locale: cs })
                  : 'Vyberte datum'}
              </h3>

              {selectedDateEvents.length > 0 ? (
                <div className="space-y-3">
                  {selectedDateEvents.map((aggEvent) => (
                    <div
                      key={aggEvent.event.id}
                      onClick={() => setSelectedEvent(aggEvent)}
                      className="p-3 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-sm cursor-pointer transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 text-sm">
                            {aggEvent.event.title}
                          </h4>
                          {aggEvent.event.startTime && (
                            <p className="text-xs text-gray-500 mt-1">
                              {aggEvent.event.startTime}
                              {aggEvent.event.endTime && ` - ${aggEvent.event.endTime}`}
                            </p>
                          )}
                          {aggEvent.event.location && (
                            <p className="text-xs text-gray-500 mt-1">
                              📍 {aggEvent.event.location}
                            </p>
                          )}
                        </div>
                        {aggEvent.event.isCompleted && (
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-8">
                  {selectedDate ? 'Žádné události' : 'Vyberte datum pro zobrazení událostí'}
                </p>
              )}
            </div>
          </div>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Všechny události</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {events.map((aggEvent) => (
                <div
                  key={aggEvent.event.id}
                  onClick={() => setSelectedEvent(aggEvent)}
                  className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {aggEvent.event.title}
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">
                        {format(aggEvent.event.startDate, 'd. MMMM yyyy', { locale: cs })}
                        {aggEvent.event.startTime && ` • ${aggEvent.event.startTime}`}
                      </p>
                      {aggEvent.event.location && (
                        <p className="text-sm text-gray-500 mt-1">
                          📍 {aggEvent.event.location}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`
                        px-2 py-1 text-xs rounded-full
                        ${aggEvent.event.priority === 'critical' ? 'bg-red-100 text-red-800' : ''}
                        ${aggEvent.event.priority === 'high' ? 'bg-orange-100 text-orange-800' : ''}
                        ${aggEvent.event.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${aggEvent.event.priority === 'low' ? 'bg-gray-100 text-gray-800' : ''}
                      `}>
                        {aggEvent.event.priority}
                      </span>
                      {aggEvent.event.isCompleted && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Event Detail Modal */}
        {selectedEvent && (
          <EventDetailModal
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
          />
        )}
      </main>
    </div>
  )
}

