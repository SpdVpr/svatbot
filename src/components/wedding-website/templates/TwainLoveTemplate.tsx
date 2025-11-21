'use client'

import { WeddingWebsite, SectionType } from '@/types/wedding-website'
import ScrollAnimations from '../ScrollAnimations'
import Navigation from './twain-love/Navigation'
import HeroSection from './twain-love/HeroSection'
import CountdownSection from './twain-love/CountdownSection'
import CoupleSection from './twain-love/CoupleSection'
import StorySection from './twain-love/StorySection'
import LocationSection from './twain-love/LocationSection'
import ScheduleSection from './twain-love/ScheduleSection'
import DressCodeSection from './twain-love/DressCodeSection'
import AccommodationSection from './twain-love/AccommodationSection'
import GallerySection from './twain-love/GallerySection'
import RSVPSection from './twain-love/RSVPSection'
import GiftSection from './twain-love/GiftSection'
import MenuSection from './twain-love/MenuSection'
import ContactSection from './twain-love/ContactSection'
import FAQSection from './twain-love/FAQSection'
import Footer from './twain-love/Footer'
import { useEffect } from 'react'

interface TwainLoveTemplateProps {
  website: WeddingWebsite
}

export default function TwainLoveTemplate({ website }: TwainLoveTemplateProps) {
  const { content } = website

  // Default section order
  const DEFAULT_SECTION_ORDER: SectionType[] = [
    'hero', 'story', 'info', 'schedule', 'dressCode', 'accommodation',
    'gallery', 'rsvp', 'gift', 'menu', 'contact', 'faq'
  ]

  const sectionOrder = content.sectionOrder || DEFAULT_SECTION_ORDER

  // Load fonts
  useEffect(() => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = '/fonts/twain-love/fonts.css'
    document.head.appendChild(link)

    return () => {
      document.head.removeChild(link)
    }
  }, [])

  // Render section based on type
  const renderSection = (sectionType: SectionType) => {
    switch (sectionType) {
      case 'hero':
        return (
          <div key="hero-section">
            <HeroSection content={content.hero} />
            {content.hero.weddingDate && (
              <CountdownSection weddingDate={content.hero.weddingDate} />
            )}
          </div>
        )

      case 'story':
        return content.story?.enabled ? (
          <div key="story-section">
            {(content.story.bride || content.story.groom) && (
              <CoupleSection
                content={content.story}
                heroContent={content.hero}
              />
            )}
            <StorySection content={content.story} />
          </div>
        ) : null

      case 'info':
        return content.info?.enabled ? (
          <LocationSection
            key="info"
            infoContent={content.info}
            scheduleContent={content.schedule}
          />
        ) : null

      case 'schedule':
        return content.schedule?.enabled ? (
          <ScheduleSection key="schedule" content={content.schedule} />
        ) : null

      case 'dressCode':
        return content.dressCode?.enabled ? (
          <DressCodeSection key="dressCode" content={content.dressCode} />
        ) : null

      case 'accommodation':
        return content.accommodation?.enabled ? (
          <AccommodationSection key="accommodation" content={content.accommodation} />
        ) : null

      case 'gallery':
        return content.gallery?.enabled ? (
          <GallerySection key="gallery" content={content.gallery} />
        ) : null

      case 'rsvp':
        return content.rsvp?.enabled ? (
          <RSVPSection key="rsvp" content={content.rsvp} websiteId={website.id} />
        ) : null

      case 'gift':
        return content.gift?.enabled ? (
          <GiftSection key="gift" content={content.gift} />
        ) : null

      case 'menu':
        return content.menu?.enabled ? (
          <MenuSection key="menu" content={content.menu} />
        ) : null

      case 'contact':
        return content.contact?.enabled ? (
          <ContactSection key="contact" content={content.contact} />
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
    <>
      <ScrollAnimations />
      <div className="min-h-screen bg-white" style={{ fontFamily: 'Muli, sans-serif' }}>
        {/* Navigation */}
        <Navigation
          bride={content.hero.bride}
          groom={content.hero.groom}
          content={content}
        />

        {/* Render sections in custom order */}
        {sectionOrder.map(sectionType => renderSection(sectionType))}

        {/* Footer */}
        <Footer
          bride={content.hero.bride}
          groom={content.hero.groom}
          weddingDate={content.hero.weddingDate}
        />
      </div>
    </>
  )
}

