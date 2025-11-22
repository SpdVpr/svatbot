
import React from 'react';
import { MapPin, Star, Share2, Heart, Award, BadgeCheck, Phone, Mail, Globe, Instagram, Facebook } from 'lucide-react';
import { Vendor } from '../types';

interface VendorHeroProps {
  vendor: Vendor;
}

export const VendorHero: React.FC<VendorHeroProps> = ({ vendor }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 min-h-[400px] md:h-[480px]">
      
      {/* LEFT: Info Card */}
      <div className="md:col-span-5 lg:col-span-4 flex flex-col bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-stone-100 relative overflow-hidden group">
         {/* Decoration bg */}
         <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50"></div>
         
         <div className="flex-1 flex flex-col items-start z-10">
            {/* Header badges */}
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="px-3 py-1 bg-stone-100 border border-stone-200 rounded-full text-xs uppercase tracking-wider font-bold text-stone-600">
                {vendor.category}
              </span>
              {vendor.badges.includes('premium') && (
                  <span className="px-3 py-1 bg-amber-100 text-amber-800 border border-amber-200 rounded-full text-xs uppercase tracking-wider font-bold flex items-center gap-1">
                  <Award size={12} /> Premium
                </span>
              )}
            </div>

            {/* Logo & Name Block */}
            <div className="flex items-center gap-4 mb-6">
               <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border border-stone-100 shadow-sm shrink-0">
                  <img src={vendor.logoUrl} alt="Logo" className="w-full h-full object-cover" />
               </div>
               <div>
                  <h1 className="text-2xl md:text-3xl font-serif font-bold text-stone-900 leading-tight">
                    {vendor.name}
                  </h1>
                   {vendor.badges.includes('verified') && (
                    <div className="flex items-center gap-1 mt-1 text-blue-600 text-xs font-bold uppercase tracking-wide">
                      <BadgeCheck size={14} fill="currentColor" className="text-blue-100" />
                      <span>Ověřeno</span>
                    </div>
                   )}
               </div>
            </div>

            {/* NEW: Contact Info Block (Replacing shortDescription) */}
            <div className="flex flex-col gap-3 mb-6 w-full">
               {/* Address */}
               <div className="flex items-start gap-3 text-stone-600 group/item">
                  <div className="w-8 h-8 rounded-full bg-stone-50 flex items-center justify-center shrink-0 group-hover/item:bg-primary-50 group-hover/item:text-primary-600 transition-colors">
                     <MapPin size={16} />
                  </div>
                  <span className="text-sm font-medium pt-1.5 leading-tight">{vendor.address}</span>
               </div>
               
               {/* Phone */}
               <div className="flex items-center gap-3 text-stone-600 group/item">
                  <div className="w-8 h-8 rounded-full bg-stone-50 flex items-center justify-center shrink-0 group-hover/item:bg-primary-50 group-hover/item:text-primary-600 transition-colors">
                     <Phone size={16} />
                  </div>
                  <a href={`tel:${vendor.phone}`} className="text-sm font-medium hover:text-primary-600 transition-colors">{vendor.phone}</a>
               </div>

               {/* Email */}
               <div className="flex items-center gap-3 text-stone-600 group/item">
                  <div className="w-8 h-8 rounded-full bg-stone-50 flex items-center justify-center shrink-0 group-hover/item:bg-primary-50 group-hover/item:text-primary-600 transition-colors">
                     <Mail size={16} />
                  </div>
                  <a href={`mailto:${vendor.email}`} className="text-sm font-medium hover:text-primary-600 transition-colors truncate max-w-[200px]">{vendor.email}</a>
               </div>

               {/* Website */}
               <div className="flex items-center gap-3 text-stone-600 group/item">
                  <div className="w-8 h-8 rounded-full bg-stone-50 flex items-center justify-center shrink-0 group-hover/item:bg-primary-50 group-hover/item:text-primary-600 transition-colors">
                     <Globe size={16} />
                  </div>
                  <a href={vendor.socials.website} target="_blank" rel="noopener noreferrer" className="text-sm font-medium hover:text-primary-600 transition-colors">
                     Webové stránky
                  </a>
               </div>
            </div>

            {/* NEW: Social Media Buttons */}
            <div className="flex gap-2 mb-4">
                {vendor.socials.instagram && (
                  <a 
                    href={`https://instagram.com/${vendor.socials.instagram}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-stone-50 border border-stone-100 rounded-lg text-stone-600 hover:bg-pink-50 hover:text-pink-600 hover:border-pink-200 transition-all text-sm font-bold"
                  >
                    <Instagram size={18} />
                    Instagram
                  </a>
                )}
                {vendor.socials.facebook && (
                  <a 
                    href={`https://facebook.com/${vendor.socials.facebook}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-stone-50 border border-stone-100 rounded-lg text-stone-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all text-sm font-bold"
                  >
                    <Facebook size={18} />
                    Facebook
                  </a>
                )}
            </div>

            {/* Stats/Details (Only Rating kept) */}
            <div className="mt-auto w-full pt-4 border-t border-stone-100">
               <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2 text-sm">
                     <span className="font-bold text-stone-900 text-lg flex items-center gap-1">
                        {vendor.rating} <Star size={16} className="text-amber-400 fill-amber-400" />
                     </span>
                     <span className="text-stone-400 underline decoration-stone-200 underline-offset-2 decoration-dotted cursor-pointer hover:text-primary-600">
                        ({vendor.reviewCount} hodnocení)
                     </span>
                   </div>
               </div>
            </div>
         </div>

         {/* Action Row */}
         <div className="mt-6 flex gap-3 z-10">
            <button className="flex-1 py-3 bg-stone-900 text-white rounded-xl font-bold text-sm hover:bg-stone-800 transition-colors shadow-lg shadow-stone-200">
               Kontaktovat
            </button>
            <button className="p-3 bg-white border border-stone-200 rounded-xl text-stone-500 hover:border-primary-200 hover:text-primary-600 transition-all">
               <Heart size={20} />
            </button>
            <button className="p-3 bg-white border border-stone-200 rounded-xl text-stone-500 hover:border-stone-300 hover:text-stone-900 transition-all">
               <Share2 size={20} />
            </button>
         </div>
      </div>

      {/* RIGHT: Visual / Cover Image */}
      <div className="md:col-span-7 lg:col-span-8 h-64 md:h-auto relative rounded-2xl overflow-hidden group shadow-sm">
         <img 
            src={vendor.coverImage} 
            alt="Cover" 
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
         />
         <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60" />
         
         <div className="absolute bottom-6 left-6 right-6 text-white/90 text-sm font-medium hidden md:block backdrop-blur-md bg-white/10 p-4 rounded-xl border border-white/20 inline-block max-w-md">
            <p>"Zažijte neopakovatelnou atmosféru folklórní zábavy a tradiční pohostinnosti."</p>
         </div>
      </div>

    </div>
  );
};
