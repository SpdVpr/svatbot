'use client'

import { ScheduleContent } from '@/types/wedding-website'
import SectionTitle from './SectionTitle'

interface ScheduleSectionProps {
  content: ScheduleContent
}

export default function ScheduleSection({ content }: ScheduleSectionProps) {
  if (!content.enabled || !content.items || content.items.length === 0) return null

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <SectionTitle title="Program svatby" />

        <div className="max-w-2xl mx-auto">
          <div className="space-y-6">
            {content.items.map((item, index) => (
              <div
                key={index}
                className="flex flex-col items-center text-center group relative"
              >
                {/* Time */}
                <div className="mb-3">
                  <span className="text-3xl font-bold" style={{ fontFamily: 'Great Vibes, cursive', color: '#b19a56' }}>
                    {item.time}
                  </span>
                </div>

                {/* Timeline Dot */}
                <div className="relative mb-4">
                  <div className="w-4 h-4 rounded-full border-4 border-white shadow-lg relative z-10" style={{ backgroundColor: '#b19a56' }}></div>
                  {/* Connecting Line */}
                  {index < content.items.length - 1 && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0.5 h-16" style={{ backgroundColor: '#e1d9bf' }}></div>
                  )}
                </div>

                {/* Content */}
                <div className="pb-8">
                  <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-gray-600 leading-relaxed max-w-md mx-auto">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

