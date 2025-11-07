'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useSubscription } from '@/hooks/useSubscription'
import {
  X,
  User,
  CreditCard,
  BarChart3,
  Settings,
  Mail,
  Phone,
  Calendar,
  Shield,
  Bell,
  Globe,
  LogOut,
  Crown,
  AlertCircle,
  CheckCircle,
  Clock,
  ChevronDown,
  MessageCircle,
  FileText
} from 'lucide-react'
import ProfileTab from './ProfileTab'
import SubscriptionTab from './SubscriptionTab'
import PaymentsTab from './PaymentsTab'
import InvoicesTab from './InvoicesTab'
import StatisticsTab from './StatisticsTab'
import SettingsTab from './SettingsTab'
import FeedbackTab from './FeedbackTab'
import { getViewTransitionName } from '@/hooks/useViewTransition'

interface AccountModalProps {
  onClose: () => void
  initialTab?: TabType
}

type TabType = 'profile' | 'subscription' | 'payments' | 'invoices' | 'statistics' | 'settings' | 'feedback'

export default function AccountModal({ onClose, initialTab = 'profile' }: AccountModalProps) {
  const { user, logout } = useAuth()
  // Load subscription data once at modal level and pass to all tabs
  const subscriptionData = useSubscription()
  const { subscription, hasPremiumAccess, trialDaysRemaining } = subscriptionData
  const [activeTab, setActiveTab] = useState<TabType>(initialTab)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  const tabs = [
    { id: 'profile' as TabType, label: 'Profil', icon: User },
    { id: 'subscription' as TabType, label: 'Předplatné', icon: Crown },
    { id: 'payments' as TabType, label: 'Platby', icon: CreditCard },
    { id: 'invoices' as TabType, label: 'Faktury', icon: FileText },
    { id: 'statistics' as TabType, label: 'Statistiky', icon: BarChart3 },
    { id: 'feedback' as TabType, label: 'Feedback', icon: MessageCircle },
    { id: 'settings' as TabType, label: 'Nastavení', icon: Settings }
  ]

  const activeTabData = tabs.find(tab => tab.id === activeTab)!

  const handleLogout = async () => {
    await logout()
    onClose()
  }

  // Zabránit scrollování pozadí když je modal otevřený
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[150] p-2 sm:p-4 animate-fade-in">
      {/* Backdrop with View Transition - Solid to prevent content showing through */}
      <div
        className="absolute inset-0 bg-black/50"
        style={getViewTransitionName('account-modal-backdrop')}
        onClick={onClose}
      />

      {/* Modal Content with View Transition */}
      <div
        className="bg-white rounded-xl max-w-5xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col relative"
        style={getViewTransitionName('account-modal')}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-primary-100">
          <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-lg sm:text-xl flex-shrink-0">
              {user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-base sm:text-xl font-semibold text-gray-900 flex items-center space-x-2">
                <span className="truncate">{user?.displayName || 'Můj účet'}</span>
                {hasPremiumAccess && (
                  <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 flex-shrink-0" fill="currentColor" />
                )}
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 truncate">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            <button
              onClick={handleLogout}
              className="btn-outline flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-2"
            >
              <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Odhlásit</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Subscription Status Banner */}
        {subscription && (
          <div className="px-3 sm:px-6 py-2 sm:py-3 border-b border-gray-200">
            {subscription.status === 'trialing' && subscription.isTrialActive && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-3 sm:px-4 py-2 gap-2">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-blue-800">
                    Zkušební období: Zbývá {trialDaysRemaining} {trialDaysRemaining === 1 ? 'den' : trialDaysRemaining < 5 ? 'dny' : 'dní'}
                  </span>
                </div>
                <button
                  onClick={() => setActiveTab('subscription')}
                  className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium whitespace-nowrap"
                >
                  Upgradovat nyní
                </button>
              </div>
            )}
            {subscription.status === 'active' && (
              <div className="flex items-center space-x-2 bg-green-50 border border-green-200 rounded-lg px-3 sm:px-4 py-2">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-green-800">
                  Aktivní předplatné: {subscription.plan === 'premium_monthly' ? 'Premium měsíční' : 'Premium roční'}
                </span>
              </div>
            )}
            {subscription.status === 'expired' && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-red-50 border border-red-200 rounded-lg px-3 sm:px-4 py-2 gap-2">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-red-800">
                    Předplatné vypršelo. Obnovte pro pokračování.
                  </span>
                </div>
                <button
                  onClick={() => setActiveTab('subscription')}
                  className="text-xs sm:text-sm text-red-600 hover:text-red-700 font-medium whitespace-nowrap"
                >
                  Obnovit předplatné
                </button>
              </div>
            )}
          </div>
        )}

        {/* Mobile Dropdown Menu */}
        <div className="sm:hidden border-b border-gray-200 px-3 py-2 relative">
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <activeTabData.icon className="w-5 h-5 text-primary-600" />
              <span className="font-medium text-gray-900">{activeTabData.label}</span>
            </div>
            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showMobileMenu ? 'rotate-180' : ''}`} />
          </button>

          {showMobileMenu && (
            <div className="absolute left-3 right-3 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
              {tabs.map(tab => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id)
                      setShowMobileMenu(false)
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary-50 text-primary-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Desktop Tabs */}
        <div className="hidden sm:flex border-b border-gray-200 px-6 overflow-x-auto scrollbar-hide">
          {tabs.map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="font-medium">{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Tab Content with smooth transitions */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6">
          {activeTab === 'profile' && <ProfileTab />}
          {activeTab === 'subscription' && <SubscriptionTab subscriptionData={subscriptionData} />}
          {activeTab === 'payments' && <PaymentsTab subscriptionData={subscriptionData} />}
          {activeTab === 'invoices' && <InvoicesTab />}
          {activeTab === 'statistics' && <StatisticsTab subscriptionData={subscriptionData} />}
          {activeTab === 'feedback' && <FeedbackTab />}
          {activeTab === 'settings' && <SettingsTab />}
        </div>
      </div>
    </div>
  )
}

