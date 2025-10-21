'use client'

import React, { useState, memo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useAffiliate } from '@/hooks/useAffiliate'
import { auth, db } from '@/config/firebase'
import { updateProfile, updateEmail, sendEmailVerification } from 'firebase/auth'
import { doc, updateDoc } from 'firebase/firestore'
import {
  User,
  Mail,
  Phone,
  Calendar,
  Edit,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Shield,
  DollarSign,
  TrendingUp,
  ExternalLink
} from 'lucide-react'
import { cn } from '@/utils'

function ProfileTab() {
  const router = useRouter()
  const { user, refreshUser } = useAuth()
  const { partner, loading: affiliateLoading } = useAffiliate()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning', text: string } | null>(null)

  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    email: user?.email || '',
    gender: user?.gender || '' as 'male' | 'female' | 'other' | ''
  })

  const handleSave = async () => {
    if (!auth.currentUser) return

    try {
      setLoading(true)
      setMessage(null)

      let hasChanges = false
      let emailChanged = false

      // Update display name in Firebase Auth
      if (formData.displayName !== user?.displayName) {
        await updateProfile(auth.currentUser, {
          displayName: formData.displayName
        })
        hasChanges = true
      }

      // Update gender in Firestore (FIRST, before email)
      if (formData.gender !== user?.gender) {
        console.log('💾 Saving gender to Firestore:', {
          userId: auth.currentUser.uid,
          oldGender: user?.gender,
          newGender: formData.gender
        })
        const userRef = doc(db, 'users', auth.currentUser.uid)
        await updateDoc(userRef, {
          gender: formData.gender,
          updatedAt: new Date()
        })
        console.log('✅ Gender saved to Firestore')
        hasChanges = true
      }

      // Update email ONLY if it actually changed
      if (formData.email !== user?.email && formData.email.trim() !== '') {
        try {
          await updateEmail(auth.currentUser, formData.email)
          await sendEmailVerification(auth.currentUser)
          emailChanged = true
          hasChanges = true
        } catch (emailError: any) {
          // If email update fails, still show success for other changes
          if (hasChanges) {
            setMessage({
              type: 'warning',
              text: 'Profil byl aktualizován, ale email se nepodařilo změnit. Pro změnu emailu se musíte znovu přihlásit.'
            })
          } else {
            throw emailError // Re-throw if no other changes were made
          }
        }
      }

      // Show appropriate success message
      if (emailChanged) {
        setMessage({
          type: 'success',
          text: 'Email byl změněn. Zkontrolujte prosím svou emailovou schránku pro ověření.'
        })
      } else if (hasChanges) {
        setMessage({
          type: 'success',
          text: 'Profil byl úspěšně aktualizován'
        })
      }

      // Refresh user data if gender changed
      if (formData.gender !== user?.gender && refreshUser) {
        console.log('🔄 Gender changed, refreshing user data...')
        await refreshUser()
      }

      setIsEditing(false)

    } catch (error: any) {
      console.error('Error updating profile:', error)

      // Better error messages
      let errorMessage = 'Chyba při aktualizaci profilu'
      if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Příliš mnoho pokusů. Zkuste to prosím později.'
      } else if (error.code === 'auth/requires-recent-login') {
        errorMessage = 'Pro změnu emailu se musíte znovu přihlásit.'
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Neplatný formát emailu.'
      } else if (error.message) {
        errorMessage = error.message
      }

      setMessage({
        type: 'error',
        text: errorMessage
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      displayName: user?.displayName || '',
      email: user?.email || '',
      gender: user?.gender || '' as 'male' | 'female' | 'other' | ''
    })
    setIsEditing(false)
    setMessage(null)
  }

  const handleSendVerification = async () => {
    if (!auth.currentUser) return

    try {
      setLoading(true)
      await sendEmailVerification(auth.currentUser)
      setMessage({
        type: 'success',
        text: 'Ověřovací email byl odeslán'
      })
    } catch (error: any) {
      console.error('Error sending verification:', error)
      setMessage({
        type: 'error',
        text: 'Chyba při odesílání ověřovacího emailu'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg flex items-center space-x-2 ${
          message.type === 'success'
            ? 'bg-green-50 border border-green-200'
            : message.type === 'warning'
            ? 'bg-yellow-50 border border-yellow-200'
            : 'bg-red-50 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          ) : message.type === 'warning' ? (
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          )}
          <span className={
            message.type === 'success' ? 'text-green-800' :
            message.type === 'warning' ? 'text-yellow-800' :
            'text-red-800'
          }>
            {message.text}
          </span>
        </div>
      )}

      {/* Profile Information */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <User className="w-5 h-5 text-primary-600" />
            <span>Osobní údaje</span>
          </h3>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="btn-outline flex items-center space-x-2"
            >
              <Edit className="w-4 h-4" />
              <span>Upravit</span>
            </button>
          )}
        </div>

        <div className="space-y-4">
          {/* Display Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jméno
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Vaše jméno"
              />
            ) : (
              <p className="text-gray-900">{user?.displayName || 'Nenastaveno'}</p>
            )}
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pohlaví
            </label>
            {isEditing ? (
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, gender: 'female' })}
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
                  onClick={() => setFormData({ ...formData, gender: 'male' })}
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
                  onClick={() => setFormData({ ...formData, gender: 'other' })}
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
            ) : (
              <div className="flex items-center space-x-2">
                {user?.gender === 'female' ? (
                  <div className="inline-flex items-center space-x-2 px-3 py-2 bg-pink-50 border border-pink-200 rounded-lg">
                    <span className="text-2xl">👰</span>
                    <span className="text-gray-900 font-medium">Žena</span>
                  </div>
                ) : user?.gender === 'male' ? (
                  <div className="inline-flex items-center space-x-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                    <span className="text-2xl">🤵</span>
                    <span className="text-gray-900 font-medium">Muž</span>
                  </div>
                ) : user?.gender === 'other' ? (
                  <div className="inline-flex items-center space-x-2 px-3 py-2 bg-purple-50 border border-purple-200 rounded-lg">
                    <span className="text-2xl">💫</span>
                    <span className="text-gray-900 font-medium">Jiné</span>
                  </div>
                ) : (
                  <span className="text-gray-500 italic">Nenastaveno</span>
                )}
              </div>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
              <Mail className="w-4 h-4" />
              <span>Email</span>
              {auth.currentUser?.emailVerified && (
                <CheckCircle className="w-4 h-4 text-green-600" />
              )}
            </label>
            {isEditing && auth.currentUser?.providerData[0]?.providerId === 'password' ? (
              <div>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="vas@email.cz"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Pro změnu emailu se může vyžadovat opětovné přihlášení
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-gray-900">{user?.email}</p>
                {!auth.currentUser?.emailVerified && auth.currentUser?.providerData[0]?.providerId === 'password' && (
                  <button
                    onClick={handleSendVerification}
                    disabled={loading}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Ověřit email
                  </button>
                )}
              </div>
            )}
            {isEditing && auth.currentUser?.providerData[0]?.providerId !== 'password' && (
              <p className="mt-1 text-xs text-gray-500 flex items-center space-x-1">
                <Shield className="w-3 h-3" />
                <span>Email nelze změnit u účtů přihlášených přes Google</span>
              </p>
            )}
            {!auth.currentUser?.emailVerified && auth.currentUser?.providerData[0]?.providerId === 'password' && (
              <p className="mt-1 text-sm text-amber-600 flex items-center space-x-1">
                <AlertCircle className="w-4 h-4" />
                <span>Email není ověřen</span>
              </p>
            )}
          </div>

          {/* Account Created */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Účet vytvořen</span>
            </label>
            <p className="text-gray-900">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('cs-CZ', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : 'Neznámé datum'}
            </p>
          </div>

          {/* User ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>ID uživatele</span>
            </label>
            <p className="text-gray-600 text-sm font-mono">{user?.id}</p>
          </div>
        </div>

        {/* Edit Actions */}
        {isEditing && (
          <div className="flex space-x-3 mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleCancel}
              disabled={loading}
              className="flex-1 btn-outline flex items-center justify-center space-x-2"
            >
              <X className="w-4 h-4" />
              <span>Zrušit</span>
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 btn-primary flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 loading-spinner" />
                  <span>Ukládání...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Uložit změny</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Affiliate Program Section */}
      <div className="bg-gradient-to-br from-pink-50 to-purple-50 border-2 border-pink-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2 mb-4">
          <DollarSign className="w-5 h-5 text-pink-600" />
          <span>Affiliate Program</span>
        </h3>

        {affiliateLoading ? (
          <div className="text-center py-4">
            <div className="animate-spin w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : partner ? (
          // User is an affiliate partner
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 border border-pink-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-gray-900">Aktivní partner</span>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                  {partner.status === 'active' ? 'Aktivní' : partner.status}
                </span>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Váš referral odkaz</p>
                  <span className="text-sm font-medium text-pink-600">{partner.commissionRate}% provize</span>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={partner.referralLink}
                    readOnly
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-mono text-gray-700"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(partner.referralLink)
                      setMessage({ type: 'success', text: 'Odkaz zkopírován!' })
                      setTimeout(() => setMessage(null), 2000)
                    }}
                    className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors flex items-center space-x-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>Kopírovat</span>
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Sdílejte tento odkaz a získejte {partner.commissionRate}% z každého prodeje
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4 pt-4 border-t border-gray-200">
                <div className="text-center">
                  <p className="text-2xl font-bold text-pink-600">{partner.stats.totalClicks}</p>
                  <p className="text-xs text-gray-600">Kliknutí</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{partner.stats.totalConversions}</p>
                  <p className="text-xs text-gray-600">Konverze</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{partner.stats.totalCommission.toFixed(0)} Kč</p>
                  <p className="text-xs text-gray-600">Provize</p>
                </div>
              </div>

              <a
                href="/affiliate/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-2 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-600 transition-all flex items-center justify-center space-x-2"
              >
                <span>Otevřít Dashboard</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        ) : (
          // User is not an affiliate partner
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <TrendingUp className="w-6 h-6 text-pink-600 flex-shrink-0 mt-1" />
              <div>
                <p className="font-medium text-gray-900 mb-2">
                  Vydělávejte s námi!
                </p>
                <p className="text-sm text-gray-600 mb-3">
                  Staňte se naším affiliate partnerem a získejte <strong>10% provizi</strong> z každého prodeje Premium předplatného, které přivedete.
                </p>
                <ul className="space-y-1 text-sm text-gray-600 mb-4">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>10% provize z každého prodeje</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Pasivní příjem</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Marketingové materiály zdarma</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Detailní statistiky</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => router.push('/affiliate/register')}
                className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white py-2 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-600 transition-all"
              >
                Registrovat se
              </button>
              <button
                onClick={() => router.push('/affiliate')}
                className="flex-1 border-2 border-pink-500 text-pink-600 py-2 rounded-lg font-semibold hover:bg-pink-50 transition-all"
              >
                Více info
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Security Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2 mb-4">
          <Shield className="w-5 h-5 text-primary-600" />
          <span>Zabezpečení</span>
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Heslo</p>
              <p className="text-sm text-gray-600">Změňte své heslo</p>
            </div>
            <button className="btn-outline">
              Změnit heslo
            </button>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div>
              <p className="font-medium text-gray-900">Dvoufaktorové ověření</p>
              <p className="text-sm text-gray-600">Přidejte další vrstvu zabezpečení</p>
            </div>
            <button className="btn-outline" disabled>
              Brzy dostupné
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Memoize to prevent unnecessary re-renders
export default memo(ProfileTab)
