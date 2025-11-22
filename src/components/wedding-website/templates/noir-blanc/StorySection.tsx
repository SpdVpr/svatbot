'use client'

import React from 'react'
import Image from 'next/image'
import { Section } from './Section'
import { Heading, SubHeading, Paragraph } from './Typography'
import { StoryContent } from '@/types/wedding-website'

interface StorySectionProps {
  content: StoryContent
}

export default function StorySection({ content }: StorySectionProps) {
  if (!content.enabled) return null

  const formatDate = (date?: Date) => {
    if (!date) return ''
    return new Date(date).toLocaleDateString('cs-CZ', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const parseHobbies = (hobbiesStr?: string): string[] => {
    if (!hobbiesStr) return []
    return hobbiesStr.split(',').map(h => h.trim()).filter(h => h.length > 0)
  }

  return (
    <Section id="story" className="bg-[#f2f0ea]">
      {/* Profiles Grid */}
      {(content.bride || content.groom) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-32">
          {/* Bride Profile */}
          {content.bride && (
            <div className="flex flex-col items-center text-center">
              <div className="w-full aspect-[3/4] overflow-hidden mb-8 border border-black group">
                {content.bride.image ? (
                  <Image
                    src={content.bride.image}
                    alt={content.bride.name}
                    width={600}
                    height={800}
                    className="w-full h-full object-cover transition-all duration-700 group-hover:grayscale"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#d4b0aa] to-[#f2f0ea] flex items-center justify-center">
                    <span className="text-6xl">👰</span>
                  </div>
                )}
              </div>
              <h3 className="font-serif text-4xl mb-2">{content.bride.name}</h3>
              {content.bride.description && (
                <Paragraph className="mb-6 max-w-md">{content.bride.description}</Paragraph>
              )}
              {content.bride.hobbies && (
                <div className="flex gap-2 flex-wrap justify-center">
                  {parseHobbies(content.bride.hobbies).map((hobby, idx) => (
                    <span key={idx} className="px-3 py-1 border border-black/20 rounded-full text-xs uppercase tracking-wide">
                      {hobby}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Groom Profile */}
          {content.groom && (
            <div className="flex flex-col items-center text-center lg:mt-24">
              <div className="w-full aspect-[3/4] overflow-hidden mb-8 border border-black group">
                {content.groom.image ? (
                  <Image
                    src={content.groom.image}
                    alt={content.groom.name}
                    width={600}
                    height={800}
                    className="w-full h-full object-cover transition-all duration-700 group-hover:grayscale"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#d4b0aa] to-[#f2f0ea] flex items-center justify-center">
                    <span className="text-6xl">🤵</span>
                  </div>
                )}
              </div>
              <h3 className="font-serif text-4xl mb-2">{content.groom.name}</h3>
              {content.groom.description && (
                <Paragraph className="mb-6 max-w-md">{content.groom.description}</Paragraph>
              )}
              {content.groom.hobbies && (
                <div className="flex gap-2 flex-wrap justify-center">
                  {parseHobbies(content.groom.hobbies).map((hobby, idx) => (
                    <span key={idx} className="px-3 py-1 border border-black/20 rounded-full text-xs uppercase tracking-wide">
                      {hobby}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* How We Met & Proposal */}
      {(content.howWeMet || content.proposal) && (
        <div className="space-y-32">
          {content.howWeMet && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-5 group">
                {content.howWeMet.image ? (
                  <Image
                    src={content.howWeMet.image}
                    alt={content.howWeMet.title}
                    width={800}
                    height={600}
                    className="w-full h-auto transition-all duration-700 group-hover:grayscale"
                  />
                ) : (
                  <div className="w-full aspect-[4/3] bg-gradient-to-br from-[#d4b0aa] to-[#f2f0ea] flex items-center justify-center">
                    <span className="text-6xl">💕</span>
                  </div>
                )}
              </div>
              <div className="md:col-span-7 md:pl-12">
                {content.howWeMet.date && <SubHeading>{formatDate(content.howWeMet.date)}</SubHeading>}
                <Heading>{content.howWeMet.title}</Heading>
                <Paragraph>{content.howWeMet.text}</Paragraph>
              </div>
            </div>
          )}

          {content.proposal && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-7 md:pr-12 md:text-right order-2 md:order-1">
                {content.proposal.date && <SubHeading>{formatDate(content.proposal.date)}</SubHeading>}
                <Heading>{content.proposal.title}</Heading>
                <Paragraph>{content.proposal.text}</Paragraph>
              </div>
              <div className="md:col-span-5 order-1 md:order-2 group">
                {content.proposal.image ? (
                  <Image
                    src={content.proposal.image}
                    alt={content.proposal.title}
                    width={800}
                    height={600}
                    className="w-full h-auto transition-all duration-700 group-hover:grayscale"
                  />
                ) : (
                  <div className="w-full aspect-[4/3] bg-gradient-to-br from-[#d4b0aa] to-[#f2f0ea] flex items-center justify-center">
                    <span className="text-6xl">💍</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </Section>
  )
}

