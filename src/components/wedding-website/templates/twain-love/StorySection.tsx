'use client'

import { StoryContent } from '@/types/wedding-website'
import Image from 'next/image'
import SectionTitle from './SectionTitle'

interface StorySectionProps {
  content: StoryContent
}

export default function StorySection({ content }: StorySectionProps) {
  if (!content.enabled || !content.timeline || content.timeline.length === 0) {
    return null
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('cs-CZ', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  return (
    <div id="story" className="py-20 bg-gray-50">
      <SectionTitle title={content.title || 'Náš příběh'} />
      
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto space-y-0">
          {content.timeline.map((item, index) => {
            const isEven = index % 2 === 0
            
            return (
              <div key={item.id} className="grid md:grid-cols-2 gap-0">
                {/* Image - left for even, right for odd */}
                <div className={`${isEven ? 'md:order-1' : 'md:order-2'} ${isEven ? 'md:pr-0' : 'md:pl-0'}`}>
                  <div className="relative h-[400px] overflow-hidden">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#b2c9d3] to-[#85aaba] flex items-center justify-center">
                        <span className="text-6xl">{item.icon || '💕'}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Text - right for even, left for odd */}
                <div className={`${isEven ? 'md:order-2' : 'md:order-1'} flex items-center`}>
                  <div className={`p-12 ${isEven ? 'md:text-left' : 'md:text-right'}`}>
                    <h3 className="text-3xl font-light text-gray-800 mb-3">
                      {item.title}
                    </h3>
                    <span className="inline-block text-[#85aaba] text-sm uppercase tracking-wider mb-4">
                      {formatDate(item.date)}
                    </span>
                    <p className="text-gray-600 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

