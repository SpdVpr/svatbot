'use client'

import { Heart, Calendar, MapPin } from 'lucide-react'
import type { HeroContent, WebsiteStyle } from '@/types/wedding-website'

interface HeroSectionProps {
  content: HeroContent
  style: WebsiteStyle
}

export default function HeroSection({ content, style }: HeroSectionProps) {
  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toLocaleDateString('cs-CZ', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        {content.mainImage ? (
          <>
            <img
              src={content.mainImage}
              alt="Wedding background"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-rose-900/40 via-pink-900/30 to-amber-900/40" />
          </>
        ) : (
          <>
            {/* Placeholder image with romantic couple illustration */}
            <div className="w-full h-full bg-gradient-to-br from-rose-200 via-pink-200 to-amber-200 relative">
              <div className="absolute inset-0 flex items-center justify-center opacity-20">
                <div className="text-9xl">💑</div>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-rose-900/20 via-pink-900/10 to-amber-900/20" />
          </>
        )}
      </div>

      {/* Decorative Floral Elements */}
      <div className="absolute top-10 left-10 w-32 h-32 opacity-20">
        <svg viewBox="0 0 100 100" className="text-rose-300 fill-current">
          <circle cx="50" cy="50" r="5" />
          <circle cx="50" cy="30" r="8" />
          <circle cx="70" cy="50" r="8" />
          <circle cx="50" cy="70" r="8" />
          <circle cx="30" cy="50" r="8" />
          <circle cx="35" cy="35" r="6" />
          <circle cx="65" cy="35" r="6" />
          <circle cx="65" cy="65" r="6" />
          <circle cx="35" cy="65" r="6" />
        </svg>
      </div>

      <div className="absolute bottom-10 right-10 w-40 h-40 opacity-20">
        <svg viewBox="0 0 100 100" className="text-amber-300 fill-current">
          <circle cx="50" cy="50" r="5" />
          <circle cx="50" cy="25" r="10" />
          <circle cx="75" cy="50" r="10" />
          <circle cx="50" cy="75" r="10" />
          <circle cx="25" cy="50" r="10" />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        {/* Decorative Heart */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <Heart className="w-16 h-16 text-rose-300 fill-rose-300 animate-pulse" />
            <div className="absolute inset-0 blur-xl bg-rose-300 opacity-50" />
          </div>
        </div>

        {/* Names */}
        <h1 className="font-serif text-6xl md:text-8xl lg:text-9xl font-light text-white mb-6 tracking-wide">
          <span className="block mb-2">{content.bride}</span>
          <span className="text-4xl md:text-5xl text-rose-200 font-light">&</span>
          <span className="block mt-2">{content.groom}</span>
        </h1>

        {/* Tagline */}
        {content.tagline && (
          <p className="text-xl md:text-2xl text-rose-100 font-light italic mb-12 max-w-2xl mx-auto">
            "{content.tagline}"
          </p>
        )}

        {/* Date */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 text-white">
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20">
            <Calendar className="w-5 h-5 text-rose-200" />
            <span className="text-lg font-light">{formatDate(content.weddingDate)}</span>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="mt-16 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full mx-auto flex items-start justify-center p-2">
            <div className="w-1 h-3 bg-white/70 rounded-full" />
          </div>
        </div>
      </div>

      {/* Bottom Wave Decoration */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" className="w-full h-auto">
          <path
            fill="rgb(254 242 242)"
            d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
          />
        </svg>
      </div>
    </section>
  )
}

