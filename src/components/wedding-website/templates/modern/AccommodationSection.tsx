'use client'

import { Building2, MapPin, Phone, Mail, Globe, Bed, Users, DollarSign } from 'lucide-react'
import { useAccommodation } from '@/hooks/useAccommodation'
import type { AccommodationContent } from '@/types/wedding-website'

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
    <section className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-light text-gray-900 mb-6">
            {content.title || 'Ubytování'}
          </h2>
          {content.description && (
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {content.description}
            </p>
          )}
        </div>

        {/* Accommodations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {activeAccommodations.map((accommodation) => (
            <div key={accommodation.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300">
              {/* Image */}
              <div className="h-56 bg-gray-100 relative">
                {accommodation.images.length > 0 ? (
                  <img
                    src={accommodation.images[0]}
                    alt={accommodation.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Building2 className="w-16 h-16 text-gray-300" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-8">
                <h3 className="text-2xl font-light text-gray-900 mb-3">
                  {accommodation.name}
                </h3>
                
                <div className="flex items-center gap-2 text-gray-500 mb-4">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">
                    {accommodation.address.street}, {accommodation.address.city}
                  </span>
                </div>

                {accommodation.description && (
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {accommodation.description.length > 120 
                      ? `${accommodation.description.substring(0, 120)}...` 
                      : accommodation.description
                    }
                  </p>
                )}

                {/* Room Stats */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-2">
                    <Bed className="w-4 h-4" />
                    <span>{accommodation.rooms.length} pokojů</span>
                  </div>
                  {content.showAvailability && (
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{accommodation.rooms.filter(r => r.isAvailable).length} dostupných</span>
                    </div>
                  )}
                </div>

                {/* Price Range */}
                {content.showPrices && accommodation.rooms.length > 0 && (
                  <div className="flex items-center gap-2 text-primary-600 font-medium mb-6">
                    <DollarSign className="w-4 h-4" />
                    <span>
                      {Math.min(...accommodation.rooms.map(r => r.pricePerNight)).toLocaleString()} - {' '}
                      {Math.max(...accommodation.rooms.map(r => r.pricePerNight)).toLocaleString()} Kč/noc
                    </span>
                  </div>
                )}

                {/* Amenities */}
                {accommodation.amenities.length > 0 && (
                  <div className="mb-6">
                    <div className="flex flex-wrap gap-2">
                      {accommodation.amenities.slice(0, 3).map((amenity, index) => (
                        <span
                          key={index}
                          className="inline-block px-3 py-1 bg-gray-50 text-gray-600 text-xs rounded-full"
                        >
                          {amenity}
                        </span>
                      ))}
                      {accommodation.amenities.length > 3 && (
                        <span className="inline-block px-3 py-1 bg-gray-50 text-gray-600 text-xs rounded-full">
                          +{accommodation.amenities.length - 3} dalších
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Contact Info */}
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3 text-gray-600">
                    <Phone className="w-4 h-4" />
                    <a 
                      href={`tel:${accommodation.contactInfo.phone}`}
                      className="hover:text-primary-600 transition-colors"
                    >
                      {accommodation.contactInfo.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <Mail className="w-4 h-4" />
                    <a 
                      href={`mailto:${accommodation.contactInfo.email}`}
                      className="hover:text-primary-600 transition-colors"
                    >
                      {accommodation.contactInfo.email}
                    </a>
                  </div>
                  {accommodation.website && (
                    <div className="flex items-center gap-3 text-gray-600">
                      <Globe className="w-4 h-4" />
                      <a 
                        href={accommodation.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary-600 transition-colors"
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

        {/* Contact Information */}
        {content.contactInfo && (content.contactInfo.name || content.contactInfo.phone || content.contactInfo.email) && (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <h3 className="text-2xl font-light text-gray-900 mb-4">
              Potřebujete pomoc s rezervací?
            </h3>
            {content.contactInfo.message && (
              <p className="text-gray-600 mb-6 leading-relaxed">
                {content.contactInfo.message}
              </p>
            )}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              {content.contactInfo.name && (
                <span className="font-medium text-gray-900 text-lg">
                  {content.contactInfo.name}
                </span>
              )}
              {content.contactInfo.phone && (
                <a 
                  href={`tel:${content.contactInfo.phone}`}
                  className="flex items-center gap-2 text-primary-600 hover:text-primary-700 transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  {content.contactInfo.phone}
                </a>
              )}
              {content.contactInfo.email && (
                <a 
                  href={`mailto:${content.contactInfo.email}`}
                  className="flex items-center gap-2 text-primary-600 hover:text-primary-700 transition-colors"
                >
                  <Mail className="w-5 h-5" />
                  {content.contactInfo.email}
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
