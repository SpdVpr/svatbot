import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Main domains that are not wedding websites
const MAIN_DOMAINS = ['svatbot', 'www', 'localhost']

// List of all existing routes that should NOT be redirected to wedding websites
const EXISTING_ROUTES = [
  '/accommodation',
  '/account',
  '/admin',
  '/affiliate',
  '/ai',
  '/ai-search',
  '/ai-timeline',
  '/animations-demo',
  '/api',
  '/budget',
  '/calendar',
  '/checklist',
  '/cookies',
  '/debug',
  '/gdpr',
  '/guests',
  '/integrations',
  '/marketplace',
  '/menu',
  '/mood-stats',
  '/moodboard',
  '/music',
  '/notifications',
  '/obchodni-podminky',
  '/ochrana-soukromi',
  '/podminky-sluzby',
  '/qr-test',
  '/rsvp',
  '/seating',
  '/share',
  '/shopping',
  '/sitemap.xml',
  '/svatebni-den',
  '/tasks',
  '/test-email-verification',
  '/test-logger',
  '/test-mood',
  '/test-recurring',
  '/tester-questionnaire',
  '/timeline',
  '/vendors',
  '/view-transitions-demo',
  '/w',
  '/wedding',
  '/wedding-website',
]

// Static files and Next.js internal paths
const STATIC_PATHS = [
  '/_next',
  '/static',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
  '/sw.js',
  '/.well-known',
]

// File extensions that should not be redirected
const FILE_EXTENSIONS = [
  '.ico',
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.svg',
  '.webp',
  '.css',
  '.js',
  '.json',
  '.xml',
  '.txt',
  '.woff',
  '.woff2',
  '.ttf',
  '.eot',
]

/**
 * Extract subdomain from hostname
 * Examples:
 * - jana-petr.svatbot.cz -> jana-petr
 * - www.svatbot.cz -> www
 * - svatbot.cz -> null
 * - localhost:3000 -> null
 */
function getSubdomain(hostname: string): string | null {
  // Remove port (for localhost)
  const host = hostname.split(':')[0]

  // Split into parts
  const parts = host.split('.')

  // If it's localhost or IP address, no subdomain
  if (host === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(host)) {
    return null
  }

  // If less than 3 parts, no subdomain
  // svatbot.cz -> ['svatbot', 'cz'] -> 2 parts -> no subdomain
  if (parts.length < 3) {
    return null
  }

  // First part is subdomain
  // jana-petr.svatbot.cz -> ['jana-petr', 'svatbot', 'cz'] -> jana-petr
  return parts[0]
}

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const pathname = url.pathname
  const hostname = request.headers.get('host') || ''

  // 0. Check if it's a Vercel preview/staging domain - skip wedding website routing
  // Examples: svatbot-spdvprs-projects.vercel.app, svatbot-git-master-spdvprs-projects.vercel.app
  const isVercelDomain = hostname.includes('.vercel.app')

  if (isVercelDomain) {
    // On Vercel preview domains, only handle explicit /wedding/[customUrl] routes
    // Don't try to detect wedding websites from subdomain
    return NextResponse.next()
  }

  // 1. Check if it's a static file or Next.js internal path
  const isStaticPath = STATIC_PATHS.some(path => pathname.startsWith(path))
  if (isStaticPath) {
    return NextResponse.next()
  }

  // 2. Check if it's a file with extension
  const hasFileExtension = FILE_EXTENSIONS.some(ext => pathname.endsWith(ext))
  if (hasFileExtension) {
    return NextResponse.next()
  }

  // 3. Check for subdomain-based wedding websites (e.g., jana-petr.svatbot.cz)
  const subdomain = getSubdomain(hostname)
  if (subdomain && !MAIN_DOMAINS.includes(subdomain)) {
    // Subdomain detected - rewrite to /wedding/[customUrl]
    url.pathname = `/wedding/${subdomain}${pathname}`
    return NextResponse.rewrite(url)
  }

  // 4. All other requests pass through normally (no path-based routing)
  return NextResponse.next()
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}

