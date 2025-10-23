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
import {
  Store,
  Users,
  Clock,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Camera,
  MapPin,
  Music,
  Flower,
  Utensils,
  Shirt,
  LayoutDashboard,
  MessageSquare,
  MessageCircle,
  ShoppingBag
} from 'lucide-react'

type TabType = 'overview' | 'users' | 'messages' | 'feedback' | 'payments' | 'vendors'

const categoryIcons = {
  photographer: Camera,
  venue: MapPin,
  music: Music,
  flowers: Flower,
  catering: Utensils,
  dress: Shirt
}

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
      {activeTab === 'messages' && <AdminMessaging />}
      {activeTab === 'feedback' && <FeedbackManagement />}
      {activeTab === 'vendors' && <VendorsTab />}
    </div>
  )
}

function OverviewTab({ stats }: { stats: any }) {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Celkem dodavatelů"
          value={stats?.totalVendors || 0}
          icon={Store}
          color="blue"
          change="+12%"
        />
        <StatCard
          title="Aktivní dodavatelé"
          value={stats?.activeVendors || 0}
          icon={CheckCircle}
          color="green"
          change="+8%"
        />
        <StatCard
          title="Čeká na schválení"
          value={stats?.pendingApprovals || 0}
          icon={Clock}
          color="yellow"
          change="+3"
        />
        <StatCard
          title="Registrovaní uživatelé"
          value={stats?.totalUsers || 0}
          icon={Users}
          color="purple"
          change="+24%"
        />
      </div>

      {/* Email Statistics Panel */}
      <EmailStatsPanel />

      {/* Email Testing Panel */}
      <EmailTestPanel />

      {/* Revenue Card */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Měsíční příjmy</h3>
            <p className="text-3xl font-bold text-green-600">
              {stats?.monthlyRevenue?.toLocaleString('cs-CZ')} Kč
            </p>
            <p className="text-sm text-gray-500 flex items-center mt-1">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              +15% oproti minulému měsíci
            </p>
          </div>
          <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Categories */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Nejpopulárnější kategorie</h3>
          <div className="space-y-3">
            {stats?.topCategories?.map((category: any) => {
              const Icon = categoryIcons[category.category as keyof typeof categoryIcons] || Store
              return (
                <div key={category.category} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <Icon className="h-4 w-4 text-primary-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-900 capitalize">
                      {getCategoryName(category.category)}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">{category.count} dodavatelů</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Nedávná aktivita</h3>
          <div className="space-y-3">
            <ActivityItem
              icon={CheckCircle}
              text="Nový dodavatel schválen"
              time="před 2 hodinami"
              color="green"
            />
            <ActivityItem
              icon={AlertCircle}
              text="Čeká na schválení: Květinové studio"
              time="před 4 hodinami"
              color="yellow"
            />
            <ActivityItem
              icon={Users}
              text="15 nových registrací"
              time="dnes"
              color="blue"
            />
            <ActivityItem
              icon={Store}
              text="Aktualizace profilu: Photo Nejedlí"
              time="včera"
              color="gray"
            />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Rychlé akce</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickActionButton
            href="/admin/vendors/new"
            icon={Store}
            title="Přidat dodavatele"
            description="Vytvořit nový profil dodavatele"
          />
          <QuickActionButton
            href="/admin/vendors"
            icon={CheckCircle}
            title="Schválit dodavatele"
            description="Zkontrolovat čekající žádosti"
          />
          <QuickActionButton
            href="/admin/marketplace"
            icon={TrendingUp}
            title="Marketplace"
            description="Správa marketplace registrací"
          />
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
  change 
}: {
  title: string
  value: number
  icon: any
  color: string
  change?: string
}) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    purple: 'bg-purple-100 text-purple-600'
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className="text-sm text-green-600 mt-1">{change}</p>
          )}
        </div>
        <div className={`h-12 w-12 rounded-full flex items-center justify-center ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  )
}

function ActivityItem({ 
  icon: Icon, 
  text, 
  time, 
  color 
}: {
  icon: any
  text: string
  time: string
  color: string
}) {
  const colorClasses = {
    green: 'text-green-600',
    yellow: 'text-yellow-600',
    blue: 'text-blue-600',
    gray: 'text-gray-600'
  }

  return (
    <div className="flex items-center space-x-3">
      <Icon className={`h-5 w-5 ${colorClasses[color as keyof typeof colorClasses]}`} />
      <div className="flex-1">
        <p className="text-sm text-gray-900">{text}</p>
        <p className="text-xs text-gray-500">{time}</p>
      </div>
    </div>
  )
}

function QuickActionButton({ 
  href, 
  icon: Icon, 
  title, 
  description 
}: {
  href: string
  icon: any
  title: string
  description: string
}) {
  return (
    <a
      href={href}
      className="block p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
    >
      <div className="flex items-center space-x-3">
        <Icon className="h-6 w-6 text-primary-600" />
        <div>
          <h4 className="text-sm font-medium text-gray-900">{title}</h4>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
      </div>
    </a>
  )
}

function getCategoryName(category: string): string {
  const names = {
    photographer: 'Fotografové',
    venue: 'Místa konání',
    music: 'Hudba/DJ',
    flowers: 'Květiny',
    catering: 'Catering',
    dress: 'Svatební šaty'
  }
  return names[category as keyof typeof names] || category
}
