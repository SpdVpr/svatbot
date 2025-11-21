'use client'

import { HeroContent } from '@/types/wedding-website'
import { useEffect, useState } from 'react'
import Image from 'next/image'

interface HeroSectionProps {
  content: HeroContent
}

export default function HeroSection({ content }: HeroSectionProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const slides = content.mainImage ? [content.mainImage] : []

  useEffect(() => {
    if (slides.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length)
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [slides.length])

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('cs-CZ', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <div id="home" className="relative h-screen min-h-[600px] md:min-h-[800px] lg:h-[950px] overflow-hidden">
      {/* Background Image */}
      {content.mainImage && (
        <div className="absolute inset-0">
          <Image
            src={content.mainImage}
            alt="Wedding"
            fill
            className="object-cover object-center"
            priority
            sizes="100vw"
            style={{
              objectPosition: content.imagePosition
                ? `${content.imagePosition.x}% ${content.imagePosition.y}%`
                : 'center',
              transform: content.imageScale
                ? `scale(${content.imageScale / 100})`
                : 'scale(1)'
            }}
          />
          <div className="absolute inset-0 bg-black/30" />
        </div>
      )}

      {/* Content */}
      <div className="relative h-full flex items-end justify-center pb-12 md:pb-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-center">
            {/* Rectangle Container */}
            <div className="relative inline-block">
              {/* Pulsing outer rectangle */}
              <div className="absolute inset-0 -m-2 rounded-lg bg-[rgba(178,201,211,0.3)] animate-pulse" />

              {/* Main content rectangle */}
              <div className="relative px-8 py-6 md:px-12 md:py-8 rounded-lg bg-[rgba(178,201,211,0.9)] backdrop-blur-sm">
                <div className="flex flex-col items-center text-center gap-3">
                  {/* BEREME SE */}
                  <div className="slide-subtitle">
                    <h4 className="text-white text-sm md:text-base tracking-wider uppercase font-semibold" style={{ fontFamily: 'Muli, sans-serif' }}>
                      BEREME SE
                    </h4>
                  </div>

                  {/* Jména svatebčanů */}
                  <div className="slide-title">
                    <h2 className="text-white text-3xl md:text-4xl lg:text-5xl" style={{ fontFamily: 'Great Vibes, cursive' }}>
                      {content.bride} & {content.groom}
                    </h2>
                  </div>

                  {/* Místo konání */}
                  {content.venue && (
                    <div className="slide-venue">
                      <p className="text-white text-base md:text-lg font-medium" style={{ fontFamily: 'Muli, sans-serif' }}>
                        {content.venue}
                      </p>
                    </div>
                  )}

                  {/* Datum svatby */}
                  {content.weddingDate && (
                    <div className="slide-text">
                      <p className="text-white text-base md:text-lg" style={{ fontFamily: 'Muli, sans-serif' }}>
                        {formatDate(content.weddingDate)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation arrows - if multiple slides */}
      {slides.length > 1 && (
        <>
          <button
            onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
            className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full border border-gray-400 flex items-center justify-center text-white hover:bg-[#85aaba] hover:border-[#85aaba] transition-all opacity-0 group-hover:opacity-100"
          >
            ‹
          </button>
          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
            className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full border border-gray-400 flex items-center justify-center text-white hover:bg-[#85aaba] hover:border-[#85aaba] transition-all opacity-0 group-hover:opacity-100"
          >
            ›
          </button>
        </>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale3d(1, 1, 1);
          }
          50% {
            transform: scale3d(1.05, 1.05, 1.05);
          }
        }

        @media (max-width: 767px) {
          .slide-title h2 {
            font-size: 1.75rem !important;
          }
          .slide-subtitle h4 {
            font-size: 0.75rem !important;
          }
          .slide-venue p {
            font-size: 0.875rem !important;
          }
          .slide-text p {
            font-size: 0.875rem !important;
          }
        }
      `}</style>
    </div>
  )
}

