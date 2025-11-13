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
    <div className="wedding-card h-[514px] flex flex-col">
      <Link href="/moodboard" className="block mb-4 flex-shrink-0">
        <h3 className="text-base sm:text-lg font-semibold flex items-center justify-start sm:justify-center space-x-2 hover:text-primary-600 transition-colors">
          <Palette className="w-4 h-4 sm:w-5 sm:h-5 text-pink-600 flex-shrink-0" />
          <span className="truncate">Moodboard</span>
        </h3>
      </Link>

      {isLoading ? (
        <div className="flex items-center justify-center flex-1">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
        </div>
      ) : totalImages === 0 ? (
        // Empty state
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <ImageIcon className="w-12 h-12 text-gray-300 mb-3" />
          <p className="text-gray-600 text-sm mb-4">
            Zatím nemáte žádné obrázky v moodboardu
          </p>
          <Link
            href="/moodboard"
            className="btn-primary inline-flex items-center justify-center space-x-2"
          >
            <Palette className="w-4 h-4" />
            <span>Spravovat moodboard</span>
          </Link>
        </div>
      ) : (
        // Content with images
        <div className="flex-1 flex flex-col min-h-0">
          {/* Stats */}
          <div className="flex justify-between text-sm mb-3 flex-shrink-0">
            <div className="text-gray-600">
              <span className="font-medium text-gray-900">{totalImages}</span> obrázků
            </div>
            <div className="text-gray-600">
              <Heart className="w-4 h-4 inline text-pink-600 mr-1" />
              <span className="font-medium text-gray-900">{favoriteImages.length}</span> oblíbených
            </div>
          </div>

          {/* Image Grid Preview - Pinterest/Masonry style */}
          <div className="flex-1 mb-3 overflow-hidden">
            <div className="grid grid-cols-3 gap-2 auto-rows-[80px]">
              {displayImages.map((image, index) => {
                // Create varied heights for Pinterest effect
                const heights = ['row-span-2', 'row-span-3', 'row-span-2', 'row-span-3', 'row-span-2', 'row-span-3']
                const heightClass = heights[index % heights.length]

                return (
                  <div
                    key={image.id}
                    className={`relative rounded-xl overflow-hidden bg-gray-100 shadow-sm hover:shadow-md transition-shadow ${heightClass}`}
                  >
                    <Image
                      src={image.url}
                      alt={image.title || 'Moodboard image'}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 33vw, (max-width: 1024px) 20vw, 15vw"
                      quality={90}
                    />

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

                    {image.isFavorite && (
                      <div className="absolute top-2 right-2 bg-pink-500 text-white p-1 rounded-full shadow-lg">
                        <Heart className="w-2.5 h-2.5 fill-current" />
                      </div>
                    )}

                    {/* Show +X more overlay on last image if there are more */}
                    {index === 5 && totalImages > 6 && (
                      <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
                        <span className="text-white text-sm font-semibold">
                          +{totalImages - 6}
                        </span>
                      </div>
                    )}
                  </div>
                )
              })}

              {/* Fill empty slots if less than 6 images */}
              {displayImages.length < 6 && Array.from({ length: 6 - displayImages.length }).map((_, index) => {
                const heights = ['row-span-2', 'row-span-3', 'row-span-2', 'row-span-3', 'row-span-2', 'row-span-3']
                const heightClass = heights[(displayImages.length + index) % heights.length]

                return (
                  <div
                    key={`empty-${index}`}
                    className={`rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center hover:border-pink-300 hover:bg-pink-50 transition-colors cursor-pointer ${heightClass}`}
                    onClick={() => window.location.href = '/moodboard'}
                  >
                    <Plus className="w-5 h-5 text-gray-400" />
                  </div>
                )
              })}
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-3 border-t border-gray-200 flex-shrink-0">
            <Link
              href="/moodboard"
              className="btn-primary w-full flex items-center justify-center space-x-2"
            >
              <Palette className="w-4 h-4" />
              <span>Spravovat moodboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
