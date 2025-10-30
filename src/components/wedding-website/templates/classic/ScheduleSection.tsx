'use client'

import { Clock, MapPin } from 'lucide-react'
import type { ScheduleContent } from '@/types/wedding-website'

interface ScheduleSectionProps {
  content: ScheduleContent
}

export default function ScheduleSection({ content }: ScheduleSectionProps) {
  // Sample schedule items if none provided
  const sampleSchedule = [
    {
      time: '14:00',
      title: 'Svatební obřad',
      description: 'Kostel sv. Václava',
      icon: '⛪'
    },
    {
      time: '15:00',
      title: 'Fotografování',
      description: 'Zámecký park',
      icon: '📸'
    },
    {
      time: '17:00',
      title: 'Příjezd hostů',
      description: 'Hotel Grand',
      icon: '🚗'
    },
    {
      time: '18:00',
      title: 'Svatební hostina',
      description: 'Slavnostní večeře',
      icon: '🍽️'
    },
    {
      time: '21:00',
      title: 'První tanec',
      description: 'Otevření tanečního parketu',
      icon: '💃'
    },
    {
      time: '22:00',
      title: 'Zábava do rána',
      description: 'DJ a živá hudba',
      icon: '🎵'
    }
  ]

  const scheduleItems = content.items && content.items.length > 0 ? content.items : sampleSchedule

  return (
    <section className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 font-serif">
            Program svatby
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-amber-400 to-rose-400 mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">
            Jak bude náš velký den probíhat
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line - hide on mobile */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-amber-400 to-rose-400 hidden sm:block"></div>

          {/* Schedule items */}
          <div className="space-y-8">
            {scheduleItems.map((item, index) => (
              <div key={index} className="relative flex items-start">
                {/* Time circle - hide on mobile */}
                <div className="hidden sm:flex flex-shrink-0 w-16 h-16 bg-white border-4 border-amber-400 rounded-full items-center justify-center shadow-lg z-10">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>

                {/* Content */}
                <div className="sm:ml-8 bg-white rounded-xl p-4 sm:p-6 shadow-lg border border-gray-100 flex-1 w-full overflow-hidden">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className="text-2xl flex-shrink-0">{item.icon}</span>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 font-serif break-words">
                          {item.title}
                        </h3>
                      </div>

                      <p className="text-gray-600 mb-2 text-sm sm:text-base break-words">
                        {item.description}
                      </p>
                    </div>

                    <div className="flex-shrink-0">
                      <div className="bg-gradient-to-r from-amber-100 to-rose-100 px-3 sm:px-4 py-2 rounded-full inline-block">
                        <span className="font-bold text-gray-900 text-sm sm:text-base whitespace-nowrap">
                          {item.time}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom note */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-amber-50 to-rose-50 rounded-xl p-6">
            <p className="text-gray-700 italic">
              Program je orientační a může se během dne mírně změnit. 
              Hlavní je, že si to všichni užijeme! 🎉
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
