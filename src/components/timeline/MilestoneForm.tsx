'use client'

import { useState } from 'react'
import { MilestoneFormData, MilestoneType, MILESTONE_TYPES } from '@/types/timeline'
import { 
  X, 
  Calendar, 
  Flag,
  AlertCircle,
  Plus,
  Minus,
  Clock,
  Target
} from 'lucide-react'

interface MilestoneFormProps {
  onSubmit: (data: MilestoneFormData) => Promise<void>
  onCancel: () => void
  loading?: boolean
  error?: string
  initialData?: Partial<MilestoneFormData>
}

export default function MilestoneForm({ 
  onSubmit, 
  onCancel, 
  loading = false, 
  error,
  initialData 
}: MilestoneFormProps) {
  const [formData, setFormData] = useState<MilestoneFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    type: initialData?.type || 'custom',
    targetDate: initialData?.targetDate || new Date(),
    priority: initialData?.priority || 'medium',
    isRequired: initialData?.isRequired || false,
    reminderDays: initialData?.reminderDays || [7, 3, 1],
    notes: initialData?.notes || '',
    tags: initialData?.tags || [],
    dependsOn: initialData?.dependsOn || []
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [newTag, setNewTag] = useState('')
  const [newReminderDay, setNewReminderDay] = useState<number>(7)

  // Priority options
  const priorityOptions = [
    { value: 'low', label: 'Nízká', color: 'text-gray-600' },
    { value: 'medium', label: 'Střední', color: 'text-blue-600' },
    { value: 'high', label: 'Vysoká', color: 'text-orange-600' },
    { value: 'critical', label: 'Kritická', color: 'text-red-600' }
  ]

  // Common reminder day options
  const commonReminderDays = [30, 14, 7, 3, 1]

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Název milníku je povinný'
    }

    if (!formData.targetDate) {
      newErrors.targetDate = 'Datum je povinné'
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
      console.error('Error submitting milestone form:', error)
    }
  }

  // Handle input changes
  const handleChange = (field: keyof MilestoneFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
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

  // Add reminder day
  const addReminderDay = () => {
    if (newReminderDay > 0 && !formData.reminderDays.includes(newReminderDay)) {
      const updatedDays = [...formData.reminderDays, newReminderDay].sort((a, b) => b - a)
      handleChange('reminderDays', updatedDays)
      setNewReminderDay(7)
    }
  }

  // Remove reminder day
  const removeReminderDay = (dayToRemove: number) => {
    handleChange('reminderDays', formData.reminderDays.filter(day => day !== dayToRemove))
  }

  // Get milestone type info
  const selectedType = MILESTONE_TYPES[formData.type as keyof typeof MILESTONE_TYPES]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {initialData ? 'Upravit milník' : 'Přidat nový milník'}
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
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
              <Target className="w-5 h-5" />
              <span>Základní informace</span>
            </h3>
            
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Název milníku *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="např. Rezervace místa, Rozeslání pozvánek..."
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.title ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={loading}
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                )}
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Typ milníku
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleChange('type', e.target.value as MilestoneType)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  disabled={loading}
                >
                  {Object.entries(MILESTONE_TYPES).map(([key, type]) => (
                    <option key={key} value={key}>
                      {type.icon} {type.name}
                    </option>
                  ))}
                </select>
                {selectedType && (
                  <p className="mt-1 text-xs text-gray-500">
                    Výchozí priorita: {selectedType.defaultPriority}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Popis
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Detailní popis milníku..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Timing and Priority */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Časování a priorita</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Target Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cílové datum *
                </label>
                <input
                  type="date"
                  value={formData.targetDate.toISOString().split('T')[0]}
                  onChange={(e) => handleChange('targetDate', new Date(e.target.value))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.targetDate ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={loading}
                />
                {errors.targetDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.targetDate}</p>
                )}
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priorita
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => handleChange('priority', e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  disabled={loading}
                >
                  {priorityOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Required checkbox */}
            <div className="mt-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.isRequired}
                  onChange={(e) => handleChange('isRequired', e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  disabled={loading}
                />
                <span className="text-sm text-gray-700">Tento milník je povinný</span>
              </label>
            </div>
          </div>

          {/* Reminders */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>Připomínky</span>
            </h3>
            
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Nastavte, kolik dní před termínem chcete být upozorněni
              </p>

              {/* Current reminder days */}
              <div className="flex flex-wrap gap-2">
                {formData.reminderDays.map((day) => (
                  <span
                    key={day}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700"
                  >
                    {day} {day === 1 ? 'den' : day < 5 ? 'dny' : 'dní'} před
                    <button
                      type="button"
                      onClick={() => removeReminderDay(day)}
                      className="ml-2 hover:text-blue-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              {/* Add reminder day */}
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={newReminderDay}
                  onChange={(e) => setNewReminderDay(parseInt(e.target.value) || 0)}
                  min="1"
                  max="365"
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  disabled={loading}
                />
                <span className="text-sm text-gray-600">dní před</span>
                <button
                  type="button"
                  onClick={addReminderDay}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  disabled={loading}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Quick add common days */}
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-gray-600">Rychlé přidání:</span>
                {commonReminderDays.map((day) => (
                  !formData.reminderDays.includes(day) && (
                    <button
                      key={day}
                      type="button"
                      onClick={() => {
                        const updatedDays = [...formData.reminderDays, day].sort((a, b) => b - a)
                        handleChange('reminderDays', updatedDays)
                      }}
                      className="text-xs px-2 py-1 bg-primary-600 text-white rounded hover:bg-primary-500 transition-colors"
                      disabled={loading}
                    >
                      {day}d
                    </button>
                  )
                ))}
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
              <Flag className="w-5 h-5" />
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
              placeholder="Dodatečné poznámky k milníku..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              disabled={loading}
            />
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4 border-t border-gray-200">
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
              disabled={loading || !formData.title.trim()}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 loading-spinner" />
                  <span>Ukládání...</span>
                </div>
              ) : (
                initialData ? 'Uložit změny' : 'Přidat milník'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
