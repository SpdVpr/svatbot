'use client'

import { AccommodationContent } from '@/types/wedding-website'
import SectionTitle from './SectionTitle'
import { Building2 } from 'lucide-react'

interface AccommodationSectionProps {
  content: AccommodationContent
}

export default function AccommodationSection({ content }: AccommodationSectionProps) {
  if (!content.enabled) {
    return null
  }

  const accommodations = content.accommodations || []

  if (accommodations.length === 0) {
    return null
  }

  return (
    <section id="accommodation" className="py-20 relative" style={{ background: 'linear-gradient(to bottom, #ffffff 0%, #faf8f3 100%)' }}>
      {/* Decorative Elements */}
      <div
        className="absolute left-0 top-1/4 w-28 h-28 opacity-15 hidden lg:block"
        style={{
          backgroundImage: 'url(/templates/pretty/images/rsvp-left-flower.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center'
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <SectionTitle
          title={content.title || "Ubytování"}
          subtitle={content.description}
        />

        <div className="space-y-8 max-w-6xl mx-auto">
          {accommodations.map((accommodation) => (
            <div
              key={accommodation.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow p-6"
            >
              <h3
                className="text-3xl font-semibold mb-4"
                style={{ fontFamily: 'Great Vibes, cursive', color: '#b19a56' }}
              >
                {accommodation.name}
              </h3>

              {/* Image */}
              {accommodation.image ? (
                <div className="h-64 overflow-hidden rounded-lg mb-4">
                  <img
                    src={accommodation.image}
                    alt={accommodation.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="h-64 bg-gray-100 flex items-center justify-center rounded-lg mb-4">
                  <Building2 className="w-16 h-16 text-gray-300" />
                </div>
              )}

              {/* Info */}
              <div>
                {accommodation.description && (
                  <p className="text-gray-600 mb-4">
                    {accommodation.description}
                  </p>
                )}
                {accommodation.address && (
                  <p className="text-gray-600 mb-2 flex items-start gap-2">
                    <i className="ti-location-pin mt-1" style={{ color: '#b19a56' }}></i>
                    <span>{accommodation.address}</span>
                  </p>
                )}
                {accommodation.phone && (
                  <p className="text-gray-600 mb-2">
                    📞 {accommodation.phone}
                  </p>
                )}
                {accommodation.email && (
                  <p className="text-gray-600 mb-4">
                    ✉️ {accommodation.email}
                  </p>
                )}

                {/* Rooms */}
                {accommodation.rooms && accommodation.rooms.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold text-gray-800 mb-3">Dostupné pokoje:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {accommodation.rooms.map((room, roomIndex) => (
                        <div
                          key={roomIndex}
                          className="border rounded-lg p-3"
                          style={{ borderColor: '#e1d9bf' }}
                        >
                          <h5 className="font-semibold text-gray-800 mb-1">{room.name}</h5>
                          {room.description && (
                            <p className="text-sm text-gray-600 mb-2">{room.description}</p>
                          )}
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                              <div>👥 {room.capacity} {room.capacity === 1 ? 'osoba' : room.capacity < 5 ? 'osoby' : 'osob'}</div>
                              {content.showAvailability && (
                                <div className="text-xs text-gray-500 mt-1">
                                  🛏️ {room.count}× k dispozici
                                </div>
                              )}
                            </div>
                            {content.showPrices && (
                              <span className="font-semibold" style={{ color: '#b19a56' }}>
                                {room.pricePerNight.toLocaleString('cs-CZ')} Kč/noc
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {accommodation.website && (
                  <a
                    href={accommodation.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-white px-6 py-2 rounded-lg transition-colors mt-4"
                    style={{ backgroundColor: '#b19a56' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#9a8449'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#b19a56'}
                  >
                    Více informací
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {content.contactInfo && (
          <div className="mt-12 max-w-2xl mx-auto p-6 rounded-lg text-center" style={{ backgroundColor: '#faf8f3' }}>
            {content.contactInfo.message && (
              <p className="text-gray-700 mb-4">{content.contactInfo.message}</p>
            )}
            {content.contactInfo.name && (
              <p className="text-gray-800 font-semibold">{content.contactInfo.name}</p>
            )}
            {content.contactInfo.phone && (
              <p className="text-gray-600">📞 {content.contactInfo.phone}</p>
            )}
            {content.contactInfo.email && (
              <p className="text-gray-600">✉️ {content.contactInfo.email}</p>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

