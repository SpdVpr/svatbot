'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useAffiliate } from '@/hooks/useAffiliate'
import {
  DollarSign,
  TrendingUp,
  Users,
  Gift,
  CheckCircle,
  ArrowRight,
  BarChart3,
  Zap,
  Shield,
  Loader2
} from 'lucide-react'

export default function AffiliateHomePage() {
  const router = useRouter()
  const { user } = useAuth()
  const { partner, loading } = useAffiliate()

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white">
        <div className="max-w-6xl mx-auto px-4 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Affiliate Program Svatbot
            </h1>
            <p className="text-2xl text-pink-100 mb-8 max-w-3xl mx-auto">
              Vydělávejte 10% provizi z každého prodeje Premium předplatného
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user && partner ? (
                // User is already a partner - show dashboard button
                <a
                  href="/affiliate/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 bg-white text-pink-600 rounded-lg font-bold text-lg hover:bg-pink-50 transition-all shadow-lg flex items-center justify-center space-x-2"
                >
                  <span>Vstoupit do programu</span>
                  <ArrowRight className="w-5 h-5" />
                </a>
              ) : (
                // User is not a partner - show registration button
                <>
                  <button
                    onClick={() => router.push('/affiliate/register')}
                    className="px-8 py-4 bg-white text-pink-600 rounded-lg font-bold text-lg hover:bg-pink-50 transition-all shadow-lg flex items-center justify-center space-x-2"
                  >
                    <span>Začít vydělávat</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                  {user && (
                    <a
                      href="/affiliate/dashboard"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-lg font-bold text-lg hover:bg-white/20 transition-all border-2 border-white/30 flex items-center justify-center"
                    >
                      Partner Dashboard
                    </a>
                  )}
                </>
              )}
            </div>
            {user && partner && (
              <p className="mt-4 text-pink-100">
                Jste aktivní affiliate partner • Referral kód: <span className="font-bold">{partner.referralCode}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="max-w-6xl mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
          Proč se stát naším partnerem?
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow">
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mb-6">
              <DollarSign className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              10% Provize
            </h3>
            <p className="text-gray-600 mb-4">
              Získejte 10% z každého prodeje Premium předplatného. To je 29,90 Kč z měsíčního a 299,90 Kč z ročního plánu.
            </p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Premium měsíční: 29,90 Kč</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Premium roční: 299,90 Kč</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mb-6">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Pasivní příjem
            </h3>
            <p className="text-gray-600 mb-4">
              Vydělávejte i z opakovaných plateb vašich referrals. Jednou přivedete zákazníka a dostáváte provizi z každé jeho platby.
            </p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-blue-500" />
                <span>Dlouhodobý příjem</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-blue-500" />
                <span>Automatické sledování</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
              <Gift className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Marketingové materiály
            </h3>
            <p className="text-gray-600 mb-4">
              Přístup k profesionálním bannerům, textovým šablonám a propagačním materiálům pro snadnou propagaci.
            </p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-purple-500" />
                <span>Bannery a obrázky</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-purple-500" />
                <span>Textové šablony</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            Co dostanete jako partner
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <BarChart3 className="w-6 h-6 text-pink-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Detailní statistiky
                </h3>
                <p className="text-gray-600">
                  Sledujte kliknutí, registrace, konverze a provize v reálném čase. Vše přehledně na jednom místě.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Rychlé výplaty
                </h3>
                <p className="text-gray-600">
                  Požádejte o výplatu kdykoliv dosáhnete minimální částky 1000 Kč. Výplata do 5 pracovních dnů.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Dedikovaná podpora
                </h3>
                <p className="text-gray-600">
                  Náš tým vám pomůže s propagací a zodpoví všechny vaše otázky. Jsme tu pro vás.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Transparentní tracking
                </h3>
                <p className="text-gray-600">
                  30denní cookie tracking zajišťuje, že dostanete provizi i když zákazník nekoupí hned.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="max-w-6xl mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
          Jak to funguje?
        </h2>

        <div className="grid md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              1
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Registrace
            </h3>
            <p className="text-gray-600">
              Vyplňte jednoduchý formulář a počkejte na schválení
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              2
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Získejte odkaz
            </h3>
            <p className="text-gray-600">
              Po schválení dostanete unikátní referral odkaz
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              3
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Propagujte
            </h3>
            <p className="text-gray-600">
              Sdílejte odkaz na sociálních sítích, blogu nebo webu
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              4
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Vydělávejte
            </h3>
            <p className="text-gray-600">
              Získejte 10% provizi z každého prodeje
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Připraveni začít vydělávat?
          </h2>
          <p className="text-xl text-pink-100 mb-8">
            Připojte se k našemu affiliate programu ještě dnes a začněte vydělávat provize.
          </p>
          <button
            onClick={() => router.push('/affiliate/register')}
            className="px-8 py-4 bg-white text-pink-600 rounded-lg font-bold text-lg hover:bg-pink-50 transition-all shadow-lg inline-flex items-center space-x-2"
          >
            <span>Registrovat se zdarma</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-gray-400">
            Máte otázky? Kontaktujte nás na{' '}
            <a href="mailto:affiliate@svatbot.cz" className="text-pink-400 hover:underline">
              affiliate@svatbot.cz
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

