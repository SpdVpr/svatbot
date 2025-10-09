'use client'

import { Calendar } from 'lucide-react'
import type { HeroContent } from '@/types/wedding-website'
import { Timestamp } from 'firebase/firestore'
import WeddingCountdown from '../../WeddingCountdown'

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

// Helper funkce pro převod na Date objekt
const toDate = (date: any): Date | null => {
  if (!date) return null

  if (date instanceof Date) {
    return date
  } else if (date instanceof Timestamp) {
    return date.toDate()
  } else if (typeof date === 'string') {
    return new Date(date)
  } else if (date.seconds) {
    // Firestore Timestamp object
    return new Date(date.seconds * 1000)
  }

  return null
}

interface HeroSectionProps {
  content: HeroContent
}

export default function ModernHeroSection({ content }: HeroSectionProps) {
  const { bride, groom, weddingDate, tagline, mainImage } = content

  // Získání iniciál
  const getInitials = () => {
    const brideInitial = bride?.charAt(0) || 'N'
    const groomInitial = groom?.charAt(0) || 'N'
    return `${brideInitial}${groomInitial}`
  }

  return (
    <section
      className="relative min-h-screen flex items-center justify-center pt-16"
      style={mainImage ? {
        backgroundImage: `linear-gradient(rgba(255,255,255,0.9), rgba(255,255,255,0.9)), url(${mainImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      } : {
        background: 'linear-gradient(to bottom, #ffffff 0%, #f9fafb 100%)'
      }}
    >
      {/* Main content */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto py-20">
        {/* Velké iniciály */}
        <div className="mb-8">
          <div className="text-[12rem] md:text-[16rem] font-light text-gray-900 leading-none tracking-tight">
            {getInitials()}
          </div>
        </div>

        {/* Tagline "se budou brát" */}
        <div className="mb-12">
          <p className="text-xl md:text-2xl font-light text-gray-600 tracking-wide">
            {tagline || 'se budou brát'}
          </p>
        </div>

        {/* Names */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-4">
            {bride && groom ? (
              <>
                <span>{bride}</span>
                <span className="text-2xl md:text-3xl font-light mx-4 text-gray-500">
                  a
                </span>
                <span>{groom}</span>
              </>
            ) : (
              <span className="text-gray-400">Jména snoubenců</span>
            )}
          </h1>
        </div>

        {/* Wedding Date */}
        {weddingDate && (
          <div className="mb-12">
            <div className="text-2xl md:text-3xl font-light text-gray-900 tracking-wide">
              {formatDate(weddingDate)}
            </div>
          </div>
        )}

        {/* Countdown */}
        {weddingDate && (
          <div className="mb-16">
            <p className="text-sm uppercase tracking-widest text-gray-500 mb-6">
              Do svatby zbývá
            </p>
            <WeddingCountdown
              weddingDate={weddingDate}
              style="modern"
              className="max-w-4xl mx-auto"
            />
          </div>
        )}

        {/* Venue info */}
        <div className="text-lg md:text-xl font-light text-gray-600">
          <span>Místo konání</span>
        </div>
      </div>
    </section>
  )
}
