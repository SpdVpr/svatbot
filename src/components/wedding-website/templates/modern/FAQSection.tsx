'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import type { FAQContent } from '@/types/wedding-website'

interface FAQSectionProps {
  content: FAQContent
}

export default function ModernFAQSection({ content }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  if (!content.enabled || !content.items || content.items.length === 0) {
    return null
  }

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-light text-gray-900 mb-4">
            Často kladené otázky
          </h2>
          <div className="w-12 h-px bg-gray-900 mx-auto"></div>
        </div>
        
        <div className="space-y-3">
          {content.items.map((item, index) => {
            const isOpen = openIndex === index
            return (
              <div
                key={`faq-${index}`}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                style={{ isolation: 'isolate' }}
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                  type="button"
                >
                  <span className="text-lg font-medium text-gray-900 pr-4">
                    {item.question}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-gray-600 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-600 flex-shrink-0" />
                  )}
                </button>

                <div
                  className={`transition-all duration-300 ease-in-out border-t border-gray-100 ${
                    isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 border-t-0'
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

