'use client'

import { useState } from 'react'
import { X, Mail, Lock, User, Eye, EyeOff, Play } from 'lucide-react'
import { cn } from '@/utils'
import { useAuth } from '@/hooks/useAuth'

interface AuthModalProps {
  mode: 'login' | 'register'
  onClose: () => void
  onSwitchMode: (mode: 'login' | 'register') => void
  showDemoOption?: boolean
}

export default function AuthModal({ mode, onClose, onSwitchMode, showDemoOption = true }: AuthModalProps) {
  const { login, register, loginWithGoogle, error, clearError } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    gender: '' as 'male' | 'female' | 'other' | '',
    acceptTerms: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const isLogin = mode === 'login'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    // Basic validation
    const newErrors: Record<string, string> = {}

    if (!formData.email) {
      newErrors.email = 'Email je povinný'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Neplatný formát emailu'
    }

    if (!formData.password) {
      newErrors.password = 'Heslo je povinné'
    } else if (!isLogin && formData.password.length < 6) {
      newErrors.password = 'Heslo musí mít alespoň 6 znaků'
    }

    if (!isLogin) {
      if (!formData.firstName) {
        newErrors.firstName = 'Jméno je povinné'
      }
      if (!formData.lastName) {
        newErrors.lastName = 'Příjmení je povinné'
      }
      if (!formData.gender) {
        newErrors.gender = 'Pohlaví je povinné'
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Hesla se neshodují'
      }
      if (!formData.acceptTerms) {
        newErrors.acceptTerms = 'Musíte souhlasit s podmínkami'
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setIsLoading(false)
      return
    }

    try {
      clearError()

      if (isLogin) {
        await login({
          email: formData.email,
          password: formData.password
        })
      } else {
        await register({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          gender: formData.gender as 'male' | 'female' | 'other'
        })
      }

      // Close modal on success
      onClose()
    } catch (error: any) {
      console.error('Auth error:', error)
      // Error is already handled by useAuth hook
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
    clearError()
  }

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true)
      clearError()
      await loginWithGoogle()
      onClose()
    } catch (error: any) {
      console.error('Google login error:', error)
      // Error is already handled by useAuth hook
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = async () => {
    try {
      setIsLoading(true)
      clearError()

      // Fill demo credentials
      setFormData({
        email: 'demo@svatbot.cz',
        password: 'demo123',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        gender: '' as 'male' | 'female' | 'other' | '',
        acceptTerms: false
      })

      // Login with demo credentials
      await login({
        email: 'demo@svatbot.cz',
        password: 'demo123'
      })

      onClose()
    } catch (error: any) {
      console.error('Demo login error:', error)
      // Error is already handled by useAuth hook
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="heading-4">
            {isLogin ? 'Přihlášení' : 'Registrace'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {(errors.general || error) && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="body-small text-red-600">
                {errors.general || (typeof error === 'string' ? error : error?.message) || 'Došlo k chybě'}
              </p>
            </div>
          )}

          {/* Name fields for registration */}
          {!isLogin && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block body-small font-medium text-text-primary mb-2">
                  Jméno
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={cn(
                      'input-field pl-10',
                      errors.firstName && 'input-error'
                    )}
                    placeholder="Jana"
                  />
                </div>
                {errors.firstName && (
                  <p className="mt-1 body-small text-red-600">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label className="block body-small font-medium text-text-primary mb-2">
                  Příjmení
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={cn(
                      'input-field pl-10',
                      errors.lastName && 'input-error'
                    )}
                    placeholder="Nováková"
                  />
                </div>
                {errors.lastName && (
                  <p className="mt-1 body-small text-red-600">{errors.lastName}</p>
                )}
              </div>
            </div>
          )}

          {/* Gender selection for registration */}
          {!isLogin && (
            <div>
              <label className="block body-small font-medium text-text-primary mb-2">
                Pohlaví
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => handleInputChange('gender', 'female')}
                  className={cn(
                    'py-3 px-4 rounded-lg border-2 transition-all text-sm font-medium',
                    formData.gender === 'female'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-primary-300'
                  )}
                >
                  👰 Žena
                </button>
                <button
                  type="button"
                  onClick={() => handleInputChange('gender', 'male')}
                  className={cn(
                    'py-3 px-4 rounded-lg border-2 transition-all text-sm font-medium',
                    formData.gender === 'male'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-primary-300'
                  )}
                >
                  🤵 Muž
                </button>
                <button
                  type="button"
                  onClick={() => handleInputChange('gender', 'other')}
                  className={cn(
                    'py-3 px-4 rounded-lg border-2 transition-all text-sm font-medium',
                    formData.gender === 'other'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-primary-300'
                  )}
                >
                  💫 Jiné
                </button>
              </div>
              {errors.gender && (
                <p className="mt-1 body-small text-red-600">{errors.gender}</p>
              )}
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block body-small font-medium text-text-primary mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={cn(
                  'input-field pl-10',
                  errors.email && 'input-error'
                )}
                placeholder="jana@email.cz"
              />
            </div>
            {errors.email && (
              <p className="mt-1 body-small text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block body-small font-medium text-text-primary mb-2">
              Heslo
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={cn(
                  'input-field pl-10 pr-10',
                  errors.password && 'input-error'
                )}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 body-small text-red-600">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password for registration */}
          {!isLogin && (
            <div>
              <label className="block body-small font-medium text-text-primary mb-2">
                Potvrdit heslo
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className={cn(
                    'input-field pl-10',
                    errors.confirmPassword && 'input-error'
                  )}
                  placeholder="••••••••"
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 body-small text-red-600">{errors.confirmPassword}</p>
              )}
            </div>
          )}

          {/* Terms acceptance for registration */}
          {!isLogin && (
            <div>
              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={formData.acceptTerms}
                  onChange={(e) => handleInputChange('acceptTerms', e.target.checked)}
                  className="mt-1 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="body-small text-text-secondary">
                  Souhlasím s{' '}
                  <a href="#" className="text-primary-600 hover:underline">
                    podmínkami použití
                  </a>{' '}
                  a{' '}
                  <a href="#" className="text-primary-600 hover:underline">
                    zásadami ochrany soukromí
                  </a>
                </span>
              </label>
              {errors.acceptTerms && (
                <p className="mt-1 body-small text-red-600">{errors.acceptTerms}</p>
              )}
            </div>
          )}

          {/* Social Login */}
          <div className="space-y-3">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">nebo</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className={cn(
                "w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors",
                isLoading && "opacity-50 cursor-not-allowed"
              )}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {isLoading ? 'Přihlašování...' : 'Pokračovat s Google'}
            </button>

            {/* Demo Account Button */}
            {showDemoOption && isLogin && (
              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={isLoading}
                className={cn(
                  "w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-primary-300 rounded-xl shadow-sm bg-primary-50 text-sm font-medium text-primary-700 hover:bg-primary-100 transition-colors",
                  isLoading && "opacity-50 cursor-not-allowed"
                )}
              >
                <Play className="w-5 h-5 mr-2 fill-current" />
                {isLoading ? 'Přihlašování...' : 'Vyzkoušet demo účet'}
              </button>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={cn(
              'w-full btn-primary',
              isLoading && 'opacity-50 cursor-not-allowed'
            )}
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 loading-spinner" />
                <span>Načítání...</span>
              </div>
            ) : (
              isLogin ? 'Přihlásit se' : 'Vytvořit účet'
            )}
          </button>

          {/* Switch mode */}
          <div className="text-center pt-4">
            <p className="body-small text-text-secondary">
              {isLogin ? 'Nemáte účet?' : 'Již máte účet?'}{' '}
              <button
                type="button"
                onClick={() => onSwitchMode(isLogin ? 'register' : 'login')}
                className="text-primary-600 hover:underline font-medium"
              >
                {isLogin ? 'Zaregistrujte se' : 'Přihlaste se'}
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
