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
    <div id="home" className="relative h-[950px] overflow-hidden">
      {/* Background Image */}
      {content.mainImage && (
        <div className="absolute inset-0">
          <Image
            src={content.mainImage}
            alt="Wedding"
            fill
            className="object-cover"
            priority
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
      <div className="relative h-full flex items-center justify-center pt-20">
        <div className="text-center">
          {/* Animated Circle Container */}
          <div className="relative inline-block">
            {/* Pulsing outer circle */}
            <div className="absolute inset-0 -m-2 rounded-full bg-[rgba(178,201,211,0.3)] animate-pulse" />
            
            {/* Main content circle */}
            <div className="relative w-[380px] h-[380px] rounded-full bg-[rgba(178,201,211,0.8)] flex flex-col items-center justify-center p-8">
              <div className="slide-subtitle mb-4">
                <h4 className="text-white text-base tracking-wider uppercase" style={{ fontFamily: 'Muli, sans-serif' }}>
                  Bereme se
                </h4>
              </div>
              <div className="slide-title mb-4">
                <h2 className="text-white text-6xl" style={{ fontFamily: 'Great Vibes, cursive' }}>
                  Uložte si datum
                </h2>
              </div>
              <div className="slide-text">
                <p className="text-white text-lg" style={{ fontFamily: 'Muli, sans-serif' }}>
                  {content.weddingDate && formatDate(content.weddingDate)}
                </p>
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
          .relative.inline-block > div:last-child {
            width: 280px !important;
            height: 280px !important;
          }
          .slide-title h2 {
            font-size: 2.25rem !important;
          }
        }
      `}</style>
    </div>
  )
}

