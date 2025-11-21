'use client'

import { WeddingWebsite } from '@/types/wedding-website'
import ScrollAnimations from '../ScrollAnimations'
import { ColorThemeProvider } from './ColorThemeContext'
import HeroSection from './winter-elegance/HeroSection'
import StorySection from './winter-elegance/StorySection'
import InfoSection from './winter-elegance/InfoSection'
import DressCodeSection from './winter-elegance/DressCodeSection'
import ScheduleSection from './winter-elegance/ScheduleSection'
import RSVPSection from './winter-elegance/RSVPSection'
import AccommodationSection from './winter-elegance/AccommodationSection'
import GiftSection from './winter-elegance/GiftSection'
import GallerySection from './winter-elegance/GallerySection'
import ContactSection from './winter-elegance/ContactSection'
import FAQSection from './winter-elegance/FAQSection'
import MenuSection from './winter-elegance/MenuSection'
import StructuredData from '../StructuredData'

interface WinterEleganceTemplateProps {
  website: WeddingWebsite
}

export default function WinterEleganceTemplate({ website }: WinterEleganceTemplateProps) {
  const { content } = website

  // Default section order - podle požadavku: Náš příběh, Google Maps (info), Ubytování, Svatební menu, Galerie
  const defaultOrder = [
    'hero',
    'story',
    'info',
    'accommodation',
    'menu',
    'gallery',
    'schedule',
    'dressCode',
    'gift',
    'rsvp',
    'faq',
    'contact',
  ]

  const sectionOrder = content.sectionOrder || defaultOrder

  const renderSection = (sectionType: string) => {
    switch (sectionType) {
      case 'hero':
        return <HeroSection key="hero" content={content.hero} />
      case 'story':
        return <StorySection key="story" content={content.story} />
      case 'info':
        return <InfoSection key="info" content={content.info} />
      case 'dressCode':
        return <DressCodeSection key="dressCode" content={content.dressCode} />
      case 'schedule':
        return <ScheduleSection key="schedule" content={content.schedule} />
      case 'rsvp':
        return <RSVPSection key="rsvp" content={content.rsvp} websiteId={website.id} />
      case 'accommodation':
        return <AccommodationSection key="accommodation" content={content.accommodation} />
      case 'gift':
        return <GiftSection key="gift" content={content.gift} />
      case 'gallery':
        return <GallerySection key="gallery" content={content.gallery} />
      case 'contact':
        return <ContactSection key="contact" content={content.contact} />
      case 'faq':
        return <FAQSection key="faq" content={content.faq} />
      case 'menu':
        return <MenuSection key="menu" content={content.menu} />
      default:
        return null
    }
  }

  return (
    <ColorThemeProvider
      themeName={website.style?.colorTheme || 'default'}
      customTheme={website.style?.customColors}
    >
      <StructuredData website={website} />
      <ScrollAnimations />
      <div className="min-h-screen bg-white font-light">
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Inter:wght@200;300;400;500;600&display=swap');

          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            font-weight: 300;
            line-height: 1.6;
            letter-spacing: 0.01em;
          }

          .font-serif {
            font-family: 'Playfair Display', Georgia, serif;
          }

          html {
            scroll-behavior: smooth;
          }

          section {
            scroll-margin-top: 80px;
          }

          ::-webkit-scrollbar {
            width: 6px;
          }

          ::-webkit-scrollbar-track {
            background: #f5f5f4;
          }

          ::-webkit-scrollbar-thumb {
            background: #d6d3d1;
            border-radius: 3px;
          }

          ::-webkit-scrollbar-thumb:hover {
            background: #a8a29e;
          }

          .text-shadow-sm {
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
          }

          .text-shadow-md {
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          }

          .text-shadow-lg {
            text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
          }

          ::selection {
            background-color: #78716c;
            color: white;
          }
        `}</style>

        {/* Render sections in order */}
        {sectionOrder.map((sectionType) => renderSection(sectionType))}

        {/* Footer */}
        <footer className="bg-stone-900 text-white py-12">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="text-2xl font-serif font-light">{content.hero.bride}</span>
              <div className="w-px h-6 bg-white/40"></div>
              <span className="text-2xl font-serif font-light">{content.hero.groom}</span>
            </div>
            <p className="text-stone-400 text-sm mb-4">
              {new Date(content.hero.weddingDate).toLocaleDateString('cs-CZ', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
            <p className="text-stone-500 text-sm">
              Vytvořeno s ❤️ pomocí{' '}
              <a
                href="https://svatbot.cz"
                target="_blank"
                rel="noopener noreferrer"
                className="text-stone-400 hover:text-stone-300 transition-colors"
              >
                SvatBot.cz
              </a>
            </p>
          </div>
        </footer>
      </div>
    </ColorThemeProvider>
  )
}

