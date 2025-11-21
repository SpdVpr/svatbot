'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useWeddingWebsite } from '@/hooks/useWeddingWebsite'
import { useAuthStore } from '@/stores/authStore'
import { useWeddingStore } from '@/stores/weddingStore'
import { ExternalLink, Eye, Settings, BarChart3, MessageSquare, Plus, Edit, Trash2, Globe, QrCode } from 'lucide-react'
import Link from 'next/link'
import ModuleHeader from '@/components/common/ModuleHeader'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/config/firebase'
import WeddingWebsiteQRCode from '@/components/wedding-website/WeddingWebsiteQRCode'

export default function WeddingWebsitePage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { currentWedding: wedding } = useWeddingStore()
  const { website, loading, deleteWebsite } = useWeddingWebsite()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [rsvpCount, setRsvpCount] = useState(0)
  const [statsLoading, setStatsLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  // Load RSVP count
  useEffect(() => {
    const loadRsvpCount = async () => {
      if (!website) {
        setStatsLoading(false)
        return
      }

      try {
        const rsvpsQuery = query(
          collection(db, 'rsvpResponses'),
          where('websiteId', '==', website.id)
        )
        const snapshot = await getDocs(rsvpsQuery)
        setRsvpCount(snapshot.size)
        console.log('📊 Loaded RSVP count for wedding website:', snapshot.size)
      } catch (error) {
        console.error('Error loading RSVP count:', error)
      } finally {
        setStatsLoading(false)
      }
    }

    loadRsvpCount()
  }, [website])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mb-4"></div>
          <p className="text-gray-600">Načítání...</p>
        </div>
      </div>
    )
  }

  // Pokud web neexistuje, zobraz vytvoření
  if (!website) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Svatební web pro hosty
            </h1>
            <p className="text-gray-600">
              Vytvořte krásný svatební web, kde hosté najdou všechny důležité informace
            </p>
          </div>

          {/* Empty state */}
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-6xl mb-6">💒</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Zatím nemáte svatební web
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Vytvořte profesionální svatební web pro vaše hosty. Vyberte si šablonu, 
              vyplňte obsah a publikujte na vlastní URL adrese.
            </p>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-left">
              <div className="bg-primary-50 rounded-lg p-6">
                <div className="text-3xl mb-3">🎨</div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Krásné šablony
                </h3>
                <p className="text-sm text-gray-600">
                  Vyberte si z připravených šablon a přizpůsobte si barvy a fonty
                </p>
              </div>

              <div className="bg-primary-50 rounded-lg p-6">
                <div className="text-3xl mb-3">📱</div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Online RSVP
                </h3>
                <p className="text-sm text-gray-600">
                  Hosté mohou potvrdit účast přímo na webu včetně výběru jídla
                </p>
              </div>

              <div className="bg-primary-50 rounded-lg p-6">
                <div className="text-3xl mb-3">📸</div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Fotogalerie
                </h3>
                <p className="text-sm text-gray-600">
                  Sdílejte fotky ze svatby a nechte hosty nahrát jejich fotky
                </p>
              </div>
            </div>

            <Link
              href="/wedding-website/builder"
              className="inline-flex items-center gap-2 bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Vytvořit svatební web
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Pokud web existuje, zobraz dashboard
  const websiteUrl = `https://${website.customUrl}.svatbot.cz`

  const handleDelete = async () => {
    try {
      await deleteWebsite()
      setShowDeleteConfirm(false)
    } catch (error) {
      console.error('Error deleting website:', error)
      alert('Chyba při mazání webu')
    }
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <ModuleHeader
        icon={Globe}
        title="Svatební web"
        subtitle={`${website.customUrl}.svatbot.cz • ${website.isPublished ? 'Publikováno' : 'Koncept'} • ${rsvpCount} RSVP`}
        iconGradient="from-pink-500 to-purple-500"
        actions={
          <Link
            href="/wedding-website/builder"
            className="btn-primary flex items-center space-x-2"
          >
            <Edit className="w-4 h-4" />
            <span>Upravit</span>
          </Link>
        }
      />

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Status badge and URL */}
        <div className="flex items-center gap-4 mb-8">
          <span
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${
              website.isPublished
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${
              website.isPublished ? 'bg-green-500' : 'bg-yellow-500'
            }`}></span>
            {website.isPublished ? 'Publikováno' : 'Koncept'}
          </span>

          {website.isPublished && (
            <a
              href={websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              {website.customUrl}.svatbot.cz
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Zobrazení</span>
              <Eye className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {website.analytics?.views || 0}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Návštěvníci</span>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {website.analytics?.uniqueVisitors || 0}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">RSVP odpovědi</span>
              <MessageSquare className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {statsLoading ? (
                <div className="animate-pulse bg-gray-200 h-8 w-12 rounded"></div>
              ) : (
                rsvpCount
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Šablona</span>
              <Settings className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-sm font-medium text-gray-900 capitalize">
              {website.template.replace('-', ' ')}
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/wedding-website/builder"
            className="group bg-white rounded-lg shadow-sm p-6 border-2 border-transparent hover:border-primary-500 hover:shadow-lg transition-all cursor-pointer"
          >
            <Edit className="w-8 h-8 text-primary-500 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
              Upravit obsah →
            </h3>
            <p className="text-sm text-gray-600">
              Změňte texty, fotky a nastavení webu
            </p>
          </Link>

          <Link
            href="/wedding-website/rsvp"
            className="group bg-white rounded-lg shadow-sm p-6 border-2 border-transparent hover:border-primary-500 hover:shadow-lg transition-all cursor-pointer"
          >
            <MessageSquare className="w-8 h-8 text-primary-500 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
              Správa RSVP →
            </h3>
            <p className="text-sm text-gray-600">
              Zobrazit a spravovat odpovědi hostů
            </p>
          </Link>

          <Link
            href="/wedding-website/analytics"
            className="group bg-white rounded-lg shadow-sm p-6 border-2 border-transparent hover:border-primary-500 hover:shadow-lg transition-all cursor-pointer"
          >
            <BarChart3 className="w-8 h-8 text-primary-500 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
              Statistiky →
            </h3>
            <p className="text-sm text-gray-600">
              Sledujte návštěvnost a aktivitu
            </p>
          </Link>
        </div>

        {/* Website Preview */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">
              Náhled webu
            </h3>
          </div>
          <div className="border border-gray-200 rounded-lg overflow-hidden bg-gradient-to-br from-primary-50 to-secondary-50 p-8">
            <div className="text-center">
              <div className="mb-6">
                <Eye className="w-12 h-12 text-primary-500 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Váš svatební web je připraven!
                </h4>
                <p className="text-gray-600 mb-2 text-sm">
                  URL: <span className="font-mono text-primary-600">{websiteUrl}</span>
                </p>
                <p className="text-xs text-gray-500">
                  Klikněte na tlačítko níže pro zobrazení webu
                </p>
              </div>
              <a
                href={websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
              >
                <Eye className="w-5 h-5" />
                Zobrazit svatební web
              </a>
            </div>
          </div>
        </div>

        {/* QR Code Section */}
        {website.isPublished && (
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">
                QR kód webu
              </h3>
            </div>
            <div className="border border-gray-200 rounded-lg overflow-hidden bg-gradient-to-br from-primary-50 to-secondary-50 p-8">
              <div className="text-center">
                <div className="mb-4">
                  <QrCode className="w-12 h-12 text-primary-500 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    Sdílejte web pomocí QR kódu
                  </h4>
                  <p className="text-xs text-gray-500 mb-6">
                    Hosté mohou naskenovat kód a okamžitě se dostat na váš svatební web
                  </p>
                </div>
                <WeddingWebsiteQRCode
                  url={websiteUrl}
                  size={200}
                  showDownload={true}
                />
              </div>
            </div>
          </div>
        )}

        {/* Danger zone */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-red-200">
          <h3 className="font-semibold text-gray-900 mb-2">
            Nebezpečná zóna
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Smazání webu je nevratné. Všechna data budou ztracena.
          </p>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Smazat web
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <p className="text-sm text-red-600 font-medium">
                Opravdu chcete smazat web?
              </p>
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                Ano, smazat
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors text-sm"
              >
                Zrušit
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

