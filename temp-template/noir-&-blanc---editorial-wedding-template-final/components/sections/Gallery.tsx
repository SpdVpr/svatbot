import React from 'react';
import { Section } from '../ui/Section';
import { Marquee } from '../ui/Marquee';

export const Gallery: React.FC = () => {
  const images = [
    "https://picsum.photos/id/1027/600/800",
    "https://picsum.photos/id/331/800/600",
    "https://picsum.photos/id/349/600/800",
    "https://picsum.photos/id/399/800/800",
    "https://picsum.photos/id/513/600/600",
    "https://picsum.photos/id/669/800/600",
  ];

  return (
    <>
    <Marquee text="Memories • Moments • Forever" reverse />
    <Section noPadding className="bg-cream">
      <div className="columns-1 md:columns-2 lg:columns-3 gap-0">
        {images.map((src, i) => (
            <div key={i} className="break-inside-avoid relative group overflow-hidden">
                <img 
                    src={src} 
                    alt={`Gallery ${i}`} 
                    className="w-full h-auto block grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
            </div>
        ))}
      </div>
    </Section>
    </>
  );
};