'use client'

import { useState } from 'react'
import {
  ExternalLink,
  Edit,
  Trash2,
  CheckCircle,
  Circle,
  Tag,
  Calendar
} from 'lucide-react'
import { ShoppingItem, SHOPPING_CATEGORIES } from '@/types/shopping'
import { useShopping } from '@/hooks/useShopping'
import { currencyUtils } from '@/utils'
import ShoppingItemForm from './ShoppingItemForm'

interface ShoppingItemCardProps {
  item: ShoppingItem
  viewMode: 'grid' | 'list'
}

export default function ShoppingItemCard({ item, viewMode }: ShoppingItemCardProps) {
  const { togglePurchased, deleteItem } = useShopping()
  const [showEditForm, setShowEditForm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const category = SHOPPING_CATEGORIES.find(c => c.value === item.category)

  const handleTogglePurchased = async () => {
    try {
      await togglePurchased(item.id)
    } catch (error) {
      console.error('Error toggling purchased:', error)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Opravdu chcete smazat tento produkt?')) return
    
    setIsDeleting(true)
    try {
      await deleteItem(item.id)
    } catch (error) {
      console.error('Error deleting item:', error)
      setIsDeleting(false)
    }
  }

  if (viewMode === 'list') {
    return (
      <>
        <div className="wedding-card flex items-center gap-4">
          {/* Checkbox */}
          <button
            onClick={handleTogglePurchased}
            className="flex-shrink-0"
          >
            {item.isPurchased ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : (
              <Circle className="w-6 h-6 text-gray-400 hover:text-purple-600" />
            )}
          </button>

          {/* Image */}
          {item.imageUrl && (
            <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className={`font-semibold text-gray-900 truncate ${item.isPurchased ? 'line-through text-gray-500' : ''}`}>
                  {item.name}
                </h3>
                {item.description && (
                  <p className="text-sm text-gray-600 line-clamp-1">{item.description}</p>
                )}
                <div className="flex items-center gap-3 mt-1">
                  {category && (
                    <span className="text-xs text-gray-500">
                      {category.icon} {category.label}
                    </span>
                  )}
                  {item.price && (
                    <div className="flex items-center gap-2">
                      {item.quantity && item.quantity > 1 ? (
                        <>
                          <span className="text-xs text-gray-500">
                            {item.quantity}× {currencyUtils.format(item.price, item.currency)}
                          </span>
                          <span className="text-sm font-semibold text-purple-600">
                            = {currencyUtils.format(item.price * item.quantity, item.currency)}
                          </span>
                        </>
                      ) : (
                        <span className="text-sm font-semibold text-purple-600">
                          {currencyUtils.format(item.price, item.currency)}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Otevřít odkaz"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                <button
                  onClick={() => setShowEditForm(true)}
                  className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                  title="Upravit"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  title="Smazat"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {showEditForm && (
          <ShoppingItemForm
            item={item}
            onClose={() => setShowEditForm(false)}
          />
        )}
      </>
    )
  }

  // Grid view
  return (
    <>
      <div className="wedding-card group relative overflow-hidden">
        {/* Purchased Badge */}
        {item.isPurchased && (
          <div className="absolute top-3 right-3 z-10 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Zakoupeno
          </div>
        )}

        {/* Image */}
        <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <Tag className="w-16 h-16" />
            </div>
          )}
          
          {/* Hover Actions */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
            <button
              onClick={handleTogglePurchased}
              className="p-3 bg-white rounded-full hover:bg-green-50 transition-colors"
              title={item.isPurchased ? 'Označit jako nezakoupeno' : 'Označit jako zakoupeno'}
            >
              {item.isPurchased ? (
                <Circle className="w-5 h-5 text-gray-600" />
              ) : (
                <CheckCircle className="w-5 h-5 text-green-600" />
              )}
            </button>
            {item.url && (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-white rounded-full hover:bg-blue-50 transition-colors"
                title="Otevřít odkaz"
              >
                <ExternalLink className="w-5 h-5 text-blue-600" />
              </a>
            )}
            <button
              onClick={() => setShowEditForm(true)}
              className="p-3 bg-white rounded-full hover:bg-purple-50 transition-colors"
              title="Upravit"
            >
              <Edit className="w-5 h-5 text-purple-600" />
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-3 bg-white rounded-full hover:bg-red-50 transition-colors disabled:opacity-50"
              title="Smazat"
            >
              <Trash2 className="w-5 h-5 text-red-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h3 className={`font-semibold text-gray-900 line-clamp-2 ${item.isPurchased ? 'line-through text-gray-500' : ''}`}>
            {item.name}
          </h3>
          
          {item.description && (
            <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
          )}

          <div className="pt-2 border-t border-gray-100 space-y-2">
            <div className="flex items-center justify-between">
              {category && (
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <span>{category.icon}</span>
                  <span>{category.label}</span>
                </span>
              )}
            </div>

            {item.price && (
              <div className="space-y-1">
                {item.quantity && item.quantity > 1 ? (
                  <>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Cena za kus:</span>
                      <span>{currencyUtils.format(item.price, item.currency)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Počet kusů:</span>
                      <span>{item.quantity}×</span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                      <span className="text-sm font-medium text-gray-700">Celkem:</span>
                      <span className="text-sm font-bold text-purple-600">
                        {currencyUtils.format(item.price * item.quantity, item.currency)}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Cena:</span>
                    <span className="text-sm font-bold text-purple-600">
                      {currencyUtils.format(item.price, item.currency)}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {item.purchaseDate && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Calendar className="w-3 h-3" />
              <span>Zakoupeno: {new Date(item.purchaseDate).toLocaleDateString('cs-CZ')}</span>
            </div>
          )}
        </div>
      </div>

      {showEditForm && (
        <ShoppingItemForm
          item={item}
          onClose={() => setShowEditForm(false)}
        />
      )}
    </>
  )
}

