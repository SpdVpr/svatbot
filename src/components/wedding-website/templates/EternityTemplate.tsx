'use client'

import { WebsiteContent, WeddingWebsite } from '@/types/wedding-website'
import Navigation from './eternity/Navigation'
import HeroSection from './eternity/HeroSection'
import StorySection from './eternity/StorySection'
import LocationSection from './eternity/LocationSection'
import DressCodeSection from './eternity/DressCodeSection'
import ScheduleSection from './eternity/ScheduleSection'
import RSVPSection from './eternity/RSVPSection'
import AccommodationSection from './eternity/AccommodationSection'
import GiftSection from './eternity/GiftSection'
import GallerySection from './eternity/GallerySection'
import MenuSection from './eternity/MenuSection'
import ContactSection from './eternity/ContactSection'
import FAQSection from './eternity/FAQSection'
import Footer from './eternity/Footer'
import ScrollAnimations from '../ScrollAnimations'
import StructuredData from '../StructuredData'

interface EternityTemplateProps {
  content: WebsiteContent
  websiteId: string
  website?: WeddingWebsite
}

export default function EternityTemplate({ content, websiteId, website }: EternityTemplateProps) {
  const bride = content.hero.bride
  const groom = content.hero.groom
  const weddingDate = new Date(content.hero.weddingDate)
  const venue = content.hero.venue

  // Default section order if not specified
  const sectionOrder = content.sectionOrder || [
    'hero', 'story', 'info', 'dressCode', 'schedule', 'rsvp',
    'accommodation', 'gift', 'gallery', 'menu', 'contact', 'faq'
  ]

  return (
    <>
      {website && <StructuredData website={website} />}
      <ScrollAnimations />

      <div className="min-h-screen font-sans text-gray-800 bg-[#F4F2ED]">
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&family=Montserrat:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&display=swap');

          * {
            font-family: 'Montserrat', sans-serif;
          }

          .font-serif {
            font-family: 'Playfair Display', serif;
          }

          .font-display-italic {
            font-family: 'Cormorant Garamond', serif;
            font-style: italic;
          }
        `}</style>

        <Navigation bride={bride} groom={groom} content={content} />

        {/* Render sections based on sectionOrder */}
        {sectionOrder.map((sectionType) => {
          switch (sectionType) {
            case 'hero':
              return <HeroSection key="hero" content={content.hero} />
            
            case 'story':
              return content.story?.enabled ? (
                <StorySection key="story" content={content.story} />
              ) : null
            
            case 'info':
              return content.info?.enabled ? (
                <LocationSection key="info" content={content.info} weddingDate={weddingDate} />
              ) : null
            
            case 'dressCode':
              return content.dressCode?.enabled ? (
                <DressCodeSection key="dressCode" content={content.dressCode} />
              ) : null
            
            case 'schedule':
              return content.schedule?.enabled ? (
                <ScheduleSection key="schedule" content={content.schedule} />
              ) : null
            
            case 'rsvp':
              return content.rsvp?.enabled ? (
                <RSVPSection key="rsvp" content={content.rsvp} websiteId={websiteId} />
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
                <MenuSection key="menu" content={content.menu} websiteId={websiteId} />
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
        })}

        <Footer
          bride={bride}
          groom={groom}
          weddingDate={weddingDate}
          venue={venue}
        />
      </div>
    </>
  )
}

