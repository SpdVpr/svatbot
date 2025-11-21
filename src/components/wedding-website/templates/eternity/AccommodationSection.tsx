'use client'

import { AccommodationContent } from '@/types/wedding-website'
import { ExternalLink } from 'lucide-react'

interface AccommodationSectionProps {
  content: AccommodationContent
}

export default function AccommodationSection({ content }: AccommodationSectionProps) {
  if (!content.enabled || !content.accommodations || content.accommodations.length === 0) return null

  return (
    <section id="accommodation" className="py-32 bg-[#F4F2ED]">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 border-b border-[#2C362B]/10 pb-8">
          <div className="max-w-xl">
             <h2 className="font-serif text-5xl text-[#2C362B] mb-4">Ubytování</h2>
             {content.description && (
               <p className="text-[#1A1C1A]/60">{content.description}</p>
             )}
          </div>
          {content.contactInfo && (
            <div className="mt-8 md:mt-0">
               <span className="text-[#C5A880] text-sm uppercase tracking-widest">
                 {content.contactInfo.name}
                 {content.contactInfo.phone && ` (${content.contactInfo.phone})`}
               </span>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {content.accommodations.map((hotel, index) => (
            <div key={hotel.id} className="group cursor-pointer">
              <div className="h-[350px] overflow-hidden mb-6 relative rounded-sm">
                <img 
                  src={hotel.image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80'} 
                  alt={hotel.name} 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" 
                />
                {content.showPrices && hotel.rooms && hotel.rooms.length > 0 && (
                  <div className="absolute top-4 right-4 bg-white px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#2C362B]">
                     od {Math.min(...hotel.rooms.map(r => r.pricePerNight))} Kč
                  </div>
                )}
              </div>
              <div className="flex justify-between items-start">
                <div>
                   <h3 className="font-serif text-2xl text-[#2C362B] mb-1">{hotel.name}</h3>
                   <p className="text-sm text-[#1A1C1A]/50 mb-2">{hotel.address}</p>
                   {hotel.description && (
                     <p className="text-[#1A1C1A]/70 text-sm">{hotel.description}</p>
                   )}
                   
                   {/* Rooms */}
                   {hotel.rooms && hotel.rooms.length > 0 && (
                     <div className="mt-4 space-y-2">
                       {hotel.rooms.map((room, roomIndex) => (
                         <div key={roomIndex} className="text-xs text-[#1A1C1A]/60">
                           <span className="font-semibold">{room.name}</span>
                           {content.showPrices && (
                             <span> • {room.pricePerNight} Kč/noc</span>
                           )}
                           {content.showAvailability && (
                             <span> • {room.count}x dostupné</span>
                           )}
                         </div>
                       ))}
                     </div>
                   )}
                </div>
                {hotel.website && (
                  <a 
                    href={hotel.website} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 border border-[#2C362B]/20 rounded-full hover:bg-[#2C362B] hover:text-white transition-colors"
                  >
                     <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

