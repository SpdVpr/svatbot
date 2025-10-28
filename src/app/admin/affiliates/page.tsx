'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useAdminContext } from '@/hooks/useAdmin'
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  orderBy,
  where,
  Timestamp
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { AffiliatePartner, Commission, Payout } from '@/types/affiliate'
import {
  Users,
  DollarSign,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  Download,
  Loader2
} from 'lucide-react'

// Convert Firestore timestamps
const convertTimestamps = (data: any) => {
  const converted = { ...data }
  Object.keys(converted).forEach(key => {
    if (converted[key] instanceof Timestamp) {
      converted[key] = converted[key].toDate()
    }
  })
  return converted
}

export default function AdminAffiliatesPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { isAuthenticated: isAdmin, isLoading: isAdminLoading } = useAdminContext()

  const [activeTab, setActiveTab] = useState<'partners' | 'commissions' | 'payouts'>('partners')
  const [loading, setLoading] = useState(true)

  const [partners, setPartners] = useState<AffiliatePartner[]>([])
  const [commissions, setCommissions] = useState<Commission[]>([])
  const [payouts, setPayouts] = useState<Payout[]>([])

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    // Wait for admin loading to complete
    if (isAdminLoading) return

    // Check authentication
    if (!isAdmin) {
      router.push('/admin/login')
      return
    }

    loadData()
  }, [isAdmin, isAdminLoading, router])

  const loadData = async () => {
    try {
      setLoading(true)

      const [partnersSnap, commissionsSnap, payoutsSnap] = await Promise.all([
        getDocs(query(collection(db, 'affiliatePartners'), orderBy('createdAt', 'desc'))),
        getDocs(query(collection(db, 'commissions'), orderBy('createdAt', 'desc'))),
        getDocs(query(collection(db, 'payouts'), orderBy('createdAt', 'desc')))
      ])

      setPartners(partnersSnap.docs.map(doc => ({ id: doc.id, ...convertTimestamps(doc.data()) } as AffiliatePartner)))
      setCommissions(commissionsSnap.docs.map(doc => ({ id: doc.id, ...convertTimestamps(doc.data()) } as Commission)))
      setPayouts(payoutsSnap.docs.map(doc => ({ id: doc.id, ...convertTimestamps(doc.data()) } as Payout)))
    } catch (err) {
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  const removePartner = async (partnerId: string) => {
    const reason = prompt('Důvod vyhození partnera:')
    if (!reason) return

    if (!confirm('Opravdu chcete vyhodit tohoto partnera? Tato akce je nevratná.')) return

    try {
      await updateDoc(doc(db, 'affiliatePartners', partnerId), {
        status: 'terminated',
        terminatedAt: Timestamp.now(),
        terminatedBy: user?.id,
        terminationReason: reason,
        updatedAt: Timestamp.now()
      })

      alert('Partner byl vyhozen')
      await loadData()
    } catch (err: any) {
      alert('Chyba: ' + err.message)
    }
  }

  const reactivatePartner = async (partnerId: string) => {
    if (!confirm('Znovu aktivovat tohoto partnera?')) return

    try {
      await updateDoc(doc(db, 'affiliatePartners', partnerId), {
        status: 'active',
        updatedAt: Timestamp.now()
      })

      alert('Partner byl znovu aktivován')
      await loadData()
    } catch (err: any) {
      alert('Chyba: ' + err.message)
    }
  }

  const processPayout = async (payoutId: string) => {
    if (!confirm('Označit výplatu jako dokončenou?')) return

    try {
      const payout = payouts.find(p => p.id === payoutId)
      if (!payout) return

      // Update payout status
      await updateDoc(doc(db, 'payouts', payoutId), {
        status: 'completed',
        processedAt: Timestamp.now(),
        completedAt: Timestamp.now(),
        processedBy: user?.id,
        updatedAt: Timestamp.now()
      })

      // Update commissions to paid
      for (const commissionId of payout.commissionIds) {
        await updateDoc(doc(db, 'commissions', commissionId), {
          status: 'paid',
          paidAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        })
      }

      // Update partner stats
      const partner = partners.find(p => p.id === payout.affiliateId)
      if (partner) {
        await updateDoc(doc(db, 'affiliatePartners', payout.affiliateId), {
          'stats.paidCommission': (partner.stats.paidCommission || 0) + payout.amount,
          'stats.pendingCommission': Math.max(0, (partner.stats.pendingCommission || 0) - payout.amount),
          updatedAt: Timestamp.now()
        })
      }

      alert('Výplata dokončena')
      await loadData()
    } catch (err: any) {
      alert('Chyba: ' + err.message)
    }
  }

  if (loading || isAdminLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    )
  }

  // Calculate stats
  const totalPartners = partners.length
  const activePartners = partners.filter(p => p.status === 'active').length
  const terminatedPartners = partners.filter(p => p.status === 'terminated').length
  const totalCommission = commissions.reduce((sum, c) => sum + c.commissionAmount, 0)
  const pendingPayouts = payouts.filter(p => p.status === 'pending').length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Affiliate systém
          </h1>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{activePartners} / {totalPartners}</div>
              <div className="text-sm text-gray-600">Aktivních partnerů</div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{totalCommission.toFixed(0)} Kč</div>
              <div className="text-sm text-gray-600">Celková provize</div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{pendingPayouts}</div>
              <div className="text-sm text-gray-600">Čekající výplaty</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <div className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('partners')}
                className={`py-4 border-b-2 font-semibold transition-colors ${
                  activeTab === 'partners'
                    ? 'border-pink-500 text-pink-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Partneři ({partners.length})
              </button>
              <button
                onClick={() => setActiveTab('commissions')}
                className={`py-4 border-b-2 font-semibold transition-colors ${
                  activeTab === 'commissions'
                    ? 'border-pink-500 text-pink-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Provize ({commissions.length})
              </button>
              <button
                onClick={() => setActiveTab('payouts')}
                className={`py-4 border-b-2 font-semibold transition-colors ${
                  activeTab === 'payouts'
                    ? 'border-pink-500 text-pink-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Výplaty ({payouts.length})
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'partners' && (
              <div>
                <div className="mb-6">
                  <input
                    type="text"
                    placeholder="Hledat partnera..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Partner</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Kód</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Kliknutí</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Konverze</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Celkem</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Nevyplaceno</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Vyplaceno</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Akce</th>
                      </tr>
                    </thead>
                    <tbody>
                      {partners
                        .filter(p =>
                          searchTerm === '' ||
                          p.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.referralCode.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map((partner) => (
                        <tr key={partner.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="font-semibold text-gray-900">
                              {partner.firstName} {partner.lastName}
                            </div>
                            <div className="text-sm text-gray-600">{partner.email}</div>
                          </td>
                          <td className="py-3 px-4 text-sm font-mono text-gray-900">
                            {partner.referralCode}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-900">
                            {partner.stats.totalClicks}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-900">
                            {partner.stats.totalConversions}
                          </td>
                          <td className="py-3 px-4 text-sm font-semibold text-gray-900">
                            {partner.stats.totalCommission.toFixed(0)} Kč
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-sm font-semibold text-orange-600">
                              {(partner.stats.pendingCommission || 0).toFixed(0)} Kč
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-sm font-semibold text-green-600">
                              {(partner.stats.paidCommission || 0).toFixed(0)} Kč
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              partner.status === 'active' ? 'bg-green-100 text-green-700' :
                              partner.status === 'terminated' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {partner.status === 'active' ? 'Aktivní' :
                               partner.status === 'terminated' ? 'Vyhozen' :
                               partner.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {partner.status === 'active' ? (
                              <button
                                onClick={() => removePartner(partner.id)}
                                className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors"
                              >
                                Vyhodit
                              </button>
                            ) : partner.status === 'terminated' ? (
                              <button
                                onClick={() => reactivatePartner(partner.id)}
                                className="text-sm bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition-colors"
                              >
                                Reaktivovat
                              </button>
                            ) : null}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'commissions' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Datum</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Partner</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Zákazník</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Plán</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Částka</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Provize</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {commissions.map((commission) => {
                      const partner = partners.find(p => p.id === commission.affiliateId)
                      return (
                        <tr key={commission.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm text-gray-900">
                            {commission.createdAt.toLocaleDateString('cs-CZ')}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-900">
                            {partner ? `${partner.firstName} ${partner.lastName}` : commission.affiliateCode}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {commission.userEmail}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-900">
                            {commission.plan === 'premium_monthly' ? 'Premium měsíční' : 'Premium roční'}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-900">
                            {commission.amount.toFixed(2)} Kč
                          </td>
                          <td className="py-3 px-4 text-sm font-semibold text-gray-900">
                            {commission.commissionAmount.toFixed(2)} Kč
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              commission.status === 'paid' ? 'bg-green-100 text-green-700' :
                              commission.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {commission.status === 'paid' ? 'Vyplaceno' :
                               commission.status === 'confirmed' ? 'Potvrzeno' :
                               'Čeká'}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'payouts' && (
              <div className="space-y-4">
                {payouts.map((payout) => {
                  const partner = partners.find(p => p.id === payout.affiliateId)
                  return (
                    <div key={payout.id} className="bg-gray-50 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {partner ? `${partner.firstName} ${partner.lastName}` : 'Neznámý partner'}
                          </h3>
                          <p className="text-sm text-gray-600">{partner?.email}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">
                            {payout.amount.toFixed(2)} Kč
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            payout.status === 'completed' ? 'bg-green-100 text-green-700' :
                            payout.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                            payout.status === 'failed' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {payout.status === 'completed' ? 'Dokončeno' :
                             payout.status === 'processing' ? 'Zpracovává se' :
                             payout.status === 'failed' ? 'Selhalo' :
                             'Čeká'}
                          </span>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-3 gap-4 mb-4 text-sm">
                        <div>
                          <span className="text-gray-600">Požádáno:</span>
                          <span className="ml-2 text-gray-900">
                            {payout.requestedAt.toLocaleDateString('cs-CZ')}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Metoda:</span>
                          <span className="ml-2 text-gray-900">
                            {payout.method === 'bank_transfer' ? 'Bankovní převod' :
                             payout.method === 'paypal' ? 'PayPal' :
                             'Stripe'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Provizí:</span>
                          <span className="ml-2 text-gray-900">
                            {payout.commissionCount}
                          </span>
                        </div>
                      </div>

                      {payout.status === 'pending' && (
                        <button
                          onClick={() => processPayout(payout.id)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center space-x-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Označit jako dokončeno</span>
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

