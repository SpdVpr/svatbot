'use client'

import { useState, useEffect } from 'react'
import { Globe, Plus, Eye, ExternalLink, ArrowRight } from 'lucide-react'
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
      <div className="wedding-card h-[353px] flex flex-col">
        <Link href="/wedding-website" className="block mb-4 flex-shrink-0">
          <h3 className="text-base sm:text-lg font-semibold flex items-center justify-start sm:justify-center space-x-2 hover:text-primary-600 transition-colors">
            <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 flex-shrink-0" />
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

  // Pokud web neexistuje nebo se načítá
  if (!website || loading) {
    return (
      <div className="wedding-card h-[353px] flex flex-col">
        <Link href="/wedding-website" className="block mb-4 flex-shrink-0">
          <h3 className="text-base sm:text-lg font-semibold flex items-center justify-start sm:justify-center space-x-2 hover:text-primary-600 transition-colors">
            <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 flex-shrink-0" />
            <span className="truncate">Svatební web</span>
          </h3>
        </Link>

        {loading ? (
          <div className="flex-1 flex flex-col justify-center items-center text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600 mb-3"></div>
            <p className="text-gray-600 text-sm">Načítání webu...</p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-between min-h-0">
            <div className="flex-1 flex flex-col justify-center items-center text-center">
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

            <div className="pt-3 border-t border-gray-200 flex-shrink-0">
              <div className="bg-primary-50 p-3 rounded-lg glass-morphism">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="hover-lift">
                    <div className="text-lg font-bold text-primary-600">8+</div>
                    <div className="text-xs text-primary-700">Šablony</div>
                  </div>
                  <div className="hover-lift">
                    <div className="text-lg font-bold text-primary-600">✓</div>
                    <div className="text-xs text-primary-700">RSVP</div>
                  </div>
                  <div className="hover-lift">
                    <div className="text-lg font-bold text-primary-600">✓</div>
                    <div className="text-xs text-primary-700">Galerie</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Pokud web existuje
  const websiteUrl = `https://${website.customUrl}.svatbot.cz`

  return (
    <div className="wedding-card h-[353px] flex flex-col">
      <Link href="/wedding-website" className="block mb-4 flex-shrink-0">
        <h3 className="text-base sm:text-lg font-semibold flex items-center justify-start sm:justify-center space-x-2 hover:text-primary-600 transition-colors">
          <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 flex-shrink-0" />
          <span className="truncate">Svatební web</span>
        </h3>
      </Link>

      <div className="flex-1 flex flex-col min-h-0">
        {/* Stats */}
        <div className="bg-primary-50 p-3 rounded-lg glass-morphism mb-3 h-[78px] flex items-center">
          <div className="grid grid-cols-3 gap-2 w-full">
            <div className="text-center hover-lift">
              <div className="text-lg font-bold text-primary-600">
                {website.analytics.views}
              </div>
              <div className="text-xs text-primary-700">Zobrazení</div>
            </div>
            <div className="text-center hover-lift">
              <div className="text-lg font-bold text-primary-600">
                {website.analytics.uniqueVisitors}
              </div>
              <div className="text-xs text-primary-700">Návštěvníci</div>
            </div>
            <div className="text-center hover-lift">
              <div className="text-lg font-bold text-primary-600">
                0
              </div>
              <div className="text-xs text-primary-700">RSVP</div>
            </div>
          </div>
        </div>

        {/* Actions - centered in remaining space */}
        <div className="flex-1 flex items-center justify-center px-3">
          <a
            href={websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm"
          >
            <Eye className="w-4 h-4" />
            <span>Náhled webu</span>
          </a>
        </div>

        <div className="pt-3 border-t border-gray-200 flex-shrink-0">
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
    </div>
  )
}

