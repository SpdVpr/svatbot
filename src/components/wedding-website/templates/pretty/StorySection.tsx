'use client'

import { StoryContent } from '@/types/wedding-website'
import SectionTitle from './SectionTitle'

interface StorySectionProps {
  content: StoryContent
}

export default function StorySection({ content }: StorySectionProps) {
  if (!content.enabled) return null

  const defaultTimeline: Array<{ id?: string; date?: string; title: string; description: string; icon?: string; image?: string }> = [
    { title: 'First time we meet', description: 'Naše první setkání bylo kouzelné a nezapomenutelné.' },
    { title: 'First date', description: 'První rande bylo plné smíchu a krásných momentů.' },
    { title: 'Proposal', description: 'Okamžik, kdy jsme se rozhodli strávit spolu zbytek života.' },
    { title: 'Engagement', description: 'Začátek naší cesty k oltáři a společnému životu.' }
  ]

  const timeline = content.timeline && content.timeline.length > 0
    ? content.timeline
    : defaultTimeline

  return (
    <section 
      id="story" 
      className="py-20 relative"
      style={{
        backgroundImage: 'url(/templates/pretty/images/story-bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Decorative Flowers */}
      <div
        className="absolute left-0 top-1/2 -translate-y-1/2 w-32 h-64 opacity-70 hidden lg:block"
        style={{
          backgroundImage: 'url(/templates/pretty/images/story-left-flower.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center'
        }}
      />
      <div
        className="absolute right-0 top-1/2 -translate-y-1/2 w-32 h-64 opacity-70 hidden lg:block"
        style={{
          backgroundImage: 'url(/templates/pretty/images/story-right-flower.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center'
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <SectionTitle title={content.title || "Náš příběh"} subtitle={content.subtitle} />

        <div className="max-w-4xl mx-auto relative">
          {/* Center Ring Image */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 z-20 hidden md:block">
            <img 
              src="/templates/pretty/images/ring.png" 
              alt="Ring" 
              className="w-full h-full object-contain"
            />
          </div>

          {/* Timeline Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {timeline.map((item, index) => (
              <div
                key={index}
                className={`bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-lg ${
                  index % 2 === 0 ? 'md:text-right' : 'md:text-left'
                }`}
              >
                {/* Timeline Item Image */}
                {item.image && (
                  <div className="mb-4">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                )}
                <h3
                  className="text-2xl md:text-3xl mb-4"
                  style={{ fontFamily: 'Great Vibes, cursive', color: '#b19a56' }}
                >
                  {item.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {item.description}
                </p>
                {item.date && (
                  <p className="text-sm text-gray-500 mt-2 italic">
                    {item.date}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

