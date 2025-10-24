'use client'

import { Calendar, MapPin, Clock, Users, Mail, Phone } from 'lucide-react'
import type { WeddingWebsite, SectionType } from '@/types/wedding-website'
import HeroSection from './classic/HeroSection'
import InfoSection from './classic/InfoSection'
import DressCodeSection from './classic/DressCodeSection'
import RSVPSection from './classic/RSVPSection'
import StorySection from './classic/StorySection'
import ScheduleSection from './classic/ScheduleSection'
import GallerySection from './classic/GallerySection'
import AccommodationSection from './classic/AccommodationSection'
import FAQSection from './classic/FAQSection'
import MenuSection from './classic/MenuSection'
import GiftSection from './classic/GiftSection'
import ContactSection from './classic/ContactSection'
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
        return <HeroSection key="hero" content={content.hero} />

      case 'story':
        return content.story.enabled ? (
          <StorySection key="story" content={content.story} />
        ) : null

      case 'info':
        return content.info.enabled ? (
          <InfoSection key="info" content={content.info} />
        ) : null

      case 'dressCode':
        return content.dressCode?.enabled ? (
          <DressCodeSection key="dressCode" content={content.dressCode} />
        ) : null

      case 'schedule':
        return content.schedule.enabled ? (
          <ScheduleSection key="schedule" content={content.schedule} />
        ) : null

      case 'rsvp':
        return content.rsvp.enabled ? (
          <RSVPSection
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
          <GiftSection key="gift" content={content.gift} />
        ) : null

      case 'gallery':
        return content.gallery?.enabled ? (
          <GallerySection key="gallery" content={content.gallery} />
        ) : null

      case 'menu':
        return content.menu?.enabled ? (
          <MenuSection key="menu" content={content.menu} />
        ) : null

      case 'contact':
        return content.contact?.enabled ? (
          <ContactSection key="contact" content={content.contact} heroContent={content.hero} />
        ) : null

      case 'faq':
        return content.faq?.enabled ? (
          <FAQSection key="faq" content={content.faq} />
        ) : null

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-rose-50">
      {/* Render sections in custom order */}
      {sectionOrder.map(sectionType => renderSection(sectionType))}

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
