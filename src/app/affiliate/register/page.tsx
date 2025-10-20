'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useAffiliate } from '@/hooks/useAffiliate'
import {
  TrendingUp,
  DollarSign,
  Gift,
  CheckCircle,
  ArrowRight,
  Loader2
} from 'lucide-react'

export default function AffiliateRegisterPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { submitApplication, partner, loading: partnerLoading } = useAffiliate()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    agreeToTerms: false
  })

  // Update email when user loads
  useEffect(() => {
    if (user?.email) {
      setFormData(prev => ({ ...prev, email: user.email || '' }))
    }
  }, [user])

  // Redirect if already a partner
  useEffect(() => {
    if (partner && !partnerLoading) {
      router.push('/affiliate/dashboard')
    }
  }, [partner, partnerLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      setError('Musíte být přihlášeni')
      return
    }

    if (!formData.agreeToTerms) {
      setError('Musíte souhlasit s podmínkami')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await submitApplication({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        motivation: 'Chci vydělávat provize',
        experience: 'Nový partner',
        audience: 'Obecná',
        promotionPlan: 'Sdílení na sociálních sítích'
      })

      setSuccess(true)
      setTimeout(() => {
        router.push('/affiliate/dashboard')
      }, 2000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Přihlaste se
          </h2>
          <p className="text-gray-600 mb-6">
            Pro vstup do affiliate programu se musíte nejprve přihlásit.
          </p>
          <button
            onClick={() => router.push('/')}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-600 transition-all"
          >
            Přihlásit se
          </button>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            🎉 Vítejte v affiliate programu!
          </h2>
          <p className="text-gray-600 mb-6">
            Váš účet byl automaticky aktivován. Za chvíli vás přesměrujeme na váš dashboard, kde najdete svůj referral odkaz a statistiky.
          </p>
          <div className="animate-spin w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Affiliate Program Svatbot
          </h1>
          <p className="text-xl text-pink-100 mb-8">
            Vydělávejte 10% provizi z každého prodeje
          </p>

          {/* Benefits */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <DollarSign className="w-12 h-12 mb-4" />
              <h3 className="text-xl font-semibold mb-2">10% Provize</h3>
              <p className="text-pink-100">
                Získejte 10% z každého prodeje Premium předplatného
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <TrendingUp className="w-12 h-12 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Pasivní příjem</h3>
              <p className="text-pink-100">
                Vydělávejte i z opakovaných plateb vašich referrals
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <Gift className="w-12 h-12 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Marketingové materiály</h3>
              <p className="text-pink-100">
                Přístup k profesionálním bannerům a propagačním materiálům
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Registration Form */}
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Vstoupit do affiliate programu
          </h2>
          <p className="text-gray-600 mb-8">
            Stačí vyplnit základní údaje a můžete začít vydělávat
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Základní údaje</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jméno *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Vaše jméno"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Příjmení *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Vaše příjmení"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-gray-50"
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">Email z vašeho účtu</p>
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-2">🎉 Co získáte?</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span><strong>10% provize</strong> z každého prodeje Premium předplatného</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span><strong>Pasivní příjem</strong> - vydělávejte i z opakovaných plateb</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span><strong>Marketingové materiály</strong> zdarma pro propagaci</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span><strong>Detailní statistiky</strong> a reporting v reálném čase</span>
                </li>
              </ul>
            </div>

            {/* Terms */}
            <div>
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.agreeToTerms}
                  onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
                  className="mt-1 w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                />
                <span className="text-sm text-gray-700">
                  Souhlasím s <a href="/terms" className="text-pink-600 hover:underline">obchodními podmínkami</a> a <a href="/privacy" className="text-pink-600 hover:underline">zásadami ochrany osobních údajů</a> affiliate programu *
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-4 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Zpracovávám...</span>
                  </>
                ) : (
                  <>
                    <span>Vstoupit do programu</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

