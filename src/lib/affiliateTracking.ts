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
import logger from '@/lib/logger'

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
 * Helper function to get referrer source
 */
function getReferrerSource(referrer: string): string {
  if (!referrer) return 'direct'

  try {
    const url = new URL(referrer)
    const hostname = url.hostname.toLowerCase()

    // Social media
    if (hostname.includes('facebook.com') || hostname.includes('fb.com')) return 'facebook'
    if (hostname.includes('instagram.com')) return 'instagram'
    if (hostname.includes('twitter.com') || hostname.includes('x.com')) return 'twitter'
    if (hostname.includes('linkedin.com')) return 'linkedin'
    if (hostname.includes('pinterest.com')) return 'pinterest'
    if (hostname.includes('tiktok.com')) return 'tiktok'
    if (hostname.includes('youtube.com')) return 'youtube'

    // Search engines
    if (hostname.includes('google.')) return 'google'
    if (hostname.includes('bing.com')) return 'bing'
    if (hostname.includes('seznam.cz')) return 'seznam'

    // Email
    if (hostname.includes('mail.') || hostname.includes('email.')) return 'email'

    // Other
    return hostname.replace('www.', '')
  } catch {
    return 'unknown'
  }
}

/**
 * Helper function to get device type
 */
function getDeviceType(): string {
  if (typeof window === 'undefined') return 'unknown'

  const ua = navigator.userAgent.toLowerCase()

  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet'
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile'
  }
  return 'desktop'
}

/**
 * Helper function to get browser
 */
function getBrowser(): string {
  if (typeof window === 'undefined') return 'unknown'

  const ua = navigator.userAgent.toLowerCase()

  if (ua.includes('edg/')) return 'edge'
  if (ua.includes('chrome/') && !ua.includes('edg/')) return 'chrome'
  if (ua.includes('safari/') && !ua.includes('chrome/')) return 'safari'
  if (ua.includes('firefox/')) return 'firefox'
  if (ua.includes('opera/') || ua.includes('opr/')) return 'opera'

  return 'other'
}

/**
 * Helper function to extract UTM parameters
 */
function getUTMParams(url: string): { source?: string; medium?: string; campaign?: string; term?: string; content?: string } {
  try {
    const urlObj = new URL(url)
    return {
      source: urlObj.searchParams.get('utm_source') || undefined,
      medium: urlObj.searchParams.get('utm_medium') || undefined,
      campaign: urlObj.searchParams.get('utm_campaign') || undefined,
      term: urlObj.searchParams.get('utm_term') || undefined,
      content: urlObj.searchParams.get('utm_content') || undefined,
    }
  } catch {
    return {}
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
        logger.log('⏭️ Click already tracked recently, skipping')
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
      logger.warn('⚠️ Affiliate code not found or inactive:', affiliateCode)
      return
    }

    const affiliateDoc = snapshot.docs[0]
    const affiliateId = affiliateDoc.id

    // Collect analytics data
    const referrer = typeof document !== 'undefined' ? document.referrer : ''
    const source = getReferrerSource(referrer)
    const device = getDeviceType()
    const browser = getBrowser()
    const currentUrl = typeof window !== 'undefined' ? window.location.href : ''
    const utmParams = getUTMParams(currentUrl)

    logger.log('📊 Analytics data:', { source, device, browser, utmParams, landingPage })

    // Get today's date for daily stats
    const today = new Date()
    const dateStr = today.toISOString().split('T')[0] // YYYY-MM-DD
    const dailyStatsId = `${affiliateId}_${dateStr}`

    // Update partner stats using increment (atomic operation) - REALTIME
    const currentClicks = affiliateDoc.data().stats?.totalClicks || 0

    logger.log('📊 Updating partner stats:', {
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

    // Prepare analytics updates
    const sourceKey = `sources.${source}.clicks`
    const deviceKey = `devices.${device}.clicks`
    const browserKey = `browsers.${browser}.clicks`
    const landingPageKey = `landingPages.${landingPage.replace(/\//g, '_')}.clicks`

    const analyticsUpdates: any = {
      clicks: increment(1),
      [sourceKey]: increment(1),
      [deviceKey]: increment(1),
      [browserKey]: increment(1),
      [landingPageKey]: increment(1),
      lastClickAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    }

    // Add UTM campaign tracking if present
    if (utmParams.campaign) {
      const campaignKey = `campaigns.${utmParams.campaign}.clicks`
      analyticsUpdates[campaignKey] = increment(1)
    }

    try {
      // Try to increment existing daily stats
      await updateDoc(dailyStatsRef, analyticsUpdates)
    } catch (error) {
      // If document doesn't exist, create it with initial structure
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
          sources: {
            [source]: { clicks: 1, conversions: 0 }
          },
          devices: {
            [device]: { clicks: 1, conversions: 0 }
          },
          browsers: {
            [browser]: { clicks: 1, conversions: 0 }
          },
          landingPages: {
            [landingPage.replace(/\//g, '_')]: { clicks: 1, conversions: 0 }
          },
          campaigns: utmParams.campaign ? {
            [utmParams.campaign]: { clicks: 1, conversions: 0 }
          } : {},
          lastClickAt: Timestamp.now(),
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        })
      } catch (setError) {
        // If another request created it in the meantime, try update again
        await updateDoc(dailyStatsRef, analyticsUpdates)
      }
    }

    // Store last tracked click
    if (typeof window !== 'undefined') {
      localStorage.setItem(LAST_CLICK_TRACKED_KEY, JSON.stringify({
        code: affiliateCode,
        timestamp: Date.now()
      }))
    }

    logger.log('✅ Affiliate click tracked successfully:', { affiliateCode, affiliateId, clicks: currentClicks + 1 })
  } catch (err) {
    logger.error('❌ Error tracking affiliate click:', err)
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

    // Update partner stats using increment (atomic operation)
    await updateDoc(doc(db, 'affiliatePartners', affiliateId), {
      'stats.totalRegistrations': increment(1),
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

    // Also store affiliate reference directly in user document for easy access
    await updateDoc(doc(db, 'users', userId), {
      affiliateCode,
      affiliateId,
      affiliateRegisteredAt: Timestamp.now()
    })

    logger.log('✅ Affiliate registration tracked:', affiliateCode)
  } catch (err) {
    logger.error('Error tracking affiliate registration:', err)
  }
}

/**
 * Link existing user to affiliate (when already registered user clicks affiliate link)
 * This allows tracking conversions for users who register before clicking affiliate link
 */
export async function linkUserToAffiliate(
  userId: string,
  userEmail: string
): Promise<void> {
  const affiliateCode = getAffiliateCookie()
  if (!affiliateCode) return

  try {
    // Check if user already has affiliate reference
    const userDoc = await getDocs(
      query(collection(db, 'users'), where('__name__', '==', userId), limit(1))
    )

    if (userDoc.empty) return

    const userData = userDoc.docs[0].data()

    // Don't override existing affiliate reference (first referrer wins)
    if (userData.affiliateCode) {
      logger.log('ℹ️ User already has affiliate reference:', userData.affiliateCode)
      return
    }

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

    // Store affiliate reference in user document
    await updateDoc(doc(db, 'users', userId), {
      affiliateCode,
      affiliateId,
      affiliateLinkedAt: Timestamp.now()
    })

    // Create userAffiliateRef for tracking
    await addDoc(collection(db, 'userAffiliateRefs'), {
      userId,
      userEmail,
      affiliateId,
      affiliateCode,
      linkedAt: Timestamp.now(),
      converted: false
    })

    logger.log('✅ Existing user linked to affiliate:', affiliateCode)
  } catch (err) {
    logger.error('Error linking user to affiliate:', err)
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
      logger.log('No affiliate reference found for user:', userId)
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
      logger.warn('Affiliate partner not found:', affiliateCode)
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

    // Update partner stats using increment (atomic operation)
    await updateDoc(doc(db, 'affiliatePartners', partnerId), {
      'stats.totalConversions': increment(1),
      'stats.totalRevenue': increment(amount),
      'stats.totalCommission': increment(commissionAmount),
      'stats.pendingCommission': increment(commissionAmount),
      lastActivityAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    })

    logger.log('✅ Affiliate conversion tracked:', {
      affiliateCode,
      amount,
      commissionAmount
    })

    // Clear affiliate cookie after conversion
    clearAffiliateCookie()
  } catch (err) {
    logger.error('Error tracking affiliate conversion:', err)
  }
}

/**
 * Initialize affiliate tracking on page load
 * ONLY tracks clicks when ref parameter is in URL (not from cookie)
 */
export function initAffiliateTracking(): void {
  if (typeof window === 'undefined') return

  // Check if ref parameter is in URL (this is a real affiliate click)
  const urlParams = new URLSearchParams(window.location.search)
  const refParam = urlParams.get('ref')

  logger.log('🔍 Affiliate tracking initialized:', {
    url: window.location.href,
    hasRefParam: !!refParam,
    refParam
  })

  // ONLY track click if ref parameter is in URL
  // Don't track clicks from cookie (that would count every page view)
  if (refParam) {
    // Store in cookie for later registration/conversion tracking
    setAffiliateCookie(refParam)

    const landingPage = window.location.pathname + window.location.search
    logger.log('✅ Tracking affiliate click:', { affiliateCode: refParam, landingPage })
    trackAffiliateClick(refParam, landingPage)
  } else {
    logger.log('ℹ️ No ref parameter in URL - not tracking click')
  }
}

