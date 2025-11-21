'use client'

import { InfoContent, ScheduleContent } from '@/types/wedding-website'
import Image from 'next/image'
import SectionTitle from './SectionTitle'
import { MapPin, Clock, Car, Info, ExternalLink } from 'lucide-react'

interface LocationSectionProps {
  infoContent: InfoContent
  scheduleContent?: ScheduleContent
}

// Helper function to extract place_id from Google Maps URL
const extractPlaceId = (url: string): string | null => {
  if (!url) return null
  const match = url.match(/place_id[=:]([^&]+)/)
  return match ? match[1] : null
}

// Helper function to create Google Maps Embed URL
const createEmbedUrl = (mapUrl: string, address: string): string => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  const placeId = extractPlaceId(mapUrl)

  if (placeId) {
    return `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=place_id:${placeId}&zoom=15`
  } else if (address) {
    return `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(address)}&zoom=15`
  }

  return ''
}

export default function LocationSection({ infoContent, scheduleContent }: LocationSectionProps) {

  if (!infoContent.enabled) return null

  const events = []

  if (infoContent.ceremony) {
    events.push({
      title: 'Svatební obřad',
      time: infoContent.ceremony.time,
      venue: infoContent.ceremony.venue,
      address: infoContent.ceremony.address,
      mapUrl: infoContent.ceremony.mapUrl,
      image: infoContent.ceremony.images?.[0] || '/templates/twain-love/ceremony.jpg'
    })
  }

  if (infoContent.reception) {
    events.push({
      title: 'Svatební hostina',
      time: infoContent.reception.time,
      venue: infoContent.reception.venue,
      address: infoContent.reception.address,
      mapUrl: infoContent.reception.mapUrl,
      image: infoContent.reception.images?.[0] || '/templates/twain-love/reception.jpg'
    })
  }

  if (events.length === 0) return null

  return (
    <div id="event" className="py-20 bg-white">
      <SectionTitle title="Kdy & Kde" />
      
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto space-y-12">
          {events.map((event, index) => {
            const isEven = index % 2 === 0

            return (
              <div key={index} className="space-y-6">
                <div className="grid md:grid-cols-12 gap-8 items-center">
                  {/* Image */}
                  <div className={`md:col-span-5 ${isEven ? 'md:order-1' : 'md:order-2'}`}>
                    <div className="relative h-[350px] rounded-lg overflow-hidden shadow-lg">
                      {event.image ? (
                        <Image
                          src={event.image}
                          alt={event.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 42vw"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#b2c9d3] to-[#85aaba]" />
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className={`md:col-span-7 ${isEven ? 'md:order-2' : 'md:order-1'}`}>
                    <div className="space-y-4">
                      <h3 className="text-3xl font-light text-gray-800">
                        {event.title}
                      </h3>

                      {event.time && (
                        <div className="flex items-center gap-2 text-[#85aaba]">
                          <Clock className="w-5 h-5" />
                          <span>{event.time}</span>
                        </div>
                      )}

                      {event.venue && (
                        <div className="flex items-start gap-2 text-gray-700">
                          <MapPin className="w-5 h-5 mt-1 flex-shrink-0" />
                          <div>
                            <div className="font-medium">{event.venue}</div>
                            {event.address && (
                              <div className="text-sm text-gray-600">{event.address}</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Embedded Map */}
                {event.mapUrl && event.address && (
                  <div className="w-full">
                    <div className="relative w-full h-64 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                      <iframe
                        src={createEmbedUrl(event.mapUrl, event.address)}
                        className="w-full h-full"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    </div>
                    <div className="mt-2 text-center">
                      <a
                        href={event.mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-[#85aaba] hover:text-[#6a8a98] transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Otevřít v Google Maps
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          {/* Additional Information */}
          {(infoContent.parking || infoContent.accessibility) && (
            <div className="mt-16 bg-[rgba(178,201,211,0.1)] rounded-lg p-8">
              <h3 className="text-2xl font-light text-gray-800 mb-6 text-center">
                Důležité informace
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                {infoContent.parking && (
                  <div className="flex items-start gap-3">
                    <Car className="w-6 h-6 text-[#85aaba] flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Parkování</h4>
                      <p className="text-gray-600 whitespace-pre-line">{infoContent.parking}</p>
                    </div>
                  </div>
                )}
                {infoContent.accessibility && (
                  <div className="flex items-start gap-3">
                    <Info className="w-6 h-6 text-[#85aaba] flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Přístupnost</h4>
                      <p className="text-gray-600 whitespace-pre-line">{infoContent.accessibility}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

