import React from 'react';
import { SectionProps } from '../types';

const HeroSection: React.FC<SectionProps> = ({ id }) => {
  return (
    <section id={id} className="relative h-screen w-full overflow-hidden">
      {/* Background Image with subtle animation */}
      <div className="absolute inset-0 z-0 animate-scale-in">
        <img 
          src="https://images.unsplash.com/photo-1627389955689-2640b4f87d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" 
          alt="Wedding Couple" 
          className="w-full h-full object-cover brightness-[0.65]"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4">
        
        <div className="animate-fade-in-up flex flex-col items-center">
          <span className="text-accent uppercase tracking-[0.5em] text-xs md:text-sm mb-6 border-b border-accent pb-2">
            Vezmeme se
          </span>
          
          <div className="font-display-italic text-7xl md:text-9xl lg:text-[10rem] text-cream leading-none mix-blend-overlay opacity-90">
            Anna
          </div>
          <div className="font-serif text-4xl md:text-6xl text-accent my-[-1rem] md:my-[-2rem] z-20 relative italic">
            &
          </div>
          <div className="font-display-italic text-7xl md:text-9xl lg:text-[10rem] text-cream leading-none mix-blend-overlay opacity-90">
            Jakub
          </div>

          <div className="mt-12 flex flex-col md:flex-row items-center gap-4 md:gap-12 text-cream font-sans font-light tracking-[0.2em] text-sm md:text-base">
             <span>24. SRPNA 2025</span>
             <span className="w-1 h-1 bg-accent rounded-full hidden md:block"></span>
             <span>ZÁMEK HLUBOKÁ</span>
          </div>
        </div>

      </div>
      
      {/* Decorative Scroll Line */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-24 w-px bg-gradient-to-b from-transparent via-cream to-transparent opacity-50"></div>
    </section>
  );
};

export default HeroSection;