'use client'

import { useState } from 'react'
import { Camera, X, ChevronLeft, ChevronRight, Upload } from 'lucide-react'
import type { GalleryContent } from '@/types/wedding-website'

interface GallerySectionProps {
  content: GalleryContent
}

export default function GallerySection({ content }: GallerySectionProps) {
  if (!content.enabled) return null

  const [selectedImage, setSelectedImage] = useState<number | null>(null)
  const images = content.images || []

  const openLightbox = (index: number) => {
    setSelectedImage(index)
  }

  const closeLightbox = () => {
    setSelectedImage(null)
  }

  const nextImage = () => {
    if (selectedImage !== null && selectedImage < images.length - 1) {
      setSelectedImage(selectedImage + 1)
    }
  }

  const prevImage = () => {
    if (selectedImage !== null && selectedImage > 0) {
      setSelectedImage(selectedImage - 1)
    }
  }

  return (
    <section className="relative py-24 bg-gradient-to-br from-amber-50 via-rose-50 to-pink-50 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10">
        <div className="absolute top-40 right-20 w-72 h-72 bg-rose-300 rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 left-20 w-96 h-96 bg-amber-300 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-rose-300 rounded-full blur-xl opacity-50"></div>
              <div className="relative bg-gradient-to-br from-rose-100 to-amber-100 rounded-full p-5">
                <Camera className="w-10 h-10 text-rose-600" />
              </div>
            </div>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-gray-800 mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            {content.title || 'Naše fotografie'}
          </h2>
          {content.subtitle && (
            <p className="text-xl text-rose-600 italic" style={{ fontFamily: 'Lora, serif' }}>
              {content.subtitle}
            </p>
          )}
          {content.description && (
            <p className="text-gray-600 mt-4 max-w-2xl mx-auto">{content.description}</p>
          )}
        </div>

        {/* Gallery Grid */}
        {images.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div
                key={image.id}
                onClick={() => openLightbox(index)}
                className="group relative overflow-hidden rounded-2xl cursor-pointer aspect-square shadow-lg hover:shadow-2xl transition-all duration-500"
              >
                {/* Image */}
                <img
                  src={image.thumbnailUrl || image.url}
                  alt={image.alt || `Gallery image ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-rose-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                {/* Caption */}
                {image.caption && (
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                    <p className="text-sm font-medium">{image.caption}</p>
                  </div>
                )}

                {/* Decorative corners */}
                <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-white/70 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-white/70 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="inline-block bg-white rounded-3xl p-12 shadow-xl border-2 border-rose-100">
              <Camera className="w-16 h-16 text-rose-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">Fotografie budou brzy k dispozici</p>
            </div>
          </div>
        )}

        {/* Upload section */}
        {content.allowGuestUploads && (
          <div className="mt-16 text-center">
            <div className="inline-block bg-white rounded-3xl p-8 shadow-xl border-2 border-amber-100">
              <Upload className="w-12 h-12 text-amber-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                Sdílejte své fotky
              </h3>
              <p className="text-gray-600 mb-4">Máte fotky ze svatby? Podělte se s námi!</p>
              <button className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-2xl hover:from-amber-600 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl">
                Nahrát fotografie
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {selectedImage !== null && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* Previous button */}
          {selectedImage > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                prevImage()
              }}
              className="absolute left-4 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
          )}

          {/* Next button */}
          {selectedImage < images.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                nextImage()
              }}
              className="absolute right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          )}

          {/* Image */}
          <div onClick={(e) => e.stopPropagation()} className="max-w-5xl max-h-[90vh]">
            <img
              src={images[selectedImage].url}
              alt={images[selectedImage].alt || `Gallery image ${selectedImage + 1}`}
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            />
            {images[selectedImage].caption && (
              <p className="text-white text-center mt-4 text-lg">{images[selectedImage].caption}</p>
            )}
          </div>

          {/* Image counter */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/10 backdrop-blur-sm px-6 py-2 rounded-full">
            <p className="text-white font-medium">
              {selectedImage + 1} / {images.length}
            </p>
          </div>
        </div>
      )}
    </section>
  )
}

