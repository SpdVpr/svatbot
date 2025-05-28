import type { Metadata } from 'next'
import { Inter, Playfair_Display, Montserrat } from 'next/font/google'
import './globals.css'
import { cn } from '@/utils'

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
    default: 'SvatBot.cz - Moderní svatební plánovač',
    template: '%s | SvatBot.cz'
  },
  description: 'Váš průvodce krásným svatebním plánováním krok za krokem. Kompletní aplikace pro plánování svatby v České republice.',
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
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#F8BBD9" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="SvatBot.cz" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#F8BBD9" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
      </head>
      <body className={cn(
        'min-h-screen bg-neutral-50 font-sans antialiased',
        'selection:bg-primary-200 selection:text-primary-800'
      )}>
        <div id="root" className="relative">
          {children}
        </div>

        {/* Portal for modals */}
        <div id="modal-root" />

        {/* Portal for toasts */}
        <div id="toast-root" />
      </body>
    </html>
  )
}
