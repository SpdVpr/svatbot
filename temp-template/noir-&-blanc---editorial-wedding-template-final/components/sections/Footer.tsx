import React from 'react';
import { COUPLE } from '../../constants';
import { Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-black text-cream py-20 border-t border-white/10">
      <div className="container mx-auto px-4 flex flex-col items-center text-center">
        
        <div className="mb-12">
             <Heart className="w-8 h-8 mx-auto mb-4 text-accent" />
             <h3 className="font-serif text-4xl md:text-6xl">{COUPLE.groom.name.split(' ')[0]} & {COUPLE.bride.name.split(' ')[0]}</h3>
             <p className="font-sans text-sm uppercase tracking-[0.3em] mt-2 opacity-60">{COUPLE.date}</p>
        </div>

        <p className="font-serif italic text-lg opacity-80 max-w-md mb-12">
            "Láska je to jediné, co roste, když se to dělí."
        </p>

        <div className="w-full border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-xs opacity-40 font-sans uppercase tracking-widest">
             <span>© 2025 All Rights Reserved</span>
             <span className="mt-2 md:mt-0">Made with Love</span>
        </div>
      </div>
    </footer>
  );
};