'use client'

import { useState, useEffect } from 'react'
import { Heart, Trash2, ExternalLink, Tag, Calendar, X } from 'lucide-react'
import { MoodboardImage, WEDDING_CATEGORIES, WeddingCategory } from '@/hooks/useMoodboard'
import Image from 'next/image'
import SimpleMoodboardCard from './SimpleMoodboardCard'

interface MoodboardGridProps {
  images: MoodboardImage[]
  onRemove: (imageId: string) => Promise<void>
  onToggleFavorite: (imageId: string) => Promise<void>
  onPositionChange?: (imageId: string, position: { x: number; y: number }, size?: { width: number; height: number }) => void
  onUpdateCategory?: (imageId: string, category: WeddingCategory) => Promise<void>
  isLoading: boolean
}

export default function MoodboardGrid({
  images,
  onRemove,
  onToggleFavorite,
  onPositionChange,
  onUpdateCategory,
  isLoading
}: MoodboardGridProps) {
  const [selectedImage, setSelectedImage] = useState<MoodboardImage | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isEditingCategory, setIsEditingCategory] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<WeddingCategory>('other')

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedImage && !isDeleting) {
        setSelectedImage(null)
      }
    }

    if (selectedImage) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [selectedImage, isDeleting])
  const [filter, setFilter] = useState<'all' | 'favorites' | 'pinterest' | 'uploads' | WeddingCategory>('all')

  const filteredImages = images.filter(image => {
    switch (filter) {
      case 'favorites':
        return image.isFavorite
      case 'pinterest':
        return image.source === 'pinterest'
      case 'uploads':
        return image.source === 'upload'
      case 'all':
        return true
      default:
        // Filter by category
        return image.category === filter
    }
  })

  const handleRemove = async (imageId: string) => {
    if (confirm('Opravdu chcete smazat tento obrázek?')) {
      try {
        setIsDeleting(true)
        await onRemove(imageId)
        // Close modal if the deleted image was selected
        if (selectedImage && selectedImage.id === imageId) {
          setSelectedImage(null)
        }
      } catch (err) {
        alert('Nepodařilo se smazat obrázek')
      } finally {
        setIsDeleting(false)
      }
    }
  }

  const handleToggleFavorite = async (imageId: string) => {
    try {
      await onToggleFavorite(imageId)
    } catch (err) {
      alert('Nepodařilo se aktualizovat oblíbené')
    }
  }

  const handleUpdateCategory = async (imageId: string, category: WeddingCategory) => {
    if (!onUpdateCategory) return

    try {
      await onUpdateCategory(imageId, category)
      setIsEditingCategory(false)
    } catch (err) {
      alert('Nepodařilo se změnit kategorii obrázku')
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="space-y-4">
        {/* Main filters */}
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'Všechny', count: images.length },
            { key: 'favorites', label: 'Oblíbené', count: images.filter(img => img.isFavorite).length },
            { key: 'pinterest', label: 'Pinterest', count: images.filter(img => img.source === 'pinterest').length },
            { key: 'uploads', label: 'Nahrané', count: images.filter(img => img.source === 'upload').length }
          ].map(filterOption => (
            <button
              key={filterOption.key}
              onClick={() => setFilter(filterOption.key as any)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filter === filterOption.key
                  ? 'bg-pink-100 text-pink-700 border border-pink-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filterOption.label} ({filterOption.count})
            </button>
          ))}
        </div>

        {/* Category filters */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Kategorie</h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(WEDDING_CATEGORIES).map(([key, category]) => {
              const count = images.filter(img => img.category === key).length
              if (count === 0) return null

              return (
                <button
                  key={key}
                  onClick={() => setFilter(key as WeddingCategory)}
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filter === key
                      ? category.color + ' border border-current'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span className="mr-1">{category.icon}</span>
                  {category.label} ({count})
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Interactive Moodboard Canvas */}
      <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 md:p-8 min-h-[800px] md:min-h-[1200px] overflow-hidden border border-gray-200 touch-none">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `
                radial-gradient(circle at 1px 1px, rgba(0,0,0,0.15) 1px, transparent 0)
              `,
              backgroundSize: '15px 15px'
            }}
          />
        </div>

        {/* Moodboard title overlay */}
        <div className="absolute top-4 left-4 text-gray-400 text-sm font-medium pointer-events-none">
          Svatební Moodboard • {filteredImages.length} {filteredImages.length === 1 ? 'obrázek' : filteredImages.length < 5 ? 'obrázky' : 'obrázků'}
        </div>

        {/* Images */}
        {filteredImages.map((image) => (
          <SimpleMoodboardCard
            key={image.id}
            image={image}
            onToggleFavorite={handleToggleFavorite}
            onRemove={handleRemove}
            onImageClick={setSelectedImage}
            onPositionChange={onPositionChange || (() => {})}
          />
        ))}

        {/* Instructions overlay when empty */}
        {filteredImages.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center text-gray-400">
              <div className="text-6xl mb-4">🎨</div>
              <p className="text-lg font-medium">Váš moodboard je prázdný</p>
              <p className="text-sm">Přidejte obrázky a uspořádejte je přetažením</p>
            </div>
          </div>
        )}
      </div>

      {/* Empty state */}
      {filteredImages.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            {filter === 'all' ? (
              <Heart className="w-16 h-16 mx-auto" />
            ) : (
              <Tag className="w-16 h-16 mx-auto" />
            )}
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {filter === 'favorites' && 'Žádné oblíbené obrázky'}
            {filter === 'pinterest' && 'Žádné obrázky z Pinterestu'}
            {filter === 'uploads' && 'Žádné nahrané obrázky'}
            {filter === 'all' && 'Žádné obrázky'}
          </h3>
          <p className="text-gray-600">
            {filter === 'all' 
              ? 'Začněte přidáváním obrázků do vašeho moodboardu'
              : 'Zkuste změnit filtr nebo přidat více obrázků'
            }
          </p>
        </div>
      )}

      {/* Image Detail Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isDeleting) {
              setSelectedImage(null)
            }
          }}
        >
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden relative mx-4">
            {/* Close button */}
            <button
              onClick={() => !isDeleting && setSelectedImage(null)}
              disabled={isDeleting}
              className="absolute top-2 right-2 md:top-4 md:right-4 z-10 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-colors disabled:opacity-50"
            >
              <X className="w-4 h-4 md:w-5 md:h-5" />
            </button>

            <div className="flex flex-col md:flex-row">
              {/* Image */}
              <div className="flex-1 relative">
                <Image
                  src={selectedImage.url}
                  alt={selectedImage.title || 'Moodboard image'}
                  width={800}
                  height={600}
                  className="object-contain max-h-[70vh]"
                />
              </div>
              
              {/* Details */}
              <div className="w-full md:w-80 p-4 md:p-6 md:border-l border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedImage.title || 'Bez názvu'}
                  </h3>
                  <button
                    onClick={() => setSelectedImage(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>

                {selectedImage.description && (
                  <p className="text-gray-600 mb-4">{selectedImage.description}</p>
                )}

                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{selectedImage.createdAt.toLocaleDateString('cs-CZ')}</span>
                  </div>

                  {selectedImage.source === 'pinterest' && selectedImage.sourceUrl && (
                    <a
                      href={selectedImage.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-sm text-pink-600 hover:text-pink-700"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Zobrazit na Pinterestu</span>
                    </a>
                  )}

                  {/* Category section */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-900">Kategorie:</p>
                      {!isEditingCategory && (
                        <button
                          onClick={() => {
                            setSelectedCategory(selectedImage.category)
                            setIsEditingCategory(true)
                          }}
                          className="text-xs text-pink-600 hover:text-pink-700"
                        >
                          Upravit
                        </button>
                      )}
                    </div>

                    {isEditingCategory ? (
                      <div className="space-y-2">
                        <select
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value as WeddingCategory)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
                        >
                          {Object.entries(WEDDING_CATEGORIES).map(([key, category]) => (
                            <option key={key} value={key}>
                              {category.icon} {category.label}
                            </option>
                          ))}
                        </select>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleUpdateCategory(selectedImage.id, selectedCategory)}
                            className="px-3 py-1 bg-pink-600 text-white text-xs rounded hover:bg-pink-700"
                          >
                            Uložit
                          </button>
                          <button
                            onClick={() => setIsEditingCategory(false)}
                            className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300"
                          >
                            Zrušit
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{WEDDING_CATEGORIES[selectedImage.category]?.icon}</span>
                        <span className="text-sm text-gray-700">{WEDDING_CATEGORIES[selectedImage.category]?.label}</span>
                      </div>
                    )}
                  </div>

                  {selectedImage.tags.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-2">Tagy:</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedImage.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-6">
                  <button
                    onClick={() => handleToggleFavorite(selectedImage.id)}
                    className={`flex-1 px-4 py-3 sm:py-2 rounded-lg font-medium transition-colors ${
                      selectedImage.isFavorite
                        ? 'bg-pink-100 text-pink-700 hover:bg-pink-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Heart className={`w-4 h-4 inline mr-2 ${selectedImage.isFavorite ? 'fill-current' : ''}`} />
                    <span className="hidden sm:inline">{selectedImage.isFavorite ? 'Oblíbené' : 'Přidat k oblíbeným'}</span>
                    <span className="sm:hidden">{selectedImage.isFavorite ? '❤️' : '🤍'}</span>
                  </button>
                  <button
                    onClick={() => handleRemove(selectedImage.id)}
                    disabled={isDeleting}
                    className={`px-4 py-3 sm:py-2 rounded-lg font-medium transition-colors ${
                      isDeleting
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                    }`}
                  >
                    <Trash2 className="w-4 h-4 inline mr-2" />
                    {isDeleting ? 'Mazání...' : 'Smazat'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
