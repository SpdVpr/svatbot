'use client'

import { HeroContent } from '@/types/wedding-website'
import { useState, useEffect } from 'react'

interface HeroSectionProps {
  content: HeroContent
}

export default function HeroSection({ content }: HeroSectionProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  
  // Default images if none provided
  const slides = content.mainImage 
    ? [content.mainImage] 
    : [
        'https://images.unsplash.com/photo-1519741497674-611481863552?w=1920',
        'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=1920'
      ]

  useEffect(() => {
    if (slides.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length)
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [slides.length])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  return (
    <section
      id="home"
      className="relative overflow-hidden"
      style={{
        height: 'calc(100vh - 100px)',
        minHeight: '500px'
      }}
    >
      {/* Wedding Announcement Overlay */}
      <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
        <div className="text-center text-white px-4">
          <h3
            className="text-xl md:text-2xl lg:text-3xl mb-4 tracking-wider uppercase"
            style={{
              fontFamily: 'Muli, sans-serif',
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
              fontWeight: 400,
              letterSpacing: '3px'
            }}
          >
            We're Getting Married
          </h3>
          <h2
            className="text-5xl md:text-7xl lg:text-8xl xl:text-9xl animate-fade-in"
            style={{
              fontFamily: 'Great Vibes, cursive',
              textShadow: '3px 3px 6px rgba(0,0,0,0.5)',
              fontWeight: 400
            }}
          >
            {content.bride} &amp; {content.groom}
          </h2>
        </div>
      </div>

      {/* Slider */}
      <div className="relative w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ zIndex: index === currentSlide ? 1 : 0 }}
          >
            <div
              className="w-full h-full"
              style={{
                backgroundImage: `url(${slide})`,
                backgroundSize: 'cover',
                backgroundPosition: content.imagePosition
                  ? `${content.imagePosition.x}% ${content.imagePosition.y}%`
                  : 'center center',
                backgroundRepeat: 'no-repeat',
                transform: content.imageScale ? `scale(${content.imageScale})` : 'none',
                transformOrigin: 'center center'
              }}
            >
              {/* Dark overlay for better text readability */}
              <div className="absolute inset-0 bg-black/30"></div>
            </div>
          </div>
        ))}

        {/* Navigation Arrows */}
        {slides.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center bg-white/30 hover:bg-white/50 rounded-full transition-all pointer-events-auto"
              aria-label="Previous slide"
            >
              <i className="flaticon-back text-white text-2xl"></i>
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center bg-white/30 hover:bg-white/50 rounded-full transition-all pointer-events-auto"
              aria-label="Next slide"
            >
              <i className="flaticon-next text-white text-2xl"></i>
            </button>
          </>
        )}

        {/* Pagination Dots */}
        {slides.length > 1 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all pointer-events-auto ${
                  index === currentSlide 
                    ? 'bg-white w-8' 
                    : 'bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
      `}</style>
    </section>
  )
}

