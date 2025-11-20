'use client'

import { GalleryContent } from '@/types/wedding-website'
import SectionTitle from './SectionTitle'
import { useState } from 'react'

interface GallerySectionProps {
  content: GalleryContent
}

export default function GallerySection({ content }: GallerySectionProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [selectedIndex, setSelectedIndex] = useState<number>(0)

  if (!content.enabled || !content.images || content.images.length === 0) return null

  const openLightbox = (imageUrl: string, index: number) => {
    setSelectedImage(imageUrl)
    setSelectedIndex(index)
  }

  const closeLightbox = () => {
    setSelectedImage(null)
  }

  const nextImage = () => {
    if (!content.images) return
    const nextIndex = (selectedIndex + 1) % content.images.length
    setSelectedIndex(nextIndex)
    setSelectedImage(content.images[nextIndex].url)
  }

  const prevImage = () => {
    if (!content.images) return
    const prevIndex = (selectedIndex - 1 + content.images.length) % content.images.length
    setSelectedIndex(prevIndex)
    setSelectedImage(content.images[prevIndex].url)
  }

  return (
    <>
      <section id="gallery" className="py-20" style={{ backgroundColor: '#faf8f3' }}>
        <div className="container mx-auto px-4">
          <SectionTitle title={content.title || "Galerie"} subtitle={content.subtitle} />

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
            {content.images.map((image, index) => (
              <div
                key={image.id}
                className="relative aspect-square overflow-hidden rounded-lg cursor-pointer group"
                onClick={() => openLightbox(image.url, index)}
              >
                <img
                  src={image.thumbnailUrl || image.url}
                  alt={image.alt || `Gallery ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                  <i className="ti-control-play text-white text-4xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></i>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-10 w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white text-2xl"
          >
            <i className="ti-close"></i>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation()
              prevImage()
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white text-2xl"
          >
            <i className="flaticon-back"></i>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation()
              nextImage()
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white text-2xl"
          >
            <i className="flaticon-next"></i>
          </button>

          <div 
            className="max-w-5xl max-h-[90vh] relative"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage}
              alt="Gallery"
              className="max-w-full max-h-[90vh] object-contain"
            />
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
            {selectedIndex + 1} / {content.images.length}
          </div>
        </div>
      )}
    </>
  )
}

