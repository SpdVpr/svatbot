'use client'

import type { GalleryContent } from '@/types/wedding-website'

interface GallerySectionProps {
  content: GalleryContent
}

export default function GallerySection({ content }: GallerySectionProps) {
  if (!content.enabled) return null

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-light text-gray-900 mb-4">
            {content.title || 'Galerie'}
          </h2>
          <div className="w-16 h-px bg-gray-900 mx-auto mb-8"></div>
          {content.subtitle && (
            <p className="text-gray-600 text-lg mb-4">{content.subtitle}</p>
          )}
          {content.description && (
            <p className="text-gray-600 max-w-3xl mx-auto leading-relaxed">{content.description}</p>
          )}
        </div>

        {content.images && content.images.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {content.images.map((image) => (
              <div key={image.id} className="group relative">
                <div className="aspect-square bg-gray-100 overflow-hidden">
                  <img
                    src={image.thumbnailUrl || image.url}
                    alt={image.alt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                {image.caption && (
                  <p className="text-center text-gray-600 text-sm mt-3 font-light">
                    {image.caption}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl">📸</span>
            </div>
            <h3 className="text-xl font-light text-gray-900 mb-4">
              Fotky budou brzy k dispozici
            </h3>
            <p className="text-gray-600">
              Těšte se na krásné fotky z našeho velkého dne!
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

