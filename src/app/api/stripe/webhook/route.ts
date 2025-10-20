import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getAdminDb } from '@/config/firebase-admin'
import { Timestamp } from 'firebase-admin/firestore'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover'
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

// Helper function to convert Stripe timestamp to Firestore Timestamp
// Stripe can send timestamps in seconds OR milliseconds depending on API version
function stripeTimestampToFirestore(timestamp: number): Timestamp {
  // If timestamp is less than year 2100 in seconds (4102444800), it's in seconds
  // Otherwise it's already in milliseconds
  if (timestamp < 4102444800) {
    // Timestamp is in seconds, convert to milliseconds
    return Timestamp.fromMillis(timestamp * 1000)
  } else {
    // Timestamp is already in milliseconds
    return Timestamp.fromMillis(timestamp)
  }
}

export async function POST(request: NextRequest) {
  console.log('🔥 Webhook v2.0 - Using Timestamp.fromMillis() - Deployed:', new Date().toISOString())
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

    console.log('📥 Checkout subscription timestamp data:', {
      current_period_start: subscriptionData.current_period_start,
      current_period_end: subscriptionData.current_period_end,
      billing_cycle_anchor: subscriptionData.billing_cycle_anchor,
      start_date: subscriptionData.start_date,
      hasItems: !!subscriptionData.items,
      itemsCount: subscriptionData.items?.data?.length
    })

    // Use billing_cycle_anchor and calculate end date if current_period fields don't exist
    const periodStart = subscriptionData.current_period_start || subscriptionData.billing_cycle_anchor || subscriptionData.start_date
    const periodEnd = subscriptionData.current_period_end || (subscriptionData.items?.data?.[0]?.current_period_end)

    if (!periodStart || !periodEnd) {
      console.error('❌ Cannot find period start/end in checkout subscription:', {
        current_period_start: subscriptionData.current_period_start,
        current_period_end: subscriptionData.current_period_end,
        billing_cycle_anchor: subscriptionData.billing_cycle_anchor,
        start_date: subscriptionData.start_date
      })
      throw new Error('Missing period start/end in checkout subscription')
    }

    // Update subscription in Firestore using Admin SDK
    const adminDb = getAdminDb()
    const subscriptionRef = adminDb.collection('subscriptions').doc(userId)
    await subscriptionRef.update({
      plan,
      status: 'active',
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: subscriptionData.id,
      currentPeriodStart: stripeTimestampToFirestore(periodStart),
      currentPeriodEnd: stripeTimestampToFirestore(periodEnd),
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
  console.log('📥 Subscription timestamp data:', {
    current_period_start: subscription.current_period_start,
    current_period_end: subscription.current_period_end,
    billing_cycle_anchor: subscription.billing_cycle_anchor,
    start_date: subscription.start_date,
    hasItems: !!subscription.items,
    itemsCount: subscription.items?.data?.length
  })

  // Use billing_cycle_anchor and calculate end date if current_period fields don't exist
  const periodStart = subscription.current_period_start || subscription.billing_cycle_anchor || subscription.start_date
  const periodEnd = subscription.current_period_end || (subscription.items?.data?.[0]?.current_period_end)

  if (!periodStart || !periodEnd) {
    console.error('❌ Cannot find period start/end in subscription:', {
      current_period_start: subscription.current_period_start,
      current_period_end: subscription.current_period_end,
      billing_cycle_anchor: subscription.billing_cycle_anchor,
      start_date: subscription.start_date
    })
    throw new Error('Missing period start/end in subscription')
  }

  const adminDb = getAdminDb()
  const subscriptionRef = adminDb.collection('subscriptions').doc(userId)
  await subscriptionRef.update({
    status: subscription.status,
    currentPeriodStart: stripeTimestampToFirestore(periodStart),
    currentPeriodEnd: stripeTimestampToFirestore(periodEnd),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    canceledAt: subscription.canceled_at
      ? stripeTimestampToFirestore(subscription.canceled_at)
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
    // Get subscription ID from invoice (different locations in different API versions)
    const subscriptionId = invoice.subscription ||
                          invoice.parent?.subscription_details?.subscription ||
                          invoice.lines?.data?.[0]?.parent?.subscription_item_details?.subscription

    if (!subscriptionId) {
      console.error('No subscription in invoice:', {
        hasSubscription: !!invoice.subscription,
        hasParent: !!invoice.parent,
        hasLines: !!invoice.lines?.data?.[0]
      })
      return
    }

    console.log('🔍 Found subscription ID:', subscriptionId)

    const subscriptionData: any = await stripe.subscriptions.retrieve(subscriptionId)

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

    console.log('📥 Invoice timestamp data:', {
      created: invoice.created,
      createdType: typeof invoice.created,
      createdValue: invoice.created,
      multiplied: invoice.created * 1000
    })

    // Validate invoice.created
    if (!invoice.created || typeof invoice.created !== 'number') {
      console.error('❌ Invalid invoice.created:', invoice.created)
      throw new Error(`Invalid invoice.created: ${invoice.created}`)
    }

    // Create payment record using Admin SDK
    const adminDb = getAdminDb()
    const paymentData: any = {
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
      stripeInvoiceId: invoice.id,
      createdAt: stripeTimestampToFirestore(invoice.created),
      paidAt: Timestamp.now()
    }

    // Only add payment_intent if it exists (not present in all API versions)
    if (invoice.payment_intent) {
      paymentData.stripePaymentIntentId = invoice.payment_intent
    }

    const docRef = await adminDb.collection('payments').add(paymentData)
    console.log('✅ Payment record created in Firestore:', docRef.id)

    // 🎯 AFFILIATE TRACKING: Track conversion and create commission
    try {
      await trackAffiliateConversionServer(
        userId,
        userEmail || invoice.customer_email,
        subscriptionData.id,
        plan,
        invoice.amount_paid / 100,
        invoice.payment_intent,
        invoice.id,
        adminDb
      )
    } catch (affiliateError: any) {
      console.error('❌ Error tracking affiliate conversion:', affiliateError.message)
      // Don't throw - payment succeeded, affiliate tracking is secondary
    }
  } catch (error: any) {
    console.error('❌ Error in handlePaymentSucceeded:', error.message)
    throw error
  }
}

/**
 * Track affiliate conversion on server side (called from webhook)
 */
async function trackAffiliateConversionServer(
  userId: string,
  userEmail: string,
  subscriptionId: string,
  plan: string,
  amount: number,
  stripePaymentIntentId?: string,
  stripeInvoiceId?: string,
  adminDb?: any
) {
  try {
    const db = adminDb || getAdminDb()

    // Check if user has affiliate reference
    const refSnapshot = await db.collection('userAffiliateRefs')
      .where('userId', '==', userId)
      .where('converted', '==', false)
      .limit(1)
      .get()

    if (refSnapshot.empty) {
      console.log('ℹ️ No affiliate reference found for user:', userId)
      return
    }

    const refDoc = refSnapshot.docs[0]
    const refData = refDoc.data()
    const affiliateId = refData.affiliateId
    const affiliateCode = refData.affiliateCode

    console.log('🎯 Found affiliate reference:', { affiliateCode, userId })

    // Get affiliate partner to get commission rate
    const partnerSnapshot = await db.collection('affiliatePartners')
      .where('referralCode', '==', affiliateCode)
      .limit(1)
      .get()

    if (partnerSnapshot.empty) {
      console.warn('⚠️ Affiliate partner not found:', affiliateCode)
      return
    }

    const partnerDoc = partnerSnapshot.docs[0]
    const partnerId = partnerDoc.id
    const partnerData = partnerDoc.data()
    const commissionRate = partnerData.customCommissionRate || partnerData.commissionRate || 10
    const commissionAmount = (amount * commissionRate) / 100

    console.log('💰 Creating commission:', {
      affiliateCode,
      amount,
      commissionRate,
      commissionAmount
    })

    // Create commission record
    await db.collection('commissions').add({
      affiliateId: partnerId,
      affiliateCode,
      userId,
      userEmail,
      subscriptionId,
      stripePaymentIntentId: stripePaymentIntentId || null,
      stripeInvoiceId: stripeInvoiceId || null,
      plan,
      amount,
      currency: 'CZK',
      commissionRate,
      commissionAmount,
      status: 'confirmed',
      createdAt: Timestamp.now(),
      confirmedAt: Timestamp.now()
    })

    // Update affiliate reference
    await refDoc.ref.update({
      converted: true,
      subscriptionId,
      convertedAt: Timestamp.now()
    })

    // Update click record
    const clickSnapshot = await db.collection('affiliateClicks')
      .where('affiliateId', '==', partnerId)
      .where('userId', '==', userId)
      .limit(1)
      .get()

    if (!clickSnapshot.empty) {
      await clickSnapshot.docs[0].ref.update({
        subscriptionId,
        convertedAt: Timestamp.now()
      })
    }

    // Update partner stats
    const stats = partnerData.stats || {}
    await partnerDoc.ref.update({
      'stats.totalConversions': (stats.totalConversions || 0) + 1,
      'stats.totalRevenue': (stats.totalRevenue || 0) + amount,
      'stats.totalCommission': (stats.totalCommission || 0) + commissionAmount,
      'stats.pendingCommission': (stats.pendingCommission || 0) + commissionAmount,
      lastActivityAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    })

    console.log('✅ Affiliate conversion tracked successfully:', {
      affiliateCode,
      commissionAmount
    })
  } catch (err: any) {
    console.error('❌ Error in trackAffiliateConversionServer:', err.message)
    throw err
  }
}

async function handlePaymentFailed(invoice: any) {
  try {
    // Get subscription ID from invoice (different locations in different API versions)
    const subscriptionId = invoice.subscription ||
                          invoice.parent?.subscription_details?.subscription ||
                          invoice.lines?.data?.[0]?.parent?.subscription_item_details?.subscription

    if (!subscriptionId) {
      console.error('No subscription in failed invoice:', {
        hasSubscription: !!invoice.subscription,
        hasParent: !!invoice.parent,
        hasLines: !!invoice.lines?.data?.[0]
      })
      return
    }

    console.log('🔍 Found subscription ID in failed payment:', subscriptionId)

    const subscriptionData: any = await stripe.subscriptions.retrieve(subscriptionId)

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

    console.log('📥 Invoice timestamp data (failed):', {
      created: invoice.created,
      createdType: typeof invoice.created,
      createdValue: invoice.created,
      multiplied: invoice.created * 1000
    })

    // Validate invoice.created
    if (!invoice.created || typeof invoice.created !== 'number') {
      console.error('❌ Invalid invoice.created:', invoice.created)
      throw new Error(`Invalid invoice.created: ${invoice.created}`)
    }

    // Create payment record using Admin SDK
    const adminDb = getAdminDb()
    const paymentData: any = {
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
      stripeInvoiceId: invoice.id,
      createdAt: stripeTimestampToFirestore(invoice.created),
      failedAt: Timestamp.now()
    }

    // Only add payment_intent if it exists (not present in all API versions)
    if (invoice.payment_intent) {
      paymentData.stripePaymentIntentId = invoice.payment_intent
    }

    const docRef = await adminDb.collection('payments').add(paymentData)
    console.log('✅ Failed payment record created in Firestore:', docRef.id)
  } catch (error: any) {
    console.error('❌ Error in handlePaymentFailed:', error.message)
    throw error
  }
}

