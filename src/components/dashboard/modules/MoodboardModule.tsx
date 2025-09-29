'use client'

import { useState, useEffect } from 'react'
import { Heart, Image as ImageIcon, Plus, ArrowRight, Palette } from 'lucide-react'
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
            className="btn-primary inline-flex items-center space-x-2"
          >
            <Palette className="w-4 h-4" />
            <span>Spravovat moodboard</span>
            <ArrowRight className="w-4 h-4" />
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

          {/* Image Grid Preview - Moodboard style */}
          <div className="grid grid-cols-3 gap-2">
            {displayImages.map((image, index) => (
              <div
                key={image.id}
                className="relative rounded-xl overflow-hidden bg-gray-100 shadow-sm hover:shadow-md transition-shadow"
                style={{
                  aspectRatio: index % 3 === 0 ? '1' : index % 3 === 1 ? '4/5' : '5/4'
                }}
              >
                <Image
                  src={image.thumbnailUrl || image.url}
                  alt={image.title || 'Moodboard image'}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 33vw, (max-width: 1024px) 20vw, 15vw"
                />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

                {image.isFavorite && (
                  <div className="absolute top-2 right-2 bg-pink-500 text-white p-1 rounded-full shadow-lg">
                    <Heart className="w-2.5 h-2.5 fill-current" />
                  </div>
                )}

                {/* Source indicator */}
                <div className="absolute bottom-2 left-2">
                  {image.source === 'pinterest' && (
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  )}
                  {image.source === 'upload' && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </div>

                {/* Show +X more overlay on last image if there are more */}
                {index === 5 && totalImages > 6 && (
                  <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
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
                className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center hover:border-pink-300 hover:bg-pink-50 transition-colors cursor-pointer"
                onClick={() => window.location.href = '/moodboard'}
              >
                <Plus className="w-5 h-5 text-gray-400" />
              </div>
            ))}
          </div>

          {/* Action Button */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <Link
              href="/moodboard"
              className="btn-primary w-full flex items-center justify-center space-x-2"
            >
              <Palette className="w-4 h-4" />
              <span>Spravovat moodboard</span>
              <ArrowRight className="w-4 h-4" />
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
