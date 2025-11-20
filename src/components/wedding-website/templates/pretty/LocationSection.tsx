'use client'

import { InfoContent, ScheduleContent } from '@/types/wedding-website'
import SectionTitle from './SectionTitle'
import { useState } from 'react'

interface LocationSectionProps {
  infoContent: InfoContent
  scheduleContent?: ScheduleContent
}

export default function LocationSection({ infoContent, scheduleContent }: LocationSectionProps) {
  const [selectedMap, setSelectedMap] = useState<string | null>(null)

  if (!infoContent.enabled) return null

  const openMap = (url: string) => {
    setSelectedMap(url)
  }

  const closeMap = () => {
    setSelectedMap(null)
  }

  return (
    <>
      <section id="events" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <SectionTitle title="Místo konání" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Ceremony */}
            {infoContent.ceremony && (
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                {infoContent.ceremony.images && infoContent.ceremony.images.length > 0 && (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={infoContent.ceremony.images[0]}
                      alt="Ceremony"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h3
                    className="text-3xl mb-4"
                    style={{ fontFamily: 'Great Vibes, cursive', color: '#b19a56' }}
                  >
                    Obřad
                  </h3>
                  <ul className="space-y-3 mb-4">
                    <li className="flex items-start gap-2 text-gray-600">
                      <i className="ti-time mt-1" style={{ color: '#b19a56' }}></i>
                      <span>{infoContent.ceremony.time}</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <i className="ti-home mt-1" style={{ color: '#b19a56' }}></i>
                      <span>{infoContent.ceremony.venue}</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <i className="ti-location-pin mt-1" style={{ color: '#b19a56' }}></i>
                      <span>{infoContent.ceremony.address}</span>
                    </li>
                  </ul>
                  {infoContent.ceremony?.mapUrl && (
                    <button
                      onClick={() => openMap(infoContent.ceremony?.mapUrl!)}
                      className="font-semibold flex items-center gap-2 transition-colors"
                      style={{ color: '#b19a56' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#9a8449'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#b19a56'}
                    >
                      Zobrazit na mapě <i className="ti-location-pin"></i>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Reception */}
            {infoContent.reception && (
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                {infoContent.reception.images && infoContent.reception.images.length > 0 && (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={infoContent.reception.images[0]}
                      alt="Reception"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h3
                    className="text-3xl mb-4"
                    style={{ fontFamily: 'Great Vibes, cursive', color: '#b19a56' }}
                  >
                    Hostina
                  </h3>
                  <ul className="space-y-3 mb-4">
                    <li className="flex items-start gap-2 text-gray-600">
                      <i className="ti-time mt-1" style={{ color: '#b19a56' }}></i>
                      <span>{infoContent.reception.time}</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <i className="ti-home mt-1" style={{ color: '#b19a56' }}></i>
                      <span>{infoContent.reception.venue}</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <i className="ti-location-pin mt-1" style={{ color: '#b19a56' }}></i>
                      <span>{infoContent.reception.address}</span>
                    </li>
                  </ul>
                  {infoContent.reception?.mapUrl && (
                    <button
                      onClick={() => openMap(infoContent.reception?.mapUrl!)}
                      className="font-semibold flex items-center gap-2 transition-colors"
                      style={{ color: '#b19a56' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#9a8449'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#b19a56'}
                    >
                      Zobrazit na mapě <i className="ti-location-pin"></i>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Map Modal */}
      {selectedMap && (
        <div 
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={closeMap}
        >
          <div 
            className="bg-white rounded-lg w-full max-w-4xl h-[600px] relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeMap}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100"
            >
              <i className="ti-close"></i>
            </button>
            <iframe
              src={selectedMap}
              className="w-full h-full rounded-lg"
              allowFullScreen
              loading="lazy"
            />
          </div>
        </div>
      )}
    </>
  )
}

