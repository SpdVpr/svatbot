import React from 'react';
import { Vendor } from '../../types';
import { Tag, Calendar } from 'lucide-react';

interface OverviewSectionProps {
  vendor: Vendor;
}

export const OverviewSection: React.FC<OverviewSectionProps> = ({ vendor }) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Elevator Pitch / Intro */}
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-stone-100">
        <h2 className="text-2xl font-serif font-bold mb-4 text-stone-900">O nás</h2>
        <p className="text-lg leading-relaxed text-stone-600 font-light mb-6 border-l-4 border-primary-300 pl-4 italic">
          "{vendor.shortDescription}"
        </p>
        <div className="prose prose-stone prose-p:text-stone-600 max-w-none">
          {vendor.description.split('\n').map((paragraph, idx) => (
            <p key={idx} className="mb-4 last:mb-0">{paragraph}</p>
          ))}
        </div>

        {/* Tags */}
        <div className="mt-8 flex flex-wrap gap-2">
          {vendor.tags.map((tag, i) => (
            <span key={i} className="inline-flex items-center gap-1 px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-600">
              <Tag size={14} /> {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Why Choose Us Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-primary-50/50 p-6 rounded-3xl border border-primary-100">
          <h3 className="font-serif font-bold text-lg text-primary-900 mb-2">Zkušenost a jistota</h3>
          <p className="text-sm text-primary-800/80 leading-relaxed">
            Působíme na trhu od roku {vendor.foundedYear} a úspěšně jsme zrealizovali přes {vendor.completedWeddings} svateb. Víme, jak se chovat v krizových situacích.
          </p>
        </div>
        <div className="bg-stone-100/50 p-6 rounded-3xl border border-stone-200">
             <h3 className="font-serif font-bold text-lg text-stone-900 mb-2">Osobní přístup</h3>
          <p className="text-sm text-stone-600 leading-relaxed">
            Ke každému páru přistupujeme individuálně. Před svatbou nabízíme konzultaci zdarma, abychom se ujistili, že jsme na stejné vlně.
          </p>
        </div>
      </div>

    </div>
  );
};