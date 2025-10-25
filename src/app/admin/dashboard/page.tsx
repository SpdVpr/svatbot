'use client'

import { useState } from 'react'
import { useAdminStats } from '@/hooks/useAdmin'
import AdminDashboardStats from '@/components/admin/AdminDashboardStats'
import UserAnalyticsTable from '@/components/admin/UserAnalyticsTable'
import AdminMessaging from '@/components/admin/AdminMessaging'
import FeedbackManagement from '@/components/admin/FeedbackManagement'
import PaymentsTab from '@/components/admin/PaymentsTab'
import EmailStatsPanel from '@/components/admin/EmailStatsPanel'
import EmailTestPanel from '@/components/admin/EmailTestPanel'
import ReviewModeration from '@/components/admin/ReviewModeration'
import {
  Users,
  Clock,
  DollarSign,
  TrendingUp,
  CheckCircle,
  LayoutDashboard,
  MessageSquare,
  MessageCircle,
  ShoppingBag,
  Star
} from 'lucide-react'

type TabType = 'overview' | 'users' | 'messages' | 'feedback' | 'payments' | 'vendors' | 'reviews'

export default function AdminDashboard() {
  const { stats, loading } = useAdminStats()
  const [activeTab, setActiveTab] = useState<TabType>('overview')

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'overview' as TabType, label: 'Přehled', icon: LayoutDashboard },
    { id: 'users' as TabType, label: 'Uživatelé', icon: Users },
    { id: 'payments' as TabType, label: 'Platby', icon: DollarSign },
    { id: 'reviews' as TabType, label: 'Recenze', icon: Star },
    { id: 'messages' as TabType, label: 'Zprávy', icon: MessageSquare },
    { id: 'feedback' as TabType, label: 'Feedback', icon: MessageCircle },
    { id: 'vendors' as TabType, label: 'Vendors', icon: ShoppingBag }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Správa a analytika SvatBot.cz</p>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <nav className="flex space-x-4 p-4 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'overview' && <OverviewTab stats={stats} />}
      {activeTab === 'users' && <UserAnalyticsTable />}
      {activeTab === 'payments' && <PaymentsTab />}
      {activeTab === 'reviews' && <ReviewModeration />}
      {activeTab === 'messages' && <AdminMessaging />}
      {activeTab === 'feedback' && <FeedbackManagement />}
      {activeTab === 'vendors' && <VendorsTab />}
    </div>
  )
}

function OverviewTab({ stats }: { stats: any }) {
  return (
    <div className="space-y-6">
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Celkem uživatelů"
          value={stats?.totalUsers || 0}
          icon={Users}
          color="blue"
          subtitle="Registrovaných účtů"
        />
        <StatCard
          title="Dnes registrovaní"
          value={stats?.newUsersToday || 0}
          icon={Users}
          color="green"
          subtitle={`+${stats?.newUsersThisWeek || 0} tento týden`}
        />
        <StatCard
          title="Aktivní uživatelé"
          value={stats?.activeUsers || 0}
          icon={CheckCircle}
          color="purple"
          subtitle="Přihlášení za 30 dní"
        />
        <StatCard
          title="Dnes přihlášení"
          value={stats?.onlineUsers || 0}
          icon={TrendingUp}
          color="orange"
          subtitle="Aktivní dnes"
        />
      </div>

      {/* Email Statistics Panel */}
      <EmailStatsPanel />

      {/* Email Testing Panel */}
      <EmailTestPanel />

      {/* Subscription & Revenue Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Měsíční příjmy</h3>
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-green-600">
            {stats?.monthlyRevenue?.toLocaleString('cs-CZ')} Kč
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Celkem: {stats?.totalRevenue?.toLocaleString('cs-CZ')} Kč
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Aktivní předplatné</h3>
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-blue-600">
            {stats?.activeSubscriptions || 0}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Trial: {stats?.trialUsers || 0} uživatelů
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Průměrná doba relace</h3>
            <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-purple-600">
            {stats?.avgSessionTime || 0} min
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Celkem relací: {stats?.totalSessions?.toLocaleString('cs-CZ') || 0}
          </p>
        </div>
      </div>

      {/* User Growth Chart Placeholder */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Růst uživatelů</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Tento měsíc</span>
            <span className="text-lg font-semibold text-gray-900">
              +{stats?.newUsersThisMonth || 0} uživatelů
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Tento týden</span>
            <span className="text-lg font-semibold text-gray-900">
              +{stats?.newUsersThisWeek || 0} uživatelů
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Dnes</span>
            <span className="text-lg font-semibold text-gray-900">
              +{stats?.newUsersToday || 0} uživatelů
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function VendorsTab() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
      <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        Vendor Management
      </h3>
      <p className="text-gray-600 mb-6">
        Správa dodavatelů a marketplace
      </p>
      <div className="flex gap-4 justify-center">
        <a
          href="/admin/vendors"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Spravovat Vendors
        </a>
        <a
          href="/admin/marketplace"
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Marketplace
        </a>
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  subtitle
}: {
  title: string
  value: number
  icon: any
  color: string
  subtitle?: string
}) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600'
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value.toLocaleString('cs-CZ')}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`h-12 w-12 rounded-full flex items-center justify-center ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  )
}


