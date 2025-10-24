'use client'

import { Clock, Sparkles, Music, Utensils, Camera, Heart } from 'lucide-react'
import type { ScheduleContent } from '@/types/wedding-website'

interface ScheduleSectionProps {
  content: ScheduleContent
}

const iconMap: Record<string, any> = {
  clock: Clock,
  sparkles: Sparkles,
  music: Music,
  utensils: Utensils,
  camera: Camera,
  heart: Heart,
}

export default function ScheduleSection({ content }: ScheduleSectionProps) {
  if (!content.enabled || !content.items || content.items.length === 0) return null

  return (
    <section className="relative py-24 bg-gradient-to-br from-pink-50 via-white to-amber-50 overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute top-20 right-10 w-32 h-32 border-4 border-rose-200 rounded-full opacity-20"></div>
      <div className="absolute bottom-20 left-10 w-40 h-40 border-4 border-amber-200 rounded-full opacity-20"></div>
      <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-pink-200 rounded-full blur-3xl opacity-30"></div>

      <div className="relative max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-block mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-rose-300 rounded-full blur-xl opacity-50 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-rose-100 to-amber-100 rounded-full p-5">
                <Clock className="w-10 h-10 text-rose-600" />
              </div>
            </div>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-gray-800 mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Program dne
          </h2>
          <p className="text-lg text-rose-600 italic" style={{ fontFamily: 'Lora, serif' }}>
            Připravili jsme pro vás nezapomenutelný den
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-rose-300 via-pink-300 to-amber-300 transform md:-translate-x-1/2"></div>

          {/* Timeline items */}
          <div className="space-y-12">
            {content.items.map((item, index) => {
              const Icon = item.icon && iconMap[item.icon.toLowerCase()] ? iconMap[item.icon.toLowerCase()] : Sparkles
              const isEven = index % 2 === 0

              return (
                <div key={index} className="relative flex items-center flex-row">
                  {/* Time badge - mobile */}
                  <div className="md:hidden flex-shrink-0 w-16">
                    <div className="bg-gradient-to-br from-rose-500 to-pink-500 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg">
                      <span className="text-sm font-bold">{item.time}</span>
                    </div>
                  </div>

                  {/* Content card - mobile */}
                  <div className="md:hidden flex-1 ml-6">
                    <div className="bg-white rounded-2xl p-6 shadow-xl border-2 border-rose-100 hover:border-rose-300 transition-all duration-300">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="bg-gradient-to-br from-rose-100 to-pink-100 rounded-full p-2">
                          <Icon className="w-5 h-5 text-rose-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800" style={{ fontFamily: 'Playfair Display, serif' }}>
                          {item.title}
                        </h3>
                      </div>
                      {item.description && (
                        <p className="text-gray-600 leading-relaxed">{item.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Desktop layout */}
                  <div className="hidden md:flex items-center w-full">
                    {/* Left side */}
                    <div className={`w-5/12 ${isEven ? 'text-right pr-12' : 'order-3 pl-12'}`}>
                      {isEven ? (
                        <div className="inline-block">
                          <div className="bg-white rounded-2xl p-6 shadow-xl border-2 border-rose-100 hover:border-rose-300 transition-all duration-300 hover:shadow-2xl hover:scale-105">
                            <div className="flex items-center justify-end gap-3 mb-3">
                              <h3 className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'Playfair Display, serif' }}>
                                {item.title}
                              </h3>
                              <div className="bg-gradient-to-br from-rose-100 to-pink-100 rounded-full p-2">
                                <Icon className="w-6 h-6 text-rose-600" />
                              </div>
                            </div>
                            {item.description && (
                              <p className="text-gray-600 leading-relaxed text-right">{item.description}</p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gradient-to-br from-amber-500 to-rose-500 text-white rounded-2xl px-6 py-4 shadow-lg inline-block">
                          <span className="text-2xl font-bold">{item.time}</span>
                        </div>
                      )}
                    </div>

                    {/* Center dot */}
                    <div className="w-2/12 flex justify-center order-2">
                      <div className="relative">
                        <div className="absolute inset-0 bg-rose-400 rounded-full blur-md opacity-50"></div>
                        <div className="relative w-6 h-6 bg-gradient-to-br from-rose-500 to-pink-500 rounded-full border-4 border-white shadow-lg"></div>
                      </div>
                    </div>

                    {/* Right side */}
                    <div className={`w-5/12 ${isEven ? 'order-3 pl-12' : 'pr-12'}`}>
                      {isEven ? (
                        <div className="bg-gradient-to-br from-amber-500 to-rose-500 text-white rounded-2xl px-6 py-4 shadow-lg inline-block">
                          <span className="text-2xl font-bold">{item.time}</span>
                        </div>
                      ) : (
                        <div className="inline-block">
                          <div className="bg-white rounded-2xl p-6 shadow-xl border-2 border-amber-100 hover:border-amber-300 transition-all duration-300 hover:shadow-2xl hover:scale-105">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="bg-gradient-to-br from-amber-100 to-orange-100 rounded-full p-2">
                                <Icon className="w-6 h-6 text-amber-600" />
                              </div>
                              <h3 className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'Playfair Display, serif' }}>
                                {item.title}
                              </h3>
                            </div>
                            {item.description && (
                              <p className="text-gray-600 leading-relaxed">{item.description}</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Bottom decoration */}
        <div className="flex justify-center mt-16">
          <div className="flex items-center gap-3">
            <div className="w-16 h-1 bg-gradient-to-r from-transparent to-rose-300 rounded-full"></div>
            <Heart className="w-6 h-6 text-rose-400 fill-rose-200" />
            <div className="w-16 h-1 bg-gradient-to-l from-transparent to-amber-300 rounded-full"></div>
          </div>
        </div>
      </div>
    </section>
  )
}

