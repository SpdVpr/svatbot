'use client'

import { useState } from 'react'
import { Music, ArrowLeft, Save, User, Phone, Mail, Sparkles, Edit2, Plus, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import SpotifySearch from '@/components/music/SpotifySearch'
import SongCard from '@/components/music/SongCard'
import { MusicPlayerProvider, useMusicPlayer } from '@/components/music/MusicPlayer'
import { SpotifyTrack, spotifyClient } from '@/lib/spotify'
import { useMusic, Song } from '@/hooks/useMusic'

function MusicPageContent() {
  const router = useRouter()
  const { currentSong, isPlaying, toggle } = useMusicPlayer()
  const {
    vendor,
    categories,
    loading,
    saving,
    updateVendor,
    addSong,
    removeSong,
    totalSongs,
    requiredCategories,
    completedRequired
  } = useMusic()

  const [editingVendor, setEditingVendor] = useState(false)
  const [showAddSong, setShowAddSong] = useState<string | null>(null)

  const handleAddSpotifyTrack = (categoryId: string, track: SpotifyTrack) => {
    const newSong: Song = {
      id: Date.now().toString(),
      title: track.name,
      artist: track.artists.map(a => a.name).join(', '),
      spotifyUrl: track.external_urls.spotify,
      spotifyTrackId: track.id,
      albumCover: track.album.images[0]?.url,
      previewUrl: track.preview_url || undefined,
      duration: track.duration_ms
    }

    addSong(categoryId, newSong)
    setShowAddSong(null)
  }

  const handleSaveVendor = () => {
    setEditingVendor(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Načítání playlistu...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container-desktop py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Music className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Svatební hudba</h1>
                  <p className="text-sm text-gray-600">
                    {totalSongs} písní v playlistu
                    {saving && <span className="ml-2 text-purple-600">• Ukládání...</span>}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {saving && <Loader2 className="w-4 h-4 text-purple-500 animate-spin" />}
              <span className="text-sm text-gray-600">Auto-save zapnuto</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-desktop py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Vendor & Progress */}
          <div className="space-y-6">
            {/* Vendor Card */}
            <div className="wedding-card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Dodavatel hudby</h2>
                {!editingVendor && (
                  <button
                    onClick={() => setEditingVendor(true)}
                    className="text-purple-600 hover:text-purple-700"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {editingVendor ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <User className="w-4 h-4 inline mr-1" />
                      Jméno / Název
                    </label>
                    <input
                      type="text"
                      value={vendor.name}
                      onChange={(e) => updateVendor({ ...vendor, name: e.target.value })}
                      placeholder="DJ Martin Hudba"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Phone className="w-4 h-4 inline mr-1" />
                      Telefon
                    </label>
                    <input
                      type="tel"
                      value={vendor.contact}
                      onChange={(e) => updateVendor({ ...vendor, contact: e.target.value })}
                      placeholder="+420 777 888 999"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Mail className="w-4 h-4 inline mr-1" />
                      Email
                    </label>
                    <input
                      type="email"
                      value={vendor.email}
                      onChange={(e) => updateVendor({ ...vendor, email: e.target.value })}
                      placeholder="martin@djhudba.cz"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={handleSaveVendor}
                    className="w-full btn-primary"
                  >
                    Uložit
                  </button>
                </div>
              ) : vendor.name ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-gray-700">
                    <User className="w-4 h-4 text-gray-400" />
                    <span>{vendor.name}</span>
                  </div>
                  {vendor.contact && (
                    <div className="flex items-center space-x-2 text-gray-700">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{vendor.contact}</span>
                    </div>
                  )}
                  {vendor.email && (
                    <div className="flex items-center space-x-2 text-gray-700">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>{vendor.email}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Music className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 mb-4">
                    Zatím nemáte vybraného dodavatele hudby
                  </p>
                  <button
                    onClick={() => setEditingVendor(true)}
                    className="btn-outline text-sm"
                  >
                    Přidat dodavatele
                  </button>
                </div>
              )}
            </div>

            {/* Progress Card */}
            <div className="wedding-card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Průběh</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Povinné kategorie</span>
                    <span className="text-sm font-medium text-gray-900">
                      {completedRequired}/{requiredCategories.length}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2.5 rounded-full transition-all"
                      style={{ width: `${(completedRequired / requiredCategories.length) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Celkem písní</span>
                    <span className="font-semibold text-gray-900">{totalSongs}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Spotify Tip */}
            <div className="wedding-card bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1 flex items-center space-x-2">
                    <span>Spotify integrace</span>
                    <span className="text-xs px-2 py-0.5 bg-green-500 text-white rounded-full">NOVÉ</span>
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Vyhledávejte písně přímo na Spotify a přehrávejte ukázky!
                  </p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>🔍 Vyhledávání v Spotify katalogu</li>
                    <li>▶️ Přehrávání 30s ukázek</li>
                    <li>🎵 Automatické doplnění údajů</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Categories */}
          <div className="lg:col-span-2 space-y-4">
            {categories.map(category => (
              <div key={category.id} className="wedding-card">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3 flex-1">
                    <span className="text-2xl">{category.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                          <span>{category.name}</span>
                          {category.required && (
                            <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full">
                              Povinné
                            </span>
                          )}
                        </h3>
                        {/* Total Duration */}
                        {category.songs.length > 0 && (
                          <div className="flex items-center space-x-2 text-sm">
                            <span className="text-gray-600">
                              {category.songs.length} {category.songs.length === 1 ? 'píseň' : category.songs.length < 5 ? 'písně' : 'písní'}
                            </span>
                            <span className="text-gray-400">•</span>
                            <span className="font-medium text-purple-600">
                              {spotifyClient.formatDuration(
                                category.songs.reduce((sum, song) => sum + (song.duration || 0), 0)
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{category.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAddSong(category.id)}
                    className="btn-outline text-sm flex items-center space-x-1 ml-4"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Přidat</span>
                  </button>
                </div>

                {/* Songs */}
                {category.songs.length > 0 ? (
                  <div className="space-y-2">
                    {category.songs.map(song => {
                      const handlePlayToggle = song.previewUrl ? () => {
                        toggle({
                          id: song.id,
                          title: song.title,
                          artist: song.artist,
                          previewUrl: song.previewUrl,
                          albumCover: song.albumCover
                        })
                      } : undefined

                      return (
                        <SongCard
                          key={song.id}
                          song={song}
                          onRemove={() => removeSong(category.id, song.id)}
                          isPlaying={currentSong?.id === song.id && isPlaying}
                          onPlayToggle={handlePlayToggle}
                        />
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <Music className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Zatím žádné písně</p>
                  </div>
                )}

                {/* Spotify Search */}
                {showAddSong === category.id && (
                  <div className="mt-4 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200 space-y-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                        <Sparkles className="w-5 h-5 text-purple-500" />
                        <span>Vyhledat na Spotify</span>
                      </h4>
                      <button
                        onClick={() => setShowAddSong(null)}
                        className="text-sm text-gray-600 hover:text-gray-900"
                      >
                        Zrušit
                      </button>
                    </div>
                    <SpotifySearch
                      onSelectTrack={(track) => handleAddSpotifyTrack(category.id, track)}
                      placeholder={`Vyhledat píseň pro: ${category.name}`}
                    />
                    <p className="text-xs text-gray-600 flex items-center space-x-1">
                      <Sparkles className="w-3 h-3" />
                      <span>Vyhledejte píseň, přehrajte ukázku a přidejte do playlistu jedním kliknutím</span>
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function MusicPage() {
  return (
    <MusicPlayerProvider>
      <MusicPageContent />
    </MusicPlayerProvider>
  )
}

