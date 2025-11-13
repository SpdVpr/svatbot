'use client'

import React, { useState, memo } from 'react'
import { useSubscription } from '@/hooks/useSubscription'
import {
  Crown,
  Check,
  CheckCircle,
  X,
  Calendar,
  CreditCard,
  AlertCircle,
  Sparkles,
  TrendingUp,
  Clock
} from 'lucide-react'
import { SUBSCRIPTION_PLANS } from '@/types/subscription'

interface SubscriptionTabProps {
  subscriptionData: ReturnType<typeof useSubscription>
}

function SubscriptionTab({ subscriptionData }: SubscriptionTabProps) {
  const {
    subscription,
    hasPremiumAccess,
    trialDaysRemaining,
    upgradeToPremium,
    cancelSubscription,
    reactivateSubscription,
    loading
  } = subscriptionData

  const [selectedPlan, setSelectedPlan] = useState<'premium_monthly' | 'premium_yearly' | 'test_daily'>('premium_yearly')

  const handleUpgrade = async () => {
    await upgradeToPremium(selectedPlan)
  }

  const handleCancel = async () => {
    if (confirm('Opravdu chcete zrušit předplatné? Přístup k Premium funkcím bude zachován do konce aktuálního období.')) {
      await cancelSubscription()
    }
  }

  const handleReactivate = async () => {
    await reactivateSubscription()
  }

  // Don't show any loading state - render immediately with available data
  // This prevents flickering when switching tabs

  return (
    <div className="space-y-6">
      {/* Current Subscription Status */}
      {subscription && (
        <div className="bg-gradient-to-r from-primary-50 to-primary-100 border border-primary-200 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" fill="currentColor" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {subscription.status === 'trialing' && 'Zkušební období'}
                  {subscription.status === 'active' && subscription.plan === 'premium_monthly' && 'Premium měsíční'}
                  {subscription.status === 'active' && subscription.plan === 'premium_yearly' && 'Premium roční'}
                  {subscription.status === 'active' && subscription.plan === 'test_daily' && '🧪 Test denní'}
                  {subscription.status === 'expired' && 'Předplatné vypršelo'}
                </h3>
                <p className="text-sm text-gray-600">
                  {subscription.status === 'trialing' && `Zbývá ${trialDaysRemaining} ${trialDaysRemaining === 1 ? 'den' : trialDaysRemaining < 5 ? 'dny' : 'dní'}`}
                  {subscription.status === 'active' && subscription.plan === 'test_daily' && `⚠️ TESTOVACÍ - Opakování každý den - Aktivní do ${new Date(subscription.currentPeriodEnd).toLocaleDateString('cs-CZ')}`}
                  {subscription.status === 'active' && subscription.plan !== 'test_daily' && `Aktivní do ${new Date(subscription.currentPeriodEnd).toLocaleDateString('cs-CZ')}`}
                  {subscription.status === 'expired' && 'Obnovte pro pokračování'}
                </p>
              </div>
            </div>
            {subscription.status === 'active' && !subscription.cancelAtPeriodEnd && (
              <button
                onClick={handleCancel}
                disabled={loading}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Zrušit předplatné
              </button>
            )}
            {subscription.cancelAtPeriodEnd && (
              <button
                onClick={handleReactivate}
                disabled={loading}
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                Obnovit předplatné
              </button>
            )}
          </div>

          {/* Premium Days Remaining - Show for active subscriptions */}
          {subscription.status === 'active' && subscription.currentPeriodEnd && (
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 border border-primary-200">
                  <div className="flex items-center space-x-2 mb-1">
                    <Clock className="w-4 h-4 text-primary-600" />
                    <span className="text-sm font-medium text-gray-600">Zbývající dny</span>
                  </div>
                  <p className="text-2xl font-bold text-primary-600">
                    {Math.max(0, Math.ceil((new Date(subscription.currentPeriodEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-primary-200">
                  <div className="flex items-center space-x-2 mb-1">
                    <Calendar className="w-4 h-4 text-primary-600" />
                    <span className="text-sm font-medium text-gray-600">Obnoví se</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    {new Date(subscription.currentPeriodEnd).toLocaleDateString('cs-CZ', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              {/* Auto-renewal info */}
              {!subscription.cancelAtPeriodEnd && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-900">
                      Automatické obnovení aktivní
                    </p>
                    <p className="text-xs text-green-700 mt-1">
                      Vaše předplatné se automaticky obnoví {new Date(subscription.currentPeriodEnd).toLocaleDateString('cs-CZ')}.
                      {subscription.plan === 'premium_monthly' && (
                        <span className="font-semibold"> Částka k úhradě: 299 Kč</span>
                      )}
                      {subscription.plan === 'premium_yearly' && (
                        <span className="font-semibold"> Částka k úhradě: 2 999 Kč</span>
                      )}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {subscription.cancelAtPeriodEnd && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <p className="text-sm text-amber-800">
                Vaše předplatné bude zrušeno {new Date(subscription.currentPeriodEnd).toLocaleDateString('cs-CZ')}.
                Můžete ho obnovit kdykoliv před tímto datem.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Pricing Plans */}
      {(!hasPremiumAccess || subscription?.status === 'trialing') && (
        <div>
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Vyberte si tarif
            </h3>
            <p className="text-gray-600">
              Získejte plný přístup ke všem funkcím aplikace
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Monthly Plan */}
            <div
              onClick={() => setSelectedPlan('premium_monthly')}
              className={`relative border-2 rounded-xl p-6 cursor-pointer transition-all ${
                selectedPlan === 'premium_monthly'
                  ? 'border-primary-600 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Popular Badge */}
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center space-x-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>NEJOBLÍBENĚJŠÍ</span>
                </span>
              </div>

              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xl font-bold text-gray-900">Měsíční</h4>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selectedPlan === 'premium_monthly'
                    ? 'border-primary-600 bg-primary-600'
                    : 'border-gray-300'
                }`}>
                  {selectedPlan === 'premium_monthly' && (
                    <Check className="w-4 h-4 text-white" />
                  )}
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-baseline space-x-1">
                  <span className="text-4xl font-bold text-gray-900">299</span>
                  <span className="text-gray-600">Kč / měsíc</span>
                </div>
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-900 font-semibold mb-1">
                    🔄 Opakovaná platba každý měsíc
                  </p>
                  <p className="text-xs text-blue-800">
                    Platba 299 Kč se automaticky strhává každý měsíc. Můžete zrušit kdykoliv jedním kliknutím v nastavení účtu na záložce "Předplatné" tlačítkem "Zrušit předplatné".
                  </p>
                </div>
              </div>

              <ul className="space-y-3">
                {SUBSCRIPTION_PLANS[1].features.map((feature, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Yearly Plan */}
            <div
              onClick={() => setSelectedPlan('premium_yearly')}
              className={`relative border-2 rounded-xl p-6 cursor-pointer transition-all ${
                selectedPlan === 'premium_yearly'
                  ? 'border-primary-600 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Best Value Badge */}
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center space-x-1">
                  <Sparkles className="w-3 h-3" />
                  <span>NEJVÝHODNĚJŠÍ</span>
                </span>
              </div>

              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xl font-bold text-gray-900">Roční</h4>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selectedPlan === 'premium_yearly'
                    ? 'border-primary-600 bg-primary-600'
                    : 'border-gray-300'
                }`}>
                  {selectedPlan === 'premium_yearly' && (
                    <Check className="w-4 h-4 text-white" />
                  )}
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-baseline space-x-1">
                  <span className="text-4xl font-bold text-gray-900">2 999</span>
                  <span className="text-gray-600">Kč / rok</span>
                </div>
                <p className="text-sm text-green-600 font-medium mt-1">
                  Ušetříte 589 Kč (17%)
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  To je jen 250 Kč/měsíc
                </p>
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-xs text-green-900 font-semibold mb-1">
                    ✓ Jednorázová platba
                  </p>
                  <p className="text-xs text-green-800">
                    Zaplatíte pouze jednou 2 999 Kč za celý rok. Žádné automatické obnovení ani opakované platby.
                  </p>
                </div>
              </div>

              <ul className="space-y-3">
                {SUBSCRIPTION_PLANS[2].features.map((feature, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Test Daily Plan - Only visible in subscription settings */}
          <div className="mt-6">
            <div
              onClick={() => setSelectedPlan('test_daily')}
              className={`relative border-2 rounded-xl p-6 cursor-pointer transition-all ${
                selectedPlan === 'test_daily'
                  ? 'border-orange-600 bg-orange-50'
                  : 'border-orange-200 hover:border-orange-300'
              }`}
            >
              {/* Test Badge */}
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center space-x-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>POUZE PRO TESTOVÁNÍ</span>
                </span>
              </div>

              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xl font-bold text-gray-900">🧪 Test denní</h4>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selectedPlan === 'test_daily'
                    ? 'border-orange-600 bg-orange-600'
                    : 'border-gray-300'
                }`}>
                  {selectedPlan === 'test_daily' && (
                    <Check className="w-4 h-4 text-white" />
                  )}
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-baseline space-x-1">
                  <span className="text-4xl font-bold text-gray-900">10</span>
                  <span className="text-gray-600">Kč / den</span>
                </div>
                <p className="text-sm text-orange-600 font-medium mt-1">
                  ⚠️ Opakování každý den - pouze pro testování
                </p>
              </div>

              <ul className="space-y-3">
                {SUBSCRIPTION_PLANS[3].features.map((feature, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Upgrade Button */}
          <div className="mt-6">
            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="w-full btn-primary py-4 text-lg font-semibold flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 loading-spinner" />
                  <span>Zpracování...</span>
                </>
              ) : (
                <>
                  <Crown className="w-5 h-5" />
                  <span>
                    Upgradovat na {
                      selectedPlan === 'premium_monthly' ? 'měsíční' :
                      selectedPlan === 'premium_yearly' ? 'roční' :
                      'testovací denní'
                    } tarif
                  </span>
                </>
              )}
            </button>
            <p className="text-center text-sm text-gray-500 mt-3">
              Bezpečná platba přes GoPay. Můžete zrušit kdykoliv.
            </p>
          </div>
        </div>
      )}

      {/* Features Comparison */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Co získáte s Premium
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
              <Check className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Neomezený počet hostů</p>
              <p className="text-sm text-gray-600">Přidejte kolik chcete hostů bez omezení</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
              <Check className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Svatební web</p>
              <p className="text-sm text-gray-600">Vlastní web pro vaše hosty</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
              <Check className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Online RSVP</p>
              <p className="text-sm text-gray-600">Hosté mohou potvrdit účast online</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
              <Check className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">AI asistent</p>
              <p className="text-sm text-gray-600">Inteligentní pomocník pro plánování</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Memoize to prevent unnecessary re-renders
export default memo(SubscriptionTab)
