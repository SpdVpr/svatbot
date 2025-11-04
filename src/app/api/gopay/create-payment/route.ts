import { NextRequest, NextResponse } from 'next/server'
import { createGoPayPaymentServer } from '@/lib/gopay-server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, userEmail, plan, successUrl, cancelUrl } = body

    if (!userId || !userEmail || !plan) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate plan type
    if (plan !== 'premium_monthly' && plan !== 'premium_yearly' && plan !== 'test_daily') {
      return NextResponse.json(
        { error: 'Invalid plan type' },
        { status: 400 }
      )
    }

    // Create GoPay payment
    const payment = await createGoPayPaymentServer({
      userId,
      userEmail,
      plan: plan as 'premium_monthly' | 'premium_yearly' | 'test_daily',
      successUrl,
      cancelUrl
    })

    return NextResponse.json({
      id: payment.id,
      order_number: payment.order_number,
      gw_url: payment.gw_url,
      state: payment.state
    })

  } catch (error: any) {
    console.error('Error creating GoPay payment:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create payment' },
      { status: 500 }
    )
  }
}

