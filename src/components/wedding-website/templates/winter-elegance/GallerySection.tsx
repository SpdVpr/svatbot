'use client'

import { useColorTheme } from '../ColorThemeContext'
import { GalleryContent } from '@/types/wedding-website'
import Image from 'next/image'

interface GallerySectionProps {
  content: GalleryContent
}

export default function GallerySection({ content }: GallerySectionProps) {
  const { theme } = useColorTheme()

  if (!content.enabled) return null

  return (
    <section id="gallery" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-light text-stone-900 mb-6">
            {content.title || 'Galerie'}
          </h2>
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-stone-400 to-transparent mx-auto mb-8"></div>
          {content.subtitle && (
            <p className="text-xl text-stone-600 leading-relaxed max-w-3xl mx-auto">
              {content.subtitle}
            </p>
          )}
        </div>

        {/* Gallery Grid */}
        {content.images && content.images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {content.images.map((image, index) => (
              <div
                key={image.id || `gallery-${index}`}
                className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="aspect-[3/4] relative">
                  <Image
                    src={image.url}
                    alt={image.alt || `Svatební fotka ${index + 1}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                </div>
                {image.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-3 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-white text-sm">{image.caption}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Upload Section */}
        {content.allowGuestUploads && (
          <div className="mt-12 text-center">
            <div className="bg-stone-50 rounded-2xl p-8 max-w-2xl mx-auto">
              <p className="text-stone-600 mb-4">
                Máte fotky z naší svatby? Sdílejte je s námi!
              </p>
              <button className="px-6 py-3 bg-stone-800 text-white rounded-xl hover:bg-stone-900 transition-colors">
                Nahrát fotku
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

