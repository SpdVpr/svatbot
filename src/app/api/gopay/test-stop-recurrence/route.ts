import { NextRequest, NextResponse } from 'next/server'
import { stopRecurrence } from '@/lib/gopay-server'

/**
 * Test endpoint to manually stop recurrence for a specific payment ID
 * Usage: POST /api/gopay/test-stop-recurrence with body: { paymentId: 9190835210 }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { paymentId } = body

    if (!paymentId) {
      return NextResponse.json(
        { error: 'Missing paymentId' },
        { status: 400 }
      )
    }

    console.log('🧪 Testing stop recurrence for payment:', paymentId)

    try {
      await stopRecurrence(paymentId)
      console.log('✅ Successfully stopped recurrence')
      
      return NextResponse.json({
        success: true,
        message: `Successfully stopped recurrence for payment ${paymentId}`,
        paymentId
      })
    } catch (error: any) {
      console.error('❌ Failed to stop recurrence:', error)
      
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error.toString(),
        paymentId
      }, { status: 500 })
    }

  } catch (error: any) {
    console.error('Error in test endpoint:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to test stop recurrence' },
      { status: 500 }
    )
  }
}

