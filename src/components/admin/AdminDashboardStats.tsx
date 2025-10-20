'use client'

import { useAdminDashboard } from '@/hooks/useAdminDashboard'
import { 
  Users, 
  UserCheck, 
  UserPlus, 
  DollarSign, 
  TrendingUp, 
  MessageSquare,
  AlertCircle,
  Activity,
  Clock,
  CreditCard
} from 'lucide-react'

export default function AdminDashboardStats() {
  const { stats, loading, error } = useAdminDashboard()

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <p className="text-red-600">Chyba při načítání statistik: {error}</p>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Celkem uživatelů',
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      color: 'blue',
      trend: `+${stats.newUsersThisMonth} tento měsíc`
    },
    {
      title: 'Aktivní uživatelé',
      value: stats.activeUsers.toLocaleString(),
      icon: UserCheck,
      color: 'green',
      trend: `${stats.onlineUsers} online nyní`
    },
    {
      title: 'Noví uživatelé (týden)',
      value: stats.newUsersThisWeek.toLocaleString(),
      icon: UserPlus,
      color: 'purple',
      trend: `${stats.newUsersToday} dnes`
    },
    {
      title: 'Měsíční příjem',
      value: `${stats.monthlyRevenue.toLocaleString()} Kč`,
      icon: DollarSign,
      color: 'emerald',
      trend: `${stats.totalRevenue.toLocaleString()} Kč celkem`
    },
    {
      title: 'Aktivní předplatné',
      value: stats.activeSubscriptions.toLocaleString(),
      icon: CreditCard,
      color: 'indigo',
      trend: `${stats.trialUsers} na zkušební verzi`
    },
    {
      title: 'Churn Rate',
      value: `${stats.churnRate.toFixed(1)}%`,
      icon: TrendingUp,
      color: stats.churnRate > 10 ? 'red' : 'green',
      trend: stats.churnRate > 10 ? 'Vysoký' : 'Normální'
    },
    {
      title: 'Otevřené konverzace',
      value: stats.openConversations.toLocaleString(),
      icon: MessageSquare,
      color: 'orange',
      trend: `${stats.pendingFeedback} čekající feedback`
    },
    {
      title: 'Průměrný čas v aplikaci',
      value: `${Math.round(stats.avgSessionTime)} min`,
      icon: Clock,
      color: 'cyan',
      trend: `${stats.avgSessionsPerUser.toFixed(1)} sessions/user`
    }
  ]

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; icon: string }> = {
      blue: { bg: 'bg-blue-50', text: 'text-blue-600', icon: 'text-blue-500' },
      green: { bg: 'bg-green-50', text: 'text-green-600', icon: 'text-green-500' },
      purple: { bg: 'bg-purple-50', text: 'text-purple-600', icon: 'text-purple-500' },
      emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', icon: 'text-emerald-500' },
      indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', icon: 'text-indigo-500' },
      red: { bg: 'bg-red-50', text: 'text-red-600', icon: 'text-red-500' },
      orange: { bg: 'bg-orange-50', text: 'text-orange-600', icon: 'text-orange-500' },
      cyan: { bg: 'bg-cyan-50', text: 'text-cyan-600', icon: 'text-cyan-500' }
    }
    return colors[color] || colors.blue
  }

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          const colors = getColorClasses(stat.color)
          
          return (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {stat.title}
                  </p>
                  <p className={`text-3xl font-bold ${colors.text} mb-2`}>
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-500">
                    {stat.trend}
                  </p>
                </div>
                <div className={`${colors.bg} p-3 rounded-lg`}>
                  <Icon className={`w-6 h-6 ${colors.icon}`} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
        <h3 className="text-lg font-semibold mb-4">Rychlé akce</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-4 text-left transition-colors">
            <MessageSquare className="w-5 h-5 mb-2" />
            <p className="font-medium">Zprávy</p>
            <p className="text-sm opacity-90">{stats.openConversations} otevřených</p>
          </button>
          <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-4 text-left transition-colors">
            <AlertCircle className="w-5 h-5 mb-2" />
            <p className="font-medium">Feedback</p>
            <p className="text-sm opacity-90">{stats.pendingFeedback} čekajících</p>
          </button>
          <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-4 text-left transition-colors">
            <Users className="w-5 h-5 mb-2" />
            <p className="font-medium">Uživatelé</p>
            <p className="text-sm opacity-90">{stats.onlineUsers} online</p>
          </button>
          <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-4 text-left transition-colors">
            <Activity className="w-5 h-5 mb-2" />
            <p className="font-medium">Aktivita</p>
            <p className="text-sm opacity-90">{stats.totalSessions} sessions</p>
          </button>
        </div>
      </div>

      {/* Activity Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Přehled aktivity
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Celkový čas v aplikaci</span>
              <span className="text-sm font-semibold text-gray-900">
                {Math.round(stats.avgSessionTime * stats.totalUsers).toLocaleString()} min
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Průměrná session</span>
              <span className="text-sm font-semibold text-gray-900">
                {Math.round(stats.avgSessionTime)} min
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Sessions per user</span>
              <span className="text-sm font-semibold text-gray-900">
                {stats.avgSessionsPerUser.toFixed(1)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Aktivní uživatelé</span>
              <span className="text-sm font-semibold text-gray-900">
                {((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Finanční přehled
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Celkový příjem</span>
              <span className="text-sm font-semibold text-gray-900">
                {stats.totalRevenue.toLocaleString()} Kč
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Měsíční příjem</span>
              <span className="text-sm font-semibold text-gray-900">
                {stats.monthlyRevenue.toLocaleString()} Kč
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Aktivní předplatné</span>
              <span className="text-sm font-semibold text-gray-900">
                {stats.activeSubscriptions}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">ARPU</span>
              <span className="text-sm font-semibold text-gray-900">
                {stats.activeSubscriptions > 0 
                  ? Math.round(stats.monthlyRevenue / stats.activeSubscriptions).toLocaleString()
                  : 0} Kč
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

