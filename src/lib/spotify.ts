/**
 * Spotify Web API Client
 * 
 * Provides access to Spotify's search and track information
 * Uses Client Credentials Flow (no user authentication needed)
 */

export interface SpotifyTrack {
  id: string
  name: string
  artists: { name: string }[]
  album: {
    name: string
    images: { url: string; height: number; width: number }[]
  }
  duration_ms: number
  preview_url: string | null
  external_urls: {
    spotify: string
  }
  uri: string
}

export interface SpotifySearchResult {
  tracks: {
    items: SpotifyTrack[]
  }
}

class SpotifyClient {
  private accessToken: string | null = null
  private tokenExpiry: number = 0

  private async getAccessToken(): Promise<string> {
    // Check if we have a valid token
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken
    }

    // Get new token from our API route
    try {
      const response = await fetch('/api/spotify/token')
      const data = await response.json()

      if (data.access_token) {
        this.accessToken = data.access_token
        // Set expiry to 5 minutes before actual expiry for safety
        this.tokenExpiry = Date.now() + (data.expires_in - 300) * 1000

        if (!this.accessToken) {
          throw new Error('Access token is null')
        }

        return this.accessToken
      }

      throw new Error('Failed to get access token')
    } catch (error) {
      console.error('Spotify token error:', error)
      throw error
    }
  }

  async search(query: string, limit: number = 10): Promise<SpotifyTrack[]> {
    try {
      // Validate query
      if (!query || !query.trim()) {
        console.warn('Empty search query')
        return []
      }

      const token = await this.getAccessToken()

      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Spotify API error:', response.status, errorData)
        throw new Error(`Spotify API error: ${response.status}`)
      }

      const data: SpotifySearchResult = await response.json()
      return data.tracks.items
    } catch (error) {
      console.error('Spotify search error:', error)
      return []
    }
  }

  async getTrack(trackId: string): Promise<SpotifyTrack | null> {
    try {
      const token = await this.getAccessToken()
      
      const response = await fetch(
        `https://api.spotify.com/v1/tracks/${trackId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (!response.ok) {
        throw new Error(`Spotify API error: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Spotify get track error:', error)
      return null
    }
  }

  extractTrackId(url: string): string | null {
    // Extract track ID from Spotify URL
    // Formats: 
    // - https://open.spotify.com/track/TRACK_ID
    // - spotify:track:TRACK_ID
    const urlMatch = url.match(/track[\/:]([a-zA-Z0-9]+)/)
    return urlMatch ? urlMatch[1] : null
  }

  formatDuration(ms: number): string {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }
}

export const spotifyClient = new SpotifyClient()

