'use client'

import { MapPin, Clock, Shirt, Car, Info, Palette } from 'lucide-react'
import type { InfoContent } from '@/types/wedding-website'
import GoogleMapsEmbed from '../../GoogleMapsEmbed'

interface InfoSectionProps {
  content: InfoContent
}

export default function InfoSection({ content }: InfoSectionProps) {
  const { ceremony, reception, dressCode, dressCodeDetails, colorPalette, parking, customInfo } = content

  const getDressCodeText = (code: string) => {
    switch (code) {
      case 'formal':
        return 'Formální (oblek/večerní šaty)'
      case 'semi-formal':
        return 'Poloformální (košile/koktejlové šaty)'
      case 'casual':
        return 'Neformální'
      case 'cocktail':
        return 'Koktejlové oblečení'
      case 'black-tie':
        return 'Black tie'
      case 'custom':
        return dressCodeDetails || 'Vlastní požadavky'
      default:
        return code
    }
  }

  // Check which venue sections are filled
  const hasCeremony = ceremony && (ceremony.venue || ceremony.time || ceremony.address)
  const hasReception = reception && (reception.venue || reception.time || reception.address)
  const venueCount = (hasCeremony ? 1 : 0) + (hasReception ? 1 : 0)

  // Dynamic grid classes based on number of filled venues
  const getGridClasses = () => {
    if (venueCount === 1) {
      return "grid grid-cols-1 gap-8 mb-12" // Single column for one venue
    }
    return "grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12" // Two columns for two venues
  }

  return (
    <section className="py-20 bg-gradient-to-b from-white to-amber-50/30">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-4 font-serif">
            {ceremony?.venue || reception?.venue || 'Místo konání'}
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-amber-400 to-rose-400 mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg leading-relaxed max-w-3xl mx-auto">
            {ceremony?.address || reception?.address || 'Všechny důležité informace o našem velkém dni'}
          </p>
        </div>

        {/* Main Venue Info - Full Width with Map */}
        {(hasCeremony || hasReception) && (
          <div className="mb-16">
            <div className="bg-white rounded-2xl overflow-hidden shadow-xl border border-amber-100">
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
                <div className="p-12 bg-gradient-to-br from-amber-50/50 to-rose-50/50">
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
                        <div className="p-3 bg-gradient-to-br from-amber-100 to-rose-100 rounded-full flex-shrink-0">
                          <Clock className="w-6 h-6 text-amber-600" />
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
                          className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-rose-500 text-white rounded-full hover:from-amber-600 hover:to-rose-600 transition-all shadow-md hover:shadow-lg font-semibold"
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

          {/* Dress Code */}
          {dressCode && (
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-amber-100 hover:shadow-xl transition-shadow">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center shadow-md">
                  <Shirt className="w-10 h-10 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-3 text-xl font-serif">Dress Code</h4>
                  <p className="text-gray-600 leading-relaxed">
                    {getDressCodeText(dressCode)}
                  </p>
                  {dressCodeDetails && dressCode !== 'custom' && (
                    <p className="text-sm text-gray-500 mt-2 italic">{dressCodeDetails}</p>
                  )}

                  {/* Color Palette */}
                  {colorPalette && colorPalette.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-center gap-2 mb-3">
                        <Palette className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-medium text-gray-900">Barevná paleta</span>
                      </div>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {colorPalette.map((color, index) => (
                          <div
                            key={index}
                            className="w-10 h-10 rounded-full border-2 border-white shadow-md"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                  )}
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
          <div className="inline-flex items-center gap-4 px-10 py-5 bg-gradient-to-r from-amber-100 via-rose-100 to-amber-100 rounded-full shadow-lg">
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
