'use client'

import { useState, useEffect } from 'react'
import { Globe, Plus, Edit, Eye, BarChart3, ExternalLink, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useWeddingWebsite } from '@/hooks/useWeddingWebsite'

interface WeddingWebsiteModuleProps {
  onResize?: (width: number, height: number) => void
}

export default function WeddingWebsiteModule({ onResize }: WeddingWebsiteModuleProps) {
  const { website, loading } = useWeddingWebsite()
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Globe className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Svatební web</h3>
            <p className="text-sm text-gray-600">Web pro hosty</p>
          </div>
        </div>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Globe className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Svatební web</h3>
            <p className="text-sm text-gray-600">Web pro hosty</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
        </div>
      </div>
    )
  }

  // Pokud web neexistuje
  if (!website) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Globe className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Svatební web</h3>
            <p className="text-sm text-gray-600">Web pro hosty</p>
          </div>
        </div>

        <div className="text-center py-6">
          <div className="text-4xl mb-3">💒</div>
          <p className="text-gray-600 text-sm mb-4">
            Vytvořte krásný web pro vaše hosty
          </p>
          
          <Link
            href="/wedding-website/builder"
            className="inline-flex items-center gap-2 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Vytvořit web
          </Link>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
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
      </div>
    )
  }

  // Pokud web existuje
  const websiteUrl = `https://${website.subdomain}`
  const previewUrl = `/wedding/${website.customUrl}`

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Globe className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Svatební web</h3>
            <p className="text-sm text-gray-600">
              {website.customUrl}.svatbot.cz
            </p>
          </div>
        </div>

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
      <div className="flex items-center gap-2">
        <Link
          href="/wedding-website/builder"
          className="flex-1 inline-flex items-center justify-center gap-2 bg-purple-500 text-white px-3 py-2 rounded-lg hover:bg-purple-600 transition-colors text-sm"
        >
          <Edit className="w-4 h-4" />
          Upravit
        </Link>

        <Link
          href={previewUrl}
          target="_blank"
          className="inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm"
        >
          <Eye className="w-4 h-4" />
        </Link>

        {website.isPublished && (
          <a
            href={websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>

      {/* Quick link to full management */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <Link
          href="/wedding-website"
          className="flex items-center justify-between text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <span>Pokročilá správa</span>
          <div className="flex items-center gap-1">
            <BarChart3 className="w-4 h-4" />
            <span>→</span>
          </div>
        </Link>
      </div>
    </div>
  )
}
