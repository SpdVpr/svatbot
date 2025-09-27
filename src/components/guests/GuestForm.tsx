'use client'

import { useState } from 'react'
import { GuestFormData, GuestCategory, InvitationType, DietaryRestriction } from '@/types/guest'
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Users,
  Calendar,
  Utensils,
  Tag,
  AlertCircle,
  Plus,
  Minus
} from 'lucide-react'

interface GuestFormProps {
  onSubmit: (data: GuestFormData) => Promise<void>
  onCancel: () => void
  loading?: boolean
  error?: string
  initialData?: Partial<GuestFormData>
}

export default function GuestForm({
  onSubmit,
  onCancel,
  loading = false,
  error,
  initialData
}: GuestFormProps) {
  const [formData, setFormData] = useState<GuestFormData>({
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    address: initialData?.address || undefined,
    category: initialData?.category || 'other',
    invitationType: initialData?.invitationType || 'ceremony-reception',
    hasPlusOne: initialData?.hasPlusOne || false,
    plusOneName: initialData?.plusOneName || '',
    hasChildren: initialData?.hasChildren || false,
    children: initialData?.children || [],
    dietaryRestrictions: initialData?.dietaryRestrictions || [],
    dietaryNotes: initialData?.dietaryNotes || '',
    accessibilityNeeds: initialData?.accessibilityNeeds || '',
    accommodationNeeds: initialData?.accommodationNeeds || '',
    preferredContactMethod: initialData?.preferredContactMethod || 'email',
    language: initialData?.language || 'cs',
    notes: initialData?.notes || '',
    tags: initialData?.tags || []
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showAddress, setShowAddress] = useState(!!initialData?.address)
  const [newTag, setNewTag] = useState('')

  // Category options
  const categoryOptions = [
    { value: 'family-bride', label: 'Rodina nevěsty', icon: '👰' },
    { value: 'family-groom', label: 'Rodina ženicha', icon: '🤵' },
    { value: 'friends-bride', label: 'Přátelé nevěsty', icon: '👭' },
    { value: 'friends-groom', label: 'Přátelé ženicha', icon: '👬' },
    { value: 'colleagues-bride', label: 'Kolegové nevěsty', icon: '💼' },
    { value: 'colleagues-groom', label: 'Kolegové ženicha', icon: '💼' },
    { value: 'other', label: 'Ostatní', icon: '👥' }
  ]

  // Invitation type options
  const invitationTypeOptions = [
    { value: 'ceremony-reception', label: 'Obřad + hostina', description: 'Celá svatba' },
    { value: 'ceremony-only', label: 'Pouze obřad', description: 'Jen svatební obřad' },
    { value: 'reception-only', label: 'Pouze hostina', description: 'Jen svatební hostina' }
  ]

  // Dietary restrictions options
  const dietaryOptions = [
    { value: 'vegetarian', label: 'Vegetariánská', icon: '🥗' },
    { value: 'vegan', label: 'Veganská', icon: '🌱' },
    { value: 'gluten-free', label: 'Bezlepková', icon: '🌾' },
    { value: 'lactose-free', label: 'Bez laktózy', icon: '🥛' },
    { value: 'kosher', label: 'Košer', icon: '✡️' },
    { value: 'halal', label: 'Halal', icon: '☪️' },
    { value: 'diabetic', label: 'Diabetická', icon: '💉' },
    { value: 'allergies', label: 'Alergie', icon: '⚠️' },
    { value: 'other', label: 'Jiné', icon: '🍽️' }
  ]

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Jméno je povinné'
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Příjmení je povinné'
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Neplatný formát emailu'
    }

    if (formData.hasPlusOne && !formData.plusOneName?.trim()) {
      newErrors.plusOneName = 'Jméno doprovodu je povinné'
    }

    if (formData.hasChildren && formData.children) {
      formData.children.forEach((child, index) => {
        if (!child.name.trim()) {
          newErrors[`child_${index}_name`] = 'Jméno dítěte je povinné'
        }
        if (child.age < 0 || child.age > 18) {
          newErrors[`child_${index}_age`] = 'Věk dítěte musí být mezi 0-18 let'
        }
      })
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

    try {
      await onSubmit(formData)
    } catch (error) {
      console.error('Error submitting guest form:', error)
    }
  }

  // Handle input changes
  const handleChange = (field: keyof GuestFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  // Handle dietary restrictions toggle
  const toggleDietaryRestriction = (restriction: DietaryRestriction) => {
    const current = formData.dietaryRestrictions
    const updated = current.includes(restriction)
      ? current.filter(r => r !== restriction)
      : [...current, restriction]

    handleChange('dietaryRestrictions', updated)
  }

  // Add tag
  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      handleChange('tags', [...formData.tags, newTag.trim()])
      setNewTag('')
    }
  }

  // Remove tag
  const removeTag = (tagToRemove: string) => {
    handleChange('tags', formData.tags.filter(tag => tag !== tagToRemove))
  }

  // Add child
  const addChild = () => {
    setFormData(prev => ({
      ...prev,
      children: [...(prev.children || []), { name: '', age: 0 }]
    }))
  }

  // Remove child
  const removeChild = (index: number) => {
    setFormData(prev => ({
      ...prev,
      children: prev.children?.filter((_, i) => i !== index) || []
    }))
  }

  // Update child
  const updateChild = (index: number, field: 'name' | 'age', value: string | number) => {
    setFormData(prev => ({
      ...prev,
      children: prev.children?.map((child, i) =>
        i === index ? { ...child, [field]: value } : child
      ) || []
    }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 mobile-modal">
      <div className="bg-white rounded-xl max-w-4xl w-full mobile-modal-content overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            {initialData ? 'Upravit hosta' : 'Přidat nového hosta'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mx-4 sm:mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mobile-form space-y-6 sm:space-y-8">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Základní údaje</span>
            </h3>

            <div className="mobile-grid">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jméno *
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.firstName ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={loading}
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Příjmení *
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.lastName ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={loading}
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Plus One */}
            <div className="mt-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.hasPlusOne}
                  onChange={(e) => handleChange('hasPlusOne', e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  disabled={loading}
                />
                <span className="text-sm font-medium text-gray-700">Má doprovod (+1)</span>
              </label>

              {formData.hasPlusOne && (
                <div className="mt-3">
                  <input
                    type="text"
                    placeholder="Jméno doprovodu"
                    value={formData.plusOneName}
                    onChange={(e) => handleChange('plusOneName', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors.plusOneName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    disabled={loading}
                  />
                  {errors.plusOneName && (
                    <p className="mt-1 text-sm text-red-600">{errors.plusOneName}</p>
                  )}
                </div>
              )}
            </div>

            {/* Children */}
            <div className="mt-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.hasChildren}
                  onChange={(e) => {
                    handleChange('hasChildren', e.target.checked)
                    if (!e.target.checked) {
                      handleChange('children', [])
                    }
                  }}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  disabled={loading}
                />
                <span className="text-sm font-medium text-gray-700">Má děti</span>
              </label>

              {formData.hasChildren && (
                <div className="mt-3 space-y-3">
                  {formData.children?.map((child, index) => (
                    <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Jméno dítěte"
                          value={child.name}
                          onChange={(e) => updateChild(index, 'name', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                            errors[`child_${index}_name`] ? 'border-red-300' : 'border-gray-300'
                          }`}
                          disabled={loading}
                        />
                        {errors[`child_${index}_name`] && (
                          <p className="mt-1 text-sm text-red-600">{errors[`child_${index}_name`]}</p>
                        )}
                      </div>
                      <div className="w-20">
                        <input
                          type="number"
                          placeholder="Věk"
                          min="0"
                          max="18"
                          value={child.age}
                          onChange={(e) => updateChild(index, 'age', parseInt(e.target.value) || 0)}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                            errors[`child_${index}_age`] ? 'border-red-300' : 'border-gray-300'
                          }`}
                          disabled={loading}
                        />
                        {errors[`child_${index}_age`] && (
                          <p className="mt-1 text-sm text-red-600">{errors[`child_${index}_age`]}</p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeChild(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        disabled={loading}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addChild}
                    className="flex items-center space-x-2 px-3 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    disabled={loading}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Přidat dítě</span>
                  </button>
                </div>
              )}
            </div>

            <div className="mobile-grid mt-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className={`w-full px-3 py-2 pl-10 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    disabled={loading}
                  />
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefon
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    disabled={loading}
                  />
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Wedding Details */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Svatební údaje</span>
            </h3>

            <div className="mobile-grid gap-6">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategorie
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value as GuestCategory)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  disabled={loading}
                >
                  {categoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.icon} {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Invitation Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Typ pozvání
                </label>
                <select
                  value={formData.invitationType}
                  onChange={(e) => handleChange('invitationType', e.target.value as InvitationType)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  disabled={loading}
                >
                  {invitationTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  {invitationTypeOptions.find(opt => opt.value === formData.invitationType)?.description}
                </p>
              </div>
            </div>
          </div>

          {/* Dietary Restrictions */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
              <Utensils className="w-5 h-5" />
              <span>Stravovací omezení</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {dietaryOptions.map((option) => (
                <label key={option.value} className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.dietaryRestrictions.includes(option.value as DietaryRestriction)}
                    onChange={() => toggleDietaryRestriction(option.value as DietaryRestriction)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    disabled={loading}
                  />
                  <span className="text-sm">{option.icon} {option.label}</span>
                </label>
              ))}
            </div>

            {formData.dietaryRestrictions.length > 0 && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Poznámky ke stravování
                </label>
                <textarea
                  value={formData.dietaryNotes}
                  onChange={(e) => handleChange('dietaryNotes', e.target.value)}
                  placeholder="Detaily k alergiím, preferencím..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
              <Tag className="w-5 h-5" />
              <span>Štítky</span>
            </h3>

            <div className="flex flex-wrap gap-2 mb-3">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-700"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-2 hover:text-primary-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex space-x-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Přidat štítek..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                disabled={loading}
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-500 transition-colors"
                disabled={loading}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Poznámky
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Dodatečné poznámky o hostovi..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              disabled={loading}
            />
          </div>

          {/* Actions */}
          <div className="mobile-buttons pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 btn-outline"
              disabled={loading}
            >
              Zrušit
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary"
              disabled={loading || !formData.firstName.trim() || !formData.lastName.trim()}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 loading-spinner" />
                  <span>Ukládání...</span>
                </div>
              ) : (
                initialData ? 'Uložit změny' : 'Přidat hosta'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
