import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(new URL('/integrations?error=google_auth_failed', request.url))
  }

  if (!code) {
    return NextResponse.redirect(new URL('/integrations?error=no_auth_code', request.url))
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${request.nextUrl.origin}/api/auth/google/callback`,
      }),
    })

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for tokens')
    }

    const tokens = await tokenResponse.json()

    // Create a response that will set tokens in localStorage via client-side script
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Google Calendar Authorization</title>
        </head>
        <body>
          <script>
            // Store tokens in localStorage
            localStorage.setItem('google_calendar_access_token', '${tokens.access_token}');
            if ('${tokens.refresh_token}') {
              localStorage.setItem('google_calendar_refresh_token', '${tokens.refresh_token}');
            }
            
            // Close popup and redirect parent
            if (window.opener) {
              window.opener.postMessage({ type: 'GOOGLE_AUTH_SUCCESS' }, '*');
              window.close();
            } else {
              window.location.href = '/integrations?success=google_connected';
            }
          </script>
          <p>Autorizace úspěšná! Okno se automaticky zavře...</p>
        </body>
      </html>
    `

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    })
  } catch (error) {
    console.error('Google OAuth callback error:', error)
    return NextResponse.redirect(new URL('/integrations?error=token_exchange_failed', request.url))
  }
}
