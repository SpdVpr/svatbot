import { NextRequest, NextResponse } from 'next/server'
import { createGoPayPaymentServer } from '@/lib/gopay-server'

/**
 * Test Recurring Payments Endpoint
 * 
 * This endpoint creates a test payment with DAILY recurrence for quick testing.
 * In production, monthly payments use MONTH cycle.
 * 
 * Usage: POST /api/gopay/test-recurring
 * Body: { userId, userEmail }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, userEmail } = body

    if (!userId || !userEmail) {
      return NextResponse.json(
        { error: 'Missing userId or userEmail' },
        { status: 400 }
      )
    }

    console.log('🧪 Creating TEST recurring payment (daily cycle) for:', userId)

    // Create payment with DAILY recurrence for testing
    // This will recur every day instead of every month
    const payment = await createGoPayPaymentServer({
      userId,
      userEmail,
      plan: 'premium_monthly', // Use monthly plan but with daily recurrence
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/?payment=success`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/?payment=canceled`
    })

    console.log('✅ Test recurring payment created:', payment.id)
    console.log('⏰ This payment will recur DAILY for testing purposes')
    console.log('💡 In production, monthly payments recur MONTHLY')

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      orderNumber: payment.order_number,
      gatewayUrl: payment.gw_url,
      state: payment.state,
      message: 'Test recurring payment created. Will recur daily for testing.'
    })

  } catch (error: any) {
    console.error('Error creating test recurring payment:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create test payment' },
      { status: 500 }
    )
  }
}

