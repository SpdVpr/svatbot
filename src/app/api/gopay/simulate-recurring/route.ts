import { NextRequest, NextResponse } from 'next/server'
import { getAdminDb } from '@/config/firebase-admin'
import { Timestamp } from 'firebase-admin/firestore'

/**
 * Simulate Recurring Payment
 * 
 * This endpoint simulates what happens when GoPay automatically charges
 * a recurring payment. It's for testing purposes only.
 * 
 * In production, GoPay will automatically:
 * 1. Charge the customer's card
 * 2. Send webhook notification with parent_id parameter
 * 3. Our webhook handler will process it and extend subscription
 * 
 * This endpoint allows you to test the subscription extension logic
 * without waiting for the actual recurring payment.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing user ID' },
        { status: 400 }
      )
    }

    console.log('🧪 Simulating recurring payment for user:', userId)

    const adminDb = getAdminDb()
    const subscriptionRef = adminDb.collection('subscriptions').doc(userId)
    const subscriptionDoc = await subscriptionRef.get()

    if (!subscriptionDoc.exists) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      )
    }

    const subscription = subscriptionDoc.data()

    // Only monthly subscriptions have recurring payments
    if (subscription?.plan !== 'premium_monthly') {
      return NextResponse.json(
        { error: 'Only monthly subscriptions have recurring payments' },
        { status: 400 }
      )
    }

    // Check if subscription is active
    if (subscription?.status !== 'active') {
      return NextResponse.json(
        { error: 'Subscription is not active' },
        { status: 400 }
      )
    }

    // Calculate new period dates (extend by 1 month)
    const currentEnd = subscription.currentPeriodEnd.toDate()
    const newStart = new Date(currentEnd)
    const newEnd = new Date(currentEnd)
    newEnd.setMonth(newEnd.getMonth() + 1)

    console.log('📅 Extending subscription:', {
      currentEnd: currentEnd.toISOString(),
      newStart: newStart.toISOString(),
      newEnd: newEnd.toISOString()
    })

    // Update subscription with new period
    await subscriptionRef.update({
      currentPeriodStart: Timestamp.fromDate(newStart),
      currentPeriodEnd: Timestamp.fromDate(newEnd),
      updatedAt: Timestamp.now()
    })

    // Create a simulated payment record
    const paymentRef = adminDb.collection('payments').doc()
    await paymentRef.set({
      userId,
      plan: subscription.plan,
      amount: subscription.amount,
      currency: subscription.currency,
      status: 'succeeded',
      goPayId: Math.floor(Math.random() * 1000000000), // Simulated payment ID
      goPayState: 'PAID',
      goPayParentPaymentId: subscription.goPayPaymentId, // Reference to original payment
      isRecurring: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    })

    console.log('✅ Recurring payment simulated successfully')
    console.log('✅ Subscription extended to:', newEnd.toISOString())

    return NextResponse.json({
      success: true,
      message: 'Recurring payment simulated successfully',
      subscription: {
        plan: subscription.plan,
        previousPeriodEnd: currentEnd.toISOString(),
        newPeriodStart: newStart.toISOString(),
        newPeriodEnd: newEnd.toISOString(),
        amount: subscription.amount,
        currency: subscription.currency
      }
    })

  } catch (error: any) {
    console.error('Error simulating recurring payment:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to simulate recurring payment' },
      { status: 500 }
    )
  }
}

