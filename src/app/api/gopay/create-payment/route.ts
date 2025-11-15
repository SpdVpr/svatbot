import { NextRequest, NextResponse } from 'next/server'
import { createGoPayPaymentServer } from '@/lib/gopay-server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, userEmail, plan, successUrl, cancelUrl } = body

    console.log('📥 Create payment request:', { userId, userEmail, plan, successUrl, cancelUrl })

    if (!userId || !userEmail || !plan) {
      console.error('❌ Missing required fields:', { userId, userEmail, plan })
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate plan type
    if (plan !== 'premium_monthly' && plan !== 'premium_yearly') {
      console.error('❌ Invalid plan type:', plan)
      return NextResponse.json(
        { error: 'Invalid plan type' },
        { status: 400 }
      )
    }

    console.log('🔄 Calling createGoPayPaymentServer...')

    // Create GoPay payment
    const payment = await createGoPayPaymentServer({
      userId,
      userEmail,
      plan: plan as 'premium_monthly' | 'premium_yearly',
      successUrl,
      cancelUrl
    })

    console.log('✅ Payment created successfully:', { id: payment.id, state: payment.state })

    return NextResponse.json({
      id: payment.id,
      order_number: payment.order_number,
      gw_url: payment.gw_url,
      state: payment.state
    })

  } catch (error: any) {
    console.error('❌ Error creating GoPay payment:', {
      message: error.message,
      stack: error.stack,
      error: error
    })
    return NextResponse.json(
      {
        error: error.message || 'Failed to create payment',
        details: error.stack
      },
      { status: 500 }
    )
  }
}

