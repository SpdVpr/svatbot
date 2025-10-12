'use client'

import React, { useState, memo } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { auth } from '@/config/firebase'
import { updateProfile, updateEmail, sendEmailVerification } from 'firebase/auth'
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
  Shield
} from 'lucide-react'

function ProfileTab() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    email: user?.email || ''
  })

  const handleSave = async () => {
    if (!auth.currentUser) return

    try {
      setLoading(true)
      setMessage(null)

      // Update display name
      if (formData.displayName !== user?.displayName) {
        await updateProfile(auth.currentUser, {
          displayName: formData.displayName
        })
      }

      // Update email (requires re-authentication in production)
      if (formData.email !== user?.email) {
        await updateEmail(auth.currentUser, formData.email)
        await sendEmailVerification(auth.currentUser)
        setMessage({
          type: 'success',
          text: 'Email byl změněn. Zkontrolujte prosím svou emailovou schránku pro ověření.'
        })
      } else {
        setMessage({
          type: 'success',
          text: 'Profil byl úspěšně aktualizován'
        })
      }

      setIsEditing(false)
    } catch (error: any) {
      console.error('Error updating profile:', error)
      setMessage({
        type: 'error',
        text: error.message || 'Chyba při aktualizaci profilu'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      displayName: user?.displayName || '',
      email: user?.email || ''
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
            : 'bg-red-50 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          )}
          <span className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
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

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
              <Mail className="w-4 h-4" />
              <span>Email</span>
              {auth.currentUser?.emailVerified && (
                <CheckCircle className="w-4 h-4 text-green-600" />
              )}
            </label>
            {isEditing ? (
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="vas@email.cz"
              />
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-gray-900">{user?.email}</p>
                {!auth.currentUser?.emailVerified && (
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
            {!auth.currentUser?.emailVerified && (
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
