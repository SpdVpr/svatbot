'use client'

import React from 'react'
import Image from 'next/image'
import { HeroContent } from '@/types/wedding-website'
import { DisplayText, SubHeading } from './Typography'

interface HeroSectionProps {
  content: HeroContent
}

export default function HeroSection({ content }: HeroSectionProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('cs-CZ', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const getFirstName = (fullName: string) => fullName.split(' ')[0]

  return (
    <section id="home" className="relative h-screen w-full overflow-hidden bg-black text-[#f2f0ea]">
      
      {/* Background Image */}
      <div className="absolute inset-0 z-0 group">
        {content.mainImage ? (
          <>
            <Image
              src={content.mainImage}
              alt="Wedding Couple"
              fill
              className="object-cover opacity-60 transition-all duration-700 group-hover:grayscale"
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
            <div className="absolute inset-0 bg-black/20" />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-black to-[#2d2d2d]" />
        )}
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
        <SubHeading className="text-white mb-6 animate-pulse">
          {formatDate(content.weddingDate)} • #{getFirstName(content.groom)}{getFirstName(content.bride)}
        </SubHeading>

        <div>
          <DisplayText className="text-white leading-[0.8]">
            {getFirstName(content.groom)}
          </DisplayText>
          <div className="font-serif text-4xl md:text-6xl italic my-2 text-white">&</div>
          <DisplayText className="text-white leading-[0.8]">
            {getFirstName(content.bride)}
          </DisplayText>
        </div>

        {content.tagline && (
          <p className="mt-8 font-sans uppercase tracking-[0.3em] text-sm md:text-base border-t border-b border-white/50 py-3 px-8 text-white">
            {content.tagline}
          </p>
        )}
      </div>
    </section>
  )
}

