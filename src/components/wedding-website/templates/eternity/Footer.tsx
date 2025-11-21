'use client'

import { format } from 'date-fns'
import { cs } from 'date-fns/locale'

interface FooterProps {
  bride: string
  groom: string
  weddingDate: Date
  venue?: string
  hashtag?: string
}

export default function Footer({ bride, groom, weddingDate, venue, hashtag }: FooterProps) {
  const formattedDate = format(new Date(weddingDate), 'd. MMMM yyyy', { locale: cs })

  return (
    <footer className="bg-[#1A1C1A] text-[#F4F2ED] py-20">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="text-center mb-12">
          <h2 
            className="text-6xl md:text-8xl mb-8 text-[#F4F2ED] opacity-90"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic' }}
          >
            {bride} & {groom}
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 text-center border-t border-white/10 pt-12">
          <div>
            <p className="text-xs uppercase tracking-widest text-[#C5A880] mb-2">Datum</p>
            <p className="text-white/70">{formattedDate}</p>
          </div>
          {venue && (
            <div>
              <p className="text-xs uppercase tracking-widest text-[#C5A880] mb-2">Místo</p>
              <p className="text-white/70">{venue}</p>
            </div>
          )}
          {hashtag && (
            <div>
              <p className="text-xs uppercase tracking-widest text-[#C5A880] mb-2">Hashtag</p>
              <p className="text-white/70">{hashtag}</p>
            </div>
          )}
        </div>

        <div className="text-center mt-12 pt-8 border-t border-white/5">
          <p className="text-white/30 text-xs">
            © {new Date().getFullYear()} {bride} & {groom}. Všechna práva vyhrazena.
          </p>
        </div>
      </div>
    </footer>
  )
}

