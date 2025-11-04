import { NextRequest, NextResponse } from 'next/server'
import { refundPayment } from '@/lib/gopay-server'
import { getAdminDb } from '@/config/firebase-admin'
import { Timestamp } from 'firebase-admin/firestore'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { paymentId, amount } = body

    if (!paymentId) {
      return NextResponse.json(
        { error: 'Missing payment ID' },
        { status: 400 }
      )
    }

    console.log('🔄 Refunding GoPay payment:', paymentId)

    // Refund payment in GoPay
    await refundPayment(parseInt(paymentId), amount)

    // Update payment in Firestore
    const adminDb = getAdminDb()
    const paymentsRef = adminDb.collection('payments')
    const snapshot = await paymentsRef
      .where('goPayId', '==', parseInt(paymentId))
      .limit(1)
      .get()

    if (!snapshot.empty) {
      const paymentDoc = snapshot.docs[0]
      await paymentDoc.ref.update({
        status: 'refunded',
        refundedAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      })
    }

    console.log('✅ Payment refunded')

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('Error refunding payment:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to refund payment' },
      { status: 500 }
    )
  }
}

