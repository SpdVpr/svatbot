import React from 'react';
import { SectionProps } from '../types';

const DressCodeSection: React.FC<SectionProps> = ({ id }) => {
  return (
    <section id={id} className="py-24 bg-paper">
      <div className="max-w-5xl mx-auto px-6 text-center">
        <span className="text-secondary uppercase tracking-[0.3em] text-xs mb-4 block">Informace pro hosty</span>
        <h2 className="font-serif text-5xl md:text-6xl text-primary mb-12">Dress Code</h2>
        
        <div className="bg-white p-12 md:p-16 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border border-primary/5">
          <h3 className="text-accent text-xl font-sans uppercase tracking-widest mb-6">Cocktail Attire</h3>
          <p className="text-dark/70 leading-relaxed mb-12 max-w-2xl mx-auto text-lg font-light">
            Přejeme si, aby naše svatba byla elegantní, ale uvolněná. Pánové mohou zvolit oblek (kravata není nutná), dámy koktejlové šaty. 
            <br/><br/>
            Budeme rádi, když se sladíte do barev naší svatby, ale nejdůležitější je, abyste se cítili skvěle.
          </p>

          <div className="flex flex-wrap justify-center gap-8">
             {/* Swatches */}
             <div className="flex flex-col gap-3 items-center">
                <div className="w-20 h-24 bg-[#2C362B] rounded-t-full shadow-sm"></div>
                <span className="text-xs uppercase tracking-wider text-gray-500">Forest</span>
             </div>
             <div className="flex flex-col gap-3 items-center">
                <div className="w-20 h-24 bg-[#5F6F52] rounded-t-full shadow-sm"></div>
                <span className="text-xs uppercase tracking-wider text-gray-500">Sage</span>
             </div>
             <div className="flex flex-col gap-3 items-center">
                <div className="w-20 h-24 bg-[#C5A880] rounded-t-full shadow-sm"></div>
                <span className="text-xs uppercase tracking-wider text-gray-500">Gold</span>
             </div>
             <div className="flex flex-col gap-3 items-center">
                <div className="w-20 h-24 bg-[#F4F2ED] border border-gray-200 rounded-t-full shadow-sm"></div>
                <span className="text-xs uppercase tracking-wider text-gray-500">Cream</span>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DressCodeSection;