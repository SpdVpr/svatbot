'use client'

import { MapPin, Clock, Shirt, Car, Info } from 'lucide-react'
import type { InfoContent } from '@/types/wedding-website'

interface InfoSectionProps {
  content: InfoContent
}

export default function ModernInfoSection({ content }: InfoSectionProps) {
  const { ceremony, reception, dressCode, dressCodeDetails, parking, customInfo } = content

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

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-3xl font-light text-gray-900 mb-4">
            Informace o svatbě
          </h2>
          <div className="w-12 h-px bg-gray-900 mx-auto mb-8"></div>
          <p className="text-gray-600 text-lg font-light max-w-2xl mx-auto">
            Všechny důležité informace o našem velkém dni
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-16">
          {/* Ceremony */}
          {ceremony && (ceremony.venue || ceremony.time || ceremony.address) && (
            <div className="bg-white p-12 shadow-sm border border-gray-200">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-gray-100 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-gray-900" />
                </div>
                <h3 className="text-2xl font-light text-gray-900">
                  Obřad
                </h3>
              </div>

              <div className="space-y-6">
                {ceremony.venue && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2 tracking-wide">MÍSTO KONÁNÍ</h4>
                    <p className="text-gray-700 font-light">{ceremony.venue}</p>
                  </div>
                )}

                {ceremony.time && (
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-gray-600" />
                    <span className="font-medium text-gray-900 tracking-wide">ČAS:</span>
                    <span className="text-gray-700 font-light">{ceremony.time}</span>
                  </div>
                )}

                {ceremony.address && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2 tracking-wide">ADRESA</h4>
                    <p className="text-gray-700 font-light">{ceremony.address}</p>
                  </div>
                )}
              </div>

              {/* Minimalist decorative element */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="text-center">
                  <div className="text-2xl mb-2">⛪</div>
                  <p className="text-sm text-gray-600 font-light italic">
                    "Ano" řekneme zde
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Reception */}
          {reception && (reception.venue || reception.time || reception.address) && (
            <div className="bg-white p-12 shadow-sm border border-gray-200">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-gray-100 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-gray-900" />
                </div>
                <h3 className="text-2xl font-light text-gray-900">
                  Hostina
                </h3>
              </div>

              <div className="space-y-6">
                {reception.venue && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2 tracking-wide">MÍSTO KONÁNÍ</h4>
                    <p className="text-gray-700 font-light">{reception.venue}</p>
                  </div>
                )}

                {reception.time && (
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-gray-600" />
                    <span className="font-medium text-gray-900 tracking-wide">ČAS:</span>
                    <span className="text-gray-700 font-light">{reception.time}</span>
                  </div>
                )}

                {reception.address && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2 tracking-wide">ADRESA</h4>
                    <p className="text-gray-700 font-light">{reception.address}</p>
                  </div>
                )}
              </div>

              {/* Minimalist decorative element */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="text-center">
                  <div className="text-2xl mb-2">🥂</div>
                  <p className="text-sm text-gray-600 font-light italic">
                    Oslavíme společně zde
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Additional Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Dress Code */}
          {dressCode && (
            <div className="bg-white p-8 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gray-100 flex items-center justify-center">
                  <Shirt className="w-4 h-4 text-gray-900" />
                </div>
                <h4 className="font-medium text-gray-900 tracking-wide">DRESS CODE</h4>
              </div>
              <p className="text-gray-700 font-light">
                {getDressCodeText(dressCode)}
              </p>
            </div>
          )}

          {/* Parking */}
          {parking && (
            <div className="bg-white p-8 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gray-100 flex items-center justify-center">
                  <Car className="w-4 h-4 text-gray-900" />
                </div>
                <h4 className="font-medium text-gray-900 tracking-wide">PARKOVÁNÍ</h4>
              </div>
              <p className="text-gray-700 font-light">{parking}</p>
            </div>
          )}

          {/* Custom Info */}
          {customInfo && customInfo.map((info) => (
            <div key={info.id} className="bg-white p-8 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gray-100 flex items-center justify-center">
                  <Info className="w-4 h-4 text-gray-900" />
                </div>
                <h4 className="font-medium text-gray-900 tracking-wide uppercase">{info.title}</h4>
              </div>
              <p className="text-gray-700 font-light">{info.description}</p>
            </div>
          ))}
        </div>

        {/* Minimalist bottom section */}
        <div className="mt-20 text-center">
          <div className="inline-flex items-center gap-6 px-12 py-6 bg-white border border-gray-200">
            <div className="text-xl">💒</div>
            <p className="text-gray-700 font-light tracking-wide">
              Těšíme se na vás!
            </p>
            <div className="text-xl">💕</div>
          </div>
        </div>
      </div>
    </section>
  )
}
