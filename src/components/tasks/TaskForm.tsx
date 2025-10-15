'use client'

import { useState } from 'react'
import { TaskFormData, TaskCategory, TaskPriority } from '@/types/task'
import {
  X,
  Calendar,
  Flag,
  User,
  FileText,
  AlertCircle
} from 'lucide-react'

interface TaskFormProps {
  onSubmit: (data: TaskFormData) => Promise<void>
  onCancel: () => void
  loading?: boolean
  error?: string
  initialData?: Partial<TaskFormData>
}

export default function TaskForm({
  onSubmit,
  onCancel,
  loading = false,
  error,
  initialData
}: TaskFormProps) {
  const [formData, setFormData] = useState<TaskFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    category: initialData?.category || 'custom',
    priority: initialData?.priority || undefined,
    dueDate: initialData?.dueDate,
    assignedTo: initialData?.assignedTo || '',
    notes: initialData?.notes || ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Název úkolu je povinný'
    }

    if (formData.title.length > 100) {
      newErrors.title = 'Název úkolu je příliš dlouhý (max 100 znaků)'
    }

    if (formData.description.length > 500) {
      newErrors.description = 'Popis je příliš dlouhý (max 500 znaků)'
    }

    if (formData.dueDate && formData.dueDate < new Date()) {
      newErrors.dueDate = 'Termín nemůže být v minulosti'
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
      console.error('Error submitting task form:', error)
    }
  }

  // Handle input changes
  const handleChange = (field: keyof TaskFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  // Category options
  const categoryOptions = [
    { value: 'foundation', label: 'Základy', description: 'Datum, rozpočet, základní plánování' },
    { value: 'venue', label: 'Místo konání', description: 'Obřad, hostina, ubytování' },
    { value: 'guests', label: 'Hosté', description: 'Seznam hostů, oznámení, RSVP' },
    { value: 'budget', label: 'Rozpočet', description: 'Dodavatelé, platby, výdaje' },
    { value: 'design', label: 'Vzhled', description: 'Šaty, oblek, výzdoba, květiny' },
    { value: 'organization', label: 'Organizace', description: 'Koordinace, zkouška, timeline' },
    { value: 'final', label: 'Finální přípravy', description: 'Poslední týden před svatbou' },
    { value: 'custom', label: 'Osobní úkoly', description: 'Vlastní kategorie úkolu' }
  ]

  // Priority options
  const priorityOptions = [
    { value: 'none', label: 'Bez priority', color: 'text-gray-400', bg: 'bg-gray-50' },
    { value: 'low', label: 'Nízká', color: 'text-gray-600', bg: 'bg-gray-100' },
    { value: 'medium', label: 'Střední', color: 'text-yellow-600', bg: 'bg-yellow-100' },
    { value: 'high', label: 'Vysoká', color: 'text-orange-600', bg: 'bg-orange-100' },
    { value: 'urgent', label: 'Urgentní', color: 'text-red-600', bg: 'bg-red-100' }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            {initialData ? 'Upravit úkol' : 'Vytvořit nový úkol'}
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
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Název úkolu *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Např. Vybrat svatební místo"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.title ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={loading}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
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
              placeholder="Detailní popis úkolu..."
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={loading}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Category and Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategorie
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value as TaskCategory)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled={loading}
              >
                {categoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                {categoryOptions.find(opt => opt.value === formData.category)?.description}
              </p>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priorita
              </label>
              <select
                value={formData.priority || 'none'}
                onChange={(e) => handleChange('priority', e.target.value === 'none' ? undefined : e.target.value as TaskPriority)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled={loading}
              >
                {priorityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {formData.priority && (
                <div className="mt-1 flex items-center space-x-1">
                  <Flag className={`w-3 h-3 ${priorityOptions.find(opt => opt.value === formData.priority)?.color}`} />
                  <span className="text-xs text-gray-500">
                    {priorityOptions.find(opt => opt.value === formData.priority)?.label} priorita
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Due Date and Assigned To */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Termín dokončení
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.dueDate ? formData.dueDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => handleChange('dueDate', e.target.value ? new Date(e.target.value) : undefined)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.dueDate ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={loading}
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              {errors.dueDate && (
                <p className="mt-1 text-sm text-red-600">{errors.dueDate}</p>
              )}
            </div>

            {/* Assigned To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Přiřazeno
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.assignedTo}
                  onChange={(e) => handleChange('assignedTo', e.target.value)}
                  placeholder="Jméno osoby"
                  className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  disabled={loading}
                />
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Poznámky
            </label>
            <div className="relative">
              <textarea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Dodatečné poznámky, tipy nebo odkazy..."
                rows={2}
                className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled={loading}
              />
              <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200">
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
                initialData ? 'Uložit změny' : 'Vytvořit úkol'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
