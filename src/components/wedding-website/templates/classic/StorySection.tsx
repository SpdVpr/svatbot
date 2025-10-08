'use client'

import { Heart } from 'lucide-react'
import type { StoryContent } from '@/types/wedding-website'

interface StorySectionProps {
  content: StoryContent
}

export default function StorySection({ content }: StorySectionProps) {
  return (
    <section className="py-20 bg-gradient-to-br from-rose-50 to-amber-50">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 font-serif">
            {content.title || 'Snoubenci a jejich příběh'}
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-amber-400 to-rose-400 mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">
            {content.subtitle || 'Poznejte nás a náš příběh lásky'}
          </p>
        </div>

        {/* Medailonky snoubců */}
        {(content.bride || content.groom) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 max-w-4xl mx-auto">
            {/* Nevěsta */}
            {content.bride && (
              <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
                {content.bride.image && (
                  <div className="w-40 h-40 mx-auto mb-6 rounded-full overflow-hidden border-4 border-rose-200">
                    <img
                      src={content.bride.image}
                      alt={content.bride.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <h3 className="text-2xl font-bold text-gray-900 mb-2 font-serif">
                  {content.bride.name}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {content.bride.description}
                </p>
              </div>
            )}

            {/* Ženich */}
            {content.groom && (
              <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
                {content.groom.image && (
                  <div className="w-40 h-40 mx-auto mb-6 rounded-full overflow-hidden border-4 border-amber-200">
                    <img
                      src={content.groom.image}
                      alt={content.groom.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <h3 className="text-2xl font-bold text-gray-900 mb-2 font-serif">
                  {content.groom.name}
                </h3>
                <p className="text-gray-600 leading-relaxed">
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
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-rose-100 to-amber-100">
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
