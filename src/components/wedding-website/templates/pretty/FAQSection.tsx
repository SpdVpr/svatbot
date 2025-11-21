'use client'

import { FAQContent } from '@/types/wedding-website'
import SectionTitle from './SectionTitle'
import { useState } from 'react'

interface FAQSectionProps {
  content: FAQContent
}

export default function FAQSection({ content }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  if (!content.enabled || !content.items || content.items.length === 0) return null

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section id="faq" className="py-20 relative" style={{ background: 'linear-gradient(to bottom, #faf8f3 0%, #f5f1e8 100%)' }}>
      {/* Decorative Elements */}
      <div
        className="absolute left-0 top-1/2 -translate-y-1/2 w-28 h-28 opacity-15 hidden lg:block"
        style={{
          backgroundImage: 'url(/templates/pretty/images/rsvp-left-flower.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center'
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <SectionTitle title="Často kladené otázky" />

        <div className="max-w-3xl mx-auto space-y-4">
          {content.items.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <button
                onClick={() => toggleQuestion(index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between transition-colors"
                style={{
                  backgroundColor: openIndex === index ? '#faf8f3' : 'white'
                }}
                onMouseEnter={(e) => {
                  if (openIndex !== index) {
                    e.currentTarget.style.backgroundColor = '#faf8f3'
                  }
                }}
                onMouseLeave={(e) => {
                  if (openIndex !== index) {
                    e.currentTarget.style.backgroundColor = 'white'
                  }
                }}
              >
                <span className="font-semibold text-gray-800 pr-4">
                  {item.question}
                </span>
                <span
                  className={`text-2xl transition-transform ${openIndex === index ? 'rotate-180' : ''}`}
                  style={{ color: '#b19a56' }}
                >
                  ↓
                </span>
              </button>
              {openIndex === index && (
                <div className="px-6 py-4 border-t" style={{ backgroundColor: '#faf8f3', borderColor: '#e1d9bf' }}>
                  <p className="text-gray-600 leading-relaxed">
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

