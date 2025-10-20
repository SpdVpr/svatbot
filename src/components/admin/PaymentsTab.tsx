'use client'

import { useState, useCallback } from 'react'
import { useAdminPayments, AdminPaymentRecord } from '@/hooks/useAdminPayments'
import { showSimpleToast } from '@/components/notifications/SimpleToast'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Download,
  Search,
  Filter,
  Calendar,
  Crown,
  AlertCircle
} from 'lucide-react'

export default function PaymentsTab() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [planFilter, setPlanFilter] = useState<string>('all')

  // Callback for new payment notifications
  const handleNewPayment = useCallback((payment: AdminPaymentRecord) => {
    if (payment.status === 'succeeded') {
      showSimpleToast(
        'success',
        'Nová platba! 💰',
        `${payment.userEmail} zaplatil ${payment.amount} ${payment.currency}`
      )
    } else if (payment.status === 'failed') {
      showSimpleToast(
        'error',
        'Platba selhala',
        `Platba od ${payment.userEmail} selhala`
      )
    }
  }, [])

  const { stats, payments, subscriptions, loading, refresh } = useAdminPayments(handleNewPayment)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Filter payments
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  // Filter subscriptions
  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = 
      sub.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.userName?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesPlan = planFilter === 'all' || sub.plan === planFilter
    
    return matchesSearch && matchesPlan
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'succeeded':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />
      case 'pending':
      case 'processing':
        return <Clock className="w-5 h-5 text-amber-600" />
      case 'refunded':
        return <RefreshCw className="w-5 h-5 text-blue-600" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'succeeded':
      case 'active':
        return 'text-green-600 bg-green-50'
      case 'failed':
        return 'text-red-600 bg-red-50'
      case 'pending':
      case 'processing':
        return 'text-amber-600 bg-amber-50'
      case 'trialing':
        return 'text-blue-600 bg-blue-50'
      case 'canceled':
        return 'text-gray-600 bg-gray-50'
      case 'refunded':
        return 'text-purple-600 bg-purple-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      succeeded: 'Zaplaceno',
      failed: 'Selhalo',
      pending: 'Čeká',
      processing: 'Zpracovává se',
      refunded: 'Vráceno',
      canceled: 'Zrušeno',
      active: 'Aktivní',
      trialing: 'Zkušební',
      past_due: 'Po splatnosti',
      unpaid: 'Nezaplaceno'
    }
    return statusMap[status] || status
  }

  const getPlanName = (plan: string) => {
    const planMap: Record<string, string> = {
      free_trial: 'Zkušební období',
      premium_monthly: 'Premium měsíční',
      premium_yearly: 'Premium roční'
    }
    return planMap[plan] || plan
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Celkový příjem"
          value={`${stats?.totalRevenue.toLocaleString('cs-CZ')} Kč`}
          icon={DollarSign}
          color="green"
          subtitle="Všechny platby"
        />
        <StatCard
          title="Měsíční příjem"
          value={`${stats?.monthlyRevenue.toLocaleString('cs-CZ')} Kč`}
          icon={TrendingUp}
          color="blue"
          subtitle="Tento měsíc"
        />
        <StatCard
          title="MRR"
          value={`${stats?.mrr.toLocaleString('cs-CZ')} Kč`}
          icon={RefreshCw}
          color="purple"
          subtitle="Měsíční opakující se příjem"
        />
        <StatCard
          title="ARR"
          value={`${stats?.arr.toLocaleString('cs-CZ')} Kč`}
          icon={TrendingUp}
          color="indigo"
          subtitle="Roční opakující se příjem"
        />
      </div>

      {/* Subscription Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Aktivní předplatná"
          value={stats?.activeSubscriptions || 0}
          icon={Crown}
          color="yellow"
          subtitle={`${stats?.monthlyPlanCount || 0} měsíční, ${stats?.yearlyPlanCount || 0} roční`}
        />
        <StatCard
          title="Zkušební období"
          value={stats?.trialingSubscriptions || 0}
          icon={Clock}
          color="blue"
          subtitle="Aktivní trialy"
        />
        <StatCard
          title="Nová předplatná"
          value={stats?.newSubscriptionsThisMonth || 0}
          icon={TrendingUp}
          color="green"
          subtitle="Tento měsíc"
        />
        <StatCard
          title="Churn Rate"
          value={`${stats?.churnRate.toFixed(1)}%`}
          icon={TrendingDown}
          color="red"
          subtitle="Míra odchodu zákazníků"
        />
      </div>

      {/* Payment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Úspěšné platby"
          value={stats?.successfulPayments || 0}
          icon={CheckCircle}
          color="green"
          subtitle="Zaplaceno"
        />
        <StatCard
          title="Neúspěšné platby"
          value={stats?.failedPayments || 0}
          icon={XCircle}
          color="red"
          subtitle="Selhalo"
        />
        <StatCard
          title="Čekající platby"
          value={stats?.pendingPayments || 0}
          icon={Clock}
          color="amber"
          subtitle="Zpracovává se"
        />
        <StatCard
          title="Průměrná platba"
          value={`${stats?.averageOrderValue.toLocaleString('cs-CZ')} Kč`}
          icon={DollarSign}
          color="blue"
          subtitle="AOV"
        />
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            <button className="border-b-2 border-blue-600 py-4 px-1 text-sm font-medium text-blue-600">
              Platby ({filteredPayments.length})
            </button>
            <button className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
              Předplatná ({filteredSubscriptions.length})
            </button>
          </nav>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Hledat podle emailu, jména nebo čísla faktury..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Všechny stavy</option>
              <option value="succeeded">Zaplaceno</option>
              <option value="failed">Selhalo</option>
              <option value="pending">Čeká</option>
              <option value="processing">Zpracovává se</option>
              <option value="refunded">Vráceno</option>
            </select>
            <button
              onClick={refresh}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Obnovit
            </button>
          </div>
        </div>

        {/* Payments Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Uživatel
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Částka
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stav
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Datum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Faktura
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    Žádné platby nenalezeny
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {payment.userName || payment.userEmail.split('@')[0]}
                        </div>
                        <div className="text-sm text-gray-500">{payment.userEmail}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {payment.amount.toLocaleString('cs-CZ')} {payment.currency}
                      </div>
                      {payment.plan && (
                        <div className="text-xs text-gray-500">{getPlanName(payment.plan)}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                        {getStatusIcon(payment.status)}
                        {getStatusText(payment.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.createdAt.toLocaleDateString('cs-CZ', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {payment.invoiceNumber ? (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-900">#{payment.invoiceNumber}</span>
                          {payment.invoiceUrl && (
                            <a
                              href={payment.invoiceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ElementType
  color: 'green' | 'blue' | 'purple' | 'indigo' | 'yellow' | 'red' | 'amber'
  subtitle?: string
}

function StatCard({ title, value, icon: Icon, color, subtitle }: StatCardProps) {
  const colorClasses = {
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    indigo: 'bg-indigo-100 text-indigo-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    red: 'bg-red-100 text-red-600',
    amber: 'bg-amber-100 text-amber-600'
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`h-12 w-12 rounded-full flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  )
}

