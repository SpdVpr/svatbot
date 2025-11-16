'use client'

import { useState } from 'react'
import { useColorTheme } from '../ColorThemeContext'
import { FAQContent } from '@/types/wedding-website'
import { ChevronDown } from 'lucide-react'

interface FAQSectionProps {
  content: FAQContent
}

export default function FAQSection({ content }: FAQSectionProps) {
  const { theme } = useColorTheme()
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  if (!content.enabled || !content.items || content.items.length === 0) return null

  return (
    <section className="py-20 bg-stone-50">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-light text-stone-900 mb-6">
            Časté dotazy
          </h2>
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-stone-400 to-transparent mx-auto mb-8"></div>
        </div>

        {/* FAQ Items */}
        <div className="max-w-3xl mx-auto space-y-4">
          {content.items.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-stone-50 transition-colors"
              >
                <span className="font-medium text-stone-900">{item.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-stone-600 transition-transform ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4">
                  <p className="text-stone-600 leading-relaxed">{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

