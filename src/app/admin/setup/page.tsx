'use client'

import { useState, useEffect } from 'react'
import { auth } from '@/config/firebase'
import { User } from 'firebase/auth'

export default function AdminSetupPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [settingRole, setSettingRole] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const [secretKey, setSecretKey] = useState('')
  const [selectedRole, setSelectedRole] = useState<'admin' | 'super_admin'>('super_admin')

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const setAdminRole = async () => {
    if (!user) {
      setResult({ success: false, message: 'Nejste přihlášeni' })
      return
    }

    if (!secretKey) {
      setResult({ success: false, message: 'Prosím zadejte secret key' })
      return
    }

    try {
      setSettingRole(true)
      setResult(null)

      // Call our API endpoint which will call the Firebase Function
      const response = await fetch('/api/admin/set-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user.uid,
          role: selectedRole,
          secretKey: secretKey
        })
      })

      const data = await response.json()
      setResult(data)

      if (data.success) {
        // Force token refresh to get new custom claims
        await user.getIdToken(true)

        // Reload user to get updated custom claims
        await auth.currentUser?.reload()

        setTimeout(() => {
          window.location.href = '/admin/dashboard'
        }, 2000)
      }
    } catch (error: any) {
      console.error('Error setting admin role:', error)
      setResult({
        success: false,
        message: error.message || 'Chyba při nastavování admin role'
      })
    } finally {
      setSettingRole(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Načítání...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Admin Setup</h1>
          <p className="text-gray-600 mb-4">Nejste přihlášeni. Prosím přihlaste se.</p>
          <a
            href="/login"
            className="block w-full bg-rose-500 text-white text-center py-2 px-4 rounded-lg hover:bg-rose-600 transition-colors"
          >
            Přihlásit se
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="bg-rose-500 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">Admin Role Setup</h1>
          </div>

          <div className="p-6 space-y-6">
            {/* User Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Informace o uživateli</h2>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-600">Email:</span>
                  <p className="text-gray-900">{user.email}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">UID:</span>
                  <p className="text-gray-900 font-mono text-sm break-all">{user.uid}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Email ověřen:</span>
                  <p className="text-gray-900">{user.emailVerified ? '✅ Ano' : '❌ Ne'}</p>
                </div>
              </div>
            </div>

            {/* Setup Form */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Nastavit Admin Roli</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as 'admin' | 'super_admin')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                >
                  <option value="super_admin">Super Admin (plný přístup)</option>
                  <option value="admin">Admin (omezený přístup)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secret Key
                </label>
                <input
                  type="password"
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  placeholder="Zadejte secret key"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Secret key najdete v Firebase Functions config nebo v dokumentaci
                </p>
              </div>

              <button
                onClick={setAdminRole}
                disabled={settingRole || !secretKey}
                className="w-full bg-rose-500 text-white py-3 px-4 rounded-lg hover:bg-rose-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
              >
                {settingRole ? 'Nastavuji...' : 'Nastavit Admin Roli'}
              </button>
            </div>

            {/* Result */}
            {result && (
              <div
                className={`p-4 rounded-lg ${
                  result.success
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                }`}
              >
                <p
                  className={`font-medium ${
                    result.success ? 'text-green-800' : 'text-red-800'
                  }`}
                >
                  {result.success ? '✅ Úspěch!' : '❌ Chyba'}
                </p>
                <p
                  className={`mt-1 text-sm ${
                    result.success ? 'text-green-700' : 'text-red-700'
                  }`}
                >
                  {result.message}
                </p>
                {result.success && (
                  <p className="mt-2 text-sm text-green-600">
                    Přesměrování na admin dashboard...
                  </p>
                )}
              </div>
            )}

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">📝 Instrukce:</h3>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Zkopírujte svůj UID (zobrazený výše)</li>
                <li>Získejte secret key z Firebase Functions config</li>
                <li>Zadejte secret key do formuláře</li>
                <li>Klikněte na "Nastavit Admin Roli"</li>
                <li>Po úspěchu budete přesměrováni na admin dashboard</li>
              </ol>
              <div className="mt-3 p-3 bg-white rounded border border-blue-200">
                <p className="text-xs font-mono text-gray-700">
                  firebase functions:config:get admin.secret_key
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

