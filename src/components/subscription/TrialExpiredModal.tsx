'use client'

import { useState } from 'react'
import { X, CreditCard, Check, Sparkles, Lock } from 'lucide-react'
import { useSubscription } from '@/hooks/useSubscription'
import { useAuth } from '@/hooks/useAuth'

interface TrialExpiredModalProps {
  onUpgrade?: () => void
}

export default function TrialExpiredModal({ onUpgrade }: TrialExpiredModalProps) {
  const { upgradeToPremium, loading } = useSubscription()
  const { user } = useAuth()
  const [selectedPlan, setSelectedPlan] = useState<'premium_monthly' | 'premium_yearly'>('premium_yearly')
  const [isProcessing, setIsProcessing] = useState(false)

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
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />

      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-8 text-center">
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
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl mb-6 border border-green-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Sparkles className="w-6 h-6 text-green-600 mr-2" />
              Co získáte s Premium plánem
            </h3>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                'Neomezený přístup ke všem funkcím',
                'AI asistent pro plánování',
                'Svatební web s RSVP systémem',
                'Neomezený počet hostů',
                'Pokročilá analytika a reporty',
                'Prioritní podpora 7 dní v týdnu',
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
              {plans.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`relative p-6 rounded-xl border-2 transition-all text-left ${
                    selectedPlan === plan.id
                      ? 'border-green-500 bg-green-50 shadow-lg scale-105'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                      NEJLEPŠÍ VOLBA
                    </div>
                  )}
                  
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-bold text-lg text-gray-900">{plan.name}</h4>
                      <p className="text-sm text-gray-600">{plan.description}</p>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selectedPlan === plan.id
                        ? 'border-green-500 bg-green-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedPlan === plan.id && (
                        <Check className="w-4 h-4 text-white" />
                      )}
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="flex items-baseline">
                      <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                      <span className="text-gray-600 ml-2">Kč</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      za {plan.period}
                      {plan.pricePerMonth && (
                        <span className="ml-1">({plan.pricePerMonth} Kč/měsíc)</span>
                      )}
                    </div>
                  </div>

                  {plan.savings && (
                    <div className="bg-green-100 text-green-800 px-3 py-2 rounded-lg text-sm font-semibold inline-block">
                      🎉 Ušetříte {plan.savings} Kč
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* CTA Button */}
          <div className="space-y-4">
            <button
              onClick={handleUpgrade}
              disabled={isProcessing || loading}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-lg"
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

