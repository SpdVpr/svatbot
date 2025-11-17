'use client'

import { Calendar, MapPin, Clock, Users, Mail, Phone } from 'lucide-react'
import type { WeddingWebsite, SectionType } from '@/types/wedding-website'
import { ColorThemeProvider } from './ColorThemeContext'
import ScrollAnimations from '../ScrollAnimations'
import Navigation from './classic/Navigation'
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
  const { content, style } = website
  const colorTheme = style?.colorTheme || 'default'
  const customTheme = style?.customColors

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
          <div id="story" key="story">
            <StorySection content={content.story} />
          </div>
        ) : null

      case 'info':
        return content.info.enabled ? (
          <div id="info" key="info">
            <InfoSection content={content.info} />
          </div>
        ) : null

      case 'dressCode':
        return content.dressCode?.enabled ? (
          <div id="dressCode" key="dressCode">
            <DressCodeSection content={content.dressCode} />
          </div>
        ) : null

      case 'schedule':
        return content.schedule.enabled ? (
          <div id="schedule" key="schedule">
            <ScheduleSection content={content.schedule} />
          </div>
        ) : null

      case 'rsvp':
        return content.rsvp.enabled ? (
          <div id="rsvp" key="rsvp">
            <RSVPSection
              content={content.rsvp}
              websiteId={website.id}
              weddingId={website.weddingId}
            />
          </div>
        ) : null

      case 'accommodation':
        return content.accommodation?.enabled ? (
          <div id="accommodation" key="accommodation">
            <AccommodationSection content={content.accommodation} />
          </div>
        ) : null

      case 'gift':
        return content.gift?.enabled ? (
          <div id="gift" key="gift">
            <GiftSection content={content.gift} />
          </div>
        ) : null

      case 'gallery':
        return content.gallery?.enabled ? (
          <div id="gallery" key="gallery">
            <GallerySection content={content.gallery} />
          </div>
        ) : null

      case 'menu':
        return content.menu?.enabled ? (
          <div id="menu" key="menu">
            <MenuSection content={content.menu} />
          </div>
        ) : null

      case 'contact':
        return content.contact?.enabled ? (
          <div id="contact" key="contact">
            <ContactSection content={content.contact} heroContent={content.hero} />
          </div>
        ) : null

      case 'faq':
        return content.faq?.enabled ? (
          <div id="faq" key="faq">
            <FAQSection content={content.faq} />
          </div>
        ) : null

      default:
        return null
    }
  }

  return (
    <ColorThemeProvider themeName={colorTheme} customTheme={customTheme}>
      <ScrollAnimations />
      <div className="min-h-screen bg-white">
        {/* Navigation */}
        <Navigation content={content} />

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
    </ColorThemeProvider>
  )
}
