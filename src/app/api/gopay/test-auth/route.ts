import { NextRequest, NextResponse } from 'next/server'

/**
 * Test GoPay OAuth Authentication
 * 
 * This endpoint tests if we can successfully authenticate with GoPay API
 * using the current credentials.
 */
export async function GET(request: NextRequest) {
  try {
    const { GOPAY_CONFIG } = await import('@/lib/gopay')

    console.log('🔍 Testing GoPay authentication...', {
      clientId: GOPAY_CONFIG.clientId,
      environment: GOPAY_CONFIG.environment,
      apiUrl: GOPAY_CONFIG.apiUrl
    })

    // Validate credentials
    if (!GOPAY_CONFIG.clientId || !GOPAY_CONFIG.clientSecret) {
      return NextResponse.json({
        success: false,
        error: 'Missing GoPay credentials',
        details: {
          hasClientId: !!GOPAY_CONFIG.clientId,
          hasClientSecret: !!GOPAY_CONFIG.clientSecret
        }
      }, { status: 400 })
    }

    // Try to get access token
    const credentials = Buffer.from(`${GOPAY_CONFIG.clientId}:${GOPAY_CONFIG.clientSecret}`).toString('base64')

    console.log('🔑 Attempting OAuth2 authentication...')
    console.log('API URL:', `${GOPAY_CONFIG.apiUrl}/oauth2/token`)

    const response = await fetch(`${GOPAY_CONFIG.apiUrl}/oauth2/token`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`
      },
      body: 'grant_type=client_credentials&scope=payment-create'
    })

    const responseText = await response.text()
    
    console.log('📥 GoPay response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      body: responseText
    })

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: 'GoPay authentication failed',
        details: {
          status: response.status,
          statusText: response.statusText,
          response: responseText,
          apiUrl: GOPAY_CONFIG.apiUrl,
          environment: GOPAY_CONFIG.environment,
          clientIdPreview: `${GOPAY_CONFIG.clientId.substring(0, 4)}...`,
          clientSecretPreview: `${GOPAY_CONFIG.clientSecret.substring(0, 2)}...`
        }
      }, { status: response.status })
    }

    const data = JSON.parse(responseText)

    return NextResponse.json({
      success: true,
      message: '✅ GoPay authentication successful!',
      details: {
        tokenType: data.token_type,
        expiresIn: data.expires_in,
        scope: data.scope,
        environment: GOPAY_CONFIG.environment,
        apiUrl: GOPAY_CONFIG.apiUrl
      }
    })

  } catch (error: any) {
    console.error('❌ Error testing GoPay auth:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to test authentication',
        stack: error.stack
      },
      { status: 500 }
    )
  }
}

