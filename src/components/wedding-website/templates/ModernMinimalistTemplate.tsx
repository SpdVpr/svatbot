'use client'

import type { WeddingWebsite, SectionType } from '@/types/wedding-website'
import ScrollAnimations from '../ScrollAnimations'
import ModernHeroSection from './modern/HeroSection'
import ModernInfoSection from './modern/InfoSection'
import ModernDressCodeSection from './modern/DressCodeSection'
import ModernRSVPSection from './modern/RSVPSection'
import ModernStorySection from './modern/StorySection'
import ModernScheduleSection from './modern/ScheduleSection'
import ModernGallerySection from './modern/GallerySection'
import ModernGiftSection from './modern/GiftSection'
import ModernContactSection from './modern/ContactSection'
import AccommodationSection from './modern/AccommodationSection'
import FAQSection from './modern/FAQSection'
import MenuSection from './modern/MenuSection'
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

  // Default section order if not specified
  const DEFAULT_SECTION_ORDER: SectionType[] = [
    'hero', 'story', 'info', 'dressCode', 'schedule', 'rsvp',
    'accommodation', 'gift', 'gallery', 'contact', 'faq', 'menu'
  ]

  const sectionOrder = content.sectionOrder || DEFAULT_SECTION_ORDER

  // Render section based on type
  const renderSection = (sectionType: SectionType) => {
    switch (sectionType) {
      case 'hero':
        return <ModernHeroSection key="hero" content={content.hero} />

      case 'story':
        return content.story.enabled ? (
          <ModernStorySection key="story" content={content.story} heroContent={content.hero} />
        ) : null

      case 'info':
        return content.info.enabled ? (
          <ModernInfoSection key="info" content={content.info} />
        ) : null

      case 'dressCode':
        return content.dressCode?.enabled ? (
          <ModernDressCodeSection key="dressCode" content={content.dressCode} />
        ) : null

      case 'schedule':
        return content.schedule.enabled ? (
          <ModernScheduleSection key="schedule" content={content.schedule} />
        ) : null

      case 'rsvp':
        return content.rsvp.enabled ? (
          <ModernRSVPSection
            key="rsvp"
            content={content.rsvp}
            websiteId={website.id}
            weddingId={website.weddingId}
          />
        ) : null

      case 'accommodation':
        return content.accommodation?.enabled ? (
          <AccommodationSection key="accommodation" content={content.accommodation} />
        ) : null

      case 'gift':
        return content.gift?.enabled ? (
          <ModernGiftSection key="gift" content={content.gift} />
        ) : null

      case 'gallery':
        return content.gallery?.enabled ? (
          <ModernGallerySection key="gallery" content={content.gallery} />
        ) : null

      case 'menu':
        return content.menu?.enabled ? (
          <MenuSection key="menu" content={content.menu} />
        ) : null

      case 'contact':
        return content.contact?.enabled ? (
          <ModernContactSection key="contact" content={content.contact} heroContent={content.hero} />
        ) : null

      case 'faq':
        return content.faq?.enabled ? (
          <FAQSection key="faq" content={content.faq} />
        ) : null

      default:
        return null
    }
  }

  // Získání iniciál
  const getInitials = () => {
    const brideInitial = content.hero.bride?.charAt(0) || 'N'
    const groomInitial = content.hero.groom?.charAt(0) || 'N'
    return `${brideInitial}${groomInitial}`
  }

  return (
    <>
      <ScrollAnimations />
      <div className="min-h-screen bg-white">
        {/* Render sections in custom order */}
        {sectionOrder.map(sectionType => renderSection(sectionType))}


      {/* Footer */}
      <footer className="bg-gray-900 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="mb-12">
            <div className="text-5xl font-light mb-4">
              {getInitials()}
            </div>
            <h3 className="text-3xl font-light mb-4">
              {content.hero.bride} & {content.hero.groom}
            </h3>
            {content.hero.weddingDate && (
              <p className="text-gray-400 text-lg">
                {formatDate(content.hero.weddingDate)} • {content.info?.ceremony?.venue || 'Místo konání'}
              </p>
            )}
          </div>

          <div className="border-t border-gray-700 pt-8">
            <p className="text-gray-500 text-sm">
              Vytvořeno s ❤️ pomocí SvatBot.cz
            </p>
          </div>
        </div>
      </footer>
      </div>
    </>
  )
}
