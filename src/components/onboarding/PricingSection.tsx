'use client'

import { useState } from 'react'
import { Check, Sparkles, Zap, Crown, Globe, TrendingUp, Bot, Wand2, MessageSquare } from 'lucide-react'

interface PricingSectionProps {
  onGetStarted: () => void
}

export default function PricingSection({ onGetStarted }: PricingSectionProps) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  const freeFeatures = [
    'Neomezený počet hostů',
    'Interaktivní seating plan',
    'Správa rozpočtu a úkolů',
    'RSVP systém pro hosty',
    'Timeline a harmonogram',
    'Přístup k marketplace dodavatelů',
    'Responzivní mobilní zobrazení'
  ]

  const freeLimitedFeatures = [
    'AI asistent (omezené dotazy)',
    'Tvorba svatebního webu (základní šablony)'
  ]

  const paidFeatures = [
    'Vše ze zkušební verze',
    'Neomezený AI svatební asistent 🤖',
    'AI generování textů a nápadů ✨',
    'AI doporučení dodavatelů 🎯',
    'Pokročilá tvorba svatebního webu 🌐',
    'Vlastní domény pro svatební web',
    'Premium šablony svatebních webů',
    'Pokročilé analytiky',
    'Prioritní podpora',
    'Export dat',
    'Integrace s kalendářem'
  ]

  return (
    <section id="pricing" className="py-16 md:py-24 lg:py-32 bg-gradient-to-br from-gray-900 via-purple-900 to-rose-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-rose-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16 lg:mb-20">
          <div className="inline-flex items-center px-4 py-2 bg-rose-500/20 backdrop-blur-sm border border-rose-400/30 rounded-full mb-6 animate-fade-in">
            <Sparkles className="w-4 h-4 text-rose-300 mr-2" />
            <span className="text-sm font-semibold text-rose-200">Speciální nabídka</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-extrabold text-white mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Začněte <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-purple-400 to-blue-400">zdarma</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
            První měsíc je na nás! Vyzkoušejte všechny funkce bez rizika a závazků.
          </p>
        </div>



        {/* Pricing cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Free Trial Card */}
          <div
            className="relative bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:border-rose-400/50 transition-all duration-500 animate-fade-in hover:scale-105"
            style={{ animationDelay: '0.4s' }}
            onMouseEnter={() => setHoveredCard('free')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-6 h-6 text-rose-400" />
                <h3 className="text-2xl font-bold text-white">Zkušební měsíc</h3>
              </div>
              <p className="text-gray-400 text-sm">Vyzkoušejte všechny funkce</p>
            </div>

            <div className="mb-8">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl md:text-6xl font-extrabold text-white">0 Kč</span>
              </div>
              <p className="text-gray-400 text-sm mt-2">První měsíc zdarma</p>
            </div>

            <button
              onClick={onGetStarted}
              className="w-full py-4 bg-gradient-to-r from-rose-500 to-purple-500 text-white font-semibold rounded-xl hover:from-rose-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 mb-8"
            >
              Začít zdarma
            </button>

            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-300 mb-4">Plný přístup k funkcím:</p>
              {freeFeatures.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300 text-sm">{feature}</span>
                </div>
              ))}

              <div className="pt-4 border-t border-white/10">
                <p className="text-sm font-semibold text-amber-400 mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Omezené AI funkce:
                </p>
                {freeLimitedFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3 mb-2">
                    <Bot className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-400 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Monthly Card - POPULAR */}
          <div
            className="relative bg-gradient-to-br from-rose-500/20 to-purple-500/20 backdrop-blur-sm rounded-3xl p-8 border-2 border-rose-400/50 hover:border-rose-400 transition-all duration-500 animate-fade-in hover:scale-105 shadow-2xl"
            style={{ animationDelay: '0.5s' }}
            onMouseEnter={() => setHoveredCard('monthly')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            {/* Popular badge */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="px-6 py-2 bg-gradient-to-r from-rose-500 to-purple-500 text-white text-sm font-bold rounded-full shadow-lg flex items-center gap-2">
                <Crown className="w-4 h-4" />
                NEJOBLÍBENĚJŠÍ
              </div>
            </div>

            <div className="mb-6 mt-4">
              <div className="flex items-center gap-2 mb-2">
                <Bot className="w-6 h-6 text-rose-300" />
                <h3 className="text-2xl font-bold text-white">Měsíční předplatné</h3>
              </div>
              <p className="text-gray-300 text-sm">Neomezené AI funkce + vše ostatní</p>
            </div>

            <div className="mb-8">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl md:text-6xl font-extrabold text-white whitespace-nowrap">299 Kč</span>
                <span className="text-gray-400 text-base md:text-lg">/měsíc</span>
              </div>
              <p className="text-gray-400 text-sm mt-2">Fakturováno měsíčně</p>
            </div>

            <button
              onClick={onGetStarted}
              className="w-full py-4 bg-white text-gray-900 font-bold rounded-xl hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 mb-8"
            >
              Začít s prvním měsícem zdarma
            </button>

            <div className="space-y-3">
              <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl p-4 mb-4 border border-blue-400/30">
                <p className="text-sm font-bold text-blue-300 mb-3 flex items-center gap-2">
                  <Wand2 className="w-5 h-5" />
                  Naše konkurenční výhody:
                </p>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Bot className="w-5 h-5 text-blue-300 flex-shrink-0 mt-0.5" />
                    <span className="text-white text-sm font-semibold">Neomezený AI asistent 🤖</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Globe className="w-5 h-5 text-blue-300 flex-shrink-0 mt-0.5" />
                    <span className="text-white text-sm font-semibold">Tvorba svatebního webu 🌐</span>
                  </div>
                </div>
              </div>

              <p className="text-sm font-semibold text-white mb-3">Všechny funkce:</p>
              {paidFeatures.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span className="text-white text-sm font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Yearly Card */}
          <div
            className="relative bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-emerald-400/30 hover:border-emerald-400/50 transition-all duration-500 animate-fade-in hover:scale-105"
            style={{ animationDelay: '0.6s' }}
            onMouseEnter={() => setHoveredCard('yearly')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            {/* Savings badge */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white text-sm font-bold rounded-full shadow-lg flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                UŠETŘÍTE 17%
              </div>
            </div>

            <div className="mb-6 mt-4">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-6 h-6 text-emerald-400" />
                <h3 className="text-2xl font-bold text-white">Roční předplatné</h3>
              </div>
              <p className="text-gray-300 text-sm">Nejlepší hodnota za peníze</p>
            </div>

            <div className="mb-8">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl md:text-5xl font-extrabold text-white">2 999 Kč</span>
                <span className="text-gray-400 text-base">/rok</span>
              </div>
              <div className="mt-3 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 text-sm font-semibold">= 250 Kč/měsíc</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 text-sm font-semibold">Ušetříte 589 Kč ročně!</span>
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                </div>
              </div>
              <p className="text-gray-400 text-sm mt-2">Fakturováno jednou ročně</p>
            </div>

            <button
              onClick={onGetStarted}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold rounded-xl hover:from-emerald-600 hover:to-green-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 mb-8"
            >
              Začít s prvním měsícem zdarma
            </button>

            <div className="space-y-3">
              <div className="bg-gradient-to-r from-emerald-500/20 to-green-500/20 rounded-xl p-4 mb-4 border border-emerald-400/30">
                <p className="text-sm font-bold text-emerald-300 mb-2 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Stejné funkce jako měsíční
                </p>
                <p className="text-gray-300 text-xs">
                  Vše co měsíční předplatné + úspora 589 Kč ročně
                </p>
              </div>

              <p className="text-sm font-semibold text-gray-300 mb-3">Zahrnuje:</p>
              {paidFeatures.slice(0, 7).map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300 text-sm">{feature}</span>
                </div>
              ))}
              <p className="text-xs text-gray-500 pt-2">+ všechny ostatní funkce</p>
            </div>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="mt-16 md:mt-20 text-center animate-fade-in" style={{ animationDelay: '0.7s' }}>
          <div className="inline-flex flex-wrap items-center justify-center gap-8 md:gap-12 text-gray-400">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-emerald-400" />
              <span className="text-sm">Bez závazků</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-emerald-400" />
              <span className="text-sm">Zrušit kdykoliv</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-emerald-400" />
              <span className="text-sm">Bezpečné platby</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-emerald-400" />
              <span className="text-sm">30denní záruka vrácení peněz</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

