import { NextResponse } from 'next/server'

/**
 * Spotify Token API Route
 *
 * Gets access token using Client Credentials Flow
 * This is a server-side only route to keep credentials secure
 */

export async function GET() {
  try {
    const clientId = process.env.SPOTIFY_CLIENT_ID
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      console.error('Missing Spotify credentials in environment variables')
      return NextResponse.json(
        { error: 'Spotify API not configured' },
        { status: 500 }
      )
    }

    // Get access token from Spotify
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64')
      },
      body: 'grant_type=client_credentials',
      cache: 'no-store'
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Spotify API error:', response.status, errorData)
      throw new Error(`Spotify API returned ${response.status}`)
    }

    const data = await response.json()

    // Return token with cache headers
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'private, max-age=3000' // Cache for 50 minutes (token valid for 1 hour)
      }
    })

  } catch (error) {
    console.error('Spotify token error:', error)
    return NextResponse.json(
      { error: 'Failed to get Spotify token' },
      { status: 500 }
    )
  }
}

