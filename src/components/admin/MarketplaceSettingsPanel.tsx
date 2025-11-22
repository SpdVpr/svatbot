'use client'

import { useState } from 'react'
import { useMarketplaceSettings } from '@/hooks/useMarketplaceSettings'
import { useAuth } from '@/hooks/useAuth'
import { Settings, Loader2, Check, X, Sparkles } from 'lucide-react'

export default function MarketplaceSettingsPanel() {
  const { settings, loading, togglePhysicsAnimation } = useMarketplaceSettings()
  const { user } = useAuth()
  const [updating, setUpdating] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleToggle = async () => {
    if (!user) {
      setMessage({ type: 'error', text: 'Uživatel není přihlášen' })
      return
    }

    setUpdating(true)
    setMessage(null)

    // Store current state before toggle
    const currentState = settings?.enablePhysicsAnimation ?? true

    const result = await togglePhysicsAnimation(user.id)

    if (result.success) {
      setMessage({
        type: 'success',
        text: currentState
          ? 'Fyzikální animace vypnuta'
          : 'Fyzikální animace zapnuta'
      })
    } else {
      setMessage({
        type: 'error',
        text: result.error || 'Chyba při ukládání nastavení'
      })
    }

    setUpdating(false)

    // Clear message after 3 seconds
    setTimeout(() => setMessage(null), 3000)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
          <Settings className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Marketplace nastavení</h3>
          <p className="text-sm text-gray-500">Globální nastavení pro marketplace stránku</p>
        </div>
      </div>

      {/* Physics Animation Toggle */}
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <Sparkles className={`w-5 h-5 ${settings?.enablePhysicsAnimation ? 'text-purple-500' : 'text-gray-400'}`} />
            <div>
              <h4 className="font-medium text-gray-900">Fyzikální animace log</h4>
              <p className="text-sm text-gray-500">
                Interaktivní pozadí s logy dodavatelů a fyzikální simulací
              </p>
            </div>
          </div>

          <button
            onClick={handleToggle}
            disabled={updating}
            className={`
              relative inline-flex h-8 w-14 items-center rounded-full transition-colors
              ${settings?.enablePhysicsAnimation ? 'bg-purple-500' : 'bg-gray-300'}
              ${updating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <span
              className={`
                inline-block h-6 w-6 transform rounded-full bg-white transition-transform
                ${settings?.enablePhysicsAnimation ? 'translate-x-7' : 'translate-x-1'}
              `}
            />
          </button>
        </div>

        {/* Status Message */}
        {message && (
          <div className={`
            flex items-center gap-2 p-3 rounded-lg text-sm
            ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}
          `}>
            {message.type === 'success' ? (
              <Check className="w-4 h-4" />
            ) : (
              <X className="w-4 h-4" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Info */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>
            <strong>Zapnuto:</strong> Na hlavní stránce marketplace se zobrazí interaktivní pozadí s logy dodavatelů a barevnými míčky s fyzikální simulací.
          </p>
          <p>
            <strong>Vypnuto:</strong> Zobrazí se klasický statický background obrázek.
          </p>
          {settings?.lastModified && (
            <p className="mt-2 pt-2 border-t border-gray-200">
              Naposledy změněno: {settings.lastModified.toLocaleString('cs-CZ')}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

