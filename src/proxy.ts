import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Hlavní domény, které nejsou svatební weby
const MAIN_DOMAINS = ['svatbot', 'www', 'localhost']

// API routes a speciální cesty, které se nemají rewritovat
const EXCLUDED_PATHS = [
  '/api',
  '/_next',
  '/static',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
]

export function proxy(request: NextRequest) {
  const url = request.nextUrl.clone()
  const hostname = request.headers.get('host') || ''

  // Kontrola, jestli cesta začína na vyloučenou cestu
  const isExcludedPath = EXCLUDED_PATHS.some(path => url.pathname.startsWith(path))
  if (isExcludedPath) {
    return NextResponse.next()
  }

  // Extrakce subdomény
  const subdomain = getSubdomain(hostname)

  // Pokud je to hlavní doména nebo localhost, pokračuj normálně
  if (!subdomain || MAIN_DOMAINS.includes(subdomain)) {
    return NextResponse.next()
  }

  // Pokud je to subdoména, rewrite na svatební web
  console.log(`🌐 Subdomain detected: ${subdomain}`)

  // Rewrite URL na /wedding/[customUrl]
  url.pathname = `/wedding/${subdomain}${url.pathname}`

  console.log(`🔄 Rewriting to: ${url.pathname}`)

  return NextResponse.rewrite(url)
}

/**
 * Extrahuje subdoménu z hostname
 * Příklady:
 * - jana-petr.svatbot.cz -> jana-petr
 * - www.svatbot.cz -> www
 * - svatbot.cz -> null
 * - localhost:3000 -> null
 */
function getSubdomain(hostname: string): string | null {
  // Odstranění portu (pro localhost)
  const host = hostname.split(':')[0]
  
  // Rozdělení na části
  const parts = host.split('.')
  
  // Pokud je to localhost nebo IP adresa, není subdoména
  if (host === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(host)) {
    return null
  }
  
  // Pokud má méně než 3 části, není subdoména
  // svatbot.cz -> ['svatbot', 'cz'] -> 2 části -> není subdoména
  if (parts.length < 3) {
    return null
  }
  
  // První část je subdoména
  // jana-petr.svatbot.cz -> ['jana-petr', 'svatbot', 'cz'] -> jana-petr
  return parts[0]
}

// Konfigurace matcher - na které cesty se middleware aplikuje
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

