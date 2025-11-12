'use client'

import { Mail, Phone } from 'lucide-react'
import type { ContactContent, HeroContent } from '@/types/wedding-website'

interface ContactSectionProps {
  content: ContactContent
  heroContent: HeroContent
}

export default function ContactSection({ content, heroContent }: ContactSectionProps) {
  if (!content.enabled) return null

  return (
    <section className="py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-light text-gray-900 mb-4">
            Kontakt
          </h2>
          <div className="w-12 h-px bg-gray-900 mx-auto"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <div className="text-2xl">👰</div>
            </div>
            <h3 className="text-xl font-light text-gray-900 mb-4">
              {heroContent.bride}
            </h3>
            <div className="space-y-2 text-gray-600">
              <div className="flex items-center justify-center gap-2">
                <Phone className="w-4 h-4" />
                <span>+420 123 456 789</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Mail className="w-4 h-4" />
                <span>info@svatbot.cz</span>
              </div>
            </div>
          </div>

          <div className="text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <div className="text-2xl">🤵</div>
            </div>
            <h3 className="text-xl font-light text-gray-900 mb-4">
              {heroContent.groom}
            </h3>
            <div className="space-y-2 text-gray-600">
              <div className="flex items-center justify-center gap-2">
                <Phone className="w-4 h-4" />
                <span>+420 987 654 321</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Mail className="w-4 h-4" />
                <span>info@svatbot.cz</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

