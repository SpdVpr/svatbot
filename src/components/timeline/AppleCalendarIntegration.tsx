'use client'

import { useState } from 'react'
import { Calendar, Download, CheckCircle, AlertCircle, Smartphone, Monitor, ExternalLink, Settings, RefreshCw } from 'lucide-react'
import { useAppleCalendar, createICalEventsFromMilestones } from '@/hooks/useAppleCalendar'
import { useTimeline } from '@/hooks/useTimeline'
import { useWedding } from '@/hooks/useWedding'

interface AppleCalendarIntegrationProps {
  onSync?: () => void
}

export default function AppleCalendarIntegration({ onSync }: AppleCalendarIntegrationProps) {
  const {
    isSupported,
    isLoading,
    error,
    downloadEvent,
    downloadCalendar,
    getCalendarAppName,
    isAppleDevice
  } = useAppleCalendar()

  const { milestones } = useTimeline()
  const { wedding } = useWedding()
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'downloading' | 'success' | 'error'>('idle')
  const [showCalDAVSetup, setShowCalDAVSetup] = useState(false)
  const [caldavCredentials, setCaldavCredentials] = useState({ username: '', password: '' })
  const [isCalDAVConnected, setIsCalDAVConnected] = useState(false)

  const calendarAppName = getCalendarAppName()
  const isApple = isAppleDevice()

  const handleDownloadCalendar = async () => {
    if (!milestones || milestones.length === 0) return

    setDownloadStatus('downloading')

    try {
      const icalEvents = createICalEventsFromMilestones(milestones)
      const calendarName = wedding ? `Svatba ${wedding.brideName} & ${wedding.groomName}` : 'Svatební plánování'
      
      downloadCalendar(icalEvents, calendarName, 'svatebni_kalendar.ics')
      setDownloadStatus('success')
      onSync?.()

      setTimeout(() => setDownloadStatus('idle'), 3000)
    } catch (error) {
      console.error('Download error:', error)
      setDownloadStatus('error')
      setTimeout(() => setDownloadStatus('idle'), 3000)
    }
  }

  const getDownloadButtonText = () => {
    switch (downloadStatus) {
      case 'downloading': return 'Stahuji...'
      case 'success': return 'Staženo!'
      case 'error': return 'Chyba stahování'
      default: return 'Stáhnout kalendář'
    }
  }

  const getDownloadButtonIcon = () => {
    switch (downloadStatus) {
      case 'downloading': return <Download className="w-4 h-4 animate-pulse" />
      case 'success': return <CheckCircle className="w-4 h-4" />
      case 'error': return <AlertCircle className="w-4 h-4" />
      default: return <Download className="w-4 h-4" />
    }
  }

  if (!isSupported) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center py-6">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            Nepodporováno
          </h4>
          <p className="text-gray-600">
            Stahování kalendáře není v tomto prostředí podporováno.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-blue-100">
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Stáhnout kalendář</h3>
            <p className="text-sm text-gray-600">
              (.ics soubor)
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 text-blue-600">
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-medium">iCal</span>
          </div>
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
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900">Univerzální kompatibilita</p>
              <p className="text-sm text-blue-700 mt-1">
                Funguje s Apple Calendar, Google Calendar, Outlook, Thunderbird a většinou ostatních kalendářových aplikací.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleDownloadCalendar}
            disabled={isLoading || downloadStatus === 'downloading' || !milestones?.length}
            className={`w-full inline-flex items-center justify-center px-4 py-3 rounded-lg font-medium ${
              downloadStatus === 'success'
                ? 'bg-green-600 text-white'
                : downloadStatus === 'error'
                ? 'bg-red-600 text-white'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {getDownloadButtonIcon()}
            <span className="ml-2">{getDownloadButtonText()}</span>
          </button>

          {milestones && milestones.length > 0 && (
            <div className="text-sm text-gray-600 text-center">
              <p>Připraveno ke stažení: <strong>{milestones.length} milníků</strong></p>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Jak na to:</h4>
          <ol className="text-sm text-gray-600 space-y-1">
            <li>1. Klikněte na tlačítko "Stáhnout"</li>
            <li>2. Otevřete stažený .ics soubor</li>
            <li>3. Události se automaticky přidají do vašeho kalendáře</li>
          </ol>
        </div>


      </div>
    </div>
  )
}
