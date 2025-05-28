'use client'

import { useState } from 'react'
import { useGoogleCalendar, createCalendarEventsFromTasks, createWeddingCalendarEvent, createVendorMeetingEvents } from '@/hooks/useGoogleCalendar'
import { useTask } from '@/hooks/useTask'
import { useVendor } from '@/hooks/useVendor'
import { useWedding } from '@/hooks/useWedding'
import {
  Calendar,
  CheckCircle,
  AlertCircle,
  RotateCw as Sync,
  Settings,
  ExternalLink,
  Clock,
  Users,
  MapPin
} from 'lucide-react'

export default function GoogleCalendarIntegration() {
  const [syncInProgress, setSyncInProgress] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)

  const {
    isConnected,
    isLoading,
    error,
    connect,
    disconnect,
    syncAllEvents
  } = useGoogleCalendar()

  const { tasks } = useTask()
  const { vendors } = useVendor()
  const { wedding } = useWedding()

  // Handle Google Calendar connection
  const handleConnect = async () => {
    const success = await connect()
    if (success) {
      console.log('Google Calendar connected successfully')
    }
  }

  // Handle sync all events
  const handleSyncAll = async () => {
    if (!isConnected) return

    setSyncInProgress(true)
    try {
      // Create events from tasks
      const taskEvents = createCalendarEventsFromTasks(tasks, wedding?.weddingDate ? wedding.weddingDate.toISOString() : undefined)

      // Create wedding event
      const weddingEvents = wedding?.weddingDate ? [
        createWeddingCalendarEvent(wedding, wedding.venue?.name)
      ] : []

      // Create vendor meeting events
      const vendorEvents = createVendorMeetingEvents(vendors)

      // Combine all events
      const allEvents = [...taskEvents, ...weddingEvents, ...vendorEvents]

      await syncAllEvents(allEvents)
      setLastSyncTime(new Date())
    } catch (error) {
      console.error('Sync error:', error)
    } finally {
      setSyncInProgress(false)
    }
  }

  // Calculate sync statistics
  const syncStats = {
    tasks: tasks.filter(t => t.dueDate).length,
    vendors: vendors.filter(v => (v as any).meetingDate).length,
    wedding: wedding?.weddingDate ? 1 : 0,
    total: tasks.filter(t => t.dueDate).length + vendors.filter(v => (v as any).meetingDate).length + (wedding?.weddingDate ? 1 : 0)
  }

  return (
    <div className="wedding-card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Calendar className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="heading-4">Google Calendar</h3>
            <p className="body-small text-text-muted">
              Synchronizujte svatební události s vaším kalendářem
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {isConnected ? (
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Připojeno</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-gray-500">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Nepřipojeno</span>
            </div>
          )}
        </div>
      </div>

      {/* Connection Status */}
      {!isConnected ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-blue-900 mb-1">
                Připojte Google Calendar
              </h4>
              <p className="text-sm text-blue-700 mb-3">
                Automaticky synchronizujte všechny svatební události, úkoly a schůzky s dodavateli do vašeho Google Calendar.
              </p>
              <button
                onClick={handleConnect}
                disabled={isLoading}
                className="btn-primary flex items-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Připojování...</span>
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-4 h-4" />
                    <span>Připojit Google Calendar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Sync Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-primary-600">{syncStats.tasks}</div>
              <div className="text-sm text-gray-600">Úkoly</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-primary-600">{syncStats.vendors}</div>
              <div className="text-sm text-gray-600">Schůzky</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-primary-600">{syncStats.wedding}</div>
              <div className="text-sm text-gray-600">Svatba</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-primary-600">{syncStats.total}</div>
              <div className="text-sm text-gray-600">Celkem</div>
            </div>
          </div>

          {/* Sync Actions */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <button
              onClick={handleSyncAll}
              disabled={syncInProgress || syncStats.total === 0}
              className="flex-1 btn-primary flex items-center justify-center space-x-2"
            >
              {syncInProgress ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Synchronizuji...</span>
                </>
              ) : (
                <>
                  <Sync className="w-4 h-4" />
                  <span>Synchronizovat vše</span>
                </>
              )}
            </button>

            <button
              onClick={disconnect}
              className="btn-outline flex items-center justify-center space-x-2"
            >
              <Settings className="w-4 h-4" />
              <span>Odpojit</span>
            </button>
          </div>

          {/* Last Sync Info */}
          {lastSyncTime && (
            <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
              <Clock className="w-4 h-4" />
              <span>
                Poslední synchronizace: {lastSyncTime.toLocaleString('cs-CZ')}
              </span>
            </div>
          )}

          {/* Sync Preview */}
          {syncStats.total > 0 && (
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium mb-3">Co bude synchronizováno:</h4>
              <div className="space-y-2">
                {wedding?.weddingDate && (
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>Svatební obřad - {new Date(wedding.weddingDate).toLocaleDateString('cs-CZ')}</span>
                  </div>
                )}

                {tasks.filter(t => t.dueDate).slice(0, 3).map(task => (
                  <div key={task.id} className="flex items-center space-x-3 text-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>{task.title} - {new Date(task.dueDate!).toLocaleDateString('cs-CZ')}</span>
                  </div>
                ))}

                {vendors.filter(v => (v as any).meetingDate).slice(0, 2).map(vendor => (
                  <div key={vendor.id} className="flex items-center space-x-3 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Schůzka s {vendor.name} - {new Date((vendor as any).meetingDate!).toLocaleDateString('cs-CZ')}</span>
                  </div>
                ))}

                {syncStats.total > 6 && (
                  <div className="text-sm text-gray-500 ml-5">
                    ... a dalších {syncStats.total - 6} událostí
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-red-900 mb-1">Chyba synchronizace</h4>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Jak to funguje:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Všechny úkoly s termínem se přidají jako události</li>
          <li>• Schůzky s dodavateli se synchronizují automaticky</li>
          <li>• Svatební obřad se přidá jako celodenní událost</li>
          <li>• Připomínky se nastaví automaticky (1 den a 1 hodina předem)</li>
        </ul>
      </div>
    </div>
  )
}
