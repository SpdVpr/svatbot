'use client'

import React from 'react'
import { Section } from './Section'
import { Heading, SubHeading, Paragraph } from './Typography'
import { GiftContent } from '@/types/wedding-website'
import { Gift } from 'lucide-react'

interface GiftSectionProps {
  content: GiftContent
}

export default function GiftSection({ content }: GiftSectionProps) {
  if (!content.enabled) return null

  return (
    <section id="gift" className="relative w-full text-black border-b border-black text-center" style={{ backgroundColor: '#f2f0ea' }}>
      <div className="px-4 py-20 md:py-32 md:px-12 max-w-[1800px] mx-auto">
        <div className="max-w-3xl mx-auto">
        <Gift className="w-12 h-12 mx-auto mb-8 opacity-50" />
        <Heading>Svatební Dary</Heading>
        {content.message && (
          <Paragraph className="mb-12">{content.message}</Paragraph>
        )}

        {/* Bank Account - Hero */}
        {content.bankAccount && (
          <div className="bg-white border border-black p-12 mb-16 relative overflow-hidden group">
            <div className="relative z-10">
              <p className="font-sans text-sm uppercase tracking-widest mb-4 text-black/50">Číslo účtu pro příspěvky</p>
              <p className="font-mono text-3xl md:text-5xl tracking-tighter select-all">{content.bankAccount}</p>
            </div>
          </div>
        )}

        {/* Registry List */}
        {content.registry && content.registry.length > 0 && (
          <div className="text-left max-w-2xl mx-auto">
            <h4 className="font-serif text-2xl mb-6 border-b border-black pb-2">Seznam přání</h4>
            <ul className="space-y-4">
              {content.registry.map((item, index) => (
                <li key={index} className="flex justify-between items-center group">
                  <div>
                    <span className="font-serif text-lg">{item.name}</span>
                    {item.description && (
                      <p className="text-sm text-black/60">{item.description}</p>
                    )}
                  </div>
                  {item.url && (
                    <a 
                      href={item.url} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs uppercase border border-black px-3 py-1 hover:bg-black hover:text-white transition-colors"
                    >
                      Zobrazit
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      </div>
    </section>
  )
}

