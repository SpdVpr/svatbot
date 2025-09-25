'use client'

import { useState } from 'react'
import { X, Save, Clock } from 'lucide-react'
import { AITimelineItem } from '@/hooks/useAITimeline'

interface AddTimelineItemFormProps {
  onAdd: (item: {
    time: string
    activity: string
    duration: string
    category: AITimelineItem['category']
    location?: string
    notes?: string
  }) => void
  onCancel: () => void
  item?: AITimelineItem
  isEditing?: boolean
}

export default function AddTimelineItemForm({ onAdd, onCancel, item, isEditing = false }: AddTimelineItemFormProps) {
  const [formData, setFormData] = useState({
    time: item?.time || '12:00',
    activity: item?.activity || '',
    duration: item?.duration || '30 minut',
    category: (item?.category || 'other') as AITimelineItem['category'],
    location: item?.location || '',
    notes: item?.notes || ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.activity.trim()) return
    
    onAdd({
      ...formData,
      location: formData.location || undefined,
      notes: formData.notes || undefined
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center space-x-2">
            <Clock className="w-5 h-5 text-purple-600" />
            <span>{isEditing ? 'Upravit aktivitu' : 'Přidat aktivitu'}</span>
          </h3>
          <button
            onClick={onCancel}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Název aktivity *
            </label>
            <input
              type="text"
              value={formData.activity}
              onChange={(e) => setFormData({ ...formData, activity: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Např. Svatební obřad"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Čas
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Doba trvání
              </label>
              <input
                type="text"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="30 minut"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kategorie
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as AITimelineItem['category'] })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="preparation">💄 Příprava</option>
              <option value="ceremony">💒 Obřad</option>
              <option value="reception">🍽️ Hostina</option>
              <option value="party">🎉 Zábava</option>
              <option value="other">📋 Ostatní</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Místo
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Např. Kostel sv. Víta"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Poznámky
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows={3}
              placeholder="Dodatečné informace..."
            />
          </div>

          <div className="flex items-center space-x-3 pt-4">
            <button
              type="submit"
              className="btn-primary flex items-center space-x-2 flex-1"
            >
              <Save className="w-4 h-4" />
              <span>Přidat aktivitu</span>
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="btn-outline flex items-center space-x-2"
            >
              <X className="w-4 h-4" />
              <span>Zrušit</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
