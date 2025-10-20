'use client'

import { useState } from 'react'
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
  Clock
} from 'lucide-react'
import ProfileTab from './ProfileTab'
import SubscriptionTab from './SubscriptionTab'
import PaymentsTab from './PaymentsTab'
import StatisticsTab from './StatisticsTab'
import SettingsTab from './SettingsTab'

interface AccountModalProps {
  onClose: () => void
}

type TabType = 'profile' | 'subscription' | 'payments' | 'statistics' | 'settings'

export default function AccountModal({ onClose }: AccountModalProps) {
  const { user, logout } = useAuth()
  // Load subscription data once at modal level and pass to all tabs
  const subscriptionData = useSubscription()
  const { subscription, hasPremiumAccess, trialDaysRemaining } = subscriptionData
  const [activeTab, setActiveTab] = useState<TabType>('profile')

  const tabs = [
    { id: 'profile' as TabType, label: 'Profil', icon: User },
    { id: 'subscription' as TabType, label: 'Předplatné', icon: Crown },
    { id: 'payments' as TabType, label: 'Platby', icon: CreditCard },
    { id: 'statistics' as TabType, label: 'Statistiky', icon: BarChart3 },
    { id: 'settings' as TabType, label: 'Nastavení', icon: Settings }
  ]

  const handleLogout = async () => {
    await logout()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-primary-100">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-xl">
              {user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                <span>{user?.displayName || 'Můj účet'}</span>
                {hasPremiumAccess && (
                  <Crown className="w-5 h-5 text-yellow-500" fill="currentColor" />
                )}
              </h2>
              <p className="text-sm text-gray-600">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleLogout}
              className="btn-outline flex items-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Odhlásit</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Subscription Status Banner */}
        {subscription && (
          <div className="px-6 py-3 border-b border-gray-200">
            {subscription.status === 'trialing' && subscription.isTrialActive && (
              <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-blue-800">
                    Zkušební období: Zbývá {trialDaysRemaining} {trialDaysRemaining === 1 ? 'den' : trialDaysRemaining < 5 ? 'dny' : 'dní'}
                  </span>
                </div>
                <button
                  onClick={() => setActiveTab('subscription')}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Upgradovat nyní
                </button>
              </div>
            )}
            {subscription.status === 'active' && (
              <div className="flex items-center space-x-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-800">
                  Aktivní předplatné: {subscription.plan === 'premium_monthly' ? 'Premium měsíční' : 'Premium roční'}
                </span>
              </div>
            )}
            {subscription.status === 'expired' && (
              <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-red-800">
                    Předplatné vypršelo. Obnovte pro pokračování.
                  </span>
                </div>
                <button
                  onClick={() => setActiveTab('subscription')}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Obnovit předplatné
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-6 overflow-x-auto">
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
                <Icon className="w-4 h-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Tab Content with smooth transitions */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'profile' && <ProfileTab />}
          {activeTab === 'subscription' && <SubscriptionTab subscriptionData={subscriptionData} />}
          {activeTab === 'payments' && <PaymentsTab subscriptionData={subscriptionData} />}
          {activeTab === 'statistics' && <StatisticsTab subscriptionData={subscriptionData} />}
          {activeTab === 'settings' && <SettingsTab />}
        </div>
      </div>
    </div>
  )
}

