import { NextRequest, NextResponse } from 'next/server'

/**
 * Test GoPay Configuration
 * 
 * This endpoint checks if all GoPay environment variables are properly set.
 * Use this to diagnose configuration issues.
 */
export async function GET(request: NextRequest) {
  try {
    const config = {
      goId: process.env.NEXT_PUBLIC_GOPAY_GOID,
      clientId: process.env.NEXT_PUBLIC_GOPAY_CLIENT_ID,
      clientSecret: process.env.GOPAY_CLIENT_SECRET,
      environment: process.env.NEXT_PUBLIC_GOPAY_ENVIRONMENT,
      appUrl: process.env.NEXT_PUBLIC_APP_URL
    }

    const status = {
      hasGoId: !!config.goId,
      hasClientId: !!config.clientId,
      hasClientSecret: !!config.clientSecret,
      hasEnvironment: !!config.environment,
      hasAppUrl: !!config.appUrl,
      
      // Show partial values for debugging (not full secrets)
      goIdPreview: config.goId ? `${config.goId.substring(0, 4)}...` : 'NOT SET',
      clientIdPreview: config.clientId ? `${config.clientId.substring(0, 4)}...` : 'NOT SET',
      clientSecretPreview: config.clientSecret ? `${config.clientSecret.substring(0, 2)}...` : 'NOT SET',
      environment: config.environment || 'NOT SET',
      appUrl: config.appUrl || 'NOT SET'
    }

    const allSet = status.hasGoId && status.hasClientId && status.hasClientSecret && status.hasEnvironment

    return NextResponse.json({
      success: allSet,
      message: allSet 
        ? '✅ All GoPay environment variables are set!' 
        : '❌ Some GoPay environment variables are missing!',
      status,
      requiredVariables: [
        'NEXT_PUBLIC_GOPAY_GOID',
        'NEXT_PUBLIC_GOPAY_CLIENT_ID',
        'GOPAY_CLIENT_SECRET',
        'NEXT_PUBLIC_GOPAY_ENVIRONMENT',
        'NEXT_PUBLIC_APP_URL'
      ]
    })

  } catch (error: any) {
    console.error('Error checking GoPay config:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to check configuration' 
      },
      { status: 500 }
    )
  }
}

