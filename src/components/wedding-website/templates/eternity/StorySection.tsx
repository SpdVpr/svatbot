'use client'

import { StoryContent } from '@/types/wedding-website'
import { format } from 'date-fns'
import { cs } from 'date-fns/locale'

interface StorySectionProps {
  content: StoryContent
}

export default function StorySection({ content }: StorySectionProps) {
  if (!content.enabled) return null

  return (
    <section id="story" className="py-32 bg-[#F4F2ED] overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        
        {/* Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-24 items-end">
           <div className="lg:col-span-4">
              <span className="text-[#C5A880] uppercase tracking-[0.3em] text-xs block mb-4">Náš příběh</span>
              <h2 className="font-serif text-5xl md:text-7xl text-[#2C362B] leading-tight">
                {content.title || 'Láska, která'} <br/>
                <span 
                  className="italic text-[#5F6F52]"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  {content.subtitle || 'začala kávou.'}
                </span>
              </h2>
           </div>
           <div className="lg:col-span-1 hidden lg:block h-px bg-[#2C362B]/10 w-full self-center"></div>
           <div className="lg:col-span-7">
              <p className="text-[#1A1C1A]/70 text-lg leading-relaxed font-light max-w-2xl">
                {content.description || 'Někdy stačí malý okamžik, aby se změnil celý život.'}
              </p>
           </div>
        </div>

        {/* Couple Grid */}
        {(content.bride || content.groom) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-24 mb-32">
            {/* Her */}
            {content.bride && (
              <div className="flex flex-col items-center md:items-start space-y-6 group">
                 <div className="relative w-full aspect-[3/4] overflow-hidden rounded-t-[10rem] rounded-b-lg">
                   <img 
                      src={content.bride.image || 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80'} 
                      alt="Bride" 
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                   />
                   <div className="absolute bottom-4 left-4 bg-[#F4F2ED]/90 backdrop-blur px-4 py-2 rounded-full">
                      <span className="uppercase tracking-widest text-xs font-bold text-[#2C362B]">Nevěsta</span>
                   </div>
                 </div>
                 <h3 
                   className="text-4xl text-[#2C362B]"
                   style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic' }}
                 >
                   {content.bride.name}
                 </h3>
                 <p className="text-[#1A1C1A]/60 leading-relaxed md:max-w-md">
                   {content.bride.description}
                 </p>
              </div>
            )}

            {/* Him */}
            {content.groom && (
              <div className="flex flex-col items-center md:items-start space-y-6 group md:mt-32">
                 <div className="relative w-full aspect-[3/4] overflow-hidden rounded-t-[10rem] rounded-b-lg">
                   <img 
                      src={content.groom.image || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=774&q=80'} 
                      alt="Groom" 
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                   />
                   <div className="absolute bottom-4 right-4 bg-[#F4F2ED]/90 backdrop-blur px-4 py-2 rounded-full">
                      <span className="uppercase tracking-widest text-xs font-bold text-[#2C362B]">Ženich</span>
                   </div>
                 </div>
                 <h3 
                   className="text-4xl text-[#2C362B]"
                   style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic' }}
                 >
                   {content.groom.name}
                 </h3>
                 <p className="text-[#1A1C1A]/60 leading-relaxed md:max-w-md">
                   {content.groom.description}
                 </p>
              </div>
            )}
          </div>
        )}

        {/* Timeline - Minimal */}
        {content.timeline && content.timeline.length > 0 && (
          <div className="max-w-3xl mx-auto border-l border-[#2C362B]/20 pl-8 md:pl-16 space-y-20 py-12">
             {content.timeline.map((item) => (
               <div key={item.id} className="relative">
                 <span className="absolute -left-[3.3rem] md:-left-[4.3rem] top-2 w-3 h-3 bg-[#2C362B] rounded-full outline outline-8 outline-[#F4F2ED]"></span>
                 <span className="text-[#C5A880] font-bold tracking-widest uppercase text-xs mb-2 block">{item.date}</span>
                 <h4 className="font-serif text-3xl text-[#2C362B] mb-4">{item.title}</h4>
                 <p className="text-[#1A1C1A]/70 font-light">{item.description}</p>
               </div>
             ))}
          </div>
        )}

        {/* How We Met & Proposal */}
        {(content.howWeMet || content.proposal) && (
          <div className="max-w-3xl mx-auto border-l border-[#2C362B]/20 pl-8 md:pl-16 space-y-20 py-12">
            {content.howWeMet && (
              <div className="relative">
                <span className="absolute -left-[3.3rem] md:-left-[4.3rem] top-2 w-3 h-3 bg-[#2C362B] rounded-full outline outline-8 outline-[#F4F2ED]"></span>
                {content.howWeMet.date && (
                  <span className="text-[#C5A880] font-bold tracking-widest uppercase text-xs mb-2 block">
                    {format(new Date(content.howWeMet.date), 'LLLL yyyy', { locale: cs })}
                  </span>
                )}
                <h4 className="font-serif text-3xl text-[#2C362B] mb-4">{content.howWeMet.title}</h4>
                <p className="text-[#1A1C1A]/70 font-light">{content.howWeMet.text}</p>
              </div>
            )}
            {content.proposal && (
              <div className="relative">
                <span className="absolute -left-[3.3rem] md:-left-[4.3rem] top-2 w-3 h-3 bg-[#2C362B] rounded-full outline outline-8 outline-[#F4F2ED]"></span>
                {content.proposal.date && (
                  <span className="text-[#C5A880] font-bold tracking-widest uppercase text-xs mb-2 block">
                    {format(new Date(content.proposal.date), 'LLLL yyyy', { locale: cs })}
                  </span>
                )}
                <h4 className="font-serif text-3xl text-[#2C362B] mb-4">{content.proposal.title}</h4>
                <p className="text-[#1A1C1A]/70 font-light">{content.proposal.text}</p>
              </div>
            )}
          </div>
        )}

      </div>
    </section>
  )
}

