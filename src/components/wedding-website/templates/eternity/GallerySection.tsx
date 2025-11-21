'use client'

import { GalleryContent } from '@/types/wedding-website'
import { useState } from 'react'
import { X } from 'lucide-react'

interface GallerySectionProps {
  content: GalleryContent
}

export default function GallerySection({ content }: GallerySectionProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  if (!content.enabled || !content.images || content.images.length === 0) return null

  // Organize images into 3 columns
  const column1 = content.images.filter((_, i) => i % 3 === 0)
  const column2 = content.images.filter((_, i) => i % 3 === 1)
  const column3 = content.images.filter((_, i) => i % 3 === 2)

  return (
    <section id="gallery" className="py-32 bg-[#F4F2ED] overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex flex-col md:flex-row items-end justify-between mb-16">
          <div>
            <span className="text-[#C5A880] uppercase tracking-[0.3em] text-xs mb-4 block">Vzpomínky</span>
            <h2 className="font-serif text-5xl md:text-6xl text-[#2C362B]">Galerie</h2>
          </div>
          {content.subtitle && (
            <p 
              className="text-[#1A1C1A]/50 italic text-xl mt-4 md:mt-0 max-w-md text-right"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              {content.subtitle}
            </p>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Column 1 */}
          <div className="space-y-8">
             {column1.map((image, index) => (
               <div 
                 key={image.id} 
                 className={`relative overflow-hidden group cursor-pointer ${
                   index % 2 === 0 ? 'aspect-[3/4] rounded-t-[10rem]' : 'aspect-square rounded-lg'
                 }`}
                 onClick={() => setSelectedImage(image.url)}
               >
                  <img 
                    src={image.url} 
                    alt={image.alt} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-[#2C362B]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
               </div>
             ))}
          </div>

          {/* Column 2 - Offset */}
          <div className="space-y-8 md:mt-16">
             {column2.map((image, index) => (
               <div 
                 key={image.id}
                 className={`relative overflow-hidden group cursor-pointer ${
                   index % 2 === 0 ? 'aspect-square rounded-full border-4 border-white/50' : 'aspect-[3/4] rounded-b-[10rem]'
                 }`}
                 onClick={() => setSelectedImage(image.url)}
               >
                  <img 
                    src={image.url} 
                    alt={image.alt} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  />
               </div>
             ))}
          </div>

          {/* Column 3 */}
          <div className="space-y-8">
             {column3.map((image, index) => (
               <div 
                 key={image.id}
                 className={`relative overflow-hidden group cursor-pointer ${
                   index % 2 === 0 ? 'aspect-[3/4] rounded-t-[10rem]' : 'aspect-square rounded-lg'
                 }`}
                 onClick={() => setSelectedImage(image.url)}
               >
                  <img 
                    src={image.url} 
                    alt={image.alt} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  />
               </div>
             ))}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-[70] flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 text-white hover:text-[#C5A880] transition-colors"
          >
            <X className="w-8 h-8" />
          </button>
          <img 
            src={selectedImage} 
            alt="Gallery image" 
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  )
}

