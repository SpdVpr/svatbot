import { NextRequest, NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/firebase-admin'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const affiliateCode = searchParams.get('affiliateCode')

    if (!userId && !affiliateCode) {
      return NextResponse.json({
        error: 'Please provide userId or affiliateCode parameter'
      }, { status: 400 })
    }

    const db = getAdminDb()
    const result: any = {
      timestamp: new Date().toISOString()
    }

    // Check affiliate partner
    if (affiliateCode) {
      const partnerSnapshot = await db.collection('affiliatePartners')
        .where('referralCode', '==', affiliateCode)
        .limit(1)
        .get()

      if (!partnerSnapshot.empty) {
        const partnerDoc = partnerSnapshot.docs[0]
        result.partner = {
          id: partnerDoc.id,
          referralCode: partnerDoc.data().referralCode,
          status: partnerDoc.data().status,
          stats: partnerDoc.data().stats
        }
      } else {
        result.partner = null
      }
    }

    // Check user affiliate reference
    if (userId) {
      const refSnapshot = await db.collection('userAffiliateRefs')
        .where('userId', '==', userId)
        .limit(1)
        .get()

      if (!refSnapshot.empty) {
        const refDoc = refSnapshot.docs[0]
        const refData = refDoc.data()
        result.userAffiliateRef = {
          id: refDoc.id,
          userId: refData.userId,
          affiliateId: refData.affiliateId,
          affiliateCode: refData.affiliateCode,
          converted: refData.converted,
          registeredAt: refData.registeredAt?.toDate?.()?.toISOString() || null,
          convertedAt: refData.convertedAt?.toDate?.()?.toISOString() || null
        }

        // Check commissions for this user
        const commissionsSnapshot = await db.collection('commissions')
          .where('userId', '==', userId)
          .get()

        result.commissions = commissionsSnapshot.docs.map(doc => ({
          id: doc.id,
          affiliateCode: doc.data().affiliateCode,
          amount: doc.data().amount,
          commissionAmount: doc.data().commissionAmount,
          status: doc.data().status,
          createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null
        }))
      } else {
        result.userAffiliateRef = null
        result.commissions = []
      }

      // Check payments for this user
      const paymentsSnapshot = await db.collection('payments')
        .where('userId', '==', userId)
        .get()

      result.payments = paymentsSnapshot.docs.map(doc => ({
        id: doc.id,
        amount: doc.data().amount,
        status: doc.data().status,
        plan: doc.data().plan,
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null
      }))
    }

    return NextResponse.json(result, { status: 200 })
  } catch (error: any) {
    console.error('Error in debug affiliate flow:', error)
    return NextResponse.json({
      error: error.message
    }, { status: 500 })
  }
}

