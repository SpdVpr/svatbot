import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SvatBot.cz - Moderní plánování svatby bez stresu',
  description: 'Plánujte svou dokonalou svatbu s moderními nástroji. Timeline, rozpočet, hosté a dodavatelé na jednom místě. Začněte zdarma!',
  keywords: [
    'plánování svatby',
    'svatební plánovač',
    'svatba česká republika',
    'svatební rozpočet',
    'svatební timeline',
    'RSVP systém',
    'seating plan',
    'svatební organizace',
    'svatební nástroje',
    'svatba online'
  ],
  authors: [{ name: 'SvatBot.cz' }],
  creator: 'SvatBot.cz',
  publisher: 'SvatBot.cz',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://svatbot.cz'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'SvatBot.cz - Moderní plánování svatby bez stresu',
    description: 'Plánujte svou dokonalou svatbu s moderními nástroji. Timeline, rozpočet, hosté a dodavatelé na jednom místě. Začněte zdarma!',
    url: 'https://svatbot.cz',
    siteName: 'SvatBot.cz',
    locale: 'cs_CZ',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'SvatBot.cz - Moderní plánování svatby',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SvatBot.cz - Moderní plánování svatby bez stresu',
    description: 'Plánujte svou dokonalou svatbu s moderními nástroji. Začněte zdarma!',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}
