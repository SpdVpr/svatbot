'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Section } from './Section'
import { Heading, SubHeading } from './Typography'
import { GalleryContent } from '@/types/wedding-website'
import { X } from 'lucide-react'

interface GallerySectionProps {
  content: GalleryContent
}

export default function GallerySection({ content }: GallerySectionProps) {
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)

  if (!content.enabled || !content.images || content.images.length === 0) return null

  return (
    <section id="gallery" className="relative w-full text-black border-b border-black" style={{ backgroundColor: '#f2f0ea' }}>
      <div className="px-4 py-20 md:py-32 md:px-12 max-w-[1800px] mx-auto">
        <div className="mb-12 text-center">
        <Heading>{content.title || 'Galerie'}</Heading>
        {content.description && (
          <p className="text-black/70 max-w-2xl mx-auto">{content.description}</p>
        )}
      </div>

      <div className="columns-1 md:columns-3 gap-4 space-y-4">
        {content.images.map((img) => (
          <div
            key={img.id}
            className="break-inside-avoid relative group cursor-zoom-in overflow-hidden"
            onClick={() => setLightboxImage(img.url)}
          >
            <Image
              src={img.url}
              alt={img.alt || 'Gallery image'}
              width={800}
              height={600}
              className="w-full h-auto transition-all duration-700 group-hover:scale-105 group-hover:grayscale"
            />
            {img.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                {img.caption}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 animate-reveal"
          onClick={() => setLightboxImage(null)}
        >
          <button className="absolute top-8 right-8 text-white hover:text-[#d4b0aa]">
            <X size={40} />
          </button>
          <Image
            src={lightboxImage}
            alt="Full view"
            width={1920}
            height={1080}
            className="max-w-full max-h-[90vh] object-contain shadow-2xl" 
          />
        </div>
      )}
      </div>
    </section>
  )
}

