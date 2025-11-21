'use client'

import { GiftContent } from '@/types/wedding-website'
import SectionTitle from './SectionTitle'
import { Gift, CreditCard, Home } from 'lucide-react'

interface GiftSectionProps {
  content: GiftContent
}

export default function GiftSection({ content }: GiftSectionProps) {
  if (!content.enabled) return null

  const hasRegistry = content.registry && content.registry.length > 0

  return (
    <div id="gift" className="py-20 bg-gray-50">
      <SectionTitle title="Dary" />

      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {content.message && (
            <p className="text-center text-gray-600 mb-12" style={{ fontFamily: 'Muli, sans-serif' }}>
              {content.message}
            </p>
          )}

          <div className="flex flex-wrap justify-center gap-8">
            {/* Bank Account */}
            {content.bankAccount && (
              <div className="bg-white rounded-lg p-8 shadow-lg w-full md:w-[calc(50%-1rem)] max-w-md text-center">
                <div className="flex flex-col items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-[#b2c9d3] flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-light text-gray-800">
                    Bankovní účet
                  </h3>
                </div>
                <div className="space-y-2">
                  <div className="text-gray-600 text-sm">Číslo účtu:</div>
                  <div className="text-2xl font-light text-[#85aaba] font-mono">
                    {content.bankAccount}
                  </div>
                </div>
              </div>
            )}

            {/* Registry */}
            {hasRegistry && (
              <div className="bg-white rounded-lg p-8 shadow-lg w-full md:w-[calc(50%-1rem)] max-w-md text-center">
                <div className="flex flex-col items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-[#b2c9d3] flex items-center justify-center">
                    <Gift className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-light text-gray-800">
                    Seznam přání
                  </h3>
                </div>
                <div className="space-y-2">
                  {content.registry?.map((item, index) => (
                    <div key={index} className="text-gray-700">
                      {item.name}
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-[#85aaba] hover:underline text-sm"
                        >
                          Odkaz
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Custom message if no bank or registry */}
            {!content.bankAccount && !hasRegistry && (
              <div className="bg-white rounded-lg p-8 shadow-lg text-center w-full max-w-md">
                <div className="w-16 h-16 rounded-full bg-[#b2c9d3] flex items-center justify-center mx-auto mb-4">
                  <Home className="w-8 h-8 text-white" />
                </div>
                <p className="text-gray-600">
                  Vaše přítomnost je pro nás tím největším darem!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

