import React from 'react';
import { SectionProps } from '../types';

const StorySection: React.FC<SectionProps> = ({ id }) => {
  return (
    <section id={id} className="py-32 bg-cream overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        
        {/* Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-24 items-end">
           <div className="lg:col-span-4">
              <span className="text-accent uppercase tracking-[0.3em] text-xs block mb-4">Náš příběh</span>
              <h2 className="font-serif text-5xl md:text-7xl text-primary leading-tight">
                Láska, která <br/>
                <span className="italic text-secondary font-display-italic">začala kávou.</span>
              </h2>
           </div>
           <div className="lg:col-span-1 hidden lg:block h-px bg-primary/10 w-full self-center"></div>
           <div className="lg:col-span-7">
              <p className="text-dark/70 text-lg leading-relaxed font-light max-w-2xl">
                Někdy stačí malý okamžik, aby se změnil celý život. Pro nás to byl jeden deštivý den v Praze a jedna upuštěná kniha. O sedm let později píšeme další kapitolu.
              </p>
           </div>
        </div>

        {/* Couple Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-24 mb-32">
          {/* Her */}
          <div className="flex flex-col items-center md:items-start space-y-6 group">
             <div className="relative w-full aspect-[3/4] overflow-hidden rounded-t-[10rem] rounded-b-lg">
               <img 
                  src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80" 
                  alt="Bride" 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
               />
               <div className="absolute bottom-4 left-4 bg-cream/90 backdrop-blur px-4 py-2 rounded-full">
                  <span className="uppercase tracking-widest text-xs font-bold text-primary">Nevěsta</span>
               </div>
             </div>
             <h3 className="font-display-italic text-4xl text-primary">Anna Nováková</h3>
             <p className="text-dark/60 leading-relaxed md:max-w-md">
               Milovnice francouzských filmů, dlouhých rán a vůně deště. Snílek, který našel svého parťáka do nepohody.
             </p>
          </div>

          {/* Him */}
          <div className="flex flex-col items-center md:items-start space-y-6 group md:mt-32">
             <div className="relative w-full aspect-[3/4] overflow-hidden rounded-t-[10rem] rounded-b-lg">
               <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=774&q=80" 
                  alt="Groom" 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
               />
               <div className="absolute bottom-4 right-4 bg-cream/90 backdrop-blur px-4 py-2 rounded-full">
                  <span className="uppercase tracking-widest text-xs font-bold text-primary">Ženich</span>
               </div>
             </div>
             <h3 className="font-display-italic text-4xl text-primary">Jakub Svoboda</h3>
             <p className="text-dark/60 leading-relaxed md:max-w-md">
               Horolezec s duší básníka. Miluje vaření, technologie a ten moment, kdy se Anna směje.
             </p>
          </div>
        </div>

        {/* Timeline - Minimal */}
        <div className="max-w-3xl mx-auto border-l border-primary/20 pl-8 md:pl-16 space-y-20 py-12">
           <div className="relative">
             <span className="absolute -left-[3.3rem] md:-left-[4.3rem] top-2 w-3 h-3 bg-primary rounded-full outline outline-8 outline-cream"></span>
             <span className="text-accent font-bold tracking-widest uppercase text-xs mb-2 block">Léto 2018</span>
             <h4 className="font-serif text-3xl text-primary mb-4">Osudové setkání</h4>
             <p className="text-dark/70 font-light">Malá kavárna na Vinohradech. První pohled, první slova a káva, která vystydla, protože jsme si měli tolik co říct.</p>
           </div>
           <div className="relative">
             <span className="absolute -left-[3.3rem] md:-left-[4.3rem] top-2 w-3 h-3 bg-primary rounded-full outline outline-8 outline-cream"></span>
             <span className="text-accent font-bold tracking-widest uppercase text-xs mb-2 block">Zima 2023</span>
             <h4 className="font-serif text-3xl text-primary mb-4">Sněžka a "ANO"</h4>
             <p className="text-dark/70 font-light">Mínus pět stupňů, vítr ve vlasech a ten nejhřejivější pocit u srdce. Jakub poklekl a svět se na chvíli zastavil.</p>
           </div>
        </div>

      </div>
    </section>
  );
};

export default StorySection;