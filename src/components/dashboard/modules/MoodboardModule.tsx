'use client'

import { useState, useEffect } from 'react'
import { Heart, Image as ImageIcon, Plus, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useMoodboard } from '@/hooks/useMoodboard'

export default function MoodboardModule() {
  const { images, isLoading } = useMoodboard()
  const [displayImages, setDisplayImages] = useState<typeof images>([])

  // Update display images when images change
  useEffect(() => {
    setDisplayImages(images.slice(0, 6)) // Show max 6 images in preview
  }, [images])

  const favoriteImages = images.filter(img => img.isFavorite)
  const totalImages = images.length

  return (
    <div className="wedding-card h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Heart className="w-5 h-5 text-pink-600" />
          <h3 className="text-lg font-semibold text-gray-900">Moodboard</h3>
        </div>
        <Link
          href="/moodboard"
          className="text-pink-600 hover:text-pink-700 transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
        </div>
      ) : totalImages === 0 ? (
        // Empty state
        <div className="text-center py-8">
          <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 text-sm mb-4">
            Zatím nemáte žádné obrázky v moodboardu
          </p>
          <Link
            href="/moodboard"
            className="inline-flex items-center px-3 py-2 bg-pink-600 text-white text-sm rounded-lg hover:bg-pink-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Začít vytvářet
          </Link>
        </div>
      ) : (
        // Content with images
        <div className="space-y-4">
          {/* Stats */}
          <div className="flex justify-between text-sm">
            <div className="text-gray-600">
              <span className="font-medium text-gray-900">{totalImages}</span> obrázků
            </div>
            <div className="text-gray-600">
              <Heart className="w-4 h-4 inline text-pink-600 mr-1" />
              <span className="font-medium text-gray-900">{favoriteImages.length}</span> oblíbených
            </div>
          </div>

          {/* Image Grid Preview */}
          <div className="grid grid-cols-3 gap-2">
            {displayImages.map((image, index) => (
              <div
                key={image.id}
                className="aspect-square relative rounded-lg overflow-hidden bg-gray-100"
              >
                <Image
                  src={image.thumbnailUrl || image.url}
                  alt={image.title || 'Moodboard image'}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 33vw, (max-width: 1024px) 20vw, 15vw"
                />
                {image.isFavorite && (
                  <div className="absolute top-1 right-1">
                    <Heart className="w-3 h-3 text-pink-600 fill-current" />
                  </div>
                )}
                {/* Show +X more overlay on last image if there are more */}
                {index === 5 && totalImages > 6 && (
                  <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                    <span className="text-white text-xs font-medium">
                      +{totalImages - 6}
                    </span>
                  </div>
                )}
              </div>
            ))}
            
            {/* Fill empty slots if less than 6 images */}
            {displayImages.length < 6 && Array.from({ length: 6 - displayImages.length }).map((_, index) => (
              <div
                key={`empty-${index}`}
                className="aspect-square rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center"
              >
                <Plus className="w-4 h-4 text-gray-400" />
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Link
              href="/moodboard?tab=upload"
              className="flex-1 px-3 py-2 bg-pink-600 text-white text-sm rounded-lg hover:bg-pink-700 transition-colors text-center"
            >
              Nahrát fotky
            </Link>
            <Link
              href="/moodboard?tab=pinterest"
              className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors text-center"
            >
              Pinterest
            </Link>
          </div>

          {/* Recent Activity */}
          {images.length > 0 && (
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Poslední přidáno: {images[0]?.createdAt.toLocaleDateString('cs-CZ')}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
