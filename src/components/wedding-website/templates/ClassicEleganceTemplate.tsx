'use client'

import { Calendar, MapPin, Clock, Users, Mail, Phone } from 'lucide-react'
import type { WeddingWebsite } from '@/types/wedding-website'
import HeroSection from './classic/HeroSection'
import InfoSection from './classic/InfoSection'
import RSVPSection from './classic/RSVPSection'
import StorySection from './classic/StorySection'
import ScheduleSection from './classic/ScheduleSection'
import GallerySection from './classic/GallerySection'
import { Timestamp } from 'firebase/firestore'

// Helper funkce pro formátování data
const formatDate = (date: any): string => {
  if (!date) return ''

  let dateObj: Date

  if (date instanceof Date) {
    dateObj = date
  } else if (date instanceof Timestamp) {
    dateObj = date.toDate()
  } else if (typeof date === 'string') {
    dateObj = new Date(date)
  } else if (date.seconds) {
    // Firestore Timestamp object
    dateObj = new Date(date.seconds * 1000)
  } else {
    return ''
  }

  return dateObj.toLocaleDateString('cs-CZ', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

interface ClassicEleganceTemplateProps {
  website: WeddingWebsite
}

export default function ClassicEleganceTemplate({ website }: ClassicEleganceTemplateProps) {
  const { content } = website

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-rose-50">
      {/* Hero Section - Always visible */}
      <HeroSection content={content.hero} />

      {/* Story Section */}
      {content.story.enabled && (
        <StorySection content={content.story} />
      )}

      {/* Info Section */}
      {content.info.enabled && (
        <InfoSection content={content.info} />
      )}

      {/* Schedule Section */}
      {content.schedule.enabled && (
        <ScheduleSection content={content.schedule} />
      )}

      {/* RSVP Section */}
      {content.rsvp.enabled && (
        <RSVPSection 
          content={content.rsvp} 
          websiteId={website.id}
          weddingId={website.weddingId}
        />
      )}

      {/* Accommodation Section */}
      {content.accommodation?.enabled && (
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4 font-serif">
                Ubytování
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-amber-400 to-rose-400 mx-auto"></div>
            </div>
            
            <div className="text-center">
              <div className="text-6xl mb-4">🏨</div>
              <p className="text-gray-600">
                Informace o ubytování budou brzy k dispozici.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Gift Section */}
      {content.gift?.enabled && (
        <section className="py-20 bg-gradient-to-br from-rose-50 to-amber-50">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4 font-serif">
                Svatební dary
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-amber-400 to-rose-400 mx-auto"></div>
            </div>
            
            <div className="text-center">
              <div className="text-6xl mb-4">🎁</div>
              <p className="text-gray-600">
                Informace o darech budou brzy k dispozici.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Gallery Section */}
      {content.gallery?.enabled && (
        <GallerySection content={content.gallery} />
      )}

      {/* Contact Section */}
      {content.contact?.enabled && (
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
                    {content.hero.bride}
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
                    {content.hero.groom}
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
      )}

      {/* FAQ Section */}
      {content.faq?.enabled && (
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4 font-serif">
                Často kladené otázky
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-amber-400 to-rose-400 mx-auto"></div>
            </div>
            
            <div className="text-center">
              <div className="text-6xl mb-4">❓</div>
              <p className="text-gray-600">
                FAQ sekce bude brzy k dispozici.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="mb-6">
            <h3 className="text-2xl font-bold mb-2 font-serif">
              {content.hero.bride} & {content.hero.groom}
            </h3>
            {content.hero.weddingDate && (
              <p className="text-gray-300">
                {formatDate(content.hero.weddingDate)}
              </p>
            )}
          </div>
          
          <div className="border-t border-gray-700 pt-6">
            <p className="text-gray-400 text-sm">
              Vytvořeno s ❤️ pomocí SvatBot.cz
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
