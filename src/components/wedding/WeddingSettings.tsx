'use client'

import { useState, useEffect } from 'react'
import { useWedding } from '@/hooks/useWedding'
import VenueLocationMap from '@/components/wedding/VenueLocationMap'
import {
  X,
  Calendar,
  Heart,
  MapPin,
  DollarSign,
  Users,
  AlertCircle,
  Edit,
  Check,
  Coins,
  Sparkles
} from 'lucide-react'
import { getViewTransitionName } from '@/hooks/useViewTransition'

interface WeddingSettingsProps {
  onClose: () => void
  onSave?: () => void
}

export default function WeddingSettings({ onClose, onSave }: WeddingSettingsProps) {
  const { wedding, updateWedding } = useWedding()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    brideName: wedding?.brideName || '',
    groomName: wedding?.groomName || '',
    weddingDate: wedding?.weddingDate ? (() => {
      const date: any = wedding.weddingDate
      // Handle Firestore Timestamp
      if (date && typeof date.toDate === 'function') {
        return date.toDate().toISOString().split('T')[0]
      }
      // Handle Date object
      if (date instanceof Date) {
        return date.toISOString().split('T')[0]
      }
      // Handle string dates
      if (typeof date === 'string') {
        return new Date(date).toISOString().split('T')[0]
      }
      return ''
    })() : '',
    location: typeof wedding?.venue === 'string' ? wedding.venue : wedding?.venue?.name || '',
    style: wedding?.style || '',
    budget: wedding?.budget || 0,
    guestCount: wedding?.estimatedGuestCount || 0
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.brideName.trim()) {
      newErrors.brideName = 'Jméno nevěsty je povinné'
    }

    if (!formData.groomName.trim()) {
      newErrors.groomName = 'Jméno ženicha je povinné'
    }

    if (!formData.weddingDate) {
      newErrors.weddingDate = 'Datum svatby je povinné'
    } else {
      const selectedDate = new Date(formData.weddingDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (selectedDate < today) {
        newErrors.weddingDate = 'Datum svatby nemůže být v minulosti'
      }
    }

    // Location is optional - no validation needed

    if (formData.budget <= 0) {
      newErrors.budget = 'Rozpočet musí být větší než 0'
    }

    if (formData.guestCount <= 0) {
      newErrors.guestCount = 'Počet hostů musí být větší než 0'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    if (!wedding) {
      console.error('No wedding found')
      return
    }

    try {
      setLoading(true)

      console.log('💾 Saving wedding settings:', formData)

      const updates: any = {
        brideName: formData.brideName.trim(),
        groomName: formData.groomName.trim(),
        weddingDate: new Date(formData.weddingDate),
        budget: formData.budget,
        estimatedGuestCount: formData.guestCount
      }

      // Only update venue if location is provided
      if (formData.location.trim()) {
        updates.venue = formData.location.trim()
      }

      // Update style if provided (optional field)
      if (formData.style.trim()) {
        updates.style = formData.style.trim()
      }

      console.log('🔄 Calling updateWedding with:', updates)
      await updateWedding(updates)

      console.log('✅ Wedding settings saved successfully')
      onSave?.()
      onClose()
    } catch (error) {
      console.error('❌ Error updating wedding:', error)
      setErrors({ general: 'Chyba při ukládání nastavení' })
    } finally {
      setLoading(false)
    }
  }

  // Handle input changes
  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  // Zabránit scrollování pozadí když je modal otevřený
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[150] p-4">
      {/* Backdrop with View Transition */}
      <div
        className="absolute inset-0 backdrop-blur-sm"
        style={getViewTransitionName('wedding-settings-backdrop')}
        onClick={onClose}
      />

      {/* Modal Content with View Transition */}
      <div
        className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
        style={getViewTransitionName('wedding-settings-modal')}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
            <Edit className="w-5 h-5 text-primary-600" />
            <span>Nastavení svatby</span>
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Error message */}
        {errors.general && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <span className="text-red-700">{errors.general}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
              <Heart className="w-5 h-5" />
              <span>Základní údaje</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Bride Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jméno nevěsty *
                </label>
                <input
                  type="text"
                  value={formData.brideName}
                  onChange={(e) => handleChange('brideName', e.target.value)}
                  placeholder="např. Anna"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.brideName ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={loading}
                />
                {errors.brideName && (
                  <p className="mt-1 text-sm text-red-600">{errors.brideName}</p>
                )}
              </div>

              {/* Groom Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jméno ženicha *
                </label>
                <input
                  type="text"
                  value={formData.groomName}
                  onChange={(e) => handleChange('groomName', e.target.value)}
                  placeholder="např. Petr"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.groomName ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={loading}
                />
                {errors.groomName && (
                  <p className="mt-1 text-sm text-red-600">{errors.groomName}</p>
                )}
              </div>
            </div>
          </div>

          {/* Wedding Details */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Detaily svatby</span>
            </h3>

            <div className="space-y-4">
              {/* Wedding Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Datum svatby *
                </label>
                <input
                  type="date"
                  value={formData.weddingDate}
                  onChange={(e) => handleChange('weddingDate', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.weddingDate ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={loading}
                />
                {errors.weddingDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.weddingDate}</p>
                )}
              </div>

              {/* Location with Map */}
              <div>
                <VenueLocationMap
                  address={formData.location}
                  onAddressChange={(value) => handleChange('location', value)}
                />
                {errors.location && (
                  <p className="mt-2 text-sm text-red-600">{errors.location}</p>
                )}
              </div>

              {/* Wedding Style */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Styl svatby (nepovinné)
                </label>
                <input
                  type="text"
                  value={formData.style}
                  onChange={(e) => handleChange('style', e.target.value)}
                  placeholder="např. rustikální, moderní, romantická..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  disabled={loading}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Tento styl pomáhá AI generovat lepší moodboardy
                </p>

                {/* Suggested Styles */}
                <div className="mt-3">
                  <p className="text-xs text-gray-600 mb-2 flex items-center space-x-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Návrhy stylů:</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['Rustikální', 'Moderní', 'Romantická', 'Vintage', 'Boho', 'Minimalistická', 'Zahradní', 'Klasická'].map((style) => (
                      <button
                        key={style}
                        type="button"
                        onClick={() => handleChange('style', style)}
                        className={`px-3 py-1 text-xs rounded-full transition-colors ${
                          formData.style.toLowerCase() === style.toLowerCase()
                            ? 'bg-primary-100 text-primary-700 border border-primary-300'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                        }`}
                        disabled={loading}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Budget and Guests */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
              <Coins className="w-5 h-5 text-primary-600" />
              <span>Rozpočet a hosté</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Budget */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rozpočet (Kč) *
                </label>
                <input
                  type="number"
                  value={formData.budget}
                  onChange={(e) => handleChange('budget', parseInt(e.target.value) || 0)}
                  placeholder="např. 500000"
                  min="0"
                  step="1000"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.budget ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={loading}
                />
                {errors.budget && (
                  <p className="mt-1 text-sm text-red-600">{errors.budget}</p>
                )}
              </div>

              {/* Guest Count */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Počet hostů *
                </label>
                <input
                  type="number"
                  value={formData.guestCount}
                  onChange={(e) => handleChange('guestCount', parseInt(e.target.value) || 0)}
                  placeholder="např. 80"
                  min="1"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.guestCount ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={loading}
                />
                {errors.guestCount && (
                  <p className="mt-1 text-sm text-red-600">{errors.guestCount}</p>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-outline"
              disabled={loading}
            >
              Zrušit
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 loading-spinner" />
                  <span>Ukládání...</span>
                </div>
              ) : (
                <span>Uložit změny</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
