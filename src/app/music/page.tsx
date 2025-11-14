'use client'

import { useState } from 'react'
import { Music, Save, User, Phone, Mail, Sparkles, Edit2, Plus, Loader2, Eye, EyeOff } from 'lucide-react'
import { useRouter } from 'next/navigation'
import SpotifySearch from '@/components/music/SpotifySearch'
import SongCard from '@/components/music/SongCard'
import { MusicPlayerProvider, useMusicPlayer } from '@/components/music/MusicPlayer'
import { SpotifyTrack, spotifyClient } from '@/lib/spotify'
import { useMusic, Song } from '@/hooks/useMusic'
import ModuleHeader from '@/components/common/ModuleHeader'
import SharePlaylistButton from '@/components/music/SharePlaylistButton'

function MusicPageContent() {
  const router = useRouter()
  const { currentSong, isPlaying, toggle } = useMusicPlayer()
  const {
    vendors,
    categories,
    loading,
    saving,
    addVendor,
    updateVendor,
    removeVendor,
    addSong,
    removeSong,
    toggleCategoryVisibility,
    totalSongs,
    requiredCategories,
    completedRequired
  } = useMusic()

  const [editingVendorId, setEditingVendorId] = useState<string | null>(null)
  const [showAddVendor, setShowAddVendor] = useState(false)
  const [showAddSong, setShowAddSong] = useState<string | null>(null)
  const [showHidden, setShowHidden] = useState(false)

  const handleAddSpotifyTrack = (categoryId: string, track: SpotifyTrack) => {
    console.log('🎵 Adding Spotify track:', {
      name: track.name,
      preview_url: track.preview_url,
      hasPreview: !!track.preview_url
    })

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

    console.log('💾 Saving song:', newSong)

    addSong(categoryId, newSong)
    setShowAddSong(null)
  }

  const handleAddVendor = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    addVendor({
      name: formData.get('name') as string,
      contact: formData.get('contact') as string,
      email: formData.get('email') as string,
      type: formData.get('type') as string
    })
    setShowAddVendor(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Načítání playlistu...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <ModuleHeader
        icon={Music}
        title="Svatební hudba"
        subtitle={`${totalSongs} písní v playlistu`}
        iconGradient="from-purple-500 to-pink-500"
      />

      {/* Main Content */}
      <div className="container-desktop py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Vendor & Progress */}
          <div className="space-y-6">
            {/* Vendors Card */}
            <div className="wedding-card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Dodavatelé hudby
                  {vendors.length > 0 && (
                    <span className="ml-2 text-sm font-normal text-gray-500">
                      ({vendors.length})
                    </span>
                  )}
                </h2>
                <button
                  onClick={() => setShowAddVendor(true)}
                  className="text-purple-600 hover:text-purple-700 flex items-center space-x-1"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-sm">Přidat</span>
                </button>
              </div>

              {vendors.length > 0 ? (
                <div className="space-y-3">
                  {vendors.map((vendor) => (
                    <div key={vendor.id} className="p-3 bg-gray-50 rounded-lg">
                      {editingVendorId === vendor.id ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={vendor.name}
                            onChange={(e) => updateVendor(vendor.id, { name: e.target.value })}
                            placeholder="Název"
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                          <input
                            type="text"
                            value={vendor.type || ''}
                            onChange={(e) => updateVendor(vendor.id, { type: e.target.value })}
                            placeholder="Typ (DJ, Smyčcový kvartet...)"
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                          <input
                            type="tel"
                            value={vendor.contact}
                            onChange={(e) => updateVendor(vendor.id, { contact: e.target.value })}
                            placeholder="Telefon"
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                          <input
                            type="email"
                            value={vendor.email}
                            onChange={(e) => updateVendor(vendor.id, { email: e.target.value })}
                            placeholder="Email"
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                          <button
                            onClick={() => setEditingVendorId(null)}
                            className="w-full btn-primary text-sm py-1"
                          >
                            Uložit
                          </button>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">{vendor.name}</div>
                              {vendor.type && (
                                <div className="text-xs text-purple-600 mt-0.5">{vendor.type}</div>
                              )}
                            </div>
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => setEditingVendorId(vendor.id)}
                                className="p-1 hover:bg-gray-200 rounded"
                              >
                                <Edit2 className="w-3 h-3 text-gray-600" />
                              </button>
                              <button
                                onClick={() => removeVendor(vendor.id)}
                                className="p-1 hover:bg-red-100 rounded"
                              >
                                <span className="text-red-600 text-xs">×</span>
                              </button>
                            </div>
                          </div>
                          {vendor.contact && (
                            <div className="flex items-center space-x-1 text-xs text-gray-600">
                              <Phone className="w-3 h-3" />
                              <span>{vendor.contact}</span>
                            </div>
                          )}
                          {vendor.email && (
                            <div className="flex items-center space-x-1 text-xs text-gray-600 mt-1">
                              <Mail className="w-3 h-3" />
                              <span>{vendor.email}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Music className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 mb-4">
                    Zatím nemáte žádného dodavatele hudby
                  </p>
                  <button
                    onClick={() => setShowAddVendor(true)}
                    className="btn-outline text-sm"
                  >
                    Přidat dodavatele
                  </button>
                </div>
              )}
            </div>

            {/* Spotify Tip */}
            <div className="wedding-card bg-gradient-to-br from-primary-50 to-accent-50 border-primary-200">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1 flex items-center space-x-2">
                    <span>Spotify integrace</span>
                    <span className="text-xs px-2 py-0.5 bg-primary-500 text-white rounded-full">NOVÉ</span>
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

            {/* Share Playlist Button */}
            <SharePlaylistButton totalSongs={totalSongs} />
          </div>

          {/* Right Column - Categories */}
          <div className="lg:col-span-2 space-y-4">
            {/* Show/Hide Hidden Categories Toggle */}
            {categories.some(cat => cat.hidden) && (
              <div className="wedding-card bg-gray-50">
                <button
                  onClick={() => setShowHidden(!showHidden)}
                  className="w-full flex items-center justify-between text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <span className="flex items-center space-x-2">
                    {showHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    <span>
                      {showHidden ? 'Skrýt' : 'Zobrazit'} skryté kategorie ({categories.filter(c => c.hidden).length})
                    </span>
                  </span>
                  <span className="text-xs text-gray-500">
                    {showHidden ? 'Klikněte pro skrytí' : 'Klikněte pro zobrazení'}
                  </span>
                </button>
              </div>
            )}

            {categories.filter(cat => showHidden || !cat.hidden).map(category => (
              <div key={category.id} className="wedding-card">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                  <div className="flex items-center space-x-3 flex-1">
                    <span className="text-2xl">{category.icon}</span>
                    <div className="flex-1">
                      <div className="space-y-1 sm:flex sm:items-center sm:justify-between">
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
                  <div className="flex items-center space-x-2 mt-2 sm:mt-0 sm:ml-4 w-full sm:w-auto justify-end">
                    {!category.required && (
                      <button
                        onClick={() => toggleCategoryVisibility(category.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title={category.hidden ? 'Zobrazit kategorii' : 'Skrýt kategorii'}
                      >
                        {category.hidden ? (
                          <Eye className="w-4 h-4 text-gray-400" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-gray-600" />
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => setShowAddSong(category.id)}
                      className="btn-outline text-sm flex items-center space-x-1"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Přidat</span>
                    </button>
                  </div>
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
                  <div className="mt-4 p-4 bg-gradient-to-br from-primary-50 to-accent-50 rounded-lg border-2 border-primary-200 space-y-3 relative z-[10000]">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                        <Sparkles className="w-5 h-5 text-primary-500" />
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

      {/* Add Vendor Modal */}
      {showAddVendor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Přidat dodavatele hudby</h3>
            <form onSubmit={handleAddVendor} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Název / Jméno *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="DJ Martin Hudba"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Typ
                </label>
                <input
                  type="text"
                  name="type"
                  placeholder="DJ, Smyčcový kvartet, Živá kapela..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefon
                </label>
                <input
                  type="tel"
                  name="contact"
                  placeholder="+420 777 888 999"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="martin@djhudba.cz"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddVendor(false)}
                  className="flex-1 btn-outline"
                >
                  Zrušit
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                >
                  Přidat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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

