'use client'

import { useState } from 'react'
import { collection, query, where, getDocs, addDoc, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export default function DebugAffiliatePage() {
  const [log, setLog] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const addLog = (message: string) => {
    setLog(prev => [...prev, message])
    console.log(message)
  }

  const checkPartner = async () => {
    setLoading(true)
    setLog([])
    const referralCode = 'MIC150254'

    try {
      addLog(`🔍 Checking for partner with code: ${referralCode}`)

      const q = query(
        collection(db, 'affiliatePartners'),
        where('referralCode', '==', referralCode)
      )
      const snapshot = await getDocs(q)

      if (!snapshot.empty) {
        const doc = snapshot.docs[0]
        const data = doc.data()
        addLog('✅ Partner found!')
        addLog(JSON.stringify({
          id: doc.id,
          referralCode: data.referralCode,
          status: data.status,
          stats: data.stats,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || 'N/A'
        }, null, 2))

        // Check affiliateStats
        addLog('\n📊 Checking affiliateStats...')
        const statsQuery = query(
          collection(db, 'affiliateStats'),
          where('affiliateId', '==', doc.id)
        )
        const statsSnapshot = await getDocs(statsQuery)

        if (statsSnapshot.empty) {
          addLog('⚠️ No affiliateStats found for this partner')
        } else {
          addLog(`✅ Found ${statsSnapshot.size} affiliateStats documents`)
          statsSnapshot.docs.forEach(statsDoc => {
            const statsData = statsDoc.data()
            addLog(`\n📅 Date: ${statsData.date}`)
            addLog(`  Clicks: ${statsData.clicks}`)
            addLog(`  Sources: ${JSON.stringify(statsData.sources || {})}`)
            addLog(`  Devices: ${JSON.stringify(statsData.devices || {})}`)
            addLog(`  Browsers: ${JSON.stringify(statsData.browsers || {})}`)
          })
        }
      } else {
        addLog('❌ Partner not found')
      }
    } catch (error: any) {
      addLog(`❌ Error: ${error.message}`)
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const createPartner = async () => {
    setLoading(true)
    const referralCode = 'MIC150254'

    try {
      addLog(`📝 Creating partner with code: ${referralCode}`)

      const partnerData = {
        userId: 'test-user-' + Date.now(),
        firstName: 'Michal',
        lastName: 'Test',
        email: 'michal@test.cz',
        phone: null,
        company: null,
        website: null,
        status: 'active',
        referralCode: referralCode,
        referralLink: `https://svatbot.cz?ref=${referralCode}`,
        commissionRate: 10,
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
        minPayoutAmount: 1000,
        motivation: 'Test partner',
        experience: 'Test',
        audience: 'Test',
        promotionPlan: 'Test',
        socialMedia: {
          instagram: null,
          facebook: null,
          youtube: null,
          tiktok: null,
          blog: null
        },
        expectedMonthlyClicks: 0,
        expectedMonthlyConversions: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        lastActivityAt: Timestamp.now()
      }

      const docRef = await addDoc(collection(db, 'affiliatePartners'), partnerData)
      addLog(`✅ Partner created with ID: ${docRef.id}`)
      addLog(`🔗 Referral link: https://svatbot.cz?ref=${referralCode}`)
    } catch (error: any) {
      addLog(`❌ Error: ${error.message}`)
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Debug Affiliate System</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <div className="flex gap-4">
            <button
              onClick={checkPartner}
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Check Partner MIC150254'}
            </button>
            <button
              onClick={createPartner}
              disabled={loading}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Create Partner MIC150254'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Log</h2>
          <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm whitespace-pre-wrap max-h-96 overflow-y-auto">
            {log.length === 0 ? 'No logs yet. Click a button above.' : log.join('\n')}
          </div>
        </div>

        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Note</h3>
          <p className="text-yellow-700 text-sm">
            This is a debug page. Make sure you have proper permissions to create affiliate partners.
            Check Firebase Console for the actual data.
          </p>
        </div>
      </div>
    </div>
  )
}

