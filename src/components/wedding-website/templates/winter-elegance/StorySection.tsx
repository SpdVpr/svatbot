'use client'

import { useColorTheme } from '../ColorThemeContext'
import { StoryContent } from '@/types/wedding-website'
import Image from 'next/image'

interface StorySectionProps {
  content: StoryContent
}

export default function StorySection({ content }: StorySectionProps) {
  const { theme } = useColorTheme()

  if (!content.enabled) return null

  return (
    <section id="story" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-light text-stone-900 mb-6">
            {content.title || 'Náš příběh'}
          </h2>
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-stone-400 to-transparent mx-auto mb-8"></div>
          {content.subtitle && (
            <p className="text-xl text-stone-600 leading-relaxed max-w-3xl mx-auto">
              {content.subtitle}
            </p>
          )}
        </div>

        {/* Couple Photos with Heart */}
        {(content.bride || content.groom) && (
          <div className="flex items-center justify-center gap-8 md:gap-16 mb-16 flex-wrap">
            {/* Bride */}
            {content.bride && (
              <div className="text-center">
                {content.bride.image && (
                  <div className="w-64 h-64 md:w-80 md:h-80 mx-auto mb-6 rounded-full overflow-hidden shadow-2xl border-4 border-stone-200">
                    <img
                      src={content.bride.image}
                      alt={content.bride.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <h3 className="text-3xl md:text-4xl font-serif font-light text-stone-900 mb-3 uppercase tracking-widest">
                  {content.bride.name}
                </h3>
                <p className="text-stone-600 leading-relaxed max-w-xs mx-auto">
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
                  style={{ filter: 'grayscale(100%) brightness(0.6)' }}
                />
              </div>
            </div>

            {/* Groom */}
            {content.groom && (
              <div className="text-center">
                {content.groom.image && (
                  <div className="w-64 h-64 md:w-80 md:h-80 mx-auto mb-6 rounded-full overflow-hidden shadow-2xl border-4 border-stone-200">
                    <img
                      src={content.groom.image}
                      alt={content.groom.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <h3 className="text-3xl md:text-4xl font-serif font-light text-stone-900 mb-3 uppercase tracking-widest">
                  {content.groom.name}
                </h3>
                <p className="text-stone-600 leading-relaxed max-w-xs mx-auto">
                  {content.groom.description}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Timeline with photos */}
        {content.timeline && content.timeline.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-16">
            {content.timeline.map((item, index) => (
              <div
                key={item.id}
                className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {/* Image */}
                {item.image && (
                  <div className="aspect-square relative">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300"></div>

                {/* Caption */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-4 text-center">
                  <p className="text-white text-sm font-semibold">{item.title}</p>
                  {item.date && (
                    <p className="text-white/70 text-xs mt-1">{item.date}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Description */}
        {content.description && (
          <div className="text-center mt-12">
            <p className="text-stone-500 italic text-lg">
              {content.description}
            </p>
          </div>
        )}

        {/* How we met & Proposal */}
        {(content.howWeMet || content.proposal) && (
          <div className="mt-16 space-y-12">
            {content.howWeMet && (
              <div className="bg-stone-50 rounded-3xl p-8 md:p-12">
                <h3 className="text-2xl font-serif font-light text-stone-900 mb-4 text-center">
                  {content.howWeMet.title}
                </h3>
                <p className="text-stone-600 leading-relaxed text-center max-w-3xl mx-auto">
                  {content.howWeMet.text}
                </p>
                {content.howWeMet.date && (
                  <p className="text-stone-400 text-sm text-center mt-4">
                    {new Date(content.howWeMet.date).toLocaleDateString('cs-CZ')}
                  </p>
                )}
              </div>
            )}

            {content.proposal && (
              <div className="bg-stone-50 rounded-3xl p-8 md:p-12">
                <h3 className="text-2xl font-serif font-light text-stone-900 mb-4 text-center">
                  {content.proposal.title}
                </h3>
                <p className="text-stone-600 leading-relaxed text-center max-w-3xl mx-auto">
                  {content.proposal.text}
                </p>
                {content.proposal.date && (
                  <p className="text-stone-400 text-sm text-center mt-4">
                    {new Date(content.proposal.date).toLocaleDateString('cs-CZ')}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

