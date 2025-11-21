import React from 'react';
import { SectionProps } from '../types';
import { Heart } from 'lucide-react';

const GiftSection: React.FC<SectionProps> = ({ id }) => {
  return (
    <section id={id} className="py-32 bg-paper">
      <div className="max-w-4xl mx-auto px-6 text-center">
        
        <h2 className="font-serif text-5xl md:text-6xl text-primary mb-12">Svatební dary</h2>
        
        <p className="text-dark/70 text-lg leading-relaxed mb-16 max-w-2xl mx-auto font-light">
          Největším darem pro nás bude, když tento den strávíte s námi. Pokud byste nás přece jen chtěli obdarovat, budeme rádi za finanční příspěvek na naši svatební cestu a vybavení domácnosti.
        </p>

        <div className="inline-block relative p-10 md:p-16 border border-primary/10 bg-white shadow-sm max-w-2xl mx-auto mb-16">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4">
             <Heart className="w-6 h-6 text-accent fill-accent" />
          </div>
          <p className="text-xs uppercase tracking-widest text-secondary mb-4">Číslo účtu</p>
          <p className="font-display-italic text-4xl md:text-5xl text-primary mb-6">
            1234567890 / 0100
          </p>
          <button 
            onClick={() => navigator.clipboard.writeText('1234567890/0100')} 
            className="text-xs text-accent hover:text-primary uppercase tracking-widest border-b border-accent/30 pb-1 transition-colors"
          >
            Zkopírovat číslo
          </button>
        </div>
      </div>
    </section>
  );
};

export default GiftSection;