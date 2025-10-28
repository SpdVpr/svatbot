'use client'

import { useState, useEffect } from 'react'
import { useWeddingNotifications, useLiveToastNotifications } from '@/hooks/useWeddingNotifications'
import {
  Bell,
  X,
  CheckCircle,
  AlertTriangle,
  Info,
  Clock,
  Calendar,
  DollarSign,
  Users,
  Store,
  Settings,
  ExternalLink
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

const priorityColors = {
  low: 'bg-gray-100 text-gray-700 border-gray-200',
  medium: 'bg-blue-100 text-blue-700 border-blue-200',
  high: 'bg-orange-100 text-orange-700 border-orange-200',
  urgent: 'bg-red-100 text-red-700 border-red-200'
}

const typeColors = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800'
}

export default function LiveNotifications() {
  const [isOpen, setIsOpen] = useState(false)
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    markAllAsRead 
  } = useWeddingNotifications()

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
    // Mark as read
    if (!notification.read) {
      await markAsRead(notification.id)
    }

    // Navigate to action URL if present
    if (notification.actionUrl) {
      setIsOpen(false)
      window.location.href = notification.actionUrl
    }
  }

  return (
    <>
      {/* Notification Bell */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Bell className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {/* Notification Dropdown - Mobile optimized */}
        {isOpen && (
          <div className="absolute right-0 top-full mt-2 w-[calc(100vw-1rem)] sm:w-96 max-w-md bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-[80vh] sm:max-h-96 overflow-hidden">
            {/* Header */}
            <div className="p-3 sm:p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Notifikace</h3>
              <div className="flex items-center space-x-1 sm:space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 whitespace-nowrap"
                  >
                    Označit vše
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Notifications List - Mobile optimized */}
            <div className="max-h-[60vh] sm:max-h-80 overflow-y-auto">
              {loading ? (
                <div className="p-3 sm:p-4 text-center text-gray-500 text-sm">
                  Načítání notifikací...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-6 sm:p-8 text-center text-gray-500">
                  <Bell className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-2 sm:mb-3" />
                  <p className="text-xs sm:text-sm">Žádné notifikace</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => {
                    const CategoryIcon = categoryIcons[notification.category] || Bell
                    
                    return (
                      <div
                        key={notification.id}
                        className={`p-3 sm:p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                          !notification.read ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start space-x-2 sm:space-x-3">
                          {/* Icon */}
                          <div className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${
                            priorityColors[notification.priority]
                          }`}>
                            <CategoryIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm font-medium text-gray-900">
                              {notification.title}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-[10px] sm:text-xs text-gray-500 mt-1 sm:mt-2">
                              {formatTimeAgo(notification.createdAt)}
                            </p>

                            {/* Priority Badge */}
                            {notification.priority === 'urgent' && (
                              <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium bg-red-100 text-red-700 mt-1 sm:mt-2">
                                Urgentní
                              </span>
                            )}
                          </div>

                          {/* Unread Indicator */}
                          {!notification.read && (
                            <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-2 sm:p-3 border-t border-gray-200 bg-gray-50">
                <Link
                  href="/notifications"
                  className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  Zobrazit všechny notifikace →
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}

// Toast Notifications Component
export function LiveToastNotifications() {
  const { toasts, removeToast } = useLiveToastNotifications()

  const getToastIcon = (type: string) => {
    switch (type) {
      case 'success': return CheckCircle
      case 'error': return AlertTriangle
      case 'warning': return AlertTriangle
      case 'info': return Info
      default: return Info
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => {
        const Icon = getToastIcon(toast.type)
        
        return (
          <div
            key={toast.id}
            className={`max-w-sm w-full bg-white shadow-lg rounded-lg border-l-4 p-4 ${typeColors[toast.type as keyof typeof typeColors]}`}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <Icon className="w-5 h-5" />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium">{toast.title}</p>
                <p className="text-sm mt-1 opacity-90">{toast.message}</p>
                {toast.actionUrl && (
                  <Link
                    href={toast.actionUrl}
                    className="text-sm font-medium underline mt-2 inline-block"
                  >
                    Zobrazit detail
                  </Link>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="flex-shrink-0 ml-4 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
