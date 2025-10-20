import { NextRequest, NextResponse } from 'next/server'
import { getAdminDb } from '@/config/firebase-admin'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Checking recent payments in Firestore...')

    const adminDb = getAdminDb()

    // Get all payments from Firestore
    const paymentsSnapshot = await adminDb
      .collection('payments')
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get()

    const payments = paymentsSnapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        userId: data.userId,
        userEmail: data.userEmail,
        amount: data.amount,
        currency: data.currency,
        status: data.status,
        createdAt: data.createdAt
      }
    })

    console.log(`Found ${payments.length} payments in Firestore`)

    // Get all subscriptions
    const subscriptionsSnapshot = await adminDb
      .collection('subscriptions')
      .limit(10)
      .get()

    const subscriptions = subscriptionsSnapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        plan: data.plan,
        status: data.status,
        stripeSubscriptionId: data.stripeSubscriptionId,
        currentPeriodEnd: data.currentPeriodEnd
      }
    })

    console.log(`Found ${subscriptions.length} subscriptions in Firestore`)

    return NextResponse.json({
      success: true,
      paymentsCount: payments.length,
      payments: payments.map(p => ({
        id: p.id,
        userId: p.userId,
        userEmail: p.userEmail,
        amount: p.amount,
        currency: p.currency,
        status: p.status,
        createdAt: p.createdAt?.toDate?.()?.toISOString() || 'N/A'
      })),
      subscriptionsCount: subscriptions.length,
      subscriptions: subscriptions.map(s => ({
        id: s.id,
        plan: s.plan,
        status: s.status,
        stripeSubscriptionId: s.stripeSubscriptionId,
        currentPeriodEnd: s.currentPeriodEnd?.toDate?.()?.toISOString() || 'N/A'
      }))
    })

  } catch (error: any) {
    console.error('❌ Error checking webhook logs:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}

