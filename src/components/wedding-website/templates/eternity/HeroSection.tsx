'use client'

import { HeroContent } from '@/types/wedding-website'
import { format } from 'date-fns'
import { cs } from 'date-fns/locale'

interface HeroSectionProps {
  content: HeroContent
}

export default function HeroSection({ content }: HeroSectionProps) {
  const formattedDate = format(new Date(content.weddingDate), 'd. MMMM yyyy', { locale: cs }).toUpperCase()
  const venue = content.venue || ''

  return (
    <section id="hero" className="relative h-screen w-full overflow-hidden">
      {/* Background Image with subtle animation */}
      <div className="absolute inset-0 z-0 animate-scale-in">
        <img 
          src={content.mainImage || 'https://images.unsplash.com/photo-1627389955689-2640b4f87d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'} 
          alt="Wedding Couple" 
          className="w-full h-full object-cover brightness-[0.65]"
          style={{
            objectPosition: content.imagePosition 
              ? `${content.imagePosition.x}% ${content.imagePosition.y}%` 
              : 'center',
            transform: content.imageScale ? `scale(${content.imageScale})` : 'scale(1)'
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4">
        
        <div className="animate-fade-in-up flex flex-col items-center">
          <span className="text-[#C5A880] uppercase tracking-[0.5em] text-xs md:text-sm mb-6 border-b border-[#C5A880] pb-2">
            {content.tagline || 'Vezmeme se'}
          </span>
          
          <div 
            className="text-7xl md:text-9xl lg:text-[10rem] text-[#F4F2ED] leading-none mix-blend-overlay opacity-90"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic' }}
          >
            {content.bride}
          </div>
          <div 
            className="font-serif text-4xl md:text-6xl text-[#C5A880] my-[-1rem] md:my-[-2rem] z-20 relative italic"
          >
            &
          </div>
          <div 
            className="text-7xl md:text-9xl lg:text-[10rem] text-[#F4F2ED] leading-none mix-blend-overlay opacity-90"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic' }}
          >
            {content.groom}
          </div>

          <div className="mt-12 flex flex-col md:flex-row items-center gap-4 md:gap-12 text-[#F4F2ED] font-sans font-light tracking-[0.2em] text-sm md:text-base">
             <span>{formattedDate}</span>
             {venue && (
               <>
                 <span className="w-1 h-1 bg-[#C5A880] rounded-full hidden md:block"></span>
                 <span>{venue.toUpperCase()}</span>
               </>
             )}
          </div>
        </div>

      </div>
      
      {/* Decorative Scroll Line */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-24 w-px bg-gradient-to-b from-transparent via-[#F4F2ED] to-transparent opacity-50"></div>

      <style jsx>{`
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(40px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          0% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 1.2s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .animate-scale-in {
          animation: scaleIn 1.5s cubic-bezier(0.22, 1, 0.36, 1);
        }
      `}</style>
    </section>
  )
}

