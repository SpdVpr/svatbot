'use client'

import React from 'react'
import { Section } from './Section'
import { Heading, SubHeading } from './Typography'
import { ScheduleContent } from '@/types/wedding-website'
import { 
  Heart, 
  Music, 
  Utensils, 
  Camera, 
  Wine, 
  MapPin, 
  Clock,
  Info
} from 'lucide-react'

interface ScheduleSectionProps {
  content: ScheduleContent
}

// Icon mapping
const iconMap: Record<string, React.ComponentType<{ size?: number }>> = {
  '❤️': Heart,
  '💕': Heart,
  '🎵': Music,
  '🎶': Music,
  '🍽️': Utensils,
  '🍴': Utensils,
  '📷': Camera,
  '📸': Camera,
  '🍷': Wine,
  '🥂': Wine,
  '📍': MapPin,
  '🕐': Clock,
  'ℹ️': Info,
  'heart': Heart,
  'music': Music,
  'utensils': Utensils,
  'camera': Camera,
  'wine': Wine,
  'mappin': MapPin,
  'clock': Clock,
  'info': Info,
}

export default function ScheduleSection({ content }: ScheduleSectionProps) {
  if (!content.enabled || !content.items || content.items.length === 0) return null

  const getIcon = (iconStr?: string) => {
    if (!iconStr) return Clock
    const IconComponent = iconMap[iconStr.toLowerCase()] || iconMap[iconStr]
    return IconComponent || Clock
  }

  return (
    <section
      id="schedule"
      className="w-full text-black border-b border-black"
      style={{
        backgroundColor: '#f2f0ea',
        backgroundImage: 'none',
        backgroundAttachment: 'scroll',
        position: 'relative',
        zIndex: 1
      }}
    >
      <div
        className="px-4 py-20 md:py-32 md:px-12 max-w-[1800px] mx-auto"
        style={{ backgroundColor: '#f2f0ea' }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4">
          <SubHeading>Agenda</SubHeading>
          <Heading>Harmonogram<br/>Dne</Heading>
        </div>
        
        <div className="lg:col-span-8 relative pl-8 md:pl-12 border-l border-black">
          {content.items.map((event, index) => {
            const Icon = getIcon(event.icon)
            return (
              <div key={index} className="relative mb-12 last:mb-0 group">
                {/* Dot */}
                <div className="absolute -left-[41px] md:-left-[57px] top-2 w-4 h-4 bg-black rounded-full border-4 border-[#f2f0ea]" />
                
                <div className="flex flex-col md:flex-row md:items-baseline gap-4 mb-2">
                  <span className="font-sans text-2xl font-bold">{event.time}</span>
                  <h3 className="font-serif text-3xl md:text-4xl">{event.title}</h3>
                </div>
                
                {event.description && (
                  <>
                    <div className="flex items-center gap-2 text-black/60 mb-2 font-sans uppercase tracking-widest text-xs">
                      <Icon size={14} />
                      <span>{event.description}</span>
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>
      </div>
    </section>
  )
}

