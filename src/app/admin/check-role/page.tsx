'use client'

import { useEffect, useState } from 'react'
import { auth } from '@/config/firebase'
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'

export default function CheckRolePage() {
  const [user, setUser] = useState<any>(null)
  const [claims, setClaims] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = auth.currentUser
        if (!currentUser) {
          setLoading(false)
          return
        }

        setUser({
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName
        })

        // Get custom claims
        const tokenResult = await currentUser.getIdTokenResult()
        setClaims(tokenResult.claims)
      } catch (error) {
        console.error('Error checking auth:', error)
      } finally {
        setLoading(false)
      }
    }

    // Wait for auth to be ready
    const unsubscribe = auth.onAuthStateChanged(() => {
      checkAuth()
    })

    return () => unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Nejste přihlášeni</h1>
          <p className="text-gray-600">Přihlaste se prosím</p>
        </div>
      </div>
    )
  }

  const hasAdminRole = claims?.role === 'admin' || claims?.role === 'super_admin'

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Role Check</h1>

          {/* User Info */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">User Information</h2>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">UID:</span>
                <span className="text-gray-900 font-mono text-sm">{user.uid}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Email:</span>
                <span className="text-gray-900">{user.email}</span>
              </div>
              {user.displayName && (
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Name:</span>
                  <span className="text-gray-900">{user.displayName}</span>
                </div>
              )}
            </div>
          </div>

          {/* Admin Role Status */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Admin Role Status</h2>
            <div className={`rounded-lg p-6 ${hasAdminRole ? 'bg-green-50 border-2 border-green-500' : 'bg-red-50 border-2 border-red-500'}`}>
              <div className="flex items-center space-x-3">
                {hasAdminRole ? (
                  <>
                    <CheckCircle className="h-8 w-8 text-green-500" />
                    <div>
                      <p className="text-lg font-semibold text-green-900">Admin Role Active</p>
                      <p className="text-green-700">Role: {claims.role}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="h-8 w-8 text-red-500" />
                    <div>
                      <p className="text-lg font-semibold text-red-900">No Admin Role</p>
                      <p className="text-red-700">You need admin or super_admin role to delete vendors</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Custom Claims */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Custom Claims</h2>
            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-green-400 text-sm font-mono">
                {JSON.stringify(claims, null, 2)}
              </pre>
            </div>
          </div>

          {/* Instructions */}
          {!hasAdminRole && (
            <div className="bg-yellow-50 border-2 border-yellow-500 rounded-lg p-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-lg font-semibold text-yellow-900 mb-2">How to Set Admin Role</h3>
                  <ol className="list-decimal list-inside space-y-2 text-yellow-800">
                    <li>Copy your UID: <code className="bg-yellow-100 px-2 py-1 rounded font-mono text-sm">{user.uid}</code></li>
                    <li>Run this command in terminal:</li>
                  </ol>
                  <div className="mt-3 bg-gray-900 rounded p-3">
                    <code className="text-green-400 text-sm">
                      cd functions<br />
                      node setAdminClaims.js {user.uid} super_admin
                    </code>
                  </div>
                  <p className="mt-3 text-sm text-yellow-700">After setting the role, logout and login again for changes to take effect.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

