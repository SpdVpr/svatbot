import React from 'react';
import { COUPLE } from '../../constants';
import { DisplayText, SubHeading } from '../ui/Typography';

export const HeroSection: React.FC = () => {
  return (
    <section id="uvod" className="relative h-screen w-full overflow-hidden bg-black text-cream">
      
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src={COUPLE.mainImage} 
          alt="Wedding Couple" 
          className="w-full h-full object-cover opacity-60 grayscale"
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
        <SubHeading className="text-cream mb-6 animate-pulse">{COUPLE.date} • {COUPLE.hashtag}</SubHeading>
        
        <div className="mix-blend-overlay">
            <DisplayText className="text-cream leading-[0.8]">
            {COUPLE.groom.name.split(' ')[0]}
            </DisplayText>
            <div className="font-serif text-4xl md:text-6xl italic my-2">&</div>
            <DisplayText className="text-cream leading-[0.8]">
            {COUPLE.bride.name.split(' ')[0]}
            </DisplayText>
        </div>

        <p className="mt-8 font-sans uppercase tracking-[0.3em] text-sm md:text-base border-t border-b border-cream/50 py-3 px-8">
          {COUPLE.tagline}
        </p>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-cream">
        <div className="w-[1px] h-16 bg-cream mx-auto mb-2"></div>
        <span className="text-[10px] uppercase tracking-widest">Scroll</span>
      </div>
    </section>
  );
};