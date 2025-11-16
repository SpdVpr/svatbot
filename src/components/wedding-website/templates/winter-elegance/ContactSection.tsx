'use client'

import { useColorTheme } from '../ColorThemeContext'
import { ContactContent } from '@/types/wedding-website'
import { Mail, Phone } from 'lucide-react'

interface ContactSectionProps {
  content: ContactContent
}

export default function ContactSection({ content }: ContactSectionProps) {
  const { theme } = useColorTheme()

  if (!content.enabled) return null

  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-light text-stone-900 mb-6">
            Kontakt
          </h2>
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-stone-400 to-transparent mx-auto mb-8"></div>
          <p className="text-xl text-stone-600 leading-relaxed max-w-3xl mx-auto">
            Máte dotazy? Neváhejte nás kontaktovat
          </p>
        </div>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Bride */}
          {content.bride && (
            <div className="bg-stone-50 rounded-2xl p-8 text-center">
              <h3 className="text-2xl font-serif font-light text-stone-900 mb-6">
                {content.bride.name}
              </h3>
              <div className="space-y-4">
                {content.bride.email && (
                  <a
                    href={`mailto:${content.bride.email}`}
                    className="flex items-center justify-center gap-3 text-stone-600 hover:text-stone-900 transition-colors"
                  >
                    <Mail className="w-5 h-5" />
                    <span>{content.bride.email}</span>
                  </a>
                )}
                {content.bride.phone && (
                  <a
                    href={`tel:${content.bride.phone}`}
                    className="flex items-center justify-center gap-3 text-stone-600 hover:text-stone-900 transition-colors"
                  >
                    <Phone className="w-5 h-5" />
                    <span>{content.bride.phone}</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Groom */}
          {content.groom && (
            <div className="bg-stone-50 rounded-2xl p-8 text-center">
              <h3 className="text-2xl font-serif font-light text-stone-900 mb-6">
                {content.groom.name}
              </h3>
              <div className="space-y-4">
                {content.groom.email && (
                  <a
                    href={`mailto:${content.groom.email}`}
                    className="flex items-center justify-center gap-3 text-stone-600 hover:text-stone-900 transition-colors"
                  >
                    <Mail className="w-5 h-5" />
                    <span>{content.groom.email}</span>
                  </a>
                )}
                {content.groom.phone && (
                  <a
                    href={`tel:${content.groom.phone}`}
                    className="flex items-center justify-center gap-3 text-stone-600 hover:text-stone-900 transition-colors"
                  >
                    <Phone className="w-5 h-5" />
                    <span>{content.groom.phone}</span>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

