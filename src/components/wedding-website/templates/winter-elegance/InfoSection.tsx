'use client'

import { useColorTheme } from '../ColorThemeContext'
import { InfoContent } from '@/types/wedding-website'
import { MapPin, Clock, ExternalLink, Car, Home, Heart } from 'lucide-react'
import Image from 'next/image'

interface InfoSectionProps {
  content: InfoContent
}

export default function InfoSection({ content }: InfoSectionProps) {
  const { theme } = useColorTheme()

  if (!content.enabled) return null

  const venue = content.ceremony || content.reception

  return (
    <section className="py-20 bg-stone-50">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-light text-stone-900 mb-6">
            {venue?.venue || 'Místo konání'}
          </h2>
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-stone-400 to-transparent mx-auto mb-8"></div>
          {venue?.address && (
            <p className="text-xl text-stone-600 leading-relaxed max-w-4xl mx-auto font-serif italic">
              {venue.address}
            </p>
          )}
        </div>

        {/* Venue Images */}
        {venue?.images && venue.images.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {venue.images.slice(0, 2).map((image, index) => (
              <div key={index} className="relative rounded-3xl overflow-hidden shadow-2xl">
                <div className="aspect-[4/3] relative">
                  <Image
                    src={image}
                    alt={`${venue.venue} - foto ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Custom Info Sections */}
        {content.customInfo && content.customInfo.length > 0 && (
          <div className="space-y-16">
            {content.customInfo.map((info) => (
              <div key={info.id} className="relative">
                <div
                  className="relative rounded-3xl overflow-hidden shadow-2xl bg-stone-800"
                  style={{ minHeight: '220px' }}
                >
                  {/* Overlay pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                      }}
                    ></div>
                  </div>

                  {/* Content */}
                  <div className="relative z-10 p-8 md:p-12 text-white text-center">
                    <div className="max-w-4xl mx-auto">
                      <div className="mb-6">
                        <Heart className="w-8 h-8 text-white mx-auto" />
                      </div>
                      <div className="text-lg leading-relaxed">
                        <p className="opacity-90">{info.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Map */}
        {venue?.mapUrl && (
          <div className="mt-16">
            <h3 className="text-2xl font-serif font-light text-stone-900 mb-8 text-center">
              Kde nás najdete?
            </h3>
            <div className="relative mb-8">
              <div className="relative bg-white rounded-3xl overflow-hidden shadow-2xl" style={{ height: '400px' }}>
                <iframe
                  src={venue.mapUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`Mapa - ${venue.venue}`}
                ></iframe>
              </div>
            </div>
          </div>
        )}

        {/* Parking Info */}
        {content.parking && (
          <div className="mt-16">
            <div className="bg-stone-800 rounded-2xl p-8 mb-8">
              <div className="text-center mb-4">
                <Car className="w-8 h-8 text-white mx-auto" />
              </div>
              <p className="text-white text-lg leading-relaxed text-center">
                {content.parking}
              </p>
            </div>
          </div>
        )}

        {/* Links */}
        {venue && (
          <div className="text-center mt-12">
            <div className="flex flex-wrap gap-4 justify-center">
              <a
                href={venue.mapUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-stone-200 hover:border-stone-400 rounded-xl text-stone-700 hover:text-stone-900 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <MapPin className="w-4 h-4" />
                Otevřít v Google Maps
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

