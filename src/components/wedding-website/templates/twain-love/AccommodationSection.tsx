'use client'

import { AccommodationContent } from '@/types/wedding-website'
import Image from 'next/image'
import SectionTitle from './SectionTitle'
import { MapPin, Phone, Mail, ExternalLink, Building2 } from 'lucide-react'

interface AccommodationSectionProps {
  content: AccommodationContent
}

export default function AccommodationSection({ content }: AccommodationSectionProps) {
  if (!content.enabled) {
    return null
  }

  // Use accommodations from content (imported data)
  const accommodations = content.accommodations || []

  if (accommodations.length === 0) {
    return null
  }

  return (
    <div id="accommodation" className="py-20" style={{ background: 'rgba(178,201,211,0.1)' }}>
      <SectionTitle title={content.title || "Ubytování"} />

      {content.description && (
        <p className="text-center text-gray-600 max-w-2xl mx-auto mb-12 px-4" style={{ fontFamily: 'Muli, sans-serif' }}>
          {content.description}
        </p>
      )}

      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto space-y-8">
          {accommodations.map((accommodation) => (
            <div key={accommodation.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Image */}
                {accommodation.image ? (
                  <div className="relative h-[300px] md:h-auto">
                    <Image
                      src={accommodation.image}
                      alt={accommodation.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                ) : (
                  <div className="relative h-[300px] md:h-auto bg-gray-100 flex items-center justify-center">
                    <Building2 className="w-16 h-16 text-gray-300" />
                  </div>
                )}

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-3xl mb-4 text-gray-800" style={{ fontFamily: 'Great Vibes, cursive' }}>
                    {accommodation.name}
                  </h3>

                  {accommodation.description && (
                    <p className="text-gray-600 mb-4" style={{ fontFamily: 'Muli, sans-serif' }}>
                      {accommodation.description}
                    </p>
                  )}

                  <div className="space-y-3">
                    {accommodation.address && (
                      <div className="flex items-start gap-2 text-gray-700">
                        <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0 text-[#85aaba]" />
                        <span style={{ fontFamily: 'Muli, sans-serif' }}>
                          {accommodation.address}
                        </span>
                      </div>
                    )}

                    {accommodation.phone && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Phone className="w-5 h-5 flex-shrink-0 text-[#85aaba]" />
                        <a href={`tel:${accommodation.phone}`} className="hover:text-[#85aaba]" style={{ fontFamily: 'Muli, sans-serif' }}>
                          {accommodation.phone}
                        </a>
                      </div>
                    )}

                    {accommodation.email && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Mail className="w-5 h-5 flex-shrink-0 text-[#85aaba]" />
                        <a href={`mailto:${accommodation.email}`} className="hover:text-[#85aaba]" style={{ fontFamily: 'Muli, sans-serif' }}>
                          {accommodation.email}
                        </a>
                      </div>
                    )}

                    {accommodation.website && (
                      <div className="mt-4">
                        <a
                          href={accommodation.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-6 py-2 bg-[#85aaba] text-white rounded hover:bg-[#6a8a98] transition-colors"
                          style={{ fontFamily: 'Muli, sans-serif' }}
                        >
                          Navštívit web
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    )}

                    {/* Room count */}
                    {accommodation.rooms && accommodation.rooms.length > 0 && content.showAvailability && (
                      <div className="mt-4 text-sm text-gray-600" style={{ fontFamily: 'Muli, sans-serif' }}>
                        Typů pokojů: {accommodation.rooms.length}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Room Prices - rooms are already grouped during import */}
              {content.showPrices && accommodation.rooms && accommodation.rooms.length > 0 && (
                <div className="p-6 border-t border-gray-200">
                  <h4 className="text-xl mb-4 text-gray-800" style={{ fontFamily: 'Great Vibes, cursive' }}>
                    Dostupné pokoje
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    {accommodation.rooms.map((room, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h5 className="font-medium text-gray-800" style={{ fontFamily: 'Muli, sans-serif' }}>
                              {room.name}
                            </h5>
                            {content.showAvailability && (
                              <p className="text-xs text-gray-500 mt-1" style={{ fontFamily: 'Muli, sans-serif' }}>
                                {room.count} {room.count === 1 ? 'pokoj' : room.count < 5 ? 'pokoje' : 'pokojů'} k dispozici
                              </p>
                            )}
                          </div>
                          <span className="text-[#85aaba] font-semibold whitespace-nowrap ml-2" style={{ fontFamily: 'Muli, sans-serif' }}>
                            {room.pricePerNight.toLocaleString('cs-CZ')} Kč/noc
                          </span>
                        </div>
                        {room.description && (
                          <p className="text-sm text-gray-600 mb-2" style={{ fontFamily: 'Muli, sans-serif' }}>
                            {room.description}
                          </p>
                        )}
                        <div className="text-xs text-gray-500" style={{ fontFamily: 'Muli, sans-serif' }}>
                          Kapacita: {room.capacity} {room.capacity === 1 ? 'osoba' : room.capacity < 5 ? 'osoby' : 'osob'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

