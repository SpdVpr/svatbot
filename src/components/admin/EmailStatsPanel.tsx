'use client'

import { useEffect, useState } from 'react'
import { 
  EnvelopeIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ClockIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

interface EmailStats {
  last30Days: {
    total: number
    sent: number
    failed: number
    successRate: number
  }
  today: {
    total: number
    sent: number
    failed: number
  }
  byType: {
    registration: number
    payment_success: number
    trial_reminder: number
    trial_expired: number
    other: number
  }
}

export default function EmailStatsPanel() {
  const [stats, setStats] = useState<EmailStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchEmailStats()
  }, [])

  const fetchEmailStats = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get Firebase auth token
      const { auth } = await import('@/config/firebase')
      const user = auth.currentUser
      
      if (!user) {
        throw new Error('Not authenticated')
      }

      const token = await user.getIdToken()

      const response = await fetch(
        'https://europe-west1-svatbot-app.cloudfunctions.net/api/v1/admin/email-stats/summary',
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch email stats')
      }

      const data = await response.json()
      setStats(data.data)
    } catch (err) {
      console.error('Error fetching email stats:', err)
      setError(err instanceof Error ? err.message : 'Failed to load email statistics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-3 mb-4">
          <EnvelopeIcon className="h-6 w-6 text-purple-600" />
          <h2 className="text-xl font-semibold text-gray-900">Statistiky emailů</h2>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-3 mb-4">
          <EnvelopeIcon className="h-6 w-6 text-purple-600" />
          <h2 className="text-xl font-semibold text-gray-900">Statistiky emailů</h2>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={fetchEmailStats}
            className="mt-2 text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Zkusit znovu
          </button>
        </div>
      </div>
    )
  }

  if (!stats) {
    return null
  }

  const emailTypes = [
    { key: 'registration', label: 'Registrace', color: 'bg-blue-100 text-blue-800' },
    { key: 'payment_success', label: 'Platby', color: 'bg-green-100 text-green-800' },
    { key: 'trial_reminder', label: 'Trial upozornění', color: 'bg-yellow-100 text-yellow-800' },
    { key: 'trial_expired', label: 'Trial vypršel', color: 'bg-red-100 text-red-800' },
    { key: 'other', label: 'Ostatní', color: 'bg-gray-100 text-gray-800' }
  ]

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <EnvelopeIcon className="h-6 w-6 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">Statistiky emailů</h2>
          </div>
          <button
            onClick={fetchEmailStats}
            className="text-sm text-purple-600 hover:text-purple-700 font-medium"
          >
            Obnovit
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Today's Stats */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-3">Dnes</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-1">
                <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-600">Celkem</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.today.total}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-1">
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
                <span className="text-sm text-green-600">Odesláno</span>
              </div>
              <p className="text-2xl font-bold text-green-900">{stats.today.sent}</p>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-1">
                <XCircleIcon className="h-5 w-5 text-red-600" />
                <span className="text-sm text-red-600">Selhalo</span>
              </div>
              <p className="text-2xl font-bold text-red-900">{stats.today.failed}</p>
            </div>
          </div>
        </div>

        {/* Last 30 Days Stats */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-3">Posledních 30 dní</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-1">
                <EnvelopeIcon className="h-5 w-5 text-purple-600" />
                <span className="text-sm text-purple-600">Celkem</span>
              </div>
              <p className="text-2xl font-bold text-purple-900">{stats.last30Days.total}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-1">
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
                <span className="text-sm text-green-600">Odesláno</span>
              </div>
              <p className="text-2xl font-bold text-green-900">{stats.last30Days.sent}</p>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-1">
                <XCircleIcon className="h-5 w-5 text-red-600" />
                <span className="text-sm text-red-600">Selhalo</span>
              </div>
              <p className="text-2xl font-bold text-red-900">{stats.last30Days.failed}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-1">
                <ChartBarIcon className="h-5 w-5 text-blue-600" />
                <span className="text-sm text-blue-600">Úspěšnost</span>
              </div>
              <p className="text-2xl font-bold text-blue-900">{stats.last30Days.successRate}%</p>
            </div>
          </div>
        </div>

        {/* By Type */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-3">Podle typu (30 dní)</h3>
          <div className="space-y-2">
            {emailTypes.map((type) => {
              const count = stats.byType[type.key as keyof typeof stats.byType]
              const percentage = stats.last30Days.total > 0 
                ? Math.round((count / stats.last30Days.total) * 100)
                : 0

              return (
                <div key={type.key} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${type.color}`}>
                      {type.label}
                    </span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <span className="text-sm font-medium text-gray-900">{count}</span>
                    <span className="text-xs text-gray-500">({percentage}%)</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <ClockIcon className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-blue-900 font-medium">Automatické odesílání</p>
              <p className="text-sm text-blue-700 mt-1">
                Emaily se odesílají automaticky při registraci, platbě a 2 dny před koncem trial období.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

