'use client'

import { FAQContent } from '@/types/wedding-website'
import { Plus, Minus } from 'lucide-react'
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
    <section id="faq" className="py-32 bg-[#FCFBF9]">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-serif text-5xl md:text-6xl text-[#2C362B] mb-4">Časté otázky</h2>
          <p className="text-[#1A1C1A]/60 text-lg">Vše, co potřebujete vědět</p>
        </div>

        <div className="space-y-4">
          {content.items.map((item, index) => (
            <div
              key={index}
              className="bg-white border border-[#2C362B]/10 rounded-lg overflow-hidden transition-all duration-300 hover:border-[#C5A880]/50"
            >
              <button
                onClick={() => toggleQuestion(index)}
                className="w-full flex items-center justify-between p-6 text-left"
              >
                <h3 className="font-serif text-xl text-[#2C362B] pr-4">
                  {item.question}
                </h3>
                <div className={`w-8 h-8 rounded-full border border-[#2C362B]/20 flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                  openIndex === index ? 'bg-[#C5A880] border-[#C5A880] rotate-180' : 'bg-transparent'
                }`}>
                  {openIndex === index ? (
                    <Minus className="w-4 h-4 text-white" />
                  ) : (
                    <Plus className="w-4 h-4 text-[#2C362B]" />
                  )}
                </div>
              </button>

              <div
                className={`grid transition-all duration-300 ${
                  openIndex === index ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                }`}
              >
                <div className="overflow-hidden">
                  <div className="px-6 pb-6 text-[#1A1C1A]/70 leading-relaxed">
                    {item.answer}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

