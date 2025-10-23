'use client'

import { useState } from 'react'
import { Mail, Send, CheckCircle, XCircle, Loader2, Info } from 'lucide-react'

interface EmailTestResult {
  success: boolean
  message: string
  data?: any
}

interface EmailServiceStatus {
  configured: boolean
  smtpHost: string
  smtpPort: number
  fromEmail: string
  user: string
  passwordSet: boolean
}

export default function EmailTestPanel() {
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<EmailTestResult | null>(null)
  const [status, setStatus] = useState<EmailServiceStatus | null>(null)
  const [statusLoading, setStatusLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://europe-west1-svatbot-app.cloudfunctions.net/api'

  // Check authentication on mount
  useState(() => {
    const checkAuth = async () => {
      try {
        const { auth } = await import('@/config/firebase')
        const user = auth.currentUser
        setIsAuthenticated(!!user)
      } catch (error) {
        console.error('Error checking auth:', error)
        setIsAuthenticated(false)
      }
    }
    checkAuth()
  })

  const getAuthToken = async () => {
    const { auth } = await import('@/config/firebase')
    const user = auth.currentUser
    if (!user) throw new Error('Not authenticated')
    return await user.getIdToken()
  }

  const fetchEmailStatus = async () => {
    if (!isAuthenticated) {
      setResult({
        success: false,
        message: 'Nejste přihlášeni. Prosím přihlaste se jako admin.'
      })
      return
    }

    try {
      setStatusLoading(true)
      const token = await getAuthToken()
      
      const response = await fetch(`${API_BASE}/v1/admin/email-test/status`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      if (data.success) {
        setStatus(data.data)
      }
    } catch (error) {
      console.error('Error fetching email status:', error)
    } finally {
      setStatusLoading(false)
    }
  }

  const testEmail = async (type: 'registration' | 'payment' | 'trial-reminder') => {
    if (!isAuthenticated) {
      setResult({
        success: false,
        message: 'Nejste přihlášeni. Prosím přihlaste se jako admin.'
      })
      return
    }

    if (!email) {
      setResult({
        success: false,
        message: 'Prosím zadejte emailovou adresu'
      })
      return
    }

    try {
      setLoading(true)
      setResult(null)

      const token = await getAuthToken()

      const body: any = { email }
      if (firstName) body.firstName = firstName

      if (type === 'payment') {
        body.plan = 'Premium Roční'
      } else if (type === 'trial-reminder') {
        body.daysLeft = 2
      }

      const response = await fetch(`${API_BASE}/v1/admin/email-test/${type}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })

      const data = await response.json()
      setResult(data)
    } catch (error: any) {
      setResult({
        success: false,
        message: `Chyba: ${error.message}`
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Mail className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Testování Emailů</h2>
            <p className="text-sm text-gray-600">Otestujte odesílání automatických emailů</p>
          </div>
        </div>
        <button
          onClick={fetchEmailStatus}
          disabled={statusLoading}
          className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
        >
          {statusLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            'Zkontrolovat Status'
          )}
        </button>
      </div>

      {/* Email Service Status */}
      {status && (
        <div className={`mb-6 p-4 rounded-lg border-2 ${status.configured ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-start gap-3">
            {status.configured ? (
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">
                {status.configured ? '✅ Email služba je nakonfigurovaná' : '❌ Email služba není nakonfigurovaná'}
              </h3>
              <div className="text-sm text-gray-700 space-y-1">
                <p><strong>SMTP Server:</strong> {status.smtpHost}:{status.smtpPort}</p>
                <p><strong>From Email:</strong> {status.fromEmail}</p>
                <p><strong>User:</strong> {status.user}</p>
                <p><strong>Password:</strong> {status.passwordSet ? '✅ Nastaveno' : '❌ Nenastaveno'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Test Form */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email adresa *
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="test@example.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Jméno (volitelné)
          </label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Jan"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            Pokud nevyplníte, použije se část před @ z emailu
          </p>
        </div>
      </div>

      {/* Test Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <button
          onClick={() => testEmail('registration')}
          disabled={loading || !email}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          Test Registrace
        </button>

        <button
          onClick={() => testEmail('payment')}
          disabled={loading || !email}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          Test Platba
        </button>

        <button
          onClick={() => testEmail('trial-reminder')}
          disabled={loading || !email}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          Test Trial Reminder
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className={`p-4 rounded-lg border-2 ${result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-start gap-3">
            {result.success ? (
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
            )}
            <div className="flex-1">
              <p className={`font-medium ${result.success ? 'text-green-900' : 'text-red-900'}`}>
                {result.message}
              </p>
              {result.data && (
                <div className="mt-2 text-sm text-gray-700">
                  <p><strong>Email:</strong> {result.data.email}</p>
                  <p><strong>Jméno:</strong> {result.data.firstName}</p>
                  <p><strong>Typ:</strong> {result.data.type}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">Jak testovat:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Zadejte svou emailovou adresu</li>
              <li>Volitelně zadejte jméno (jinak se použije část před @)</li>
              <li>Klikněte na tlačítko pro typ emailu, který chcete otestovat</li>
              <li>Zkontrolujte svou emailovou schránku</li>
            </ol>
            <p className="mt-2 text-xs text-blue-700">
              💡 Tip: Zkontrolujte také spam složku, pokud email nedorazí do hlavní schránky.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

