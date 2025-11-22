'use client'

import React from 'react'
import Image from 'next/image'
import { Section } from './Section'
import { Heading, SubHeading } from './Typography'
import { AccommodationContent } from '@/types/wedding-website'
import { Phone } from 'lucide-react'

interface AccommodationSectionProps {
  content: AccommodationContent
}

export default function AccommodationSection({ content }: AccommodationSectionProps) {
  if (!content.enabled || !content.accommodations || content.accommodations.length === 0) return null

  const accommodationCount = content.accommodations.length

  // Determine grid columns based on number of accommodations
  const getGridClass = () => {
    if (accommodationCount === 1) return 'grid-cols-1'
    if (accommodationCount === 2) return 'grid-cols-1 lg:grid-cols-2'
    return 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3'
  }

  // Determine max width based on number of accommodations
  const getMaxWidthClass = () => {
    if (accommodationCount === 1) return 'max-w-3xl'
    if (accommodationCount === 2) return 'max-w-6xl'
    return 'max-w-7xl'
  }

  return (
    <Section id="accommodation" className="bg-white">
      <div className="text-center mb-16">
        <SubHeading>Pobyt</SubHeading>
        <Heading>Ubytování</Heading>
      </div>

      <div className={`${getMaxWidthClass()} mx-auto`}>
        <div className={`grid ${getGridClass()} gap-12`}>
        {content.accommodations.map((hotel) => (
          <div key={hotel.id} className="border border-black flex flex-col">
            {hotel.image && (
              <div className="h-64 overflow-hidden group">
                <Image
                  src={hotel.image}
                  alt={hotel.name}
                  width={600}
                  height={400}
                  className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105 group-hover:grayscale"
                />
              </div>
            )}
            <div className="p-8 flex-grow">
              <div className="flex justify-between items-baseline mb-4">
                <h3 className="font-serif text-3xl">{hotel.name}</h3>
              </div>
              {hotel.description && (
                <p className="mb-6 font-light opacity-80">{hotel.description}</p>
              )}
              {hotel.phone && (
                <p className="text-sm mb-6 flex items-center gap-2">
                  <Phone size={14}/> {hotel.phone}
                </p>
              )}
              
              {hotel.rooms && hotel.rooms.length > 0 && (
                <div className="space-y-4 border-t border-black/10 pt-4">
                  {hotel.rooms.map((room, rIndex) => (
                    <div key={rIndex} className="flex justify-between items-center gap-4 bg-[#f2f0ea]/50 p-4">
                      <div className="flex-1 min-w-0">
                        <div className="font-bold uppercase text-sm">{room.name}</div>
                        {room.description && (
                          <div className="text-xs opacity-60 line-clamp-2">{room.description}</div>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        {room.pricePerNight && (
                          <div className="font-serif text-lg whitespace-nowrap">{room.pricePerNight} Kč</div>
                        )}
                        {room.count !== undefined && (
                          <div className="text-[10px] uppercase tracking-widest text-green-800 whitespace-nowrap">
                            {room.count} volných
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        </div>
      </div>
    </Section>
  )
}

