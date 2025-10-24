'use client'

import { Gift, CreditCard, ExternalLink } from 'lucide-react'
import type { GiftContent } from '@/types/wedding-website'

interface GiftSectionProps {
  content: GiftContent
}

export default function GiftSection({ content }: GiftSectionProps) {
  if (!content.enabled) return null

  return (
    <section className="relative py-24 bg-gradient-to-br from-amber-50 via-rose-50 to-pink-50 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10">
        <div className="absolute top-20 right-20 w-64 h-64 bg-rose-300 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-amber-300 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-rose-300 rounded-full blur-xl opacity-50 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-rose-100 to-amber-100 rounded-full p-5">
                <Gift className="w-10 h-10 text-rose-600" />
              </div>
            </div>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-gray-800 mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Svatební dary
          </h2>
        </div>

        {/* Message */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl border-2 border-rose-100 mb-8">
          <div className="text-center mb-8">
            <div className="text-6xl mb-6">🎁</div>
            <p className="text-gray-700 text-lg leading-relaxed">
              {content.message || 'Největším darem pro nás bude, když tento den oslavíte s námi. Pokud byste nás ale chtěli potěšit ještě trochu více, rádi uvítáme finanční příspěvek.'}
            </p>
          </div>

          {/* Bank account */}
          {content.bankAccount && (
            <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-6 border-2 border-rose-200">
              <div className="flex items-center justify-center gap-3 mb-4">
                <CreditCard className="w-6 h-6 text-rose-600" />
                <h3 className="text-xl font-bold text-gray-800" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Číslo účtu
                </h3>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-800 tracking-wide">{content.bankAccount}</p>
              </div>
            </div>
          )}
        </div>

        {/* Registry */}
        {content.registry && content.registry.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gray-800 text-center mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
              Seznam přání
            </h3>
            {content.registry.map((item, index) => (
              <a
                key={index}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-white rounded-2xl p-6 shadow-lg border-2 border-amber-100 hover:border-amber-300 hover:shadow-xl transition-all duration-300 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-gray-800 mb-1 group-hover:text-rose-600 transition-colors">
                      {item.name}
                    </h4>
                    {item.description && (
                      <p className="text-gray-600 text-sm">{item.description}</p>
                    )}
                  </div>
                  <ExternalLink className="w-5 h-5 text-amber-600 flex-shrink-0 ml-4 group-hover:scale-110 transition-transform" />
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

