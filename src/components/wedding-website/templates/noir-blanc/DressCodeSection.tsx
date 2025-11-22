'use client'

import React from 'react'
import Image from 'next/image'
import { Section } from './Section'
import { Heading, SubHeading, Paragraph } from './Typography'
import { DressCodeContent } from '@/types/wedding-website'

interface DressCodeSectionProps {
  content: DressCodeContent
}

export default function DressCodeSection({ content }: DressCodeSectionProps) {
  if (!content.enabled) return null

  // Collect all images from colors array
  const allImages: string[] = []
  if (content.colors && content.colors.length > 0) {
    content.colors.forEach(colorItem => {
      if (colorItem.images && colorItem.images.length > 0) {
        allImages.push(...colorItem.images)
      }
    })
  }
  // Fallback to legacy images array
  else if (content.images && content.images.length > 0) {
    allImages.push(...content.images)
  }

  return (
    <Section id="dressCode" className="bg-white">
      <div className="text-center mb-16 max-w-3xl mx-auto">
        <SubHeading>Dress Code</SubHeading>
        <Heading>{content.dressCode || 'Dress Code'}</Heading>
        {content.dressCodeDetails && (
          <Paragraph>{content.dressCodeDetails}</Paragraph>
        )}
      </div>

      {/* Color Palette */}
      {content.colors && content.colors.length > 0 && (
        <div className="flex flex-wrap justify-center gap-8 mb-16 max-w-4xl mx-auto">
          {content.colors.map((colorItem, index) => (
            <div key={index} className="flex flex-col items-center gap-4">
              <div
                className="w-24 h-24 rounded-full border border-black/10 shadow-xl"
                style={{ backgroundColor: colorItem.color }}
              />
              {colorItem.name && (
                <span className="font-mono uppercase text-sm tracking-widest text-center">{colorItem.name}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Legacy color palette support */}
      {(!content.colors || content.colors.length === 0) && content.colorPalette && content.colorPalette.length > 0 && (
        <div className="flex flex-wrap justify-center gap-8 mb-16 max-w-4xl mx-auto">
          {content.colorPalette.map((color, index) => (
            <div key={index} className="flex flex-col items-center gap-4">
              <div
                className="w-24 h-24 rounded-full border border-black/10 shadow-xl"
                style={{ backgroundColor: color }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Inspiration Photos */}
      {allImages.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {allImages.slice(0, 9).map((photo, index) => (
            <div key={index} className="aspect-[4/5] overflow-hidden border border-black group">
              <Image
                src={photo}
                alt="Inspiration"
                width={400}
                height={500}
                className="w-full h-full object-cover transition-all duration-500 group-hover:grayscale"
              />
            </div>
          ))}
        </div>
      )}
    </Section>
  )
}

