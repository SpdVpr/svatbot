'use client'

import { useState } from 'react'
import { Check, Sparkles, Zap, Crown, Globe, TrendingUp, Bot, Wand2, MessageSquare } from 'lucide-react'
import Image from 'next/image'

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
    <section id="pricing" className="py-16 md:py-24 lg:py-32 bg-gradient-to-br from-purple-100 via-pink-100 to-rose-100 relative overflow-hidden touch-pan-y">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute top-20 left-10 w-64 h-64 bg-pink-200 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-200 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-200 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16 lg:mb-20">
          <div className="inline-flex items-center px-4 py-2 bg-white rounded-full mb-6 animate-fade-in shadow-sm border border-pink-200">
            <Sparkles className="w-4 h-4 text-pink-600 mr-2" />
            <span className="text-sm font-semibold text-gray-800">Speciální nabídka</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-extrabold text-gray-900 mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Začněte <span className="text-pink-500">zdarma</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
            První měsíc je na nás! Vyzkoušejte všechny funkce bez rizika a závazků.
          </p>
        </div>



        {/* Pricing cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Free Trial Card */}
          <div
            className="relative bg-white rounded-3xl p-8 border-2 border-gray-200 hover:border-pink-300 transition-all duration-500 animate-fade-in hover:scale-105 shadow-lg hover:shadow-2xl"
            style={{ animationDelay: '0.4s' }}
            onMouseEnter={() => setHoveredCard('free')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-6 h-6 text-pink-500" />
                <h3 className="text-2xl font-bold text-gray-900">Zkušební měsíc</h3>
              </div>
              <p className="text-gray-600 text-sm">Vyzkoušejte všechny funkce</p>
            </div>

            <div className="mb-8">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl md:text-6xl font-extrabold text-gray-900">0 Kč</span>
              </div>
              <p className="text-gray-600 text-sm mt-2">První měsíc zdarma</p>
            </div>

            <button
              onClick={onGetStarted}
              className="w-full py-4 bg-pink-500 text-white font-semibold rounded-xl hover:bg-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 mb-8"
            >
              Začít zdarma
            </button>

            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-900 mb-4">Plný přístup k funkcím:</p>
              {freeFeatures.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-pink-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-sm">{feature}</span>
                </div>
              ))}

              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm font-semibold text-purple-600 mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Omezené AI funkce:
                </p>
                {freeLimitedFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3 mb-2">
                    <Bot className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Monthly Card - POPULAR */}
          <div
            className="relative bg-pink-50 rounded-3xl p-8 border-2 border-pink-400 hover:border-pink-500 transition-all duration-500 animate-fade-in hover:scale-105 shadow-2xl"
            style={{ animationDelay: '0.5s' }}
            onMouseEnter={() => setHoveredCard('monthly')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            {/* Popular badge */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="px-6 py-2 bg-pink-500 text-white text-sm font-bold rounded-full shadow-lg flex items-center gap-2">
                <Crown className="w-4 h-4" />
                NEJOBLÍBENĚJŠÍ
              </div>
            </div>

            <div className="mb-6 mt-4">
              <div className="flex items-center gap-2 mb-2">
                <Bot className="w-6 h-6 text-pink-600" />
                <h3 className="text-2xl font-bold text-gray-900">Měsíční předplatné</h3>
              </div>
              <p className="text-gray-700 text-sm">Neomezené AI funkce + vše ostatní</p>
            </div>

            <div className="mb-8">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl md:text-6xl font-extrabold text-gray-900 whitespace-nowrap">299 Kč</span>
                <span className="text-gray-600 text-base md:text-lg">/měsíc</span>
              </div>
              <p className="text-gray-600 text-sm mt-2">Fakturováno měsíčně</p>
            </div>

            <button
              onClick={onGetStarted}
              className="w-full py-4 bg-pink-500 text-white font-bold rounded-xl hover:bg-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 mb-8"
            >
              Začít s prvním měsícem zdarma
            </button>

            <div className="space-y-3">
              <div className="bg-purple-100 rounded-xl p-4 mb-4 border border-purple-200">
                <p className="text-sm font-bold text-purple-700 mb-3 flex items-center gap-2">
                  <Wand2 className="w-5 h-5" />
                  Naše konkurenční výhody:
                </p>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Bot className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-900 text-sm font-semibold">Neomezený AI asistent 🤖</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Globe className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-900 text-sm font-semibold">Tvorba svatebního webu 🌐</span>
                  </div>
                </div>
              </div>

              <p className="text-sm font-semibold text-gray-900 mb-3">Všechny funkce:</p>
              {paidFeatures.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-pink-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-sm font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Yearly Card */}
          <div
            className="relative bg-white rounded-3xl p-8 border-2 border-purple-300 hover:border-purple-400 transition-all duration-500 animate-fade-in hover:scale-105 shadow-lg hover:shadow-2xl"
            style={{ animationDelay: '0.6s' }}
            onMouseEnter={() => setHoveredCard('yearly')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            {/* Savings badge */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="px-6 py-2 bg-purple-500 text-white text-sm font-bold rounded-full shadow-lg flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                UŠETŘÍTE 17%
              </div>
            </div>

            <div className="mb-6 mt-4">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-6 h-6 text-purple-600" />
                <h3 className="text-2xl font-bold text-gray-900">Roční předplatné</h3>
              </div>
              <p className="text-gray-600 text-sm">Nejlepší hodnota za peníze</p>
            </div>

            <div className="mb-8">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl md:text-5xl font-extrabold text-gray-900">2 999 Kč</span>
                <span className="text-gray-600 text-base">/rok</span>
              </div>
              <div className="mt-3 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-purple-600 text-sm font-semibold">= 250 Kč/měsíc</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-purple-600 text-sm font-semibold">Ušetříte 589 Kč ročně!</span>
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                </div>
              </div>
              <p className="text-gray-600 text-sm mt-2">Jednorázová platba • Bez automatického obnovení</p>
            </div>

            <button
              onClick={onGetStarted}
              className="w-full py-4 bg-purple-500 text-white font-bold rounded-xl hover:bg-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 mb-8"
            >
              Začít s prvním měsícem zdarma
            </button>

            <div className="space-y-3">
              <div className="bg-pink-100 rounded-xl p-4 mb-4 border border-pink-200">
                <p className="text-sm font-bold text-pink-700 mb-2 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Stejné funkce jako měsíční
                </p>
                <p className="text-gray-700 text-xs">
                  Vše co měsíční členství + úspora 589 Kč ročně • Jednorázová platba
                </p>
              </div>

              <p className="text-sm font-semibold text-gray-900 mb-3">Zahrnuje:</p>
              {paidFeatures.slice(0, 7).map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-sm">{feature}</span>
                </div>
              ))}
              <p className="text-xs text-gray-600 pt-2">+ všechny ostatní funkce</p>
            </div>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="mt-16 md:mt-20 text-center animate-fade-in" style={{ animationDelay: '0.7s' }}>
          <div className="inline-flex flex-wrap items-center justify-center gap-8 md:gap-12 text-gray-600">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-pink-500" />
              <span className="text-sm">Bez závazků</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-pink-500" />
              <span className="text-sm">Možnost zrušení kdykoliv</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-pink-500" />
              <span className="text-sm">Bezpečné platby</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-pink-500" />
              <span className="text-sm">30denní záruka vrácení peněz</span>
            </div>
          </div>
        </div>

        {/* GoPay Payment Gateway */}
        <div className="mt-12 md:mt-16 text-center animate-fade-in" style={{ animationDelay: '0.8s' }}>
          <p className="text-gray-600 text-sm mb-4">Bezpečné platby zajištěny přes</p>
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gray-50 rounded-2xl px-8 py-4 border border-gray-200 hover:border-pink-300 transition-all">
              <Image
                src="/GoPay loga/colorfull.svg"
                alt="GoPay - Bezpečná platební brána"
                width={120}
                height={40}
                className="opacity-90 hover:opacity-100 transition-opacity"
              />
            </div>
          </div>

          {/* Payment methods */}
          <div className="max-w-3xl mx-auto">
            <p className="text-gray-600 text-sm mb-4 font-medium">Podporované platební metody:</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {/* Platební karty */}
              <div className="flex items-center gap-2">
                <Image src="/visa.png" alt="Visa" width={50} height={32} className="hover:scale-110 transition-transform" />
                <Image src="/mastercard.png" alt="Mastercard" width={50} height={32} className="hover:scale-110 transition-transform" />
              </div>

              {/* Česká spořitelna */}
              <Image src="/ceska-sporitelna.png" alt="Česká spořitelna" width={50} height={32} className="hover:scale-110 transition-transform" />

              {/* ČSOB */}
              <Image src="/csob.png" alt="ČSOB" width={50} height={32} className="hover:scale-110 transition-transform" />

              {/* Fio banka */}
              <Image src="/fio.png" alt="Fio banka" width={50} height={32} className="hover:scale-110 transition-transform" />

              {/* mBank */}
              <Image src="/mbank.png" alt="mBank" width={50} height={32} className="hover:scale-110 transition-transform" />

              {/* Google Pay */}
              <Image src="/gpay.png" alt="Google Pay" width={50} height={32} className="hover:scale-110 transition-transform" />

              {/* Bitcoin */}
              <Image src="/bitcoin.png" alt="Bitcoin" width={50} height={32} className="hover:scale-110 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

