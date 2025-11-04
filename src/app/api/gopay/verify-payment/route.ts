import { NextRequest, NextResponse } from 'next/server'
import { getPaymentStatus } from '@/lib/gopay-server'
import { getAdminDb } from '@/config/firebase-admin'
import { Timestamp } from 'firebase-admin/firestore'

/**
 * Verify GoPay Payment Status
 * Called after user returns from GoPay gateway
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { paymentId } = body

    if (!paymentId) {
      return NextResponse.json(
        { error: 'Missing payment ID' },
        { status: 400 }
      )
    }

    console.log('🔍 Verifying GoPay payment:', paymentId)

    // Get payment status from GoPay
    const payment = await getPaymentStatus(parseInt(paymentId))
    
    console.log('Payment status from GoPay:', payment.state)

    // Get payment from Firestore
    const adminDb = getAdminDb()
    const paymentsRef = adminDb.collection('payments')
    const snapshot = await paymentsRef
      .where('goPayId', '==', parseInt(paymentId))
      .limit(1)
      .get()

    if (snapshot.empty) {
      console.error('Payment not found in Firestore:', paymentId)
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }

    const paymentDoc = snapshot.docs[0]
    const paymentData = paymentDoc.data()

    // Map GoPay state to our status
    let status: string
    switch (payment.state) {
      case 'PAID':
        status = 'succeeded'
        break
      case 'CANCELED':
        status = 'canceled'
        break
      case 'TIMEOUTED':
        status = 'expired'
        break
      case 'REFUNDED':
        status = 'refunded'
        break
      default:
        status = 'pending'
    }

    // Update payment in Firestore
    await paymentDoc.ref.update({
      status,
      goPayState: payment.state,
      updatedAt: Timestamp.now()
    })

    console.log(`✅ Payment ${paymentId} updated to status: ${status}`)

    // If payment succeeded, activate subscription
    if (status === 'succeeded') {
      const userId = paymentData.userId
      const plan = paymentData.plan

      // Calculate subscription dates
      const now = new Date()
      const startDate = Timestamp.fromDate(now)
      const endDate = Timestamp.fromDate(
        new Date(now.getTime() + (plan === 'premium_yearly' ? 365 : 30) * 24 * 60 * 60 * 1000)
      )

      // Update or create subscription
      const subscriptionRef = adminDb.collection('subscriptions').doc(userId)
      const subscriptionDoc = await subscriptionRef.get()

      if (subscriptionDoc.exists) {
        // Update existing subscription
        await subscriptionRef.update({
          plan,
          status: 'active',
          currentPeriodStart: startDate,
          currentPeriodEnd: endDate,
          cancelAtPeriodEnd: false,
          updatedAt: Timestamp.now()
        })
      } else {
        // Create new subscription
        await subscriptionRef.set({
          userId,
          plan,
          status: 'active',
          currentPeriodStart: startDate,
          currentPeriodEnd: endDate,
          cancelAtPeriodEnd: false,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        })
      }

      console.log(`✅ Subscription activated for user ${userId}`)
    }

    return NextResponse.json({
      success: true,
      status,
      payment: {
        id: payment.id,
        state: payment.state,
        amount: payment.amount,
        currency: payment.currency
      }
    })

  } catch (error: any) {
    console.error('Error verifying payment:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to verify payment' },
      { status: 500 }
    )
  }
}

