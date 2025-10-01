'use client'

import { Heart } from 'lucide-react'
import type { StoryContent } from '@/types/wedding-website'

interface StorySectionProps {
  content: StoryContent
}

export default function StorySection({ content }: StorySectionProps) {
  return (
    <section className="py-20 bg-gradient-to-br from-rose-50 to-amber-50">
      <div className="max-w-4xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 font-serif">
            Náš příběh
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-amber-400 to-rose-400 mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">
            Jak to všechno začalo...
          </p>
        </div>

        {/* Story Content - Placeholder */}
        <div className="bg-white rounded-2xl p-12 shadow-lg text-center">
          <Heart className="w-16 h-16 text-rose-400 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-gray-900 mb-4 font-serif">
            Příběh lásky
          </h3>
          <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
            Zde bude krásný příběh o tom, jak se snoubeneci poznali, 
            jejich první rande, zásnuby a cesta k oltáři.
          </p>
          
          {/* Timeline placeholder */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">👫</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">První setkání</h4>
              <p className="text-gray-600 text-sm">
                Kdy a kde se poznali
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💕</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">První rande</h4>
              <p className="text-gray-600 text-sm">
                Romantické začátky
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💍</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Zásnuby</h4>
              <p className="text-gray-600 text-sm">
                Nezapomenutelný moment
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
