'use client'

import { InfoContent } from '@/types/wedding-website'
import { MapPin } from 'lucide-react'
import { format } from 'date-fns'
import { cs } from 'date-fns/locale'

interface LocationSectionProps {
  content: InfoContent
  weddingDate: Date
}

export default function LocationSection({ content, weddingDate }: LocationSectionProps) {
  if (!content.enabled) return null

  const formattedDate = format(new Date(weddingDate), 'd. MMMM yyyy', { locale: cs })

  return (
    <section id="info" className="py-32 bg-[#2C362B] text-[#F4F2ED] relative">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="text-center mb-24">
           <h2 
             className="text-6xl md:text-8xl mb-6 text-[#F4F2ED] opacity-90"
             style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic' }}
           >
             Místo & Čas
           </h2>
           <p className="uppercase tracking-[0.2em] text-[#C5A880] text-sm">{formattedDate} • Česká republika</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 lg:gap-32">
           {/* Ceremony */}
           {content.ceremony && (
             <div className="group">
                <div className="relative h-[500px] w-full overflow-hidden rounded-t-[12rem] mb-8 border border-white/10">
                  <img 
                    src={content.ceremony.images?.[0] || 'https://images.unsplash.com/photo-1565619624098-e95057a2f3dc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80'} 
                    alt="Ceremony" 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                  />
                  <div className="absolute top-8 right-8 bg-white/10 backdrop-blur-md border border-white/20 p-4 text-center rounded-lg">
                     <span className="block text-2xl font-serif">{content.ceremony.time}</span>
                  </div>
                </div>
                <div className="text-center lg:text-left">
                  <h3 className="font-serif text-4xl mb-2 text-[#C5A880]">Svatební Obřad</h3>
                  <p 
                    className="text-2xl mb-4 opacity-80"
                    style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic' }}
                  >
                    {content.ceremony.venue}
                  </p>
                  <div className="flex items-center justify-center lg:justify-start gap-2 text-sm tracking-wide opacity-60 mb-6">
                    <MapPin className="w-4 h-4" />
                    <span>{content.ceremony.address}</span>
                  </div>
                  {content.ceremony.mapUrl && (
                    <a 
                      href={content.ceremony.mapUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-block border-b border-[#C5A880] text-[#C5A880] hover:text-white pb-1 transition-colors uppercase text-xs tracking-widest"
                    >
                      Mapa místa
                    </a>
                  )}
                </div>
             </div>
           )}

           {/* Reception */}
           {content.reception && (
             <div className="group lg:mt-24">
                <div className="relative h-[500px] w-full overflow-hidden rounded-t-[12rem] mb-8 border border-white/10">
                  <img 
                    src={content.reception.images?.[0] || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1198&q=80'} 
                    alt="Reception" 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                  />
                  <div className="absolute top-8 right-8 bg-white/10 backdrop-blur-md border border-white/20 p-4 text-center rounded-lg">
                     <span className="block text-2xl font-serif">{content.reception.time}</span>
                  </div>
                </div>
                <div className="text-center lg:text-left">
                  <h3 className="font-serif text-4xl mb-2 text-[#C5A880]">Svatební Hostina</h3>
                  <p 
                    className="text-2xl mb-4 opacity-80"
                    style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic' }}
                  >
                    {content.reception.venue}
                  </p>
                  <div className="flex items-center justify-center lg:justify-start gap-2 text-sm tracking-wide opacity-60 mb-6">
                    <MapPin className="w-4 h-4" />
                    <span>{content.reception.address}</span>
                  </div>
                  {content.reception.mapUrl && (
                    <a 
                      href={content.reception.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer" 
                      className="inline-block border-b border-[#C5A880] text-[#C5A880] hover:text-white pb-1 transition-colors uppercase text-xs tracking-widest"
                    >
                      Mapa místa
                    </a>
                  )}
                </div>
             </div>
           )}
        </div>

        {/* Additional Info */}
        {(content.parking || content.accessibility) && (
          <div className="mt-24 max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
            {content.parking && (
              <div className="bg-white/5 backdrop-blur p-8 rounded-lg border border-white/10">
                <h4 className="text-[#C5A880] uppercase tracking-widest text-xs mb-4">Parkování</h4>
                <p className="text-white/70 leading-relaxed">{content.parking}</p>
              </div>
            )}
            {content.accessibility && (
              <div className="bg-white/5 backdrop-blur p-8 rounded-lg border border-white/10">
                <h4 className="text-[#C5A880] uppercase tracking-widest text-xs mb-4">Bezbariérovost</h4>
                <p className="text-white/70 leading-relaxed">{content.accessibility}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

