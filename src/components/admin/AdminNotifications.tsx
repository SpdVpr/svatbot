'use client'

import { useState } from 'react'
import { useAdminNotifications, AdminNotification } from '@/hooks/useAdminNotifications'
import {
  Bell,
  UserPlus,
  DollarSign,
  MessageSquare,
  MessageCircle,
  Star,
  Store,
  X,
  Check,
  Filter
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { cs } from 'date-fns/locale'

const notificationIcons = {
  registration: UserPlus,
  payment: DollarSign,
  inquiry: MessageSquare,
  feedback: MessageCircle,
  review: Star,
  vendor_registration: Store,
  subscription: DollarSign
}

const notificationColors = {
  registration: 'bg-green-100 text-green-700 border-green-200',
  payment: 'bg-blue-100 text-blue-700 border-blue-200',
  inquiry: 'bg-purple-100 text-purple-700 border-purple-200',
  feedback: 'bg-orange-100 text-orange-700 border-orange-200',
  review: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  vendor_registration: 'bg-pink-100 text-pink-700 border-pink-200',
  subscription: 'bg-indigo-100 text-indigo-700 border-indigo-200'
}

const typeLabels = {
  registration: 'Registrace',
  payment: 'Platba',
  inquiry: 'Poptávka',
  feedback: 'Feedback',
  review: 'Recenze',
  vendor_registration: 'Vendor',
  subscription: 'Předplatné'
}

export default function AdminNotifications() {
  const { notifications, unreadCount, loading } = useAdminNotifications()
  const [filter, setFilter] = useState<string>('all')
  const [showAll, setShowAll] = useState(false)

  const filteredNotifications = filter === 'all'
    ? notifications
    : notifications.filter(n => n.type === filter)

  const displayedNotifications = showAll
    ? filteredNotifications
    : filteredNotifications.slice(0, 10)

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 md:w-6 md:h-6 text-primary-600" />
            <h2 className="text-lg md:text-xl font-semibold text-gray-900">
              Notifikace
            </h2>
            {unreadCount > 0 && (
              <span className="px-2 md:px-3 py-1 bg-red-500 text-white text-xs md:text-sm font-medium rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Vše ({notifications.length})
          </button>
          {Object.entries(typeLabels).map(([type, label]) => {
            const count = notifications.filter(n => n.type === type).length
            if (count === 0) return null
            
            return (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-colors ${
                  filter === type
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {label} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {/* Notifications List */}
      <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
        {displayedNotifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Žádné notifikace</p>
          </div>
        ) : (
          displayedNotifications.map((notification) => {
            const Icon = notificationIcons[notification.type]
            const colorClass = notificationColors[notification.type]
            
            return (
              <div
                key={notification.id}
                className={`p-3 md:p-4 hover:bg-gray-50 transition-colors ${
                  !notification.read ? 'bg-blue-50/50' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg border ${colorClass} flex-shrink-0`}>
                    <Icon className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm md:text-base">
                          {notification.title}
                        </p>
                        <p className="text-xs md:text-sm text-gray-600 mt-0.5">
                          {notification.message}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {formatDistanceToNow(notification.createdAt.toDate(), {
                          addSuffix: true,
                          locale: cs
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Show More Button */}
      {filteredNotifications.length > 10 && (
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={() => setShowAll(!showAll)}
            className="w-full px-4 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
          >
            {showAll ? 'Zobrazit méně' : `Zobrazit všech ${filteredNotifications.length} notifikací`}
          </button>
        </div>
      )}
    </div>
  )
}

