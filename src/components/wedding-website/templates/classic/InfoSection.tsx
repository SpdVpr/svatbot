'use client'

import { MapPin, Clock, Shirt, Car, Info } from 'lucide-react'
import type { InfoContent } from '@/types/wedding-website'

interface InfoSectionProps {
  content: InfoContent
}

export default function InfoSection({ content }: InfoSectionProps) {
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
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 font-serif">
            Informace o svatbě
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-amber-400 to-rose-400 mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Všechny důležité informace o našem velkém dni
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Ceremony */}
          {ceremony && (ceremony.venue || ceremony.time || ceremony.address) && (
            <div className="bg-gradient-to-br from-amber-50 to-rose-50 rounded-2xl p-8 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-amber-100 rounded-full">
                  <MapPin className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 font-serif">
                  Obřad
                </h3>
              </div>

              <div className="space-y-4">
                {ceremony.venue && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Místo konání</h4>
                    <p className="text-gray-700">{ceremony.venue}</p>
                  </div>
                )}

                {ceremony.time && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span className="font-semibold text-gray-900">Čas:</span>
                    <span className="text-gray-700">{ceremony.time}</span>
                  </div>
                )}

                {ceremony.address && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Adresa</h4>
                    <p className="text-gray-700">{ceremony.address}</p>
                  </div>
                )}
              </div>

              {/* Decorative element */}
              <div className="mt-6 pt-6 border-t border-amber-200">
                <div className="text-center">
                  <div className="text-3xl mb-2">⛪</div>
                  <p className="text-sm text-gray-600 italic">
                    "Ano" řekneme zde
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Reception */}
          {reception && (reception.venue || reception.time || reception.address) && (
            <div className="bg-gradient-to-br from-rose-50 to-amber-50 rounded-2xl p-8 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-rose-100 rounded-full">
                  <MapPin className="w-6 h-6 text-rose-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 font-serif">
                  Hostina
                </h3>
              </div>

              <div className="space-y-4">
                {reception.venue && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Místo konání</h4>
                    <p className="text-gray-700">{reception.venue}</p>
                  </div>
                )}

                {reception.time && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-rose-600" />
                    <span className="font-semibold text-gray-900">Čas:</span>
                    <span className="text-gray-700">{reception.time}</span>
                  </div>
                )}

                {reception.address && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Adresa</h4>
                    <p className="text-gray-700">{reception.address}</p>
                  </div>
                )}
              </div>

              {/* Decorative element */}
              <div className="mt-6 pt-6 border-t border-rose-200">
                <div className="text-center">
                  <div className="text-3xl mb-2">🥂</div>
                  <p className="text-sm text-gray-600 italic">
                    Oslavíme společně zde
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Additional Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Dress Code */}
          {dressCode && (
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-full">
                  <Shirt className="w-5 h-5 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-900">Dress Code</h4>
              </div>
              <p className="text-gray-700">
                {getDressCodeText(dressCode)}
              </p>
            </div>
          )}

          {/* Parking */}
          {parking && (
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Car className="w-5 h-5 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900">Parkování</h4>
              </div>
              <p className="text-gray-700">{parking}</p>
            </div>
          )}

          {/* Custom Info */}
          {customInfo && customInfo.map((info) => (
            <div key={info.id} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 rounded-full">
                  <Info className="w-5 h-5 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900">{info.title}</h4>
              </div>
              <p className="text-gray-700">{info.description}</p>
            </div>
          ))}
        </div>

        {/* Decorative bottom section */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-4 px-8 py-4 bg-gradient-to-r from-amber-100 to-rose-100 rounded-full">
            <div className="text-2xl">💒</div>
            <p className="text-gray-700 font-medium">
              Těšíme se na vás!
            </p>
            <div className="text-2xl">💕</div>
          </div>
        </div>
      </div>
    </section>
  )
}
