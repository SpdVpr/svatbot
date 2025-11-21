import React from 'react';
import { SectionProps } from '../types';

const MenuSection: React.FC<SectionProps> = ({ id }) => {
  return (
    <section id={id} className="py-32 bg-primary text-cream">
       <div className="max-w-4xl mx-auto px-6">
         <div className="text-center mb-20">
            <h2 className="font-display-italic text-6xl md:text-7xl mb-4">Menu</h2>
            <p className="uppercase tracking-[0.2em] text-accent text-xs">Oslava chutí</p>
         </div>

         <div className="grid md:grid-cols-2 gap-16 md:gap-24">
            <div className="space-y-12">
               <h3 className="font-serif text-3xl border-b border-white/10 pb-4 text-accent">Jídlo</h3>
               
               <div>
                  <h4 className="font-bold uppercase tracking-widest text-xs mb-2 text-white/60">Předkrm</h4>
                  <p className="font-display-italic text-2xl">Domácí paštika z husích jater</p>
                  <p className="text-white/40 text-sm mt-1">brusinky, opečený toast, rukola</p>
               </div>

               <div>
                  <h4 className="font-bold uppercase tracking-widest text-xs mb-2 text-white/60">Polévka</h4>
                  <p className="font-display-italic text-2xl">Hovězí vývar s játrovými knedlíčky</p>
                  <p className="text-white/40 text-sm mt-1">domácí nudle, kořenová zelenina</p>
               </div>

               <div>
                  <h4 className="font-bold uppercase tracking-widest text-xs mb-2 text-white/60">Hlavní chod</h4>
                  <p className="font-display-italic text-2xl">Svíčková na smetaně</p>
                  <p className="text-white/40 text-sm mt-1">karlovarský knedlík, brusinkový terč</p>
               </div>
               
               <div className="pt-4">
                  <p className="text-xs uppercase tracking-widest text-accent border border-accent/30 inline-block px-3 py-1 rounded-full">
                    Vegetariánská varianta na vyžádání
                  </p>
               </div>
            </div>

            <div className="space-y-12">
               <h3 className="font-serif text-3xl border-b border-white/10 pb-4 text-accent">Nápoje</h3>
               
               <div>
                  <h4 className="font-bold uppercase tracking-widest text-xs mb-2 text-white/60">Pivo</h4>
                  <p className="font-display-italic text-2xl">Plzeňský Prazdroj 12°</p>
               </div>

               <div>
                  <h4 className="font-bold uppercase tracking-widest text-xs mb-2 text-white/60">Bílé víno</h4>
                  <p className="font-display-italic text-2xl">Rulandské Šedé</p>
                  <p className="text-white/40 text-sm mt-1">Vinařství Sonberk, pozdní sběr 2021</p>
               </div>

               <div>
                  <h4 className="font-bold uppercase tracking-widest text-xs mb-2 text-white/60">Červené víno</h4>
                  <p className="font-display-italic text-2xl">Merlot Barrique</p>
                  <p className="text-white/40 text-sm mt-1">Vinařství Sedlák, výběr z hroznů 2019</p>
               </div>

               <div>
                  <h4 className="font-bold uppercase tracking-widest text-xs mb-2 text-white/60">Nealko</h4>
                  <p className="font-display-italic text-2xl">Domácí limonády</p>
                  <p className="text-white/40 text-sm mt-1">Malina, Bezinka, Okurka</p>
               </div>
            </div>
         </div>
       </div>
    </section>
  );
};

export default MenuSection;