import React from 'react';
import { Vendor } from '../types';
import { ContactForm } from './ContactForm';
import { Check, Globe, Instagram, Sparkles, ArrowRight, CreditCard } from 'lucide-react';

interface StickySidebarProps {
  vendor: Vendor;
}

export const StickySidebar: React.FC<StickySidebarProps> = ({ vendor }) => {
  return (
    <div className="space-y-6">
      
      {/* 1. Services & Packages (Now FIRST as requested) */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-lg shadow-stone-200/50 border border-stone-100 ring-1 ring-black/5">
        
        {/* Pricing Header */}
        <div className="p-6 bg-stone-900 text-white">
          <div className="flex justify-between items-center mb-1">
             <h4 className="font-serif font-bold text-lg">Ceník služeb</h4>
             <CreditCard size={18} className="text-stone-400"/>
          </div>
          <div className="flex items-baseline gap-2">
             <span className="text-stone-400 text-sm">již od</span>
             <span className="font-bold text-2xl tracking-tight">{vendor.priceRange.split('-')[0]}</span>
          </div>
        </div>

        {/* Services List */}
        <div className="divide-y divide-stone-100">
          {vendor.services.map((service) => (
            <div key={service.id} className="p-5 hover:bg-stone-50 transition-colors group cursor-pointer relative">
              {service.isPopular && (
                <div className="absolute top-0 right-0 bg-primary-600 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">
                  DOPORUČUJEME
                </div>
              )}
              <div className="flex justify-between items-start mb-1 pr-4">
                <h5 className="font-bold text-stone-900 flex items-center gap-2 text-sm">
                  {service.title}
                </h5>
              </div>
              <div className="text-primary-600 font-bold text-base mb-2">{service.price}</div>
              
              <p className="text-xs text-stone-500 leading-relaxed mb-3">
                {service.description}
              </p>
              
              {/* Features mini list */}
              <ul className="space-y-1 mb-3">
                {service.features.slice(0, 2).map((feature, idx) => (
                   <li key={idx} className="flex items-center gap-2 text-xs text-stone-600">
                     <div className="w-1 h-1 rounded-full bg-primary-500"></div>
                     {feature}
                   </li>
                ))}
              </ul>

              <button className="w-full py-2 rounded-lg border border-stone-200 text-xs font-bold text-stone-600 uppercase tracking-wide group-hover:bg-primary-600 group-hover:border-primary-600 group-hover:text-white transition-all">
                Vybrat balíček
              </button>
            </div>
          ))}
        </div>
        
        <div className="p-4 bg-stone-50 text-center border-t border-stone-100">
           <button className="text-xs font-bold text-stone-500 hover:text-primary-600 transition-colors flex items-center justify-center gap-1 mx-auto">
             Stáhnout kompletní PDF ceník <ArrowRight size={12} />
           </button>
        </div>
      </div>

      {/* 2. Contact Form (Secondary but important) */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
        <h3 className="font-serif text-lg font-bold mb-2 text-stone-900">Ověřit termín</h3>
        <p className="text-xs text-stone-500 mb-4">Líbí se vám naše práce? Napište nám nezávaznou poptávku.</p>
        <ContactForm />
      </div>

      {/* 3. Quick Facts */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
        <h4 className="font-serif font-bold mb-4 text-sm uppercase tracking-wider text-stone-400">Informace</h4>
        <ul className="space-y-4 text-sm text-stone-600">
          <li className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 shrink-0">
              <Check size={16} />
            </div>
            <span>{vendor.completedWeddings} realizovaných svateb</span>
          </li>
          <li className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
              <Globe size={16} />
            </div>
            <span>Hovoříme: {vendor.languages.join(", ")}</span>
          </li>
           <li className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
              <Instagram size={16} />
            </div>
            <a href="#" className="hover:text-primary-600 font-medium transition-colors">
              @{vendor.socials.instagram}
            </a>
          </li>
        </ul>
      </div>

    </div>
  );
};