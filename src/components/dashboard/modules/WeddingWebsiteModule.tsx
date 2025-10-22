'use client'

import { useState, useEffect } from 'react'
import { Globe, Plus, Edit, Eye, BarChart3, ExternalLink, Loader2, Settings, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useWeddingWebsite } from '@/hooks/useWeddingWebsite'

interface WeddingWebsiteModuleProps {
  onResize?: (width: number, height: number) => void
}

export default function WeddingWebsiteModule({ onResize }: WeddingWebsiteModuleProps) {
  const { website, loading, error } = useWeddingWebsite()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    // Notify parent about size changes
    if (onResize) {
      onResize(1, 1) // This module takes 1x1 grid space
    }
  }, [onResize])

  if (!mounted) {
    return (
      <div className="wedding-card">
        <Link href="/wedding-website" className="block mb-4">
          <h3 className="text-base sm:text-lg font-semibold flex items-center justify-start sm:justify-center space-x-2 hover:text-primary-600 transition-colors">
            <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0" />
            <span className="truncate">Svatební web</span>
          </h3>
        </Link>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  // Don't show loading state - let content fade in smoothly

  // Pokud web neexistuje nebo se načítá
  if (!website || loading) {
    return (
      <div className="wedding-card">
        <Link href="/wedding-website" className="block mb-4">
          <h3 className="text-base sm:text-lg font-semibold flex items-center justify-start sm:justify-center space-x-2 hover:text-primary-600 transition-colors">
            <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0" />
            <span className="truncate">Svatební web</span>
          </h3>
        </Link>

        {loading ? (
          <div className="text-center py-6">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mb-3"></div>
            <p className="text-gray-600 text-sm">Načítání webu...</p>
          </div>
        ) : (
          <>
            <div className="text-center py-6">
              <div className="text-4xl mb-3">💒</div>
              <p className="text-gray-600 text-sm mb-4">
                {error ? 'Chyba při načítání webu' : 'Vytvořte krásný web pro vaše hosty'}
              </p>

              <Link
                href="/wedding-website/builder"
                className="btn-primary inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {error ? 'Vytvořit nový web' : 'Vytvořit web'}
              </Link>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Šablony</div>
                  <div className="text-sm font-semibold text-gray-900">8+</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">RSVP</div>
                  <div className="text-sm font-semibold text-gray-900">✓</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Galerie</div>
                  <div className="text-sm font-semibold text-gray-900">✓</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    )
  }

  // Pokud web existuje (TypeScript ví, že website není null)
  const websiteUrl = `https://${website.subdomain}`
  const previewUrl = `/wedding/${website.customUrl}`

  return (
    <div className="wedding-card">
      <Link href="/wedding-website" className="block mb-4">
        <h3 className="text-base sm:text-lg font-semibold flex items-center justify-start sm:justify-center space-x-2 hover:text-primary-600 transition-colors">
          <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0" />
          <span className="truncate">Svatební web</span>
        </h3>
      </Link>

      <div className="mb-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {website.customUrl}.svatbot.cz
          </p>
          {/* Status badge */}
          <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              website.isPublished
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${
              website.isPublished ? 'bg-green-500' : 'bg-yellow-500'
            }`}></span>
            {website.isPublished ? 'Publikováno' : 'Koncept'}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center">
          <div className="text-lg font-bold text-gray-900">
            {website.analytics.views}
          </div>
          <div className="text-xs text-gray-500">Zobrazení</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-gray-900">
            {website.analytics.uniqueVisitors}
          </div>
          <div className="text-xs text-gray-500">Návštěvníci</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-gray-900">
            0
          </div>
          <div className="text-xs text-gray-500">RSVP</div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 mb-4">
        <Link
          href={previewUrl}
          target="_blank"
          className="flex-1 inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm"
        >
          <Eye className="w-4 h-4" />
          <span>Náhled</span>
        </Link>

        {website.isPublished && (
          <a
            href={websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Otevřít</span>
          </a>
        )}
      </div>

      {/* Quick link to full management */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <Link
          href="/wedding-website"
          className="btn-primary w-full flex items-center justify-center space-x-2"
        >
          <Globe className="w-4 h-4" />
          <span>Spravovat web</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
