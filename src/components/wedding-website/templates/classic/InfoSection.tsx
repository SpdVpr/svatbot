'use client'

import { MapPin, Clock, Car, Info } from 'lucide-react'
import type { InfoContent } from '@/types/wedding-website'
import GoogleMapsEmbed from '../../GoogleMapsEmbed'
import { useColorTheme } from '../ColorThemeContext'

interface InfoSectionProps {
  content: InfoContent
}

export default function InfoSection({ content }: InfoSectionProps) {
  const { ceremony, reception, parking, customInfo } = content
  const { theme } = useColorTheme()

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
    <section className="py-20" style={{ backgroundColor: theme.bgGradientFrom }}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-4 font-serif scale-in">
            {ceremony?.venue || reception?.venue || 'Místo konání'}
          </h2>
          <div className="w-24 h-1 mx-auto mb-6 slide-in-left" style={{ animationDelay: '0.2s', backgroundColor: theme.primary }}></div>
          <p className="text-gray-600 text-lg leading-relaxed max-w-3xl mx-auto slide-in-bottom" style={{ animationDelay: '0.3s' }}>
            {ceremony?.address || reception?.address || 'Všechny důležité informace o našem velkém dni'}
          </p>
        </div>

        {/* Main Venue Info */}
        {(hasCeremony || hasReception) && (
          <div className="mb-16">
            <div className="bg-white rounded-2xl overflow-hidden shadow-xl border border-amber-100">
              {/* Venue Images - First */}
              {allVenueImages.length > 0 && (
                <div className="p-8 flex justify-center">
                  <div className={`${getImageGridClasses()} gap-6 max-w-4xl`}>
                    {allVenueImages.map((image, index) => (
                      <div
                        key={index}
                        className="stagger-item rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group"
                        style={{
                          animationDelay: `${index * 150}ms`,
                          aspectRatio: '16/8'
                        }}
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
                <div className="h-96 lg:h-auto relative">
                  {(ceremony?.address || reception?.address) && (
                    <GoogleMapsEmbed
                      address={ceremony?.address || reception?.address || ''}
                      className="w-full h-full"
                      height="100%"
                    />
                  )}
                  {/* Decorative gradient overlay on map edge */}
                  <div className="absolute top-0 right-0 w-8 h-full bg-gradient-to-l from-white to-transparent pointer-events-none hidden lg:block"></div>
                </div>

                {/* Right: Info */}
                <div className="p-12" style={{ backgroundColor: `${theme.bgGradientFrom}80` }}>
                  <div className="space-y-8">
                    {/* Venue Name */}
                    {(ceremony?.venue || reception?.venue) && (
                      <div>
                        <h3 className="text-4xl font-bold text-gray-900 mb-3 font-serif">
                          {ceremony?.venue || reception?.venue}
                        </h3>
                        <p className="text-gray-600 text-lg">
                          {ceremony?.address || reception?.address}
                        </p>
                      </div>
                    )}

                    {/* Time */}
                    {(ceremony?.time || reception?.time) && (
                      <div className="flex items-start space-x-4">
                        <div className="p-3 rounded-full flex-shrink-0" style={{ backgroundColor: theme.bgGradientTo }}>
                          <Clock className="w-6 h-6" style={{ color: theme.primary }} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2 text-lg">Čas začátku</h4>
                          <p className="text-3xl font-bold text-gray-900 font-serif">
                            {ceremony?.time || reception?.time}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Reception info if different from ceremony */}
                    {ceremony && reception && ceremony.venue !== reception.venue && (
                      <div className="pt-6 border-t border-amber-200">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-rose-100 rounded-full">
                            <MapPin className="w-5 h-5 text-rose-600" />
                          </div>
                          <h4 className="font-bold text-gray-900 text-xl font-serif">Hostina</h4>
                        </div>
                        <div className="space-y-2 ml-11">
                          <p className="text-gray-900 font-semibold text-lg">{reception.venue}</p>
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
                          className="inline-flex items-center space-x-2 px-6 py-3 text-white rounded-full transition-all shadow-md hover:shadow-lg font-semibold"
                          style={{ backgroundColor: theme.primary }}
                          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                        >
                          <MapPin className="w-5 h-5" />
                          <span>Otevřít v Google Maps</span>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Additional Info - Elegant Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Parking */}
          {parking && (
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-amber-100 hover:shadow-xl transition-shadow">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center shadow-md">
                  <Car className="w-10 h-10 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-3 text-xl font-serif">Parkování</h4>
                  <p className="text-gray-600 leading-relaxed">{parking}</p>
                </div>
              </div>
            </div>
          )}

          {/* Custom Info */}
          {customInfo && customInfo.slice(0, 1).map((info) => (
            <div key={info.id} className="bg-white rounded-2xl p-8 shadow-lg border border-amber-100 hover:shadow-xl transition-shadow">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center shadow-md">
                  <Info className="w-10 h-10 text-green-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-3 text-xl font-serif">{info.title}</h4>
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
              <div key={info.id} className="bg-white rounded-2xl p-8 shadow-lg border border-amber-100 hover:shadow-xl transition-shadow">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center shadow-md">
                    <Info className="w-10 h-10 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-3 text-xl font-serif">{info.title}</h4>
                    <p className="text-gray-600 leading-relaxed">{info.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Decorative bottom section */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-4 px-10 py-5 rounded-full shadow-lg" style={{ backgroundColor: theme.bgGradientTo }}>
            <div className="text-3xl">💒</div>
            <p className="text-gray-800 font-bold text-lg font-serif">
              Těšíme se na vás!
            </p>
            <div className="text-3xl">💕</div>
          </div>
        </div>
      </div>
    </section>
  )
}
