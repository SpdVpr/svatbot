/**
 * Affiliate Tracking System
 * 
 * Handles tracking of affiliate clicks, registrations, and conversions
 */

import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  setDoc,
  Timestamp,
  limit,
  increment
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

const AFFILIATE_COOKIE_NAME = 'affiliate_ref'
const COOKIE_DURATION_DAYS = 30
const LAST_CLICK_TRACKED_KEY = 'affiliate_last_click_tracked'

/**
 * Get affiliate code from URL or cookie
 */
export function getAffiliateCode(): string | null {
  // Check URL parameter first
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search)
    const refParam = urlParams.get('ref')
    
    if (refParam) {
      // Store in cookie
      setAffiliateCookie(refParam)
      return refParam
    }
    
    // Check cookie
    return getAffiliateCookie()
  }
  
  return null
}

/**
 * Set affiliate cookie
 */
export function setAffiliateCookie(code: string): void {
  if (typeof document !== 'undefined') {
    const maxAge = COOKIE_DURATION_DAYS * 24 * 60 * 60
    document.cookie = `${AFFILIATE_COOKIE_NAME}=${code}; max-age=${maxAge}; path=/; SameSite=Lax`
  }
}

/**
 * Get affiliate cookie
 */
export function getAffiliateCookie(): string | null {
  if (typeof document !== 'undefined') {
    const cookies = document.cookie.split(';')
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=')
      if (name === AFFILIATE_COOKIE_NAME) {
        return value
      }
    }
  }
  return null
}

/**
 * Clear affiliate cookie
 */
export function clearAffiliateCookie(): void {
  if (typeof document !== 'undefined') {
    document.cookie = `${AFFILIATE_COOKIE_NAME}=; max-age=0; path=/`
  }
}

/**
 * Track affiliate click
 */
export async function trackAffiliateClick(
  affiliateCode: string,
  landingPage: string
): Promise<void> {
  try {
    // Check if we already tracked this click recently (prevent duplicates)
    if (typeof window !== 'undefined') {
      const lastTracked = localStorage.getItem(LAST_CLICK_TRACKED_KEY)
      const lastTrackedData = lastTracked ? JSON.parse(lastTracked) : null

      if (lastTrackedData &&
          lastTrackedData.code === affiliateCode &&
          Date.now() - lastTrackedData.timestamp < 60000) { // 1 minute
        console.log('⏭️ Click already tracked recently, skipping')
        return
      }
    }

    // Get affiliate partner by code
    const q = query(
      collection(db, 'affiliatePartners'),
      where('referralCode', '==', affiliateCode),
      where('status', '==', 'active'),
      limit(1)
    )
    const snapshot = await getDocs(q)

    if (snapshot.empty) {
      console.warn('⚠️ Affiliate code not found or inactive:', affiliateCode)
      return
    }

    const affiliateDoc = snapshot.docs[0]
    const affiliateId = affiliateDoc.id

    // Get today's date for daily stats
    const today = new Date()
    const dateStr = today.toISOString().split('T')[0] // YYYY-MM-DD
    const dailyStatsId = `${affiliateId}_${dateStr}`

    // Update partner stats using increment (atomic operation) - REALTIME
    const currentClicks = affiliateDoc.data().stats?.totalClicks || 0

    console.log('📊 Updating partner stats:', {
      affiliateId,
      currentClicks,
      incrementing: true,
      dailyStatsId
    })

    // 1. Update realtime counter in partner document
    await updateDoc(doc(db, 'affiliatePartners', affiliateId), {
      'stats.totalClicks': increment(1),
      lastActivityAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    })

    // 2. Update daily aggregated stats (for history and charts)
    const dailyStatsRef = doc(db, 'affiliateStats', dailyStatsId)

    try {
      // Try to increment existing daily stats
      await updateDoc(dailyStatsRef, {
        clicks: increment(1),
        lastClickAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      })
    } catch (error) {
      // If document doesn't exist, create it
      try {
        await setDoc(dailyStatsRef, {
          affiliateId,
          affiliateCode,
          date: dateStr,
          clicks: 1,
          conversions: 0,
          registrations: 0,
          revenue: 0,
          commission: 0,
          lastClickAt: Timestamp.now(),
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        })
      } catch (setError) {
        // If another request created it in the meantime, try update again
        await updateDoc(dailyStatsRef, {
          clicks: increment(1),
          lastClickAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        })
      }
    }

    // Store last tracked click
    if (typeof window !== 'undefined') {
      localStorage.setItem(LAST_CLICK_TRACKED_KEY, JSON.stringify({
        code: affiliateCode,
        timestamp: Date.now()
      }))
    }

    console.log('✅ Affiliate click tracked successfully:', { affiliateCode, affiliateId, clicks: currentClicks + 1 })
  } catch (err) {
    console.error('❌ Error tracking affiliate click:', err)
  }
}

/**
 * Track affiliate registration (when user signs up)
 */
export async function trackAffiliateRegistration(
  userId: string,
  userEmail: string
): Promise<void> {
  const affiliateCode = getAffiliateCookie()
  if (!affiliateCode) return

  try {
    // Get affiliate partner
    const q = query(
      collection(db, 'affiliatePartners'),
      where('referralCode', '==', affiliateCode),
      where('status', '==', 'active'),
      limit(1)
    )
    const snapshot = await getDocs(q)
    
    if (snapshot.empty) return

    const affiliateDoc = snapshot.docs[0]
    const affiliateId = affiliateDoc.id

    // Update click record if exists
    const clicksQuery = query(
      collection(db, 'affiliateClicks'),
      where('affiliateId', '==', affiliateId),
      where('converted', '==', false),
      limit(1)
    )
    const clicksSnapshot = await getDocs(clicksQuery)
    
    if (!clicksSnapshot.empty) {
      const clickDoc = clicksSnapshot.docs[0]
      await updateDoc(doc(db, 'affiliateClicks', clickDoc.id), {
        converted: true,
        userId,
        convertedAt: Timestamp.now()
      })
    }

    // Update partner stats
    const currentRegistrations = affiliateDoc.data().stats?.totalRegistrations || 0
    await updateDoc(doc(db, 'affiliatePartners', affiliateId), {
      'stats.totalRegistrations': currentRegistrations + 1,
      lastActivityAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    })

    // Store affiliate reference in user metadata for later conversion tracking
    await addDoc(collection(db, 'userAffiliateRefs'), {
      userId,
      userEmail,
      affiliateId,
      affiliateCode,
      registeredAt: Timestamp.now(),
      converted: false
    })

    console.log('✅ Affiliate registration tracked:', affiliateCode)
  } catch (err) {
    console.error('Error tracking affiliate registration:', err)
  }
}

/**
 * Track affiliate conversion (when user makes a payment)
 * This should be called from Stripe webhook
 */
export async function trackAffiliateConversion(
  userId: string,
  userEmail: string,
  subscriptionId: string,
  plan: 'premium_monthly' | 'premium_yearly',
  amount: number,
  stripePaymentIntentId?: string,
  stripeInvoiceId?: string
): Promise<void> {
  try {
    // Check if user has affiliate reference
    const refQuery = query(
      collection(db, 'userAffiliateRefs'),
      where('userId', '==', userId),
      where('converted', '==', false),
      limit(1)
    )
    const refSnapshot = await getDocs(refQuery)
    
    if (refSnapshot.empty) {
      console.log('No affiliate reference found for user:', userId)
      return
    }

    const refDoc = refSnapshot.docs[0]
    const refData = refDoc.data()
    const affiliateId = refData.affiliateId
    const affiliateCode = refData.affiliateCode

    // Get affiliate partner to get commission rate
    const partnerDoc = await getDocs(
      query(
        collection(db, 'affiliatePartners'),
        where('referralCode', '==', affiliateCode),
        limit(1)
      )
    )

    if (partnerDoc.empty) {
      console.warn('Affiliate partner not found:', affiliateCode)
      return
    }

    const partner = partnerDoc.docs[0]
    const partnerId = partner.id
    const partnerData = partner.data()
    const commissionRate = partnerData.customCommissionRate || partnerData.commissionRate || 10
    const commissionAmount = (amount * commissionRate) / 100

    // Create commission record
    await addDoc(collection(db, 'commissions'), {
      affiliateId: partnerId,
      affiliateCode,
      userId,
      userEmail,
      subscriptionId,
      stripePaymentIntentId,
      stripeInvoiceId,
      plan,
      amount,
      currency: 'CZK',
      commissionRate,
      commissionAmount,
      status: 'confirmed', // Confirmed after successful payment
      createdAt: Timestamp.now(),
      confirmedAt: Timestamp.now()
    })

    // Update affiliate reference
    await updateDoc(doc(db, 'userAffiliateRefs', refDoc.id), {
      converted: true,
      subscriptionId,
      convertedAt: Timestamp.now()
    })

    // Update click record
    const clickQuery = query(
      collection(db, 'affiliateClicks'),
      where('affiliateId', '==', partnerId),
      where('userId', '==', userId),
      limit(1)
    )
    const clickSnapshot = await getDocs(clickQuery)
    
    if (!clickSnapshot.empty) {
      const clickDoc = clickSnapshot.docs[0]
      await updateDoc(doc(db, 'affiliateClicks', clickDoc.id), {
        subscriptionId,
        convertedAt: Timestamp.now()
      })
    }

    // Update partner stats
    const stats = partnerData.stats || {}
    await updateDoc(doc(db, 'affiliatePartners', partnerId), {
      'stats.totalConversions': (stats.totalConversions || 0) + 1,
      'stats.totalRevenue': (stats.totalRevenue || 0) + amount,
      'stats.totalCommission': (stats.totalCommission || 0) + commissionAmount,
      'stats.pendingCommission': (stats.pendingCommission || 0) + commissionAmount,
      lastActivityAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    })

    console.log('✅ Affiliate conversion tracked:', {
      affiliateCode,
      amount,
      commissionAmount
    })

    // Clear affiliate cookie after conversion
    clearAffiliateCookie()
  } catch (err) {
    console.error('Error tracking affiliate conversion:', err)
  }
}

/**
 * Initialize affiliate tracking on page load
 */
export function initAffiliateTracking(): void {
  if (typeof window === 'undefined') return

  const affiliateCode = getAffiliateCode()

  console.log('🔍 Affiliate tracking initialized:', {
    affiliateCode,
    url: window.location.href,
    hasRefParam: new URLSearchParams(window.location.search).has('ref')
  })

  if (affiliateCode) {
    const landingPage = window.location.pathname + window.location.search
    console.log('✅ Tracking affiliate click:', { affiliateCode, landingPage })
    trackAffiliateClick(affiliateCode, landingPage)
  } else {
    console.log('ℹ️ No affiliate code found')
  }
}

