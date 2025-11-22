'use client'

import { WeddingWebsite, SectionType } from '@/types/wedding-website'
import ScrollAnimations from '../ScrollAnimations'
import Navigation from './noir-blanc/Navigation'
import HeroSection from './noir-blanc/HeroSection'
import { Marquee } from './noir-blanc/Marquee'
import StorySection from './noir-blanc/StorySection'
import LocationSection from './noir-blanc/LocationSection'
import ScheduleSection from './noir-blanc/ScheduleSection'
import DressCodeSection from './noir-blanc/DressCodeSection'
import AccommodationSection from './noir-blanc/AccommodationSection'
import GiftSection from './noir-blanc/GiftSection'
import GallerySection from './noir-blanc/GallerySection'
import MenuSection from './noir-blanc/MenuSection'
import ContactSection from './noir-blanc/ContactSection'
import FAQSection from './noir-blanc/FAQSection'
import RSVPSection from './noir-blanc/RSVPSection'
import Footer from './noir-blanc/Footer'
import StructuredData from '../StructuredData'
import { useEffect } from 'react'

interface NoirBlancTemplateProps {
  website: WeddingWebsite
}

export default function NoirBlancTemplate({ website }: NoirBlancTemplateProps) {
  const { content } = website

  // Default section order
  const DEFAULT_SECTION_ORDER: SectionType[] = [
    'hero', 'story', 'info', 'schedule', 'dressCode', 'menu',
    'accommodation', 'gift', 'gallery', 'contact', 'faq', 'rsvp'
  ]

  const sectionOrder = content.sectionOrder || DEFAULT_SECTION_ORDER

  // Load fonts
  useEffect(() => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;0,6..96,600;0,6..96,900;1,6..96,400&family=Space+Grotesk:wght@300;400;500;600&display=swap'
    document.head.appendChild(link)

    return () => {
      document.head.removeChild(link)
    }
  }, [])

  const getFirstName = (fullName: string) => fullName.split(' ')[0]

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('cs-CZ', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric'
    })
  }

  // Render section based on type
  const renderSection = (sectionType: SectionType) => {
    switch (sectionType) {
      case 'hero':
        return (
          <div key="hero-section">
            <HeroSection content={content.hero} />
            <Marquee 
              text={`${content.hero.tagline || 'A Celebration of Love & Style'} • ${formatDate(content.hero.weddingDate)} • #${getFirstName(content.hero.groom)}${getFirstName(content.hero.bride)}`} 
            />
          </div>
        )

      case 'story':
        return content.story?.enabled ? (
          <StorySection key="story" content={content.story} />
        ) : null

      case 'info':
        return content.info?.enabled ? (
          <LocationSection key="info" content={content.info} />
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
          <MenuSection key="menu" content={content.menu} websiteId={website.id} />
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
      <StructuredData website={website} />
      <ScrollAnimations />
      <div
        className="min-h-screen selection:bg-black selection:text-[#f2f0ea]"
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      >
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

