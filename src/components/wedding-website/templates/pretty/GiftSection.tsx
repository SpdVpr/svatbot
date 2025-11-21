'use client'

import { GiftContent } from '@/types/wedding-website'
import SectionTitle from './SectionTitle'

interface GiftSectionProps {
  content: GiftContent
}

export default function GiftSection({ content }: GiftSectionProps) {
  if (!content.enabled) return null

  const hasRegistry = content.registry && content.registry.length > 0
  const hasBankAccount = !!content.bankAccount

  return (
    <section id="gift" className="py-20 relative" style={{ background: 'linear-gradient(to bottom, #faf8f3 0%, #f7f5f0 50%, #ffffff 100%)' }}>
      {/* Decorative Elements */}
      <div
        className="absolute right-0 top-1/2 -translate-y-1/2 w-32 h-32 opacity-15 hidden lg:block"
        style={{
          backgroundImage: 'url(/templates/pretty/images/rsvp-right-flower.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center'
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <SectionTitle
          title="Svatební dary"
          subtitle={content.message}
        />

        <div className="max-w-4xl mx-auto">
          {/* Bank Account */}
          {content.bankAccount && (
            <div className="p-8 rounded-lg shadow-lg mb-8" style={{ background: 'linear-gradient(135deg, #faf8f3 0%, #f5f1e8 100%)' }}>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
                Finanční dar
              </h3>
              <div className="bg-white p-6 rounded-lg">
                <p className="text-gray-600 mb-2">Číslo účtu:</p>
                <p className="text-2xl font-mono font-bold text-center" style={{ color: '#b19a56' }}>
                  {content.bankAccount}
                </p>
              </div>
            </div>
          )}

          {/* Registry Links */}
          {hasRegistry && content.registry && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {content.registry.map((item, index) => (
                <a
                  key={index}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow flex flex-col items-center justify-center text-center group"
                >
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors" style={{ backgroundColor: '#f5f1e8' }}>
                    <i className="flaticon-spring text-3xl" style={{ color: '#b19a56' }}></i>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800 transition-colors mb-2" style={{ color: '#333' }}>
                    {item.name}
                  </h4>
                  {item.description && (
                    <p className="text-sm text-gray-600">{item.description}</p>
                  )}
                </a>
              ))}
            </div>
          )}

          {/* Additional Notes */}
          {content.message && !hasBankAccount && !hasRegistry && (
            <div className="mt-8 text-center">
              <p className="text-gray-600 leading-relaxed">
                {content.message}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

