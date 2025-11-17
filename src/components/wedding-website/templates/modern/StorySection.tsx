'use client'

import type { StoryContent } from '@/types/wedding-website'
import Image from 'next/image'

interface StorySectionProps {
  content: StoryContent
  heroContent: { bride: string; groom: string }
}

export default function StorySection({ content, heroContent }: StorySectionProps) {
  if (!content.enabled) return null

  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-light text-gray-900 mb-4">
            Snoubenci
          </h2>
          <div className="w-16 h-px bg-gray-900 mx-auto mb-8"></div>
          {content.description && (
            <p className="text-gray-600 max-w-3xl mx-auto text-lg leading-relaxed">
              {content.description}
            </p>
          )}
        </div>

        {/* Couple Photos with Heart */}
        <div className="flex items-center justify-center gap-8 md:gap-16 mb-16 flex-wrap">
          {/* Nevěsta */}
          <div className="text-center">
            <div className="w-64 h-64 md:w-80 md:h-80 rounded-full bg-gray-100 overflow-hidden mb-6 shadow-xl">
              {content.bride?.image ? (
                <img
                  src={content.bride.image}
                  alt={heroContent.bride}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl">
                  👰
                </div>
              )}
            </div>
            <h3 className="text-3xl font-light text-gray-900 mb-2 uppercase tracking-wider">
              {heroContent.bride}
            </h3>
            {content.bride?.description && (
              <p className="text-gray-600 leading-relaxed max-w-xs mx-auto">
                {content.bride.description}
              </p>
            )}
          </div>

          {/* Heart Icon */}
          <div className="flex items-center justify-center">
            <div className="relative w-24 h-24 md:w-32 md:h-32">
              <Image
                src="/hearth.png"
                alt="Heart"
                fill
                className="object-contain"
                style={{ filter: 'hue-rotate(0deg) saturate(0.8)' }}
              />
            </div>
          </div>

          {/* Ženich */}
          <div className="text-center">
            <div className="w-64 h-64 md:w-80 md:h-80 rounded-full bg-gray-100 overflow-hidden mb-6 shadow-xl">
              {content.groom?.image ? (
                <img
                  src={content.groom.image}
                  alt={heroContent.groom}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl">
                  🤵
                </div>
              )}
            </div>
            <h3 className="text-3xl font-light text-gray-900 mb-2 uppercase tracking-wider">
              {heroContent.groom}
            </h3>
            {content.groom?.description && (
              <p className="text-gray-600 leading-relaxed max-w-xs mx-auto">
                {content.groom.description}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

