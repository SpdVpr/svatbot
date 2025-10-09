'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import type { FAQContent } from '@/types/wedding-website'

interface FAQSectionProps {
  content: FAQContent
}

export default function ClassicFAQSection({ content }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

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
          <div className="w-24 h-1 bg-gradient-to-r from-amber-400 to-rose-400 mx-auto"></div>
        </div>
        
        <div className="space-y-4">
          {content.items.map((item, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl shadow-md overflow-hidden border border-pink-100"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/50 transition-colors"
              >
                <span className="text-lg font-semibold text-gray-900 pr-4">
                  {item.question}
                </span>
                {openIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-pink-600 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-pink-600 flex-shrink-0" />
                )}
              </button>
              
              {openIndex === index && (
                <div className="px-6 pb-4 pt-2">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {item.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

