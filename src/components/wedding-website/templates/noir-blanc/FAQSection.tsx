'use client'

import React from 'react'
import { Section } from './Section'
import { Heading } from './Typography'
import { FAQContent } from '@/types/wedding-website'

interface FAQSectionProps {
  content: FAQContent
}

export default function FAQSection({ content }: FAQSectionProps) {
  if (!content.enabled || !content.items || content.items.length === 0) return null

  return (
    <Section id="faq" className="bg-white">
      <Heading className="text-center mb-12">Časté Dotazy</Heading>
      <div className="max-w-3xl mx-auto border-t border-black">
        {content.items.map((faq, index) => (
          <details key={index} className="group border-b border-black cursor-pointer">
            <summary className="flex justify-between items-center py-6 px-4 list-none hover:bg-[#f2f0ea] transition-colors">
              <span className="font-serif text-xl md:text-2xl">{faq.question}</span>
              <span className="text-2xl transform group-open:rotate-45 transition-transform duration-300">+</span>
            </summary>
            <div className="px-4 pb-8 pt-2">
              <p className="font-light opacity-80 leading-relaxed">{faq.answer}</p>
            </div>
          </details>
        ))}
      </div>
    </Section>
  )
}

