'use client'

import { Hotel, MapPin, Phone, Mail, ExternalLink } from 'lucide-react'
import type { AccommodationContent } from '@/types/wedding-website'

interface AccommodationSectionProps {
  content: AccommodationContent
}

export default function AccommodationSection({ content }: AccommodationSectionProps) {
  if (!content.enabled) return null

  return (
    <section className="relative py-24 bg-gradient-to-br from-white via-rose-50 to-amber-50 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-40 h-40 border-4 border-rose-200 rounded-full opacity-20"></div>
      <div className="absolute bottom-20 right-10 w-32 h-32 border-4 border-amber-200 rounded-full opacity-20"></div>

      <div className="relative max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-rose-300 rounded-full blur-xl opacity-50"></div>
              <div className="relative bg-gradient-to-br from-rose-100 to-amber-100 rounded-full p-5">
                <Hotel className="w-10 h-10 text-rose-600" />
              </div>
            </div>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-gray-800 mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            {content.title || 'Ubytování'}
          </h2>
          {content.description && (
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">{content.description}</p>
          )}
        </div>

        {/* Accommodation info */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl border-2 border-rose-100 max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🏨</div>
            <p className="text-gray-700 text-lg leading-relaxed">
              Pro vaše pohodlí jsme připravili doporučení na ubytování v blízkosti místa konání.
            </p>
          </div>

          {/* Contact info */}
          {content.contactInfo && (
            <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-6 space-y-4">
              <h3 className="text-xl font-bold text-gray-800 mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                Kontakt pro rezervaci
              </h3>

              {content.contactInfo.name && (
                <div className="flex items-center gap-3">
                  <div className="bg-white rounded-full p-2">
                    <Hotel className="w-5 h-5 text-rose-500" />
                  </div>
                  <span className="text-gray-700 font-semibold">{content.contactInfo.name}</span>
                </div>
              )}

              {content.contactInfo.phone && (
                <div className="flex items-center gap-3">
                  <div className="bg-white rounded-full p-2">
                    <Phone className="w-5 h-5 text-rose-500" />
                  </div>
                  <a href={`tel:${content.contactInfo.phone}`} className="text-rose-600 hover:text-rose-700 font-medium">
                    {content.contactInfo.phone}
                  </a>
                </div>
              )}

              {content.contactInfo.email && (
                <div className="flex items-center gap-3">
                  <div className="bg-white rounded-full p-2">
                    <Mail className="w-5 h-5 text-rose-500" />
                  </div>
                  <a href={`mailto:${content.contactInfo.email}`} className="text-rose-600 hover:text-rose-700 font-medium">
                    {content.contactInfo.email}
                  </a>
                </div>
              )}

              {content.contactInfo.message && (
                <div className="mt-4 pt-4 border-t border-rose-200">
                  <p className="text-gray-600 text-sm">{content.contactInfo.message}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

