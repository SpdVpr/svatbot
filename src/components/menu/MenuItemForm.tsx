'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { MenuFormData, FOOD_CATEGORY_LABELS, MENU_STATUS_LABELS, SERVING_STYLE_OPTIONS, COMMON_ALLERGENS } from '@/types/menu'

interface MenuItemFormProps {
  onSubmit: (data: MenuFormData) => Promise<void>
  onCancel: () => void
  initialData?: Partial<MenuFormData>
  loading?: boolean
}

export default function MenuItemForm({ onSubmit, onCancel, initialData, loading }: MenuItemFormProps) {
  const [formData, setFormData] = useState<MenuFormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    category: initialData?.category || 'main-course',
    servingSize: initialData?.servingSize || '',
    estimatedQuantity: initialData?.estimatedQuantity || 0,
    isVegetarian: initialData?.isVegetarian || false,
    isVegan: initialData?.isVegan || false,
    isGlutenFree: initialData?.isGlutenFree || false,
    isLactoseFree: initialData?.isLactoseFree || false,
    allergens: initialData?.allergens || [],
    pricePerServing: initialData?.pricePerServing || undefined,
    totalPrice: initialData?.totalPrice || undefined,
    vendorName: initialData?.vendorName || '',
    status: initialData?.status || 'planned',
    servingStyle: initialData?.servingStyle || undefined,
    servingTime: initialData?.servingTime || '',
    notes: initialData?.notes || '',
    tags: initialData?.tags || []
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
  }

  const toggleAllergen = (allergen: string) => {
    setFormData(prev => ({
      ...prev,
      allergens: prev.allergens.includes(allergen)
        ? prev.allergens.filter(a => a !== allergen)
        : [...prev.allergens, allergen]
    }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {initialData ? 'Upravit jídlo' : 'Přidat jídlo'}
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
                Název jídla *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="např. Hovězí svíčková"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Popis
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                rows={3}
                placeholder="Popis jídla..."
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  {Object.entries(FOOD_CATEGORY_LABELS).map(([value, label]) => (
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
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
                  Velikost porce
                </label>
                <input
                  type="text"
                  value={formData.servingSize}
                  onChange={(e) => setFormData({ ...formData, servingSize: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="např. 200g"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Počet porcí *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.estimatedQuantity}
                  onChange={(e) => setFormData({ ...formData, estimatedQuantity: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cena za porci (Kč)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.pricePerServing || ''}
                  onChange={(e) => setFormData({ ...formData, pricePerServing: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Celková cena (Kč)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.totalPrice || ''}
                  onChange={(e) => setFormData({ ...formData, totalPrice: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="např. u dortu"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Způsob servírování
                </label>
                <select
                  value={formData.servingStyle || ''}
                  onChange={(e) => setFormData({ ...formData, servingStyle: e.target.value as any || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="">Vyberte...</option>
                  {Object.entries(SERVING_STYLE_OPTIONS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Dietary Options */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Dietní možnosti
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isVegetarian}
                  onChange={(e) => setFormData({ ...formData, isVegetarian: e.target.checked })}
                  className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                />
                <span className="text-sm">Vegetariánské</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isVegan}
                  onChange={(e) => setFormData({ ...formData, isVegan: e.target.checked })}
                  className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                />
                <span className="text-sm">Veganské</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isGlutenFree}
                  onChange={(e) => setFormData({ ...formData, isGlutenFree: e.target.checked })}
                  className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                />
                <span className="text-sm">Bezlepkové</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isLactoseFree}
                  onChange={(e) => setFormData({ ...formData, isLactoseFree: e.target.checked })}
                  className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                />
                <span className="text-sm">Bez laktózy</span>
              </label>
            </div>
          </div>

          {/* Allergens */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Alergeny
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {COMMON_ALLERGENS.map((allergen) => (
                <label key={allergen} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.allergens.includes(allergen)}
                    onChange={() => toggleAllergen(allergen)}
                    className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                  />
                  <span className="text-sm">{allergen}</span>
                </label>
              ))}
            </div>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="např. 18:00 nebo Po obřadu"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Poznámky
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
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
              {loading ? 'Ukládám...' : initialData ? 'Uložit změny' : 'Přidat jídlo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

