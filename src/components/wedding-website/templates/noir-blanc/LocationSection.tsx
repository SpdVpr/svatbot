'use client'

import React from 'react'
import Image from 'next/image'
import { Section } from './Section'
import { Heading, SubHeading } from './Typography'
import { InfoContent } from '@/types/wedding-website'
import { MapPin, Clock } from 'lucide-react'

interface LocationSectionProps {
  content: InfoContent
}

// Helper function to extract place_id from Google Maps URL
const extractPlaceId = (url: string): string | null => {
  if (!url) return null
  const match = url.match(/place_id[=:]([^&]+)/)
  return match ? match[1] : null
}

// Helper function to create Google Maps Embed URL
const createEmbedUrl = (mapUrl: string, address: string): string => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  const placeId = extractPlaceId(mapUrl)

  if (placeId) {
    return `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=place_id:${placeId}&zoom=15`
  } else if (address) {
    return `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(address)}&zoom=15`
  }

  return ''
}

export default function LocationSection({ content }: LocationSectionProps) {
  if (!content.enabled) return null

  return (
    <Section id="info" noPadding className="bg-white border-b border-black">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        
        {/* Ceremony */}
        {content.ceremony && (
          <div className="relative h-[600px] lg:h-[800px] group overflow-hidden bg-black text-[#f2f0ea] flex flex-col justify-between p-8 md:p-16 border-b lg:border-b-0 lg:border-r border-white/20">
            {content.ceremony.images && content.ceremony.images.length > 0 ? (
              <Image
                src={content.ceremony.images[0]}
                alt={content.ceremony.venue}
                fill
                className="absolute inset-0 object-cover opacity-40 group-hover:opacity-20 transition-opacity duration-500"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-black to-[#2d2d2d] opacity-40" />
            )}
            <div className="relative z-10">
              <SubHeading className="text-[#f2f0ea]/60">Part 01</SubHeading>
              <Heading className="text-[#f2f0ea]">Obřad</Heading>
            </div>
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5" />
                <span className="font-serif text-2xl">{content.ceremony.time}</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 mt-1" />
                <div>
                  <p className="font-bold uppercase tracking-widest">{content.ceremony.venue}</p>
                  <p className="font-light opacity-80 mb-4">{content.ceremony.address}</p>
                  {content.ceremony.mapUrl && (
                    <a 
                      href={content.ceremony.mapUrl} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="inline-block border-b border-[#f2f0ea] pb-1 text-sm uppercase hover:text-[#d4b0aa] hover:border-[#d4b0aa] transition-colors"
                    >
                      Otevřít mapu
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reception */}
        {content.reception && (
          <div className="relative h-[600px] lg:h-[800px] group overflow-hidden bg-[#f2f0ea] text-black flex flex-col justify-between p-8 md:p-16">
            {content.reception.images && content.reception.images.length > 0 ? (
              <Image
                src={content.reception.images[0]}
                alt={content.reception.venue}
                fill
                className="absolute inset-0 object-cover opacity-10 group-hover:opacity-5 transition-opacity duration-500"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-[#f2f0ea] to-white opacity-10" />
            )}
            <div className="relative z-10">
              <SubHeading>Part 02</SubHeading>
              <Heading>Hostina</Heading>
            </div>
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5" />
                <span className="font-serif text-2xl">{content.reception.time}</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 mt-1" />
                <div>
                  <p className="font-bold uppercase tracking-widest">{content.reception.venue}</p>
                  <p className="font-light opacity-80 mb-4">{content.reception.address}</p>
                  {content.reception.mapUrl && (
                    <a 
                      href={content.reception.mapUrl} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="inline-block border-b border-black pb-1 text-sm uppercase hover:text-[#d4b0aa] hover:border-[#d4b0aa] transition-colors"
                    >
                      Otevřít mapu
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Extra Info Bar */}
      {(content.parking || content.accessibility) && (
        <div className="bg-black text-[#f2f0ea] p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-8 text-center md:text-left">
          {content.parking && (
            <div>
              <h4 className="uppercase tracking-widest font-bold mb-2 text-sm">Parkování</h4>
              <p className="opacity-70 font-light">{content.parking}</p>
            </div>
          )}
          {content.accessibility && (
            <div>
              <h4 className="uppercase tracking-widest font-bold mb-2 text-sm">Bezbariérovost</h4>
              <p className="opacity-70 font-light">{content.accessibility}</p>
            </div>
          )}
        </div>
      )}

      {/* Google Map - Full Width Strip */}
      {((content.ceremony?.mapUrl && content.ceremony?.address) || (content.reception?.mapUrl && content.reception?.address)) && (
        <div className="w-full h-[300px] relative border-t border-black group overflow-hidden">
          <iframe
            src={
              content.ceremony?.mapUrl && content.ceremony?.address
                ? createEmbedUrl(content.ceremony.mapUrl, content.ceremony.address)
                : content.reception?.mapUrl && content.reception?.address
                ? createEmbedUrl(content.reception.mapUrl, content.reception.address)
                : ''
            }
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="transition-all duration-700 group-hover:grayscale"
          />
        </div>
      )}
    </Section>
  )
}

