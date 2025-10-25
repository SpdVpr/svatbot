'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/firebase'
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth'
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  Shield,
  AlertCircle,
  Loader2
} from 'lucide-react'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const hasRedirected = useRef(false)
  const router = useRouter()

  useEffect(() => {
    // Set timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      console.warn('⚠️ Admin login check timeout')
      setIsLoading(false)
    }, 3000) // 3 seconds timeout

    // Check if user is already authenticated
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      clearTimeout(loadingTimeout)

      if (user && !hasRedirected.current) {
        // Check if user has admin role
        try {
          const idTokenResult = await Promise.race([
            user.getIdTokenResult(),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Token fetch timeout')), 2000)
            )
          ]) as any

          const isAdmin = idTokenResult.claims.admin as boolean

          if (isAdmin) {
            hasRedirected.current = true
            router.replace('/admin/dashboard')
          } else {
            setIsLoading(false)
          }
        } catch (error) {
          console.error('Error checking admin status:', error)
          setIsLoading(false)
        }
      } else {
        setIsLoading(false)
      }
    })

    return () => {
      clearTimeout(loadingTimeout)
      unsubscribe()
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      // Sign in with Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      
      // Check if user has admin role
      const idTokenResult = await userCredential.user.getIdTokenResult()
      const isAdmin = idTokenResult.claims.admin as boolean
      
      if (!isAdmin) {
        setError('Nemáte admin oprávnění')
        await auth.signOut()
      } else {
        // Redirect will happen in useEffect
        router.replace('/admin/dashboard')
      }
    } catch (err: any) {
      console.error('Login error:', err)
      if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setError('Neplatné přihlašovací údaje')
      } else if (err.code === 'auth/too-many-requests') {
        setError('Příliš mnoho pokusů. Zkuste to prosím později.')
      } else {
        setError('Chyba při přihlašování: ' + (err.message || 'Neznámá chyba'))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-16 w-16 bg-primary-600 rounded-full flex items-center justify-center">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Admin přihlášení
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            SvatBot.cz - Správa marketplace
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  placeholder="admin@svatbot.cz"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Heslo
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none relative block w-full pl-10 pr-10 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-md">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Přihlásit se'
              )}
            </button>
          </div>

          <div className="text-center">
            <div className="text-sm text-gray-600 bg-gray-100 p-4 rounded-md">
              <p className="font-medium mb-2">Admin přihlášení:</p>
              <p>Použijte své admin přihlašovací údaje</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
