'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useAffiliate } from '@/hooks/useAffiliate'
import type { Commission, Payout } from '@/types/affiliate'
import {
  DollarSign,
  TrendingUp,
  Users,
  MousePointerClick,
  Copy,
  CheckCircle,
  Clock,
  ArrowRight,
  Download,
  Settings,
  Loader2,
  ExternalLink
} from 'lucide-react'

export default function AffiliateDashboardPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { partner, loading: partnerLoading, isAffiliate, getCommissions, getPayouts, requestPayout } = useAffiliate()

  const [activeTab, setActiveTab] = useState<'overview' | 'commissions' | 'payouts' | 'settings'>('overview')
  const [commissions, setCommissions] = useState<Commission[]>([])
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [requestingPayout, setRequestingPayout] = useState(false)
  const hasCheckedAuth = useRef(false)

  // Load data when partner is available
  useEffect(() => {
    if (partner && isAffiliate && !partnerLoading) {
      loadData()
    }
  }, [partner, isAffiliate, partnerLoading])

  const loadData = async () => {
    try {
      setLoading(true)
      const [commissionsData, payoutsData] = await Promise.all([
        getCommissions(),
        getPayouts()
      ])
      setCommissions(commissionsData)
      setPayouts(payoutsData)
    } catch (err) {
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  const copyReferralLink = () => {
    if (partner?.referralLink) {
      navigator.clipboard.writeText(partner.referralLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleRequestPayout = async () => {
    if (!partner) return

    const confirmedCommissions = commissions.filter(c => c.status === 'confirmed' && !c.payoutId)
    if (confirmedCommissions.length === 0) {
      alert('Nemáte žádné potvrzené provize k výplatě')
      return
    }

    const totalAmount = confirmedCommissions.reduce((sum, c) => sum + c.commissionAmount, 0)
    if (totalAmount < partner.minPayoutAmount) {
      alert(`Minimální částka pro výplatu je ${partner.minPayoutAmount} Kč`)
      return
    }

    if (!confirm(`Požádat o výplatu ${totalAmount.toFixed(2)} Kč?`)) {
      return
    }

    try {
      setRequestingPayout(true)
      await requestPayout(totalAmount, confirmedCommissions.map(c => c.id))
      await loadData()
      alert('Žádost o výplatu byla úspěšně odeslána')
    } catch (err: any) {
      alert(err.message)
    } finally {
      setRequestingPayout(false)
    }
  }

  // Show loading while checking auth or loading data
  if (partnerLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!user) {
    if (!hasCheckedAuth.current) {
      hasCheckedAuth.current = true
      router.push('/')
    }
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    )
  }

  // Redirect to registration if not an affiliate
  if (!isAffiliate || !partner) {
    if (!hasCheckedAuth.current) {
      hasCheckedAuth.current = true
      router.push('/affiliate/register')
    }
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    )
  }

  const stats = partner.stats
  const pendingCommissions = commissions.filter(c => c.status === 'confirmed' && !c.payoutId)
  const pendingPayoutAmount = pendingCommissions.reduce((sum, c) => sum + c.commissionAmount, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Affiliate Dashboard</h1>
              <p className="text-pink-100">
                Vítejte zpět, {partner.firstName}!
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                partner.status === 'active' ? 'bg-green-500' :
                partner.status === 'pending' ? 'bg-yellow-500' :
                'bg-red-500'
              }`}>
                {partner.status === 'active' ? 'Aktivní' :
                 partner.status === 'pending' ? 'Čeká na schválení' :
                 'Neaktivní'}
              </span>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <MousePointerClick className="w-8 h-8" />
              </div>
              <div className="text-3xl font-bold mb-1">{stats.totalClicks}</div>
              <div className="text-pink-100 text-sm">Celkem kliknutí</div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-8 h-8" />
              </div>
              <div className="text-3xl font-bold mb-1">{stats.totalConversions}</div>
              <div className="text-pink-100 text-sm">Konverze</div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8" />
              </div>
              <div className="text-3xl font-bold mb-1">{stats.totalRevenue.toFixed(0)} Kč</div>
              <div className="text-pink-100 text-sm">Celkový obrat</div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-8 h-8" />
              </div>
              <div className="text-3xl font-bold mb-1">{stats.totalCommission.toFixed(0)} Kč</div>
              <div className="text-pink-100 text-sm">Celková provize</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Referral Link */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Váš referral odkaz</h2>
          <div className="flex items-center space-x-4">
            <div className="flex-1 bg-gray-50 rounded-lg px-4 py-3 font-mono text-sm">
              {partner.referralLink}
            </div>
            <button
              onClick={copyReferralLink}
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg font-semibold hover:from-pink-600 hover:to-purple-600 transition-all flex items-center space-x-2"
            >
              {copied ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Zkopírováno!</span>
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  <span>Kopírovat</span>
                </>
              )}
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Váš referral kód: <span className="font-semibold">{partner.referralCode}</span>
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <div className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 border-b-2 font-semibold transition-colors ${
                  activeTab === 'overview'
                    ? 'border-pink-500 text-pink-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Přehled
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
              <button
                onClick={() => setActiveTab('settings')}
                className={`py-4 border-b-2 font-semibold transition-colors ${
                  activeTab === 'settings'
                    ? 'border-pink-500 text-pink-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Nastavení
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Pending Payout */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        K výplatě
                      </h3>
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        {pendingPayoutAmount.toFixed(2)} Kč
                      </div>
                      <p className="text-sm text-gray-600">
                        {pendingCommissions.length} potvrzených provizí
                      </p>
                    </div>
                    <button
                      onClick={handleRequestPayout}
                      disabled={requestingPayout || pendingPayoutAmount < partner.minPayoutAmount}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {requestingPayout ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Zpracovávám...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-5 h-5" />
                          <span>Požádat o výplatu</span>
                        </>
                      )}
                    </button>
                  </div>
                  {pendingPayoutAmount < partner.minPayoutAmount && (
                    <p className="text-sm text-gray-600 mt-4">
                      Minimální částka pro výplatu je {partner.minPayoutAmount} Kč
                    </p>
                  )}
                </div>

                {/* Performance Stats */}
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-sm font-medium text-gray-600 mb-2">Conversion Rate</h4>
                    <div className="text-2xl font-bold text-gray-900">
                      {stats.totalClicks > 0 ? ((stats.totalConversions / stats.totalClicks) * 100).toFixed(2) : 0}%
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-sm font-medium text-gray-600 mb-2">Průměrná provize</h4>
                    <div className="text-2xl font-bold text-gray-900">
                      {stats.totalConversions > 0 ? (stats.totalCommission / stats.totalConversions).toFixed(0) : 0} Kč
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-sm font-medium text-gray-600 mb-2">Vyplaceno</h4>
                    <div className="text-2xl font-bold text-gray-900">
                      {stats.paidCommission.toFixed(0)} Kč
                    </div>
                  </div>
                </div>

                {/* Recent Commissions */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Poslední provize</h3>
                  <div className="space-y-3">
                    {commissions.slice(0, 5).map((commission) => (
                      <div key={commission.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-semibold text-gray-900">
                            {commission.plan === 'premium_monthly' ? 'Premium měsíční' : 'Premium roční'}
                          </div>
                          <div className="text-sm text-gray-600">
                            {commission.createdAt.toLocaleDateString('cs-CZ')}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-900">
                            {commission.commissionAmount.toFixed(2)} Kč
                          </div>
                          <div className={`text-sm ${
                            commission.status === 'paid' ? 'text-green-600' :
                            commission.status === 'confirmed' ? 'text-blue-600' :
                            'text-yellow-600'
                          }`}>
                            {commission.status === 'paid' ? 'Vyplaceno' :
                             commission.status === 'confirmed' ? 'Potvrzeno' :
                             'Čeká'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'commissions' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Všechny provize</h3>
                  <div className="text-sm text-gray-600">
                    Celkem: {commissions.length}
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Datum</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Plán</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Částka</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Provize</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {commissions.map((commission) => (
                        <tr key={commission.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm text-gray-900">
                            {commission.createdAt.toLocaleDateString('cs-CZ')}
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
                              commission.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {commission.status === 'paid' ? 'Vyplaceno' :
                               commission.status === 'confirmed' ? 'Potvrzeno' :
                               commission.status === 'cancelled' ? 'Zrušeno' :
                               'Čeká'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'payouts' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Historie výplat</h3>
                  <div className="text-sm text-gray-600">
                    Celkem: {payouts.length}
                  </div>
                </div>
                <div className="space-y-4">
                  {payouts.map((payout) => (
                    <div key={payout.id} className="bg-gray-50 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="text-2xl font-bold text-gray-900">
                            {payout.amount.toFixed(2)} Kč
                          </div>
                          <div className="text-sm text-gray-600">
                            {payout.commissionCount} provizí
                          </div>
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
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Požádáno:</span>
                          <span className="ml-2 text-gray-900">
                            {payout.requestedAt.toLocaleDateString('cs-CZ')}
                          </span>
                        </div>
                        {payout.completedAt && (
                          <div>
                            <span className="text-gray-600">Dokončeno:</span>
                            <span className="ml-2 text-gray-900">
                              {payout.completedAt.toLocaleDateString('cs-CZ')}
                            </span>
                          </div>
                        )}
                        <div>
                          <span className="text-gray-600">Metoda:</span>
                          <span className="ml-2 text-gray-900">
                            {payout.method === 'bank_transfer' ? 'Bankovní převod' :
                             payout.method === 'paypal' ? 'PayPal' :
                             'Stripe'}
                          </span>
                        </div>
                      </div>
                      {payout.failedReason && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                          {payout.failedReason}
                        </div>
                      )}
                    </div>
                  ))}
                  {payouts.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      Zatím nemáte žádné výplaty
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Platební údaje</h3>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <p className="text-sm text-gray-600 mb-4">
                      Pro změnu platebních údajů kontaktujte administrátora.
                    </p>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-gray-600">Metoda výplaty:</span>
                        <span className="ml-2 text-sm font-semibold text-gray-900">
                          {partner.payoutMethod === 'bank_transfer' ? 'Bankovní převod' :
                           partner.payoutMethod === 'paypal' ? 'PayPal' :
                           'Stripe'}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Minimální částka:</span>
                        <span className="ml-2 text-sm font-semibold text-gray-900">
                          {partner.minPayoutAmount} Kč
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Marketingové materiály</h3>
                  <div className="space-y-3">
                    <a
                      href="/affiliate/materials"
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <span className="font-semibold text-gray-900">Bannery a obrázky</span>
                      <ExternalLink className="w-5 h-5 text-gray-400" />
                    </a>
                    <a
                      href="/affiliate/materials"
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <span className="font-semibold text-gray-900">Textové šablony</span>
                      <ExternalLink className="w-5 h-5 text-gray-400" />
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

