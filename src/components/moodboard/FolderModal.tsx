'use client'

import { useState, useEffect } from 'react'
import { X, Folder, Palette } from 'lucide-react'
import { MoodboardFolder } from '@/hooks/useMoodboard'

interface FolderModalProps {
  folder?: MoodboardFolder // If provided, we're editing
  onSave: (data: { name: string; description?: string; color?: string; icon?: string }) => Promise<void>
  onClose: () => void
  loading?: boolean
}

const FOLDER_COLORS = [
  '#EF4444', // red
  '#F59E0B', // amber
  '#10B981', // green
  '#3B82F6', // blue
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#6366F1', // indigo
  '#14B8A6', // teal
]

const FOLDER_ICONS = [
  '📁', '💐', '💒', '💍', '🎂', '🌸', '✨', '💕',
  '🎨', '📸', '👗', '🎉', '🥂', '🎵', '💌', '🏰'
]

export default function FolderModal({ folder, onSave, onClose, loading }: FolderModalProps) {
  const [name, setName] = useState(folder?.name || '')
  const [description, setDescription] = useState(folder?.description || '')
  const [selectedColor, setSelectedColor] = useState(folder?.color || FOLDER_COLORS[5])
  const [selectedIcon, setSelectedIcon] = useState(folder?.icon || '📁')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Název složky je povinný')
      return
    }

    try {
      await onSave({
        name: name.trim(),
        description: description.trim() || undefined,
        color: selectedColor,
        icon: selectedIcon
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nepodařilo se uložit složku')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[150] p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-pink-100 rounded-lg">
              <Folder className="w-5 h-5 text-pink-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {folder ? 'Upravit složku' : 'Nová složka'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={loading}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Název složky *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="např. Dekorace, Květiny, Místo konání..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              disabled={loading}
              maxLength={50}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {name.length}/50 znaků
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Popis (volitelné)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Krátký popis složky..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
              disabled={loading}
              maxLength={200}
            />
            <p className="text-xs text-gray-500 mt-1">
              {description.length}/200 znaků
            </p>
          </div>

          {/* Icon */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ikona
            </label>
            <div className="grid grid-cols-8 gap-2">
              {FOLDER_ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setSelectedIcon(icon)}
                  className={`p-2 text-2xl rounded-lg border-2 transition-all ${
                    selectedIcon === icon
                      ? 'border-pink-500 bg-pink-50 scale-110'
                      : 'border-gray-200 hover:border-pink-300 hover:bg-pink-50'
                  }`}
                  disabled={loading}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
              <Palette className="w-4 h-4" />
              <span>Barva</span>
            </label>
            <div className="grid grid-cols-8 gap-2">
              {FOLDER_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`w-10 h-10 rounded-lg border-2 transition-all ${
                    selectedColor === color
                      ? 'border-gray-900 scale-110'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: color }}
                  disabled={loading}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs font-medium text-gray-600 mb-2">Náhled:</p>
            <div className="flex items-center space-x-3">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                style={{ backgroundColor: selectedColor + '20' }}
              >
                {selectedIcon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">
                  {name || 'Název složky'}
                </p>
                {description && (
                  <p className="text-xs text-gray-500 truncate">
                    {description}
                  </p>
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
              disabled={loading || !name.trim()}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 loading-spinner" />
                  <span>Ukládání...</span>
                </div>
              ) : (
                folder ? 'Uložit změny' : 'Vytvořit složku'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

