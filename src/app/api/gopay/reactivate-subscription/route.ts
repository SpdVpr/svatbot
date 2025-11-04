import { NextRequest, NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/firebase-admin'
import { Timestamp } from 'firebase-admin/firestore'

/**
 * Reactivate Subscription
 * 
 * Removes the cancellation flag from a subscription
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

    console.log('🔄 Reactivating subscription for user:', userId)

    // Update subscription in Firestore
    const adminDb = getAdminDb()
    const subscriptionRef = adminDb.collection('subscriptions').doc(userId)
    
    await subscriptionRef.update({
      cancelAtPeriodEnd: false,
      canceledAt: null,
      updatedAt: Timestamp.now()
    })

    console.log('✅ Subscription reactivated')

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('Error reactivating subscription:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to reactivate subscription' },
      { status: 500 }
    )
  }
}

