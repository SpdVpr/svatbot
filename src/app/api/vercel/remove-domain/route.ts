import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(request: NextRequest) {
  try {
    const { subdomain } = await request.json()

    if (!subdomain) {
      return NextResponse.json(
        { error: 'Subdomain is required' },
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

    // Odebrání domény z Vercel projektu
    const response = await fetch(`https://api.vercel.com/v9/projects/${projectId}/domains/${domainName}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${vercelToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const data = await response.json()
      console.error('Vercel API error:', data)
      
      // Pokud doména neexistuje, považujeme to za úspěch
      if (response.status === 404) {
        return NextResponse.json({
          success: true,
          domain: domainName,
          message: 'Domain not found (already removed)',
        })
      }

      return NextResponse.json(
        { 
          error: 'Failed to remove domain from Vercel project',
          details: data.error?.message || 'Unknown error'
        },
        { status: response.status }
      )
    }

    return NextResponse.json({
      success: true,
      domain: domainName,
      message: 'Domain successfully removed',
    })

  } catch (error) {
    console.error('Error removing domain:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
