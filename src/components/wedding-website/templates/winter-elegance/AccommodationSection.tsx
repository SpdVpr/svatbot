'use client'

import { useColorTheme } from '../ColorThemeContext'
import { AccommodationContent } from '@/types/wedding-website'
import { Home } from 'lucide-react'

interface AccommodationSectionProps {
  content: AccommodationContent
}

export default function AccommodationSection({ content }: AccommodationSectionProps) {
  const { theme } = useColorTheme()

  if (!content.enabled) return null

  return (
    <section className="py-20 bg-stone-50">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-light text-stone-900 mb-6">
            {content.title || 'Ubytování'}
          </h2>
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-stone-400 to-transparent mx-auto mb-8"></div>
          {content.description && (
            <p className="text-xl text-stone-600 leading-relaxed max-w-3xl mx-auto">
              {content.description}
            </p>
          )}
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-stone-800 rounded-2xl p-8 text-center">
            <div className="mb-4">
              <Home className="w-8 h-8 text-white mx-auto" />
            </div>
            <p className="text-white text-lg leading-relaxed mb-4">
              K dispozici je krásné ubytování přímo na místě obřadu za speciální cenu. Pokud tedy
              nechcete cestovat v noci domů, velmi doporučujeme rezervaci – osobně vyzkoušeno.
            </p>
            {content.contactInfo && (
              <div className="mt-6 pt-6 border-t border-white/20">
                <p className="text-white/90 text-base mb-2">
                  Pro rezervaci prosím kontaktujte:
                </p>
                {content.contactInfo.name && (
                  <p className="text-white font-medium">{content.contactInfo.name}</p>
                )}
                {content.contactInfo.phone && (
                  <a
                    href={`tel:${content.contactInfo.phone}`}
                    className="text-white/90 hover:text-white transition-colors"
                  >
                    {content.contactInfo.phone}
                  </a>
                )}
                {content.contactInfo.email && (
                  <a
                    href={`mailto:${content.contactInfo.email}`}
                    className="block text-white/90 hover:text-white transition-colors mt-1"
                  >
                    {content.contactInfo.email}
                  </a>
                )}
                {content.contactInfo.message && (
                  <p className="text-white/80 text-sm mt-4">{content.contactInfo.message}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

