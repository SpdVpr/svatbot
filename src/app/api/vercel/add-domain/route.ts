import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  console.log('🔥 Vercel API endpoint called: /api/vercel/add-domain')
  try {
    const { subdomain } = await request.json()
    console.log('📝 Received subdomain:', subdomain)

    if (!subdomain) {
      console.error('❌ No subdomain provided')
      return NextResponse.json(
        { error: 'Subdomain is required' },
        { status: 400 }
      )
    }

    // Vercel API token z environment variables
    const vercelToken = process.env.VERCEL_API_TOKEN
    const projectId = process.env.VERCEL_PROJECT_ID || 'svatbot'

    console.log('🔑 Vercel token exists:', !!vercelToken)
    console.log('🏗️ Project ID:', projectId)

    if (!vercelToken) {
      console.error('❌ VERCEL_API_TOKEN not found in environment variables')
      return NextResponse.json(
        { error: 'Vercel API token not configured' },
        { status: 500 }
      )
    }

    const domainName = `${subdomain}.svatbot.cz`

    // Přidání domény do Vercel projektu
    const response = await fetch(`https://api.vercel.com/v10/projects/${projectId}/domains`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${vercelToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: domainName,
        gitBranch: null,
        redirect: null,
        redirectStatusCode: null,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Vercel API error:', data)
      
      // Pokud doména už existuje, považujeme to za úspěch
      if (response.status === 400 && data.error?.code === 'domain_already_exists') {
        return NextResponse.json({
          success: true,
          domain: domainName,
          message: 'Domain already exists',
          verified: true,
        })
      }

      return NextResponse.json(
        { 
          error: 'Failed to add domain to Vercel project',
          details: data.error?.message || 'Unknown error'
        },
        { status: response.status }
      )
    }

    // Pokud doména potřebuje verifikaci
    if (!data.verified && data.verification) {
      console.log('Domain needs verification:', data.verification)
      
      // Pro automatické DNS záznamy (wildcard), doména by měla být automaticky verifikována
      // Pokud ne, můžeme zkusit verifikaci
      try {
        const verifyResponse = await fetch(
          `https://api.vercel.com/v10/projects/${projectId}/domains/${domainName}/verify`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${vercelToken}`,
              'Content-Type': 'application/json',
            },
          }
        )

        if (verifyResponse.ok) {
          const verifyData = await verifyResponse.json()
          return NextResponse.json({
            success: true,
            domain: domainName,
            verified: verifyData.verified || false,
            verification: data.verification,
          })
        }
      } catch (verifyError) {
        console.error('Domain verification failed:', verifyError)
      }
    }

    return NextResponse.json({
      success: true,
      domain: domainName,
      verified: data.verified || false,
      verification: data.verification || null,
    })

  } catch (error) {
    console.error('Error adding domain:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
