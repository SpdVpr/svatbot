import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  // Handle OAuth error
  if (error) {
    return new NextResponse(`
      <html>
        <body>
          <script>
            window.opener.postMessage({
              type: 'MICROSOFT_AUTH_ERROR',
              error: '${error}'
            }, '${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}');
            window.close();
          </script>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' },
    })
  }

  // Handle successful OAuth callback
  if (code && state) {
    try {
      // Exchange code for tokens
      const tokenResponse = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID || '',
          client_secret: process.env.MICROSOFT_CLIENT_SECRET || '',
          code,
          redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/microsoft/callback`,
          grant_type: 'authorization_code',
          scope: 'https://graph.microsoft.com/calendars.readwrite',
        }),
      })

      if (tokenResponse.ok) {
        const tokens = await tokenResponse.json()
        
        return new NextResponse(`
          <html>
            <body>
              <script>
                window.opener.postMessage({
                  type: 'MICROSOFT_AUTH_SUCCESS',
                  accessToken: '${tokens.access_token}',
                  refreshToken: '${tokens.refresh_token || ''}',
                  expiresIn: ${tokens.expires_in || 3600}
                }, '${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}');
                window.close();
              </script>
            </body>
          </html>
        `, {
          headers: { 'Content-Type': 'text/html' },
        })
      } else {
        throw new Error('Token exchange failed')
      }
    } catch (error) {
      console.error('Microsoft OAuth callback error:', error)
      
      return new NextResponse(`
        <html>
          <body>
            <script>
              window.opener.postMessage({
                type: 'MICROSOFT_AUTH_ERROR',
                error: 'Token exchange failed'
              }, '${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}');
              window.close();
            </script>
          </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' },
      })
    }
  }

  // Invalid callback
  return new NextResponse(`
    <html>
      <body>
        <script>
          window.opener.postMessage({
            type: 'MICROSOFT_AUTH_ERROR',
            error: 'Invalid callback parameters'
          }, '${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}');
          window.close();
        </script>
      </body>
    </html>
  `, {
    headers: { 'Content-Type': 'text/html' },
  })
}
