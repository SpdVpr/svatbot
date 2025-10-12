'use client'

import { MapPin, Clock, Car, Info } from 'lucide-react'
import type { InfoContent } from '@/types/wedding-website'
import GoogleMapsEmbed from '../../GoogleMapsEmbed'

interface InfoSectionProps {
  content: InfoContent
}

export default function ModernInfoSection({ content }: InfoSectionProps) {
  const { ceremony, reception, parking, customInfo } = content

  // Check which venue sections are filled
  const hasCeremony = ceremony && (ceremony.venue || ceremony.time || ceremony.address)
  const hasReception = reception && (reception.venue || reception.time || reception.address)
  const venueCount = (hasCeremony ? 1 : 0) + (hasReception ? 1 : 0)

  // Combine all venue images
  const allVenueImages = [
    ...(ceremony?.images || []),
    ...(reception?.images || [])
  ]

  // Dynamic grid classes based on number of images
  const getImageGridClasses = () => {
    const imageCount = allVenueImages.length
    if (imageCount === 1) {
      return "grid grid-cols-1" // 1 image = full width
    } else if (imageCount === 2) {
      return "grid grid-cols-1 md:grid-cols-2" // 2 images = 2 columns
    } else {
      return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" // 3+ images = 3 columns
    }
  }

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-light text-gray-900 mb-4">
            {ceremony?.venue || reception?.venue || 'Místo konání'}
          </h2>
          <div className="w-16 h-px bg-gray-900 mx-auto mb-8"></div>
          <p className="text-gray-600 text-lg leading-relaxed max-w-3xl mx-auto">
            {ceremony?.address || reception?.address || 'Všechny důležité informace o našem velkém dni'}
          </p>
        </div>

        {/* Main Venue Info */}
        {(hasCeremony || hasReception) && (
          <div className="mb-16">
            <div className="bg-white rounded-lg overflow-hidden shadow-sm">
              {/* Venue Images - First */}
              {allVenueImages.length > 0 && (
                <div className="p-6">
                  <div className={`${getImageGridClasses()} gap-5`}>
                    {allVenueImages.map((image, index) => (
                      <div
                        key={index}
                        className="aspect-video rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group"
                      >
                        <img
                          src={image}
                          alt={`Místo konání ${index + 1}`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Map and Info - Below images */}
              <div className="grid grid-cols-1 lg:grid-cols-2">
                {/* Left: Map */}
                <div className="h-96 lg:h-auto">
                  {(ceremony?.address || reception?.address) && (
                    <GoogleMapsEmbed
                      address={ceremony?.address || reception?.address || ''}
                      className="w-full h-full"
                      height="100%"
                    />
                  )}
                </div>

                {/* Right: Info */}
                <div className="p-12">
                  <div className="space-y-8">
                    {/* Venue Name */}
                    {(ceremony?.venue || reception?.venue) && (
                      <div>
                        <h3 className="text-3xl font-light text-gray-900 mb-2">
                          {ceremony?.venue || reception?.venue}
                        </h3>
                        <p className="text-gray-600">
                          {ceremony?.address || reception?.address}
                        </p>
                      </div>
                    )}

                    {/* Time */}
                    {(ceremony?.time || reception?.time) && (
                      <div className="flex items-start space-x-4">
                        <Clock className="w-6 h-6 text-gray-900 mt-1 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Čas začátku</h4>
                          <p className="text-2xl font-light text-gray-900">
                            {ceremony?.time || reception?.time}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Description or additional info */}
                    {ceremony && reception && ceremony.venue !== reception.venue && (
                      <div className="pt-6 border-t border-gray-200">
                        <h4 className="font-medium text-gray-900 mb-4">Hostina</h4>
                        <div className="space-y-2">
                          <p className="text-gray-700">{reception.venue}</p>
                          {reception.time && (
                            <p className="text-gray-600">Začátek: {reception.time}</p>
                          )}
                          {reception.address && (
                            <p className="text-sm text-gray-500">{reception.address}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Map Link */}
                    {(ceremony?.address || reception?.address) && (
                      <div>
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ceremony?.address || reception?.address || '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-2 text-gray-900 hover:text-gray-600 transition-colors"
                        >
                          <MapPin className="w-5 h-5" />
                          <span className="font-medium">Otevřít v Google Maps</span>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Additional Info - Horizontal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Parking */}
          {parking && (
            <div className="bg-white rounded-lg p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                  <Car className="w-8 h-8 text-gray-900" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 text-lg">Parkování</h4>
                  <p className="text-gray-600 leading-relaxed">{parking}</p>
                </div>
              </div>
            </div>
          )}

          {/* Custom Info */}
          {customInfo && customInfo.slice(0, 1).map((info) => (
            <div key={info.id} className="bg-white rounded-lg p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                  <Info className="w-8 h-8 text-gray-900" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 text-lg">{info.title}</h4>
                  <p className="text-gray-600 leading-relaxed">{info.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Custom Info - if more than 1 */}
        {customInfo && customInfo.length > 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {customInfo.slice(1).map((info) => (
              <div key={info.id} className="bg-white rounded-lg p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                    <Info className="w-8 h-8 text-gray-900" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2 text-lg">{info.title}</h4>
                    <p className="text-gray-600 leading-relaxed">{info.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
