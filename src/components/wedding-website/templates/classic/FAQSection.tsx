'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import type { FAQContent } from '@/types/wedding-website'
import { useColorTheme } from '../ColorThemeContext'

interface FAQSectionProps {
  content: FAQContent
}

export default function ClassicFAQSection({ content }: FAQSectionProps) {
  const { theme } = useColorTheme()
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  if (!content.enabled || !content.items || content.items.length === 0) {
    return null
  }

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 font-serif">
            Často kladené otázky
          </h2>
          <div className="w-24 h-1 mx-auto" style={{ backgroundColor: theme.primary }}></div>
        </div>

        <div className="space-y-4">
          {content.items.map((item, index) => {
            const isOpen = openIndex === index
            return (
              <div
                key={`faq-${index}`}
                className="bg-white rounded-xl shadow-md border overflow-hidden"
                style={{ borderColor: `${theme.primary}20`, isolation: 'isolate' }}
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/50 transition-colors"
                  type="button"
                >
                  <span className="text-lg font-semibold text-gray-900 pr-4">
                    {item.question}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-pink-600 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-pink-600 flex-shrink-0" />
                  )}
                </button>

                <div
                  className={`transition-all duration-300 ease-in-out ${
                    isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
                  style={{ overflow: 'hidden' }}
                >
                  <div className="px-6 pb-4 pt-2">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

