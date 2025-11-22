import React, { useState } from 'react';
import { GalleryImage } from '../../types';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

interface GallerySectionProps {
  images: GalleryImage[];
}

export const GallerySection: React.FC<GallerySectionProps> = ({ images }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => setSelectedImageIndex(index);
  const closeLightbox = () => setSelectedImageIndex(null);
  
  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedImageIndex !== null) {
      setSelectedImageIndex((selectedImageIndex + 1) % images.length);
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedImageIndex !== null) {
      setSelectedImageIndex((selectedImageIndex - 1 + images.length) % images.length);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-serif font-bold mb-6 text-stone-900 px-2">Portfolio</h2>
      
      {/* Pinterest Style Masonry Layout using CSS Columns */}
      <div className="columns-1 sm:columns-2 md:columns-3 gap-4 space-y-4">
        {images.map((img, idx) => (
          <div 
            key={img.id}
            onClick={() => openLightbox(idx)}
            className="break-inside-avoid mb-4 relative group cursor-pointer rounded-2xl overflow-hidden bg-stone-100"
          >
            <img 
              src={img.url} 
              alt={img.category}
              className="w-full h-auto block transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
            
            {/* Dark overlay on hover */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
            
            {/* Category Tag at bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/60 to-transparent">
               <span className="text-white text-sm font-medium">{img.category}</span>
            </div>
            
            {/* Zoom Icon top right */}
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/20 backdrop-blur-md p-2 rounded-full text-white">
              <ZoomIn size={18} />
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedImageIndex !== null && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center"
          onClick={closeLightbox}
        >
          <button className="absolute top-4 right-4 text-white/50 hover:text-white p-2 transition-colors z-50">
            <X size={32} />
          </button>

          <button 
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-4 md:p-8 transition-colors hidden sm:block z-50"
            onClick={prevImage}
          >
            <ChevronLeft size={48} />
          </button>

          <img 
            src={images[selectedImageIndex].url} 
            alt="Gallery" 
            className="max-h-[85vh] max-w-[90vw] object-contain shadow-2xl rounded-md"
            onClick={(e) => e.stopPropagation()} // Prevent close on image click
          />

          <button 
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-4 md:p-8 transition-colors hidden sm:block z-50"
            onClick={nextImage}
          >
            <ChevronRight size={48} />
          </button>
          
          <div className="absolute bottom-6 left-0 right-0 text-center text-white/70 text-sm">
            {selectedImageIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </div>
  );
};