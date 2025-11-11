'use client'

import { useState, useEffect } from 'react'
import { X, CreditCard, Check, Sparkles, Lock } from 'lucide-react'
import { useSubscription } from '@/hooks/useSubscription'
import { useAuth } from '@/hooks/useAuth'
import { getViewTransitionName } from '@/hooks/useViewTransition'

interface TrialExpiredModalProps {
  onUpgrade?: () => void
}

export default function TrialExpiredModal({ onUpgrade }: TrialExpiredModalProps) {
  const { upgradeToPremium, loading } = useSubscription()
  const { user } = useAuth()
  const [selectedPlan, setSelectedPlan] = useState<'premium_monthly' | 'premium_yearly'>('premium_yearly')
  const [isProcessing, setIsProcessing] = useState(false)

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  const handleUpgrade = async () => {
    try {
      setIsProcessing(true)
      await upgradeToPremium(selectedPlan)
      onUpgrade?.()
    } catch (error) {
      console.error('Error upgrading:', error)
      setIsProcessing(false)
    }
  }

  const plans = [
    {
      id: 'premium_monthly' as const,
      name: 'Měsíční plán',
      price: 299,
      period: 'měsíc',
      description: 'Flexibilní měsíční platba',
      savings: null
    },
    {
      id: 'premium_yearly' as const,
      name: 'Roční plán',
      price: 2999,
      period: 'rok',
      pricePerMonth: 249,
      description: 'Nejlepší hodnota',
      savings: 589,
      popular: true
    }
  ]

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop with blur - cannot be clicked */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        style={getViewTransitionName('trial-expired-backdrop')}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl"
        style={getViewTransitionName('trial-expired-modal')}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-primary-500 to-accent-600 text-white px-6 py-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Lock className="w-8 h-8" />
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-2">Vaše zkušební období skončilo</h2>
          <p className="text-white/90 text-lg">
            Pokračujte v plánování své vysněné svatby s Premium přístupem
          </p>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8">
          {/* Warning Message */}
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
            <div className="flex items-start">
              <Lock className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-red-900 mb-1">Přístup k aplikaci je omezen</h3>
                <p className="text-red-800 text-sm leading-relaxed">
                  Vaše data jsou v bezpečí, ale bez aktivního předplatného nemůžete pokračovat v plánování. 
                  Všechny vaše hosty, úkoly, rozpočet a další informace zůstávají uložené a budou dostupné 
                  ihned po aktivaci Premium plánu.
                </p>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="bg-gradient-to-br from-primary-50 to-accent-50 p-6 rounded-xl mb-6 border border-primary-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Sparkles className="w-6 h-6 text-primary-600 mr-2" />
              Co získáte s Premium plánem
            </h3>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                'Neomezený přístup ke všem funkcím',
                'AI asistent pro plánování',
                'Svatební web s RSVP systémem',
                'Neomezený počet hostů',
                'Pokročilá analytika a reporty',
                'Pravidelné aktualizace',
                'Všechna vaše data ihned dostupná'
              ].map((benefit, index) => (
                <div key={index} className="flex items-start">
                  <Check className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Plans */}
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-6">
              Vyberte si svůj plán
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {/* Monthly Plan */}
              <div
                onClick={() => setSelectedPlan('premium_monthly')}
                className={`relative border-2 rounded-xl p-6 cursor-pointer transition-all ${
                  selectedPlan === 'premium_monthly'
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
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
                      Platba 299 Kč se automaticky strhává každý měsíc. Můžete zrušit kdykoliv.
                    </p>
                  </div>
                </div>
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
                      Zaplatíte pouze jednou 2 999 Kč za celý rok. Žádné automatické obnovení.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="space-y-4">
            <button
              onClick={handleUpgrade}
              disabled={isProcessing || loading}
              className="w-full bg-gradient-to-r from-primary-500 to-accent-600 hover:from-primary-600 hover:to-accent-700 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-lg"
            >
              {isProcessing || loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Zpracovávám...
                </>
              ) : (
                <>
                  <CreditCard className="w-6 h-6 mr-2" />
                  Přejít na platbu
                </>
              )}
            </button>

            <p className="text-center text-sm text-gray-600">
              Bezpečná platba přes Stripe • Můžete zrušit kdykoliv
            </p>
          </div>

          {/* Additional Info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-900 text-center">
              <strong>💡 Tip:</strong> S ročním plánem ušetříte téměř 600 Kč a máte jistotu, 
              že budete mít přístup k aplikaci po celou dobu plánování svatby!
            </p>
          </div>

          {/* Support */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Máte dotazy? Napište nám na{' '}
              <a href="mailto:info@svatbot.cz" className="text-green-600 hover:text-green-700 font-semibold">
                info@svatbot.cz
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

