'use client'

import { FAQContent } from '@/types/wedding-website'
import { useState } from 'react'
import SectionTitle from './SectionTitle'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface FAQSectionProps {
  content: FAQContent
}

export default function FAQSection({ content }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  if (!content.enabled || !content.items || content.items.length === 0) {
    return null
  }

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div id="faq" className="py-20 bg-white">
      <SectionTitle title="Často kladené otázky" />

      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {content.items.map((faq, index) => (
            <div
              key={index}
              className="bg-white border border-[#b2c9d3]/30 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <button
                onClick={() => toggleQuestion(index)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-[rgba(178,201,211,0.05)] transition-colors"
              >
                <h3 className="text-lg font-medium text-gray-800 pr-4" style={{ fontFamily: 'Muli, sans-serif' }}>
                  {faq.question}
                </h3>
                {openIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-[#85aaba] flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-[#85aaba] flex-shrink-0" />
                )}
              </button>

              {openIndex === index && (
                <div className="px-6 pb-4 pt-2 border-t border-[#b2c9d3]/20">
                  <p className="text-gray-600 leading-relaxed" style={{ fontFamily: 'Muli, sans-serif' }}>
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

