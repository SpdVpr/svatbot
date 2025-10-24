import { Phone, Mail } from 'lucide-react'
import type { ContactContent, HeroContent } from '@/types/wedding-website'

interface ContactSectionProps {
  content: ContactContent
  heroContent: HeroContent
}

export default function ContactSection({ content, heroContent }: ContactSectionProps) {
  if (!content.enabled) return null

  return (
    <section className="py-20 bg-gradient-to-br from-amber-50 to-rose-50">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 font-serif">
            Kontakt
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-amber-400 to-rose-400 mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="text-center">
            <div className="bg-white rounded-lg p-8 shadow-lg">
              <div className="text-4xl mb-4">👰</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 font-serif">
                {heroContent.bride}
              </h3>
              <div className="space-y-2 text-gray-600">
                <div className="flex items-center justify-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>+420 123 456 789</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>nevesta@example.com</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <div className="bg-white rounded-lg p-8 shadow-lg">
              <div className="text-4xl mb-4">🤵</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 font-serif">
                {heroContent.groom}
              </h3>
              <div className="space-y-2 text-gray-600">
                <div className="flex items-center justify-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>+420 987 654 321</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>zenich@example.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

