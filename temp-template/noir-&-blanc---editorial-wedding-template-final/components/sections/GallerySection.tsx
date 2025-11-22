import React, { useState } from 'react';
import { Section } from '../ui/Section';
import { Heading, SubHeading } from '../ui/Typography';
import { X } from 'lucide-react';

const IMAGES = [
  "https://picsum.photos/id/1027/600/800",
  "https://picsum.photos/id/331/800/600",
  "https://picsum.photos/id/349/600/800",
  "https://picsum.photos/id/399/800/800",
  "https://picsum.photos/id/513/600/600",
  "https://picsum.photos/id/669/800/600",
  "https://picsum.photos/id/237/600/800",
  "https://picsum.photos/id/238/800/600",
];

export const GallerySection: React.FC = () => {
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  return (
    <Section>
      <div className="mb-12 text-center">
         <SubHeading>Moments</SubHeading>
         <Heading>Galerie</Heading>
      </div>

      <div className="columns-1 md:columns-3 gap-4 space-y-4">
        {IMAGES.map((src, i) => (
          <div 
            key={i} 
            className="break-inside-avoid relative group cursor-zoom-in overflow-hidden"
            onClick={() => setLightboxImage(src)}
          >
            <img 
                src={src} 
                alt="Gallery" 
                className="w-full h-auto grayscale hover:grayscale-0 transition-all duration-700 hover:scale-105" 
            />
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxImage && (
        <div 
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 animate-reveal"
            onClick={() => setLightboxImage(null)}
        >
            <button className="absolute top-8 right-8 text-white hover:text-accent">
                <X size={40} />
            </button>
            <img 
                src={lightboxImage} 
                className="max-w-full max-h-[90vh] object-contain shadow-2xl" 
                alt="Full view" 
            />
        </div>
      )}
    </Section>
  );
};