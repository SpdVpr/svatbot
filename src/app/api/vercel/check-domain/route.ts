import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const subdomain = searchParams.get('subdomain')

    if (!subdomain) {
      return NextResponse.json(
        { error: 'Subdomain parameter is required' },
        { status: 400 }
      )
    }

    // Vercel API token z environment variables
    const vercelToken = process.env.VERCEL_API_TOKEN
    const projectId = process.env.VERCEL_PROJECT_ID || 'svatbot'

    if (!vercelToken) {
      console.error('VERCEL_API_TOKEN not found in environment variables')
      return NextResponse.json(
        { error: 'Vercel API token not configured' },
        { status: 500 }
      )
    }

    const domainName = `${subdomain}.svatbot.cz`

    // Kontrola stavu domény v Vercel projektu
    const response = await fetch(`https://api.vercel.com/v9/projects/${projectId}/domains/${domainName}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${vercelToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({
          exists: false,
          domain: domainName,
          message: 'Domain not found in project',
        })
      }

      const data = await response.json()
      console.error('Vercel API error:', data)
      
      return NextResponse.json(
        { 
          error: 'Failed to check domain status',
          details: data.error?.message || 'Unknown error'
        },
        { status: response.status }
      )
    }

    const data = await response.json()

    return NextResponse.json({
      exists: true,
      domain: domainName,
      verified: data.verified || false,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      verification: data.verification || null,
    })

  } catch (error) {
    console.error('Error checking domain:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
