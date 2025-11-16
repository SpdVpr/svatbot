import { NextRequest, NextResponse } from 'next/server'
import { getAdminDb } from '@/config/firebase-admin'
import { Timestamp } from 'firebase-admin/firestore'
import { stopRecurrence } from '@/lib/gopay-server'

/**
 * Cancel Subscription
 *
 * This endpoint:
 * 1. Stops recurring payments in GoPay (if any)
 * 2. Marks the subscription as canceled in Firestore
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
        // Continue anyway - we'll still mark as canceled in our system
      }
    } else {
      console.log('ℹ️ No recurring payment found for user')
    }

    // Update subscription in Firestore
    const subscriptionRef = adminDb.collection('subscriptions').doc(userId)

    await subscriptionRef.update({
      cancelAtPeriodEnd: true,
      canceledAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    })

    console.log('✅ Subscription marked as canceled')

    return NextResponse.json({
      success: true,
      recurrenceStopped: !!recurrencePaymentId
    })

  } catch (error: any) {
    console.error('Error canceling subscription:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to cancel subscription' },
      { status: 500 }
    )
  }
}

