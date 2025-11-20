'use client'

import { useState, useEffect } from 'react'
import { X, Link as LinkIcon, Image as ImageIcon, Coins, Tag, Loader } from 'lucide-react'
import { ShoppingItem, ShoppingFormData, SHOPPING_CATEGORIES } from '@/types/shopping'
import { useShopping } from '@/hooks/useShopping'
import { useCurrency } from '@/contexts/CurrencyContext'
import ShoppingImageUpload from './ShoppingImageUpload'

interface ShoppingItemFormProps {
  item?: ShoppingItem
  onClose: () => void
}

export default function ShoppingItemForm({ item, onClose }: ShoppingItemFormProps) {
  const { addItem, updateItem } = useShopping()
  const { currency: selectedCurrency } = useCurrency()
  const [loading, setLoading] = useState(false)
  const [fetchingMetadata, setFetchingMetadata] = useState(false)
  const [lastFetchedUrl, setLastFetchedUrl] = useState<string>('')
  const [formData, setFormData] = useState<ShoppingFormData>({
    name: item?.name || '',
    url: item?.url || '',
    imageUrl: item?.imageUrl || '',
    price: item?.price || undefined,
    quantity: item?.quantity || undefined,
    currency: item?.currency || selectedCurrency,
    description: item?.description || '',
    category: item?.category || undefined,
    priority: item?.priority || undefined,
    status: item?.status || 'wishlist',
    notes: item?.notes || '',
    tags: item?.tags || []
  })

  const handleChange = (field: keyof ShoppingFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Auto-fetch metadata when URL changes (with debounce)
  useEffect(() => {
    const url = formData.url?.trim()
    if (url && url.startsWith('http') && url !== lastFetchedUrl) {
      console.log('🔄 URL changed, scheduling metadata fetch:', url)
      const timeoutId = setTimeout(() => {
        console.log('⏰ Debounce timeout reached, fetching metadata...')
        fetchMetadata(url)
      }, 1500) // Wait 1.5 seconds after user stops typing

      return () => {
        console.log('🧹 Cleaning up timeout')
        clearTimeout(timeoutId)
      }
    }
  }, [formData.url, lastFetchedUrl])

  // Fetch metadata from URL
  const fetchMetadata = async (url: string) => {
    if (!url || !url.startsWith('http') || url === lastFetchedUrl) return

    setFetchingMetadata(true)
    setLastFetchedUrl(url)

    try {
      const response = await fetch(`/api/metadata?url=${encodeURIComponent(url)}`)
      const metadata = await response.json()

      console.log('📦 Fetched metadata:', metadata)

      // Check if we got any useful data
      if (metadata.title || metadata.image || metadata.price) {
        console.log('✅ Auto-filling fields:', {
          title: metadata.title,
          image: metadata.image,
          price: metadata.price
        })

        // Auto-fill fields if they're empty
        setFormData(prev => {
          const newData = {
            ...prev,
            name: metadata.title && !prev.name ? metadata.title : prev.name,
            imageUrl: metadata.image && !prev.imageUrl ? metadata.image : prev.imageUrl,
            price: metadata.price && !prev.price ? parseFloat(metadata.price) : prev.price,
            description: metadata.description && !prev.description ? metadata.description : prev.description
          }
          console.log('📝 New form data:', newData)
          return newData
        })
      } else if (metadata.error) {
        console.warn('Could not fetch metadata:', metadata.error)
        // Don't show error to user, just let them fill manually
      }
    } catch (error) {
      console.error('Error fetching metadata:', error)
      // Don't show error to user, just let them fill manually
    } finally {
      setFetchingMetadata(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      alert('Vyplňte název produktu')
      return
    }

    setLoading(true)
    try {
      if (item) {
        await updateItem(item.id, formData)
      } else {
        await addItem(formData)
      }
      onClose()
    } catch (error) {
      console.error('Error saving item:', error)
      alert('Chyba při ukládání produktu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[150] p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-primary-600 p-6 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-white">
            {item ? 'Upravit produkt' : 'Přidat produkt'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <LinkIcon className="w-4 h-4 inline mr-1" />
              URL produktu
            </label>
            <div className="relative">
              <input
                type="url"
                value={formData.url}
                onChange={(e) => handleChange('url', e.target.value)}
                placeholder="https://..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              {fetchingMetadata && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader className="w-5 h-5 text-primary-600 animate-spin" />
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {fetchingMetadata
                ? '⏳ Načítám informace o produktu...'
                : 'Vložte URL a automaticky se načtou informace (pokud jsou dostupné). Jinak vyplňte ručně.'
              }
            </p>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Název produktu *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Např. Svatební dekorace"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Image Upload or URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <ImageIcon className="w-4 h-4 inline mr-1" />
              Obrázek produktu
            </label>

            {/* Image Upload Component */}
            <ShoppingImageUpload
              imageUrl={formData.imageUrl || ''}
              onImageChange={(url) => handleChange('imageUrl', url)}
              disabled={loading}
            />

            {/* Alternative: Manual URL input */}
            <div className="mt-4">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Nebo vložte URL obrázku:
              </label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => handleChange('imageUrl', e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Price, Quantity and Currency */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Coins className="w-4 h-4 inline mr-1" />
                Cena za kus
              </label>
              <input
                type="number"
                value={formData.price || ''}
                onChange={(e) => handleChange('price', e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="0"
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Počet kusů
              </label>
              <input
                type="number"
                value={formData.quantity || ''}
                onChange={(e) => handleChange('quantity', e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="1"
                min="1"
                step="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Měna
              </label>
              <select
                value={formData.currency}
                onChange={(e) => handleChange('currency', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="CZK">CZK</option>
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>

          {/* Total Price Display */}
          {formData.price && formData.quantity && formData.quantity > 1 && (
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Celková cena:</span>
                <span className="text-lg font-bold text-primary-600">
                  {(formData.price * formData.quantity).toFixed(2)} {formData.currency}
                </span>
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Popis
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Popis produktu..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Category and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Tag className="w-4 h-4 inline mr-1" />
                Kategorie
              </label>
              <select
                value={formData.category || ''}
                onChange={(e) => handleChange('category', e.target.value || undefined)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Bez kategorie</option>
                {SHOPPING_CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priorita
              </label>
              <select
                value={formData.priority || ''}
                onChange={(e) => handleChange('priority', e.target.value || undefined)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Bez priority</option>
                <option value="low">Nízká</option>
                <option value="medium">Střední</option>
                <option value="high">Vysoká</option>
              </select>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stav
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="wishlist">💭 Přání</option>
              <option value="to-buy">🛒 Koupit</option>
              <option value="ordered">📦 Objednáno</option>
              <option value="purchased">✅ Zakoupeno</option>
              <option value="cancelled">❌ Zrušeno</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Poznámky
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Další poznámky..."
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Zrušit
            </button>
            <button
              type="submit"
              className="btn-primary px-6 py-2"
              disabled={loading || fetchingMetadata}
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin mr-2" />
                  Ukládám...
                </>
              ) : (
                item ? 'Uložit změny' : 'Přidat produkt'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

