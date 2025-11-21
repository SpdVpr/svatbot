'use client'

import { WeddingWebsite } from '@/types/wedding-website'
import Script from 'next/script'

interface StructuredDataProps {
  website: WeddingWebsite
}

export default function StructuredData({ website }: StructuredDataProps) {
  const { content, customUrl } = website

  // Event Schema - Wedding Event
  const eventSchema = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: `Svatba ${content.hero.bride} a ${content.hero.groom}`,
    description: content.story?.description || `Svatební web ${content.hero.bride} a ${content.hero.groom}`,
    startDate: content.hero.weddingDate,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    ...(content.info?.ceremony && {
      location: {
        '@type': 'Place',
        name: content.info.ceremony.venue,
        address: {
          '@type': 'PostalAddress',
          addressLocality: content.info.ceremony.address,
          addressCountry: 'CZ'
        },
        ...(content.info.ceremony.coordinates && {
          geo: {
            '@type': 'GeoCoordinates',
            latitude: content.info.ceremony.coordinates.lat,
            longitude: content.info.ceremony.coordinates.lng
          }
        })
      }
    }),
    organizer: [
      {
        '@type': 'Person',
        name: content.hero.bride,
        ...(content.contact?.bride?.email && { email: content.contact.bride.email }),
        ...(content.contact?.bride?.phone && { telephone: content.contact.bride.phone })
      },
      {
        '@type': 'Person',
        name: content.hero.groom,
        ...(content.contact?.groom?.email && { email: content.contact.groom.email }),
        ...(content.contact?.groom?.phone && { telephone: content.contact.groom.phone })
      }
    ],
    ...(content.hero.mainImage && {
      image: content.hero.mainImage
    })
  }

  // WebSite Schema
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: `Svatba ${content.hero.bride} a ${content.hero.groom}`,
    url: `https://svatbot.cz/wedding/${customUrl}`,
    description: content.story?.description || `Svatební web ${content.hero.bride} a ${content.hero.groom}`,
    inLanguage: 'cs-CZ',
    ...(content.hero.mainImage && {
      image: content.hero.mainImage
    })
  }

  // Person Schema - Bride
  const brideSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: content.hero.bride,
    ...(content.story?.bride?.description && { description: content.story.bride.description }),
    ...(content.story?.bride?.image && { image: content.story.bride.image }),
    ...(content.contact?.bride?.email && { email: content.contact.bride.email }),
    ...(content.contact?.bride?.phone && { telephone: content.contact.bride.phone }),
    spouse: {
      '@type': 'Person',
      name: content.hero.groom
    }
  }

  // Person Schema - Groom
  const groomSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: content.hero.groom,
    ...(content.story?.groom?.description && { description: content.story.groom.description }),
    ...(content.story?.groom?.image && { image: content.story.groom.image }),
    ...(content.contact?.groom?.email && { email: content.contact.groom.email }),
    ...(content.contact?.groom?.phone && { telephone: content.contact.groom.phone }),
    spouse: {
      '@type': 'Person',
      name: content.hero.bride
    }
  }

  return (
    <>
      {/* Event Schema */}
      <Script
        id="event-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema) }}
      />

      {/* WebSite Schema */}
      <Script
        id="website-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />

      {/* Bride Schema */}
      <Script
        id="bride-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(brideSchema) }}
      />

      {/* Groom Schema */}
      <Script
        id="groom-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(groomSchema) }}
      />
    </>
  )
}

