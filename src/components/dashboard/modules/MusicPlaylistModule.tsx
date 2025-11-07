'use client'

import { Music, ArrowRight, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { useMusic } from '@/hooks/useMusic'

export default function MusicPlaylistModule() {
  const { vendors, totalSongs, loading } = useMusic()

  return (
    <div className="wedding-card">
      <Link href="/music" className="block mb-4">
        <h3 className="text-base sm:text-lg font-semibold flex items-center justify-start sm:justify-center space-x-2 hover:text-primary-600 transition-colors">
          <Music className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 flex-shrink-0" />
          <span className="truncate">Svatební hudba</span>
        </h3>
      </Link>

      <div className="space-y-3 sm:space-y-4">
        {/* Total Songs */}
        <div className="bg-primary-50 p-3 sm:p-4 rounded-lg text-center">
          <div className="text-xl sm:text-2xl font-bold text-primary-600 mb-1">{totalSongs}</div>
          <div className="text-xs sm:text-sm text-primary-700">Celkem písní</div>
        </div>

        {/* Vendors */}
        {vendors.length > 0 ? (
          <div className="space-y-2">
            {vendors.slice(0, 2).map((vendor) => (
              <div key={vendor.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{vendor.name}</p>
                  {vendor.type && <p className="text-xs text-primary-600">{vendor.type}</p>}
                </div>
                <CheckCircle2 className="w-4 h-4 text-primary-600 flex-shrink-0 ml-2" />
              </div>
            ))}
            {vendors.length > 2 && (
              <p className="text-xs text-gray-600 text-center">
                +{vendors.length - 2} další dodavatel{vendors.length - 2 > 1 ? 'é' : ''}
              </p>
            )}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border-2 border-dashed border-gray-300">
            <p className="text-xs sm:text-sm text-gray-600 text-center">
              Zatím nemáte žádného dodavatele hudby
            </p>
          </div>
        )}
      </div>

      <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
        <Link
          href="/music"
          className="btn-primary w-full flex items-center justify-center space-x-2 text-sm sm:text-base"
        >
          <Music className="w-4 h-4" />
          <span>Spravovat playlist</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}

