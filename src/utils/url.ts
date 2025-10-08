/**
 * Ensures a URL has a protocol (http:// or https://)
 * If the URL already has a protocol, returns it unchanged
 * Otherwise, adds https:// prefix
 */
export function ensureUrlProtocol(url: string): string {
  if (!url || url.trim() === '') {
    return ''
  }

  const trimmedUrl = url.trim()
  
  // Check if URL already has a protocol
  if (trimmedUrl.match(/^https?:\/\//i)) {
    return trimmedUrl
  }

  // Add https:// prefix
  return `https://${trimmedUrl}`
}

/**
 * Removes protocol from URL for display purposes
 */
export function removeUrlProtocol(url: string): string {
  if (!url) return ''
  return url.replace(/^https?:\/\//i, '')
}

