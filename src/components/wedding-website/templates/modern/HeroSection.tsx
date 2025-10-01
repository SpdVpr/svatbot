'use client'

import { Calendar } from 'lucide-react'
import type { HeroContent } from '@/types/wedding-website'
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

  // Výpočet odpočtu do svatby
  const getTimeUntilWedding = () => {
    if (!weddingDate) return null

    const now = new Date()
    const wedding = toDate(weddingDate)
    if (!wedding) return null

    const diffTime = wedding.getTime() - now.getTime()
    
    if (diffTime <= 0) {
      return { passed: true, message: 'Svatba se již konala!' }
    }
    
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) {
      return { passed: false, message: 'Svatba je zítra!' }
    } else if (diffDays <= 7) {
      return { passed: false, message: `Svatba za ${diffDays} dní` }
    } else if (diffDays <= 30) {
      return { passed: false, message: `Svatba za ${diffDays} dní` }
    } else {
      const diffMonths = Math.floor(diffDays / 30)
      return { passed: false, message: `Svatba za ${diffMonths} ${diffMonths === 1 ? 'měsíc' : 'měsíce'}` }
    }
  }

  const countdown = getTimeUntilWedding()

  return (
    <section 
      className="relative min-h-screen flex items-center justify-center"
      style={mainImage ? {
        mainImage: `linear-gradient(rgba(255,255,255,0.8), rgba(255,255,255,0.8)), url(${mainImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      } : {}}
    >
      {/* Geometric background pattern */}
      {!mainImage && (
        <div className="absolute inset-0 bg-white">
          <div className="absolute inset-0 opacity-5">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <pattern id="modern-pattern" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
                  <rect x="0" y="0" width="5" height="5" fill="currentColor" className="text-gray-900" />
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#modern-pattern)" />
            </svg>
          </div>
        </div>
      )}

      {/* Geometric decorative elements */}
      <div className="absolute top-20 left-20 opacity-10">
        <div className="w-32 h-32 border border-gray-900 transform rotate-45"></div>
      </div>
      <div className="absolute bottom-20 right-20 opacity-10">
        <div className="w-24 h-24 bg-gray-900 transform rotate-12"></div>
      </div>
      <div className="absolute top-1/3 right-32 opacity-5">
        <div className="w-16 h-16 border-2 border-gray-900 rounded-full"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        {/* Names */}
        <div className="mb-12">
          <h1 className="text-6xl md:text-8xl font-thin text-gray-900 mb-8 tracking-wider">
            {bride && groom ? (
              <>
                <span className="block">{bride}</span>
                <span className="text-2xl md:text-3xl font-light mx-4 text-gray-600">
                  &
                </span>
                <span className="block">{groom}</span>
              </>
            ) : (
              <span className="text-gray-400">Jména snoubenců</span>
            )}
          </h1>

          {/* Minimalist line */}
          <div className="flex items-center justify-center my-8">
            <div className="h-px w-24 bg-gray-900"></div>
          </div>
        </div>

        {/* Wedding Date */}
        {weddingDate && (
          <div className="mb-8">
            <div className="inline-flex items-center gap-4 px-8 py-4 border border-gray-300 bg-white bg-opacity-90">
              <Calendar className="w-5 h-5 text-gray-900" />
              <span className="text-xl font-light text-gray-900 tracking-wide">
                {formatDate(weddingDate)}
              </span>
            </div>
          </div>
        )}

        {/* Countdown */}
        {countdown && (
          <div className="mb-8">
            <p className="text-lg font-light text-gray-600 tracking-wide">
              {countdown.message}
            </p>
          </div>
        )}

        {/* Tagline */}
        {tagline && (
          <div className="mb-16">
            <p className="text-xl md:text-2xl font-light text-gray-700 max-w-2xl mx-auto leading-relaxed tracking-wide">
              {tagline}
            </p>
          </div>
        )}

        {/* Minimalist scroll indicator */}
        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2">
          <div className="flex flex-col items-center">
            <div className="w-px h-16 bg-gray-400 mb-2"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
          </div>
        </div>
      </div>

      {/* Floating geometric shapes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="absolute opacity-5 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 1}s`,
              animationDuration: `${4 + Math.random() * 2}s`
            }}
          >
            {i % 2 === 0 ? (
              <div className="w-8 h-8 border border-gray-900 transform rotate-45"></div>
            ) : (
              <div className="w-6 h-6 bg-gray-900 rounded-full"></div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
