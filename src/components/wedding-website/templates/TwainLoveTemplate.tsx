'use client'

import { WeddingWebsite } from '@/types/wedding-website'
import ScrollAnimations from '../ScrollAnimations'
import Navigation from './twain-love/Navigation'
import HeroSection from './twain-love/HeroSection'
import CountdownSection from './twain-love/CountdownSection'
import CoupleSection from './twain-love/CoupleSection'
import StorySection from './twain-love/StorySection'
import LocationSection from './twain-love/LocationSection'
import GallerySection from './twain-love/GallerySection'
import RSVPSection from './twain-love/RSVPSection'
import GiftSection from './twain-love/GiftSection'
import Footer from './twain-love/Footer'
import { useEffect } from 'react'

interface TwainLoveTemplateProps {
  website: WeddingWebsite
}

export default function TwainLoveTemplate({ website }: TwainLoveTemplateProps) {
  const { content } = website

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

  return (
    <>
      <ScrollAnimations />
      <div className="min-h-screen bg-white" style={{ fontFamily: 'Muli, sans-serif' }}>
        {/* Navigation */}
        <Navigation 
          bride={content.hero.bride} 
          groom={content.hero.groom}
        />

        {/* Hero Section */}
        <HeroSection content={content.hero} />

        {/* Countdown */}
        {content.hero.weddingDate && (
          <CountdownSection weddingDate={content.hero.weddingDate} />
        )}

        {/* Couple Section - Medailonky snoubců */}
        {content.story.enabled && (content.story.bride || content.story.groom) && (
          <CoupleSection
            content={content.story}
            heroContent={content.hero}
          />
        )}

        {/* Story Section */}
        {content.story?.enabled && (
          <StorySection content={content.story} />
        )}

        {/* Location/Events Section */}
        {content.info?.enabled && (
          <LocationSection 
            infoContent={content.info}
            scheduleContent={content.schedule}
          />
        )}

        {/* Gallery Section */}
        {content.gallery?.enabled && (
          <GallerySection content={content.gallery} />
        )}

        {/* RSVP Section */}
        {content.rsvp?.enabled && (
          <RSVPSection 
            content={content.rsvp}
            websiteId={website.id}
          />
        )}

        {/* Gift Section */}
        {content.gift?.enabled && (
          <GiftSection content={content.gift} />
        )}

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

