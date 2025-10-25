import type { Metadata } from 'next'
import { Inter, Playfair_Display, Montserrat } from 'next/font/google'
import { Suspense } from 'react'
import './globals.css'
import { cn } from '@/utils'
import CookieBanner from '@/components/common/CookieBanner'
import AffiliateTracker from '@/components/affiliate/AffiliateTracker'
import GlobalFeedbackButton from '@/components/common/GlobalFeedbackButton'

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
    default: 'SvatBot.cz - Moderní plánování svatby bez stresu',
    template: '%s | SvatBot.cz'
  },
  description: 'Plánujte svou dokonalou svatbu s moderními nástroji. Timeline, rozpočet, hosté a dodavatelé na jednom místě. Začněte zdarma!',
  keywords: [
    'svatba',
    'svatební plánovač',
    'plánování svatby',
    'česká svatba',
    'svatební aplikace',
    'wedding planner',
    'svatební checklist',
    'svatební rozpočet'
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
  },
  openGraph: {
    type: 'website',
    locale: 'cs_CZ',
    url: '/',
    title: 'SvatBot.cz - Moderní svatební plánovač',
    description: 'Váš průvodce krásným svatebním plánováním krok za krokem',
    siteName: 'SvatBot.cz',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'SvatBot.cz - Svatební plánovač',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SvatBot.cz - Moderní svatební plánovač',
    description: 'Váš průvodce krásným svatebním plánováním krok za krokem',
    images: ['/og-image.jpg'],
    creator: '@svatbot_cz',
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
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
      </head>
      <body className={cn(
        'min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 font-sans antialiased',
        'selection:bg-primary-200 selection:text-primary-800'
      )}>
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
