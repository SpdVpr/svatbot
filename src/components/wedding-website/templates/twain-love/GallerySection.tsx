'use client'

import { GalleryContent } from '@/types/wedding-website'
import Image from 'next/image'
import { useState } from 'react'
import SectionTitle from './SectionTitle'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface GallerySectionProps {
  content: GalleryContent
}

export default function GallerySection({ content }: GallerySectionProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  if (!content.enabled || !content.images || content.images.length === 0) {
    return null
  }

  const images = content.images

  const openLightbox = (index: number) => {
    setLightboxIndex(index)
  }

  const closeLightbox = () => {
    setLightboxIndex(null)
  }

  const nextImage = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % images.length)
    }
  }

  const prevImage = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + images.length) % images.length)
    }
  }

  return (
    <div id="gallery" className="py-20" style={{ background: 'rgba(178,201,211,0.1)' }}>
      <SectionTitle title={content.title || 'Naše galerie'} />

      {content.subtitle && (
        <p className="text-center text-[#85aaba] px-4" style={{ fontFamily: 'Great Vibes, cursive', fontSize: '1.8rem', marginBottom: '1.5rem' }}>
          {content.subtitle}
        </p>
      )}

      {content.description && (
        <p className="text-center text-gray-600 max-w-2xl mx-auto mb-12 px-4" style={{ fontFamily: 'Muli, sans-serif' }}>
          {content.description}
        </p>
      )}

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {images.map((image, index) => (
            <div
              key={image.id}
              className="gallery-img cursor-pointer overflow-hidden mb-8 group"
              onClick={() => openLightbox(index)}
            >
              <div className="thumbnail transition-transform duration-300 hover:scale-110 relative">
                <div className="relative w-full h-[450px] overflow-hidden rounded-lg">
                  <Image
                    src={image.url}
                    alt={image.caption || `Gallery image ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />

                  {/* Caption bar on hover */}
                  {image.caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white py-4 px-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <p className="text-sm text-center leading-relaxed" style={{ fontFamily: 'Muli, sans-serif' }}>
                        {image.caption}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center">
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
          >
            <X className="w-8 h-8" />
          </button>

          {/* Previous button */}
          <button
            onClick={prevImage}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 z-10"
          >
            <ChevronLeft className="w-12 h-12" />
          </button>

          {/* Next button */}
          <button
            onClick={nextImage}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 z-10"
          >
            <ChevronRight className="w-12 h-12" />
          </button>

          {/* Image */}
          <div className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center p-12">
            <Image
              src={images[lightboxIndex].url}
              alt={images[lightboxIndex].caption || ''}
              fill
              className="object-contain"
            />
          </div>

          {/* Caption */}
          {images[lightboxIndex].caption && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white text-center">
              <p className="text-lg">{images[lightboxIndex].caption}</p>
            </div>
          )}

          {/* Counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white">
            {lightboxIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </div>
  )
}

