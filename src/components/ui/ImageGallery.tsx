'use client'

import { useState, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight, ZoomIn, Download } from 'lucide-react'

interface ImageGalleryProps {
  images: string[]
  initialIndex?: number
  onClose?: () => void
  showThumbnails?: boolean
  className?: string
}

export default function ImageGallery({
  images,
  initialIndex = 0,
  onClose,
  showThumbnails = true,
  className = ''
}: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    setCurrentIndex(initialIndex)
  }, [initialIndex])

  const openLightbox = (index: number) => {
    setCurrentIndex(index)
    setIsOpen(true)
  }

  const closeLightbox = () => {
    setIsOpen(false)
    onClose?.()
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isOpen) return
    
    switch (e.key) {
      case 'Escape':
        closeLightbox()
        break
      case 'ArrowLeft':
        goToPrevious()
        break
      case 'ArrowRight':
        goToNext()
        break
    }
  }

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (images.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-gray-500">Žádné fotografie k zobrazení</p>
      </div>
    )
  }

  return (
    <>
      {/* Gallery Grid */}
      <div className={`grid gap-4 ${className}`}>
        {/* Main Image */}
        <div className="relative group cursor-pointer" onClick={() => openLightbox(0)}>
          <img
            src={images[0]}
            alt="Hlavní fotografie"
            className="w-full h-96 object-cover rounded-xl"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded-xl flex items-center justify-center">
            <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          {images.length > 1 && (
            <div className="absolute bottom-4 right-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm">
              +{images.length - 1} fotek
            </div>
          )}
        </div>

        {/* Thumbnail Grid */}
        {showThumbnails && images.length > 1 && (
          <div className="grid grid-cols-3 gap-2">
            {images.slice(1, 4).map((image, index) => (
              <div
                key={index}
                className="relative group cursor-pointer"
                onClick={() => openLightbox(index + 1)}
              >
                <img
                  src={image}
                  alt={`Fotografie ${index + 2}`}
                  className="w-full h-24 object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded-lg flex items-center justify-center">
                  <ZoomIn className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                {index === 2 && images.length > 4 && (
                  <div className="absolute inset-0 bg-black bg-opacity-70 rounded-lg flex items-center justify-center">
                    <span className="text-white font-medium">+{images.length - 4}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-10 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Navigation Buttons */}
          {images.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Image Counter */}
          <div className="absolute top-4 left-4 z-10 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
            {currentIndex + 1} / {images.length}
          </div>

          {/* Download Button */}
          <button
            onClick={() => {
              const link = document.createElement('a')
              link.href = images[currentIndex]
              link.download = `fotografie-${currentIndex + 1}.jpg`
              link.click()
            }}
            className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all"
          >
            <Download className="w-5 h-5" />
          </button>

          {/* Main Image */}
          <div className="relative max-w-7xl max-h-full mx-4">
            <img
              src={images[currentIndex]}
              alt={`Fotografie ${currentIndex + 1}`}
              className="max-w-full max-h-[90vh] object-contain"
            />
          </div>

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 bg-black bg-opacity-50 p-2 rounded-lg max-w-full overflow-x-auto">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden ${
                    index === currentIndex ? 'border-white' : 'border-transparent'
                  }`}
                >
                  <img
                    src={image}
                    alt={`Náhled ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Click outside to close */}
          <div
            className="absolute inset-0 -z-10"
            onClick={closeLightbox}
          />
        </div>
      )}
    </>
  )
}

// Simple Gallery Component for basic use cases
export function SimpleImageGallery({
  images,
  className = '',
  gridCols = 'grid-cols-2 md:grid-cols-3'
}: {
  images: string[]
  className?: string
  gridCols?: string
}) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  return (
    <>
      <div className={`grid ${gridCols} gap-4 ${className}`}>
        {images.map((image, index) => (
          <div
            key={index}
            className="relative group cursor-pointer"
            onClick={() => setLightboxIndex(index)}
          >
            <img
              src={image}
              alt={`Fotografie ${index + 1}`}
              className="w-full h-48 object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded-lg flex items-center justify-center">
              <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        ))}
      </div>

      {lightboxIndex !== null && (
        <ImageGallery
          images={images}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          showThumbnails={false}
        />
      )}
    </>
  )
}
