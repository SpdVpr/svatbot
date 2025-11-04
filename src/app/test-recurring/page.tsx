'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useSubscription } from '@/hooks/useSubscription'
import { RefreshCw, CheckCircle, XCircle, Clock, Crown } from 'lucide-react'

export default function TestRecurringPage() {
  const { user } = useAuth()
  const { subscription, loading: subLoading } = useSubscription()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSimulate = async () => {
    if (!user) {
      setError('Musíte být přihlášeni')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/gopay/simulate-recurring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Chyba při simulaci')
      }

      setResult(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Přihlášení vyžadováno
          </h1>
          <p className="text-gray-600">
            Pro testování opakovaných plateb se musíte přihlásit.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <RefreshCw className="w-8 h-8 text-primary-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Test Opakovaných Plateb
            </h1>
          </div>
          <p className="text-gray-600">
            Tento nástroj simuluje automatickou opakovanou platbu GoPay.
            Použijte ho pro testování, jak se předplatné prodlužuje.
          </p>
        </div>

        {/* Current Subscription */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Aktuální předplatné
          </h2>

          {subLoading ? (
            <div className="flex items-center gap-2 text-gray-600">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Načítání...</span>
            </div>
          ) : subscription ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-primary-600" fill="currentColor" />
                <span className="font-semibold text-gray-900">
                  {subscription.plan === 'premium_monthly' && 'Premium Měsíční'}
                  {subscription.plan === 'premium_yearly' && 'Premium Roční'}
                  {subscription.plan === 'free_trial' && 'Zkušební období'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Status:</span>
                  <span className={`ml-2 font-medium ${
                    subscription.status === 'active' ? 'text-green-600' : 'text-amber-600'
                  }`}>
                    {subscription.status === 'active' ? 'Aktivní' : 'Trial'}
                  </span>
                </div>

                <div>
                  <span className="text-gray-600">Částka:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    {subscription.amount} {subscription.currency}
                  </span>
                </div>

                <div>
                  <span className="text-gray-600">Začátek období:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    {new Date(subscription.currentPeriodStart).toLocaleDateString('cs-CZ')}
                  </span>
                </div>

                <div>
                  <span className="text-gray-600">Konec období:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    {new Date(subscription.currentPeriodEnd).toLocaleDateString('cs-CZ')}
                  </span>
                </div>
              </div>

              {subscription.plan !== 'premium_monthly' && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800">
                    ⚠️ Opakované platby fungují jen pro <strong>Premium Měsíční</strong> předplatné.
                    {subscription.plan === 'free_trial' && ' Nejdřív si zakupte Premium Měsíční.'}
                    {subscription.plan === 'premium_yearly' && ' Roční předplatné nemá automatické opakování.'}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-600">Žádné aktivní předplatné</p>
          )}
        </div>

        {/* Simulate Button */}
        {subscription?.plan === 'premium_monthly' && subscription?.status === 'active' && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Simulace opakované platby
            </h2>
            <p className="text-gray-600 mb-6">
              Kliknutím na tlačítko simulujete, co se stane, když GoPay automaticky
              provede opakovanou platbu. Předplatné se prodlouží o další měsíc.
            </p>

            <button
              onClick={handleSimulate}
              disabled={loading}
              className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Simuluji...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5" />
                  <span>Simulovat opakovanou platbu</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-bold text-green-900">
                Simulace úspěšná!
              </h3>
            </div>

            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Plán:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {result.subscription.plan === 'premium_monthly' ? 'Premium Měsíční' : 'Premium Roční'}
                </span>
              </div>

              <div>
                <span className="text-gray-600">Předchozí konec:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {new Date(result.subscription.previousPeriodEnd).toLocaleDateString('cs-CZ')}
                </span>
              </div>

              <div>
                <span className="text-gray-600">Nový začátek:</span>
                <span className="ml-2 font-medium text-green-700">
                  {new Date(result.subscription.newPeriodStart).toLocaleDateString('cs-CZ')}
                </span>
              </div>

              <div>
                <span className="text-gray-600">Nový konec:</span>
                <span className="ml-2 font-medium text-green-700">
                  {new Date(result.subscription.newPeriodEnd).toLocaleDateString('cs-CZ')}
                </span>
              </div>

              <div>
                <span className="text-gray-600">Částka:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {result.subscription.amount} {result.subscription.currency}
                </span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 Obnovte stránku nebo se vraťte na dashboard, abyste viděli aktualizované datum.
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="w-6 h-6 text-red-600" />
              <h3 className="text-lg font-bold text-red-900">
                Chyba
              </h3>
            </div>
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-3">
            📖 Jak testovat
          </h3>
          <ol className="space-y-2 text-sm text-blue-800">
            <li>1. Vytvořte si <strong>Premium Měsíční</strong> předplatné</li>
            <li>2. Zaplaťte a aktivujte ho</li>
            <li>3. Vraťte se na tuto stránku</li>
            <li>4. Klikněte na <strong>"Simulovat opakovanou platbu"</strong></li>
            <li>5. Předplatné se prodlouží o další měsíc</li>
            <li>6. Můžete to opakovat vícekrát</li>
          </ol>

          <div className="mt-4 pt-4 border-t border-blue-300">
            <p className="text-sm text-blue-800">
              <strong>Poznámka:</strong> V produkci bude GoPay automaticky provádět
              opakované platby každý měsíc. Tento nástroj slouží jen pro testování.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

