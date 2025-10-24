'use client'

import type { StoryContent } from '@/types/wedding-website'

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mt-16">
          {/* Nevěsta */}
          <div className="text-center">
            <div className="mb-8">
              <div className="w-48 h-48 mx-auto rounded-full bg-gray-100 overflow-hidden mb-6">
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
              <h3 className="text-3xl font-light text-gray-900 mb-4">
                {heroContent.bride}
              </h3>
            </div>
            {content.bride?.description && (
              <p className="text-gray-600 leading-relaxed text-left">
                {content.bride.description}
              </p>
            )}
          </div>

          {/* Ženich */}
          <div className="text-center">
            <div className="mb-8">
              <div className="w-48 h-48 mx-auto rounded-full bg-gray-100 overflow-hidden mb-6">
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
              <h3 className="text-3xl font-light text-gray-900 mb-4">
                {heroContent.groom}
              </h3>
            </div>
            {content.groom?.description && (
              <p className="text-gray-600 leading-relaxed text-left">
                {content.groom.description}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

