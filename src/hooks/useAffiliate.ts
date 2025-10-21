'use client'

import { useState, useEffect } from 'react'
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy,
  Timestamp,
  limit
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from './useAuth'
import type { 
  AffiliatePartner, 
  AffiliateApplication,
  Commission,
  Payout,
  AffiliateClick,
  AffiliateStats
} from '@/types/affiliate'

// Convert Firestore data to typed objects
const convertTimestamps = (data: any) => {
  const converted = { ...data }
  Object.keys(converted).forEach(key => {
    if (converted[key] instanceof Timestamp) {
      converted[key] = converted[key].toDate()
    }
  })
  return converted
}

export function useAffiliate() {
  const { user } = useAuth()
  const [partner, setPartner] = useState<AffiliatePartner | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load affiliate partner data
  useEffect(() => {
    if (!user || !user.id) {
      setPartner(null)
      setLoading(false)
      return
    }

    const loadPartner = async () => {
      try {
        setLoading(true)
        const q = query(
          collection(db, 'affiliatePartners'),
          where('userId', '==', user.id),
          limit(1)
        )
        const snapshot = await getDocs(q)

        if (!snapshot.empty) {
          const doc = snapshot.docs[0]
          const partnerData = {
            id: doc.id,
            ...convertTimestamps(doc.data())
          } as AffiliatePartner
          setPartner(partnerData)
        } else {
          setPartner(null)
        }
      } catch (err: any) {
        console.error('Error loading affiliate partner:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadPartner()
  }, [user])

  // Submit affiliate application and automatically create partner
  const submitApplication = async (application: Omit<AffiliateApplication, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => {
    if (!user || !user.id) throw new Error('Must be logged in')

    try {
      // Check if user is already a partner
      const existingPartnerQuery = query(
        collection(db, 'affiliatePartners'),
        where('userId', '==', user.id),
        limit(1)
      )
      const existingPartnerSnapshot = await getDocs(existingPartnerQuery)

      if (!existingPartnerSnapshot.empty) {
        throw new Error('Již jste registrovaný affiliate partner')
      }

      // Generate unique referral code
      const referralCode = `${application.firstName.substring(0, 3).toUpperCase()}${Date.now().toString().slice(-6)}`
      // Always use production URL for referral links
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://svatbot.cz'
      const referralLink = `${baseUrl}?ref=${referralCode}`

      // Create affiliate partner directly (auto-approved)
      const partnerData: any = {
        userId: user.id,
        firstName: application.firstName,
        lastName: application.lastName,
        email: user.email || application.email,
        phone: application.phone || null,
        company: application.company || null,
        website: application.website || null,
        status: 'active', // Auto-approved
        referralCode,
        referralLink,
        commissionRate: 10, // Default 10%
        stats: {
          totalClicks: 0,
          totalRegistrations: 0,
          totalConversions: 0,
          totalRevenue: 0,
          totalCommission: 0,
          pendingCommission: 0,
          paidCommission: 0
        },
        payoutMethod: 'bank_transfer',
        payoutDetails: {},
        minPayoutAmount: 1000, // 1000 CZK
        motivation: application.motivation,
        experience: application.experience,
        audience: application.audience,
        promotionPlan: application.promotionPlan,
        socialMedia: {
          instagram: application.instagram || null,
          facebook: application.facebook || null,
          youtube: application.youtube || null,
          tiktok: application.tiktok || null,
          blog: application.blog || null
        },
        expectedMonthlyClicks: application.expectedMonthlyClicks || 0,
        expectedMonthlyConversions: application.expectedMonthlyConversions || 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        lastActivityAt: Timestamp.now()
      }

      const partnerRef = await addDoc(collection(db, 'affiliatePartners'), partnerData)

      // Also save application for records (approved status)
      const applicationData = {
        ...application,
        email: user.email,
        status: 'approved',
        reviewedAt: Timestamp.now(),
        reviewNotes: 'Automaticky schváleno',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }
      await addDoc(collection(db, 'affiliateApplications'), applicationData)

      // Reload partner data
      setPartner({
        id: partnerRef.id,
        ...partnerData,
        createdAt: partnerData.createdAt.toDate(),
        updatedAt: partnerData.updatedAt.toDate(),
        lastActivityAt: partnerData.lastActivityAt.toDate()
      } as AffiliatePartner)

      return partnerRef.id
    } catch (err: any) {
      console.error('Error submitting application:', err)
      throw err
    }
  }

  // Get commissions for partner
  const getCommissions = async (status?: string): Promise<Commission[]> => {
    if (!partner) return []

    try {
      let q = query(
        collection(db, 'commissions'),
        where('affiliateId', '==', partner.id),
        orderBy('createdAt', 'desc')
      )

      if (status) {
        q = query(q, where('status', '==', status))
      }

      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...convertTimestamps(doc.data())
      } as Commission))
    } catch (err: any) {
      console.error('Error loading commissions:', err)
      throw new Error('Nepodařilo se načíst provize')
    }
  }

  // Get payouts for partner
  const getPayouts = async (): Promise<Payout[]> => {
    if (!partner) return []

    try {
      const q = query(
        collection(db, 'payouts'),
        where('affiliateId', '==', partner.id),
        orderBy('createdAt', 'desc')
      )

      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...convertTimestamps(doc.data())
      } as Payout))
    } catch (err: any) {
      console.error('Error loading payouts:', err)
      throw new Error('Nepodařilo se načíst výplaty')
    }
  }

  // Request payout
  const requestPayout = async (amount: number, commissionIds: string[]) => {
    if (!partner) throw new Error('Not an affiliate partner')

    try {
      const payoutData = {
        affiliateId: partner.id,
        amount,
        currency: 'CZK',
        commissionIds,
        commissionCount: commissionIds.length,
        status: 'pending',
        method: partner.payoutMethod,
        payoutDetails: partner.payoutDetails,
        requestedAt: Timestamp.now(),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }

      const docRef = await addDoc(collection(db, 'payouts'), payoutData)

      // Update commissions to reference this payout
      for (const commissionId of commissionIds) {
        await updateDoc(doc(db, 'commissions', commissionId), {
          payoutId: docRef.id,
          updatedAt: Timestamp.now()
        })
      }

      return docRef.id
    } catch (err: any) {
      console.error('Error requesting payout:', err)
      throw new Error('Nepodařilo se požádat o výplatu')
    }
  }

  // Update payout details
  const updatePayoutDetails = async (payoutDetails: any, payoutMethod: string) => {
    if (!partner) throw new Error('Not an affiliate partner')

    try {
      await updateDoc(doc(db, 'affiliatePartners', partner.id), {
        payoutDetails,
        payoutMethod,
        updatedAt: Timestamp.now()
      })

      setPartner({
        ...partner,
        payoutDetails,
        payoutMethod: payoutMethod as any,
        updatedAt: new Date()
      })
    } catch (err: any) {
      console.error('Error updating payout details:', err)
      throw new Error('Nepodařilo se aktualizovat platební údaje')
    }
  }

  // Get affiliate stats
  const getStats = async (period: 'day' | 'week' | 'month' | 'year' | 'all' = 'all'): Promise<AffiliateStats | null> => {
    if (!partner) return null

    try {
      const q = query(
        collection(db, 'affiliateStats'),
        where('affiliateId', '==', partner.id),
        where('period', '==', period),
        orderBy('createdAt', 'desc'),
        limit(1)
      )

      const snapshot = await getDocs(q)
      if (snapshot.empty) return null

      const doc = snapshot.docs[0]
      return {
        ...convertTimestamps(doc.data())
      } as AffiliateStats
    } catch (err: any) {
      console.error('Error loading stats:', err)
      return null
    }
  }

  // Track affiliate click
  const trackClick = async (affiliateCode: string, landingPage: string) => {
    try {
      // Get affiliate partner by code
      const q = query(
        collection(db, 'affiliatePartners'),
        where('referralCode', '==', affiliateCode),
        where('status', '==', 'active'),
        limit(1)
      )
      const snapshot = await getDocs(q)
      
      if (snapshot.empty) {
        console.warn('Affiliate code not found:', affiliateCode)
        return
      }

      const affiliateDoc = snapshot.docs[0]
      const affiliateId = affiliateDoc.id

      // Create click record
      await addDoc(collection(db, 'affiliateClicks'), {
        affiliateId,
        affiliateCode,
        landingPage,
        converted: false,
        clickedAt: Timestamp.now(),
        createdAt: Timestamp.now()
      })

      // Update partner stats
      await updateDoc(doc(db, 'affiliatePartners', affiliateId), {
        'stats.totalClicks': (affiliateDoc.data().stats?.totalClicks || 0) + 1,
        lastActivityAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      })

      // Store in cookie for 30 days
      document.cookie = `affiliate_ref=${affiliateCode}; max-age=${30 * 24 * 60 * 60}; path=/`
    } catch (err: any) {
      console.error('Error tracking click:', err)
    }
  }

  return {
    partner,
    loading,
    error,
    isAffiliate: !!partner && partner.status === 'active',
    submitApplication,
    getCommissions,
    getPayouts,
    requestPayout,
    updatePayoutDetails,
    getStats,
    trackClick
  }
}

