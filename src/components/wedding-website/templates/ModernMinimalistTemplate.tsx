'use client'

import { Calendar, MapPin, Clock, Users, Mail, Phone } from 'lucide-react'
import type { WeddingWebsite } from '@/types/wedding-website'
import ModernHeroSection from './modern/HeroSection'
import ModernInfoSection from './modern/InfoSection'
import ModernRSVPSection from './modern/RSVPSection'
import AccommodationSection from './modern/AccommodationSection'
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

interface ModernMinimalistTemplateProps {
  website: WeddingWebsite
}

export default function ModernMinimalistTemplate({ website }: ModernMinimalistTemplateProps) {
  const { content } = website

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Always visible */}
      <ModernHeroSection content={content.hero} />

      {/* Story Section */}
      {content.story.enabled && (
        <section className="py-24 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-light text-gray-900 mb-4">
                {content.story.title || 'Náš příběh'}
              </h2>
              <div className="w-12 h-px bg-gray-900 mx-auto"></div>
            </div>

            <div className="text-center">
              <div className="text-4xl mb-4">💕</div>
              <p className="text-gray-600">
                {content.story.description || 'Jak to všechno začalo...'}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Info Section */}
      {content.info.enabled && (
        <ModernInfoSection content={content.info} />
      )}

      {/* Schedule Section */}
      {content.schedule.enabled && (
        <section className="py-24 bg-white">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-light text-gray-900 mb-4">
                Program svatby
              </h2>
              <div className="w-12 h-px bg-gray-900 mx-auto"></div>
            </div>

            {content.schedule.items && content.schedule.items.length > 0 ? (
              <div className="space-y-8">
                {content.schedule.items.map((item, index) => (
                  <div key={index} className="flex items-center gap-6">
                    <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">{item.icon}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <h3 className="text-xl font-light text-gray-900">{item.title}</h3>
                        <span className="bg-gray-100 px-3 py-1 rounded-full text-sm font-medium text-gray-700">
                          {item.time}
                        </span>
                      </div>
                      {item.description && (
                        <p className="text-gray-600">{item.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center">
                <div className="text-4xl mb-4">⏰</div>
                <p className="text-gray-600">
                  Program bude brzy k dispozici.
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* RSVP Section */}
      {content.rsvp.enabled && (
        <ModernRSVPSection 
          content={content.rsvp} 
          websiteId={website.id}
          weddingId={website.weddingId}
        />
      )}

      {/* Accommodation Section */}
      {content.accommodation?.enabled && (
        <AccommodationSection content={content.accommodation} />
      )}

      {/* Gift Section */}
      {content.gift?.enabled && (
        <section className="py-24 bg-white">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-light text-gray-900 mb-4">
                Svatební dary
              </h2>
              <div className="w-12 h-px bg-gray-900 mx-auto"></div>
            </div>
            
            <div className="text-center">
              <div className="text-4xl mb-4">🎁</div>
              <p className="text-gray-600">
                Informace o darech budou brzy k dispozici.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Gallery Section */}
      {content.gallery?.enabled && (
        <section className="py-24 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-light text-gray-900 mb-4">
                {content.gallery.title || 'Fotogalerie'}
              </h2>
              <div className="w-12 h-px bg-gray-900 mx-auto mb-8"></div>
              {content.gallery.subtitle && (
                <p className="text-gray-600 text-lg mb-4">{content.gallery.subtitle}</p>
              )}
              {content.gallery.description && (
                <p className="text-gray-700 max-w-3xl mx-auto">{content.gallery.description}</p>
              )}
            </div>

            {content.gallery.images && content.gallery.images.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {content.gallery.images.map((image) => (
                  <div key={image.id} className="group relative">
                    <div className="aspect-square bg-gray-100 overflow-hidden">
                      <img
                        src={image.thumbnailUrl || image.url}
                        alt={image.alt}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    {image.caption && (
                      <p className="text-center text-gray-600 text-sm mt-3 font-light">
                        {image.caption}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl">📸</span>
                </div>
                <h3 className="text-xl font-light text-gray-900 mb-4">
                  Fotky budou brzy k dispozici
                </h3>
                <p className="text-gray-600">
                  Těšte se na krásné fotky z našeho velkého dne!
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Contact Section */}
      {content.contact?.enabled && (
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

              <div className="text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <div className="text-2xl">🤵</div>
                </div>
                <h3 className="text-xl font-light text-gray-900 mb-4">
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
        </section>
      )}

      {/* FAQ Section */}
      {content.faq?.enabled && (
        <section className="py-24 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-light text-gray-900 mb-4">
                Často kladené otázky
              </h2>
              <div className="w-12 h-px bg-gray-900 mx-auto"></div>
            </div>
            
            <div className="text-center">
              <div className="text-4xl mb-4">❓</div>
              <p className="text-gray-600">
                FAQ sekce bude brzy k dispozici.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="mb-8">
            <h3 className="text-2xl font-light mb-2">
              {content.hero.bride} & {content.hero.groom}
            </h3>
            {content.hero.weddingDate && (
              <p className="text-gray-400">
                {formatDate(content.hero.weddingDate)}
              </p>
            )}
          </div>
          
          <div className="border-t border-gray-700 pt-8">
            <p className="text-gray-400 text-sm">
              Vytvořeno s ❤️ pomocí SvatBot.cz
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
