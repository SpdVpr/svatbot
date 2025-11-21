import React from 'react';
import { SectionProps } from '../types';

const images = [
  { src: "https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&w=600&q=80", alt: "Wedding details" },
  { src: "https://images.unsplash.com/photo-1511285560982-1356c11d4606?ixlib=rb-4.0.3&w=600&q=80", alt: "Couple holding hands" },
  { src: "https://images.unsplash.com/photo-1606800052052-a08af7148866?ixlib=rb-4.0.3&w=600&q=80", alt: "Table setting" },
  { src: "https://images.unsplash.com/photo-1532712938310-34cb3958d425?ixlib=rb-4.0.3&w=600&q=80", alt: "Wedding dress" },
  { src: "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?ixlib=rb-4.0.3&w=600&q=80", alt: "Bouquet" },
  { src: "https://images.unsplash.com/photo-1529636798458-92182e66243c?ixlib=rb-4.0.3&w=600&q=80", alt: "Venue" }
];

const GallerySection: React.FC<SectionProps> = ({ id }) => {
  return (
    <section id={id} className="py-32 bg-cream overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex flex-col md:flex-row items-end justify-between mb-16">
          <div>
            <span className="text-accent uppercase tracking-[0.3em] text-xs mb-4 block">Vzpomínky</span>
            <h2 className="font-serif text-5xl md:text-6xl text-primary">Galerie</h2>
          </div>
          <p className="text-dark/50 italic font-display-italic text-xl mt-4 md:mt-0 max-w-md text-right">
            "Láska se neskládá z pohledů z očí do očí, ale ze společného pohledu stejným směrem."
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Column 1 */}
          <div className="space-y-8">
             <div className="relative aspect-[3/4] overflow-hidden rounded-t-[10rem] group">
                <img src={images[0].src} alt={images[0].alt} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
             </div>
             <div className="relative aspect-square overflow-hidden rounded-lg group">
                <img src={images[3].src} alt={images[3].alt} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
             </div>
          </div>

          {/* Column 2 - Offset */}
          <div className="space-y-8 md:mt-16">
             <div className="relative aspect-square overflow-hidden rounded-full group border-4 border-white/50">
                <img src={images[1].src} alt={images[1].alt} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
             </div>
             <div className="relative aspect-[3/4] overflow-hidden rounded-b-[10rem] group">
                <img src={images[4].src} alt={images[4].alt} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
             </div>
          </div>

          {/* Column 3 */}
          <div className="space-y-8">
             <div className="relative aspect-[3/4] overflow-hidden rounded-t-[10rem] group">
                <img src={images[2].src} alt={images[2].alt} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
             </div>
             <div className="relative aspect-square overflow-hidden rounded-lg group">
                <img src={images[5].src} alt={images[5].alt} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
             </div>
          </div>
        </div>

        <div className="text-center mt-16">
             <a href="#" className="inline-block border border-primary text-primary hover:bg-primary hover:text-cream px-8 py-3 rounded-full uppercase tracking-widest text-xs transition-all duration-300">
               Zobrazit celou galerii
             </a>
        </div>
      </div>
    </section>
  );
};

export default GallerySection;