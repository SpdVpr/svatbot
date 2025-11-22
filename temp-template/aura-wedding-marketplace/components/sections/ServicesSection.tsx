import React from 'react';
import { Service } from '../../types';
import { CheckCircle2, Sparkles } from 'lucide-react';

interface ServicesSectionProps {
  services: Service[];
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ services }) => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end mb-6 px-2">
        <h2 className="text-2xl font-serif font-bold text-stone-900">Ceník služeb</h2>
        <a href="#" className="text-sm font-medium text-primary-600 hover:text-primary-700 underline decoration-primary-200 underline-offset-4">
          Stáhnout PDF
        </a>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {services.map((service) => (
          <div 
            key={service.id} 
            className={`
              relative bg-white rounded-3xl p-6 md:p-8 border transition-all hover:shadow-lg
              ${service.isPopular 
                ? 'border-primary-500 shadow-md ring-1 ring-primary-100' 
                : 'border-stone-100 shadow-sm hover:border-stone-300'
              }
            `}
          >
            {service.isPopular && (
              <div className="absolute -top-3 left-8 bg-gradient-to-r from-primary-500 to-rose-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                <Sparkles size={12} />
                Nejoblíbenější
              </div>
            )}

            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
              <div className="flex-1">
                <h3 className="text-xl font-serif font-bold text-stone-900">{service.title}</h3>
                <p className="text-stone-500 text-sm mt-1 mb-4">{service.description}</p>
                
                <ul className="space-y-2">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-stone-700">
                      <CheckCircle2 size={18} className="text-green-500 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 md:mt-0 flex flex-row md:flex-col justify-between items-center md:items-end gap-4 border-t md:border-t-0 md:border-l border-stone-100 pt-4 md:pt-0 md:pl-8 md:min-w-[180px]">
                <div className="text-left md:text-right">
                  <span className="block text-2xl font-bold text-stone-900">{service.price}</span>
                  <span className="text-xs text-stone-400">včetně DPH</span>
                </div>
                <button className="px-6 py-2 rounded-xl bg-stone-100 text-stone-900 font-medium text-sm hover:bg-stone-900 hover:text-white transition-colors">
                  Vybrat
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 bg-stone-100 p-6 rounded-2xl text-center text-sm text-stone-500">
        Ceny jsou orientační. Pro přesnou kalkulaci nás prosím kontaktujte. 
        Možnost sestavení individuálního balíčku na míru.
      </div>
    </div>
  );
};