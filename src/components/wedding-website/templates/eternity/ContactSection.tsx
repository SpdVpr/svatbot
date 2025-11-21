'use client'

import { ContactContent } from '@/types/wedding-website'
import { Phone, Mail } from 'lucide-react'

interface ContactSectionProps {
  content: ContactContent
}

export default function ContactSection({ content }: ContactSectionProps) {
  if (!content.enabled) return null

  // Check if there's any contact info to display
  const hasContacts = content.bride || content.groom ||
    (content.bridesmaids && content.bridesmaids.length > 0) ||
    (content.groomsmen && content.groomsmen.length > 0)

  if (!hasContacts) return null

  return (
    <section id="contact" className="py-32 bg-[#5F6F52] text-[#F4F2ED] relative overflow-hidden">
      {/* Decorative blur element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#C5A880]/10 rounded-full blur-[120px]"></div>

      <div className="max-w-[1400px] mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2
            className="text-6xl md:text-7xl mb-4"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic' }}
          >
            Kontaktujte nás
          </h2>
          <p className="text-white/70 text-lg">
            Máte dotazy? Neváhejte nás kontaktovat
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Bride */}
          {content.bride && (
            <div className="bg-white/5 backdrop-blur p-8 rounded-lg border border-white/10">
              <h3 className="font-serif text-3xl mb-2">{content.bride.name}</h3>
              <p className="text-[#C5A880] text-sm uppercase tracking-widest mb-6">Nevěsta</p>
              <div className="flex flex-col gap-3">
                {content.bride.phone && (
                  <a
                    href={`tel:${content.bride.phone}`}
                    className="flex items-center gap-3 text-white/70 hover:text-white transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-[#C5A880] transition-colors">
                      <Phone className="w-4 h-4" />
                    </div>
                    <span>{content.bride.phone}</span>
                  </a>
                )}
                {content.bride.email && (
                  <a
                    href={`mailto:${content.bride.email}`}
                    className="flex items-center gap-3 text-white/70 hover:text-white transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-[#C5A880] transition-colors">
                      <Mail className="w-4 h-4" />
                    </div>
                    <span>{content.bride.email}</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Groom */}
          {content.groom && (
            <div className="bg-white/5 backdrop-blur p-8 rounded-lg border border-white/10">
              <h3 className="font-serif text-3xl mb-2">{content.groom.name}</h3>
              <p className="text-[#C5A880] text-sm uppercase tracking-widest mb-6">Ženich</p>
              <div className="flex flex-col gap-3">
                {content.groom.phone && (
                  <a
                    href={`tel:${content.groom.phone}`}
                    className="flex items-center gap-3 text-white/70 hover:text-white transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-[#C5A880] transition-colors">
                      <Phone className="w-4 h-4" />
                    </div>
                    <span>{content.groom.phone}</span>
                  </a>
                )}
                {content.groom.email && (
                  <a
                    href={`mailto:${content.groom.email}`}
                    className="flex items-center gap-3 text-white/70 hover:text-white transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-[#C5A880] transition-colors">
                      <Mail className="w-4 h-4" />
                    </div>
                    <span>{content.groom.email}</span>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bridesmaids & Groomsmen */}
        {((content.bridesmaids && content.bridesmaids.length > 0) ||
          (content.groomsmen && content.groomsmen.length > 0)) && (
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-8">
            {content.bridesmaids && content.bridesmaids.length > 0 && (
              <div className="bg-white/5 backdrop-blur p-6 rounded-lg border border-white/10">
                <h4 className="text-[#C5A880] text-sm uppercase tracking-widest mb-4">Družičky</h4>
                <div className="space-y-3">
                  {content.bridesmaids.map((person, index) => (
                    <div key={index} className="text-white/70">
                      <span className="font-semibold">{person.name}</span>
                      {person.phone && <span className="ml-2 text-sm">• {person.phone}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {content.groomsmen && content.groomsmen.length > 0 && (
              <div className="bg-white/5 backdrop-blur p-6 rounded-lg border border-white/10">
                <h4 className="text-[#C5A880] text-sm uppercase tracking-widest mb-4">Svědci</h4>
                <div className="space-y-3">
                  {content.groomsmen.map((person, index) => (
                    <div key={index} className="text-white/70">
                      <span className="font-semibold">{person.name}</span>
                      {person.phone && <span className="ml-2 text-sm">• {person.phone}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

