import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, role, secretKey } = body

    if (!userId || !role || !secretKey) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: userId, role, secretKey' },
        { status: 400 }
      )
    }

    // Call Firebase Cloud Function directly via HTTP
    const functionUrl = 'https://europe-west1-svatbot-app.cloudfunctions.net/setAdminRole'

    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          userId,
          role,
          secretKey
        }
      })
    })

    const result = await response.json()

    if (result.result?.success) {
      return NextResponse.json({
        success: true,
        message: result.result.message
      })
    } else {
      return NextResponse.json(
        { success: false, message: result.result?.message || result.error?.message || 'Failed to set admin role' },
        { status: 400 }
      )
    }
  } catch (error: any) {
    console.error('Error setting admin role:', error)
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to set admin role'
      },
      { status: 500 }
    )
  }
}

