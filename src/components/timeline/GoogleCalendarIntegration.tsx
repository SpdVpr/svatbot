'use client'

import { useState } from 'react'
import { Calendar, RefreshCw, CheckCircle, AlertCircle, ExternalLink, Settings } from 'lucide-react'
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar'
import { useTimeline } from '@/hooks/useTimeline'
import { useWedding } from '@/hooks/useWedding'

interface GoogleCalendarIntegrationProps {
  onSync?: () => void
}

export default function GoogleCalendarIntegration({ onSync }: GoogleCalendarIntegrationProps) {
  const { isConnected, isLoading, error, connect, disconnect, syncAllEvents } = useGoogleCalendar()
  const { milestones } = useTimeline()
  const { wedding } = useWedding()
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle')

  const handleConnect = async () => {
    const success = await connect()
    if (success) {
      onSync?.()
    }
  }

  const handleDisconnect = () => {
    disconnect()
    onSync?.()
  }

  const handleSyncEvents = async () => {
    if (!milestones || milestones.length === 0) return

    setSyncStatus('syncing')

    try {
      // Convert milestones to calendar events
      const calendarEvents = milestones.map(milestone => ({
        id: `milestone-${milestone.id}`,
        type: 'milestone' as const,
        title: milestone.title,
        description: milestone.description || `Svatební milník: ${milestone.title}`,
        date: milestone.targetDate ? new Date(milestone.targetDate) : new Date(),
        endDate: milestone.targetDate ? new Date(new Date(milestone.targetDate).getTime() + 60*60*1000) : new Date(Date.now() + 60*60*1000),
        location: '',
        attendees: []
      }))

      await syncAllEvents(calendarEvents)
      setSyncStatus('success')
      onSync?.()

      setTimeout(() => setSyncStatus('idle'), 3000)
    } catch (error) {
      console.error('Sync error:', error)
      setSyncStatus('error')
      setTimeout(() => setSyncStatus('idle'), 3000)
    }
  }

  const getSyncButtonText = () => {
    switch (syncStatus) {
      case 'syncing': return 'Synchronizuji...'
      case 'success': return 'Synchronizováno!'
      case 'error': return 'Chyba synchronizace'
      default: return 'Synchronizovat události'
    }
  }

  const getSyncButtonIcon = () => {
    switch (syncStatus) {
      case 'syncing': return <RefreshCw className="w-4 h-4 animate-spin" />
      case 'success': return <CheckCircle className="w-4 h-4" />
      case 'error': return <AlertCircle className="w-4 h-4" />
      default: return <RefreshCw className="w-4 h-4" />
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Google Calendar</h3>
            <p className="text-sm text-gray-600">
              {isConnected ? 'Připojeno' : 'Nepřipojeno'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {isConnected && (
            <div className="flex items-center space-x-1 text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Aktivní</span>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span className="text-sm text-red-800">{error}</span>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {!isConnected ? (
          <div className="text-center py-6">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              Připojte Google Calendar
            </h4>
            <p className="text-gray-600 mb-6">
              Synchronizujte své svatební události s Google Calendar pro lepší přehled a připomínky.
            </p>
            <button
              onClick={handleConnect}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <ExternalLink className="w-4 h-4 mr-2" />
              )}
              {isLoading ? 'Připojuji...' : 'Připojit Google Calendar'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">Google Calendar připojen</p>
                  <p className="text-sm text-green-700">
                    Můžete synchronizovat své svatební události
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleSyncEvents}
                disabled={isLoading || syncStatus === 'syncing' || !milestones?.length}
                className={`flex-1 inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium ${
                  syncStatus === 'success'
                    ? 'bg-green-600 text-white'
                    : syncStatus === 'error'
                    ? 'bg-red-600 text-white'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {getSyncButtonIcon()}
                <span className="ml-2">{getSyncButtonText()}</span>
              </button>

              <button
                onClick={handleDisconnect}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                <Settings className="w-4 h-4 mr-2" />
                Odpojit
              </button>
            </div>

            {milestones && milestones.length > 0 && (
              <div className="text-sm text-gray-600">
                <p>Připraveno k synchronizaci: <strong>{milestones.length} milníků</strong></p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
