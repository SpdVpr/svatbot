'use client'

import { useState } from 'react'
import { useDemoSettings } from '@/hooks/useDemoSettings'
import { Lock, Unlock, Calendar, User, AlertCircle, CheckCircle } from 'lucide-react'
import { format } from 'date-fns'
import { cs } from 'date-fns/locale'

export default function DemoAccountPanel() {
  const { settings, loading, toggleLock, setDemoUserId, setFixedWeddingDate } = useDemoSettings()
  const [editingUserId, setEditingUserId] = useState(false)
  const [editingDate, setEditingDate] = useState(false)
  const [userIdInput, setUserIdInput] = useState('')
  const [dateInput, setDateInput] = useState('')
  const [saving, setSaving] = useState(false)

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  const handleToggleLock = async () => {
    setSaving(true)
    await toggleLock()
    setSaving(false)
  }

  const handleSaveUserId = async () => {
    if (!userIdInput.trim()) return
    
    setSaving(true)
    const success = await setDemoUserId(userIdInput.trim())
    if (success) {
      setEditingUserId(false)
      setUserIdInput('')
    }
    setSaving(false)
  }

  const handleSaveDate = async () => {
    if (!dateInput) return
    
    setSaving(true)
    const date = new Date(dateInput)
    const success = await setFixedWeddingDate(date)
    if (success) {
      setEditingDate(false)
      setDateInput('')
    }
    setSaving(false)
  }

  const daysUntilWedding = settings?.fixedWeddingDate 
    ? Math.ceil((settings.fixedWeddingDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-lg shadow-sm border-2 border-amber-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
            settings?.isLocked ? 'bg-red-100' : 'bg-green-100'
          }`}>
            {settings?.isLocked ? (
              <Lock className="h-6 w-6 text-red-600" />
            ) : (
              <Unlock className="h-6 w-6 text-green-600" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">DEMO Účet - Správa</h3>
            <p className="text-sm text-gray-600">
              Nastavení demonstračního účtu pro návštěvníky
            </p>
          </div>
        </div>

        {/* Lock/Unlock Toggle Button */}
        <button
          onClick={handleToggleLock}
          disabled={saving}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
            settings?.isLocked
              ? 'bg-green-600 hover:bg-green-700 shadow-green-200'
              : 'bg-red-600 hover:bg-red-700 shadow-red-200'
          } shadow-lg`}
        >
          {settings?.isLocked ? (
            <>
              <Unlock className="w-5 h-5" />
              Odemknout DEMO
            </>
          ) : (
            <>
              <Lock className="w-5 h-5" />
              Zamknout DEMO
            </>
          )}
        </button>
      </div>

      {/* Status Alert */}
      <div className={`flex items-start gap-3 p-4 rounded-lg mb-6 ${
        settings?.isLocked 
          ? 'bg-red-50 border border-red-200' 
          : 'bg-green-50 border border-green-200'
      }`}>
        {settings?.isLocked ? (
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
        ) : (
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
        )}
        <div className="flex-1">
          <p className={`font-semibold ${settings?.isLocked ? 'text-red-900' : 'text-green-900'}`}>
            {settings?.isLocked ? '🔒 DEMO účet je ZAMČENÝ' : '🔓 DEMO účet je ODEMČENÝ'}
          </p>
          <p className={`text-sm mt-1 ${settings?.isLocked ? 'text-red-700' : 'text-green-700'}`}>
            {settings?.isLocked 
              ? 'Uživatelé nemohou provádět žádné změny. Pouze prohlížení.'
              : 'Můžete upravovat nastavení DEMO účtu. Nezapomeňte zamknout před zveřejněním!'
            }
          </p>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Demo User ID */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <User className="w-5 h-5 text-gray-600" />
            <h4 className="font-semibold text-gray-900">DEMO User ID</h4>
          </div>
          
          {editingUserId ? (
            <div className="space-y-2">
              <input
                type="text"
                value={userIdInput}
                onChange={(e) => setUserIdInput(e.target.value)}
                placeholder="Zadejte Firebase User ID"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveUserId}
                  disabled={saving || !userIdInput.trim()}
                  className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  Uložit
                </button>
                <button
                  onClick={() => {
                    setEditingUserId(false)
                    setUserIdInput('')
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                >
                  Zrušit
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-600 mb-2 font-mono break-all">
                {settings?.demoUserId || 'Není nastaveno'}
              </p>
              <button
                onClick={() => {
                  setEditingUserId(true)
                  setUserIdInput(settings?.demoUserId || '')
                }}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Změnit
              </button>
            </div>
          )}
        </div>

        {/* Fixed Wedding Date */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-5 h-5 text-gray-600" />
            <h4 className="font-semibold text-gray-900">Fixní datum svatby</h4>
          </div>
          
          {editingDate ? (
            <div className="space-y-2">
              <input
                type="date"
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveDate}
                  disabled={saving || !dateInput}
                  className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  Uložit
                </button>
                <button
                  onClick={() => {
                    setEditingDate(false)
                    setDateInput('')
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                >
                  Zrušit
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-900 font-semibold mb-1">
                {settings?.fixedWeddingDate 
                  ? format(settings.fixedWeddingDate, 'd. MMMM yyyy', { locale: cs })
                  : 'Není nastaveno'
                }
              </p>
              <p className="text-sm text-gray-600 mb-2">
                Za {daysUntilWedding} dní
              </p>
              <button
                onClick={() => {
                  setEditingDate(true)
                  if (settings?.fixedWeddingDate) {
                    setDateInput(format(settings.fixedWeddingDate, 'yyyy-MM-dd'))
                  }
                }}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Změnit
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Last Modified */}
      {settings?.lastModified && (
        <div className="mt-4 pt-4 border-t border-amber-200">
          <p className="text-xs text-gray-500 text-center">
            Naposledy upraveno: {format(settings.lastModified, 'd. M. yyyy HH:mm', { locale: cs })}
          </p>
        </div>
      )}
    </div>
  )
}

