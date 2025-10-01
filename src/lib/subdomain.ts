/**
 * Utility funkce pro práci se subdoménami
 */

// Hlavní domény
const MAIN_DOMAINS = ['svatbot', 'www', 'localhost']

/**
 * Extrahuje subdoménu z hostname
 */
export function getSubdomain(hostname: string): string | null {
  // Odstranění portu (pro localhost)
  const host = hostname.split(':')[0]
  
  // Rozdělení na části
  const parts = host.split('.')
  
  // Pokud je to localhost nebo IP adresa, není subdoména
  if (host === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(host)) {
    return null
  }
  
  // Pokud má méně než 3 části, není subdoména
  if (parts.length < 3) {
    return null
  }
  
  // První část je subdoména
  return parts[0]
}

/**
 * Kontroluje, jestli je hostname hlavní doména
 */
export function isMainDomain(hostname: string): boolean {
  const subdomain = getSubdomain(hostname)
  return !subdomain || MAIN_DOMAINS.includes(subdomain)
}

/**
 * Vytvoří URL pro svatební web
 */
export function getWeddingWebsiteUrl(customUrl: string, baseDomain: string = 'svatbot.cz'): string {
  // Pro development použijeme path-based URL
  if (process.env.NODE_ENV === 'development') {
    return `http://localhost:3000/w/${customUrl}`
  }
  
  // Pro production použijeme subdoména
  return `https://${customUrl}.${baseDomain}`
}

/**
 * Validuje custom URL
 * - Pouze malá písmena, čísla a pomlčky
 * - Minimálně 3 znaky
 * - Maximálně 50 znaků
 * - Nesmí začínat nebo končit pomlčkou
 * - Nesmí obsahovat více pomlček za sebou
 */
export function validateCustomUrl(customUrl: string): {
  valid: boolean
  error?: string
} {
  // Kontrola délky
  if (customUrl.length < 3) {
    return {
      valid: false,
      error: 'URL musí mít alespoň 3 znaky'
    }
  }
  
  if (customUrl.length > 50) {
    return {
      valid: false,
      error: 'URL může mít maximálně 50 znaků'
    }
  }
  
  // Kontrola formátu
  const urlRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/
  if (!urlRegex.test(customUrl)) {
    return {
      valid: false,
      error: 'URL může obsahovat pouze malá písmena, čísla a pomlčky'
    }
  }
  
  // Kontrola rezervovaných slov
  const reservedWords = [
    'www',
    'api',
    'admin',
    'app',
    'svatbot',
    'svatba',
    'wedding',
    'test',
    'demo',
    'staging',
    'dev',
    'localhost',
    'mail',
    'ftp',
    'smtp',
    'pop',
    'imap',
  ]
  
  if (reservedWords.includes(customUrl)) {
    return {
      valid: false,
      error: 'Toto URL je rezervované a nelze ho použít'
    }
  }
  
  return { valid: true }
}

/**
 * Normalizuje custom URL
 * - Převede na malá písmena
 * - Odstraní diakritiku
 * - Nahradí mezery pomlčkami
 * - Odstraní nepovolené znaky
 */
export function normalizeCustomUrl(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Odstranění diakritiky
    .replace(/\s+/g, '-') // Mezery na pomlčky
    .replace(/[^a-z0-9-]/g, '') // Odstranění nepovolených znaků
    .replace(/-+/g, '-') // Více pomlček na jednu
    .replace(/^-|-$/g, '') // Odstranění pomlček na začátku/konci
}

/**
 * Generuje návrhy custom URL z jmen
 */
export function generateCustomUrlSuggestions(
  bride: string,
  groom: string,
  weddingDate?: Date
): string[] {
  const normalizedBride = normalizeCustomUrl(bride)
  const normalizedGroom = normalizeCustomUrl(groom)
  
  const suggestions: string[] = []
  
  // Základní kombinace
  suggestions.push(`${normalizedBride}-${normalizedGroom}`)
  suggestions.push(`${normalizedGroom}-${normalizedBride}`)
  
  // S rokem
  if (weddingDate) {
    const year = weddingDate.getFullYear()
    suggestions.push(`${normalizedBride}-${normalizedGroom}-${year}`)
    suggestions.push(`${normalizedGroom}-${normalizedBride}-${year}`)
  }
  
  // Pouze příjmení (pokud jsou různá)
  const brideSurname = normalizedBride.split('-').pop() || normalizedBride
  const groomSurname = normalizedGroom.split('-').pop() || normalizedGroom
  
  if (brideSurname !== groomSurname) {
    suggestions.push(`${brideSurname}-${groomSurname}`)
    suggestions.push(`${groomSurname}-${brideSurname}`)
  }
  
  // Svatba + jména
  suggestions.push(`svatba-${normalizedBride}-${normalizedGroom}`)
  
  // Odstranění duplicit
  return Array.from(new Set(suggestions))
}

/**
 * Kontroluje dostupnost custom URL v Firestore
 */
export async function checkCustomUrlAvailability(
  customUrl: string,
  db: any // Firestore instance
): Promise<boolean> {
  try {
    const { collection, query, where, getDocs } = await import('firebase/firestore')
    
    const websitesRef = collection(db, 'weddingWebsites')
    const q = query(websitesRef, where('customUrl', '==', customUrl))
    const snapshot = await getDocs(q)
    
    return snapshot.empty
  } catch (error) {
    console.error('Error checking URL availability:', error)
    return false
  }
}

/**
 * Vytvoří QR kód URL pro svatební web
 */
export function getQRCodeUrl(customUrl: string, baseDomain: string = 'svatbot.cz'): string {
  const websiteUrl = getWeddingWebsiteUrl(customUrl, baseDomain)
  // Použijeme QR code API (např. qrcode.react nebo externí službu)
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(websiteUrl)}`
}

/**
 * Parsuje custom URL z různých formátů
 */
export function parseCustomUrl(input: string): string | null {
  try {
    // Pokud je to URL, extrahuj custom URL
    if (input.includes('://')) {
      const url = new URL(input)
      const subdomain = getSubdomain(url.hostname)
      if (subdomain && !MAIN_DOMAINS.includes(subdomain)) {
        return subdomain
      }
      
      // Zkus path-based URL (/w/[customUrl])
      const pathMatch = url.pathname.match(/^\/w\/([a-z0-9-]+)/)
      if (pathMatch) {
        return pathMatch[1]
      }
      
      return null
    }
    
    // Pokud je to hostname
    if (input.includes('.')) {
      const subdomain = getSubdomain(input)
      if (subdomain && !MAIN_DOMAINS.includes(subdomain)) {
        return subdomain
      }
      return null
    }
    
    // Jinak to považuj za custom URL
    return normalizeCustomUrl(input)
  } catch (error) {
    return null
  }
}

