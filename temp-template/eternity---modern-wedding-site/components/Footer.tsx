import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-dark text-cream pt-32 pb-12 border-t border-white/5">
      <div className="max-w-[1400px] mx-auto px-6 flex flex-col items-center text-center">
        
        {/* Big Names */}
        <div className="mb-16 animate-fade-in-up">
           <h2 className="font-display-italic text-[5rem] md:text-[10rem] leading-none opacity-90">
             Anna & Jakub
           </h2>
           <p className="font-serif text-2xl md:text-4xl text-accent italic -mt-4 md:-mt-8 relative z-10">
             Děkujeme
           </p>
        </div>

        <div className="grid md:grid-cols-3 w-full border-t border-white/10 pt-12 gap-8 md:gap-0">
           <div className="text-center md:text-left">
              <p className="text-xs uppercase tracking-[0.2em] text-white/40 mb-2">Datum</p>
              <p className="font-serif text-xl">24. Srpna 2025</p>
           </div>

           <div className="text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-white/40 mb-2">Místo</p>
              <p className="font-serif text-xl">Zámek Hluboká</p>
           </div>

           <div className="text-center md:text-right">
              <p className="text-xs uppercase tracking-[0.2em] text-white/40 mb-2">Hashtag</p>
              <p className="font-serif text-xl">#AnnaJakub2025</p>
           </div>
        </div>

        <div className="mt-24 text-center">
          <p className="text-[10px] uppercase tracking-widest text-white/20">
            © 2025 Eternity Wedding Template. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;