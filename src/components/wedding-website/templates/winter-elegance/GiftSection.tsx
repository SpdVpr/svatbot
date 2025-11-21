'use client'

import { useColorTheme } from '../ColorThemeContext'
import { GiftContent } from '@/types/wedding-website'
import { Gift } from 'lucide-react'

interface GiftSectionProps {
  content: GiftContent
}

export default function GiftSection({ content }: GiftSectionProps) {
  const { theme } = useColorTheme()

  if (!content.enabled) return null

  return (
    <section id="gift" className="py-20 bg-stone-50">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-light text-stone-900 mb-6">
            Dary
          </h2>
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-stone-400 to-transparent mx-auto mb-8"></div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white rounded-2xl p-12 shadow-lg">
            <div className="mb-8">
              <Gift className="w-16 h-16 text-stone-400 mx-auto mb-6" />
            </div>
            <div className="text-xl text-stone-600 leading-relaxed space-y-4">
              {content.message ? (
                <p>{content.message}</p>
              ) : (
                <p>
                  Největším darem pro nás bude, když tento den oslavíte s námi. Pokud byste nás ale
                  chtěli potěšit ještě trochu více, rádi uvítáme finanční příspěvek, který nám pomůže
                  splnit naše společné sny.
                </p>
              )}
            </div>

            {/* Bank Account */}
            {content.bankAccount && (
              <div className="mt-8 p-6 bg-stone-50 rounded-xl">
                <p className="text-sm text-stone-500 mb-2">Číslo účtu:</p>
                <p className="text-lg font-mono text-stone-900">{content.bankAccount}</p>
              </div>
            )}

            {/* Registry Links */}
            {content.registry && content.registry.length > 0 && (
              <div className="mt-8 space-y-4">
                <p className="text-sm text-stone-500 mb-4">Nebo si můžete vybrat z našeho seznamu přání:</p>
                {content.registry.map((item, index) => (
                  <a
                    key={index}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 bg-stone-50 hover:bg-stone-100 rounded-xl transition-colors"
                  >
                    <p className="font-medium text-stone-900">{item.name}</p>
                    {item.description && (
                      <p className="text-sm text-stone-600 mt-1">{item.description}</p>
                    )}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

