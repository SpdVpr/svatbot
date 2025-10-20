import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getAdminDb } from '@/config/firebase-admin'
import { Timestamp } from 'firebase-admin/firestore'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover'
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message)
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      )
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(session)
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdate(subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(subscription)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentSucceeded(invoice)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentFailed(invoice)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: error.message || 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  try {
    const userId = session.metadata?.userId
    const userEmail = session.metadata?.userEmail
    const plan = session.metadata?.plan

    if (!userId) {
      console.error('No userId in session metadata')
      return
    }

    if (!session.subscription) {
      console.error('No subscription in checkout session')
      return
    }

    console.log('✅ Checkout completed:', { userId, plan, subscriptionId: session.subscription })

    // Get subscription details
    const subscriptionData: any = await stripe.subscriptions.retrieve(
      session.subscription as string
    )

    // Update subscription in Firestore using Admin SDK
    const adminDb = getAdminDb()
    const subscriptionRef = adminDb.collection('subscriptions').doc(userId)
    await subscriptionRef.update({
      plan,
      status: 'active',
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: subscriptionData.id,
      currentPeriodStart: Timestamp.fromDate(new Date(subscriptionData.current_period_start * 1000)),
      currentPeriodEnd: Timestamp.fromDate(new Date(subscriptionData.current_period_end * 1000)),
      cancelAtPeriodEnd: false,
      isTrialActive: false,
      updatedAt: Timestamp.now()
    })

    console.log('✅ Subscription updated in Firestore:', userId)
  } catch (error: any) {
    console.error('❌ Error in handleCheckoutCompleted:', error.message)
    throw error
  }
}

async function handleSubscriptionUpdate(subscription: any) {
  const userId = subscription.metadata?.userId

  if (!userId) {
    console.error('No userId in subscription metadata')
    return
  }

  console.log('🔄 Subscription updated:', { userId, status: subscription.status })

  const adminDb = getAdminDb()
  const subscriptionRef = adminDb.collection('subscriptions').doc(userId)
  await subscriptionRef.update({
    status: subscription.status,
    currentPeriodStart: Timestamp.fromDate(new Date(subscription.current_period_start * 1000)),
    currentPeriodEnd: Timestamp.fromDate(new Date(subscription.current_period_end * 1000)),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    canceledAt: subscription.canceled_at
      ? Timestamp.fromDate(new Date(subscription.canceled_at * 1000))
      : null,
    updatedAt: Timestamp.now()
  })
}

async function handleSubscriptionDeleted(subscription: any) {
  const userId = subscription.metadata?.userId

  if (!userId) {
    console.error('No userId in subscription metadata')
    return
  }

  console.log('❌ Subscription deleted:', { userId })

  const adminDb = getAdminDb()
  const subscriptionRef = adminDb.collection('subscriptions').doc(userId)
  await subscriptionRef.update({
    status: 'canceled',
    canceledAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  })
}

async function handlePaymentSucceeded(invoice: any) {
  try {
    // Check if invoice has subscription
    if (!invoice.subscription) {
      console.error('No subscription in invoice')
      return
    }

    const subscriptionData: any = await stripe.subscriptions.retrieve(
      invoice.subscription as string
    )

    const userId = subscriptionData.metadata?.userId
    const userEmail = subscriptionData.metadata?.userEmail
    const plan = subscriptionData.metadata?.plan

    if (!userId) {
      console.error('No userId in subscription metadata')
      return
    }

    console.log('💰 Payment succeeded:', {
      userId,
      amount: invoice.amount_paid,
      invoiceId: invoice.id
    })

    // Create payment record using Admin SDK
    const adminDb = getAdminDb()
    const paymentData = {
      userId,
      userEmail: userEmail || invoice.customer_email,
      subscriptionId: subscriptionData.id,
      amount: invoice.amount_paid / 100, // Convert from cents
      currency: invoice.currency.toUpperCase(),
      status: 'succeeded',
      paymentMethod: 'card',
      plan,
      invoiceNumber: invoice.number,
      invoiceUrl: invoice.hosted_invoice_url,
      stripePaymentIntentId: invoice.payment_intent,
      stripeInvoiceId: invoice.id,
      createdAt: Timestamp.fromMillis(invoice.created * 1000), // Stripe timestamps are in seconds
      paidAt: Timestamp.now()
    }

    const docRef = await adminDb.collection('payments').add(paymentData)
    console.log('✅ Payment record created in Firestore:', docRef.id)
  } catch (error: any) {
    console.error('❌ Error in handlePaymentSucceeded:', error.message)
    throw error
  }
}

async function handlePaymentFailed(invoice: any) {
  try {
    // Check if invoice has subscription
    if (!invoice.subscription) {
      console.error('No subscription in invoice')
      return
    }

    const subscriptionData: any = await stripe.subscriptions.retrieve(
      invoice.subscription as string
    )

    const userId = subscriptionData.metadata?.userId
    const userEmail = subscriptionData.metadata?.userEmail
    const plan = subscriptionData.metadata?.plan

    if (!userId) {
      console.error('No userId in subscription metadata')
      return
    }

    console.log('❌ Payment failed:', {
      userId,
      amount: invoice.amount_due,
      invoiceId: invoice.id
    })

    // Create payment record using Admin SDK
    const adminDb = getAdminDb()
    const paymentData = {
      userId,
      userEmail: userEmail || invoice.customer_email,
      subscriptionId: subscriptionData.id,
      amount: invoice.amount_due / 100, // Convert from cents
      currency: invoice.currency.toUpperCase(),
      status: 'failed',
      paymentMethod: 'card',
      plan,
      invoiceNumber: invoice.number,
      invoiceUrl: invoice.hosted_invoice_url,
      stripePaymentIntentId: invoice.payment_intent,
      stripeInvoiceId: invoice.id,
      createdAt: Timestamp.fromMillis(invoice.created * 1000) // Stripe timestamps are in seconds
    }

    const docRef = await adminDb.collection('payments').add(paymentData)
    console.log('✅ Failed payment record created in Firestore:', docRef.id)
  } catch (error: any) {
    console.error('❌ Error in handlePaymentFailed:', error.message)
    throw error
  }
}

