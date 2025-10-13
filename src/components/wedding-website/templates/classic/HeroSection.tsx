'use client'

import { Calendar, Heart } from 'lucide-react'
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

export default function HeroSection({ content }: HeroSectionProps) {
  const { bride, groom, weddingDate, tagline, mainImage } = content



  return (
    <section 
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={mainImage ? {
        backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${mainImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      } : {}}
    >
      {/* Background pattern overlay */}
      {!mainImage && (
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-white to-rose-50">
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <pattern id="classic-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="10" cy="10" r="1" fill="currentColor" className="text-amber-300" />
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#classic-pattern)" />
            </svg>
          </div>
        </div>
      )}

      {/* Decorative elements */}
      <div className="absolute top-10 left-10 opacity-20">
        <div className="w-32 h-32 border-2 border-amber-300 rounded-full"></div>
      </div>
      <div className="absolute bottom-10 right-10 opacity-20">
        <div className="w-24 h-24 border-2 border-rose-300 rounded-full"></div>
      </div>
      <div className="absolute top-1/3 right-20 opacity-15">
        <Heart className="w-16 h-16 text-rose-300" />
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        {/* Names */}
        <div className="mb-6 scale-in">
          <h1 className={`text-5xl md:text-7xl font-bold mb-4 font-serif ${
            mainImage ? 'text-white' : 'text-gray-900'
          }`}>
            {bride && groom ? (
              <>
                <span className="block slide-in-left">{bride}</span>
                <span className={`text-3xl md:text-4xl mx-4 heartbeat ${
                  mainImage ? 'text-amber-200' : 'text-amber-600'
                }`} style={{ animationDelay: '0.3s' }}>
                  &
                </span>
                <span className="block slide-in-right" style={{ animationDelay: '0.2s' }}>{groom}</span>
              </>
            ) : (
              <span className="text-gray-400">Jména snoubenců</span>
            )}
          </h1>

          {/* Decorative line */}
          <div className="flex items-center justify-center my-6 slide-in-bottom" style={{ animationDelay: '0.4s' }}>
            <div className={`h-px w-12 ${
              mainImage ? 'bg-white' : 'bg-amber-400'
            }`}></div>
            <Heart className={`w-5 h-5 mx-3 heartbeat ${
              mainImage ? 'text-white' : 'text-rose-400'
            }`} fill="currentColor" />
            <div className={`h-px w-12 ${
              mainImage ? 'bg-white' : 'bg-amber-400'
            }`}></div>
          </div>
        </div>

        {/* Wedding Date */}
        {weddingDate && (
          <div className="mb-6 bounce-in" style={{ animationDelay: '0.5s' }}>
            <div className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full transition-all duration-300 hover:scale-110 ${
              mainImage
                ? 'bg-white bg-opacity-20 backdrop-blur-sm text-white'
                : 'bg-white shadow-lg text-gray-900'
            }`}>
              <Calendar className="w-4 h-4 float" />
              <span className="text-lg font-semibold">
                {formatDate(weddingDate)}
              </span>
            </div>
          </div>
        )}

        {/* Countdown */}
        {weddingDate && (
          <div className="mb-8">
            <WeddingCountdown
              weddingDate={weddingDate}
              style="classic"
              className="max-w-3xl mx-auto"
              compact={true}
            />
          </div>
        )}

        {/* Tagline */}
        {tagline && (
          <div className="mb-8 slide-in-bottom" style={{ animationDelay: '0.7s' }}>
            <p className={`text-lg md:text-xl italic font-light max-w-2xl mx-auto leading-relaxed ${
              mainImage ? 'text-white' : 'text-gray-700'
            }`}>
              "{tagline}"
            </p>
          </div>
        )}

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className={`w-6 h-10 border-2 rounded-full flex justify-center ${
            mainImage ? 'border-white' : 'border-gray-400'
          }`}>
            <div className={`w-1 h-3 rounded-full mt-2 ${
              mainImage ? 'bg-white' : 'bg-gray-400'
            }`}></div>
          </div>
        </div>
      </div>

      {/* Floating hearts animation */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <Heart
            key={i}
            className={`absolute w-4 h-4 opacity-20 animate-pulse ${
              mainImage ? 'text-white' : 'text-rose-300'
            }`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>
    </section>
  )
}
