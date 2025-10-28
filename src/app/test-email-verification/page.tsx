'use client'

import React, { useState } from 'react'
import { auth } from '@/config/firebase'
import { sendEmailVerification } from 'firebase/auth'
import { Mail, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'

export default function TestEmailVerificationPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message: string
    details?: any
  } | null>(null)

  const testEmailVerification = async () => {
    setLoading(true)
    setResult(null)

    try {
      const user = auth.currentUser

      if (!user) {
        setResult({
          success: false,
          message: 'Nejste přihlášeni',
          details: { error: 'No authenticated user' }
        })
        return
      }

      console.log('🔍 Testing email verification for user:', {
        uid: user.uid,
        email: user.email,
        emailVerified: user.emailVerified
      })

      // Test 1: Without action code settings
      try {
        console.log('📧 Test 1: Sending without action code settings...')
        await sendEmailVerification(user)
        
        setResult({
          success: true,
          message: 'Email verification sent successfully (without action code settings)',
          details: {
            user: {
              uid: user.uid,
              email: user.email,
              emailVerified: user.emailVerified
            }
          }
        })
        return
      } catch (error: any) {
        console.error('❌ Test 1 failed:', error)
        
        // Test 2: With action code settings
        try {
          console.log('📧 Test 2: Sending with action code settings...')
          const actionCodeSettings = {
            url: `${window.location.origin}/profile?verified=true`,
            handleCodeInApp: false,
          }
          
          await sendEmailVerification(user, actionCodeSettings)
          
          setResult({
            success: true,
            message: 'Email verification sent successfully (with action code settings)',
            details: {
              user: {
                uid: user.uid,
                email: user.email,
                emailVerified: user.emailVerified
              },
              actionCodeSettings
            }
          })
          return
        } catch (error2: any) {
          console.error('❌ Test 2 failed:', error2)
          
          // Both tests failed
          setResult({
            success: false,
            message: 'Email verification failed',
            details: {
              test1Error: {
                code: error.code,
                message: error.message
              },
              test2Error: {
                code: error2.code,
                message: error2.message
              },
              user: {
                uid: user.uid,
                email: user.email,
                emailVerified: user.emailVerified
              },
              firebaseConfig: {
                authDomain: auth.config.authDomain,
                apiKey: auth.config.apiKey ? '***' : 'missing'
              }
            }
          })
        }
      }
    } catch (error: any) {
      console.error('❌ Unexpected error:', error)
      setResult({
        success: false,
        message: 'Unexpected error',
        details: {
          code: error.code,
          message: error.message,
          stack: error.stack
        }
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <Mail className="w-8 h-8 text-primary-600" />
            <h1 className="text-2xl font-bold text-gray-900">
              Test Email Verification
            </h1>
          </div>

          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              Tato stránka slouží k testování Firebase email verification funkcionality.
            </p>
            
            {auth.currentUser ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800">
                  <strong>Přihlášený uživatel:</strong> {auth.currentUser.email}
                </p>
                <p className="text-sm text-blue-800">
                  <strong>Email ověřen:</strong> {auth.currentUser.emailVerified ? 'Ano' : 'Ne'}
                </p>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-yellow-800">
                  ⚠️ Nejste přihlášeni. Přihlaste se prosím nejprve.
                </p>
              </div>
            )}
          </div>

          <button
            onClick={testEmailVerification}
            disabled={loading || !auth.currentUser}
            className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Testování...
              </>
            ) : (
              <>
                <Mail className="w-5 h-5" />
                Otestovat odeslání ověřovacího emailu
              </>
            )}
          </button>

          {result && (
            <div className={`mt-6 rounded-lg p-4 ${
              result.success 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-start gap-3">
                {result.success ? (
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <h3 className={`font-semibold mb-2 ${
                    result.success ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {result.success ? 'Úspěch!' : 'Chyba'}
                  </h3>
                  <p className={`text-sm mb-3 ${
                    result.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {result.message}
                  </p>
                  
                  {result.details && (
                    <details className="mt-3">
                      <summary className={`cursor-pointer text-sm font-medium ${
                        result.success ? 'text-green-900' : 'text-red-900'
                      }`}>
                        Zobrazit detaily
                      </summary>
                      <pre className={`mt-2 text-xs p-3 rounded overflow-auto ${
                        result.success 
                          ? 'bg-green-100 text-green-900' 
                          : 'bg-red-100 text-red-900'
                      }`}>
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-200">
            <h2 className="font-semibold text-gray-900 mb-3">
              Kontrolní seznam Firebase nastavení:
            </h2>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-primary-600 font-bold">1.</span>
                <span>
                  Zkontrolujte <strong>Authorized domains</strong> v Firebase Console
                  (Authentication → Settings → Authorized domains)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 font-bold">2.</span>
                <span>
                  Přidejte <code className="bg-gray-100 px-1 rounded">svatbot.cz</code> a{' '}
                  <code className="bg-gray-100 px-1 rounded">www.svatbot.cz</code>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 font-bold">3.</span>
                <span>
                  Zkontrolujte email šablonu v Firebase Console
                  (Authentication → Templates → Email address verification)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 font-bold">4.</span>
                <span>
                  Ujistěte se, že máte aktivní Firebase plán (Blaze/Pay-as-you-go)
                </span>
              </li>
            </ul>
          </div>

          <div className="mt-6">
            <a
              href="/profile"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              ← Zpět na profil
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

