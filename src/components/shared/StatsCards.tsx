'use client'

import {
  CheckCircle,
  Clock,
  AlertTriangle,
  Users,
  UserCheck,
  UserX,
  Calendar,
  Target,
  TrendingUp
} from 'lucide-react'

interface StatsCardsProps {
  type: 'tasks' | 'guests'
  stats: any
  className?: string
}

export default function StatsCards({ type, stats, className = '' }: StatsCardsProps) {
  if (type === 'tasks') {
    const cards = [
      {
        title: 'Celkem úkolů',
        value: stats.total || 0,
        subtitle: `${stats.completed || 0} dokončených`,
        icon: Target,
        color: 'text-gray-600',
        bgColor: 'bg-gray-100',
        iconColor: 'text-gray-600'
      },
      {
        title: 'Dokončeno',
        value: stats.completed || 0,
        subtitle: `${stats.completionRate || 0}% dokončeno`,
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        iconColor: 'text-green-600'
      },
      {
        title: 'Přišlé termíny',
        value: stats.upcoming || 0,
        subtitle: 'Nadcházející úkoly',
        icon: Calendar,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        iconColor: 'text-blue-600'
      },
      {
        title: 'Urgentní úkoly',
        value: stats.overdue || 0,
        subtitle: 'Po termínu',
        icon: AlertTriangle,
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        iconColor: 'text-red-600'
      }
    ]

    return (
      <div className={`space-y-6 ${className}`}>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, index) => (
            <div key={index} className="wedding-card">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">{card.title}</p>
                  <p className={`text-3xl font-bold mb-1 ${card.color}`}>
                    {card.value}
                  </p>
                  <p className="text-xs text-gray-500">{card.subtitle}</p>
                </div>
                <div className={`p-3 rounded-xl ${card.bgColor}`}>
                  <card.icon className={`w-6 h-6 ${card.iconColor}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Overall Progress */}
        <div className="wedding-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Celkový pokrok</h3>
            <span className="text-sm text-gray-500">
              {stats.completionRate || 0}% dokončeno
            </span>
          </div>

          <div className="space-y-3">
            {/* Main progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-primary-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${stats.completionRate || 0}%` }}
              />
            </div>

            {/* Progress breakdown */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold text-gray-900">{stats.completed || 0}</div>
                <div className="text-xs text-gray-500">Dokončeno</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-blue-600">{stats.inProgress || 0}</div>
                <div className="text-xs text-gray-500">Probíhá</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-orange-600">{stats.upcoming || 0}</div>
                <div className="text-xs text-gray-500">Čeká</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-red-600">{stats.overdue || 0}</div>
                <div className="text-xs text-gray-500">Po termínu</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (type === 'guests') {
    const cards = [
      {
        title: 'Celkem hostů',
        value: stats.total || 0,
        subtitle: `${stats.invited || 0} pozváno`,
        icon: Users,
        color: 'text-gray-600',
        bgColor: 'bg-gray-100',
        iconColor: 'text-gray-600'
      },
      {
        title: 'Potvrzeno',
        value: stats.attending || 0,
        subtitle: `${stats.total > 0 ? Math.round((stats.attending / stats.total) * 100) : 0}% potvrzeno`,
        icon: UserCheck,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        iconColor: 'text-green-600'
      },
      {
        title: 'Čeká na odpověď',
        value: stats.pending || 0,
        subtitle: 'Neodpověděli',
        icon: Clock,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        iconColor: 'text-yellow-600'
      },
      {
        title: 'Odmítli',
        value: stats.declined || 0,
        subtitle: 'Nepřijdou',
        icon: UserX,
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        iconColor: 'text-red-600'
      }
    ]

    const responseRate = stats.total > 0 ? Math.round(((stats.attending + stats.declined) / stats.total) * 100) : 0

    return (
      <div className={`space-y-6 ${className}`}>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, index) => (
            <div key={index} className="wedding-card">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">{card.title}</p>
                  <p className={`text-3xl font-bold mb-1 ${card.color}`}>
                    {card.value}
                  </p>
                  <p className="text-xs text-gray-500">{card.subtitle}</p>
                </div>
                <div className={`p-3 rounded-xl ${card.bgColor}`}>
                  <card.icon className={`w-6 h-6 ${card.iconColor}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Overall Progress */}
        <div className="wedding-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Celkový pokrok RSVP</h3>
            <span className="text-sm text-gray-500">
              {responseRate}% odpovědělo
            </span>
          </div>

          <div className="space-y-3">
            {/* Main progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-primary-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${responseRate}%` }}
              />
            </div>

            {/* Progress breakdown */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold text-green-600">{stats.attending || 0}</div>
                <div className="text-xs text-gray-500">Přijdou</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-red-600">{stats.declined || 0}</div>
                <div className="text-xs text-gray-500">Nepřijdou</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-yellow-600">{stats.pending || 0}</div>
                <div className="text-xs text-gray-500">Čeká</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-blue-600">{stats.plusOnes || 0}</div>
                <div className="text-xs text-gray-500">+1</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}
