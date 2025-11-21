'use client'

import { ScheduleContent } from '@/types/wedding-website'

interface ScheduleSectionProps {
  content: ScheduleContent
}

export default function ScheduleSection({ content }: ScheduleSectionProps) {
  if (!content.enabled || !content.items || content.items.length === 0) return null

  return (
    <section id="schedule" className="py-32 bg-[#5F6F52] text-[#F4F2ED]">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-20">
           <h2 
             className="text-6xl md:text-7xl mb-4"
             style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic' }}
           >
             Program dne
           </h2>
           <div className="w-px h-16 bg-[#C5A880] mx-auto mt-8"></div>
        </div>

        <div className="space-y-8">
          {content.items.map((event, index) => (
            <div 
              key={index} 
              className="group flex items-baseline border-b border-white/10 pb-8 hover:border-[#C5A880]/50 transition-colors duration-500"
            >
               <div className="w-24 md:w-32 flex-shrink-0">
                  <span className="font-serif text-2xl md:text-3xl text-[#C5A880]">{event.time}</span>
               </div>
               <div className="flex-grow">
                  <h3 className="font-serif text-2xl md:text-3xl mb-1 group-hover:translate-x-2 transition-transform duration-500">
                    {event.title}
                  </h3>
                  {event.description && (
                    <p className="text-white/60 font-light text-sm md:text-base">{event.description}</p>
                  )}
               </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

