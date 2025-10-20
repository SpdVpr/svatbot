import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { db } from '@/config/firebase'
import { doc, updateDoc, addDoc, collection, Timestamp } from 'firebase/firestore'

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
  const userId = session.metadata?.userId
  const userEmail = session.metadata?.userEmail
  const plan = session.metadata?.plan

  if (!userId) {
    console.error('No userId in session metadata')
    return
  }

  console.log('✅ Checkout completed:', { userId, plan })

  // Get subscription details
  const subscriptionData: any = await stripe.subscriptions.retrieve(
    session.subscription as string
  )

  // Update subscription in Firestore
  const subscriptionRef = doc(db, 'subscriptions', userId)
  await updateDoc(subscriptionRef, {
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
}

async function handleSubscriptionUpdate(subscription: any) {
  const userId = subscription.metadata?.userId

  if (!userId) {
    console.error('No userId in subscription metadata')
    return
  }

  console.log('🔄 Subscription updated:', { userId, status: subscription.status })

  const subscriptionRef = doc(db, 'subscriptions', userId)
  await updateDoc(subscriptionRef, {
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

  const subscriptionRef = doc(db, 'subscriptions', userId)
  await updateDoc(subscriptionRef, {
    status: 'canceled',
    canceledAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  })
}

async function handlePaymentSucceeded(invoice: any) {
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

  console.log('💰 Payment succeeded:', { userId, amount: invoice.amount_paid })

  // Create payment record
  await addDoc(collection(db, 'payments'), {
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
    createdAt: Timestamp.fromDate(new Date(invoice.created * 1000)),
    paidAt: Timestamp.now()
  })
}

async function handlePaymentFailed(invoice: any) {
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

  console.log('❌ Payment failed:', { userId, amount: invoice.amount_due })

  // Create payment record
  await addDoc(collection(db, 'payments'), {
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
    createdAt: Timestamp.fromDate(new Date(invoice.created * 1000))
  })
}

