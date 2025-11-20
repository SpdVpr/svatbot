'use client'

import { AccommodationContent } from '@/types/wedding-website'
import { useAccommodation } from '@/hooks/useAccommodation'
import Image from 'next/image'
import SectionTitle from './SectionTitle'
import { MapPin, Phone, Mail, ExternalLink, Building2 } from 'lucide-react'

interface AccommodationSectionProps {
  content: AccommodationContent
}

export default function AccommodationSection({ content }: AccommodationSectionProps) {
  const { accommodations, loading } = useAccommodation()

  if (!content.enabled || loading) {
    return null
  }

  // Filter only active accommodations
  const activeAccommodations = accommodations.filter(acc => acc.isActive)

  if (activeAccommodations.length === 0) {
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
          {activeAccommodations.map((accommodation) => (
            <div key={accommodation.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Image */}
                {accommodation.images && accommodation.images.length > 0 ? (
                  <div className="relative h-[300px] md:h-auto">
                    <Image
                      src={accommodation.images[0]}
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
                          {accommodation.address.street}, {accommodation.address.city}
                        </span>
                      </div>
                    )}

                    {accommodation.contactInfo?.phone && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Phone className="w-5 h-5 flex-shrink-0 text-[#85aaba]" />
                        <a href={`tel:${accommodation.contactInfo.phone}`} className="hover:text-[#85aaba]" style={{ fontFamily: 'Muli, sans-serif' }}>
                          {accommodation.contactInfo.phone}
                        </a>
                      </div>
                    )}

                    {accommodation.contactInfo?.email && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Mail className="w-5 h-5 flex-shrink-0 text-[#85aaba]" />
                        <a href={`mailto:${accommodation.contactInfo.email}`} className="hover:text-[#85aaba]" style={{ fontFamily: 'Muli, sans-serif' }}>
                          {accommodation.contactInfo.email}
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

                    {/* Room count and amenities */}
                    {accommodation.rooms && accommodation.rooms.length > 0 && content.showAvailability && (
                      <div className="mt-4 text-sm text-gray-600" style={{ fontFamily: 'Muli, sans-serif' }}>
                        Počet pokojů: {accommodation.rooms.length}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Room Prices */}
              {content.showPrices && accommodation.rooms && accommodation.rooms.length > 0 && (() => {
                // Group rooms by type (name without number, price, description, capacity)
                const roomGroups = accommodation.rooms.reduce((groups, room) => {
                  // Remove numbers from room name to group similar rooms
                  const baseName = room.name.replace(/\s*\d+\s*$/, '').trim()
                  const key = `${baseName}-${room.pricePerNight}-${room.capacity}-${room.description || ''}`

                  if (!groups[key]) {
                    groups[key] = {
                      baseName,
                      pricePerNight: room.pricePerNight,
                      description: room.description,
                      capacity: room.capacity,
                      count: 0,
                      availableCount: 0
                    }
                  }

                  groups[key].count++
                  if (room.isAvailable) {
                    groups[key].availableCount++
                  }

                  return groups
                }, {} as Record<string, any>)

                const groupedRooms = Object.values(roomGroups)

                return (
                  <div className="p-6 border-t border-gray-200">
                    <h4 className="text-xl mb-4 text-gray-800" style={{ fontFamily: 'Great Vibes, cursive' }}>
                      Dostupné pokoje
                    </h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      {groupedRooms.map((roomGroup: any, index: number) => (
                        <div key={index} className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h5 className="font-medium text-gray-800" style={{ fontFamily: 'Muli, sans-serif' }}>
                                {roomGroup.baseName}
                              </h5>
                              {content.showAvailability && (
                                <p className="text-xs text-gray-500 mt-1" style={{ fontFamily: 'Muli, sans-serif' }}>
                                  {roomGroup.count} {roomGroup.count === 1 ? 'pokoj' : roomGroup.count < 5 ? 'pokoje' : 'pokojů'} k dispozici
                                </p>
                              )}
                            </div>
                            <span className="text-[#85aaba] font-semibold whitespace-nowrap ml-2" style={{ fontFamily: 'Muli, sans-serif' }}>
                              {roomGroup.pricePerNight.toLocaleString('cs-CZ')} Kč/noc
                            </span>
                          </div>
                          {roomGroup.description && (
                            <p className="text-sm text-gray-600 mb-2" style={{ fontFamily: 'Muli, sans-serif' }}>
                              {roomGroup.description}
                            </p>
                          )}
                          <div className="text-xs text-gray-500" style={{ fontFamily: 'Muli, sans-serif' }}>
                            Kapacita: {roomGroup.capacity} {roomGroup.capacity === 1 ? 'osoba' : roomGroup.capacity < 5 ? 'osoby' : 'osob'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })()}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

