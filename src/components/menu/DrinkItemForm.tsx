'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { DrinkFormData, DRINK_CATEGORY_LABELS, MENU_STATUS_LABELS } from '@/types/menu'

interface DrinkItemFormProps {
  onSubmit: (data: DrinkFormData) => Promise<void>
  onCancel: () => void
  initialData?: Partial<DrinkFormData>
  loading?: boolean
}

export default function DrinkItemForm({ onSubmit, onCancel, initialData, loading }: DrinkItemFormProps) {
  const [formData, setFormData] = useState<DrinkFormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    category: initialData?.category || 'non-alcoholic',
    brand: initialData?.brand || '',
    volume: initialData?.volume || '',
    estimatedQuantity: initialData?.estimatedQuantity || 0,
    pricePerUnit: initialData?.pricePerUnit || undefined,
    vendorName: initialData?.vendorName || '',
    status: initialData?.status || 'planned',
    servingTime: initialData?.servingTime || '',
    isAlcoholic: initialData?.isAlcoholic || false,
    alcoholContent: initialData?.alcoholContent || undefined,
    notes: initialData?.notes || '',
    tags: initialData?.tags || []
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {initialData ? 'Upravit nápoj' : 'Přidat nápoj'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Název nápoje *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="např. Prosecco"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Popis
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows={3}
                placeholder="Popis nápoje..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kategorie *
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {Object.entries(DRINK_CATEGORY_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stav *
                </label>
                <select
                  required
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {Object.entries(MENU_STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Značka
                </label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="např. Bohemia Sekt"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Objem
                </label>
                <input
                  type="text"
                  value={formData.volume}
                  onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="např. 0.75L"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Počet kusů *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.estimatedQuantity}
                  onChange={(e) => setFormData({ ...formData, estimatedQuantity: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cena za kus (Kč)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.pricePerUnit || ''}
                  onChange={(e) => setFormData({ ...formData, pricePerUnit: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Alcohol Info */}
          <div className="space-y-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isAlcoholic}
                onChange={(e) => setFormData({ ...formData, isAlcoholic: e.target.checked })}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm font-medium text-gray-700">Alkoholický nápoj</span>
            </label>
          </div>

          {/* Additional Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dodavatel
              </label>
              <input
                type="text"
                value={formData.vendorName}
                onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Název dodavatele"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Čas servírování
              </label>
              <input
                type="text"
                value={formData.servingTime}
                onChange={(e) => setFormData({ ...formData, servingTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="např. Celý den nebo Večer"
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
                placeholder="Další poznámky..."
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={loading}
            >
              Zrušit
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Ukládám...' : initialData ? 'Uložit změny' : 'Přidat nápoj'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

