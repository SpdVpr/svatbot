import type { Metadata } from 'next'
import { Inter, Playfair_Display, Montserrat } from 'next/font/google'
import { Suspense } from 'react'
import './globals.css'
import { cn } from '@/utils'
import CookieBanner from '@/components/common/CookieBanner'
import AffiliateTracker from '@/components/affiliate/AffiliateTracker'
import GlobalFeedbackButton from '@/components/common/GlobalFeedbackButton'
import UserTrackingWrapper from '@/components/common/UserTrackingWrapper'
import DemoLockBanner from '@/components/common/DemoLockBanner'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'AI Svatební Asistent Zdarma | SvatBot.cz - První v ČR',
    template: '%s | SvatBot.cz - AI Svatební Plánovač'
  },
  description: 'Jediný český svatební plánovač s AI asistentem! Naplánujte svatbu za 50+ hodin méně. Rozpočet, timeline, hosté, seating plan, svatební web. Vyzkoušejte zdarma! ⭐ 4.9/5 od 127 uživatelů',
  keywords: [
    // TIER 1: Vysoký objem vyhledávání (priorita ⭐⭐⭐⭐⭐)
    'plánování svatby',
    'jak naplánovat svatbu',
    'příprava na svatbu',
    'svatební checklist',
    'svatební rozpočet',
    'organizace svatby',

    // TIER 2: AI & Blue Ocean (žádná konkurence! ⭐⭐⭐⭐⭐)
    'AI svatební asistent',
    'svatební plánovač s AI',
    'umělá inteligence svatba',
    'AI svatební rady',
    'chatbot svatba',
    'svatební AI pomocník',

    // TIER 3: Naše unikátní funkce
    'svatební plánovač',
    'svatební plánovač online',
    'svatební plánovač zdarma',
    'svatební aplikace',
    'svatební software',
    'digitální svatební plánovač',

    // TIER 4: Specifické funkce (nízká konkurence)
    'seating plan svatba',
    'svatební usazovací plán',
    'svatební timeline',
    'svatební web',
    'svatební web zdarma',
    'svatební stránky',
    'RSVP svatba',
    'svatební kalkulačka',
    'svatební rozpočet excel',

    // TIER 5: Long-tail keywords (vysoká konverze)
    'jak vytvořit svatební rozpočet',
    'svatební checklist pdf',
    'svatební úkoly',
    'svatba online',
    'svatební organizér',
    'svatební kalendář',
    'svatební nástroje',
    'svatební marketplace',

    // TIER 6: Lokální
    'česká svatba',
    'svatba v Česku',
    'svatba v ČR',
    'svatební dodavatelé',
    'svatební dodavatelé česko'
  ],
  authors: [{ name: 'SvatBot.cz Team' }],
  creator: 'SvatBot.cz',
  publisher: 'SvatBot.cz',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://svatbot.cz'),
  alternates: {
    canonical: '/',
    languages: {
      'cs-CZ': '/',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'cs_CZ',
    url: 'https://svatbot.cz',
    title: 'AI Svatební Asistent Zdarma | SvatBot.cz - První v ČR',
    description: 'Jediný český svatební plánovač s AI asistentem! Naplánujte svatbu za 50+ hodin méně. Rozpočet, timeline, hosté, seating plan, svatební web. ⭐ 4.9/5 hodnocení',
    siteName: 'SvatBot.cz',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'SvatBot.cz - První český svatební plánovač s AI asistentem pro moderní plánování svatby',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Svatební Asistent Zdarma | SvatBot.cz - První v ČR',
    description: 'Jediný český svatební plánovač s AI asistentem! Naplánujte svatbu za 50+ hodin méně. Vyzkoušejte zdarma! ⭐ 4.9/5',
    images: ['/og-image.jpg'],
    creator: '@svatbot_cz',
    site: '@svatbot_cz',
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
  category: 'lifestyle',
  applicationName: 'SvatBot.cz',
  referrer: 'origin-when-cross-origin',
  appleWebApp: {
    capable: true,
    title: 'SvatBot.cz',
    statusBarStyle: 'default',
  },
  other: {
    'google-site-verification': 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Structured Data (JSON-LD) for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      // Organization
      {
        '@type': 'Organization',
        '@id': 'https://svatbot.cz/#organization',
        name: 'SvatBot.cz',
        url: 'https://svatbot.cz',
        logo: {
          '@type': 'ImageObject',
          url: 'https://svatbot.cz/logo.png',
          width: 512,
          height: 512,
        },
        sameAs: [
          'https://www.facebook.com/svatbot.cz',
          'https://www.instagram.com/svatbot.cz',
          'https://twitter.com/svatbot_cz',
        ],
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'Customer Service',
          email: 'info@svatbot.cz',
          availableLanguage: ['Czech'],
        },
      },
      // WebSite
      {
        '@type': 'WebSite',
        '@id': 'https://svatbot.cz/#website',
        url: 'https://svatbot.cz',
        name: 'SvatBot.cz - Svatební Plánovač s AI',
        description: 'První český svatební plánovač s AI asistentem pro moderní plánování svatby',
        publisher: {
          '@id': 'https://svatbot.cz/#organization',
        },
        inLanguage: 'cs-CZ',
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://svatbot.cz/search?q={search_term_string}',
          'query-input': 'required name=search_term_string',
        },
      },
      // WebApplication
      {
        '@type': 'WebApplication',
        name: 'SvatBot.cz',
        url: 'https://svatbot.cz',
        applicationCategory: 'LifestyleApplication',
        operatingSystem: 'Web Browser',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'CZK',
          description: 'Základní verze zdarma',
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.9',
          ratingCount: '127',
          bestRating: '5',
          worstRating: '1',
        },
        featureList: [
          'AI svatební asistent',
          'Správa rozpočtu',
          'Timeline plánování',
          'Správa hostů',
          'Seating plan editor',
          'Svatební web builder',
          'Marketplace dodavatelů',
          'RSVP systém',
        ],
      },
      // SoftwareApplication
      {
        '@type': 'SoftwareApplication',
        name: 'SvatBot.cz - Svatební Plánovač',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web, iOS, Android',
        offers: {
          '@type': 'AggregateOffer',
          lowPrice: '0',
          highPrice: '2999',
          priceCurrency: 'CZK',
          offerCount: '3',
        },
        description: 'Komplexní svatební plánovač s AI asistentem, který vám ušetří 50+ hodin práce při organizaci svatby',
      },
      // BreadcrumbList
      {
        '@type': 'BreadcrumbList',
        '@id': 'https://svatbot.cz/#breadcrumb',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Domů',
            item: 'https://svatbot.cz',
          },
        ],
      },
    ],
  }

  return (
    <html lang="cs" className={cn(
      inter.variable,
      playfair.variable,
      montserrat.variable
    )}>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#F8BBD9" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="SvatBot.cz" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#F8BBD9" />

        {/* Structured Data (JSON-LD) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className={cn(
        'min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 font-sans antialiased',
        'selection:bg-primary-200 selection:text-primary-800'
      )}>
        <UserTrackingWrapper>
          {/* Demo Lock Banner - Shows when demo account is locked */}
          <Suspense fallback={null}>
            <DemoLockBanner />
          </Suspense>

          <div id="root" className="relative">
            {children}
          </div>

          {/* Affiliate Tracking */}
          <Suspense fallback={null}>
            <AffiliateTracker />
          </Suspense>

          {/* Cookie Banner */}
          <CookieBanner />

          {/* Global Feedback Button */}
          <Suspense fallback={null}>
            <GlobalFeedbackButton />
          </Suspense>
        </UserTrackingWrapper>

        {/* Portal for modals */}
        <div id="modal-root" />

        {/* Portal for toasts */}
        <div id="toast-root" />

        {/* Portal for notifications */}
        <div id="notification-root" />
      </body>
    </html>
  )
}
