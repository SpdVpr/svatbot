import React from 'react';
import { SectionProps } from '../types';
import { MapPin } from 'lucide-react';

const LocationSection: React.FC<SectionProps> = ({ id }) => {
  return (
    <section id={id} className="py-32 bg-primary text-cream relative">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="text-center mb-24">
           <h2 className="font-display-italic text-6xl md:text-8xl mb-6 text-cream opacity-90">
             Místo & Čas
           </h2>
           <p className="uppercase tracking-[0.2em] text-accent text-sm">24. Srpna 2025 • Jižní Čechy</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 lg:gap-32">
           {/* Ceremony */}
           <div className="group">
              <div className="relative h-[500px] w-full overflow-hidden rounded-t-[12rem] mb-8 border border-white/10">
                <img 
                  src="https://images.unsplash.com/photo-1565619624098-e95057a2f3dc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80" 
                  alt="Ceremony" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                />
                <div className="absolute top-8 right-8 bg-white/10 backdrop-blur-md border border-white/20 p-4 text-center rounded-lg">
                   <span className="block text-2xl font-serif">13:00</span>
                </div>
              </div>
              <div className="text-center lg:text-left">
                <h3 className="font-serif text-4xl mb-2 text-accent">Svatební Obřad</h3>
                <p className="font-display-italic text-2xl mb-4 opacity-80">Zámek Hluboká</p>
                <div className="flex items-center justify-center lg:justify-start gap-2 text-sm tracking-wide opacity-60 mb-6">
                  <MapPin className="w-4 h-4" />
                  <span>Bezručova 142, Hluboká nad Vltavou</span>
                </div>
                <a href="#" className="inline-block border-b border-accent text-accent hover:text-white pb-1 transition-colors uppercase text-xs tracking-widest">
                  Mapa místa
                </a>
              </div>
           </div>

           {/* Reception */}
           <div className="group lg:mt-24">
              <div className="relative h-[500px] w-full overflow-hidden rounded-t-[12rem] mb-8 border border-white/10">
                <img 
                  src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1198&q=80" 
                  alt="Reception" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                />
                <div className="absolute top-8 right-8 bg-white/10 backdrop-blur-md border border-white/20 p-4 text-center rounded-lg">
                   <span className="block text-2xl font-serif">15:30</span>
                </div>
              </div>
              <div className="text-center lg:text-left">
                <h3 className="font-serif text-4xl mb-2 text-accent">Svatební Hostina</h3>
                <p className="font-display-italic text-2xl mb-4 opacity-80">Hotel Štekl</p>
                <div className="flex items-center justify-center lg:justify-start gap-2 text-sm tracking-wide opacity-60 mb-6">
                  <MapPin className="w-4 h-4" />
                  <span>Bezručova 141, Hluboká nad Vltavou</span>
                </div>
                <a href="#" className="inline-block border-b border-accent text-accent hover:text-white pb-1 transition-colors uppercase text-xs tracking-widest">
                  Mapa místa
                </a>
              </div>
           </div>
        </div>
      </div>
    </section>
  );
};

export default LocationSection;