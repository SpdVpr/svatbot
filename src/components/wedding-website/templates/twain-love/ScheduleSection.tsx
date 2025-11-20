'use client'

import { ScheduleContent } from '@/types/wedding-website'
import SectionTitle from './SectionTitle'
import { Clock } from 'lucide-react'

interface ScheduleSectionProps {
  content: ScheduleContent
}

export default function ScheduleSection({ content }: ScheduleSectionProps) {
  if (!content.enabled || !content.items || content.items.length === 0) {
    return null
  }

  return (
    <div id="schedule" className="py-20 bg-white">
      <SectionTitle title="Program svatby" />

      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-[#b2c9d3] hidden md:block" />

            {/* Events */}
            <div className="space-y-12">
              {content.items.map((event, index) => {
                const isEven = index % 2 === 0

                return (
                  <div key={index} className="relative">
                    <div className={`md:flex items-center ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                      {/* Time */}
                      <div className={`md:w-1/2 ${isEven ? 'md:text-right md:pr-12' : 'md:text-left md:pl-12'}`}>
                        <div className="flex items-center gap-2 mb-2 md:mb-0 md:inline-flex">
                          <Clock className="w-5 h-5 text-[#85aaba]" />
                          <span className="text-xl font-medium text-[#85aaba]" style={{ fontFamily: 'Muli, sans-serif' }}>
                            {event.time}
                          </span>
                        </div>
                      </div>

                      {/* Center dot */}
                      <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-[#85aaba] rounded-full border-4 border-white shadow-md" />

                      {/* Content */}
                      <div className={`md:w-1/2 ${isEven ? 'md:pl-12' : 'md:pr-12'} mt-4 md:mt-0`}>
                        <div className="bg-white p-6 rounded-lg shadow-md border border-[#b2c9d3]/30">
                          <h3 className="text-2xl mb-2 text-gray-800" style={{ fontFamily: 'Great Vibes, cursive' }}>
                            {event.title}
                          </h3>
                          {event.description && (
                            <p className="text-gray-600" style={{ fontFamily: 'Muli, sans-serif' }}>
                              {event.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

