'use client'

import { GiftContent } from '@/types/wedding-website'
import { Heart, ExternalLink } from 'lucide-react'

interface GiftSectionProps {
  content: GiftContent
}

export default function GiftSection({ content }: GiftSectionProps) {
  if (!content.enabled) return null

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // TODO: Show toast notification
  }

  return (
    <section id="gift" className="py-32 bg-[#FCFBF9]">
      <div className="max-w-4xl mx-auto px-6 text-center">
        
        <h2 className="font-serif text-5xl md:text-6xl text-[#2C362B] mb-12">Svatební dary</h2>
        
        {content.message && (
          <p className="text-[#1A1C1A]/70 text-lg leading-relaxed mb-16 max-w-2xl mx-auto font-light">
            {content.message}
          </p>
        )}

        {content.bankAccount && (
          <div className="inline-block relative p-10 md:p-16 border border-[#2C362B]/10 bg-white shadow-sm max-w-2xl mx-auto mb-16">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4">
               <Heart className="w-6 h-6 text-[#C5A880] fill-[#C5A880]" />
            </div>
            <p className="text-xs uppercase tracking-widest text-[#5F6F52] mb-4">Číslo účtu</p>
            <p 
              className="text-4xl md:text-5xl text-[#2C362B] mb-6"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic' }}
            >
              {content.bankAccount}
            </p>
            <button 
              onClick={() => copyToClipboard(content.bankAccount!)} 
              className="text-xs text-[#C5A880] hover:text-[#2C362B] uppercase tracking-widest border-b border-[#C5A880]/30 pb-1 transition-colors"
            >
              Zkopírovat číslo
            </button>
          </div>
        )}

        {/* Registry Items */}
        {content.registry && content.registry.length > 0 && (
          <div className="mt-16">
            <h3 className="font-serif text-3xl text-[#2C362B] mb-8">Seznam přání</h3>
            <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {content.registry.map((item, index) => (
                <a
                  key={index}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white p-6 rounded-lg border border-[#2C362B]/10 hover:border-[#C5A880] transition-colors group text-left"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-[#2C362B] mb-2 group-hover:text-[#C5A880] transition-colors">
                        {item.name}
                      </h4>
                      {item.description && (
                        <p className="text-sm text-[#1A1C1A]/60">{item.description}</p>
                      )}
                    </div>
                    <ExternalLink className="w-4 h-4 text-[#C5A880] flex-shrink-0 ml-2" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

