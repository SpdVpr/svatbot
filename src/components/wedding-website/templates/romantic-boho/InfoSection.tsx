'use client'

import { Calendar, MapPin, Clock } from 'lucide-react'
import type { InfoContent } from '@/types/wedding-website'

interface InfoSectionProps {
  content: InfoContent
}

export default function InfoSection({ content }: InfoSectionProps) {
  const formatTime = (time: string) => {
    return time
  }

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Decorative Background Pattern */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f43f5e' fill-opacity='0.15'%3E%3Cpath d='M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10zM10 10c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10S0 25.523 0 20s4.477-10 10-10zm10 8c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm40 40c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="font-serif text-5xl md:text-6xl font-light text-gray-800 mb-4">
            Informace o svatbě
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-rose-400 via-pink-400 to-amber-400 mx-auto rounded-full" />
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Ceremony */}
          {content.ceremony && (
            <div className="group bg-gradient-to-br from-rose-50 to-pink-50 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border-2 border-rose-100 hover:border-rose-300">
              {/* Venue Image */}
              {content.ceremony.images && content.ceremony.images.length > 0 ? (
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={content.ceremony.images[0]}
                    alt={content.ceremony.venue || 'Ceremony venue'}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-rose-900/40 to-transparent" />
                </div>
              ) : (
                <div className="flex justify-center pt-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-rose-400 to-pink-400 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                    <Calendar className="w-8 h-8 text-white" />
                  </div>
                </div>
              )}

              <div className="p-8">
                <h3 className="text-2xl font-serif text-gray-800 text-center mb-4">
                  Obřad
                </h3>

                <div className="space-y-3 text-center">
                  {content.ceremony.time && (
                    <div className="flex items-center justify-center gap-2 text-gray-700">
                      <Clock className="w-4 h-4 text-rose-400" />
                      <span className="font-light">{formatTime(content.ceremony.time)}</span>
                    </div>
                  )}

                  {content.ceremony.venue && (
                    <div className="flex items-center justify-center gap-2 text-gray-700">
                      <MapPin className="w-4 h-4 text-rose-400" />
                      <span className="font-light">{content.ceremony.venue}</span>
                    </div>
                  )}

                  {content.ceremony.address && (
                    <p className="text-sm text-gray-600 font-light mt-2">
                      {content.ceremony.address}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Reception */}
          {content.reception && (
            <div className="group bg-gradient-to-br from-pink-50 to-amber-50 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border-2 border-pink-100 hover:border-pink-300">
              {/* Venue Image */}
              {content.reception.images && content.reception.images.length > 0 ? (
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={content.reception.images[0]}
                    alt={content.reception.venue || 'Reception venue'}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-pink-900/40 to-transparent" />
                </div>
              ) : (
                <div className="flex justify-center pt-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-amber-400 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                    <Calendar className="w-8 h-8 text-white" />
                  </div>
                </div>
              )}

              <div className="p-8">
                <h3 className="text-2xl font-serif text-gray-800 text-center mb-4">
                  Oslava
                </h3>

                <div className="space-y-3 text-center">
                  {content.reception.time && (
                    <div className="flex items-center justify-center gap-2 text-gray-700">
                      <Clock className="w-4 h-4 text-pink-400" />
                      <span className="font-light">{formatTime(content.reception.time)}</span>
                    </div>
                  )}

                  {content.reception.venue && (
                    <div className="flex items-center justify-center gap-2 text-gray-700">
                      <MapPin className="w-4 h-4 text-pink-400" />
                      <span className="font-light">{content.reception.venue}</span>
                    </div>
                  )}

                  {content.reception.address && (
                    <p className="text-sm text-gray-600 font-light mt-2">
                      {content.reception.address}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Parking */}
          {content.parking && (
            <div className="group bg-gradient-to-br from-amber-50 to-rose-50 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border-2 border-amber-100 hover:border-amber-300">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-rose-400 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                  <MapPin className="w-8 h-8 text-white" />
                </div>
              </div>

              <h3 className="text-2xl font-serif text-gray-800 text-center mb-4">
                Parkování
              </h3>

              <p className="text-gray-600 font-light text-center leading-relaxed">
                {content.parking}
              </p>
            </div>
          )}

          {/* Accessibility */}
          {content.accessibility && (
            <div className="group bg-gradient-to-br from-rose-50 to-amber-50 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border-2 border-rose-100 hover:border-rose-300">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-rose-400 to-amber-400 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                  <MapPin className="w-8 h-8 text-white" />
                </div>
              </div>

              <h3 className="text-2xl font-serif text-gray-800 text-center mb-4">
                Bezbariérovost
              </h3>

              <p className="text-gray-600 font-light text-center leading-relaxed">
                {content.accessibility}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

