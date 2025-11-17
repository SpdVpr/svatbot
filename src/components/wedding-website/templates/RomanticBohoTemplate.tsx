'use client'

import ScrollAnimations from '../ScrollAnimations'
import { WeddingWebsite } from '@/types/wedding-website'
import HeroSection from './romantic-boho/HeroSection'
import StorySection from './romantic-boho/StorySection'
import InfoSection from './romantic-boho/InfoSection'
import DressCodeSection from './romantic-boho/DressCodeSection'
import ScheduleSection from './romantic-boho/ScheduleSection'
import RSVPSection from './romantic-boho/RSVPSection'
import AccommodationSection from './romantic-boho/AccommodationSection'
import GiftSection from './romantic-boho/GiftSection'
import GallerySection from './romantic-boho/GallerySection'
import ContactSection from './romantic-boho/ContactSection'
import FAQSection from './romantic-boho/FAQSection'
import MenuSection from './romantic-boho/MenuSection'

interface RomanticBohoTemplateProps {
  website: WeddingWebsite
}

export default function RomanticBohoTemplate({ website }: RomanticBohoTemplateProps) {
  const { content, style } = website

  // Default section order if not specified
  const defaultOrder: Array<keyof typeof content> = [
    'hero',
    'story',
    'info',
    'dressCode',
    'schedule',
    'menu',
    'rsvp',
    'accommodation',
    'gift',
    'gallery',
    'contact',
    'faq'
  ]

  const sectionOrder = content.sectionOrder || defaultOrder

  const renderSection = (sectionKey: string) => {
    switch (sectionKey) {
      case 'hero':
        return <HeroSection key="hero" content={content.hero} style={style} />

      case 'story':
        return content.story.enabled ? (
          <StorySection key="story" content={content.story} />
        ) : null

      case 'info':
        return content.info.enabled ? (
          <InfoSection key="info" content={content.info} />
        ) : null

      case 'dressCode':
        return content.dressCode.enabled ? (
          <DressCodeSection key="dressCode" content={content.dressCode} />
        ) : null

      case 'schedule':
        return content.schedule.enabled ? (
          <ScheduleSection key="schedule" content={content.schedule} />
        ) : null

      case 'menu':
        return content.menu.enabled ? (
          <MenuSection key="menu" content={content.menu} />
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
        return content.accommodation.enabled ? (
          <AccommodationSection key="accommodation" content={content.accommodation} />
        ) : null

      case 'gift':
        return content.gift.enabled ? (
          <GiftSection key="gift" content={content.gift} />
        ) : null

      case 'gallery':
        return content.gallery.enabled ? (
          <GallerySection key="gallery" content={content.gallery} />
        ) : null

      case 'contact':
        return content.contact.enabled ? (
          <ContactSection key="contact" content={content.contact} heroContent={content.hero} />
        ) : null

      case 'faq':
        return content.faq.enabled ? (
          <FAQSection key="faq" content={content.faq} />
        ) : null

      default:
        return null
    }
  }

  return (
    <>
      <ScrollAnimations />
      <div className="min-h-screen bg-gradient-to-b from-rose-50 via-pink-50 to-amber-50">
      {/* Decorative floral background pattern */}
      <div 
        className="fixed inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4a574' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      
      <div className="relative z-10">
        {sectionOrder.map((sectionKey) => renderSection(sectionKey))}
      </div>

      {/* Footer */}
      <footer className="relative z-10 bg-gradient-to-r from-rose-100 to-amber-100 py-8 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <p className="text-rose-800 font-light">
            Vytvořeno s láskou na svatbot.cz
          </p>
        </div>
      </footer>
      </div>
    </>
  )
}
