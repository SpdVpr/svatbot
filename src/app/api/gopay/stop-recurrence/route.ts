import { NextRequest, NextResponse } from 'next/server'
import { getAdminDb } from '@/config/firebase-admin'
import { Timestamp } from 'firebase-admin/firestore'
import { stopRecurrence } from '@/lib/gopay-server'

/**
 * Stop Recurring Payments
 *
 * This endpoint stops automatic recurring payments for a subscription.
 * It uses GoPay's void_recurrence API endpoint to cancel future recurring payments.
 *
 * Note: This is similar to cancel-subscription but more explicit about stopping recurrence.
 * Use cancel-subscription for user-initiated cancellations.
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

    // Find all payments for this user
    const paymentsSnapshot = await adminDb.collection('payments')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(50) // Check last 50 payments
      .get()

    let recurrencePaymentId: number | null = null

    // Strategy 1: Find payment marked with hasRecurrence flag (most reliable)
    for (const doc of paymentsSnapshot.docs) {
      const paymentData = doc.data()
      if (paymentData.goPayId && paymentData.hasRecurrence === true) {
        recurrencePaymentId = paymentData.goPayId
        console.log('📋 Found parent payment with hasRecurrence flag:', recurrencePaymentId)
        break
      }
    }

    // Strategy 2: Find a recurring payment (one that has parentGoPayId)
    // The parent payment is the one referenced in parentGoPayId
    if (!recurrencePaymentId) {
      const recurringPayments = paymentsSnapshot.docs.filter(doc => {
        const data = doc.data()
        return data.parentGoPayId && data.parentGoPayId > 0
      })

      if (recurringPayments.length > 0) {
        // Get the parent payment ID from the most recent recurring payment
        const mostRecentRecurring = recurringPayments[0].data()
        recurrencePaymentId = mostRecentRecurring.parentGoPayId
        console.log('📋 Found parent payment from recurring payment:', recurrencePaymentId)
      }
    }

    // Strategy 3: Fallback - Find the most recent payment with monthly plan (which has recurrence)
    if (!recurrencePaymentId) {
      for (const doc of paymentsSnapshot.docs) {
        const paymentData = doc.data()
        // Monthly plan payments have recurrence
        if (paymentData.goPayId && paymentData.plan === 'premium_monthly' && !paymentData.parentGoPayId) {
          recurrencePaymentId = paymentData.goPayId
          console.log('📋 Found parent payment by monthly plan:', recurrencePaymentId)
          break
        }
      }
    }

    // Stop recurrence in GoPay if we found a parent payment
    if (recurrencePaymentId) {
      try {
        await stopRecurrence(recurrencePaymentId)
        console.log('✅ Recurring payments stopped in GoPay')
      } catch (error: any) {
        console.error('⚠️ Failed to stop recurrence in GoPay:', error.message)
        return NextResponse.json(
          { error: error.message || 'Failed to stop recurrence in GoPay' },
          { status: 500 }
        )
      }
    } else {
      console.log('ℹ️ No recurring payment found for user')
      return NextResponse.json(
        { error: 'No recurring payment found' },
        { status: 404 }
      )
    }

    // Mark subscription as canceled at period end
    const subscriptionRef = adminDb.collection('subscriptions').doc(userId)
    const subscriptionDoc = await subscriptionRef.get()

    if (subscriptionDoc.exists) {
      const subscriptionData = subscriptionDoc.data()

      await subscriptionRef.update({
        cancelAtPeriodEnd: true,
        canceledAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      })

      console.log('✅ Subscription marked for cancellation at period end')
      console.log('📅 Will remain active until:', subscriptionData?.currentPeriodEnd?.toDate())

      return NextResponse.json({
        success: true,
        message: 'Recurring payments stopped successfully',
        currentPeriodEnd: subscriptionData?.currentPeriodEnd?.toDate(),
        recurrenceStopped: true
      })
    } else {
      return NextResponse.json({
        success: true,
        message: 'Recurring payments stopped (no subscription found)',
        recurrenceStopped: true
      })
    }

  } catch (error: any) {
    console.error('Error stopping recurrence:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to stop recurrence' },
      { status: 500 }
    )
  }
}

