'use client'

import { InfoContent, ScheduleContent } from '@/types/wedding-website'
import Image from 'next/image'
import { useState } from 'react'
import SectionTitle from './SectionTitle'
import { MapPin, Clock } from 'lucide-react'

interface LocationSectionProps {
  infoContent: InfoContent
  scheduleContent?: ScheduleContent
}

export default function LocationSection({ infoContent, scheduleContent }: LocationSectionProps) {
  const [showMap, setShowMap] = useState<string | null>(null)

  if (!infoContent.enabled) return null

  const events = []

  if (infoContent.ceremony) {
    events.push({
      title: 'Svatební obřad',
      time: infoContent.ceremony.time,
      venue: infoContent.ceremony.venue,
      address: infoContent.ceremony.address,
      mapUrl: infoContent.ceremony.mapUrl,
      image: '/templates/twain-love/ceremony.jpg'
    })
  }

  if (infoContent.reception) {
    events.push({
      title: 'Svatební hostina',
      time: infoContent.reception.time,
      venue: infoContent.reception.venue,
      address: infoContent.reception.address,
      mapUrl: infoContent.reception.mapUrl,
      image: '/templates/twain-love/reception.jpg'
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
              <div key={index} className="grid md:grid-cols-12 gap-8 items-center">
                {/* Image */}
                <div className={`md:col-span-5 ${isEven ? 'md:order-1' : 'md:order-2'}`}>
                  <div className="relative h-[350px] rounded-lg overflow-hidden shadow-lg">
                    {event.image ? (
                      <Image
                        src={event.image}
                        alt={event.title}
                        fill
                        className="object-cover"
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

                    {event.mapUrl && (
                      <button
                        onClick={() => setShowMap(event.mapUrl || null)}
                        className="px-6 py-2 bg-[#85aaba] text-white rounded hover:bg-[#6a8a98] transition-colors"
                      >
                        Zobrazit mapu
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Map Modal */}
      {showMap && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowMap(null)}
        >
          <div 
            className="bg-white rounded-lg max-w-4xl w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-medium">Mapa</h3>
              <button
                onClick={() => setShowMap(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="aspect-video">
              <iframe
                src={showMap}
                className="w-full h-full rounded"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

