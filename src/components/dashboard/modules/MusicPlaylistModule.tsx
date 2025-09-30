'use client'

import { Music, ArrowRight, CheckCircle2, Circle } from 'lucide-react'
import Link from 'next/link'

export default function MusicPlaylistModule() {
  // Mock data - v produkci by se načítalo z Firebase
  const vendor = {
    name: '',
    contact: ''
  }

  const requiredCategories = [
    { id: 'groom-entrance', name: 'Nástup ženicha', completed: false, icon: '🤵' },
    { id: 'bride-entrance', name: 'Nástup nevěsty', completed: false, icon: '💍' },
    { id: 'first-dance', name: 'První tanec', completed: false, icon: '💃' },
    { id: 'party-songs', name: 'Párty písně', completed: false, icon: '🎵' }
  ]

  const completedCount = requiredCategories.filter(c => c.completed).length
  const totalCount = requiredCategories.length
  const progress = (completedCount / totalCount) * 100

  return (
    <div className="wedding-card h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Music className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Svatební hudba</h3>
            <p className="text-sm text-gray-600">Playlist a dodavatel</p>
          </div>
        </div>
      </div>

      {/* Vendor Info or CTA */}
      {vendor.name ? (
        <div className="bg-purple-50 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">{vendor.name}</p>
              <p className="text-xs text-gray-600">{vendor.contact}</p>
            </div>
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-4 mb-4 border-2 border-dashed border-gray-300">
          <p className="text-sm text-gray-600 text-center">
            Zatím nemáte vybraného dodavatele hudby
          </p>
        </div>
      )}

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Dokončeno</span>
          <span className="text-sm font-semibold text-gray-900">
            {completedCount}/{totalCount}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Quick Status */}
      <div className="space-y-2 mb-4 flex-1">
        {requiredCategories.map(category => (
          <div key={category.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
            <span className="text-lg">{category.icon}</span>
            {category.completed ? (
              <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
            ) : (
              <Circle className="w-4 h-4 text-gray-300 flex-shrink-0" />
            )}
            <span className={`text-sm flex-1 ${category.completed ? 'text-gray-900' : 'text-gray-600'}`}>
              {category.name}
            </span>
          </div>
        ))}
      </div>

      {/* CTA Button */}
      <Link
        href="/music"
        className="btn-primary w-full flex items-center justify-center space-x-2"
      >
        <span>Spravovat playlist</span>
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  )
}

