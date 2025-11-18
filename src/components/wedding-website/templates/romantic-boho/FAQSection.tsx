'use client'

import { useState } from 'react'
import { HelpCircle, ChevronDown } from 'lucide-react'
import type { FAQContent } from '@/types/wedding-website'

interface FAQSectionProps {
  content: FAQContent
}

export default function FAQSection({ content }: FAQSectionProps) {
  if (!content.enabled || !content.items || content.items.length === 0) return null

  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="relative py-24 bg-gradient-to-br from-pink-50 via-white to-rose-50 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-rose-200 rounded-full blur-3xl opacity-20"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-200 rounded-full blur-3xl opacity-20"></div>

      <div className="relative max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-rose-300 rounded-full blur-xl opacity-50"></div>
              <div className="relative bg-gradient-to-br from-rose-100 to-pink-100 rounded-full p-5">
                <HelpCircle className="w-10 h-10 text-rose-600" />
              </div>
            </div>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-gray-800 mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Časté dotazy
          </h2>
          <p className="text-lg text-rose-600 italic" style={{ fontFamily: 'Lora, serif' }}>
            Odpovědi na vaše otázky
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {content.items.map((item, index) => {
            const isOpen = openIndex === index
            return (
              <div
                key={`faq-${index}`}
                className="bg-white rounded-2xl shadow-lg border-2 border-rose-100 overflow-hidden transition-all duration-300 hover:shadow-xl"
                style={{ isolation: 'isolate' }}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left transition-colors hover:bg-rose-50"
                  type="button"
                >
                  <span className="text-lg font-bold text-gray-800 pr-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`w-6 h-6 text-rose-500 flex-shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                <div
                  className={`transition-all duration-300 ease-in-out ${
                    isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
                  style={{ overflow: 'hidden' }}
                >
                  <div className="px-6 pb-5 pt-2">
                    <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl p-4">
                      <p className="text-gray-700 leading-relaxed">{item.answer}</p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom note */}
        <div className="mt-12 text-center">
          <div className="inline-block bg-white rounded-3xl px-8 py-6 shadow-xl border-2 border-amber-100">
            <p className="text-gray-700">
              <span className="font-bold text-amber-600">Máte další otázky?</span> Neváhejte nás kontaktovat!
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

