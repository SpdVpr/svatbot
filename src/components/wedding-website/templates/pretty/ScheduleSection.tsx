'use client'

import { ScheduleContent } from '@/types/wedding-website'
import SectionTitle from './SectionTitle'

interface ScheduleSectionProps {
  content: ScheduleContent
}

export default function ScheduleSection({ content }: ScheduleSectionProps) {
  if (!content.enabled || !content.items || content.items.length === 0) return null

  return (
    <section id="schedule" className="py-20 relative" style={{ background: 'linear-gradient(to bottom, #faf8f3 0%, #f7f5f0 50%, #ffffff 100%)' }}>
      {/* Decorative Elements */}
      <div
        className="absolute right-0 top-1/4 w-32 h-32 opacity-15 hidden lg:block"
        style={{
          backgroundImage: 'url(/templates/pretty/images/rsvp-right-flower.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center'
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <SectionTitle title="Harmonogram svatby" />

        <div className="max-w-2xl mx-auto">
          <div className="space-y-2">
            {content.items.map((item, index) => (
              <div
                key={index}
                className="flex flex-col items-center text-center group relative"
              >
                {/* Time and Content together */}
                <div className="mb-2">
                  <span className="text-2xl font-bold" style={{ fontFamily: 'Great Vibes, cursive', color: '#b19a56' }}>
                    {item.time}
                  </span>
                </div>

                {/* Content */}
                <div className="pb-6">
                  <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-gray-600 leading-relaxed max-w-md mx-auto">
                      {item.description}
                    </p>
                  )}
                </div>

                {/* Connecting Line - only between items */}
                {index < content.items.length - 1 && (
                  <div className="w-0.5 h-8 mb-2" style={{ backgroundColor: '#e1d9bf' }}></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

