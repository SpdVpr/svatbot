'use client'

import type { GiftContent } from '@/types/wedding-website'

interface GiftSectionProps {
  content: GiftContent
}

export default function GiftSection({ content }: GiftSectionProps) {
  if (!content.enabled) return null

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-light text-gray-900 mb-4">
            Dary
          </h2>
          <div className="w-16 h-px bg-gray-900 mx-auto mb-8"></div>
        </div>

        <div className="text-center max-w-2xl mx-auto">
          <div className="text-6xl mb-6">🎁</div>
          <p className="text-gray-600 text-lg leading-relaxed">
            {content.message || 'Největším darem pro nás bude, když tento den oslavíte s námi. Pokud byste nás ale chtěli potěšit ještě trochu více, rádi uvítáme finanční příspěvek, který nám pomůže splnit naše společné sny.'}
          </p>
        </div>
      </div>
    </section>
  )
}

