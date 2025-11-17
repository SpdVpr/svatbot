'use client'

import { Heart } from 'lucide-react'
import type { StoryContent } from '@/types/wedding-website'
import { useColorTheme } from '../ColorThemeContext'
import Image from 'next/image'

interface StorySectionProps {
  content: StoryContent
}

export default function StorySection({ content }: StorySectionProps) {
  const { theme, themeName } = useColorTheme()

  return (
    <section className="py-20" style={{ backgroundColor: themeName === 'default' ? '#ffffff' : theme.bgGradientFrom }}>
      <div className="max-w-6xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 font-serif">
            {content.title || 'Snoubenci a jejich příběh'}
          </h2>
          <div className="w-24 h-1 mx-auto mb-6" style={{ backgroundColor: theme.primary }}></div>
          <p className="text-gray-600 text-lg">
            {content.subtitle || 'Poznejte nás a náš příběh lásky'}
          </p>
        </div>

        {/* Couple Photos with Heart */}
        {(content.bride || content.groom) && (
          <div className="flex items-center justify-center gap-8 md:gap-16 mb-16 flex-wrap">
            {/* Nevěsta */}
            {content.bride && (
              <div className="text-center">
                {content.bride.image && (
                  <div className="w-64 h-64 md:w-80 md:h-80 mx-auto mb-6 rounded-full overflow-hidden shadow-xl" style={{ border: `4px solid ${theme.primary}` }}>
                    <img
                      src={content.bride.image}
                      alt={content.bride.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 font-serif uppercase tracking-wider">
                  {content.bride.name}
                </h3>
                <p className="text-gray-600 leading-relaxed max-w-xs mx-auto">
                  {content.bride.description}
                </p>
              </div>
            )}

            {/* Heart Icon */}
            <div className="flex items-center justify-center">
              <div className="relative w-24 h-24 md:w-32 md:h-32">
                <Image
                  src="/hearth.png"
                  alt="Heart"
                  fill
                  className="object-contain"
                  style={{
                    filter: `brightness(0) saturate(100%) invert(${theme.primary === '#000000' ? '0%' : '50%'})`,
                    opacity: 0.8
                  }}
                />
              </div>
            </div>

            {/* Ženich */}
            {content.groom && (
              <div className="text-center">
                {content.groom.image && (
                  <div className="w-64 h-64 md:w-80 md:h-80 mx-auto mb-6 rounded-full overflow-hidden shadow-xl" style={{ border: `4px solid ${theme.primary}` }}>
                    <img
                      src={content.groom.image}
                      alt={content.groom.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 font-serif uppercase tracking-wider">
                  {content.groom.name}
                </h3>
                <p className="text-gray-600 leading-relaxed max-w-xs mx-auto">
                  {content.groom.description}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Příběh lásky - Timeline */}
        {content.timeline && content.timeline.length > 0 && (
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg">
            <div className="text-center mb-12">
              <Heart className="w-12 h-12 text-rose-400 mx-auto mb-4" />
              <h3 className="text-3xl font-bold text-gray-900 mb-2 font-serif">
                Náš příběh lásky
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {content.timeline.map((item, index) => (
                <div key={item.id} className="text-center">
                  {/* Fotka nebo ikona */}
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden flex items-center justify-center" style={{ backgroundColor: themeName === 'default' ? '#fecdd3' : theme.bgGradientTo }}>
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl">{item.icon}</span>
                    )}
                  </div>

                  {item.date && (
                    <p className="text-sm text-amber-600 font-semibold mb-2">
                      {item.date}
                    </p>
                  )}

                  <h4 className="font-bold text-gray-900 mb-2 text-lg">
                    {item.title}
                  </h4>

                  <p className="text-gray-600 text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
