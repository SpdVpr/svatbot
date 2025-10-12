'use client'

import { useState } from 'react'
import { Camera, X, ChevronLeft, ChevronRight } from 'lucide-react'
import type { GalleryContent, GalleryImage } from '@/types/wedding-website'

interface GallerySectionProps {
  content: GalleryContent
}

export default function ClassicGallerySection({ content }: GallerySectionProps) {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAll, setShowAll] = useState(false)

  const images = content.images || []
  const displayedImages = showAll ? images : images.slice(0, 9)

  const openLightbox = (image: GalleryImage, index: number) => {
    setSelectedImage(image)
    setCurrentIndex(index)
  }

  const closeLightbox = () => {
    setSelectedImage(null)
  }

  const nextImage = () => {
    const nextIndex = (currentIndex + 1) % images.length
    setCurrentIndex(nextIndex)
    setSelectedImage(images[nextIndex])
  }

  const prevImage = () => {
    const prevIndex = (currentIndex - 1 + images.length) % images.length
    setCurrentIndex(prevIndex)
    setSelectedImage(images[prevIndex])
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') closeLightbox()
    if (e.key === 'ArrowRight') nextImage()
    if (e.key === 'ArrowLeft') prevImage()
  }

  if (images.length === 0) {
    return (
      <section className="py-24 bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {content.title || 'Fotogalerie'}
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-pink-500 to-purple-500 mx-auto mb-6"></div>
            {content.subtitle && (
              <p className="text-xl text-gray-600 mb-4">{content.subtitle}</p>
            )}
            {content.description && (
              <p className="text-gray-700 max-w-3xl mx-auto">{content.description}</p>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-16">
            <Camera className="w-16 h-16 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              Fotky budou brzy k dispozici
            </h3>
            <p className="text-gray-600">
              Těšte se na krásné fotky z našeho velkého dne!
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <>
      <section className="py-24 bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="max-w-6xl mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {content.title || 'Fotogalerie'}
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-pink-500 to-purple-500 mx-auto mb-6"></div>
            {content.subtitle && (
              <p className="text-xl text-gray-600 mb-4">{content.subtitle}</p>
            )}
            {content.description && (
              <p className="text-gray-700 max-w-3xl mx-auto">{content.description}</p>
            )}
          </div>

          {/* Gallery Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {displayedImages.map((image, index) => (
              <div
                key={image.id}
                className="group relative bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
                onClick={() => openLightbox(image, index)}
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={image.thumbnailUrl || image.url}
                    alt={image.alt}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    {image.caption && (
                      <p className="text-white text-sm font-medium">
                        {image.caption}
                      </p>
                    )}
                  </div>
                  
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load More Button */}
          {images.length > 9 && !showAll && (
            <div className="text-center">
              <button
                onClick={() => setShowAll(true)}
                className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-8 py-3 rounded-full font-semibold hover:from-pink-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Zobrazit více fotek ({images.length - 9} dalších)
              </button>
            </div>
          )}

          {/* Show Less Button */}
          {showAll && images.length > 9 && (
            <div className="text-center">
              <button
                onClick={() => setShowAll(false)}
                className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-8 py-3 rounded-full font-semibold hover:from-gray-600 hover:to-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Zobrazit méně
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={closeLightbox}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          <div className="relative max-w-5xl max-h-full" onClick={(e) => e.stopPropagation()}>
            {/* Main Image */}
            <img
              src={selectedImage.url}
              alt={selectedImage.alt}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />

            {/* Image Info */}
            {selectedImage.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 rounded-b-lg">
                <p className="text-white text-lg font-medium text-center">
                  {selectedImage.caption}
                </p>
              </div>
            )}

            {/* Navigation */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    prevImage()
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    nextImage()
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Image Counter */}
            {images.length > 1 && (
              <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full">
                <span className="text-sm font-medium">
                  {currentIndex + 1} / {images.length}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
