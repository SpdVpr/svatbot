import { NextRequest, NextResponse } from 'next/server'
import { getAdminDb } from '@/config/firebase-admin'

/**
 * Stop Recurring Payments
 * 
 * This endpoint stops automatic recurring payments for a subscription.
 * Note: GoPay API doesn't have a direct "stop recurrence" endpoint.
 * The recurrence stops automatically when:
 * 1. The recurrence_date_to is reached
 * 2. The user cancels it through GoPay interface
 * 3. Multiple payment failures occur
 * 
 * We mark the subscription as "canceled" in our system.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      )
    }

    console.log('🛑 Stopping recurring payments for user:', userId)

    const adminDb = getAdminDb()
    const subscriptionRef = adminDb.collection('subscriptions').doc(userId)
    const subscriptionDoc = await subscriptionRef.get()

    if (!subscriptionDoc.exists) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      )
    }

    const subscriptionData = subscriptionDoc.data()

    // Mark subscription as canceled at period end
    await subscriptionRef.update({
      cancelAtPeriodEnd: true,
      canceledAt: new Date(),
      updatedAt: new Date()
    })

    console.log('✅ Subscription marked for cancellation at period end')
    console.log('📅 Will remain active until:', subscriptionData?.currentPeriodEnd?.toDate())

    return NextResponse.json({
      success: true,
      message: 'Subscription will be canceled at the end of current period',
      currentPeriodEnd: subscriptionData?.currentPeriodEnd?.toDate()
    })

  } catch (error: any) {
    console.error('Error stopping recurrence:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to stop recurrence' },
      { status: 500 }
    )
  }
}

