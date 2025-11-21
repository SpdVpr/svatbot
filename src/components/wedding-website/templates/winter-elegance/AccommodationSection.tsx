'use client'

import { useColorTheme } from '../ColorThemeContext'
import { AccommodationContent } from '@/types/wedding-website'
import { Home, MapPin, Phone, Mail, Globe, Users, Bed } from 'lucide-react'
import Image from 'next/image'

interface AccommodationSectionProps {
  content: AccommodationContent
}

export default function AccommodationSection({ content }: AccommodationSectionProps) {
  const { theme } = useColorTheme()

  if (!content.enabled) return null

  const accommodations = content.accommodations || []

  return (
    <section id="accommodation" className="py-20 bg-stone-50">
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

        {/* Accommodations */}
        {accommodations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {accommodations.map((accommodation) => (
              <div key={accommodation.id} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                {/* Image */}
                {accommodation.image && (
                  <div className="h-56 bg-stone-200 relative">
                    <Image
                      src={accommodation.image}
                      alt={accommodation.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-2xl font-serif font-light text-stone-900 mb-3">
                    {accommodation.name}
                  </h3>

                  {accommodation.address && (
                    <div className="flex items-start gap-2 text-stone-600 mb-4">
                      <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                      <span className="text-sm">{accommodation.address}</span>
                    </div>
                  )}

                  {accommodation.description && (
                    <p className="text-stone-600 mb-6 leading-relaxed">
                      {accommodation.description}
                    </p>
                  )}

                  {/* Rooms */}
                  {accommodation.rooms.length > 0 && (
                    <div className="space-y-3 mb-6">
                      {accommodation.rooms.map((room, index) => (
                        <div key={index} className="bg-stone-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-stone-900">{room.name}</h4>
                            {content.showPrices && (
                              <span className="text-stone-700 font-semibold">
                                {room.pricePerNight.toLocaleString('cs-CZ')} Kč/noc
                              </span>
                            )}
                          </div>
                          {room.description && (
                            <p className="text-sm text-stone-600 mb-2">{room.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-stone-600">
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              <span>{room.capacity} osob</span>
                            </div>
                            {content.showAvailability && (
                              <div className="flex items-center gap-1">
                                <Bed className="w-4 h-4" />
                                <span>{room.count}× k dispozici</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Contact Info */}
                  <div className="space-y-2 text-sm border-t border-stone-200 pt-4">
                    {accommodation.phone && (
                      <div className="flex items-center gap-2 text-stone-600">
                        <Phone className="w-4 h-4" />
                        <a
                          href={`tel:${accommodation.phone}`}
                          className="hover:text-stone-900 transition-colors"
                        >
                          {accommodation.phone}
                        </a>
                      </div>
                    )}
                    {accommodation.email && (
                      <div className="flex items-center gap-2 text-stone-600">
                        <Mail className="w-4 h-4" />
                        <a
                          href={`mailto:${accommodation.email}`}
                          className="hover:text-stone-900 transition-colors"
                        >
                          {accommodation.email}
                        </a>
                      </div>
                    )}
                    {accommodation.website && (
                      <div className="flex items-center gap-2 text-stone-600">
                        <Globe className="w-4 h-4" />
                        <a
                          href={accommodation.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-stone-900 transition-colors"
                        >
                          Webové stránky
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <div className="bg-stone-800 rounded-2xl p-8 text-center">
              <div className="mb-4">
                <Home className="w-8 h-8 text-white mx-auto" />
              </div>
              <p className="text-white text-lg leading-relaxed mb-4">
                K dispozici je krásné ubytování přímo na místě obřadu za speciální cenu. Pokud tedy
                nechcete cestovat v noci domů, velmi doporučujeme rezervaci – osobně vyzkoušeno.
              </p>
            </div>
          </div>
        )}

        {/* Contact Information */}
        {content.contactInfo && (content.contactInfo.name || content.contactInfo.phone || content.contactInfo.email) && (
          <div className="max-w-4xl mx-auto mt-12">
            <div className="bg-stone-800 rounded-2xl p-8 text-center">
              <h3 className="text-xl font-serif text-white mb-4">
                Potřebujete pomoc s rezervací?
              </h3>
              {content.contactInfo.message && (
                <p className="text-white/90 mb-6">{content.contactInfo.message}</p>
              )}
              <div className="space-y-2">
                {content.contactInfo.name && (
                  <p className="text-white font-medium">{content.contactInfo.name}</p>
                )}
                {content.contactInfo.phone && (
                  <a
                    href={`tel:${content.contactInfo.phone}`}
                    className="block text-white/90 hover:text-white transition-colors"
                  >
                    {content.contactInfo.phone}
                  </a>
                )}
                {content.contactInfo.email && (
                  <a
                    href={`mailto:${content.contactInfo.email}`}
                    className="block text-white/90 hover:text-white transition-colors"
                  >
                    {content.contactInfo.email}
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

