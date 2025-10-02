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
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-6">
            <Building2 className="w-8 h-8 text-primary-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {content.title || 'Ubytování'}
          </h2>
          {content.description && (
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {content.description}
            </p>
          )}
        </div>

        {/* Accommodations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {activeAccommodations.map((accommodation) => (
            <div key={accommodation.id} className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
              {/* Image */}
              <div className="h-48 bg-gray-200 relative">
                {accommodation.images.length > 0 ? (
                  <img
                    src={accommodation.images[0]}
                    alt={accommodation.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Building2 className="w-12 h-12 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {accommodation.name}
                </h3>
                
                <div className="flex items-center gap-1 text-gray-600 mb-4">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">
                    {accommodation.address.street}, {accommodation.address.city}
                  </span>
                </div>

                {accommodation.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {accommodation.description}
                  </p>
                )}

                {/* Room Stats */}
                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-1">
                    <Bed className="w-4 h-4" />
                    <span>{accommodation.rooms.length} pokojů</span>
                  </div>
                  {content.showAvailability && (
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{accommodation.rooms.filter(r => r.isAvailable).length} dostupných</span>
                    </div>
                  )}
                </div>

                {/* Price Range */}
                {content.showPrices && accommodation.rooms.length > 0 && (
                  <div className="flex items-center gap-1 text-primary-600 font-semibold mb-4">
                    <DollarSign className="w-4 h-4" />
                    <span>
                      {Math.min(...accommodation.rooms.map(r => r.pricePerNight)).toLocaleString()} - {' '}
                      {Math.max(...accommodation.rooms.map(r => r.pricePerNight)).toLocaleString()} Kč/noc
                    </span>
                  </div>
                )}

                {/* Amenities */}
                {accommodation.amenities.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {accommodation.amenities.slice(0, 3).map((amenity, index) => (
                        <span
                          key={index}
                          className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                        >
                          {amenity}
                        </span>
                      ))}
                      {accommodation.amenities.length > 3 && (
                        <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                          +{accommodation.amenities.length - 3} dalších
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Contact Info */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4" />
                    <a 
                      href={`tel:${accommodation.contactInfo.phone}`}
                      className="hover:text-primary-600 transition-colors"
                    >
                      {accommodation.contactInfo.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4" />
                    <a 
                      href={`mailto:${accommodation.contactInfo.email}`}
                      className="hover:text-primary-600 transition-colors"
                    >
                      {accommodation.contactInfo.email}
                    </a>
                  </div>
                  {accommodation.website && (
                    <div className="flex items-center gap-2 text-gray-600">
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
          <div className="bg-primary-50 rounded-lg p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Potřebujete pomoc s rezervací?
            </h3>
            {content.contactInfo.message && (
              <p className="text-gray-600 mb-4">
                {content.contactInfo.message}
              </p>
            )}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
              {content.contactInfo.name && (
                <span className="font-medium text-gray-900">
                  {content.contactInfo.name}
                </span>
              )}
              {content.contactInfo.phone && (
                <a 
                  href={`tel:${content.contactInfo.phone}`}
                  className="flex items-center gap-1 text-primary-600 hover:text-primary-700 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  {content.contactInfo.phone}
                </a>
              )}
              {content.contactInfo.email && (
                <a 
                  href={`mailto:${content.contactInfo.email}`}
                  className="flex items-center gap-1 text-primary-600 hover:text-primary-700 transition-colors"
                >
                  <Mail className="w-4 h-4" />
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
