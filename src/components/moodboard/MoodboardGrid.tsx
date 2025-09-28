'use client'

import { useState } from 'react'
import { Heart, Trash2, ExternalLink, Tag, Calendar } from 'lucide-react'
import { MoodboardImage } from '@/hooks/useMoodboard'
import Image from 'next/image'

interface MoodboardGridProps {
  images: MoodboardImage[]
  onRemove: (imageId: string) => Promise<void>
  onToggleFavorite: (imageId: string) => Promise<void>
  isLoading: boolean
}

export default function MoodboardGrid({ 
  images, 
  onRemove, 
  onToggleFavorite, 
  isLoading 
}: MoodboardGridProps) {
  const [selectedImage, setSelectedImage] = useState<MoodboardImage | null>(null)
  const [filter, setFilter] = useState<'all' | 'favorites' | 'pinterest' | 'uploads'>('all')

  const filteredImages = images.filter(image => {
    switch (filter) {
      case 'favorites':
        return image.isFavorite
      case 'pinterest':
        return image.source === 'pinterest'
      case 'uploads':
        return image.source === 'upload'
      default:
        return true
    }
  })

  const handleRemove = async (imageId: string) => {
    if (confirm('Opravdu chcete smazat tento obrázek?')) {
      try {
        await onRemove(imageId)
      } catch (err) {
        alert('Nepodařilo se smazat obrázek')
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

  return (
    <div className="space-y-6">
      {/* Filters */}
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

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredImages.map((image) => (
          <div
            key={image.id}
            className="group relative bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedImage(image)}
          >
            {/* Image */}
            <div className="aspect-square relative">
              <Image
                src={image.thumbnailUrl || image.url}
                alt={image.title || 'Moodboard image'}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200" />
              
              {/* Actions */}
              <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleToggleFavorite(image.id)
                  }}
                  className={`p-1.5 rounded-full backdrop-blur-sm transition-colors ${
                    image.isFavorite
                      ? 'bg-pink-500 text-white'
                      : 'bg-white/80 text-gray-600 hover:bg-white'
                  }`}
                >
                  <Heart className={`w-3 h-3 ${image.isFavorite ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemove(image.id)
                  }}
                  className="p-1.5 rounded-full bg-white/80 text-gray-600 hover:bg-white hover:text-red-600 backdrop-blur-sm transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>

              {/* Source indicator */}
              <div className="absolute bottom-2 left-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  image.source === 'pinterest'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {image.source === 'pinterest' ? 'Pinterest' : 'Nahráno'}
                </span>
              </div>
            </div>

            {/* Title */}
            {image.title && (
              <div className="p-2">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {image.title}
                </p>
              </div>
            )}
          </div>
        ))}
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
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex">
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
              <div className="w-80 p-6 border-l border-gray-200">
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

                <div className="flex space-x-2 mt-6">
                  <button
                    onClick={() => handleToggleFavorite(selectedImage.id)}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedImage.isFavorite
                        ? 'bg-pink-100 text-pink-700 hover:bg-pink-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Heart className={`w-4 h-4 inline mr-2 ${selectedImage.isFavorite ? 'fill-current' : ''}`} />
                    {selectedImage.isFavorite ? 'Oblíbené' : 'Přidat k oblíbeným'}
                  </button>
                  <button
                    onClick={() => handleRemove(selectedImage.id)}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium transition-colors"
                  >
                    <Trash2 className="w-4 h-4 inline mr-2" />
                    Smazat
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
