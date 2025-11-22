/**
 * Google Places API Utilities
 * 
 * Functions for fetching Google Place data (ratings, reviews)
 * Used for marketplace vendor integration
 */

import { GoogleReview } from '@/types/vendor'

export interface GooglePlaceData {
  placeId: string
  name: string
  rating: number
  userRatingsTotal: number
  reviews: GoogleReview[]
  url: string // Google Maps URL
}

/**
 * Extract Place ID from various Google Maps URL formats
 * 
 * Supported formats:
 * - https://maps.google.com/?cid=123456789
 * - https://goo.gl/maps/abc123
 * - https://www.google.com/maps/place/...
 * - Direct Place ID: ChIJN1t_tDeuEmsRUsoyG83frY4
 */
export function extractPlaceIdFromUrl(input: string): string | null {
  if (!input) return null

  // If it's already a Place ID (starts with ChIJ)
  if (input.startsWith('ChIJ')) {
    return input
  }

  // Extract CID from URL
  const cidMatch = input.match(/cid=(\d+)/)
  if (cidMatch) {
    // Note: CID needs to be converted to Place ID via API
    // For now, we'll store the CID and convert it server-side
    return `cid:${cidMatch[1]}`
  }

  // Extract from place URL
  const placeMatch = input.match(/place\/([^\/]+)/)
  if (placeMatch) {
    return placeMatch[1]
  }

  // Extract from shortened URL (requires API call to resolve)
  if (input.includes('goo.gl/maps/')) {
    // This needs to be resolved server-side
    return `short:${input}`
  }

  return null
}

/**
 * Fetch Google Place data from our API endpoint
 * This calls our backend which uses Google Places API
 */
export async function fetchGooglePlaceData(
  placeIdOrUrl: string
): Promise<GooglePlaceData | null> {
  try {
    const placeId = extractPlaceIdFromUrl(placeIdOrUrl) || placeIdOrUrl

    const response = await fetch('/api/google-places/details', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ placeId }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Google Places API error:', error)
      return null
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching Google Place data:', error)
    return null
  }
}

/**
 * Generate Google Maps URL from Place ID
 */
export function generateGoogleMapsUrl(placeId: string): string {
  return `https://www.google.com/maps/place/?q=place_id:${placeId}`
}

/**
 * Validate if a string is a valid Place ID
 */
export function isValidPlaceId(placeId: string): boolean {
  // Place IDs typically start with ChIJ and are alphanumeric with underscores/hyphens
  return /^ChIJ[A-Za-z0-9_-]+$/.test(placeId)
}

/**
 * Format relative time for Czech locale
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp * 1000 // Convert to milliseconds
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const months = Math.floor(days / 30)
  const years = Math.floor(days / 365)

  if (years > 0) return `před ${years} ${years === 1 ? 'rokem' : 'lety'}`
  if (months > 0) return `před ${months} ${months === 1 ? 'měsícem' : 'měsíci'}`
  if (days > 0) return `před ${days} ${days === 1 ? 'dnem' : 'dny'}`
  if (hours > 0) return `před ${hours} ${hours === 1 ? 'hodinou' : 'hodinami'}`
  if (minutes > 0) return `před ${minutes} ${minutes === 1 ? 'minutou' : 'minutami'}`
  return 'právě teď'
}

/**
 * Clean and sanitize Google review text
 */
export function sanitizeReviewText(text: string): string {
  // Remove excessive whitespace
  return text.trim().replace(/\s+/g, ' ')
}

