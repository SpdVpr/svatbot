import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { refreshToken } = await request.json()

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token is required' },
        { status: 400 }
      )
    }

    // Exchange refresh token for new access token
    const tokenResponse = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID || '',
        client_secret: process.env.MICROSOFT_CLIENT_SECRET || '',
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
        scope: 'https://graph.microsoft.com/calendars.readwrite',
      }),
    })

    if (tokenResponse.ok) {
      const tokens = await tokenResponse.json()
      
      return NextResponse.json({
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || refreshToken, // Some providers don't return new refresh token
        expiresIn: tokens.expires_in || 3600
      })
    } else {
      const error = await tokenResponse.json()
      console.error('Microsoft token refresh failed:', error)
      
      return NextResponse.json(
        { error: 'Token refresh failed' },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error('Microsoft token refresh error:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
