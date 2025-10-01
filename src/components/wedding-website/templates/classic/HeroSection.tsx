'use client'

import { Calendar, Heart } from 'lucide-react'
import type { HeroContent } from '@/types/wedding-website'

interface HeroSectionProps {
  content: HeroContent
}

export default function HeroSection({ content }: HeroSectionProps) {
  const { bride, groom, weddingDate, tagline, backgroundImage } = content

  // Výpočet odpočtu do svatby
  const getTimeUntilWedding = () => {
    if (!weddingDate) return null
    
    const now = new Date()
    const wedding = new Date(weddingDate)
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
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={backgroundImage ? {
        backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      } : {}}
    >
      {/* Background pattern overlay */}
      {!backgroundImage && (
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
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        {/* Names */}
        <div className="mb-8">
          <h1 className={`text-6xl md:text-8xl font-bold mb-4 font-serif ${
            backgroundImage ? 'text-white' : 'text-gray-900'
          }`}>
            {bride && groom ? (
              <>
                <span className="block">{bride}</span>
                <span className={`text-4xl md:text-5xl mx-4 ${
                  backgroundImage ? 'text-amber-200' : 'text-amber-600'
                }`}>
                  &
                </span>
                <span className="block">{groom}</span>
              </>
            ) : (
              <span className="text-gray-400">Jména snoubenců</span>
            )}
          </h1>

          {/* Decorative line */}
          <div className="flex items-center justify-center my-8">
            <div className={`h-px w-16 ${
              backgroundImage ? 'bg-white' : 'bg-amber-400'
            }`}></div>
            <Heart className={`w-6 h-6 mx-4 ${
              backgroundImage ? 'text-white' : 'text-rose-400'
            }`} />
            <div className={`h-px w-16 ${
              backgroundImage ? 'bg-white' : 'bg-amber-400'
            }`}></div>
          </div>
        </div>

        {/* Wedding Date */}
        {weddingDate && (
          <div className="mb-8">
            <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full ${
              backgroundImage 
                ? 'bg-white bg-opacity-20 backdrop-blur-sm text-white' 
                : 'bg-white shadow-lg text-gray-900'
            }`}>
              <Calendar className="w-5 h-5" />
              <span className="text-xl font-semibold">
                {weddingDate.toLocaleDateString('cs-CZ', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
            </div>
          </div>
        )}

        {/* Countdown */}
        {countdown && (
          <div className="mb-8">
            <p className={`text-lg font-medium ${
              backgroundImage ? 'text-amber-200' : 'text-amber-600'
            }`}>
              {countdown.message}
            </p>
          </div>
        )}

        {/* Tagline */}
        {tagline && (
          <div className="mb-12">
            <p className={`text-xl md:text-2xl italic font-light max-w-2xl mx-auto leading-relaxed ${
              backgroundImage ? 'text-white' : 'text-gray-700'
            }`}>
              "{tagline}"
            </p>
          </div>
        )}

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className={`w-6 h-10 border-2 rounded-full flex justify-center ${
            backgroundImage ? 'border-white' : 'border-gray-400'
          }`}>
            <div className={`w-1 h-3 rounded-full mt-2 ${
              backgroundImage ? 'bg-white' : 'bg-gray-400'
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
              backgroundImage ? 'text-white' : 'text-rose-300'
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
