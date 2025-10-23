'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useWeddingWebsite } from '@/hooks/useWeddingWebsite'
import { useAuthStore } from '@/stores/authStore'
import { useWeddingStore } from '@/stores/weddingStore'
import { ExternalLink, Eye, Settings, BarChart3, MessageSquare, Plus, Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'

export default function WeddingWebsitePage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { currentWedding: wedding } = useWeddingStore()
  const { website, loading, deleteWebsite } = useWeddingWebsite()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

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
              <div className="bg-pink-50 rounded-lg p-6">
                <div className="text-3xl mb-3">🎨</div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Krásné šablony
                </h3>
                <p className="text-sm text-gray-600">
                  Vyberte si z připravených šablon a přizpůsobte si barvy a fonty
                </p>
              </div>

              <div className="bg-blue-50 rounded-lg p-6">
                <div className="text-3xl mb-3">📱</div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Online RSVP
                </h3>
                <p className="text-sm text-gray-600">
                  Hosté mohou potvrdit účast přímo na webu včetně výběru jídla
                </p>
              </div>

              <div className="bg-green-50 rounded-lg p-6">
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
              className="inline-flex items-center gap-2 bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition-colors"
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
  const previewUrl = `/wedding/${website.customUrl}`

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
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Svatební web
              </h1>
              <p className="text-gray-600">
                Spravujte svůj svatební web pro hosty
              </p>
            </div>

            <Link
              href="/wedding-website/builder"
              className="inline-flex items-center gap-2 bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Upravit
            </Link>
          </div>

          {/* Status badge */}
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
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
                className="inline-flex items-center gap-1 text-sm text-pink-600 hover:text-pink-700"
              >
                {website.customUrl}.svatbot.cz
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Zobrazení</span>
              <Eye className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {website.analytics.views}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Návštěvníci</span>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {website.analytics.uniqueVisitors}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">RSVP odpovědi</span>
              <MessageSquare className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              0
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
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <Edit className="w-8 h-8 text-pink-500 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">
              Upravit obsah
            </h3>
            <p className="text-sm text-gray-600">
              Změňte texty, fotky a nastavení webu
            </p>
          </Link>

          <Link
            href="/wedding-website/rsvp"
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <MessageSquare className="w-8 h-8 text-blue-500 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">
              Správa RSVP
            </h3>
            <p className="text-sm text-gray-600">
              Zobrazit a spravovat odpovědi hostů
            </p>
          </Link>

          <Link
            href="/wedding-website/analytics"
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <BarChart3 className="w-8 h-8 text-green-500 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">
              Statistiky
            </h3>
            <p className="text-sm text-gray-600">
              Sledujte návštěvnost a aktivitu
            </p>
          </Link>
        </div>

        {/* Website Preview */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">
              Náhled webu
            </h3>
          </div>
          <div className="border border-gray-200 rounded-lg overflow-hidden bg-gradient-to-br from-pink-50 to-purple-50 p-12">
            <div className="text-center">
              <div className="mb-6">
                <Eye className="w-16 h-16 text-pink-500 mx-auto mb-4" />
                <h4 className="text-xl font-semibold text-gray-900 mb-2">
                  Váš svatební web je připraven!
                </h4>
                <p className="text-gray-600 mb-2">
                  URL: <span className="font-mono text-pink-600">{previewUrl}</span>
                </p>
                <p className="text-sm text-gray-500">
                  Klikněte na tlačítko níže pro zobrazení webu v novém okně
                </p>
              </div>
              <Link
                href={previewUrl}
                target="_blank"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-8 py-4 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
              >
                <Eye className="w-5 h-5" />
                Zobrazit svatební web
              </Link>
            </div>
          </div>
        </div>

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

