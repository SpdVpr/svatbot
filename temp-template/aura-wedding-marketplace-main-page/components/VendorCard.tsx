
import React from 'react';
import { Star, MapPin, Heart, CheckCircle2 } from 'lucide-react';
import { Vendor } from '../types';

interface VendorCardProps {
  vendor: Vendor;
  onClick: (id: string) => void;
}

export const VendorCard: React.FC<VendorCardProps> = ({ vendor, onClick }) => {
  return (
    <div 
      onClick={() => onClick(vendor.id)}
      className="group bg-white rounded-2xl border border-stone-100 overflow-hidden hover:shadow-xl hover:shadow-stone-200/50 transition-all duration-300 cursor-pointer flex flex-col h-full relative"
    >
      {/* Image Container */}
      <div className="relative h-56 overflow-hidden bg-stone-100">
        <img 
          src={vendor.coverImage} 
          alt={vendor.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60" />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {vendor.badges.includes('premium') && (
            <span className="bg-white/90 backdrop-blur text-stone-900 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider shadow-sm border border-stone-100">
              Premium
            </span>
          )}
           {vendor.badges.includes('verified') && (
            <span className="bg-primary-300 text-stone-900 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider shadow-sm flex items-center gap-1">
              <CheckCircle2 size={10} /> Ověřeno
            </span>
          )}
        </div>

        {/* Like Button */}
        <button className="absolute top-3 right-3 p-2 rounded-full bg-white/20 backdrop-blur-md hover:bg-white text-white hover:text-primary-500 transition-all">
          <Heart size={16} />
        </button>

        {/* Price overlay */}
        <div className="absolute bottom-3 left-3 text-white font-medium text-sm backdrop-blur-md bg-black/20 px-2 py-1 rounded-lg border border-white/20">
          {vendor.priceRange.split('-')[0]}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <div className="text-xs font-bold text-stone-400 uppercase tracking-wide mt-1">
            {vendor.category}
          </div>
          
          {/* Ratings Stack - Both Svatbot and Google */}
          <div className="flex flex-col items-end gap-1.5">
            {/* Svatbot Rating - Using Primary Pink */}
            <div className="flex items-center gap-1 bg-primary-50 px-2 py-0.5 rounded-md border border-primary-100">
              <div className="w-3.5 h-3.5 rounded-full bg-primary-300 text-stone-900 flex items-center justify-center text-[8px] font-bold">S</div>
              <span className="text-stone-900 font-bold text-xs">{vendor.rating}</span>
              <div className="flex gap-0.5">
                 <Star size={10} className="text-primary-400 fill-primary-400" />
              </div>
              <span className="text-stone-400 text-[10px]">({vendor.reviewCount})</span>
            </div>

            {/* Google Rating (if exists) - Using Google Blue/Colors */}
            {vendor.googleRating > 0 && (
              <div className="flex items-center gap-1 bg-stone-50 px-2 py-0.5 rounded-md border border-stone-100">
                 <div className="w-3.5 h-3.5 flex items-center justify-center">
                   <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="G" className="w-full h-full" />
                 </div>
                 <span className="text-stone-900 font-bold text-xs">{vendor.googleRating}</span>
                 <div className="flex gap-0.5">
                    <Star size={10} className="text-amber-400 fill-amber-400" />
                 </div>
                 <span className="text-stone-400 text-[10px]">({vendor.googleReviewCount})</span>
              </div>
            )}
          </div>
        </div>

        <h3 className="font-serif font-bold text-xl text-stone-900 mb-2 group-hover:text-primary-500 transition-colors line-clamp-1">
          {vendor.name}
        </h3>
        
        <div className="flex items-center gap-1 text-stone-500 text-sm mb-4">
          <MapPin size={14} />
          {vendor.location}
        </div>

        <div className="mt-auto pt-4 border-t border-stone-100 flex items-center justify-between">
           {/* Simple tags preview */}
           <div className="flex gap-2 overflow-hidden">
              {vendor.tags.slice(0,2).map((tag, i) => (
                <span key={i} className="text-[10px] bg-stone-50 text-stone-500 px-2 py-1 rounded-md border border-stone-100 whitespace-nowrap">
                  {tag}
                </span>
              ))}
           </div>
           
           <span className="text-stone-900 text-xs font-bold hover:underline decoration-primary-300 decoration-2 cursor-pointer whitespace-nowrap ml-2">
             Detail
           </span>
        </div>
      </div>
    </div>
  );
};
