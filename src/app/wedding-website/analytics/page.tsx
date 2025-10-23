'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useWeddingWebsite } from '@/hooks/useWeddingWebsite'
import { useAuthStore } from '@/stores/authStore'
import { useWeddingStore } from '@/stores/weddingStore'
import { ArrowLeft, Eye, Users, BarChart3, TrendingUp, Clock, Globe } from 'lucide-react'
import Link from 'next/link'

export default function AnalyticsPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { currentWedding: wedding } = useWeddingStore()
  const { website, loading } = useWeddingWebsite()

  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500 mb-4"></div>
          <p className="text-gray-600">Načítání...</p>
        </div>
      </div>
    )
  }

  if (!website) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Žádný svatební web
            </h1>
            <p className="text-gray-600 mb-4">
              Nejdříve si vytvořte svatební web.
            </p>
            <Link href="/wedding-website" className="btn-primary">
              Zpět na svatební web
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/wedding-website"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Zpět na svatební web
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Statistiky a analytika
          </h1>
          <p className="text-gray-600">
            Sledujte návštěvnost a aktivitu na vašem svatebním webu
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Celkem zobrazení</span>
              <Eye className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {website.analytics.views}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Od publikování
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Unikátní návštěvníci</span>
              <Users className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {website.analytics.uniqueVisitors}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Různých uživatelů
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Průměrná doba</span>
              <Clock className="w-5 h-5 text-purple-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              -
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Na webu
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Míra konverze</span>
              <TrendingUp className="w-5 h-5 text-orange-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              -
            </div>
            <p className="text-sm text-gray-500 mt-1">
              RSVP / návštěvy
            </p>
          </div>
        </div>

        {/* Coming Soon */}
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Pokročilá analytika
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Detailní statistiky, grafy návštěvnosti, analýza chování návštěvníků a další funkce budou brzy k dispozici.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto text-left">
            <div className="bg-gray-50 rounded-lg p-4">
              <Globe className="w-6 h-6 text-blue-500 mb-2" />
              <h4 className="font-semibold text-gray-900 mb-1">Geografické údaje</h4>
              <p className="text-sm text-gray-600">Odkud vaši hosté přistupují</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <BarChart3 className="w-6 h-6 text-green-500 mb-2" />
              <h4 className="font-semibold text-gray-900 mb-1">Grafy návštěvnosti</h4>
              <p className="text-sm text-gray-600">Sledování v čase</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <Users className="w-6 h-6 text-purple-500 mb-2" />
              <h4 className="font-semibold text-gray-900 mb-1">Chování uživatelů</h4>
              <p className="text-sm text-gray-600">Co hosté na webu dělají</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

