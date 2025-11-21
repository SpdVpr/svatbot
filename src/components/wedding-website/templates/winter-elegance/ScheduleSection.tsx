'use client'

import { useColorTheme } from '../ColorThemeContext'
import { ScheduleContent } from '@/types/wedding-website'

interface ScheduleSectionProps {
  content: ScheduleContent
}

export default function ScheduleSection({ content }: ScheduleSectionProps) {
  const { theme } = useColorTheme()

  if (!content.enabled || !content.items || content.items.length === 0) return null

  return (
    <section id="schedule" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-light text-stone-900 mb-6">
            Program
          </h2>
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-stone-400 to-transparent mx-auto mb-8"></div>
          <p className="text-xl text-stone-600 leading-relaxed max-w-3xl mx-auto">
            Na co se můžete během našeho svatebního dne těšit?
          </p>
        </div>

        {/* Schedule Items */}
        <div className="max-w-2xl mx-auto">
          <div className="space-y-6">
            {content.items.map((item, index) => (
              <div key={index} className="flex items-center justify-center gap-4">
                <div className="w-3 h-3 rounded-full bg-stone-400"></div>
                <div className="flex-1 text-center">
                  {item.time && (
                    <span className="text-stone-500 text-sm mr-3">{item.time}</span>
                  )}
                  <h3 className="inline text-lg font-light text-stone-900">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-stone-600 text-sm mt-1">{item.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-lg text-stone-600 italic">
              Mimo to pro Vás chystáme i spoustu překvapení, které si zatím necháme pro sebe :)
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

