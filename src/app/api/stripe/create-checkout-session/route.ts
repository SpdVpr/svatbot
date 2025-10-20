import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover'
})

// Price IDs - will be set after creating products in Stripe
const PRICE_IDS = {
  premium_monthly: process.env.STRIPE_PRICE_MONTHLY || 'price_premium_monthly',
  premium_yearly: process.env.STRIPE_PRICE_YEARLY || 'price_premium_yearly'
}

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

    // Get or create Stripe customer
    let customer: Stripe.Customer

    // Search for existing customer by email
    const existingCustomers = await stripe.customers.list({
      email: userEmail,
      limit: 1
    })

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0]
    } else {
      // Create new customer
      customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          userId,
          source: 'svatbot'
        }
      })
    }

    // Get price ID for the selected plan
    const priceId = PRICE_IDS[plan as keyof typeof PRICE_IDS]

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId,
        userEmail,
        plan
      },
      subscription_data: {
        metadata: {
          userId,
          userEmail,
          plan
        }
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required'
    })

    return NextResponse.json({
      sessionId: session.id,
      url: session.url
    })
  } catch (error: any) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}

