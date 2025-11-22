'use client'

import { useState } from 'react'
import { useWeddingNotifications } from '@/hooks/useWeddingNotifications'
import {
  Bell,
  Filter,
  CheckCircle,
  Clock,
  Calendar,
  DollarSign,
  Users,
  Store,
  Settings,
  ExternalLink,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'

const categoryIcons = {
  task: Clock,
  timeline: Calendar,
  budget: DollarSign,
  guest: Users,
  vendor: Store,
  system: Settings
}

const categoryLabels = {
  task: 'Úkoly',
  timeline: 'Časová osa',
  budget: 'Rozpočet',
  guest: 'Hosté',
  vendor: 'Dodavatelé',
  system: 'Systém'
}

const priorityLabels = {
  low: 'Nízká',
  medium: 'Střední',
  high: 'Vysoká',
  urgent: 'Urgentní'
}

const priorityColors = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700'
}

export default function NotificationsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedPriority, setSelectedPriority] = useState<string>('all')
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)

  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    markAllAsRead 
  } = useWeddingNotifications()

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    if (selectedCategory !== 'all' && notification.category !== selectedCategory) return false
    if (selectedPriority !== 'all' && notification.priority !== selectedPriority) return false
    if (showUnreadOnly && notification.read) return false
    return true
  })

  const formatTimeAgo = (timestamp: any) => {
    if (!timestamp) return 'Právě teď'
    
    const now = new Date()
    const time = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Právě teď'
    if (diffInMinutes < 60) return `Před ${diffInMinutes} min`
    if (diffInMinutes < 1440) return `Před ${Math.floor(diffInMinutes / 60)} h`
    return `Před ${Math.floor(diffInMinutes / 1440)} dny`
  }

  const handleNotificationClick = async (notification: any) => {
    if (!notification.read) {
      await markAsRead(notification.id)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Načítání notifikací...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link
              href="/"
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Zpět na dashboard
            </Link>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Bell className="w-8 h-8 mr-3 text-purple-600" />
                Notifikace
              </h1>
              <p className="text-gray-600 mt-2">
                {unreadCount > 0 ? `${unreadCount} nepřečtených notifikací` : 'Všechny notifikace přečteny'}
              </p>
            </div>
            
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="btn-primary flex items-center space-x-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Označit vše jako přečtené</span>
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="wedding-card mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filtry:</span>
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input-field text-sm"
            >
              <option value="all">Všechny kategorie</option>
              {Object.entries(categoryLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>

            {/* Priority Filter */}
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="input-field text-sm"
            >
              <option value="all">Všechny priority</option>
              {Object.entries(priorityLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>

            {/* Unread Only Toggle */}
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showUnreadOnly}
                onChange={(e) => setShowUnreadOnly(e.target.checked)}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">Pouze nepřečtené</span>
            </label>
          </div>
        </div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <div className="wedding-card text-center py-12">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {showUnreadOnly ? 'Žádné nepřečtené notifikace' : 'Žádné notifikace'}
            </h3>
            <p className="text-gray-600">
              {showUnreadOnly 
                ? 'Všechny notifikace jsou přečtené.' 
                : 'Zatím nemáte žádné notifikace.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notification) => {
              const CategoryIcon = categoryIcons[notification.category] || Bell
              
              return (
                <div
                  key={notification.id}
                  className={`wedding-card hover:shadow-md transition-all cursor-pointer ${
                    !notification.read ? 'ring-2 ring-blue-200 bg-blue-50' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start space-x-4">
                    {/* Icon */}
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                      priorityColors[notification.priority]
                    }`}>
                      <CategoryIcon className="w-6 h-6" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {notification.title}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            priorityColors[notification.priority]
                          }`}>
                            {priorityLabels[notification.priority]}
                          </span>
                          {!notification.read && (
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                      </div>

                      <p className="text-gray-700 mb-3 whitespace-pre-wrap break-words">{notification.message}</p>

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-4">
                          <span className="flex items-center">
                            <CategoryIcon className="w-4 h-4 mr-1" />
                            {categoryLabels[notification.category]}
                          </span>
                          <span>{formatTimeAgo(notification.createdAt)}</span>
                        </div>

                        {notification.actionUrl && (
                          <Link
                            href={notification.actionUrl}
                            className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Zobrazit detail
                            <ExternalLink className="w-4 h-4 ml-1" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
