'use client'

import { useColorTheme } from '../ColorThemeContext'
import { HeroContent } from '@/types/wedding-website'
import { Heart, ChevronDown } from 'lucide-react'
import Image from 'next/image'
import { useState, useEffect } from 'react'

interface HeroSectionProps {
  content: HeroContent
}

export default function HeroSection({ content }: HeroSectionProps) {
  const { theme } = useColorTheme()
  const [daysUntilWedding, setDaysUntilWedding] = useState<number | null>(null)

  useEffect(() => {
    const calculateDays = () => {
      const weddingDate = new Date(content.weddingDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      weddingDate.setHours(0, 0, 0, 0)
      const diffTime = weddingDate.getTime() - today.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      setDaysUntilWedding(diffDays)
    }

    calculateDays()
    const interval = setInterval(calculateDays, 1000 * 60 * 60) // Update every hour
    return () => clearInterval(interval)
  }, [content.weddingDate])

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('cs-CZ', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    })
  }

  const scrollToNext = () => {
    const nextSection = document.querySelector('section:nth-of-type(2)')
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      {content.mainImage && (
        <div className="absolute inset-0 z-0">
          <Image
            src={content.mainImage}
            alt="Wedding"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 text-center px-6 py-20">
        <div className="max-w-4xl mx-auto">
          {/* Names */}
          <div className="mb-8">
            <h1 className="text-5xl md:text-7xl font-serif font-light text-white mb-4 text-shadow-lg">
              {content.bride}
            </h1>
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="w-12 h-px bg-white/60"></div>
              <Heart className="w-6 h-6 text-white" />
              <div className="w-12 h-px bg-white/60"></div>
            </div>
            <h1 className="text-5xl md:text-7xl font-serif font-light text-white text-shadow-lg">
              {content.groom}
            </h1>
          </div>

          {/* Date */}
          <div className="mb-8">
            <p className="text-2xl md:text-3xl text-white font-light text-shadow-md">
              {formatDate(content.weddingDate)}
            </p>
          </div>

          {/* Tagline */}
          {content.tagline && (
            <div className="mb-8">
              <p className="text-xl md:text-2xl text-white/90 font-light italic text-shadow-md">
                {content.tagline}
              </p>
            </div>
          )}

          {/* Countdown */}
          {daysUntilWedding !== null && daysUntilWedding > 0 && (
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-8 py-6 inline-block">
              <div className="text-center">
                <div className="text-5xl md:text-6xl font-serif font-light text-white mb-2">
                  {daysUntilWedding}
                </div>
                <div className="text-sm md:text-base text-white/90 uppercase tracking-wider">
                  {daysUntilWedding === 1 ? 'den do svatby' : daysUntilWedding <= 4 ? 'dny do svatby' : 'dní do svatby'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Scroll indicator */}
      <button
        onClick={scrollToNext}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-white hover:text-white/80 transition-colors animate-bounce"
        aria-label="Scroll to next section"
      >
        <ChevronDown className="w-8 h-8" />
      </button>
    </section>
  )
}

