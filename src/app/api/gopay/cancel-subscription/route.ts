import { NextRequest, NextResponse } from 'next/server'
import { getAdminDb } from '@/config/firebase-admin'
import { Timestamp } from 'firebase-admin/firestore'

/**
 * Cancel Subscription
 * 
 * For GoPay, we don't have recurring subscriptions like Stripe.
 * This endpoint just marks the subscription as canceled in Firestore.
 * The subscription will remain active until the end of the current period.
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

    console.log('🔄 Canceling subscription for user:', userId)

    // Update subscription in Firestore
    const adminDb = getAdminDb()
    const subscriptionRef = adminDb.collection('subscriptions').doc(userId)
    
    await subscriptionRef.update({
      cancelAtPeriodEnd: true,
      canceledAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    })

    console.log('✅ Subscription canceled')

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('Error canceling subscription:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to cancel subscription' },
      { status: 500 }
    )
  }
}

