'use client'

import type { ScheduleContent } from '@/types/wedding-website'

interface ScheduleSectionProps {
  content: ScheduleContent
}

export default function ScheduleSection({ content }: ScheduleSectionProps) {
  if (!content.enabled) return null

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-light text-gray-900 mb-4">
            Program
          </h2>
          <div className="w-16 h-px bg-gray-900 mx-auto mb-8"></div>
          <p className="text-gray-600 text-lg">
            Na co se můžete během našeho svatebního dne těšit?
          </p>
        </div>

        {content.items && content.items.length > 0 ? (
          <div className="space-y-6 sm:space-y-8">
            {content.items.map((item, index) => (
              <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                <div className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-xl sm:text-2xl">{item.icon}</span>
                </div>
                <div className="flex-1 min-w-0 w-full">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                    <h3 className="text-lg sm:text-xl font-light text-gray-900 break-words">{item.title}</h3>
                    <span className="bg-gray-100 px-3 py-1 rounded-full text-sm font-medium text-gray-700 inline-block w-fit whitespace-nowrap">
                      {item.time}
                    </span>
                  </div>
                  {item.description && (
                    <p className="text-gray-600 text-sm sm:text-base break-words">{item.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center">
            <div className="text-4xl mb-4">⏰</div>
            <p className="text-gray-600">
              Program bude brzy k dispozici.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

